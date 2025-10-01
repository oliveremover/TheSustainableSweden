"use client";

import React from "react";
import { Text } from "@radix-ui/themes";

type Props = {
  progress: number; // 0-100
  expectedPercent?: number | null; // optional 0-100
  expectedLabel?: string | null; // optional label under bar
  className?: string;
};

export default function ProgressWithExpected({ progress, expectedPercent = null, expectedLabel = null, className }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  const exp = typeof expectedPercent === "number" ? Math.max(0, Math.min(100, Math.round(expectedPercent))) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }} className={className}>
      <div style={{ position: "relative", width: "100%", height: 12, borderRadius: 8, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
        {exp != null && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${exp}%`,
              background: "rgba(16,185,129,0.18)",
              transition: "width 400ms ease",
            }}
          />
        )}
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pct}%`,
            background: pct >= 70 ? "rgba(4,120,87,1)" : pct >= 40 ? "rgba(37,99,235,1)" : "rgba(220,38,38,1)",
            boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.15)",
            transition: "width 400ms ease",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text size="4" weight="bold">{`${pct}%`}</Text>
        {exp != null && <Text size="2" color="gray">{expectedLabel ?? `Expected ~${exp}%`}</Text>}
      </div>
    </div>
  );
}