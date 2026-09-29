import fs from "node:fs";
import { execSync } from "node:child_process";

// We can convert SVG to PNG using chrome/edge in headless screenshot mode!
const edgePaths = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];

const browserPath = edgePaths.find((p) => fs.existsSync(p));

if (!browserPath) {
  console.error("No Chromium browser found for rasterizing.");
  process.exit(1);
}

const svgPath = "file:///" + process.cwd().replace(/\\/g, "/") + "/public/og-image.svg";
const outputPath = process.cwd() + "/public/og-image.png";

console.log("Converting SVG to PNG using:", browserPath);
const cmd = `"${browserPath}" --headless --disable-gpu --screenshot="${outputPath}" --window-size=1200,630 --default-background-color=00000000 "${svgPath}"`;

execSync(cmd);

if (fs.existsSync(outputPath)) {
  const stats = fs.statSync(outputPath);
  console.log(`PNG created successfully: ${stats.size} bytes`);
} else {
  console.error("Failed to produce PNG.");
}
