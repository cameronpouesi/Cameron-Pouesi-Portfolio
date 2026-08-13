import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StagePiece from "./StagePiece";
import ShowInfoCard from "../three/ShowInfoCard";
import RailNav from "../three/RailNav";
import useHoveredProject from "../three/useHoveredProject";
import { releaseOwner } from "../three/screenAudio";
import "./FreelanceScene.css";

const PER_VIEW = 3;
const PLATE = "/art/freelance-desk.webp";
const PLATE_RATIO = "16 / 9";
// Restrained on purpose: the plate already carries the light coming from
// behind the monitors, and this only has to extend it a little past the
// frame so the glow has somewhere to fall off into.
const GLOW =
  "radial-gradient(ellipse 30% 26% at 50% 38%, rgba(255,176,102,0.09), rgba(255,150,80,0.025) 55%, transparent 74%)";

/**
 * The three blank panels in the plate, as CSS rectangles.
 *
 * These are the panels' real rectangles, and the work fills each one
 * edge to edge. The previous version fitted a 16:9 box inside each
 * screen instead, which left a different amount of black around each
 * one and read as three pictures at three different sizes rather than
 * as three screens that are switched on.
 */
/**
 * The three panels, as the four-cornered shapes they actually are.
 *
 * The middle monitor is square to the camera, so its screen is a plain
 * rectangle. The outer two turn in by three or four degrees, which makes
 * each of them a trapezoid: the bottom edge slopes away toward the
 * outside of the frame, and the outer vertical edge is the taller of the
 * two because it is the nearer one.
 *
 * Fitting an upright rectangle into a shape like that is what made the
 * work look stuck on top of the monitors rather than playing in them —
 * the corners missed, and the eye reads a few pixels of mismatch at a
 * bezel as "that picture is floating". So the work is corner-pinned:
 * each panel is mapped onto its real quad, which is what a compositor
 * does to put a picture on a screen in a shot. A 16:9 frame landing on
 * these corners is exactly what a 16:9 image on that monitor looks like
 * from here.
 *
 * Corners run clockwise from the top left, in per cent of the plate, and
 * were read off the artwork after it was inset to 92% of its frame.
 */
const SCREENS = [
  {
    quad: [
      [11.19, 35.69],
      [34.59, 35.08],
      [34.59, 62.47],
      [11.19, 65.13],
    ],
  },
  {
    quad: [
      [35.05, 34.87],
      [62.65, 34.87],
      [62.65, 62.37],
      [35.05, 62.37],
    ],
  },
  {
    quad: [
      [63.23, 35.18],
      [87.84, 36.1],
      [87.84, 65.33],
      [63.23, 62.47],
    ],
  },
];

/**
 * The CSS transform that lands this element's own rectangle on a quad.
 *
 * Standard unit-square homography, then scaled into the element's pixel
 * box: the element is laid out at the full size of the plate, so its
 * content is composed in 16:9 and the matrix does the rest. Needs the
 * measured size because the perspective terms of a homography are in
 * units of 1/length and therefore don't survive being written as
 * percentages.
 */
function quadTransform(quad, w, h) {
  if (!w || !h) return null;
  const [p0, p1, p2, p3] = quad.map(([x, y]) => [(x / 100) * w, (y / 100) * h]);

  const dx1 = p1[0] - p2[0];
  const dx2 = p3[0] - p2[0];
  const dy1 = p1[1] - p2[1];
  const dy2 = p3[1] - p2[1];
  const sx = p0[0] - p1[0] + p2[0] - p3[0];
  const sy = p0[1] - p1[1] + p2[1] - p3[1];
  const den = dx1 * dy2 - dx2 * dy1;

  // A parallelogram has no perspective term; the middle screen is one.
  const g = den ? (sx * dy2 - dx2 * sy) / den : 0;
  const k = den ? (dx1 * sy - sx * dy1) / den : 0;

  const a = p1[0] - p0[0] + g * p1[0];
  const b = p3[0] - p0[0] + k * p3[0];
  const c = p0[0];
  const d = p1[1] - p0[1] + g * p1[1];
  const e = p3[1] - p0[1] + k * p3[1];
  const f = p0[1];

  // Column-major, and the u/v columns divided by the element's own size.
  return `matrix3d(${a / w},${d / w},0,${g / w},${b / h},${e / h},0,${k / h},0,0,1,0,${c},${f},0,1)`;
}

// The keyboard and mouse are part of the plate, not composited on top of
// it. Compositing them was an attempt to put specific hardware on the
// desk, and every version of it read as two objects pasted onto a
// photograph — the lighting, the contact shadows and the eye line never
// quite agreed with the room. The ones in the plate were rendered with
// it, so they agree with it by construction.

// Transform-only, so the browser composites it on the GPU and the videos
// inside carry on decoding untouched while it runs.
const slide = {
  enter: (dir) => ({ x: dir >= 0 ? "104%" : "-104%", opacity: 0 }),
  center: {
    x: "0%",
    opacity: 1,
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({
    x: dir >= 0 ? "-104%" : "104%",
    opacity: 0,
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function FreelanceScene({ items, onExpand }) {
  const [hoveredProject, onHoverChange] = useHoveredProject();
  const [[page, dir], setPage] = useState([0, 0]);
  const ref = useRef(null);
  const frameRef = useRef(null);
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const owner = useRef({}).current;

  // The corner-pin matrices are in pixels, so they have to be rebuilt
  // whenever the plate is resized.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setFrame((f) => (f.w === width && f.h === height ? f : { w: width, h: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pages = Math.max(1, Math.ceil(items.length / PER_VIEW));
  const first = page * PER_VIEW;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) releaseOwner(owner);
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      releaseOwner(owner);
    };
  }, [owner]);

  const go = (d) =>
    setPage(([p]) => {
      const next = Math.min(pages - 1, Math.max(0, p + d));
      return [next, d];
    });

  return (
    <div className="freelance-scene" ref={ref}>
      <div className="scene-rail">
        <div className="suite">
          <div
            className="suite__frame"
            ref={frameRef}
            style={{ aspectRatio: PLATE_RATIO }}
          >
            <motion.div
              className="suite__glow"
              style={{ background: GLOW }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.img
              className="suite__plate"
              src={PLATE}
              alt=""
              aria-hidden="true"
              decoding="async"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 1.15, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            />

            {SCREENS.map((screen, k) => {
              const project = items[first + k];
              const transform = quadTransform(screen.quad, frame.w, frame.h);
              return (
                <div
                  key={k}
                  className="suite__screen"
                  style={{
                    transform: transform || undefined,
                    visibility: transform ? "visible" : "hidden",
                  }}
                >
                  {/* The panel is the window; the work slides through it.
                      Clipping to the screen is what makes paging read as
                      the row of monitors scrolling rather than as three
                      pictures being swapped. */}
                  <AnimatePresence initial={false} custom={dir}>
                    {project && (
                      <motion.div
                        key={project.id}
                        className="suite__slot"
                        custom={dir}
                        variants={slide}
                        initial="enter"
                        animate="center"
                        exit="exit"
                      >
                        <StagePiece
                          project={project}
                          mount="screen"
                          owner={owner}
                          onExpand={onExpand}
                          onHoverChange={onHoverChange}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        <RailNav
          page={page}
          pages={pages}
          onGo={go}
          labels={{ prev: "Previous monitors", next: "More monitors" }}
        />
      </div>

      <ShowInfoCard project={hoveredProject} />
    </div>
  );
}
