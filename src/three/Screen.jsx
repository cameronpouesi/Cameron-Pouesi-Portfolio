import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { previewSrcFor } from "../data/projects";
import { claimAudio, releaseAudio } from "./screenAudio";
import { acquire, release } from "./previewPool";
import { SceneOwnerContext } from "./SceneOwnerContext";

// How long a playing video may go without delivering a new frame before
// we stop trusting it and put the artwork back.
const STALL_MS = 1500;

/**
 * How to sit a picture of one shape inside a frame of another.
 *
 * Starts from "the whole picture is visible and undistorted", then
 * closes the gap toward filling the frame by up to `maxZoom`. Nothing is
 * ever scaled non-uniformly, so nothing is ever squashed; the trade is
 * made between a little letterboxing and a little crop, and each caller
 * decides where its own limit sits.
 *
 *   quadX/quadY  fraction of the frame the picture covers
 *   cropX/cropY  fraction of the source that stays visible
 */
export function fitContent(mediaAspect, frameAspect, maxZoom = 1) {
  const ratio = (mediaAspect || 16 / 9) / frameAspect;
  const zoom = Math.min(maxZoom, Math.max(ratio, 1 / ratio));

  if (ratio > 1) {
    return {
      quadX: 1,
      quadY: Math.min(1, zoom / ratio),
      cropX: Math.min(1, 1 / zoom),
      cropY: 1,
    };
  }
  if (ratio < 1) {
    return {
      quadX: Math.min(1, zoom * ratio),
      quadY: 1,
      cropX: 1,
      cropY: Math.min(1, 1 / zoom),
    };
  }
  return { quadX: 1, quadY: 1, cropX: 1, cropY: 1 };
}

/**
 * A quad that samples only part of its texture.
 *
 * The crop lives in the geometry's UVs, not on the texture. That matters:
 * useTexture hands the *same* texture object to every screen showing the
 * same artwork, so cropping via texture.repeat/offset means either
 * fighting over one object or cloning it per screen. Clones share their
 * underlying image source with the original, and the renderer de-dupes
 * GPU uploads by that source — which makes the lifetime of any one clone
 * everyone else's problem, and is the likeliest explanation for screens
 * going black at random.
 *
 * Baking the window into UVs sidesteps all of it: one shared texture,
 * never mutated, never cloned, nothing to invalidate.
 *
 * `nudgeX` slides the window without changing how much is shown —
 * positive moves the picture right on screen, which is how a show whose
 * title sits hard against one edge of its key art keeps that title while
 * every other show stays evenly cropped.
 */
function useCroppedPlane(width, height, cropX, cropY, nudgeX = 0) {
  return useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height);
    const maxU = 1 - cropX;
    const u0 = Math.min(maxU, Math.max(0, maxU / 2 - nudgeX));
    const v0 = (1 - cropY) / 2;
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, u0 + uv.getX(i) * cropX, v0 + uv.getY(i) * cropY);
    }
    uv.needsUpdate = true;
    return geo;
  }, [width, height, cropX, cropY, nudgeX]);
}

/**
 * A "screen" surface for any 3D object (TV, monitor, projector, etc).
 * Shows the project's artwork until it's first hovered, then lazily
 * creates a <video> element and swaps to a playing video texture.
 *
 * Once woken it stays awake — moving the cursor away doesn't stop the
 * picture, so a room fills with light as the visitor works across it
 * rather than going dark behind them. Only the screen currently under
 * the cursor is audible; see screenAudio.
 *
 * `maxZoom` controls how hard the picture is pushed toward filling the
 * screen — 1 letterboxes it whole, higher values trade a slim crop for
 * thinner bars. Whatever bars remain are washed with a dimmed copy of
 * the picture rather than left black, so a CRT reads as lit right to
 * the edge of its glass.
 *
 * YouTube-sourced projects can't be captured as a WebGL texture (cross
 * -origin embed restrictions), so they just show their artwork here;
 * the full video still plays when the viewer clicks through to the
 * Lightbox.
 */
export default function Screen({
  project,
  hovered,
  width,
  height,
  maxZoom = 1,
  // Start playing without waiting to be hovered. Used where the moving
  // picture *is* the point of the object — the frame under examination on
  // a film strip, which already has its stills either side of it.
  autoPlay = false,
}) {
  const thumbTexture = useTexture(project.thumbnail);
  thumbTexture.colorSpace = THREE.SRGBColorSpace;
  const videoTextureRef = useRef(null);
  const videoElRef = useRef(null);
  const [videoTexture, setVideoTexture] = useState(null);

  // The hover loop, not the full clip — see previewSrcFor. Null here
  // means there's simply nothing to play, and the artwork stays put.
  const previewSrc = previewSrcFor(project);
  const owner = useContext(SceneOwnerContext);

  useEffect(() => {
    if (!previewSrc || !(hovered || autoPlay)) return undefined;

    if (!videoElRef.current) {
      const v = document.createElement("video");
      v.src = previewSrc;
      // Silent to begin with: sound is handed out by screenAudio, and
      // muted autoplay is the only kind a browser will start unprompted.
      v.muted = true;
      v.volume = 0;
      v.loop = true;
      v.playsInline = true;
      v.preload = "auto";
      v.crossOrigin = "anonymous";
      videoElRef.current = v;
      const tex = new THREE.VideoTexture(v);
      tex.colorSpace = THREE.SRGBColorSpace;
      videoTextureRef.current = tex;
    }

    const v = videoElRef.current;
    const showArtwork = () => setVideoTexture(null);
    // Only ever reveal the video once it actually holds a frame —
    // swapping the texture any earlier paints black over the artwork.
    const showVideo = () => {
      if (v.readyState >= 2 && v.videoWidth > 0) setVideoTexture(videoTextureRef.current);
    };

    v.addEventListener("loadeddata", showVideo);
    v.addEventListener("playing", showVideo);
    // Anything that means "no more frames are coming" puts the still back
    // rather than leaving a dead video texture on screen.
    v.addEventListener("error", showArtwork);
    v.addEventListener("emptied", showArtwork);
    showVideo();

    // A decoder can also just quietly stop without firing anything, so
    // the clock is watched too: no progress, no video.
    let last = -1;
    let lastMoved = performance.now();
    const watchdog = setInterval(() => {
      if (v.paused) return;
      if (v.currentTime !== last) {
        last = v.currentTime;
        lastMoved = performance.now();
        showVideo();
      } else if (performance.now() - lastMoved > STALL_MS) {
        showArtwork();
      }
    }, 500);

    v.play().catch(showArtwork);
    // The pool exists to stop an unbounded sweep of hovers exhausting the
    // browser's decoders. Autoplaying screens are a fixed, known set, and
    // evicting one would drop it back to a still it can never leave — so
    // they aren't pooled.
    if (!autoPlay) acquire(v, showArtwork);

    // Sound follows the cursor, never autoplay. A screen that starts on
    // its own stays silent until it's actually pointed at, and a project
    // flagged silent never speaks at all.
    if (hovered && !project.silentPreview) claimAudio(v, owner);

    // Leaving hands the sound to whatever is hovered next; the picture
    // keeps running.
    return () => {
      clearInterval(watchdog);
      v.removeEventListener("loadeddata", showVideo);
      v.removeEventListener("playing", showVideo);
      v.removeEventListener("error", showArtwork);
      v.removeEventListener("emptied", showArtwork);
      releaseAudio(v);
    };
  }, [hovered, autoPlay, previewSrc, owner, project.silentPreview]);

  // Teardown, and *only* teardown — no destruction.
  //
  // This cleanup does not run solely on unmount. When the pile expands,
  // the newly added screens suspend on their artwork, React hides the
  // existing tree and destroys its effects, then re-creates them. The
  // component's state survives that; anything this function destroys
  // does not. Clearing the video's src here left screens rendering a
  // VideoTexture with no frames behind it — a black screen that never
  // recovered, which is exactly the blanking on "View All".
  //
  // So: hand back the audio and the pool slot, and stop there. The
  // element and its texture are cheap to keep and impossible to get
  // back once thrown away.
  useEffect(() => {
    return () => {
      const v = videoElRef.current;
      if (v) {
        releaseAudio(v);
        release(v);
      }
    };
  }, []);

  // Whatever tore the effects down, the picture comes back. If the
  // element lost its source it is re-pointed at it, and playback resumes
  // — a screen that has been woken stays awake.
  useEffect(() => {
    const v = videoElRef.current;
    if (!videoTexture || !v) return;
    if (!v.hasAttribute("src") && previewSrc) {
      v.src = previewSrc;
      v.load();
    }
    if (v.paused) v.play().catch(() => {});
  });

  // The last line of defence: a video texture is only ever shown while
  // the element behind it actually holds a frame. Anything else falls
  // back to the artwork, so no screen can go blank for any reason.
  const vidEl = videoElRef.current;
  const playing = Boolean(videoTexture) && (vidEl?.videoWidth ?? 0) > 0;
  const img = thumbTexture.image;
  const thumbAspect = img ? img.width / img.height : 16 / 9;
  const mediaAspect = playing ? vidEl.videoWidth / vidEl.videoHeight : thumbAspect;

  const frameAspect = width / height;
  const fit = fitContent(mediaAspect, frameAspect, maxZoom);
  const bars = fit.quadX < 0.995 || fit.quadY < 0.995;

  // The wash filling the bars is always the still, never the video: a
  // second copy of moving footage behind the picture is distracting,
  // a soft halo of its colours is not.
  const washFit = fitContent(thumbAspect, frameAspect, 99);
  const washPlane = useCroppedPlane(width, height, washFit.cropX, washFit.cropY);

  // Per-project only, for artwork whose title sits hard against an edge.
  const nudgeX = project.artOffsetX ?? 0;
  const picturePlane = useCroppedPlane(
    width * fit.quadX,
    height * fit.quadY,
    fit.cropX,
    fit.cropY,
    nudgeX
  );

  // Whichever source is live, drawn through the same window. Neither
  // texture is ever modified, so nothing here can disturb another screen
  // showing the same artwork.
  const picture = playing ? videoTexture : thumbTexture;

  // useMemo hands back a new geometry whenever the fit changes; the one
  // it replaces has to be released or every hover leaks a buffer.
  useEffect(() => () => washPlane.dispose(), [washPlane]);
  useEffect(() => () => picturePlane.dispose(), [picturePlane]);

  return (
    <group>
      {/* Backing. When the picture doesn't reach the edges, this is a
          dimmed, blown-up crop of the same artwork rather than a black
          void — the bars read as spill from the tube. */}
      <mesh position={[0, 0, -0.005]} geometry={bars ? washPlane : undefined}>
        {!bars && <planeGeometry args={[width, height]} />}
        {bars ? (
          <meshBasicMaterial map={thumbTexture} color="#2a2a30" toneMapped={false} />
        ) : (
          <meshBasicMaterial color="#000000" />
        )}
      </mesh>

      <mesh geometry={picturePlane}>
        <meshBasicMaterial map={picture} toneMapped={false} />
      </mesh>
    </group>
  );
}
