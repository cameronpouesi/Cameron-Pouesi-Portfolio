import { useRef } from "react";
import "./ProjectVideo.css";

/**
 * Preview-only video surface used inside project cards.
 * - type "local": muted loop that only plays on hover/focus — thumbnail
 *   shows at rest so titles/art stay readable at a glance.
 * - type "youtube": static thumbnail with a play affordance. The actual
 *   embed only loads once the user clicks through to the Lightbox.
 * - video === null: no preview clip yet, just the thumbnail. Still opens
 *   the Lightbox on click (as a plain enlarged image), no play button.
 * Clicking anywhere opens the fullscreen Lightbox (passed in via onExpand).
 */
export default function ProjectVideo({
  project,
  onExpand,
  className = "",
  overlay = null,
}) {
  const { video, thumbnail, title } = project;
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (!video || video.type !== "local") return;
    videoRef.current?.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    if (!video || video.type !== "local") return;
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  };

  return (
    <button
      type="button"
      className={`project-video ${className}`}
      onClick={() => onExpand(project)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={video ? `Play ${title}` : `View ${title}`}
    >
      {video?.type === "local" ? (
        <video
          ref={videoRef}
          className="project-video__el"
          src={video.src}
          poster={thumbnail}
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : video?.type === "youtube" ? (
        <div className="project-video__el project-video__thumb">
          <img
            src={thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
            alt=""
            loading="lazy"
          />
        </div>
      ) : (
        <div className="project-video__el project-video__thumb">
          <img src={thumbnail} alt="" loading="lazy" />
        </div>
      )}

      <span className="project-video__scrim" />

      {video && (
        <span className="project-video__play" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M8 5.5V18.5L19 12L8 5.5Z" fill="currentColor" />
          </svg>
        </span>
      )}

      {overlay}
    </button>
  );
}
