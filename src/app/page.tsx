"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import { Card, Flex, Text, Progress, Container, Heading, Grid } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";

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

type Milestone = {
	id: number;
	title: string;
	progress: number;
	category?: string;
	description?: string;
};

function MilestoneCard({
	milestone,
}: {
	milestone: Milestone;
}) {
	const router = useRouter();
	
	const handleCardClick = () => {
		router.push(`/pages/milestone/${milestone.id}`);
	};

	return (
		<HoverCard.Root>
			<HoverCard.Trigger asChild>
				<Card
					variant="surface"
					style={{
						cursor: "pointer",
						transition: "all 0.2s ease",
					}}
					className="hover:shadow-lg"
					onClick={handleCardClick}
				>
					<Flex direction="column" gap="3">
						<Heading size="3" trim="start">
							{milestone.title}
						</Heading>

						<Flex direction="column" gap="2">
							<Flex justify="between" align="center">
								<Text size="2" color="gray">
									Progress
								</Text>
								<Text size="2" weight="medium">
									{milestone.progress}%
								</Text>
							</Flex>

							<Progress
								value={milestone.progress}
								size="2"
								variant={
									milestone.progress >= 70
										? "soft"
										: milestone.progress >= 40
										? "surface"
										: "soft"
								}
								color={
									milestone.progress >= 70
										? "green"
										: milestone.progress >= 40
										? "blue"
										: "red"
								}
							/>
						</Flex>
					</Flex>
				</Card>
			</HoverCard.Trigger>
			<HoverCard.Portal>
				<HoverCard.Content className={styles.Content} sideOffset={5}>
					<Flex direction="column" gap="2">
						<Heading className={styles.Title}>{milestone.title}</Heading>
						<Text size="2">
							{milestone.description}
						</Text>
					</Flex>
					<HoverCard.Arrow className={styles.Arrow} />
				</HoverCard.Content>
			</HoverCard.Portal>
		</HoverCard.Root>
	);
}

export default function HomePage() {
	    const milestones = useMilestones();

    if (milestones === null) {
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
					<Text
						size="4"
						color="gray"
						align="center"
						style={{ maxWidth: 600 }}
					>
						Monitor progress towards Sweden's 16 environmental quality
						objectives that define the state of the Swedish environment.
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
