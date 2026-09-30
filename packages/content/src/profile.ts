/** Inline text where `{ strong }` segments are emphasized by each client. */
export type RichText = Array<string | { strong: string }>;

export type Profile = {
  name: string;
  firstName: string;
  middleName: string;
  lastName: string;
  role: string;
  location: { city: string; country: string };
  availableForWork: boolean;
  site: string;
  ssh: string;
  description: string;
  photo: { file: string; alt: string };
  bio: RichText[];
};

export const profile: Profile = {
  name: "Luis Mario Agreda",
  firstName: "Luis",
  middleName: "Mario",
  lastName: "Agreda",
  role: "Software Developer",
  location: { city: "Miami, Florida", country: "United States" },
  availableForWork: true,
  site: "https://luismario.me",
  ssh: "ssh portfolio@ssh.luismario.me",
  description:
    "Luis Mario Agreda is an aspiring Software Developer based in Miami, Florida. Focused on building scalable systems, AI-powered solutions, and full-stack applications.",
  photo: { file: "photo.jpg", alt: "Luis Mario Agreda" },
  bio: [
    [
      "Hi! I'm ",
      { strong: "Luis Mario Agreda" },
      ", an aspiring Software Developer based in ",
      { strong: "Miami, Florida" },
      ".",
    ],
    [
      "I'm on a mission to build amazing things, and accidentally create even more amazing bugs. " +
        "When I'm not coding, you'll catch me refactoring perfectly fine code just because it might be 0.1% more efficient. " +
        "I'm all about solving problems and turning cool ideas into real, working stuff.",
    ],
  ],
};
