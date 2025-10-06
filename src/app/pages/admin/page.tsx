import React from "react";
import { Heading, Flex, Button, Card, Text } from "@radix-ui/themes";
import { createClient } from "@/utils/supabase/server";
import AdminTableClient from "./AdminTableClient";

/**
 * Server component: fetch milestones server-side and render the client table.
 * - removes getServerSideProps (not supported in app/)
 * - keeps client logic in AdminTableClient (client component)
 */

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: milestones, error } = await supabase
    .from("milestones")
    .select("id, created_at, title, description, category, progress")
    .order("id", { ascending: true });

  if (error) {
    return (
      <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        <Card style={{ padding: 16 }}>
          <Heading size="4">Admin Panel</Heading>
          <Text color="red" style={{ marginTop: 8 }}>
            Failed to load milestones: {error.message}
          </Text>
        </Card>
      </div>
    );
  }

  const rows = Array.isArray(milestones) ? milestones : [];

  return (
    <div style={{ padding: "16px", margin: "0 12px" }}>
      <Flex direction="column" gap="6">
        <Flex justify="between" align="center" style={{ marginBottom: 8 }}>
          <Heading size="3">Admin Panel</Heading>
          <a href="/" style={{ textDecoration: "none" }}>
            <Button>Log out</Button>
          </a>
        </Flex>

        {/* Client component handles editing / dialog */}
        <AdminTableClient initialRows={rows} />
      </Flex>
    </div>
  );
}