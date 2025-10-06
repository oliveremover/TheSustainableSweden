"use client";

import React, { useState } from "react";
import { Card, Flex, Text, Heading, TextField, Button } from "@radix-ui/themes";
import { supabaseClient } from "@/utils/supabase/client"; // add this file if missing
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const access_token = data?.session?.access_token;
      if (!access_token) {
        alert("Sign in succeeded but no access token returned.");
        setBusy(false);
        return;
      }

      // Exchange Supabase access_token for server admin cookie
      const r = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token }),
      });
      const j = await r.json().catch(() => ({} as any));
      if (!r.ok) {
        alert("Server session error: " + (j?.error ?? r.statusText));
        setBusy(false);
        return;
      }

      // Signed in as admin; go to admin UI
      router.push("/pages/admin");
    } catch (err: any) {
      alert("Sign in failed: " + (err?.message ?? String(err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Flex justify="center" align="center" style={{ padding: 24 }}>
      <Card style={{ width: 420, padding: 20 }}>
        <Heading size="5">Admin sign in</Heading>
        <Text size="2" color="gray" style={{ marginTop: 8, marginBottom: 12 }}>
          Sign in with your admin email and password.
        </Text>

        <form onSubmit={handleSignIn}>
          <div style={{ display: "grid", gap: 10 }}>
            <label htmlFor="email" style={{ fontSize: 13, color: "var(--colors-gray-11)" }}>Email</label>
            <TextField.Root id="email" value={email} onChange={(e: any) => setEmail(e.target.value)} type="email" required />

            <label htmlFor="password" style={{ fontSize: 13, color: "var(--colors-gray-11)" }}>Password</label>
            <TextField.Root id="password" value={password} onChange={(e: any) => setPassword(e.target.value)} type="password" required />

            <Flex justify="end" align="center" style={{ marginTop: 8, gap: 8 }}>
              <Button type="submit" disabled={busy || !email || !password}>Log in</Button>
            </Flex>
          </div>
        </form>
      </Card>
    </Flex>
  );
}