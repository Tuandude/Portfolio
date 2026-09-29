import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicFontsDir = path.resolve(rootDir, "public", "fonts");

const fontsToCopy = [
  {
    src: path.resolve(
      rootDir,
      "node_modules",
      "@fontsource",
      "instrument-serif",
      "files",
      "instrument-serif-latin-400-italic.woff2"
    ),
    dest: path.resolve(publicFontsDir, "instrument-serif-latin-400-italic.woff2"),
  },
  {
    src: path.resolve(
      rootDir,
      "node_modules",
      "@fontsource-variable",
      "inter",
      "files",
      "inter-latin-wght-normal.woff2"
    ),
    dest: path.resolve(publicFontsDir, "inter-latin-wght-normal.woff2"),
  },
];

// Ensure public/fonts directory exists
if (!fs.existsSync(publicFontsDir)) {
  fs.mkdirSync(publicFontsDir, { recursive: true });
}

for (const { src, dest } of fontsToCopy) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${path.basename(src)} -> public/fonts/`);
  } else {
    console.warn(`Font file not found: ${src}`);
  }
}
