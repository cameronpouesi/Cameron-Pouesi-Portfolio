import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { hasRealDescription } from "../data/projects";
import { mediaUrl } from "../data/media";
import "./Lightbox.css";

/**
 * Fullscreen click-to-expand viewer. Renders either a local <video> with
 * native controls and sound, or a privacy-enhanced YouTube embed
 * (youtube-nocookie.com) with autoplay, once a project is passed in.
 * Pass `project={null}` to keep it mounted-but-closed.
 *
 * A project marked `silent` opens muted — see the field guide in
 * projects.js for when that applies.
 */
export default function Lightbox({ project, onClose }) {
  const videoRef = useRef(null);

  /**
   * Muting has to be done to the element, not in the markup.
   *
   * React does not reflect a `muted` prop onto the DOM property with any
   * reliability — it sets the attribute, which only supplies the initial
   * value and is ignored once the element exists. A video that opens
   * with sound when it was asked to be silent is the kind of bug you
   * only find by listening for it, so it is set here and asserted on
   * every open.
   */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = Boolean(project?.silent);
    if (project?.silent) v.volume = 0;
  }, [project]);

  useEffect(() => {
    if (!project) return;

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={onClose}
        >
          <motion.div
            className="lightbox__frame"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox__media">
              {project.video?.type === "local" ? (
                <video
                  ref={videoRef}
                  className="lightbox__video"
                  src={mediaUrl(project.video.src)}
                  poster={project.thumbnail}
                  controls
                  autoPlay
                  playsInline
                />
              ) : project.video?.type === "youtube" ? (
                <iframe
                  className="lightbox__video"
                  src={`https://www.youtube-nocookie.com/embed/${project.video.youtubeId}?autoplay=1&rel=0&modestbranding=1&color=white`}
                  title={project.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  className="lightbox__image"
                  src={project.thumbnail}
                  alt={project.title}
                />
              )}
            </div>

            <div className="lightbox__meta">
              <p className="eyebrow">{project.category}</p>
              <h3 className="lightbox__title">{project.title}</h3>

              {/* Credits also live here, not just on hover — touch
                  devices never get a hover state. */}
              {(project.company || project.role) && (
                <p className="lightbox__credit">
                  {project.company}
                  {project.company && project.role && " · "}
                  {project.role}
                </p>
              )}

              {/* Hidden until it says something — an unfilled field is
                  worse than no field. */}
              {hasRealDescription(project) && (
                <p className="lightbox__description">{project.description}</p>
              )}

              {/* The same badge the hover card carries. It was only ever
                  on hover, which meant the one number a viewer most wants
                  — the view count on the VLDL pieces — disappeared the
                  moment they opened the thing to watch it. Any project
                  with a tag shows it here; VLDL is just where it was
                  most obviously missing. */}
              {project.prestigeTag && (
                <span className="lightbox__tagrow">
                  <span className="lightbox__tag">{project.prestigeTag}</span>
                </span>
              )}

              {project.channels?.length > 0 && (
                <ul className="lightbox__channels">
                  {project.channels.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="button"
              className="lightbox__close"
              onClick={onClose}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
