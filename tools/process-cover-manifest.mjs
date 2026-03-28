import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const tempDir = new URL("../src/content/blog/covers/_refresh_20260328/", import.meta.url);
const manifestPath = new URL("../src/content/blog/covers/_refresh_20260328/manifest.json", import.meta.url);
const attributionPath = new URL("../src/content/blog/covers/ATTRIBUTIONS.txt", import.meta.url);

const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

const lines = [
  "# Covers Attribution",
  "",
  "本轮封面通过 Openverse 检索、下载并统一裁切为站内使用的 `webp` 横图。",
  "",
];

for (const item of manifest) {
  const coverPath = new URL(`../src/content/blog/covers/${item.slug}-cover.webp`, import.meta.url);
  const ogPath = new URL(`../src/content/blog/covers/${item.slug}-og.webp`, import.meta.url);

  const buffer = await sharp(item.rawPath)
    .resize(1600, 900, {
      fit: "cover",
      position: "attention",
    })
    .webp({ quality: 84 })
    .toBuffer();

  await Promise.all([
    fs.writeFile(coverPath, buffer),
    fs.writeFile(ogPath, buffer),
  ]);

  lines.push(`## ${item.title} (${item.slug})`);
  lines.push(`- Search Query: ${item.query}`);
  lines.push(`- Source Title: ${item.sourceTitle || "Untitled"}`);
  lines.push(`- Creator: ${item.creator || "Unknown"}`);
  lines.push(`- License: ${item.license || "Unknown"}${item.licenseVersion ? ` ${item.licenseVersion}` : ""}`);
  lines.push(`- License URL: ${item.licenseUrl || "N/A"}`);
  lines.push(`- Landing URL: ${item.landingUrl || "N/A"}`);
  lines.push(`- Original URL: ${item.originalUrl}`);
  lines.push("");

  console.log(`Processed ${item.slug}`);
}

await fs.writeFile(attributionPath, lines.join("\n"), "utf8");
await fs.rm(tempDir, { recursive: true, force: true });

console.log(`Wrote attribution file to ${fileURLToPath(attributionPath)}`);
