"use client";
import { Card, Flex, Text, Progress, Container, Heading, Button, Box, Tabs } from "@radix-ui/themes";
import { useParams, useRouter } from "next/navigation";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer, Customized } from 'recharts';
import React, { useEffect, useState } from "react";

const data = [
    { name: '2010', uv: 400, pv: 400, amt: 2400 },
    { name: '2011', uv: 385, pv: 380, amt: 2350 },
    { name: '2012', uv: 370, pv: 360, amt: 2300 },
    { name: '2013', uv: 355, pv: 340, amt: 2250 },
    { name: '2014', uv: 340, pv: 320, amt: 2200 },
    { name: '2015', uv: 325, pv: 300, amt: 2150 },
    { name: '2016', uv: 310, pv: 280, amt: 2100 },
    { name: '2017', uv: 295, pv: 260, amt: 2050 },
    { name: '2018', uv: 280, pv: 240, amt: 2000 },
    { name: '2019', uv: 265, pv: 220, amt: 1950 },
    { name: '2020', uv: 250, pv: 200, amt: 1900 },
    { name: '2021', uv: 240, pv: 180, amt: 1850 },
    { name: '2022', uv: 230, pv: 160, amt: 1800 },
    { name: '2023', uv: 220, pv: 140, amt: 1750 },
    { name: '2024', uv: 210, pv: 120, amt: 1700 },
];
// We'll fetch milestones from the server API instead
type Milestone = {
    id: number;
    title: string;
    progress: number;
    category?: string;
    description?: string;
};

const useMilestones = () => {
    const [items, setItems] = useState<Milestone[] | null>(null);
    useEffect(() => {
        let mounted = true;
        fetch("/api/milestones")
            .then((r) => r.json())
            .then((data: Milestone[]) => {
                if (mounted) setItems(data);
            })
            .catch(() => {
                if (mounted) setItems([]);
            });
        return () => {
            mounted = false;
        };
    }, []);
    return items;
};

export default function MilestonePage() {
    const params = useParams();
    const router = useRouter();
    const milestoneId = parseInt(params.id as string);
    
    const milestones = useMilestones();
    if (milestones === null) {
        return (
            <Container>
                <Flex direction="column" gap="6" py="6">
                    <Text>Loading...</Text>
                </Flex>
            </Container>
        );
    }

    const milestone = milestones.find(m => m.id === milestoneId);
    
    if (!milestone) {
        return (
            <Container>
                <Heading>Milestone not found</Heading>
                <Button variant="soft" onClick={() => router.push('/')}>
                    ← Back to Home
                </Button>
            </Container>
        );
    }

    return (
        <Container>
            <Flex direction="column" gap="6" py="6">
                <Button variant="soft" onClick={() => router.back()}>
                    ← Back
                </Button>
                
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
                            <Text size="4" weight="bold">
                                {milestone.progress}%
                            </Text>
                        </Flex>
                        
                        <Text size="3">{milestone.description}</Text>
                        
                        {/* Add more detailed information here */}
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
                        <Heading size="4" mb="3" mt="3">Overview</Heading>
                        <Card size="3">
                            <Heading size="6" mb="5">Our Progress</Heading>
                            <div style={{ width: "100%", minWidth: 0 }}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid stroke="#868585ff" strokeDasharray="5 5" />
                                        <Line type="monotone" dataKey="uv" stroke="purple" strokeWidth={2} name="Where we are at" />
                                        <Line type="monotone" dataKey="pv" stroke="green" strokeWidth={2} name="Where we need to be" strokeDasharray="5 5"/>
                                        <XAxis dataKey="name" />
                                        <YAxis width={50} label={{ value: 'UV', position: 'insideLeft', angle: -90 }} />
                                        <Legend align="right" />
                                        <Tooltip />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <Text size="2">Data gathered from ...</Text>
                        </Card>
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