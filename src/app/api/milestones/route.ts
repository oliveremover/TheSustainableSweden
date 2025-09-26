export type Milestone = {
    id: number;
    title: string;
    progress: number;
    category?: string;
    description?: string;
};

const environmentalMilestones: Milestone[] = [
    {
        id: 1,
        title: "Emissions of greenhouse gases by 2030",
        progress: 65,
        category: "Reduced climate impact",
        description:
            "Emissions in Sweden outside of the EU ETS should at latest by 2030 be at least 63 per cent lower than emissions in 1990. To achieve the goal, no more than 8 percentage points of the emissions reductions may be realised through supplementary measures.",
    },
    {
        id: 2,
        title: "Emissions of greenhouse gases by 2040",
        progress: 45,
        category: "Reduced climate impact",
        description:
            "Emissions in Sweden outside of the EU ETS should at latest by 2040 be at least 75 per cent lower than emissions in 1990. To achieve the goal, no more than 2 percentage points of the emissions reductions may be realised through supplementary measures.",
    },
    {
        id: 3,
        title: "Emissions of greenhouse gases by 2045",
        progress: 78,
        category: "Reduced climate impact",
        description:
            "At latest by 2045, Sweden is to have no net emissions of greenhouse gases into the atmosphere and should thereafter achieve negative emissions. To achieve zero net emissions, supplementary measures may be counted. By 2045, emissions from activities in Swedish territory are to be at least 85 per cent lower than emissions in 1990.",
    },
    {
        id: 4,
        title: "Emissions of greenhouse gases from domestic transport",
        progress: 32,
        category: "Reduced climate impact",
        description:
            "Emissions from domestic transport, excluding domestic aviation, are to be reduced by at least 70 per cent at latest by 2030 compared with 2010. Domestic aviation is not included in the goal since domestic aviation is included in the EU ETS.",
    },
    {
        id: 5,
        title: "Reduction of national emissions of air pollutants",
        progress: 85,
        category: "Air pollution",
        description:
            "Emissions of nitrogen oxides, sulphur dioxide, volatile organic compounds, ammonia and particulate matter (PM2.5) shall no later than in 2025 correspond to indicative emission levels for 2025 set out in Directive (EU) 2016/2284 of the European Parliament and of the Council on the reduction of national emissions of certain atmospheric pollutants, amending Directive 2003/35/EC and repealing Directive 2001/81/EC.",
    },
    {
        id: 6,
        title: "Reuse of packaging",
        progress: 92,
        category: "Circular economy",
        description:
            "The proportion of packaging placed on the Swedish market for the first time that is reusable must increase by at least 20 percent from 2022 to 2026 and by at least 30 percent from 2022 to 2030. In Sweden, packaging is the single biggest use for plastics by weight, according to a study from 2019. According to the Swedish EPA the amount of packaging placed on the market and covered by the EPR system for packaging has increased by 28 percent from 1 045 400 tonnes to 1 340 400 tonnes between 2012 and 2018. This increase cannot simply be explained by population growth since the amount of packaging per person increased by 17 percent over the same period. In order for packaging to be reusable it needs to be refilled or reused for the same purpose. This means that a particular piece of packaging needs to be used again as the same type of packaging. The idea is that the milestone target will lead to behavior change among consumers and other parts of the supply chain in order to ensure that packaging is reused over and over before becoming waste or is recycled. The milestone target will be monitored by the Swedish EPA in cooperation with other relevant public authorities.",
    },
    {
        id: 7,
        title: "Reduce the use of biocidal products",
        progress: 38,
        category: "Dangerous substances",
        description:
            "The main objective of this milestone target is to reduce the environmental and health risks associated with the use of biocidal products. The use of biocidal products with particularly hazardous properties is to be significantly reduced by 2030.",
    },
    {
        id: 8,
        title: "Reduce the use of plant protection products",
        progress: 55,
        category: "Dangerous substances",
        description:
            "The main objective of this milestone target is to reduce the environmental and health risks associated with the use of plant protection products. The use of plant protection products with particularly hazardous properties will be significantly reduced by 2030.",
    },
    {
        id: 9,
        title: "Pharmaceuticals in the environment",
        progress: 42,
        category: "Dangerous substances",
        description:
            "The main purpose of the milestone target on pharmaceuticals in the environment is to minimise pharmaceutical residues in the environment. Regulations and other measures that minimise the negative environmental effects must be in place in Sweden, in the EU or internationally by 2030 at the latest.",
    },
    {
        id: 10,
        title: "Emissions of dioxins",
        progress: 71,
        category: "Dangerous substances",
        description:
            "The main purpose of this milestone target is to map emissions of dioxin. Measures against these sources are intended to reduce the levels in the environment and in the long run protect people and the environment. By 2030 at the latest, emissions of dioxin from point sources must be mapped and minimised.",
    },
    {
        id: 11,
        title: "Proportion of pedestrian, bicycle and public transport",
        progress: 48,
        category: "Sustainable urban development",
        description:
            "The proportion of personal journeys using public transport, cycling or walking in Sweden must be at least 25 percent by 2025, expressed in person kilometres travelled, with a view to doubling in the long term the proportion for pedestrian, bicycle and public transport.",
    },
    {
        id: 12,
        title: "Integration of urban greenery and ecosystem services into urban environments",
        progress: 67,
        category: "Sustainable urban development",
        description:
            "The majority of the municipalities must utilise and integrate urban greenery and ecosystem services into urban environments in the planning, building and administration of towns and cities and densely populated areas by no later than 2025.",
    },
    {
        id: 13,
        title: "Urban runoff",
        progress: 58,
        category: "Sustainable urban development",
        description:
            "The municipalities where there is a risk of significant impact of urban runoff on soil, water and the physical environment in existing urban areas have carried out a survey and developed action plans for urban runoff by 2025 and have begun the implementation of the plans.",
    },
    {
        id: 14,
        title: "Increased separation and biological treatment of food waste",
        progress: 29,
        category: "Waste",
        description:
            "By 2023 at least 75 percent of food waste from households, catering services, shops and restaurants shall be separated and treated biologically so that nutrients and biogas are utilized.",
    },
    {
        id: 15,
        title: "Good Urban Environment",
        progress: 63,
        category: "Waste",
        description:
            "Cities, towns and other built-up areas should provide a healthy and good living environment and contribute to regional sustainable development.",
    },
    {
        id: 16,
        title: "Construction and demolition waste",
        progress: 41,
        category: "Waste",
        description:
            "Preparation for the reuse, recycling and other material recovery of non-hazardous construction and demolition waste, with the exception of soil and stone, shall amount to at least 70 percent by weight annually until 2025.",
    },
    {
        id: 17,
        title: "Increase the proportion of municipal waste that is recycled and prepared for reuse",
        progress: 34,
        category: "Waste",
        description:
            "By 2025, the amount of municipal waste that is prepared for re-use and recycled shall increase to a minimum of 55 percent by weight, by 2030 to a minimum of 60 percent by weight and by 2035 to a minimum of 65 percent by weight.",
    },
    {
        id: 18,
        title: "Food waste",
        progress: 76,
        category: "Food loss and waste prevention",
        description:
            "From 2020 to 2025, the total amount of food waste should be reduced by at least 20 percent by weight per capita. This means that food waste prevention measures must be taken to reduce the total amount of food waste along the whole food supply chain. Food waste, according to the EU definition, is food that has become waste. Per definition food waste arises mainly at the retail and consumer level. The FAO, definition of food loss and waste is the decrease in quantity or quality of food along the food supply chain. The milestone target will be monitored by Swedish Environmental Protection Agency based on the data produced for EU reporting on the amount of food waste generated per stage of the food supply chain.",
    },
    {
        id: 19,
        title: "Food loss",
        progress: 54,
        category: "Food loss and waste prevention",
        description:
            "By 2025, an increased share of the food production should reach retailers and consumers. This means that food losses need to decrease, so that more of what is produced to become food goes further along in the food chain and is not left in the field or become animal feed or waste. The goal is to reduce food loss at the production levels such as primary production and food industry. But the responsibility for reaching the goal is shared by all actors in the entire food chain, right up to the byers and consumers, since they also play an important role in reducing the food losses in the production. The level of ambition is set based on SDG 12.3 in Agenda 2030 but ensures a higher pace as it aims for the year 2025. The level of reduction is not set since the follow-up methodology is under development. Monitoring by the Swedish Board of Agriculture will start during base year 2021."
    },
    {
        id: 20,
        title: "Reduced eutrophication",
        progress: 14,
        category: "Eutrophication",
        description:
            "The milestone target means that by 2030 manure is increasingly utilised in a resource-efficient manner so that both the losses of nitrogen to air and water and the losses of phosphorus to water are steadily reduced over time through an annual follow-up, it is ensured that the input of nitrogen and phosphorus to water is reduced over time in accordance with Sweden's commitments in the action plan for the Baltic Sea, and that these reduction commitments are achieved within set time frames through an annual follow-up, it is ensured that the emissions of ammonia to air is reduced in accordance with Sweden's commitments in Directive 2016/2284/EU and that this reduction commitment is reached within set time frames."
    }
];


import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(environmentalMilestones);
}