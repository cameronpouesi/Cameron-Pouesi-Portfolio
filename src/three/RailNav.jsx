import "./RailNav.css";

/**
 * Left/right navigation for an environment the camera tracks along.
 *
 * Shared by every room that runs off the sides of the frame, so moving
 * through the edit suite and moving through the film archive feel like
 * the same gesture rather than two different carousels.
 */
export default function RailNav({ page, pages, onGo, labels }) {
  if (pages <= 1) return null;

  return (
    <>
      <button
        type="button"
        className="rail-nav rail-nav--prev"
        onClick={() => onGo(-1)}
        disabled={page === 0}
        aria-label={labels?.prev ?? "Previous"}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5L8 12l7 7" />
        </svg>
      </button>

      <button
        type="button"
        className="rail-nav rail-nav--next"
        onClick={() => onGo(1)}
        disabled={page === pages - 1}
        aria-label={labels?.next ?? "More"}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="rail-progress" aria-hidden="true">
        {Array.from({ length: pages }).map((_, i) => (
          <span key={i} className={i === page ? "is-active" : ""} />
        ))}
      </div>
    </>
  );
}
