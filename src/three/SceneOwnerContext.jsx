import { createContext } from "react";

/**
 * Identifies the environment a screen belongs to.
 *
 * SceneCanvas puts a stable token in here; every screen inside claims the
 * site's audio under it. That's what lets a whole room hand the sound
 * back when it scrolls out of view, without a screen in some other room
 * losing its own.
 */
export const SceneOwnerContext = createContext(null);
