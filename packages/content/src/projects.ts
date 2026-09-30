export type ProjectLinkKind = "web" | "github" | "store";

export type Project = {
  title: string;
  description: string;
  url: string;
  homepage?: { url: string; label: string; kind: ProjectLinkKind };
  languages: string[];
  topics: string[];
};

export const projects: Project[] = [
  {
    title: "Tabby",
    description:
      "A WXT browser extension for organizing tabs into draggable workspace groups, with IndexedDB persistence, keyboard shortcuts, and a custom React dashboard UI.",
    url: "https://github.com/lmdevv/tabby-deprecated",
    languages: ["TypeScript", "React", "Vite", "Tailwind"],
    topics: ["wxt", "indexeddb", "hotkeys"],
  },
  {
    title: "Openpilot Website",
    description:
      "A searchable vehicle compatibility database with URL-synced filters, make/year sorting, feature badges, and parsed support metadata generated from Openpilot vehicle data.",
    url: "https://github.com/lmdevv/openpilot-compatibility",
    homepage: {
      url: "https://openpilot-compatibility-web.vercel.app/",
      label: "Live Demo",
      kind: "web",
    },
    languages: ["TypeScript", "React", "Data Aggregation"],
    topics: ["tanstack-router", "data-parsing", "vehicle-data"],
  },
  {
    title: "The Scent Guide",
    description:
      "A fast, minimal fragrance review site comparing colognes and alternatives, optimized for SEO, advertising, affiliate links, and user behavior tracking.",
    url: "https://thescentguide.luismario.me/",
    languages: ["TypeScript", "Astro", "React", "Tailwind"],
    topics: ["seo", "adsense", "content-site"],
  },
  {
    title: "Movie Recommender System",
    description:
      "A MovieLens-powered recommender that searches movies, visualizes rating distributions, and returns similar titles through a Streamlit app backed by Python data processing.",
    url: "https://github.com/lmdevv/movie-recommendation-system",
    homepage: { url: "https://notflix.streamlit.app/", label: "Live Demo", kind: "web" },
    languages: ["Python", "Jupyter Notebook", "Streamlit"],
    topics: ["collaborative-filtering", "streamlit", "data-visualization", "movielens"],
  },
  {
    title: "Fragments",
    description:
      "A full-stack fragments service with a TypeScript Express API, React dashboard, AWS Cognito auth, S3/DynamoDB storage, content conversion, Docker, and integration tests.",
    url: "https://github.com/lmdevv/fragments",
    homepage: {
      url: "https://github.com/lmdevv/fragments-ui",
      label: "Frontend Repo",
      kind: "github",
    },
    languages: ["TypeScript", "React", "Express", "AWS Cognito"],
    topics: ["rest-api", "aws", "tdd"],
  },
  {
    title: "Y2K Hackathon",
    description:
      "A hackathon-built AI video generation app that turns chat prompts into educational ManimGL renders by orchestrating Convex actions, Daytona sandboxes, OpenCode agents, and Mux playback.",
    url: "https://github.com/lmdevv/y2k",
    languages: ["TypeScript", "React", "Convex", "Python"],
    topics: ["tanstack-start", "daytona", "opencode", "manim"],
  },
  {
    title: "Cover AI",
    description:
      "A Chrome extension that reads DOCX resumes, stores user preferences locally, uses Gemini to tailor cover letters to job descriptions, and exports polished Word documents.",
    url: "https://github.com/lmdevv/cover-ai",
    homepage: {
      url: "https://chromewebstore.google.com/detail/cover-ai/kjcafedikeandgbfhfnjkiimkhffhoco",
      label: "Chrome Web Store",
      kind: "store",
    },
    languages: ["TypeScript", "React", "Chrome APIs", "Gemini"],
    topics: ["gemini-api", "docx-generation", "browser-storage"],
  },
  {
    title: "Committer",
    description:
      "A Go CLI/TUI that reads staged Git diffs, calls OpenRouter for commit-message suggestions, supports simple or detailed output, and copies results to the clipboard.",
    url: "https://github.com/lmdevv/committer",
    languages: ["Go", "Shell", "Git", "Nix"],
    topics: ["bubble-tea", "cobra", "openrouter-api", "git-cli"],
  },
  {
    title: "Portfolio",
    description:
      "A personal portfolio and technical writing site built with Astro, React, and TailwindCSS to present projects, experience, articles, and contact links.",
    url: "https://github.com/lmdevv/portfolio",
    homepage: { url: "https://www.luismario.me/", label: "Live Demo", kind: "web" },
    languages: ["Astro", "React", "TailwindCSS"],
    topics: ["static-site", "personal-branding", "technical-writing"],
  },
];
