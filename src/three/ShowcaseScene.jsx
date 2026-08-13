import { motion } from "framer-motion";
import CreditList from "../components/CreditList";
import ShowInfoCard from "./ShowInfoCard";
import useHoveredProject from "./useHoveredProject";
import { ComedyRoom, AdvertisingRoom, ChildrensRoom } from "./showcaseRooms";
import { CATEGORY_INTROS } from "../data/projects";
import "./ShowcaseScene.css";

// Three rooms, stacked, alternating which side the space sits on. Each
// one is a short shot rather than a full screen, and they run close
// together — these are the lighter chapters between the two hero
// sections, and the pacing should say so.
const CHAPTERS = [
  { name: "Comedy", Room: ComedyRoom, side: "right" },
  { name: "Advertising", Room: AdvertisingRoom, side: "left" },
  { name: "Children's TV", Room: ChildrensRoom, side: "right" },
];

function Chapter({ name, Room, side, items, onExpand }) {
  const [hoveredProject, onHoverChange] = useHoveredProject();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <motion.section
      className={`chapter chapter--${side}`}
      id={slug}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="chapter__text">
        <h3 className="chapter__title">{name}</h3>
        <div className="chapter__meta">
          <span className="chapter__count">
            {items.length} project{items.length === 1 ? "" : "s"}
          </span>
          <CreditList category={name} items={items} />
        </div>
        <p className="chapter__intro">{CATEGORY_INTROS[name]}</p>
        <ShowInfoCard project={hoveredProject} />
      </div>

      <div className="chapter__room">
        <Room items={items} onExpand={onExpand} onHoverChange={onHoverChange} />
      </div>
    </motion.section>
  );
}

export default function ShowcaseScene({ byCategory, onExpand }) {
  return (
    <div className="showcase">
      {CHAPTERS.map((c) => (
        <Chapter
          key={c.name}
          {...c}
          items={byCategory[c.name] ?? []}
          onExpand={onExpand}
        />
      ))}
    </div>
  );
}
