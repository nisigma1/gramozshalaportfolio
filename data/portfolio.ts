export type FocusArea = {
  title: string;
  description: string;
};

export type Experience = {
  period: string;
  organization: string;
  role: string;
  summary: string;
  details: readonly string[];
};

export type SkillGroup = {
  category: string;
  items: readonly string[];
};

export type Certification = {
  name: string;
  issuer: string;
  type: "Training" | "Recognition";
};

export const portfolio = {
  name: "Gramoz Shala",
  title: "Electronics, Automation & Robotics Student",
  headline: "Engineering ideas into systems that work.",
  heroText:
    "I am an Electrical and Computer Engineering student focused on electronics, automation, robotics, and technology-driven problem-solving.",
  about: {
    intro:
      "I study the systems behind modern technology—from sensors and processors to automation and robotics—and how their individual parts become useful, reliable solutions.",
    philosophy:
      "Volunteering, entrepreneurship, and communication have taught me to connect technical thinking with people, context, and practical impact.",
  },
  focusAreas: [
    {
      title: "Electronics",
      description: "Developing knowledge of components, circuits, and practical electronic systems.",
    },
    {
      title: "Automation",
      description: "Exploring how control logic can make processes more consistent and useful.",
    },
    {
      title: "Robotics",
      description: "Interested in the intersection of mechanics, electronics, and intelligent control.",
    },
    {
      title: "Sensors & hardware",
      description: "Learning how physical signals are measured, processed, and turned into action.",
    },
    {
      title: "Technology & innovation",
      description: "Looking for grounded ways technology can improve real experiences and systems.",
    },
    {
      title: "Problem-solving",
      description: "Breaking complex questions into clear, testable steps.",
    },
  ] satisfies readonly FocusArea[],
  education: {
    period: "2021—Present",
    institution: "Faculty of Electrical and Computer Engineering",
    program: "Electronics, Automation, and Robotics",
  },
  experience: [
    {
      period: "2020—2022",
      organization: "Student Initiative for Innovation",
      role: "Co-founder",
      summary:
        "Helped shape events, proposals, and communications for an initiative that reached up to 1,300 participants.",
      details: [
        "Organized events and wrote project proposals.",
        "Published organizational activities and supported event communication.",
        "Edited event video and photography.",
        "Supported planning for events with up to 1,300 participants.",
      ],
    },
    {
      period: "2021",
      organization: "RRITU Marketing",
      role: "Co-founder",
      summary:
        "Supported small and medium companies with social media services, digital communication, and content presentation.",
      details: [
        "Provided social media services for small and medium companies.",
        "Supported digital communication and content presentation.",
      ],
    },
    {
      period: "2017—2019",
      organization: "ELKOS ETC",
      role: "Household Electronics Salesperson",
      summary:
        "Helped customers understand household electronics while developing clear product communication skills.",
      details: [
        "Explained products including televisions, camera systems, and electric chargers.",
        "Developed customer communication and product presentation skills.",
      ],
    },
  ] satisfies readonly Experience[],
  metrics: [
    { value: 1300, suffix: "+", label: "Event participants" },
    { value: 2, suffix: "", label: "Co-founder roles" },
    { value: 6, suffix: "", label: "Certifications & recognitions" },
    { value: 2021, suffix: "", label: "Engineering studies since" },
  ],
  skills: [
    {
      category: "Communication",
      items: ["Public speaking", "Effective communication", "Client interaction"],
    },
    {
      category: "Organization",
      items: ["Project writing", "Event planning", "Event management"],
    },
    {
      category: "Digital & Creative",
      items: [
        "Photography",
        "Video/content editing",
        "Social media management",
      ],
    },
    {
      category: "Thinking",
      items: ["Problem-solving", "Critical thinking", "Technical curiosity"],
    },
  ] satisfies readonly SkillGroup[],
  certifications: [
    {
      name: "School of Entrepreneurship",
      issuer: "UP TO YOUTH, USAID",
      type: "Training",
    },
    {
      name: "Communication Training",
      issuer: "UP TO YOUTH, USAID",
      type: "Training",
    },
    {
      name: "Critical Thinking Training",
      issuer: "UP TO YOUTH, USAID",
      type: "Training",
    },
    {
      name: "Gender Equality and Social Inclusion",
      issuer: "UP TO YOUTH, USAID",
      type: "Training",
    },
    {
      name: "Public Speaking",
      issuer: "Creative Youth Group",
      type: "Training",
    },
    {
      name: "Volunteer of the Year 2019",
      issuer: "The Youth Assembly of Istog",
      type: "Recognition",
    },
  ] satisfies readonly Certification[],
  languages: [
    { language: "Albanian", proficiency: "Native" },
    { language: "English", proficiency: "B2" },
  ],
  contact: {
    email: "gramozshala03@gmail.com",
    phoneDisplay: "+383 48 570 674",
    phoneHref: "+38348570674",
  },
} as const;
