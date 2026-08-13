import { useCallback, useState } from "react";

/**
 * Tracks which project is under the cursor, for the credit card.
 *
 * The id check is the whole point. Moving straight from one object to
 * the next fires the new one's enter *before* the old one's leave, so a
 * naive "someone left, clear it" would wipe the credit that had just
 * appeared. Only the project currently being shown is allowed to clear
 * it.
 *
 * Returns the hovered project and the handler to pass to every
 * interactive object in the scene as `onHoverChange`.
 */
export default function useHoveredProject() {
  const [hoveredProject, setHoveredProject] = useState(null);

  const onHoverChange = useCallback((project, entering) => {
    setHoveredProject((prev) => {
      if (entering) return project;
      return prev && prev.id === project.id ? null : prev;
    });
  }, []);

  return [hoveredProject, onHoverChange];
}
