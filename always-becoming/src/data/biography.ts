/** Public biography only. Editorial facts supplied by the owner, 6–8 November 2026.
 * No private institutional material belongs in this file. Missing personal material stays empty.
 * Photographs must be approved by the owner before adding a local public asset path.
 */
export interface Milestone {
  date: string;
  title: string;
  description: string;
}
export interface Chapter {
  number: string;
  id: string;
  title: string;
  subtitle: string;
  range: string;
  location: string;
  text: string;
  details: string[];
  milestones: Milestone[];
  accent: string;
  interactionLabel: string;
  panelKind: string;
}
export interface StoryLocation {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  chapterId: string;
  label: string;
  note: string;
}
export interface MemorySlot {
  id: string;
  category: "origins" | "person";
  title: string;
  /** Public asset path relative to the Vite base, e.g. images/naples-2024.webp. */
  src: string;
  alt: string;
  caption: string;
  story: string;
  placeholder: string;
}
export const biography = {
  fullName: "Venkata Tarun Kumar Mavillapalli",
  displayName: "Venkata",
  familyName: "Tarun",
  birthYear: 1999,
  editionYear: 2026,
  ageAtEdition: 27,
  origin: "Hyderabad, India",
  title: "27 Years of Becoming",
  opening: "A life, still unfolding.",
  role: "AI Consultant",
  organization: "United Nations World Food Programme",
  office: "Office of Inspector General",
  currentSince: "July 2026",
  email: "mvtkop760@gmail.com",
  linkedin: "",
  github: "",
  repository:
    "https://github.com/VenkataTarunKumarMavillapalli/Portfolio_website",
  formalResume: "",
  disclaimer:
    "An independent personal project. Not an official United Nations, WFP or EFSA website. Institutional references do not imply endorsement. All interactive demonstrations use fictional information and run locally in your browser.",
  editorialNote:
    "Role dates follow the owner-supplied biography. Historical WFP office wording, role descriptions, external profile links and photographs require a final owner review before public release.",
};
export const chapters: Chapter[] = [
  {
    number: "01",
    id: "origins",
    title: "The beginning.",
    subtitle: "Before the work. Before the world.",
    range: "1999–2016",
    location: "Hyderabad, India",
    text: "The first coordinate is Hyderabad. This is where Venkata’s story begins, before the university years and the professional chapters that follow.",
    details: [
      "Born in 1999. Known professionally as Venkata and to family as Tarun.",
      "Childhood, school, family influences and early interests are reserved for his own words and photographs. Those stories have not yet been supplied.",
    ],
    milestones: [
      {
        date: "1999",
        title: "The beginning",
        description: "Hyderabad, India.",
      },
      {
        date: "1999–2016",
        title: "The early years",
        description:
          "Personal memories and photographs await the owner’s contribution.",
      },
    ],
    accent: "#d6ac7a",
    interactionLabel: "Open the memory archive",
    panelKind: "origins",
  },
  {
    number: "02",
    id: "world",
    title: "The world opens.",
    subtitle: "One foundation. More than one perspective.",
    range: "2016–2020",
    location: "India · United Kingdom · United States",
    text: "Computer science became the foundation. Amity University’s Three-Continental Program connected undergraduate study with experiences at Birkbeck in London and Adelphi in New York.",
    details: [
      "BTech in Computer Science Engineering, Amity University, 2016–2020. Birkbeck and Adelphi are associated study experiences, not separate degrees.",
      "A website and database development internship at the A.J. Drexel Autism Institute in Philadelphia followed in May–July 2019. Map connections represent educational and career associations, not a verified travel itinerary.",
    ],
    milestones: [
      {
        date: "2016–2020",
        title: "BTech · Computer Science Engineering",
        description:
          "Amity University · Three-Continental Program. Associated study experiences at Birkbeck and Adelphi.",
      },
      {
        date: "May–July 2019",
        title: "Website & Database Development Intern",
        description:
          "A.J. Drexel Autism Institute · Philadelphia, United States.",
      },
    ],
    accent: "#a9c7d7",
    interactionLabel: "Explore the coordinates",
    panelKind: "world",
  },
  {
    number: "03",
    id: "engineering",
    title: "Becoming an engineer.",
    subtitle: "From writing code to building systems.",
    range: "2021–2022",
    location: "Hyderabad, India",
    text: "At Neuraflash, engineering became everyday delivery: Salesforce development, customer-service automation and production support, with people relying on what the team built.",
    details: [
      "Associate Salesforce Developer · February 2021–August 2022.",
      "Contributions included Salesforce configuration, Amazon Connect chatbots, troubleshooting and production support within collaborative delivery. The interactive service workflow is an explanatory prototype, not a reproduction of client work.",
    ],
    milestones: [
      {
        date: "February 2021–August 2022",
        title: "Associate Salesforce Developer",
        description: "Neuraflash · Hyderabad, India.",
      },
      {
        date: "Focus",
        title: "Enterprise software",
        description:
          "Salesforce configuration, Amazon Connect chatbots and production support.",
      },
    ],
    accent: "#9bbcc1",
    interactionLabel: "Follow a service request",
    panelKind: "engineering",
  },
  {
    number: "04",
    id: "reinvention",
    title: "A wider lens.",
    subtitle: "Engineering. Research. Product thinking.",
    range: "2022–2025",
    location: "Naples, Italy",
    text: "A master’s in Data Science at the University of Naples Federico II opened a new chapter. Research and applied AI met product development and challenge-based learning.",
    details: [
      "MSc in Data Science · September 2022–May 2025. Apple Developer Academy · September 2023–June 2024.",
      "A University of Naples Federico II research internship and the Italdesign / Ideneers Academy experience added further perspectives in 2024. Exact project descriptions await approved details.",
    ],
    milestones: [
      {
        date: "September 2022–May 2025",
        title: "MSc · Data Science",
        description: "University of Naples Federico II.",
      },
      {
        date: "September 2023–June 2024",
        title: "Apple Developer Academy",
        description:
          "Digital product development and challenge-based learning.",
      },
      {
        date: "2024",
        title: "Research & applied learning",
        description:
          "University research internship and Italdesign / Ideneers Academy.",
      },
    ],
    accent: "#bcb0ce",
    interactionLabel: "Explore the learning strands",
    panelKind: "reinvention",
  },
  {
    number: "05",
    id: "public-service",
    title: "Data meets public purpose.",
    subtitle: "Dependable information. Shared responsibility.",
    range: "2024–2025",
    location: "Parma, Italy",
    text: "At the European Food Safety Authority, data engineering became part of international public service. Data quality, analytics and automation took shape through cross-functional collaboration.",
    details: [
      "Data Officer Trainee · November 2024–October 2025.",
      "Team contributions included Power BI reporting, Databricks pipelines, data validation and documentation. The cleaning exercise contains invented records and does not represent EFSA data or results.",
    ],
    milestones: [
      {
        date: "November 2024–October 2025",
        title: "Data Officer Trainee",
        description: "European Food Safety Authority · Parma, Italy.",
      },
      {
        date: "Focus",
        title: "Trustworthy information",
        description:
          "Data quality, analytical products, automation and collaboration.",
      },
    ],
    accent: "#bdc6a7",
    interactionLabel: "Inspect a fictional dataset",
    panelKind: "public-service",
  },
  {
    number: "06",
    id: "united-nations",
    title: "A different responsibility.",
    subtitle: "Artificial intelligence. Human judgment.",
    range: "2025–2026",
    location: "Rome, Italy",
    text: "An AI engineering internship at the World Food Programme brought knowledge retrieval, analytical reporting and investigative technology into the same frame.",
    details: [
      "AI Engineer Intern, Integration & Investigative Technologies · October 2025–June 2026. The owner’s current brief identifies the internship office as the Office of Inspections and Investigations; historical wording remains subject to final owner verification.",
      "Contributions to a multidisciplinary team included retrieval and data preparation, reporting, document-oriented interfaces and forensic information workflows. These tools support people; they do not replace investigative judgment. No internal case information or institutional system is reproduced here.",
    ],
    milestones: [
      {
        date: "October 2025–June 2026",
        title: "AI Engineer Intern",
        description:
          "World Food Programme · Integration & Investigative Technologies.",
      },
      {
        date: "Working principles",
        title: "Sources, context and review",
        description:
          "Traceable information and human oversight in multidisciplinary delivery.",
      },
    ],
    accent: "#a7c1ce",
    interactionLabel: "Inspect the intelligence principles",
    panelKind: "united-nations",
  },
  {
    number: "07",
    id: "laboratory",
    title: "The AI consultant.",
    subtitle: "From individual solutions to connected intelligence.",
    range: "2026–present",
    location: "WFP · Office of Inspector General",
    text: "From July 2026, the next chapter is an AI consultancy at WFP. The work sits where AI engineering, enterprise knowledge, analytical systems and oversight meet.",
    details: [
      "AI Consultant · July 2026–present. United Nations World Food Programme · Office of Inspector General.",
      "Six local, synthetic demonstrations explain fields of work and design choices. They are illustrative prototypes, not deployed institutional systems, production performance claims or live AI services.",
    ],
    milestones: [
      {
        date: "July 2026–present",
        title: "AI Consultant",
        description: "World Food Programme · Office of Inspector General.",
      },
      {
        date: "Direction",
        title: "Integrated enterprise intelligence",
        description:
          "AI engineering, product thinking, analytical systems and responsible enterprise transformation.",
      },
    ],
    accent: "#c7b08c",
    interactionLabel: "Enter the project laboratory",
    panelKind: "laboratory",
  },
  {
    number: "08",
    id: "person",
    title: "Beyond the professional.",
    subtitle: "Venkata at work. Tarun with family.",
    range: "A personal chapter",
    location: "The person behind the technology",
    text: "A professional timeline is only one way to know a person. This space is reserved for real photographs, interests, memories and reflections, shared in his own words.",
    details: [
      "No personal photographs, interests, quotations or reflections have been invented. Each empty archive frame is an explicit invitation for approved material.",
      "The gallery is ready for photographs, descriptive alternative text and captions when supplied.",
    ],
    milestones: [
      {
        date: "Identity",
        title: "Venkata / Tarun",
        description: "Professional name: Venkata. Family name: Tarun.",
      },
      {
        date: "To be added",
        title: "The personal archive",
        description:
          "Real photographs, interests, reflections and meaningful experiences.",
      },
    ],
    accent: "#d4c2ab",
    interactionLabel: "Open the personal archive",
    panelKind: "person",
  },
  {
    number: "09",
    id: "continues",
    title: "Still becoming.",
    subtitle: "The next chapter is still being written.",
    range: "Beyond 2026",
    location: "An open horizon",
    text: "The story continues at the intersection of technical depth, product thinking and responsible AI. A direction, rather than a claim that the journey is finished.",
    details: [
      "Explore the professional overview, revisit a year or start a conversation.",
      "A formal résumé and external profile links have not yet been selected and verified for this build.",
    ],
    milestones: [
      {
        date: "2026 edition",
        title: "27 years of becoming",
        description: "A life, still unfolding.",
      },
    ],
    accent: "#cfb58e",
    interactionLabel: "Explore the professional profile",
    panelKind: "profile",
  },
];
export const locations: StoryLocation[] = [
  {
    id: "hyderabad",
    name: "Hyderabad",
    country: "India",
    lat: 17.385,
    lon: 78.487,
    chapterId: "origins",
    label: "The first coordinate",
    note: "Origins from 1999, followed by professional software engineering at Neuraflash in February 2021–August 2022. Amity’s BTech programme belongs to the India education chapter; no exact campus or route is implied.",
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    lat: 51.507,
    lon: -0.128,
    chapterId: "world",
    label: "An international study experience",
    note: "Birkbeck in London, associated with Amity University’s Three-Continental Program (2016–2020). This is not a separate degree.",
  },
  {
    id: "newyork",
    name: "New York",
    country: "United States",
    lat: 40.713,
    lon: -74.006,
    chapterId: "world",
    label: "A wider educational perspective",
    note: "Adelphi, associated with the Three-Continental Program (2016–2020). This city-level association is not an exact campus location or a verified travel itinerary.",
  },
  {
    id: "philadelphia",
    name: "Philadelphia",
    country: "United States",
    lat: 39.952,
    lon: -75.165,
    chapterId: "world",
    label: "Engineering in an institutional setting",
    note: "Website & Database Development Intern at the A.J. Drexel Autism Institute, May–July 2019. Separate from the undergraduate study experiences.",
  },
  {
    id: "naples",
    name: "Naples",
    country: "Italy",
    lat: 40.852,
    lon: 14.268,
    chapterId: "reinvention",
    label: "Research meets product",
    note: "MSc in Data Science, September 2022–May 2025; Apple Developer Academy, September 2023–June 2024; university research internship in 2024.",
  },
  {
    id: "parma",
    name: "Parma",
    country: "Italy",
    lat: 44.801,
    lon: 10.328,
    chapterId: "public-service",
    label: "Data for public purpose",
    note: "Data Officer Trainee at the European Food Safety Authority, November 2024–October 2025.",
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    lat: 41.903,
    lon: 12.496,
    chapterId: "united-nations",
    label: "The WFP chapter",
    note: "AI Engineer Intern, October 2025–June 2026; AI Consultant with WFP’s Office of Inspector General from July 2026.",
  },
];
const emptyMemory = (
  id: string,
  category: MemorySlot["category"],
  title: string,
  placeholder: string,
): MemorySlot => ({
  id,
  category,
  title,
  placeholder,
  src: "",
  alt: "",
  caption: "",
  story: "",
});
export const memorySlots: MemorySlot[] = [
  emptyMemory(
    "childhood",
    "origins",
    "Childhood memories",
    "A real childhood memory and photograph have not yet been supplied.",
  ),
  emptyMemory(
    "school",
    "origins",
    "School experiences",
    "The school story is awaiting Venkata’s own words.",
  ),
  emptyMemory(
    "family",
    "origins",
    "Family influences",
    "Family influences and any approved photographs are yet to be added.",
  ),
  emptyMemory(
    "interests-early",
    "origins",
    "Early interests",
    "Early interests have not yet been provided. No interests are inferred.",
  ),
  emptyMemory(
    "moments",
    "origins",
    "Important moments",
    "This space is reserved for a real, owner-approved memory.",
  ),
  emptyMemory(
    "milestones",
    "origins",
    "Personal milestones",
    "Personal milestone details and photographs have not yet been supplied.",
  ),
  emptyMemory(
    "photographs",
    "person",
    "A personal photograph",
    "An approved personal photograph, alt text and caption will appear here.",
  ),
  emptyMemory(
    "interests",
    "person",
    "Interests beyond the work",
    "Personal interests have not yet been supplied.",
  ),
  emptyMemory(
    "reflections",
    "person",
    "In his own words",
    "A personal reflection is awaiting the owner’s contribution. No quotation has been invented.",
  ),
  emptyMemory(
    "memories",
    "person",
    "A meaningful experience",
    "A real memory and its context will be added when supplied.",
  ),
];
export const learningStrands = [
  {
    id: "data-science",
    title: "Data science",
    date: "September 2022–May 2025",
    organization: "University of Naples Federico II",
    description:
      "MSc in Data Science. Statistical thinking, research and applied AI widen the engineering foundation.",
    status: "Supplied education history",
  },
  {
    id: "product",
    title: "Product thinking",
    date: "September 2023–June 2024",
    organization: "Apple Developer Academy",
    description:
      "Digital product development and challenge-based learning bring the people using technology into focus.",
    status: "Supplied education history",
  },
  {
    id: "research",
    title: "Research practice",
    date: "2024",
    organization: "University of Naples Federico II",
    description:
      "A university research internship. Exact dates, research questions and approved outcomes have not yet been supplied.",
    status: "Detailed project description pending",
  },
  {
    id: "design",
    title: "Applied exploration",
    date: "2024",
    organization: "Italdesign / Ideneers Academy",
    description:
      "An applied learning experience. Approved project details and exact dates have not yet been supplied.",
    status: "Detailed project description pending",
  },
  {
    id: "personal-projects",
    title: "Personal projects",
    date: "To be added",
    organization: "Independent AI and software work",
    description:
      "This strand is reserved for owner-approved project names, descriptions, links, contributions and outcomes.",
    status: "Explicit content placeholder",
  },
];
export interface TimelineEntry {
  year: number;
  chapterId: string;
  title: string;
  description: string;
  date: string;
}
export const timelineEntries: TimelineEntry[] = [
  {
    year: 1999,
    chapterId: "origins",
    title: "The beginning",
    description: "Born in 1999. Origin: Hyderabad, India.",
    date: "1999",
  },
  {
    year: 2016,
    chapterId: "world",
    title: "Computer science begins",
    description:
      "BTech in Computer Science Engineering, Amity University · Three-Continental Program.",
    date: "2016–2020",
  },
  {
    year: 2019,
    chapterId: "world",
    title: "A.J. Drexel Autism Institute",
    description: "Website & Database Development Intern · Philadelphia.",
    date: "May–July 2019",
  },
  {
    year: 2020,
    chapterId: "world",
    title: "Undergraduate programme concludes",
    description:
      "The supplied BTech period ends in 2020. Birkbeck and Adelphi were associated study experiences.",
    date: "2016–2020",
  },
  {
    year: 2021,
    chapterId: "engineering",
    title: "Neuraflash",
    description: "Associate Salesforce Developer · Hyderabad.",
    date: "February 2021–August 2022",
  },
  {
    year: 2022,
    chapterId: "engineering",
    title: "Enterprise engineering chapter closes",
    description:
      "The Associate Salesforce Developer role at Neuraflash concludes.",
    date: "August 2022",
  },
  {
    year: 2022,
    chapterId: "reinvention",
    title: "A master’s in Naples",
    description:
      "MSc in Data Science at the University of Naples Federico II begins.",
    date: "September 2022–May 2025",
  },
  {
    year: 2023,
    chapterId: "reinvention",
    title: "Apple Developer Academy",
    description: "Digital product development and challenge-based learning.",
    date: "September 2023–June 2024",
  },
  {
    year: 2024,
    chapterId: "reinvention",
    title: "Research and applied learning",
    description:
      "University research internship and Italdesign / Ideneers Academy. Apple Developer Academy concludes in June.",
    date: "2024",
  },
  {
    year: 2024,
    chapterId: "public-service",
    title: "European Food Safety Authority",
    description: "Data Officer Trainee · Parma.",
    date: "November 2024–October 2025",
  },
  {
    year: 2025,
    chapterId: "reinvention",
    title: "MSc completed",
    description:
      "The supplied MSc in Data Science period at Naples Federico II concludes.",
    date: "May 2025",
  },
  {
    year: 2025,
    chapterId: "public-service",
    title: "EFSA traineeship concludes",
    description: "The Data Officer Trainee period ends in October.",
    date: "October 2025",
  },
  {
    year: 2025,
    chapterId: "united-nations",
    title: "The United Nations journey",
    description:
      "AI Engineer Intern · WFP · Integration & Investigative Technologies.",
    date: "October 2025–June 2026",
  },
  {
    year: 2026,
    chapterId: "united-nations",
    title: "WFP internship concludes",
    description: "The AI Engineer Intern period ends in June.",
    date: "June 2026",
  },
  {
    year: 2026,
    chapterId: "laboratory",
    title: "AI Consultant",
    description: "World Food Programme · Office of Inspector General.",
    date: "July 2026–present",
  },
];
export const getYearMilestones = (year: number): TimelineEntry[] =>
  timelineEntries.filter((entry) => entry.year === year);
export const labModules = [
  {
    id: "retrieval",
    number: "01",
    title: "Source-grounded retrieval",
    subtitle: "An answer with a route back to the evidence.",
    description:
      "Find a passage in a fictional handbook and inspect the exact source behind a prepared answer.",
    contribution:
      "Field of work: retrieval, information preparation, interfaces and integration in a team setting.",
  },
  {
    id: "analytics",
    number: "02",
    title: "Analytics & relationships",
    subtitle: "See the pattern. Inspect the connection.",
    description:
      "Filter an invented collection, compare counts and select the nodes in its source-linked relationship graph.",
    contribution:
      "Field of work: analytical views and data workflows developed with stakeholder input.",
  },
  {
    id: "forensics",
    number: "03",
    title: "Forensic chronology",
    subtitle: "A sequence is only useful with its context.",
    description:
      "Order fictional archive events and open the source text. Distinguish a recorded event from an inference.",
    contribution:
      "Field of work: parsing, normalisation, chronology and search preparation in multidisciplinary delivery.",
  },
  {
    id: "briefing",
    number: "04",
    title: "Briefing & documents",
    subtitle: "Prepare a draft. Keep every source visible.",
    description:
      "Assemble an inspectable, deterministic briefing from selected fictional documents, then review it.",
    contribution:
      "Field of work: document-oriented interfaces and workflow components. The demonstration is not an institutional application.",
  },
  {
    id: "agentic",
    number: "05",
    title: "Agentic workflows",
    subtitle: "Explicit steps. An explicit human gate.",
    description:
      "Advance a local state machine from preparation to review. No action can pass the simulated human approval gate on its own.",
    contribution:
      "Illustrative workflow design, not autonomous access or a claim about production capability.",
  },
  {
    id: "governance",
    number: "06",
    title: "Architecture & governance",
    subtitle: "Readiness is more than a working model.",
    description:
      "Check source traceability, scoped access and human oversight before enabling a simulated deployment.",
    contribution:
      "Illustrative architecture principles. Passing this exercise is not a security audit or production authorisation.",
  },
] as const;
