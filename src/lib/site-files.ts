import path from "path";

// "@/..." maps to "src/..." in your project, so this should be src/site-content.json.
// Change it if your file lives somewhere else.
export const CONTENT_PATH = path.join(process.cwd(), "src", "data", "site-content.json");
export const FAVICON_PATH = path.join(process.cwd(), "src", "app", "favicon.ico");