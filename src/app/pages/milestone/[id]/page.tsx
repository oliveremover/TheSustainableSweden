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
  goal?: any | null;
};

export default async function MilestonePage({ params }: { params: { id: string } }) {
  // await params before using its properties to satisfy Next.js dynamic API requirement
  const { id } = (await params) as { id: string };
  const idNum = Number(id);

  const supabase = await createClient();

  const { data: milestone, error } = await supabase
    .from("milestones")
    // include goal (json/jsonb) from DB so page computes the reference line
    .select("id, created_at, title, description, category, progress, goal")
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

  // --- NEW: fetch related SCB cache rows to get transformed.series and categories ---
  const { data: caches } = await supabase
    .from("scb_cache")
    .select("transformed, scb_sources(id, milestone_id, url)")
    .eq("scb_sources.milestone_id", idNum);

  // pick the first cache row with a transformed.series if present
  const transformed = Array.isArray(caches)
    ? caches.map((c: any) => c.transformed).find((t: any) => t && Array.isArray(t.series))
    : null;

  // Build chart data: map categories -> series values into { name, uv } shape
  const baseChartData =
    transformed && Array.isArray(transformed.series) && Array.isArray(transformed.categories)
      ? transformed.categories.map((cat: string, i: number) => ({
          name: String(cat),
          uv: transformed.series[i] ?? null,
        }))
      : sampleData;

  // --- NEW: compute linear goal (pv) series from milestone.goal JSON on the page to keep flexibility ---
  // expected goal shape: { "series":[71203.3], "categories":[1990,2030], "change":[0.63] }
  const parseGoalSpec = (g: any) => {
    if (!g) return null;
    const series = Array.isArray(g.series) ? g.series : null;
    const cats = Array.isArray(g.categories) ? g.categories : Array.isArray(g.cartegories) ? g.cartegories : null;
    const change = Array.isArray(g.change) ? g.change[0] : typeof g.change === "number" ? g.change : null;
    if (!series || !cats || cats.length < 2 || typeof change !== "number") return null;

    const startYear = Number(cats[0]);
    const endYear = Number(cats[1]);
    const startValue = Number(series[0]);
    // endValue = startValue * (1 - change)
    const endValue = startValue * (1 - change);
    if (!isFinite(startYear) || !isFinite(endYear) || !isFinite(startValue) || !isFinite(endValue)) return null;
    return { startYear, endYear, startValue, endValue };
  };

  const goalSpec = parseGoalSpec(milestone.goal);

  // build chartData; when goalSpec exists produce a full-year range from startYear..endYear
  let chartData;
  if (goalSpec != null) {
    const { startYear, endYear, startValue, endValue } = goalSpec;
    // map existing uv values by year for reuse
    const uvByYear = new Map<number, number | null>();
    interface ChartDataPoint {
      name: string;
      uv?: number | null;
      pv?: number;
      amt?: number;
    }

    baseChartData.forEach((d: ChartDataPoint) => {
      const y = Number(d.name);
      if (isFinite(y)) uvByYear.set(y, d.uv ?? null);
    });

    const span = endYear - startYear || 1;
    const rows: Array<Record<string, any>> = [];
    for (let y = startYear; y <= endYear; y++) {
      let t = (y - startYear) / span;
      if (t < 0) t = 0;
      if (t > 1) t = 1;
      // pv interpolation: pv = startValue + t * (endValue - startValue)
      const pv = startValue + t * (endValue - startValue);
      const uv = uvByYear.has(y) ? uvByYear.get(y) : null;
      rows.push({ name: String(y), uv: uv, pv: Number(pv.toFixed(3)) });
    }

    // keep any extra years outside the goal range (e.g., if baseChartData has earlier or later years)
    // Define interfaces for the data structures
    interface DataPointWithYear {
      y: number;
      d: {
        name: string;
        uv: number | null;
        pv?: number | null;
        amt?: number;
      };
    }

    type FilteredDataPoint = DataPointWithYear | null;

    // Define interface for the extra data points
    interface ExtraChartDataItem {
      name: string;
      uv: number | null;
      pv: number | null;
    }

    // Define interface for base chart data items
    interface BaseChartDataItem {
      name: string;
      uv: number | null;
      pv?: number | null;
      amt?: number;
    }

    const extra: Array<ExtraChartDataItem> = baseChartData
      .map((d: BaseChartDataItem): FilteredDataPoint => {
        const y: number = Number(d.name);
        return isFinite(y) ? { y, d } : null;
      })
      .filter((item: FilteredDataPoint): item is DataPointWithYear => Boolean(item))
      .filter((x: DataPointWithYear): boolean => x.y < startYear || x.y > endYear)
      .map((x: DataPointWithYear): ExtraChartDataItem => ({ name: String(x.y), uv: x.d.uv ?? null, pv: x.d.pv ?? null }));

    // combine extra years (sorted) with the full goal range. We place extra years before/after as appropriate.
    const before = extra.filter((r) => Number(r.name) < startYear).sort((a, b) => Number(a.name) - Number(b.name));
    const after = extra.filter((r) => Number(r.name) > endYear).sort((a, b) => Number(a.name) - Number(b.name));
    chartData = [...before, ...rows, ...after];
  } else {
    chartData = baseChartData;
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
                  {/* pass pre-computed pv values from the page so chart component remains flexible */}
                  <MilestoneChart data={chartData} />
                </Card>
                <Text size="2">Data gathered from <a href="#">Source</a></Text>
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