"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import { Card, Flex, Text, Progress, Heading } from "@radix-ui/themes";
import styles from "../page.module.css";
import type { Milestone } from "@/app/page";

export default function MilestoneCard({ milestone }: { milestone: Milestone }) {
  return (
    <a href={`/pages/milestone/${milestone.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <HoverCard.Root>
        <HoverCard.Trigger asChild>
          <Card
            variant="surface"
            style={{
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            className="hover:shadow-lg"
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
                    milestone.progress >= 70 ? "soft" : milestone.progress >= 40 ? "surface" : "soft"
                  }
                  color={milestone.progress >= 70 ? "green" : milestone.progress >= 40 ? "blue" : "red"}
                />
              </Flex>
            </Flex>
          </Card>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content className={styles.Content} sideOffset={5}>
            <Flex direction="column" gap="2">
              <Heading className={styles.Title}>{milestone.title}</Heading>
              <Text size="2">{milestone.description}</Text>
            </Flex>
            <HoverCard.Arrow className={styles.Arrow} />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    </a>
  );
}