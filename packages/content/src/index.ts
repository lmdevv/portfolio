export * from "./articles.ts";
export * from "./contact.ts";
export * from "./experience.ts";
export * from "./profile.ts";
export * from "./projects.ts";

export const pages = [
  { path: "/", label: "Home" },
  { path: "/projects", label: "Projects" },
  { path: "/experience", label: "Experience" },
  { path: "/blog", label: "Blog" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
] as const;
