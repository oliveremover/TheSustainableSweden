"use client";

import React, { useState } from "react";
import { Table, Card, Flex, Text, Heading, Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import type { Milestone } from "@/app/page";
import MilestoneDialog from "./MilestoneDialog";
import styles from "./styles.module.css";
/**
 * Client-side admin table with Radix Table + Radix Dialog editing.
 * - props.initialRows: server-provided rows
 * - uses /api/admin/milestones for POST/PUT/DELETE
 */

export default function AdminTableClient({ initialRows }: { initialRows: Milestone[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Milestone[]>(initialRows ?? []);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Partial<Milestone> | null>(null);

  function openNew() {
    setEditing({ title: "", description: "", category: "", progress: 0 });
    setOpen(true);
  }

  function openEdit(row: Milestone) {
    setEditing({ ...row });
    setOpen(true);
  }

  async function save(item: Partial<Milestone>) {
    setSaving(true);
    try {
      const isNew = item.id == null;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch("/api/admin/milestones", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        alert("Save failed: " + (json?.error ?? res.statusText));
        return;
      }
      router.refresh();
      setOpen(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id?: number) {
    if (!id) return;
    if (!confirm("Delete milestone?")) return;
    try {
      const res = await fetch("/api/admin/milestones", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        alert("Delete failed: " + (json?.error ?? res.statusText));
        return;
      }
      router.refresh();
      setOpen(false);
      setEditing(null);
    } catch (e: any) {
      alert("Delete error: " + (e?.message ?? String(e)));
    }
  }

  return (
    <div>
        <Flex justify="between" align="center" style={{ marginBottom: 12 }}>
          <Heading size="5">Milestones</Heading>
          <Flex gap="2">
            <Button onClick={openNew}>+ New</Button>
            <Button onClick={() => router.refresh()} variant="ghost">Refresh</Button>
          </Flex>
        </Flex>

        <div style={{ overflowX: "auto" }}>
          <Table.Root variant="surface" style={{ minWidth: 800 }}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell style={{ textAlign: "right" }}>Progress</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell style={{ textAlign: "center" }}>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {rows.map((r) => (
                <Table.Row key={r.id}>
                  <Table.RowHeaderCell>{r.id}</Table.RowHeaderCell>
                  <Table.Cell>{r.title}</Table.Cell>
                  <Table.Cell>{r.category ?? "—"}</Table.Cell>
                  <Table.Cell style={{ textAlign: "right" }}>{Number(r.progress ?? 0)}%</Table.Cell>
                  <Table.Cell>{r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</Table.Cell>
                  <Table.Cell style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <Button variant="ghost" size="2" onClick={() => openEdit(r)}>Edit</Button>
                    <Button variant="solid" size="2" onClick={() => remove(r.id)}>Delete</Button>
                  </Table.Cell>
                </Table.Row>
              ))}

              {rows.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={6} style={{ padding: 12, textAlign: "center", color: "var(--colors-gray-10)" }}>
                    No milestones found.
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </div>

      <MilestoneDialog
        open={open}
        onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}
        editing={editing}
        setEditing={setEditing}
        onSave={save}
        onDelete={remove}
        saving={saving}
      />
    </div>
  );
}