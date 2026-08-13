// ============================================================================
// PREVIEW POOL
// ----------------------------------------------------------------------------
// Screens keep playing once woken, which is the point — a room should
// fill with light as the visitor works across it. But "once woken, never
// stopped" has no ceiling, and a browser does: every playing <video> holds
// a hardware decoder, and once they run out the newest videos silently
// fail to produce frames. A screen showing a stalled video texture is a
// black screen, which is the one thing that must never happen here.
//
// So playback is pooled. The most recently woken screens keep running;
// the oldest beyond the cap is put back to sleep and returns to its
// artwork. Nothing ever goes blank, and the wall still comes alive.
// ============================================================================

// Comfortably under any desktop limit, and far more than are ever on
// screen at once — the cap only bites if someone sweeps the whole wall.
const MAX_ACTIVE = 14;

const active = []; // least-recently-used first

export function acquire(el, onEvict) {
  const existing = active.findIndex((e) => e.el === el);
  if (existing !== -1) {
    // touch: move to the most-recent end
    active.push(active.splice(existing, 1)[0]);
    return;
  }

  active.push({ el, onEvict });

  while (active.length > MAX_ACTIVE) {
    const oldest = active.shift();
    try {
      oldest.el.pause();
    } catch {
      /* already gone */
    }
    oldest.onEvict?.();
  }
}

export function release(el) {
  const i = active.findIndex((e) => e.el === el);
  if (i !== -1) active.splice(i, 1);
}
