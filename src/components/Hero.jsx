import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import "./Hero.css";

const REEL_SRC = "/video/reel-bg.mp4";

export default function Hero() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, prefersReducedMotion ? 0 : 120]
  );
  const videoScale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, prefersReducedMotion ? 1 : 1.15]
  );
  const videoOpacity = useTransform(scrollYProgress, [0, 0.85], [0.55, 0]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleReady = () => setVideoReady(true);
    video.addEventListener("loadeddata", handleReady);
    video.play().catch(() => {});
    return () => video.removeEventListener("loadeddata", handleReady);
  }, []);

  return (
    <section className="hero" ref={sectionRef}>
      <motion.div
        className="hero__media"
        style={{ scale: videoScale, opacity: videoOpacity }}
      >
        <video
          ref={videoRef}
          className={`hero__video ${videoReady ? "is-ready" : ""}`}
          src={REEL_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="hero__scrim" />
        <div className="hero__vignette" />
      </motion.div>

      <motion.div
        className="hero__content"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <motion.p
          className="eyebrow hero__eyebrow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Offline Video Editor
        </motion.p>

        <motion.h1
          className="hero__name"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          Cameron Pouesi
        </motion.h1>

        <motion.p
          className="hero__tagline"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          Cutting stories. Shaping moments.
        </motion.p>
      </motion.div>

      <motion.div
        className="hero__scroll-cue"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        style={{ opacity: contentOpacity }}
      >
        <span className="hero__scroll-line" />
        <span className="hero__scroll-label">Scroll</span>
      </motion.div>
    </section>
  );
}
