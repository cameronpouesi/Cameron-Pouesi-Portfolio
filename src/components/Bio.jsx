import { useState } from "react";
import { motion } from "framer-motion";
import "./Bio.css";

const SOFTWARE = ["Avid Media Composer", "Adobe Premiere Pro", "Photoshop"];

const SKILLS = [
  "Story Structure",
  "Multicam Editing",
  "Documentary Assembly",
  "Reality TV Turnarounds",
  "Sound Design Passes",
  "Client Collaboration",
];

export default function Bio() {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="bio" id="bio">
      <div className="bio__grid">
        <motion.div
          className="bio__portrait"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Drop the portrait in at public/images/headshot.jpg and it
              appears here. Until it exists the initials stand in, so a
              missing file is never a broken image. */}
          {!imgError ? (
            <img
              src="/images/headshot.jpg"
              alt="Cameron Pouesi"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="bio__portrait-fallback" aria-hidden="true">
              CP
            </div>
          )}
        </motion.div>

        <motion.div
          className="bio__content"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow">About</p>
          <h2 className="bio__heading">Cameron Pouesi</h2>

          <p className="bio__text">
            I'm Cameron Pouesi, an Offline Editor with 10+ years' experience
            across broadcast TV, documentary, commercial and digital content.
            From reality and competition series to documentaries, promos, music
            videos and YouTube comedy, I've worked across a wide range of
            formats for leading production and post-production teams in New
            Zealand and internationally.
          </p>
          <p className="bio__text">
            Working across both Avid Media Composer and Adobe Premiere Pro, I
            bring a strong eye for story, pace and detail to every project. If
            you've got a project in the works, get in touch — I'd love to hear
            about it.
          </p>

          <div className="bio__lists">
            <div className="bio__list-block">
              <h4 className="bio__list-title">Software</h4>
              <ul className="bio__list">
                {SOFTWARE.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="bio__list-block">
              <h4 className="bio__list-title">Focus</h4>
              <ul className="bio__list">
                {SKILLS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Points at the file that is actually in /public/cv. Update
              both together: this is the only reference to it, so a
              renamed PDF breaks the button and nothing else complains. */}
          <a
            className="bio__cv"
            href="/cv/Cameron_Pouesi_CV_2026.pdf"
            download
          >
            Download CV
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 4V16M12 16L7 11M12 16L17 11M5 20H19"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
