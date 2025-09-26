import { Card, Flex, Text, Progress, Container, Heading, Grid } from "@radix-ui/themes";
import { createClient } from '@/utils/supabase/server';
import MilestoneCard from "./components/MilestoneCard";
import styles from "./page.module.css";

export type Milestone = {
  id: number;
  title: string;
  progress: number;
  category?: string;
  description?: string;
  created_at?: string | null;
};

export async function GET(): Promise<Milestone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("milestones")
    .select("id, created_at, title, description, category, progress")
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error.message);
    return [];
  }
  return (data ?? []) as Milestone[];
}

export default async function HomePage() {
  const milestones = await GET(); // server-only fetch on initial render

  if (!milestones || milestones.length === 0) {
    return (
      <Container size="4" py="6">
        <Flex direction="column" gap="6">
          <Text>Loading...</Text>
        </Flex>
      </Container>
    );
  }

  const averageProgress = Math.round(
    milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length
  );
  const completedMilestones = milestones.filter((m) => m.progress >= 70).length;
  const inProgressMilestones = milestones.filter((m) => m.progress >= 40 && m.progress < 70).length;
  const needAttentionMilestones = milestones.filter((m) => m.progress < 40).length;

  return (
    <Container size="4" py="6">
      <Flex direction="column" gap="6">
        {/* Header */}
        <Flex direction="column" gap="3" align="center">
          <Heading size="8" align="center">
            Swedish Environmental Milestones
          </Heading>
          <Text size="4" color="gray" align="center" style={{ maxWidth: 600 }}>
            Monitor progress towards Sweden's 16 environmental quality objectives that define the state of the Swedish environment.
          </Text>
        </Flex>

        {/* Overview Stats */}
        <Grid columns={{ initial: "1", xs: "2", md: "4" }} gap="4">
          <Card variant="surface">
            <Flex direction="column" gap="2" align="center">
              <Text size="6" weight="bold" color="green">
                {completedMilestones}
              </Text>
              <Text size="2" color="gray" align="center">
                On Track (≥70%)
              </Text>
            </Flex>
          </Card>

          <Card variant="surface">
            <Flex direction="column" gap="2" align="center">
              <Text size="6" weight="bold" color="blue">
                {inProgressMilestones}
              </Text>
              <Text size="2" color="gray" align="center">
                In Progress (40-69%)
              </Text>
            </Flex>
          </Card>

          <Card variant="surface">
            <Flex direction="column" gap="2" align="center">
              <Text size="6" weight="bold" color="red">
                {needAttentionMilestones}
              </Text>
              <Text size="2" color="gray" align="center">
                Need Attention (&lt;40%)
              </Text>
            </Flex>
          </Card>

          <Card variant="surface">
            <Flex direction="column" gap="2" align="center">
              <Text size="6" weight="bold">
                {averageProgress}%
              </Text>
              <Text size="2" color="gray" align="center">
                Overall Progress
              </Text>
            </Flex>
          </Card>
        </Grid>

        {/* Milestones Grid */}
        <Flex direction="column" gap="4">
          <Heading size="5">Environmental Milestones</Heading>
          <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="4">
            {milestones.map((milestone) => (
              <MilestoneCard key={milestone.id} milestone={milestone} />
            ))}
          </Grid>
        </Flex>
      </Flex>
    </Container>
  );
}
