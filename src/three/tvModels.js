// Real photoscanned CRT televisions from Poly Haven (CC0 — no
// attribution required, commercial use permitted). Both models are a
// single mesh with baked-in wear: scratched bezels, smudged glass, worn
// knobs. That weathering is the whole point — it's what procedural
// geometry could never fake.
//
// Each model's own origin sits on its base (y = 0), so they stack
// naturally: place one at y = <height of the one below> and it rests on
// top with real contact.
//
// screen: the glass opening, in the model's own local space.
//
//   x, y   centre of the opening
//   w, h   its size
//   z      the glass at its most forward point
//
// These are measured, not estimated: the front of each mesh is
// rasterised to a depth map, the peak of the glass dome is found, and
// the fill spreads outward from it for as long as the surface keeps
// descending — the groove where the bezel begins stops it. Re-run that
// if either model is ever swapped out; guessing these is what put the
// picture on the bezel and floating in front of the tube.
//
// maxZoom: how far a picture may be pushed past "fit inside the glass"
// on this set before it stops.
//
// These tubes are roughly 4:3 and show artwork is 16:9, so something has
// to give: either a band of dead space above and below, or a slice off
// each side. Anything short of a full fill left a visible dark ring
// around every picture, which is exactly what the glass shouldn't have —
// so both sets fill completely. Nothing is stretched; the picture is
// scaled uniformly and the overhang is trimmed evenly from both sides,
// which for a 16:9 poster on a 1.31:1 tube costs about 13% per side.
//
// A single show whose title runs too near the edge can opt out with
// `artFit: "whole"` in projects.js rather than every set losing the fill.
const FILL = Infinity;

export const TV_MODELS = [
  {
    id: "television_01",
    url: "/models/Television_01/Television_01_2k.gltf",
    // bounding box from the glTF accessor
    size: { w: 0.6, h: 0.457, d: 0.471 },
    screen: {
      x: -0.0647,
      y: 0.2605,
      z: 0.1924,
      w: 0.3714,
      h: 0.2827,
    },
    maxZoom: FILL, // 1.31:1 glass
  },
  {
    id: "television_02",
    url: "/models/television_02/television_02_2k.gltf",
    size: { w: 0.4, h: 0.411, d: 0.35 },
    screen: {
      x: -0.0013,
      y: 0.258,
      z: 0.1219,
      w: 0.3106,
      h: 0.2353,
    },
    maxZoom: FILL, // 1.32:1 glass
  },
];

export const TV_MODEL_URLS = TV_MODELS.map((m) => m.url);
