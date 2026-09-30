export type ContactLink = {
  kind: "email" | "github" | "linkedin" | "x";
  label: string;
  href: string;
};

export const email = "luis.mario.agreda@outlook.com";

export const contact = {
  heading: "Let's Connect",
  intro:
    "Interested in working together or just want to chat? Reach out through any of the channels below.",
  email: { kind: "email", label: email, href: `mailto:${email}` } satisfies ContactLink,
  socials: [
    { kind: "github", label: "GitHub", href: "https://github.com/lmdevv" },
    { kind: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/luismarioagreda" },
    { kind: "x", label: "Twitter / X", href: "https://x.com/lmdev" },
  ] satisfies ContactLink[],
};
