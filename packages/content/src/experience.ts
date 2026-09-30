export type Experience = {
  company: string;
  position: string;
  location: string;
  period: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
};

export const experiences: Experience[] = [
  {
    company: "Seneca Applied Research",
    position: "Research Assistant",
    location: "Toronto, Ontario, Canada · Hybrid",
    period: "2025 - 2025",
    description:
      "Led development on a system application for a printing company, building an agentic customer support pipeline using Python, UV, and LLMs to orchestrate email-based client support and schedule printing services.",
    responsibilities: [
      "Designed and developed an agentic system to handle customer support via email and delegate printing services.",
      "Built the application using Python and UV for dependency management and tooling.",
      "Integrated LLMs to orchestrate intelligent responses and service scheduling.",
      "Delivered a solution that streamlined client interactions and improved service turnaround.",
    ],
    technologies: ["Python", "UV", "LLMs", "FastAPI"],
  },
  {
    company: "Seneca Applied Research",
    position: "Research Assistant",
    location: "Toronto, Ontario, Canada · Hybrid",
    period: "2024 - 2025",
    description: "Developed scalable OCR pipelines and production-ready APIs for an insurance tech project.",
    responsibilities: [
      "Built an end-to-end OCR document parsing pipeline using PyTorch and transformer models.",
      "Processed 200-300 daily documents with a scalable architecture.",
      "Containerized the service using Docker Compose and Poetry for modular deployments.",
      "Exposed the solution via a FastAPI API with sub-second inference latency.",
      "Implemented coding standards using Ruff and Pylint for maintainability.",
      "Collaborated with researchers, faculty, and industry partners to deliver a production-ready prototype.",
    ],
    technologies: ["PyTorch", "Transformers", "FastAPI", "Docker", "Python"],
  },
  {
    company: "Mesons Technologies INC",
    position: "Software Engineer Intern",
    location: "Toronto, Canada",
    period: "2024",
    description: "Improved machine learning recommender systems and developed frontend features.",
    responsibilities: [
      "Developed ML models like linear regression, logistic regression, SVD, and Naive Bayes for recommendations.",
      "Performed advanced data analysis and cleaning for improved model performance.",
      "Optimized models using Bayesian optimization and evaluated with RMSE, precision@k, and recall@k.",
      "Built backup recommendation models to maintain quality under peak loads.",
      "Contributed to frontend development using React Native and Expo.",
    ],
    technologies: ["Python", "PyTorch", "React Native", "Expo"],
  },
  {
    company: "Seneca Polytechnic",
    position: "Computer Lab Assistant",
    location: "Toronto, Canada",
    period: "2024",
    description:
      "Provided academic support in labs, helping students grasp programming concepts and debug code.",
    responsibilities: [
      "Managed weekly lab sessions and provided guidance on programming exercises.",
      "Troubleshot 50+ student projects, reducing average debugging time by 25%.",
      "Improved student learning outcomes as measured by quiz performance.",
      "Created a focused and supportive learning environment.",
    ],
    technologies: ["C", "C++"],
  },
];
