import { Card, Flex, Text, Progress, Container, Heading, Box, Tabs } from "@radix-ui/themes";
import { createClient } from "@/utils/supabase/server";
import MilestoneChart from "@/app/components/MilestoneChart";
import BackButton from "@/app/components/BackButton";

const sampleData = [
  { name: "2010", uv: 400, pv: 400, amt: 2400 },
  { name: "2011", uv: 385, pv: 380, amt: 2350 },
  { name: "2012", uv: 370, pv: 360, amt: 2300 },
  { name: "2013", uv: 355, pv: 340, amt: 2250 },
  { name: "2014", uv: 340, pv: 320, amt: 2200 },
  { name: "2015", uv: 325, pv: 300, amt: 2150 },
  { name: "2016", uv: 310, pv: 280, amt: 2100 },
  { name: "2017", uv: 295, pv: 260, amt: 2050 },
  { name: "2018", uv: 280, pv: 240, amt: 2000 },
  { name: "2019", uv: 265, pv: 220, amt: 1950 },
  { name: "2020", uv: 250, pv: 200, amt: 1900 },
  { name: "2021", uv: 240, pv: 180, amt: 1850 },
  { name: "2022", uv: 230, pv: 160, amt: 1800 },
  { name: "2023", uv: 220, pv: 140, amt: 1750 },
  { name: "2024", uv: 210, pv: 120, amt: 1700 },
];

type Milestone = {
  id: number;
  title: string;
  progress: number;
  category?: string;
  description?: string;
};

export default async function MilestonePage({ params }: { params: { id: string } }) {
  // await params before using its properties to satisfy Next.js dynamic API requirement
  const { id } = (await params) as { id: string };
  const idNum = Number(id);

  const supabase = await createClient();
  const { data: milestone, error } = await supabase
    .from("milestones")
    .select("id, created_at, title, description, category, progress")
    .eq("id", idNum)
    .maybeSingle();

  if (error || !milestone) {
    return (
      <Container>
        <Heading>Milestone not found</Heading>
        <div style={{ display: "inline-block", marginTop: 12 }}>
          <BackButton fallbackHref="/" />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Flex direction="column" gap="6" py="6">
        <BackButton />

        <Card size="3">
          <Flex direction="column" gap="4">
            <Heading size="6">{milestone.title}</Heading>

            <Flex direction="column" gap="2">
              <Text size="2" color="gray">Progress</Text>
              <Progress
                value={milestone.progress}
                size="3"
                variant={milestone.progress >= 70 ? "soft" : milestone.progress >= 40 ? "surface" : "soft"}
                color={milestone.progress >= 70 ? "green" : milestone.progress >= 40 ? "blue" : "red"}
              />
              <Text size="4" weight="bold">{milestone.progress}%</Text>
            </Flex>

            <Text size="3">{milestone.description}</Text>

            {/* Additional details and chart */}
            <Flex direction="column" gap="2">
              <Heading size="4">Additional Details</Heading>
              <Text>Add more detailed information about this milestone here.</Text>
            </Flex>
          </Flex>
        </Card>

        <Tabs.Root defaultValue="overview">
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="actions">What is done?</Tabs.Trigger>
            <Tabs.Trigger value="indactions">What can I do?</Tabs.Trigger>
          </Tabs.List>

          <Box pt="3">
            <Tabs.Content value="overview">
              <Heading size="6" mb="5" mt="5">Our Progress</Heading>
              <div style={{ width: "100%", minWidth: 0 }}>
                <Card size="3" mb="2">
                  <MilestoneChart data={sampleData} />
                </Card>
                <Text size="2">Data gathered from ...</Text>
              </div>
            </Tabs.Content>

            <Tabs.Content value="actions">
              <Text size="2">What does the government do?</Text>
            </Tabs.Content>

            <Tabs.Content value="indactions">
              <Text size="2">What can I do?</Text>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Flex>
    </Container>
  );
}