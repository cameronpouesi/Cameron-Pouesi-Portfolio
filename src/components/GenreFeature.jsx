import { motion } from "framer-motion";
import ProjectVideo from "./ProjectVideo";
import "./GenreFeature.css";

/**
 * The "hero" moment for a single genre section — one larger video/thumbnail
 * with the title burned into the media itself (poster-style), rather than a
 * separate text block below it. Keeps genre sections compact so a mosaic of
 * other thumbnails can follow immediately after.
 */
export default function GenreFeature({ project, onExpand }) {
  return (
    <motion.div
      className="genre-feature"
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <ProjectVideo
        project={project}
        onExpand={onExpand}
        className="genre-feature__media"
        overlay={
          <span className="genre-feature__overlay">
            <span className="eyebrow genre-feature__tag">
              Featured{project.company ? ` — ${project.company}` : ""}
            </span>
            <span className="genre-feature__title">{project.title}</span>
          </span>
        }
      />
    </motion.div>
  );
}
