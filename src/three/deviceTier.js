/**
 * Rough capability check used to decide how much render cost a device
 * should be asked to carry. Deliberately conservative — the penalty for
 * guessing "high end" wrongly is a scene that stutters or drains
 * battery; the penalty for guessing "low end" wrongly is slightly
 * softer post-processing.
 */
export function isLowEndDevice() {
  if (typeof navigator === "undefined") return false;
  const mem = navigator.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const coarsePointer =
    typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
  return Boolean((mem && mem <= 4) || (cores && cores <= 4 && coarsePointer));
}
