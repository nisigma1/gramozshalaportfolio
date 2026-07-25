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
    "Electrical and Computer Engineering student focused on electronics, automation, robotics, and practical technology-driven problem-solving.",
  about: {
    statement:
      "I am interested in the point where information becomes action.",
    intro:
      "From the way sensors collect information to how processors interpret it, I want to understand how complete technical systems work—not only their individual parts.",
    perspective:
      "Volunteering, entrepreneurship, communication, and event organization complement my technical education with a practical, people-focused perspective.",
  },
  focusAreas: [
    {
      title: "Electronics",
      description:
        "Understanding components, circuits, and the hardware that makes modern systems possible.",
    },
    {
      title: "Automation",
      description:
        "Exploring how control logic turns repeatable processes into reliable outcomes.",
    },
    {
      title: "Robotics",
      description:
        "Connecting mechanics, electronics, sensing, and control into purposeful machines.",
    },
    {
      title: "Sensors & hardware",
      description:
        "Learning how physical signals are measured, processed, and converted into action.",
    },
    {
      title: "Technology & innovation",
      description:
        "Looking for grounded ways technology can improve real experiences and systems.",
    },
    {
      title: "Problem-solving",
      description:
        "Breaking complex questions into clear, testable, and practical steps.",
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
        "Supported the initiative through project writing, event organization, and public communication.",
      details: [
        "Organized events and wrote project proposals.",
        "Published organizational activities and supported event communication.",
        "Edited video and photography from the organization’s events.",
      ],
    },
    {
      period: "2021",
      organization: "RRITU Marketing",
      role: "Co-founder",
      summary:
        "Helped offer social media services for small and medium-sized companies.",
      details: [
        "Supported digital communication and content presentation.",
        "Worked with companies on their social media presence.",
      ],
    },
    {
      period: "2017—2019",
      organization: "ELKOS ETC",
      role: "Household Electronics Salesperson",
      summary:
        "Helped customers understand household electronics through clear product communication.",
      details: [
        "Explained products including televisions, camera systems, and electric chargers.",
        "Developed customer communication and product presentation skills.",
      ],
    },
  ] satisfies readonly Experience[],
  skills: [
    {
      category: "Communication",
      items: ["Public speaking", "Project writing"],
    },
    {
      category: "Organization",
      items: ["Event planning and management", "Problem-solving"],
    },
    {
      category: "Creative & digital",
      items: ["Photography", "Social media management"],
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
