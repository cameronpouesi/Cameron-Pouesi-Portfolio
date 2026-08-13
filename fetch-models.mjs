// Pulls CC0 photoscanned models from Poly Haven, with their textures.
//
// A glTF from here arrives with its own diffuse / normal / ARM maps
// already wired into the material — the same authoring the CRT
// televisions use. Dropping one of these in place of a hand-built shape
// is the single biggest jump in realism available, because the wear is
// measured rather than invented.
//
//   node fetch-models.mjs bar_chair_round_01 desk_lamp_arm_01 ...
import fs from "node:fs";
import path from "node:path";

const RES = "1k"; // plenty: these props are small and mostly in shadow
const OUT = "public/models";

async function grab(slug) {
  const res = await fetch(`https://api.polyhaven.com/files/${slug}`);
  if (!res.ok) throw new Error(`${slug}: ${res.status}`);
  const files = await res.json();

  const entry = files.gltf?.[RES]?.gltf;
  if (!entry) {
    console.log(`  ${slug}: no ${RES} glTF`);
    return;
  }

  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });

  // the .gltf itself
  const main = path.join(dir, path.basename(entry.url));
  if (!fs.existsSync(main)) {
    fs.writeFileSync(main, Buffer.from(await (await fetch(entry.url)).arrayBuffer()));
  }

  // ...and everything it references, at the relative paths it expects
  for (const [rel, info] of Object.entries(entry.include ?? {})) {
    const dest = path.join(dir, rel);
    if (fs.existsSync(dest)) continue;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, Buffer.from(await (await fetch(info.url)).arrayBuffer()));
  }

  const bytes = fs
    .readdirSync(dir, { recursive: true })
    .map((f) => {
      const p = path.join(dir, f);
      return fs.statSync(p).isFile() ? fs.statSync(p).size : 0;
    })
    .reduce((a, b) => a + b, 0);
  console.log(`  ${slug}  ${(bytes / 1024) | 0}KB  ->  ${path.relative(OUT, main)}`);
}

const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error("usage: node fetch-models.mjs <slug> [slug...]");
  process.exit(1);
}
for (const s of slugs) {
  console.log(s);
  await grab(s);
}
