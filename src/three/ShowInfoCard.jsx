import { AnimatePresence, motion } from "framer-motion";
import { COMPANIES } from "../data/companies";
import { hasRealDescription } from "../data/projects";
import "./ShowInfoCard.css";

/**
 * The credit that appears when a piece of work is hovered: what the show
 * is, who Cameron was on it, who made it and where it went.
 *
 * It sits in its own reserved strip beside or below the environment
 * rather than floating over it — nothing ever covers the work — and the
 * strip keeps its height whether or not a card is in it, so the page
 * never jumps as the cursor moves along a row.
 *
 * The description says what the programme *is*. It deliberately doesn't
 * repeat the company, the channel or the role, because those are their
 * own lines below it; a description that restates them makes the card
 * taller without telling anyone anything they can't already read.
 */
export default function ShowInfoCard({ project }) {
  const company = project?.company ? COMPANIES[project.company] : null;

  // "Who made it · where it went", falling back to Freelance when the
  // project genuinely has neither.
  const credit = project
    ? [project.company, ...(project.channels ?? [])].filter(Boolean)
    : [];
  const creditLine = credit.length > 0 ? credit.join(" · ") : "Freelance";

  return (
    <div className="show-info" aria-live="polite">
      <AnimatePresence mode="wait">
        {project && (
          <motion.div
            key={project.id}
            className="show-info__card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {company?.logo && (
              <div
                className={`show-info__logo show-info__logo--${company.logoOn ?? "light"}`}
              >
                <img src={company.logo} alt={`${project.company} logo`} />
              </div>
            )}

            <div className="show-info__body">
              <h4 className="show-info__title">{project.title}</h4>

              {hasRealDescription(project) && (
                <p className="show-info__desc">{project.description}</p>
              )}

              {project.role && <p className="show-info__role">{project.role}</p>}

              <p className="show-info__credit">{creditLine}</p>

              {project.season && (
                <p className="show-info__season">{project.season}</p>
              )}

              {project.prestigeTag && (
                <span className="show-info__tag">{project.prestigeTag}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
