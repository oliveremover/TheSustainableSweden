import { Heading, Box, Flex, Card, Grid } from "@radix-ui/themes"

export default function Home() {
  return (
    <main>
      <Box m="6">
        <Heading mb="4" size="6">Kartläggning av Sveriges hållbarhetsmål</Heading>
        <Grid columns="9" gap="3" mb="3"  width="auto">
          <Card>
            <Box p="1">
              <p>Test</p>
            </Box>
          </Card>
          <Card>
            <Box p="1">
              <p>Test</p>
            </Box>
          </Card>
        </Grid>
        <Grid columns="2" gap="3" mb="3"  width="auto">
          <Card>
            <Box p="3">
              <p>Denna sida är skapad för att kartlägga Sveriges hållbarhetsmål och hur väl olika kommuner i Sverige uppfyller dessa mål. Informationen är baserad på data från SCB och andra offentliga källor.</p>
            </Box>
          </Card>
          <Flex gap="3" direction="column">
            <Card>
              <Box p="3">
                <p>Denna sida är skapad för att kartlägga Sveriges hållbarhetsmål och hur väl olika kommuner i Sverige uppfyller dessa mål. Informationen är baserad på data från SCB och andra offentliga källor.</p>
              </Box>
            </Card>
            <Card>
              <Box p="3">
                <p>Denna sida är skapad för att kartlägga Sveriges hållbarhetsmål och hur väl olika kommuner i Sverige uppfyller dessa mål. Informationen är baserad på data från SCB och andra offentliga källor.</p>
              </Box>
            </Card>
          </Flex>
        </Grid>
      </Box>
    </main>
  );
}
