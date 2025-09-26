"use client";

import React, { useMemo, useState } from "react";
import { Grid } from "@radix-ui/themes";
import * as Select from "@radix-ui/react-select";
import MilestoneCard from "./MilestoneCard";
import type { Milestone } from "@/app/page";

// Friendly label mapping for raw category strings
const CATEGORY_LABELS: Record<string, string> = {
  "Reduced climate impact": "Climate",
  "Dangerous substances": "Hazardous substances",
  "Sustainable urban development": "Urban",
  "Food loss and waste prevention": "Food",
  "Circular economy": "Circular",
  "Eutrophication": "Eutrophication",
  "Waste": "Waste",
  // add more mappings as needed
};

// Preferred display order for mapped labels (optional)
const PREFERRED_ORDER = [
  "Climate",
  "Circular",
  "Urban",
  "Eutrophication",
  "Waste",
  "Food",
  "Hazardous substances",
];

export default function MilestoneGrid({ milestones }: { milestones: Milestone[] }) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    milestones.forEach((m) => {
      set.add(m.category ?? "Uncategorized");
    });

    const raw = Array.from(set);
    // Map raw category -> friendly label
    const mapped = raw.map((r) => ({ raw: r, label: CATEGORY_LABELS[r] ?? r }));

    // Sort by preferred order, then alphabetically
    mapped.sort((a, b) => {
      const ia = PREFERRED_ORDER.indexOf(a.label);
      const ib = PREFERRED_ORDER.indexOf(b.label);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return a.label.localeCompare(b.label);
    });

    return ["All", ...mapped.map((m) => m.label)];
  }, [milestones]);

  const [selected, setSelected] = useState<string>("All");

  const filtered = useMemo(() => {
    if (selected === "All") return milestones;
    return milestones.filter((m) => (CATEGORY_LABELS[m.category ?? ""] ?? (m.category ?? "Uncategorized")) === selected);
  }, [milestones, selected]);

  return (
    <div>
      <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <label htmlFor="category-select" style={{ fontSize: 14, color: "var(--colors-gray-11)" }}>
          Category:
        </label>

        {/* Radix Select */}
        <Select.Root value={selected} onValueChange={(v) => setSelected(v)}>
          <Select.Trigger
            id="category-select"
            aria-label="Category"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              color: "inherit",
              minWidth: 160,
              cursor: "pointer",
            }}
          >
            <Select.Value />
            <Select.Icon>▾</Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              side="bottom"
              align="start"
              style={{
                background: "var(--theme-panel-background, #111)", // adjust to match theme
                color: "inherit",
                borderRadius: 8,
                boxShadow: "0 6px 18px rgba(0,0,0,0.6)",
                padding: 8,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI (Custom)', Roboto, 'Helvetica Neue', 'Open Sans (Custom)', system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'",
                zIndex: 9999,
              }}
            >
              <Select.Viewport>
                {categories.map((cat) => (
                  <Select.Item
                    key={cat}
                    value={cat}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    <Select.ItemText>{cat}</Select.ItemText>
                    <Select.ItemIndicator style={{ marginLeft: 8 }}>✓</Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="4">
        {filtered.map((m) => (
          <MilestoneCard key={m.id} milestone={m} />
        ))}
      </Grid>
    </div>
  );
}