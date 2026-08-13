import { motion } from "framer-motion";
import "./Intro.css";

/**
 * A short statement between the hero and the work — the site opens on
 * the name and the reel, and this quietly says who made it before the
 * visitor starts exploring.
 *
 * Deliberately understated: small type, a lot of air around it, no
 * animation beyond a single fade as it comes into view. The environments
 * are what should hold attention, not this.
 */
export default function Intro() {
  return (
    <section className="intro" aria-label="Introduction">
      <motion.div
        className="intro__inner"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* The name and the role are the heading now; the "Biography"
            label above them was naming a section that introduces itself
            perfectly well. Broken over two lines because that is how a
            name and a job title are read — the words are unchanged. */}
        <h2 className="intro__name">
          Cameron Pouesi
          <span className="intro__role">Offline Editor</span>
        </h2>

        <p className="intro__statement">
          I'm an experienced Offline Editor working across television,
          documentary, advertising and digital content. With a background
          spanning reality and competition TV, comedy, children's programming,
          branded content and freelance projects, I bring a versatile approach
          to every edit.
        </p>

        <p className="intro__statement">
          Explore my work below, from broadcast series and documentaries to
          commercial campaigns, comedy and digital content.
        </p>
      </motion.div>
    </section>
  );
}
