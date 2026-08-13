import * as THREE from "three";

// ============================================================================
// 35mm FILM
// ----------------------------------------------------------------------------
// The strip is generated rather than photographed, because it has to carry
// perforations at exactly the pitch the frames sit at. That means the
// surface maps have to be generated too — a colour map on its own leaves
// acetate behaving like flat card, which is precisely what made this
// section read as a diagram next to the photoscanned televisions.
//
// Three maps come out of one shared height field, so a scratch that shows
// in the colour also catches light and goes rough in the same place:
//
//   colour     base density, frame lines, edge printing
//   normal     Sobel of the height field — scratches, dust, emulsion tooth
//   roughness  glossy acetate, rough where it's scuffed
//
// Perforations are punched clean through the alpha of all three.
// ============================================================================

export const STRIP_MARGIN = 1.3;
export const FRAME_PITCH = 1.16;
const PX_PER_UNIT = 260;

export const CURL = 0.032;
export const WANDER = 0.022;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Deterministic per-strip randomness, so a given seed always wears the
 *  same way and hot reloads don't reshuffle the archive. */
function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Where the perforations fall. Shared by every map so they line up. */
function punch(ctx, w, h, frameW, frameH, frames, marginPx, u) {
  const perfW = u(frameW * 0.085);
  const perfH = u(frameH * 0.13);
  const perfR = perfW * 0.22;
  const inset = (marginPx - perfW) / 2;
  const n = frames * 4;

  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "#000";
  for (let i = 0; i < n; i++) {
    const y = (i + 0.5) * (h / n) - perfH / 2;
    roundRect(ctx, inset, y, perfW, perfH, perfR);
    ctx.fill();
    roundRect(ctx, w - inset - perfW, y, perfW, perfH, perfR);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}

/**
 * The wear on one length of film, as a greyscale height field.
 * 128 = flat. Lower is a gouge, higher is a raised speck of dust.
 */
function buildHeight(w, h, seed) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  const r = rng(seed + 7);

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, w, h);

  // Emulsion tooth — fine, dense, low amplitude.
  const img = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 128 + (Math.random() - 0.5) * 26;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
  }
  ctx.putImageData(img, 0, 0);

  // No lengthwise scratches. They are what real gate-worn film does, but
  // over a portfolio print they read as damage to the work rather than
  // character in the medium, and they run straight down the middle of
  // the picture. Removing them here takes them out of the colour, the
  // normal and the roughness in one go, since all three come off this
  // same height field.

  // Dust and grit sitting proud of the surface.
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(210,210,210,${0.25 + r() * 0.5})`;
    ctx.beginPath();
    ctx.arc(r() * w, r() * h, 0.4 + r() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  return ctx.getImageData(0, 0, w, h);
}

/** Sobel the height field into a tangent-space normal map. */
function heightToNormal(height, w, h, strength = 2.4) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  const out = ctx.createImageData(w, h);
  const at = (x, y) =>
    height.data[(Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))) * 4] / 255;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * w + x) * 4;
      out.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      out.data[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
      out.data[i + 2] = (1 / len) * 255;
      out.data[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  return { canvas: c, ctx };
}

/**
 * @param frameW  image width in world units
 * @param frameH  image height in world units
 * @param frames  how many frame windows down the strip
 * @param seed    varies wear and edge printing between strips
 */
export function makeFilmMaps(frameW, frameH, frames, seed = 0) {
  const stripW = frameW * STRIP_MARGIN;
  const stripH = frameH * FRAME_PITCH * frames;
  const W = Math.round(stripW * PX_PER_UNIT);
  const H = Math.round(stripH * PX_PER_UNIT);
  const u = (v) => v * PX_PER_UNIT;
  const marginPx = u((stripW - frameW) / 2);
  const r = rng(seed);

  // ---- colour ------------------------------------------------------------
  const cc = document.createElement("canvas");
  cc.width = W;
  cc.height = H;
  const ctx = cc.getContext("2d");

  // Acetate is warm and denser toward the edges where the emulsion carries.
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, "#120c08");
  grad.addColorStop(0.5, "#231913");
  grad.addColorStop(1, "#120c08");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // frame lines
  const pitchPx = H / frames;
  const framePx = u(frameH);
  ctx.strokeStyle = "rgba(255, 208, 160, 0.16)";
  ctx.lineWidth = Math.max(1, u(0.004));
  for (let i = 0; i < frames; i++) {
    ctx.strokeRect(marginPx, i * pitchPx + (pitchPx - framePx) / 2, u(frameW), framePx);
  }

  // latent-image edge printing up the margin
  ctx.save();
  ctx.translate(marginPx * 0.5, H * 0.5);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "rgba(255, 148, 52, 0.55)";
  ctx.font = `${Math.round(u(frameH * 0.062))}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`KODAK 5219   ${120 + ((seed * 37) % 60)}-${(seed % 9) + 1}A`, 0, 0);
  ctx.restore();

  // the wear, tinted into the colour so scratches read as bright acetate
  const height = buildHeight(W, H, seed);
  const wear = document.createElement("canvas");
  wear.width = W;
  wear.height = H;
  const wctx = wear.getContext("2d");
  const wimg = wctx.createImageData(W, H);
  for (let i = 0; i < height.data.length; i += 4) {
    const d = height.data[i] - 128;
    wimg.data[i] = 255;
    wimg.data[i + 1] = 232;
    wimg.data[i + 2] = 205;
    wimg.data[i + 3] = Math.max(0, Math.min(255, Math.abs(d) * 2.6));
  }
  wctx.putImageData(wimg, 0, 0);
  ctx.globalAlpha = 0.5;
  ctx.drawImage(wear, 0, 0);
  ctx.globalAlpha = 1;

  punch(ctx, W, H, frameW, frameH, frames, marginPx, u);

  // ---- normal ------------------------------------------------------------
  const { canvas: nc, ctx: nctx } = heightToNormal(height, W, H);
  punch(nctx, W, H, frameW, frameH, frames, marginPx, u);

  // ---- roughness ---------------------------------------------------------
  // Acetate is glossy; anywhere it's scuffed scatters.
  const rc = document.createElement("canvas");
  rc.width = W;
  rc.height = H;
  const rctx = rc.getContext("2d");
  const rimg = rctx.createImageData(W, H);
  for (let i = 0; i < height.data.length; i += 4) {
    const scuff = Math.abs(height.data[i] - 128) / 128;
    const v = 46 + scuff * 150 + r() * 6;
    rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = Math.min(255, v);
    rimg.data[i + 3] = 255;
  }
  rctx.putImageData(rimg, 0, 0);
  punch(rctx, W, H, frameW, frameH, frames, marginPx, u);

  const tex = (canvas, srgb) => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 8;
    return t;
  };

  return {
    map: tex(cc, true),
    normalMap: tex(nc, false),
    roughnessMap: tex(rc, false),
    stripW,
    stripH,
  };
}

/**
 * Height of the curled surface at a point on the strip.
 *
 * FilmStrip lays each frame onto this curve: the acetate cups *toward*
 * the viewer, so a frame left at z=0 ends up behind it and gets painted
 * over.
 */
export function surfaceZAt(xNorm, yNorm, curl = CURL, wander = WANDER) {
  const cup = (1 - xNorm * xNorm) * curl * (0.75 + 0.25 * Math.cos(yNorm * Math.PI));
  const drift = Math.sin(yNorm * Math.PI * 0.9) * wander;
  return cup + drift;
}

export function makeCurledGeometry(width, height, curl = CURL, wander = WANDER) {
  const geo = new THREE.PlaneGeometry(width, height, 16, 56);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / (width / 2);
    const y = pos.getY(i) / (height / 2);
    pos.setZ(i, surfaceZAt(x, y, curl, wander));
  }
  geo.computeVertexNormals();
  geo.computeTangents?.();
  return geo;
}

// Fine, static grain laid over the images. Built once and shared.
let grainTexture = null;
export function getGrainTexture() {
  if (grainTexture) return grainTexture;
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = 140 + Math.random() * 115;
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 5);
  grainTexture = tex;
  return tex;
}
