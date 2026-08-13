// Pulls full PBR sets from Poly Haven (CC0).
//
// A colour map alone makes every surface behave like flat painted card —
// which is the single reason the hand-built environments never sat next
// to the photoscanned CRTs. `nor_gl` gives the surface its relief and
// `arm` packs ambient-occlusion / roughness / metalness into R / G / B,
// which is exactly how the CRT glTFs are already authored, so the whole
// site ends up on one material pipeline.
//
//   node fetch-textures.mjs concrete_wall_008 brick_wall_001 ...
import fs from "node:fs";
import path from "node:path";

const WANT = { Diffuse: "diff", nor_gl: "nor", arm: "arm" };
const RES = "2k";
const OUT = "public/textures/pbr";

async function grab(slug) {
  const res = await fetch(`https://api.polyhaven.com/files/${slug}`);
  if (!res.ok) throw new Error(`${slug}: ${res.status}`);
  const files = await res.json();

  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });

  for (const [key, short] of Object.entries(WANT)) {
    const url = files[key]?.[RES]?.jpg?.url;
    if (!url) {
      console.log(`  ${slug}: no ${key} at ${RES}`);
      continue;
    }
    const dest = path.join(dir, `${short}.jpg`);
    if (fs.existsSync(dest)) {
      console.log(`  have ${slug}/${short}.jpg`);
      continue;
    }
    const bin = Buffer.from(await (await fetch(url)).arrayBuffer());
    fs.writeFileSync(dest, bin);
    console.log(`  ${slug}/${short}.jpg  ${(bin.length / 1024) | 0}KB`);
  }
}

const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error("usage: node fetch-textures.mjs <slug> [slug...]");
  process.exit(1);
}
for (const s of slugs) {
  console.log(s);
  await grab(s);
}
