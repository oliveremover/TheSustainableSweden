import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { parsePxToSeries } from "@/utils/scb/px";

const SECRET = process.env.SCB_SYNC_SECRET; // set in .env / Vercel

async function fetchWithCondition(url: string, etag?: string, lastModified?: string) {
  const headers: Record<string,string> = { Accept: "application/json" };
  if (etag) headers["If-None-Match"] = etag;
  if (lastModified) headers["If-Modified-Since"] = lastModified;
  const res = await fetch(url, { headers });
  if (res.status === 304) return { status: 304 };
  const ct = (res.headers.get("content-type") ?? "").toLowerCase();
  if (ct.includes("application/json") || ct.includes("text/json")) {
    const json = await res.json().catch(() => null);
    return {
      status: res.status,
      json,
      pxText: null,
      payloadCount: Array.isArray(json) ? json.length : null,
      etag: res.headers.get("etag") ?? undefined,
      lastModified: res.headers.get("last-modified") ?? undefined,
    };
  }
  const text = await res.text().catch(() => "");
  // parse PX DATA block count and return PX text
  const dataMatch = /DATA\s*=\s*([\s\S]*?);/i.exec(text);
  const dataBlock = dataMatch ? dataMatch[1].replace(/[\r\n]+/g, " ").trim() : "";
  const tokens = dataBlock.split(/\s+/).filter((t) => /^-?\d+(?:[.,]\d+)?$/.test(t));
  return {
    status: res.status,
    json: null,
    pxText: text,
    payloadCount: tokens.length,
    etag: res.headers.get("etag") ?? undefined,
    lastModified: res.headers.get("last-modified") ?? undefined,
  };
}

/*
  GET handler: return milestones merged with cached SCB data.

  - Reads milestones from `milestones`
  - Reads `scb_cache` joined with `scb_sources` to find which cache row belongs to which milestone
  - Attaches `scb` array to each milestone (may be empty)
*/
export async function GET() {
  const supabase = await createClient();

  // 1) fetch milestones
  const { data: milestones, error: mErr } = await supabase
    .from("milestones")
    .select("id, created_at, title, description, category, progress")
    .order("id", { ascending: true });
    
  if (mErr) {
    return NextResponse.json({ error: mErr.message }, { status: 500 });
  }

  // 2) fetch caches and related source info (scb_sources linking to milestone_id)
  //    scb_cache.source_id -> scb_sources.id -> scb_sources.milestone_id
  const { data: caches, error: cErr } = await supabase
    .from("scb_cache")
    .select("source_id, last_fetched, etag, last_modified, transformed, raw, status, scb_sources(id, milestone_id, url)");

  // build a map milestoneId -> array of cache rows (if scb tables exist)
  const cacheByMilestone = new Map<number, any[]>();
  if (!cErr && Array.isArray(caches)) {
    for (const row of caches) {
      const milestoneId = row?.scb_sources?.[0]?.milestone_id;
      if (typeof milestoneId === "number") {
        const entry = {
          sourceId: row.source_id,
          url: row.scb_sources?.[0]?.url ?? null,
          lastFetched: row.last_fetched ?? null,
          etag: row.etag ?? null,
          lastModified: row.last_modified ?? null,
          transformed: row.transformed ?? null,
          raw: row.raw ?? null,
          status: row.status ?? null,
        };
        const arr = cacheByMilestone.get(milestoneId) ?? [];
        arr.push(entry);
        cacheByMilestone.set(milestoneId, arr);
      }
    }
  }

  // 3) merge and return
  const merged = (milestones ?? []).map((m: any) => ({
    ...m,
    scb: (cacheByMilestone.get(m.id) ?? []).map((c: any) => {
      // expose parsed series/categories if present in transformed
      const transformed = c.transformed ?? null;
      return {
        sourceId: c.sourceId,
        url: c.url,
        lastFetched: c.lastFetched,
        etag: c.etag,
        lastModified: c.lastModified,
        status: c.status,
        transformed: transformed,
        series: transformed?.series ?? null,
        categories: transformed?.categories ?? null,
        seriesPoints: transformed?.seriesPoints ?? null,
        raw: c.raw ?? null,
      };
    }),
  }));

  return NextResponse.json(merged, {
    headers: {
      // let Vercel / CDN cache briefly and allow stale-while-revalidate for performance
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!SECRET || req.headers.get("x-sync-secret") !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // single source or all
  const sourceId = body.sourceId ?? null;
  const sourcesQuery = sourceId
    ? supabase.from("scb_sources").select("*").eq("id", sourceId).limit(1)
    : supabase.from("scb_sources").select("*").eq("active", true);

  const { data: sources, error: sErr } = await sourcesQuery;
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  const results: any[] = [];
  for (const src of sources ?? []) {
    const { data: cacheRow } = await supabase.from("scb_cache").select("*").eq("source_id", src.id).maybeSingle();
    const res = await fetchWithCondition(src.url, cacheRow?.etag ?? undefined, cacheRow?.last_modified ?? undefined);
    if (res.status === 304) {
      // update last_fetched
      await supabase.from("scb_cache").upsert({ source_id: src.id, last_fetched: new Date().toISOString(), status: "not-modified" }, { onConflict: "source_id" });
      results.push({ sourceId: src.id, status: "not-modified" });
      continue;
    }
    if (res.status >= 200 && res.status < 300) {
      // transform minimal fields server-side and store parsed series for PX
      const transformed: any = { fetchedAt: new Date().toISOString(), payloadSummary: null, series: null, categories: null, pxText: null };
      let rawToStore: any = null;
      if (res.json != null) {
        transformed.payloadSummary = Array.isArray(res.json) ? (res.json as any[]).length : null;
        rawToStore = res.json;
      } else if (res.pxText != null) {
        transformed.payloadSummary = res.payloadCount ?? null;
        transformed.pxText = res.pxText;
        try {
          const parsed = parsePxToSeries(res.pxText);
          transformed.series = parsed.values;
          transformed.categories = parsed.categories;
        } catch {
          transformed.series = [];
          transformed.categories = [];
        }
        rawToStore = null;
      }

      await supabase.from("scb_cache").upsert({
        source_id: src.id,
        last_fetched: new Date().toISOString(),
        etag: res.etag,
        last_modified: res.lastModified,
        raw: rawToStore,
        transformed,
        status: "ok",
        updated_at: new Date().toISOString(),
      }, { onConflict: "source_id" });
      results.push({ sourceId: src.id, status: "updated" });
    } else {
      await supabase.from("scb_cache").upsert({ source_id: src.id, status: `error:${res.status}`, updated_at: new Date().toISOString() }, { onConflict: "source_id" });
      results.push({ sourceId: src.id, status: `error:${res.status}` });
    }
  }

  return NextResponse.json({ results });
}