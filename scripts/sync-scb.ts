/**
 * Standalone SCB sync script.
 *
 * Usage:
 *   node ./scripts/sync-scb.js            # sync all active sources
 *   node ./scripts/sync-scb.js 123        # sync single sourceId=123
 *
 * Requires Node 18+ (global fetch) or run with node --experimental-fetch on older Node.
 * Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment
 * (or in .env.local for local runs).
 *
 * This performs the same fetch/upsert logic as [src/app/api/milestones/route.ts](src/app/api/milestones/route.ts)
 * but runs as a CLI script (useful for local runs or CI).
 */
import path from "path";
import dotenv from "dotenv";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import { parsePxToSeries } from "../src/utils/scb/px.ts";

// ESM-safe __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment (.env.local).");
  process.exit(1);
}

const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_KEY);

async function parsePxPayloadCount(text: string) {
  // avoid /s flag; use [\s\S] to match newlines
  const m = /DATA\s*=\s*([\s\S]*?);/i.exec(text);
  if (!m) return { count: null, pxText: text };
  const dataBlock = m[1].replace(/[\r\n]+/g, " ").trim();
  // allow comma or dot decimals; count tokens that look like numbers
  const tokens = dataBlock
    .split(/\s+/)
    .filter((t) => /^-?\d+(?:[.,]\d+)?$/.test(t));
  return { count: tokens.length, pxText: text };
}

async function fetchWithCondition(url: string, etag?: string, lastModified?: string) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (etag) headers["If-None-Match"] = etag;
  if (lastModified) headers["If-Modified-Since"] = lastModified;
  const res = await fetch(url, { headers });

  if (res.status === 304) return { status: 304 };

  const ct = (res.headers.get("content-type") ?? "").toLowerCase();

  // If JSON, parse as json
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

  // Fallback: read PX text and parse DATA block
  const text = await res.text().catch(() => "");
  const { count, pxText } = await parsePxPayloadCount(text);
  return {
    status: res.status,
    json: null,
    pxText,
    payloadCount: count,
    etag: res.headers.get("etag") ?? undefined,
    lastModified: res.headers.get("last-modified") ?? undefined,
  };
}

async function main() {
  const arg = process.argv[2];
  const sourceId = arg ? Number(arg) : null;

  try {
    const sourcesQuery = sourceId
      ? supabase.from("scb_sources").select("*").eq("id", sourceId).limit(1)
      : supabase.from("scb_sources").select("*").eq("active", true);

    const { data: sources, error: sErr } = await sourcesQuery;
    if (sErr) throw sErr;
    if (!sources || sources.length === 0) {
      console.log("No sources found.");
      return;
    }

    const results: any[] = [];
    for (const src of sources) {
      console.log(`Syncing source.id=${src.id} url=${src.url}`);
      const { data: cacheRow } = await supabase.from("scb_cache").select("*").eq("source_id", src.id).maybeSingle();

      const res = await fetchWithCondition(src.url, cacheRow?.etag ?? undefined, cacheRow?.last_modified ?? undefined);
      if (res.status === 304) {
        await supabase
          .from("scb_cache")
          .upsert({ source_id: src.id, last_fetched: new Date().toISOString(), status: "not-modified" }, { onConflict: "source_id" });
        results.push({ sourceId: src.id, status: "not-modified" });
        console.log("  not-modified");
        continue;
      }

      if (res.status >= 200 && res.status < 300) {
        // Build transformed summary. Keep `raw` JSON when available; for PX, store text inside transformed.pxText
        const transformed: any = { fetchedAt: new Date().toISOString(), payloadSummary: null, pxText: null, series: null, categories: null };

        let rawToStore: any = null;
        if (res.json != null) {
          transformed.payloadSummary = Array.isArray(res.json) ? res.json.length : null;
          rawToStore = res.json;
        } else if (res.pxText != null) {
          transformed.payloadSummary = res.payloadCount ?? null;
          transformed.pxText = res.pxText;
          // parse numeric series for charts
          try {
            const parsed = parsePxToSeries(res.pxText);
            transformed.series = parsed.values;
            transformed.categories = parsed.categories;

          } catch (e) {
            transformed.series = [];
            transformed.categories = [];
          }
          rawToStore = null; // keep raw JSON column null for PX responses
        }

        const { error: upErr } = await supabase.from("scb_cache").upsert({
          source_id: src.id,
          last_fetched: new Date().toISOString(),
          etag: res.etag,
          last_modified: res.lastModified,
          raw: rawToStore,
          transformed,
          status: "ok",
          updated_at: new Date().toISOString(),
        }, { onConflict: "source_id" });

        if (upErr) {
          results.push({ sourceId: src.id, status: `error:upsert:${upErr.message}` });
          console.error("  upsert error:", upErr.message);
        } else {
          results.push({ sourceId: src.id, status: "updated", payloadSummary: transformed.payloadSummary });
          console.log(`  updated (rowsize summary: ${transformed.payloadSummary})`);
        }

        // If this source is linked to a milestone, add the transformed payloadSummary
        // to milestones.progress (clamped to 100). This increments progress by the
        // payloadSummary value when available.
        if (!upErr && typeof src.milestone_id === "number") {
          try {
            // read current progress and goal JSON from milestone
            const { data: milestoneRow, error: mErr } = await supabase
              .from("milestones")
              .select("progress, goal")
              .eq("id", src.milestone_id)
              .maybeSingle();

            if (mErr) {
              console.error("  failed to read milestone:", mErr.message);
            } else if (milestoneRow) {
              const currentProgress = Number(milestoneRow.progress ?? 0);
              let newProgress = currentProgress;

              // Prefer computing percent progress from numeric series + milestone.goal
              const t = transformed ?? {};
              if (Array.isArray(t.series) && Array.isArray(t.categories) && t.series.length > 0) {
                // find latest numeric value in series
                const numericSeries = t.series.map((v: any) => (v == null ? NaN : Number(v)));
                let idx = -1;
                for (let i = numericSeries.length - 1; i >= 0; i--) {
                  if (isFinite(numericSeries[i])) {
                    idx = i;
                    break;
                  }
                }

                if (idx !== -1) {
                  const currentValue = Number(numericSeries[idx]);

                  // try to read goal spec from milestone.goal
                  const goal = milestoneRow.goal ?? null;
                  let calculatedPct: number | null = null;

                  if (goal && typeof goal === "object") {
                    const base = Array.isArray(goal.series) && isFinite(Number(goal.series[0])) ? Number(goal.series[0]) : null;
                    const change =
                      Array.isArray(goal.change) && isFinite(Number(goal.change[0]))
                        ? Number(goal.change[0])
                        : typeof goal.change === "number" && isFinite(goal.change)
                        ? Number(goal.change)
                        : null;

                    if (base != null && change != null && change > 0) {
                      // target reduction = base * change
                      const targetReduction = base * change;
                      const achievedReduction = base - currentValue;
                      calculatedPct = Math.round((achievedReduction / targetReduction) * 100);
                    } else if (base != null && base > 0) {
                      // fallback: progress = percent reduction vs base
                      calculatedPct = Math.round(((base - currentValue) / base) * 100);
                    }
                  } else {
                    // no goal present: use percent change vs first series value (if available)
                    const base = numericSeries[0];
                    if (isFinite(base) && base > 0) {
                      calculatedPct = Math.round(((base - currentValue) / base) * 100);
                    }
                  }

                  if (calculatedPct != null && isFinite(calculatedPct)) {
                    newProgress = Math.max(0, Math.min(100, calculatedPct));
                  }
                }
              } else if (typeof t.payloadSummary === "number") {
                // legacy behavior: increment by payloadSummary when numeric series not available
                newProgress = Math.max(0, Math.min(100, currentProgress + Number(t.payloadSummary)));
              }

              // only update if changed
              if (newProgress !== currentProgress) {
                const { error: updErr } = await supabase
                  .from("milestones")
                  .update({ progress: newProgress })
                  .eq("id", src.milestone_id);

                if (updErr) {
                  console.error("  milestone update error:", updErr.message);
                } else {
                  console.log(`  milestone.id=${src.milestone_id} progress ${currentProgress} -> ${newProgress}`);
                }
              } else {
                console.log(`  milestone.id=${src.milestone_id} progress unchanged (${currentProgress}%)`);
              }
            }
          } catch (e) {
            console.error("  milestone update failed:", e);
          }
        }
      } else {
        await supabase.from("scb_cache").upsert({ source_id: src.id, status: `error:${res.status}`, updated_at: new Date().toISOString() }, { onConflict: "source_id" });
        results.push({ sourceId: src.id, status: `error:${res.status}` });
        console.warn(`  fetch error status=${res.status}`);
      }
    }

    console.log("Sync results:", results);
  } catch (err) {
    console.error("Sync failed:", err);
    process.exitCode = 2;
  }
}

main();