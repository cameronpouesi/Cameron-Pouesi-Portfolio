import { useEffect, useRef, useState } from "react";
import { aspectFor, previewSrcFor } from "../data/projects";
import useProjectHover from "../three/useProjectHover";
import { claimAudio, releaseAudio } from "../three/screenAudio";
import { acquire, release } from "../three/previewPool";

/**
 * One piece of work, mounted into a 2D environment plate.
 *
 * The environments are photographs now rather than geometry, but the
 * behaviour they carry is the same one every room in this site has: the
 * artwork sits there until the cursor finds it, then the preview wakes
 * and keeps playing, and only the piece actually under the cursor is
 * allowed to be heard. That contract lives in `useProjectHover`,
 * `previewPool` and `screenAudio`, and all three are reused here
 * unchanged — this is a new way of drawing a room, not a new way of
 * behaving in one.
 *
 * `spot` places the piece in the plate's own coordinates: percentages of
 * the plate box, measured to the piece's centre. Keeping it proportional
 * is what lets the whole environment scale with the viewport without
 * anything drifting off the wall it is supposed to be stuck to.
 */
export default function StagePiece({
  project,
  spot,
  mount = "poster",
  owner,
  onExpand,
  onHoverChange,
}) {
  const [hovered, bind] = useProjectHover({ project, onExpand, onHoverChange });
  const [woken, setWoken] = useState(false);
  const videoRef = useRef(null);
  const previewSrc = previewSrcFor(project);

  // First hover wakes the preview; it then stays awake. A room the
  // visitor has worked across should stay alive behind them, and the
  // pool below is what stops that from being unbounded.
  useEffect(() => {
    if (hovered && previewSrc) setWoken(true);
  }, [hovered, previewSrc]);

  useEffect(() => {
    const v = videoRef.current;
    if (!woken || !v) return undefined;

    // Set imperatively rather than as JSX props, and silent *and at zero*
    // to begin with — the same way the 3D screens build theirs.
    //
    // screenAudio fades from wherever the element already is, so an
    // element sitting at React's default volume of 1 gets unmuted
    // straight to full the instant the cursor lands on it. A browser
    // answers unmuted playback it didn't sanction by pausing the video
    // outright, which is why the preview ran for about a second and then
    // stopped. Owning these here also keeps React from reconciling
    // `muted` back on top of a fade already in flight.
    v.muted = true;
    v.volume = 0;
    v.loop = true;
    v.playsInline = true;
    v.preload = "auto";

    v.play().catch(() => {
      /* autoplay refused; the artwork stays up, which is a fine outcome */
    });
    // Evicting puts this piece back to its artwork rather than leaving a
    // stalled decoder showing a black rectangle.
    acquire(v, () => setWoken(false));

    return () => {
      releaseAudio(v);
      release(v);
    };
  }, [woken]);

  // Audio follows the cursor, never the playback.
  useEffect(() => {
    const v = videoRef.current;
    if (!woken || !v) return undefined;
    if (hovered && !project.silent) claimAudio(v, owner);
    else releaseAudio(v);
    return undefined;
  }, [hovered, woken, owner, project.silent]);

  // Three ways a piece can be sized: filling whatever slot it has been
  // dropped into (a monitor on a carousel), by an explicit rectangle (a
  // television screen, which has to land exactly on the panel in the
  // photograph), or by width plus its own aspect (a poster on a wall).
  let style;
  if (!spot) {
    style = { inset: 0, width: "100%", height: "100%" };
  } else {
    style = {
      left: `${spot.x}%`,
      top: `${spot.y}%`,
      width: `${spot.w}%`,
      transform: `translate(-50%, -50%) rotate(${spot.rotate ?? 0}deg)`,
    };
    if (spot.h != null) style.height = `${spot.h}%`;
    else style.aspectRatio = String(aspectFor(project));
  }

  // The shared hover hook speaks `pointerover`/`pointerout` because it was
  // written for R3F, where those are the only pair there is. In the DOM
  // they also fire crossing between a node and its own children, so the
  // artwork/video swap inside this button would flicker the credit card.
  // Same logic, correct events.
  const { onPointerOver, onPointerOut, onClick } = bind;

  return (
    <button
      type="button"
      className={`stage-piece stage-piece--${mount}${hovered ? " is-hovered" : ""}`}
      style={style}
      aria-label={`${project.title} — open`}
      onPointerEnter={onPointerOver}
      onPointerLeave={onPointerOut}
      onFocus={onPointerOver}
      onBlur={onPointerOut}
      onClick={onClick}
    >
      <span className="stage-piece__art">
        <img src={project.thumbnail} alt={project.title} loading="lazy" decoding="async" />
        {woken && previewSrc && (
          <video ref={videoRef} className="stage-piece__video" src={previewSrc} />
        )}
      </span>
    </button>
  );
}
