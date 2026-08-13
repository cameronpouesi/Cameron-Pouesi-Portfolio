import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import StagePiece from "./StagePiece";
import { releaseOwner } from "../three/screenAudio";
import "./StageScene.css";

const PLATE_RATIO = "16 / 9";

const rise = {
  hidden: { opacity: 0 },
  shown: (delay) => ({
    opacity: 1,
    transition: { duration: 1.15, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

/**
 * A photographic environment with work mounted into it.
 *
 * The plates are photographed against pure black and composited with
 * `screen`, which is the whole trick and the thing a mask could never
 * do. Under `screen` a black pixel contributes nothing at all — so the
 * plate has no boundary, because outside the lit objects there is
 * literally nothing being drawn. Feathering the edge of an opaque
 * rectangle only ever produced a softer rectangle; you could still see
 * where the photograph stopped. This cannot show an edge, because there
 * is no edge to show.
 *
 * That is also why the plates are crushed to true zero before they ship
 * (see the build note in the art pipeline): a background sitting at RGB
 * 10 would screen to a faint but perfectly uniform grey rectangle, which
 * is the exact artefact being removed.
 *
 * The light, the set and the work then arrive in that order rather than
 * together, so the scene reads as objects emerging from the dark.
 */
export default function StageScene({
  plate,
  ratio = PLATE_RATIO,
  size = "inset",
  glow,
  plateFade,
  plateOpacity = 1,
  items,
  spots,
  mount,
  children,
  onExpand,
  onHoverChange,
}) {
  const ref = useRef(null);
  const owner = useRef({}).current;

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

  return (
    <div ref={ref} className={`stage stage--${size}`}>
      <div className="stage__frame" style={{ aspectRatio: ratio }}>
        {/* The light in the room, before anything it falls on. */}
        {glow && (
          <motion.div
            className="stage__glow"
            style={{ background: glow }}
            variants={rise}
            initial="hidden"
            whileInView="shown"
            custom={0}
            viewport={{ once: true, amount: 0.15 }}
          />
        )}

        <motion.img
          className="stage__plate"
          src={plate}
          alt=""
          aria-hidden="true"
          decoding="async"
          style={{ opacity: plateOpacity, ...(plateFade ? { "--plate-fade": plateFade } : null) }}
          variants={rise}
          initial="hidden"
          whileInView="shown"
          custom={0.18}
          viewport={{ once: true, amount: 0.15 }}
        />

        {children}

        {items.map((project, i) => {
          const spot = spots[i];
          if (!spot) return null;
          return (
            <motion.div
              key={project.id}
              className="stage__mount"
              variants={rise}
              initial="hidden"
              whileInView="shown"
              custom={0.34 + i * 0.09}
              viewport={{ once: true, amount: 0.15 }}
            >
              <StagePiece
                project={project}
                spot={spot}
                mount={mount}
                owner={owner}
                onExpand={onExpand}
                onHoverChange={onHoverChange}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
