/**
 * STANDARD — Speech Fixture: Kazakhstan Cloud Seeding Launch
 *
 * The DATA MODEL of the original speech from
 * reference/Speech_for_Kazakstan_Cloud_Seeding_Project_launch.docx
 *
 * Text, bold spans, and bullet lists were extracted run-by-run from the
 * original .docx XML and reproduced exactly (punctuation, curly quotes,
 * en-dashes, and apostrophes preserved as authored). Adjacent runs sharing
 * the same bold state were merged — this does not change rendering.
 *
 * Re-render this model and it should match the original.
 */

import { MinisterSpeech } from "../schema";

const kazakhSpeech: MinisterSpeech = {
  control: {
    occasion: "Ceremonial Launch of the Kazakhstan Cloud Seeding Pilot Project",
    principal: "H.E. Dr. Abdulla Al Mandoos",
    audience: "Distinguished Deputy Prime Minister Madiyev, Excellencies, Colleagues, and Friends,",
    location: "Turkistan, Republic of Kazakhstan",
    date: "2025",
    language: "en",
  },

  salutationBlock: {
    salutation: "Distinguished Deputy Prime Minister Madiyev,",
  },

  body: [
    // Second salutation line (bold), kept as its own paragraph like the original.
    { leadInBold: "Excellencies, Colleagues, and Friends," },

    {
      runs: [
        { text: "It is a distinct honor to join you today on behalf of the Government of the United Arab Emirates and the World Meteorological Organization in the historic city of " },
        { text: "Turkistan of Republic of Kazakhstan", bold: true },
        { text: "." },
      ],
    },
    {
      runs: [
        { text: "We are gathered here to witness the “Ceremonial Launch of the " },
        { text: "Kazakhstan Cloud Seeding Pilot Project” –", bold: true },
      ],
      list: {
        marker: "bullet",
        items: [
          "A pioneering initiative that marks a significant milestone in Kazakhstan’s efforts to enhance climate resilience through advanced weather technologies.",
        ],
      },
    },
    {
      runs: [
        { text: "This project is a direct reflection of the deepening " },
        { text: "UAE–Kazakhstan Relations", bold: true },
        { text: ". " },
      ],
    },
    {
      runs: [
        { text: "Following the 2025 visit of " },
        { text: "His Highness Sheikh Khaled bin Mohamed bin Zayed Al Nahyan, Crown Prince of Abu Dhabi", bold: true },
        { text: "- " },
      ],
    },
    {
      text: "Our partnership has shifted from high-level agreements to scaled execution by leveraging UAE investment and technology, to deliver tangible outcomes for Kazakhstan’s economic transformation and long-term growth. ",
    },
    {
      runs: [
        { text: "Central to this, ", bold: true },
        { text: "is the Memorandum of Understanding (MoU) signed between the National Center of Meteorology (NCM) and Kazhydromet of the Government of Kazakhstan, which provides the strategic framework for this collaboration and the Cloud seeding Project." },
      ],
    },
    { leadInBold: "Dear Participants," },
    {
      runs: [
        { text: "The World Economic Forum’s Global Risks Report is clear", bold: true },
        { text: ": " },
      ],
    },
    {
      text: "“Extreme Weather Events” top the list of global threats in the long term. ",
    },
    {
      runs: [
        { text: "Kazakhstan finds itself", bold: true },
        { text: " at the forefront of this challenge. The World Bank’s Climate Change Report for Kazakhstan reveals that: " },
      ],
      list: {
        marker: "bullet",
        items: [
          [
            { text: "Temperatures in Kazakhstan", bold: true },
            { text: " are projected to rise faster than the global average, with potential warming reaching " },
            { text: "5.3 degree C", bold: true },
            { text: " by the 2090s." },
          ],
          [{ text: "Severe droughts are expected to occur more frequently.", bold: true }],
          [
            { text: "The melting of Kazakhstan’s glaciers", bold: true },
            { text: " will initially spike flood risks, followed by a critical, long-term decline in river flow." },
          ],
        ],
      },
    },
    {
      text: "As a leading grain exporter, Kazakhstan's Climate resilience is vital to global food security. ",
      list: {
        marker: "bullet",
        items: [
          "Water scarcity has eroded traditional farming in this Turkistan region.",
          [
            { text: "Without proactive adaptation, spring wheat yields could decline by " },
            { text: "50% by the 2050s", bold: true },
            { text: "." },
          ],
        ],
      },
    },
    {
      runs: [
        { text: "In this context, weather and climate services are not merely technical tools; they are the bedrock of " },
        { text: "Kazakhstan’s defense", bold: true },
        { text: " against a changing climate. " },
      ],
    },
    {
      runs: [
        { text: "This pilot project, implemented in partnership with the " },
        { text: "National Center of Meteorology of the UAE", bold: true },
        { text: ", is timely and testament to the power of international scientific collaboration to manage water resources sustainably and to contribute to Food security." },
      ],
    },
    { leadInBold: "Excellencies and Participants," },
    {
      runs: [
        { text: "Looking ahead to " },
        { text: "December 2026", bold: true },
        { text: ", the " },
        { text: "United Nations Water ", bold: true },
        { text: "Conference—co-hosted by the UAE and Senegal—will stand as a pivotal moment for global solidarity. " },
      ],
    },
    {
      runs: [
        { text: "For both the UAE and Kazakhstan", bold: true },
        { text: ", this is more than a summit; it is our stage. It is a great opportunity to showcase our central roles in shaping global water policy and fostering sustainable solutions." },
      ],
    },
    {
      runs: [
        { text: "On behalf of " },
        { text: "UAE Government", bold: true },
        { text: ", I extend a formal invitation to our partners in Kazakhstan to engage actively in this landmark conference as we work together to lead the Global Water Agenda." },
      ],
    },
    {
      runs: [
        { text: "As President of the WMO", bold: true },
        { text: "," },
      ],
    },
    {
      text: "I commend the Government of Kazakhstan and the Ministry of Digital Development, Innovations and Aerospace Industry for their commitment to innovation. Your dedication to integrating climate technology into national development serves as a model for the region.",
    },
    {
      text: "Together, through initiatives like this, we reinforce the international dialogue required to address climate challenges and ensure a more resilient future for all.",
    },
  ],

  closing: {
    text: "Thank you.",
    signature: "",
  },
};

export default kazakhSpeech;
