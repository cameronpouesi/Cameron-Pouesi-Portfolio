import { useEffect, useState } from "react";

/** Mirrors the CSS prefers-reduced-motion handling already used
 * elsewhere on the site — idle/ambient 3D animation (sway, tumble, bob)
 * checks this and skips itself, while hover/click response still works. */
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
