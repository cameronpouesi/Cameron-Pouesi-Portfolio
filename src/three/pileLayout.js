import { TV_MODELS } from "./tvModels";

// Cabinets sit this far apart — just enough that a set turned a couple
// of degrees off square doesn't clip its neighbour. Anything more reads
// as a shelf display rather than a pile.
const GAP = 0.035;
const ROW_SHRINK = 0.07;
const BASE_ROW_SCALE = 1.14;
const TALLEST = Math.max(...TV_MODELS.map((m) => m.size.h));

// How far a hovered set travels toward the viewer and how much it grows.
// The framing has to know, or the set nearest the top of the pile leaves
// the frame the moment someone points at it.
const HOVER_POP = 0.26;
const HOVER_SCALE = 1.06;

// Deterministic pseudo-random in [0,1) — stable across renders.
function hash(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * The shape of the opening arrangement: how many sets sit in each row,
 * bottom row first. Tapers upward so the pile reads as stacked rather
 * than shelved.
 */
function coreRows(n) {
  if (n <= 0) return [];
  if (n <= 3) return [n];
  if (n <= 6) {
    const bottom = Math.ceil(n / 2);
    return [bottom, n - bottom];
  }
  if (n <= 10) {
    const bottom = Math.ceil(n * 0.45);
    const middle = Math.ceil((n - bottom) * 0.62);
    return [bottom, middle, n - bottom - middle];
  }
  const bottom = Math.ceil(n * 0.34);
  const second = Math.ceil((n - bottom) * 0.45);
  const third = Math.ceil((n - bottom - second) * 0.6);
  return [bottom, second, third, n - bottom - second - third];
}

/**
 * Grows the opening arrangement to hold `total` sets.
 *
 * Rows only ever get wider and only ever get added — no row is allowed
 * to shrink — so every column the opening arrangement already occupies
 * stays occupied, at the same coordinates.
 */
function grownRows(total, core) {
  const counts = [...core];
  let left = total - counts.reduce((a, b) => a + b, 0);
  let guard = 0;

  while (left > 0 && guard++ < 500) {
    let placed = false;
    for (let r = 0; r < counts.length && left > 0; r++) {
      // the bottom row is free to widen; every row above stays at least
      // two narrower than the one it rests on, which keeps the taper
      const ceiling = r === 0 ? counts[0] + 1 : counts[r - 1] - 1;
      if (counts[r] < ceiling) {
        counts[r] += 1;
        left -= 1;
        placed = true;
      }
    }
    if (!placed) {
      counts.push(1);
      left -= 1;
    }
  }
  return counts;
}

/**
 * Which columns a row occupies, as lattice indices — xForColumn turns
 * these into coordinates.
 *
 * The first `base` entries are the opening arrangement, centred on zero.
 * Anything beyond that is appended alternately to the right and left, so
 * revealing more work extends the row outward while leaving every
 * original column exactly where it was.
 */
function columnsFor(base, total) {
  const cols = [];
  for (let i = 0; i < base; i++) cols.push(i - (base - 1) / 2);

  let hi = base > 0 ? cols[cols.length - 1] : -0.5;
  let lo = base > 0 ? cols[0] : 0.5;
  while (cols.length < total) {
    hi += 1;
    cols.push(hi);
    if (cols.length < total) {
      lo -= 1;
      cols.push(lo);
    }
  }
  return cols;
}

/**
 * Which cabinet stands in a given slot, and how big it is there.
 *
 * Both depend only on the row and the column — never on the contents of
 * the pile — which is what lets a column's coordinates be worked out in
 * isolation. Because it keys off |col|, the two halves of a row mirror
 * each other, so a row is centred without anything having to measure it.
 */
function columnIndex(col) {
  return Math.round(Math.abs(col) - (Number.isInteger(col) ? 0 : 0.5));
}

function modelFor(r, col) {
  return TV_MODELS[(columnIndex(col) + r) % TV_MODELS.length];
}

/** Every set in a row is brought to the same height, so the row above
 *  rests on a flat surface instead of on whichever cabinet happened to
 *  be tallest — no gaps, nothing floating. The models still differ in
 *  width and depth, which is where the variety in the pile comes from. */
function scaleFor(rowScale, model) {
  return rowScale * (TALLEST / model.size.h);
}

function widthAt(rowScale, r, col) {
  const model = modelFor(r, col);
  return model.size.w * scaleFor(rowScale, model);
}

/**
 * Where a column sits, measured by walking out from the middle of the
 * row one cabinet at a time.
 *
 * Spacing therefore follows the cabinets that are actually there rather
 * than a fixed pitch wide enough for the broadest of them — which is
 * what was leaving holes around the narrower set. And because the walk
 * only ever passes through columns *between* this one and the centre,
 * adding a column further out doesn't move it.
 */
function xForColumn(rowScale, r, col) {
  if (col === 0) return 0;
  const onHalfSteps = !Number.isInteger(col);
  const target = Math.abs(col);

  let k = onHalfSteps ? 0.5 : 0;
  // on a half-step lattice the two innermost sets straddle the middle
  let x = onHalfSteps ? widthAt(rowScale, r, 0.5) / 2 + GAP / 2 : 0;

  while (k < target) {
    x += widthAt(rowScale, r, k) / 2 + GAP + widthAt(rowScale, r, k + 1) / 2;
    k += 1;
  }
  return Math.sign(col) * x;
}

/**
 * Builds the pile.
 *
 * Returns one slot per visible television. The first `coreCount` slots
 * are the opening arrangement and are byte-for-byte identical whether
 * the section is collapsed or expanded — so revealing the rest of a
 * category doesn't shuffle anything, it only surrounds it.
 *
 * Each slot also carries where its television should come *from*: the
 * opening set rises gently out of the floor, while everything revealed
 * later slides in from beyond the edge of frame, as though it had been
 * standing in the dark just outside the shot the whole time.
 */
export function buildPile(total, coreCount) {
  const core = coreRows(Math.min(coreCount, total));
  const counts = grownRows(total, core);

  // row scale and y are fixed per row index, so a row's height never
  // depends on which televisions happen to be sitting in it
  const rows = counts.map((count, r) => {
    const rowScale = BASE_ROW_SCALE - r * ROW_SHRINK;
    return { count, base: core[r] ?? 0, rowScale, r };
  });

  let y = 0;
  rows.forEach((row) => {
    row.y = y;
    y += TALLEST * row.rowScale * 0.995; // a hair of overlap = real contact
  });

  const coreSlots = [];
  const extraSlots = [];

  rows.forEach((row) => {
    const cols = columnsFor(row.base, row.count);
    cols.forEach((col, i) => {
      const seed = row.r * 97 + Math.round((col + 8) * 13);
      const model = modelFor(row.r, col);
      const m = TV_MODELS.indexOf(model);
      const scale = scaleFor(row.rowScale, model);
      const isCore = i < row.base;

      // Only depth is jittered, and only slightly. Nudging x as well
      // reopens the gaps the tight packing just closed.
      const pos = [
        xForColumn(row.rowScale, row.r, col),
        row.y,
        (hash(seed * 3.7) - 0.5) * 0.18,
      ];

      // Sets already on screen barely stir; the rest arrive from off
      // frame, travelling inward along the direction they're headed.
      const outward = col === 0 ? (hash(seed) > 0.5 ? 1 : -1) : Math.sign(col);
      const from = isCore
        ? [pos[0], pos[1] - 0.55, pos[2] - 0.4]
        : [pos[0] + outward * (2.6 + Math.abs(col) * 0.5), pos[1] + row.r * 0.25, pos[2] - 0.5];

      (isCore ? coreSlots : extraSlots).push({
        m,
        pos,
        from,
        // a couple of degrees off square — enough to look set down by
        // hand, small enough that neighbours never clip at this spacing
        rotY: (hash(seed * 2.3) - 0.5) * 0.1,
        scale,
        w: model.size.w * scale,
        h: model.size.h * scale,
        // Core sets settle first and fastest; the newcomers drift in
        // behind them, outermost last, so the pile widens in a wave.
        delay: isCore
          ? 0.05 * Math.abs(col) + row.r * 0.06
          : 0.18 + 0.09 * Math.abs(col) + row.r * 0.05,
      });
    });
  });

  return [...coreSlots, ...extraSlots];
}

// A little air around the pile once everything else has been accounted
// for. Small, because the measurements below are already worst-case.
const FRAME_MARGIN = 1.07;
const REFERENCE_ASPECT = 16 / 9;

/**
 * Frames the camera on whatever the pile currently is, so the shot stays
 * composed no matter how many shows there are — and expanding a category
 * reads as the camera quietly pulling back.
 *
 * The bounds are measured with every set *hovered*: grown by
 * HOVER_SCALE, and fitted at the closest depth anything can reach rather
 * than at the origin. A set that pops toward the viewer covers more of
 * the frame than one sitting still, and framing the resting pile is what
 * was letting the top row leave the picture the moment it was pointed at.
 */
export function framePile(slots, fov) {
  if (!slots.length) return { position: [0, 1, 6], fov };

  let minX = Infinity;
  let maxX = -Infinity;
  let maxY = 0;
  let maxZ = -Infinity;
  slots.forEach((s) => {
    minX = Math.min(minX, s.pos[0] - (s.w / 2) * HOVER_SCALE);
    maxX = Math.max(maxX, s.pos[0] + (s.w / 2) * HOVER_SCALE);
    maxY = Math.max(maxY, s.pos[1] + s.h * HOVER_SCALE);
    maxZ = Math.max(maxZ, s.pos[2]);
  });

  const halfW = ((maxX - minX) / 2) * FRAME_MARGIN;
  const halfH = (maxY / 2) * FRAME_MARGIN;
  const tanHalfFov = Math.tan((fov * Math.PI) / 180 / 2);

  // Fit both axes at the reference aspect. SceneCanvas widens the
  // vertical fov on narrower screens, which only ever reveals more, so
  // fitting here keeps every screen shape safe.
  const distance = Math.max(
    halfH / tanHalfFov,
    halfW / (tanHalfFov * REFERENCE_ASPECT)
  );

  return {
    // measured from the frontmost plane a hovered set can occupy
    position: [(minX + maxX) / 2, maxY / 2, maxZ + HOVER_POP + distance],
    fov,
  };
}
