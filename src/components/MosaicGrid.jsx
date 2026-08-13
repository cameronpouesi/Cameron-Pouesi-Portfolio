import { motion } from "framer-motion";
import ProjectVideo from "./ProjectVideo";
import "./MosaicGrid.css";

// Deterministic size pattern so the grid reads as an editorial mosaic
// rather than a plain uniform grid, without needing manual per-project
// config. Cycles every 5 tiles.
const PATTERN = ["wide", "normal", "tall", "normal", "normal"];

function tileVariant(index) {
  return PATTERN[index % PATTERN.length];
}

export default function MosaicGrid({ projects, onExpand }) {
  if (projects.length === 0) return null;

  return (
    <div className="mosaic">
      {projects.map((project, i) => (
        <motion.div
          key={project.id}
          className={`mosaic-tile mosaic-tile--${tileVariant(i)}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.6,
            delay: Math.min((i % 6) * 0.06, 0.3),
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <ProjectVideo
            project={project}
            onExpand={onExpand}
            className="mosaic-tile__media"
            overlay={
              <span className="mosaic-tile__overlay">
                <span className="mosaic-tile__title">{project.title}</span>
                <span className="mosaic-tile__sub">
                  {[project.company, project.role].filter(Boolean).join(" · ")}
                </span>
              </span>
            }
          />
        </motion.div>
      ))}
    </div>
  );
}
