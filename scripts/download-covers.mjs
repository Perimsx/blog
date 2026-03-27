import fs from 'fs';
import path from 'path';

const blogDir = path.join(process.cwd(), 'src/content/blog/');
const coversDir = path.join(process.cwd(), 'src/content/blog/covers/');

// Ensure directories exist
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

// Read markdown files
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
console.log(`Found ${files.length} articles to update covers for.`);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const basename = file.replace(/\.mdx?$/, '');
    const coverPath = path.join(coversDir, `${basename}-cover.webp`);
    const ogPath = path.join(coversDir, `${basename}-og.webp`);

    try {
      // Use Picsum to generate a stable 16:9 1920x1080 WebP image based on the article's name
      const url = `https://picsum.photos/seed/${basename}_16x9/1920/1080.webp`;
      process.stdout.write(`[${i+1}/${files.length}] Fetching ${url}... `);
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const buffer = Buffer.from(await res.arrayBuffer());

      // Save the cover image
      fs.writeFileSync(coverPath, buffer);
      
      // Use the exact same file for OG image
      fs.writeFileSync(ogPath, buffer);
      
      console.log(`Done.`);
    } catch (err) {
      console.error(`Error:`, err.message);
    }
    
    // Short delay to avoid rate limiting
    await delay(300);
  }
  console.log("✨ All covers have been updated and are strictly 16:9!");
}

main().catch(console.error);
