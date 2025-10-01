"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import { Card, Flex, Text, Heading } from "@radix-ui/themes";
import styles from "../page.module.css";
import type { Milestone } from "@/app/page";
import ProgressWithExpected from "./ProgressWithExpected";
import React, { useEffect, useState } from "react";

export default function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const [expectedPercent, setExpectedPercent] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/milestones");
        if (!res.ok) return;
        const data = await res.json();
        const apiItem = Array.isArray(data) ? data.find((x: any) => Number(x.id) === Number(milestone.id)) : null;
        const scb = apiItem?.scb ?? [];

        // Prefer server-provided expectedPercent when available
        const serverPct = typeof apiItem?.expectedPercent === "number" ? apiItem.expectedPercent : null;
        if (serverPct != null) {
          if (mounted) setExpectedPercent(serverPct);
          return;
        }

        // pick first transformed that has a numeric series
        const transformed = Array.isArray(scb)
          ? scb.map((s: any) => s.transformed).find((t: any) => t && Array.isArray(t.series) && t.series.length > 0)
          : null;

        // parse goal spec if present on milestone (or on apiItem.goal)
        const goal = apiItem?.goal ?? (milestone as any).goal ?? null;
        
        // If serverPct was null we continue and compute locally as fallback
        const computeExpected = (g: any, t: any): number | null => {
          if (g && typeof g === "object") {
            const series = Array.isArray(g.series) ? g.series : null;
            const cats = Array.isArray(g.categories) ? g.categories : Array.isArray(g.cartegories) ? g.cartegories : null;
            const change = Array.isArray(g.change) ? g.change[0] : typeof g.change === "number" ? g.change : null;
            if (series && cats && cats.length >= 2 && typeof change === "number") {
              const startYear = Number(cats[0]);
              const endYear = Number(cats[1]);
              const startValue = Number(series[0]);
              const endValue = startValue * (1 - change);
              if (!isFinite(startYear) || !isFinite(endYear) || !isFinite(startValue) || !isFinite(endValue)) return null;
              const currentYear = Math.min(new Date().getFullYear(), endYear);
              const span = endYear - startYear || 1;
              let tnorm = (currentYear - startYear) / span;
              if (tnorm < 0) tnorm = 0;
              if (tnorm > 1) tnorm = 1;
              const expectedValue = startValue + tnorm * (endValue - startValue);
              const totalReduction = startValue - endValue;
              if (isFinite(totalReduction) && totalReduction > 0) {
                const achieved = startValue - expectedValue;
                return Math.max(0, Math.min(100, Math.round((achieved / totalReduction) * 100)));
              }
            }
          }

          // fallback: if we have transformed series, compute percent reduction vs first series value
          if (t && Array.isArray(t.series) && t.series.length > 0) {
            const numeric = t.series.map((v: any) => (v == null ? NaN : Number(v)));
            const base = numeric[0];
            // find latest numeric value
            let idx = -1;
            for (let i = numeric.length - 1; i >= 0; i--) {
              if (isFinite(numeric[i])) {
                idx = i;
                break;
              }
            }
            if (isFinite(base) && base > 0 && idx !== -1) {
              const currentValue = numeric[idx];
              return Math.max(0, Math.min(100, Math.round(((base - currentValue) / base) * 100)));
            }
          }

          return null;
        };

        const pct = computeExpected(goal, transformed);
        if (mounted) setExpectedPercent(pct);
      } catch {
        // ignore
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [milestone.id, milestone]);

  return (
    <a href={`/pages/milestone/${milestone.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <HoverCard.Root>
        <HoverCard.Trigger asChild>
          <Card
            variant="surface"
            style={{
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            className="hover:shadow-lg"
          >
            <Flex direction="column" gap="3">
              <Heading size="3" trim="start">
                {milestone.title}
              </Heading>

              <Flex direction="column" gap="2">
                <Flex justify="between" align="center">
                  <Text size="2" color="gray">
                    Progress
                  </Text>
                  <Text size="2" weight="medium">
                    {milestone.progress}%
                  </Text>
                </Flex>

                {/* Re-usable progress component — expectedPercent loaded from /api/milestones */}
                <ProgressWithExpected progress={milestone.progress} expectedPercent={expectedPercent} />
              </Flex>
            </Flex>
          </Card>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content className={styles.Content} sideOffset={5}>
            <Flex direction="column" gap="2">
              <Heading className={styles.Title}>{milestone.title}</Heading>
              <Text size="2">{milestone.description}</Text>
            </Flex>
            <HoverCard.Arrow className={styles.Arrow} />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    </a>
  );
}