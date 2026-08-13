import { useCallback, useState } from "react";

/**
 * The hover contract every interactive object in every environment
 * shares: it knows when it's under the cursor, it tells the scene which
 * project that is so the credit card can follow, and it opens the
 * lightbox when clicked.
 *
 * Having one of these rather than the same twenty lines in six
 * components is what makes the interaction feel identical from room to
 * room — including reporting *which* project is leaving, which the
 * credit card depends on to survive a move from one object straight to
 * the next.
 */
export default function useProjectHover({ project, onExpand, onHoverChange }) {
  const [hovered, setHovered] = useState(false);

  const set = useCallback(
    (entering) => {
      setHovered(entering);
      onHoverChange?.(project, entering);
      document.body.style.cursor = entering ? "pointer" : "default";
    },
    [project, onHoverChange]
  );

  const bind = {
    onPointerOver: (e) => {
      e.stopPropagation();
      set(true);
    },
    onPointerOut: (e) => {
      e.stopPropagation();
      set(false);
    },
    onClick: (e) => {
      e.stopPropagation();
      onExpand?.(project);
    },
  };

  return [hovered, bind];
}
