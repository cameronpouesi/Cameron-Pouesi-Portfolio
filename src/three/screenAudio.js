// ============================================================================
// ONE SCREEN AT A TIME
// ----------------------------------------------------------------------------
// Every preview in the site plays silently. This decides which single one
// is allowed to be heard, and crossfades between them as the cursor moves
// from screen to screen — the one you leave keeps playing, it just stops
// being the thing you can hear.
//
// Nothing here ever pauses a video. Playback and audibility are separate
// concerns on purpose: a wall of screens should stay alive once it has
// been woken up.
// ============================================================================

// Handing over from one screen to another is a crossfade and wants time.
// The *first* screen has nothing to fade from, so a long ramp there just
// reads as the sound being late.
const FADE_IN_MS = 420;
const FIRST_FADE_IN_MS = 140;
const FADE_OUT_MS = 380;

// Browsers only allow sound after the visitor has actually interacted
// with the page — a hover doesn't count, and unmuting before then can
// get the video paused outright. So everything stays silent until the
// first real gesture, and simply never becomes audible if there isn't
// one. That's a fine outcome: silence is the safe failure.
let sawGesture = false;

// What the cursor was already sitting on when the visitor first clicked.
// Without this, hovering a screen *before* that first interaction would
// stay silent until the cursor moved to a different screen.
let pending = null;

/**
 * Whether the browser will currently let us make noise.
 *
 * `navigator.userActivation.hasBeenActive` is the authority, not our own
 * flag: it is true for *any* qualifying gesture in this document,
 * including ones that happened before this module was evaluated or that
 * our listeners never saw (touch, a key in a form, a click during code
 * splitting). Relying on a one-shot listener alone meant a visitor who
 * had already clicked elsewhere on the page still got a silent first
 * hover, and the sound appeared to arrive minutes later at some
 * unrelated moment.
 *
 * Hovering itself never qualifies anywhere. That part is not ours to
 * fix — but everything after the visitor's first click now is.
 */
function canPlayAudio() {
  if (typeof navigator !== "undefined" && navigator.userActivation) {
    return navigator.userActivation.hasBeenActive || sawGesture;
  }
  return sawGesture;
}

if (typeof document !== "undefined") {
  // Deliberately not `once`: cheap, and it keeps working if the first
  // gesture arrives by a route these two don't cover.
  const unlock = () => {
    sawGesture = true;
    if (pending) {
      const { el, owner } = pending;
      pending = null;
      claimAudio(el, owner);
    }
  };
  document.addEventListener("pointerdown", unlock, { passive: true });
  document.addEventListener("keydown", unlock);
  document.addEventListener("touchstart", unlock, { passive: true });
}

let active = null; // { el, owner }
const fades = new Map(); // el -> { from, to, start, dur }
let frame = 0;

const clamp01 = (v) => Math.max(0, Math.min(1, v));

function step() {
  const now = performance.now();
  let running = false;

  fades.forEach((fade, el) => {
    const p = fade.dur > 0 ? Math.min(1, (now - fade.start) / fade.dur) : 1;
    // ease-out, so a fade lands softly instead of arriving at full volume
    const eased = 1 - (1 - p) * (1 - p);
    const v = clamp01(fade.from + (fade.to - fade.from) * eased);
    el.volume = v;

    if (p >= 1) {
      // muting only at the end of the fade, never at the start of it
      if (fade.to === 0) el.muted = true;
      fades.delete(el);
    } else {
      running = true;
    }
  });

  frame = running ? requestAnimationFrame(step) : 0;
}

function fadeTo(el, to, dur) {
  // Always from where it is right now, so redirecting a fade mid-flight
  // continues from the current level instead of snapping.
  fades.set(el, { from: clamp01(el.volume), to, start: performance.now(), dur });
  if (!frame) frame = requestAnimationFrame(step);
}

/**
 * Hand the audio to this screen. Whatever was audible fades down and
 * carries on playing silently; this one fades up.
 *
 * `owner` is whatever the caller wants to identify its environment by —
 * releaseOwner() uses it to give the audio back when a whole room
 * scrolls out of view.
 */
export function claimAudio(el, owner = null) {
  if (!el) return;
  if (!canPlayAudio()) {
    // remembered, and honoured the instant the browser lets us
    pending = { el, owner };
    return;
  }
  if (active?.el === el) {
    active.owner = owner;
    return;
  }

  const handover = Boolean(active?.el && active.el !== el);
  if (handover) fadeTo(active.el, 0, FADE_OUT_MS);

  active = { el, owner };
  el.muted = false;
  fadeTo(el, 1, handover ? FADE_IN_MS : FIRST_FADE_IN_MS);
}

/** Give the audio back, if this screen still holds it. */
export function releaseAudio(el) {
  if (!el) return;
  if (pending?.el === el) pending = null;
  if (active?.el !== el) return;
  active = null;
  fadeTo(el, 0, FADE_OUT_MS);
}

/** Give the audio back if it belongs to this environment — used when a
 *  whole room leaves the viewport. */
export function releaseOwner(owner) {
  if (!owner || active?.owner !== owner) return;
  releaseAudio(active.el);
}

/** Silence whatever is playing, wherever it is. */
export function silenceAll() {
  if (active?.el) releaseAudio(active.el);
}

// Nothing should keep talking to an empty room.
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) silenceAll();
  });
}
