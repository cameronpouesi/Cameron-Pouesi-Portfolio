import { useMemo } from "react";
import CreditList from "./CreditList";
import StageScene from "./StageScene";
import ShowInfoCard from "../three/ShowInfoCard";
import useHoveredProject from "../three/useHoveredProject";
import { CATEGORY_INTROS, isPortrait, projectsByCategory } from "../data/projects";
import "./ShowcaseScene.css";

// Every plate is 16:9, so a landscape piece is as tall in percent as it
// is wide, and a portrait one is 3.16x taller. Deriving it keeps the
// artwork's own shape intact wherever it is placed.
const heightPct = (widthPct, portrait) => widthPct * (portrait ? 3.16 : 1);

/* ------------------------------------------------------------------ */
/* Comedy                                                              */
/* ------------------------------------------------------------------ */
// The mic sits at 45% and the stool at 55%. Both pieces are kept off
// that middle so the two objects, and the small pool of light they
// stand in, still read between the pictures floating in front of them.
// Measured against the cropped plate: the empty black above the mic was
// trimmed off the artwork rather than tuned out in CSS, which is what
// was holding the scene so far below its own heading.
const COMEDY_SPOTS = [
  { x: 24, y: 31, w: 34, rotate: -0.8 },
  { x: 74, y: 48, w: 34, rotate: 0.7 },
];

/* ------------------------------------------------------------------ */
/* Advertising                                                         */
/* ------------------------------------------------------------------ */
const AD_GAP = 2;
const AD_ROTATE = [-1.5, 1.2, -0.9, 1.6];
const AD_Y = [46, 44, 48, 45];

function advertisingSpots(items) {
  const widths = items.map((p) => (isPortrait(p) ? 12.5 : 21));
  const total = widths.reduce((a, b) => a + b, 0) + AD_GAP * (widths.length - 1);
  let x = 50 - total / 2;

  return widths.map((w, i) => {
    const spot = { x: x + w / 2, y: AD_Y[i % AD_Y.length], w, rotate: AD_ROTATE[i % AD_ROTATE.length] };
    x += w + AD_GAP;
    return spot;
  });
}

/**
 * The wall behind the advertising work: the same campaigns, pasted over
 * and over and half torn back, the way a real bill-posting wall is
 * nothing but its own history.
 *
 * These are copies of the section's own thumbnails — no new artwork, and
 * nothing here is interactive. They are knocked a long way back in
 * `.poster-wall__sheet` so they read as texture; the four real pieces
 * mounted on top are the only things in this scene that are the work.
 */
// The four campaigns in this section plus the commercial and promo work
// held elsewhere in the portfolio — music videos, brand films, gym and
// venue promos. Four sheets repeated twenty-six times reads as wallpaper
// however it is shuffled; this gives the wall enough different artwork
// to look like a wall. Nothing drawn from here is presented as an
// Advertising credit: it is unlabelled, knocked back, and the Full
// Credit List remains the only place a credit is ever stated.
const WALL_EXTRAS = new Set([
  "bramble-dark-and-stormy",
  "bramble-last-word",
  "hurtlocker-promo",
  "tiki-taane-live",
  "lime-after-lime",
  "unspoken-manu-vatuvei",
  "jessb-what-you-know-bout-me",
]);

function wallPool(items) {
  const extras = projectsByCategory("Freelance").filter((p) => WALL_EXTRAS.has(p.id));
  // Flat, not weighted. Doubling the section's four campaigns put them on
  // over half the wall, and seeing the same logo three times is exactly
  // the repetition this is meant to break up — the four live sheets
  // mounted on top are what keep the section's own work dominant.
  return [...items, ...extras];
}

function PosterWall({ items }) {
  const sheets = useMemo(() => {
    const pool = wallPool(items);
    if (pool.length === 0) return [];
    const rand = (i, n) => Math.abs(Math.sin((i + 1) * n) * 43758.5453) % 1;

    return Array.from({ length: 30 }, (_, i) => {
      // Strided rather than sequential, so the same artwork never lands
      // next to itself as the sheets are laid down.
      const project = pool[(i * 7 + (i % 3)) % pool.length];
      const portrait = isPortrait(project);
      const w = (portrait ? 8.5 : 15) * (0.75 + rand(i, 12.9898) * 0.75);
      const h = heightPct(w, portrait);
      // Spread across the wall and allowed to run past its edges — the
      // paste-up must not have a tidy border of its own.
      const x = -8 + rand(i, 78.233) * 112;
      const y = -6 + rand(i, 39.425) * 108;

      // How far this sheet's middle sits from the middle of the wall,
      // normalised. Fading each sheet by its own distance is what lets
      // the pile end in black without anything clipping it.
      const dx = (x + w / 2 - 50) / 50;
      const dy = (y + h / 2 - 50) / 50;
      const reach = Math.min(1, Math.hypot(dx, dy) / 1.35);

      return {
        key: i,
        src: project.thumbnail,
        w,
        h,
        x,
        y,
        rot: (rand(i, 21.7) - 0.5) * 13,
        op: (0.5 + rand(i, 9.13) * 0.5) * (1 - reach ** 1.5),
      };
    });
  }, [items]);

  return (
    <div className="poster-wall" aria-hidden="true">
      {sheets.map((s) => (
        <img
          key={s.key}
          className="poster-wall__sheet"
          src={s.src}
          alt=""
          loading="lazy"
          decoding="async"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.w}%`,
            height: `${s.h}%`,
            opacity: s.op,
            transform: `rotate(${s.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Children's TV                                                       */
/* ------------------------------------------------------------------ */
// The blank panel of the television, against the cropped plate.
const TV_SPOT = { x: 51.1, y: 33.1, w: 49.8, h: 55.3 };

const CHAPTERS = [
  {
    name: "Comedy",
    side: "right",
    plate: "/art/comedy-elements.webp",
    ratio: "1600 / 756",
    mount: "framed",
    glow: "radial-gradient(ellipse 24% 44% at 50% 64%, rgba(255,196,130,0.15), transparent 70%)",
    spotsFor: (items) => items.map((_, i) => COMEDY_SPOTS[i]),
  },
  {
    name: "Advertising",
    side: "left",
    plate: "/art/advertising-brick.webp",
    ratio: "16 / 9",
    mount: "pasted",
    // The brick is a hint, not a backdrop — it only has to say "wall".
    plateOpacity: 0.4,
    glow: "radial-gradient(ellipse 44% 40% at 50% 44%, rgba(188,204,236,0.09), transparent 72%)",
    spotsFor: advertisingSpots,
    Backdrop: PosterWall,
  },
  {
    name: "Children's TV",
    side: "right",
    plate: "/art/childrens-elements.webp",
    ratio: "1600 / 810",
    // The floor fills the bottom fifth of this plate and was ending in a
    // hard line across the frame. It starts falling away as soon as it
    // passes behind the unit, so the room bottoms out in black.
    plateFade: "linear-gradient(to bottom, #000 74%, rgba(0,0,0,0.5) 89%, transparent 99%)",
    mount: "screen",
    glow: "radial-gradient(ellipse 38% 42% at 51% 42%, rgba(150,185,235,0.11), transparent 72%)",
    spotsFor: (items) => items.map(() => TV_SPOT),
  },
];

function Chapter({ name, side, plate, ratio, mount, glow, plateFade, plateOpacity, spotsFor, Backdrop, items, credits, onExpand }) {
  const [hoveredProject, onHoverChange] = useHoveredProject();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <section className={`chapter chapter--${side}`} id={slug}>
      {/* Full width and hard against the column's left edge, so this
          title lands in exactly the same place as "Reality TV" and
          "Documentaries" do. */}
      <div className="chapter__head">
        <h3 className="chapter__title">{name}</h3>
        <div className="chapter__meta">
          <span className="chapter__count">
            {credits.length} project{credits.length === 1 ? "" : "s"}
          </span>
          <CreditList category={name} items={credits} />
        </div>
        <p className="chapter__intro">{CATEGORY_INTROS[name]}</p>
      </div>

      <div className="chapter__room">
        <StageScene
          plate={plate}
          ratio={ratio}
          glow={glow}
          plateFade={plateFade}
          plateOpacity={plateOpacity}
          mount={mount}
          items={items}
          spots={spotsFor(items)}
          onExpand={onExpand}
          onHoverChange={onHoverChange}
        >
          {Backdrop && <Backdrop items={items} />}
        </StageScene>
      </div>

      <div className="chapter__card">
        <ShowInfoCard project={hoveredProject} />
      </div>
    </section>
  );
}

export default function ShowcaseScene({ byCategory, creditsByCategory, onExpand }) {
  return (
    <div className="showcase">
      {CHAPTERS.map((c) => (
        <Chapter
          key={c.name}
          {...c}
          items={byCategory[c.name] ?? []}
          credits={creditsByCategory?.[c.name] ?? byCategory[c.name] ?? []}
          onExpand={onExpand}
        />
      ))}
    </div>
  );
}
