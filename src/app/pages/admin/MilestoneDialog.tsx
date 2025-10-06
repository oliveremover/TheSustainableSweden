"use client";
import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Card, Flex, Heading, TextField, TextArea, Button, Text } from "@radix-ui/themes";
import type { Milestone } from "@/app/page";
import styles from "./styles.module.css";
type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Partial<Milestone> | null;
  setEditing: (v: Partial<Milestone> | null) => void;
  onSave: (item: Partial<Milestone>) => Promise<void>;
  onDelete: (id?: number) => Promise<void>;
  saving?: boolean;
};

export default function MilestoneDialog({ open, onOpenChange, editing, setEditing, onSave, onDelete, saving = false }: Props) {
  const [local, setLocal] = useState<Partial<Milestone> | null>(editing);

  useEffect(() => {
    if (open) {
      // clone editing into local state when dialog opens
      setLocal(editing ? { ...editing } : { title: "", description: "", category: "", progress: 0 });
    }
  }, [open, editing]);

  function update<K extends keyof Partial<Milestone>>(k: K, v: any) {
    setLocal((prev) => ({ ...(prev ?? {}), [k]: v }));
  }

  async function handleSave() {
    if (!local) return;
    await onSave(local);
  }

  async function handleDelete() {
    if (!local?.id) return;
    await onDelete(local.id);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.Overlay}/>
        <Dialog.Content className={styles.Content}>
              <Dialog.Title className={styles.Title}>{local?.id ? "Edit milestone" : "New milestone"}</Dialog.Title>
				<fieldset className={styles.Fieldset}>
					<label className={styles.Label} htmlFor="title">
						Title
					</label>
					<input
						className={styles.Input}
						id="title"
						value={local?.title ?? ""}
						onChange={(e) => update("title", e.target.value)}
					/>
				</fieldset>
                <fieldset className={styles.Fieldset}>
					<label className={styles.Label} htmlFor="category">
						Category
					</label>
					<input
						className={styles.Input}
						id="category"
						value={local?.category ?? ""}
						onChange={(e) => update("category", e.target.value)}
					/>
				</fieldset>
                <fieldset className={styles.Fieldset}>
					<label className={styles.Label} htmlFor="description">
						Description
					</label>
					<textarea
						className={styles.InputArea}
						id="description"
						value={local?.description ?? ""}
						onChange={(e) => update("description", e.target.value)}
					/>
				</fieldset>
                <div style={{ display: "flex", marginTop: 25, justifyContent: "flex-end" }}>
					<Dialog.Close asChild>
						<button className={`${styles.Button} green`} onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
					</Dialog.Close>
				</div>
            <Dialog.Close asChild>
                <button className={styles.IconButton} aria-label="Close">
                    <Cross2Icon />
                </button>
            </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}