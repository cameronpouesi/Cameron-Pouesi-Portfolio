import { motion } from "framer-motion";
import {
  CATEGORIES,
  CATEGORY_INTROS,
  projectsByCategory,
  showcaseProjects,
} from "../data/projects";
import CreditList from "./CreditList";
import GenreFeature from "./GenreFeature";
import MosaicGrid from "./MosaicGrid";
import RealityTVScene from "../three/RealityTVScene";
import DocumentaryScene from "../three/DocumentaryScene";
import FreelanceScene from "./FreelanceScene";
import ShowcaseScene from "./ShowcaseScene";
import "./CategoryGallery.css";

// Categories with a fully realized 3D environment. Anything not listed
// here falls back to the 2D genre-banner + mosaic treatment until its
// environment is built (or if it never gets one, that's fine too).
const ENVIRONMENTS = {
  "Reality TV": RealityTVScene,
  Documentaries: DocumentaryScene,
  Freelance: FreelanceScene,
};

// These three share one room — see ShowcaseScene. They keep their own
// headings and copy, but they're chapters of a single space rather than
// three environments the visitor has to arrive at separately, and
// together they take up less of the page than any one of them did.
const SHOWCASE = ["Comedy", "Advertising", "Children's TV"];

/** The heading block above an environment: title, count, and a line of
 *  copy setting up the room. Kept quiet so the environment stays the
 *  loudest thing on screen. */
function SectionHeader({ category, items }) {
  const intro = CATEGORY_INTROS[category];
  const count = items.length;
  return (
    <motion.div
      className="category-section__header"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="category-section__title-row">
        <h3 className="category-section__title">{category}</h3>
        <div className="category-section__meta">
          <span className="category-section__count">
            {count} project{count > 1 ? "s" : ""}
          </span>
          <CreditList category={category} items={items} />
        </div>
      </div>
      {intro && <p className="category-section__intro">{intro}</p>}
    </motion.div>
  );
}

function CategorySection({ category, onExpand }) {
  // The credit list gets everything; the environment only gets what it
  // has artwork for. Anything credit-only would otherwise show up as a
  // blank screen in the middle of a room.
  const credits = projectsByCategory(category);
  const items = showcaseProjects(category);
  if (credits.length === 0) return null;

  const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const Environment3D = ENVIRONMENTS[category];

  if (Environment3D) {
    return (
      <div className="category-section category-section--env" id={slug}>
        <SectionHeader category={category} items={credits} />
        <Environment3D items={items} onExpand={onExpand} />
      </div>
    );
  }

  // The genre's "hero" pick: whichever project is marked featured, or
  // just the first one in the list if none are.
  const feature = items.find((p) => p.featured) || items[0];
  const rest = items.filter((p) => p.id !== feature.id);

  return (
    <div className="category-section" id={slug}>
      <SectionHeader category={category} items={credits} />

      <GenreFeature project={feature} onExpand={onExpand} />
      <MosaicGrid projects={rest} onExpand={onExpand} />
    </div>
  );
}

export default function CategoryGallery({ onExpand }) {
  return (
    <section className="galleries" id="work">
      <div className="galleries__header">
        <p className="eyebrow">Browse by Genre</p>
        <h2 className="galleries__heading">The Work</h2>
      </div>

      {CATEGORIES.map((category) => {
        // The shared room is rendered once, in the position of the first
        // of its chapters; the other two are skipped rather than given
        // sections of their own.
        if (SHOWCASE.includes(category)) {
          if (category !== SHOWCASE[0]) return null;
          // Same split as every other section: scenes get what they can
          // draw, credit lists get everything.
          const byCategory = Object.fromEntries(
            SHOWCASE.map((c) => [c, showcaseProjects(c)])
          );
          const creditsByCategory = Object.fromEntries(
            SHOWCASE.map((c) => [c, projectsByCategory(c)])
          );
          return (
            <div className="category-section category-section--env" key="showcase">
              <ShowcaseScene
                byCategory={byCategory}
                creditsByCategory={creditsByCategory}
                onExpand={onExpand}
              />
            </div>
          );
        }
        return (
          <CategorySection key={category} category={category} onExpand={onExpand} />
        );
      })}
    </section>
  );
}
