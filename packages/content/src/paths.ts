import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);

export const articlesDir = fileURLToPath(new URL("articles/", root));
export const draftsDir = fileURLToPath(new URL("drafts/", root));
export const assetsDir = fileURLToPath(new URL("assets/", root));
