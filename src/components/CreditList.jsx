import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import "./CreditList.css";

/**
 * "Full Credit List" — the plain-text answer to the question the rooms
 * only answer one hover at a time.
 *
 * The environments are the argument; this is the evidence. It reads every
 * field straight off the same project records the hover cards use, so a
 * company or a broadcaster can never drift between the two views: there
 * is one source for a credit, and it is `src/data/projects.js`.
 */

const dash = "—";

function CreditTable({ items }) {
  return (
    <table className="credit-list__table">
      <thead>
        <tr>
          <th scope="col">Project</th>
          <th scope="col">Company</th>
          <th scope="col">Broadcaster / Channel</th>
          <th scope="col">Role</th>
        </tr>
      </thead>
      <tbody>
        {items.map((p) => (
          <tr key={p.id}>
            <th scope="row" data-label="Project">
              {p.title}
              {/* Under the title rather than in a column of its own: the
                  season string already names the channel, so a fifth
                  column would have repeated the one beside it. */}
              {p.season && <span className="credit-list__season">{p.season}</span>}
            </th>
            <td data-label="Company">{p.company || dash}</td>
            <td data-label="Broadcaster / Channel">
              {p.channels?.length ? p.channels.join(" · ") : dash}
            </td>
            <td data-label="Role">{p.role || dash}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function CreditList({ category, items = [] }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef(null);
  const openerRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  // Escape closes it, and the page underneath stays put — a list this
  // long scrolls, and nothing is worse than the page scrolling with it.
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      openerRef.current?.focus();
    };
  }, [open, close]);

  if (items.length === 0) return null;

  return (
    <>
      <button
        type="button"
        ref={openerRef}
        className="credit-list__open"
        onClick={() => setOpen(true)}
      >
        Full Credit List
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="credit-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={close}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="credit-list__panel"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <header className="credit-list__head">
                  <div>
                    <p className="credit-list__eyebrow">Full Credit List</p>
                    <h2 className="credit-list__title" id={titleId}>
                      {category}
                    </h2>
                  </div>
                  <button
                    type="button"
                    ref={closeRef}
                    className="credit-list__close"
                    onClick={close}
                    aria-label="Close credit list"
                  >
                    Close
                  </button>
                </header>

                <div className="credit-list__scroll">
                  <CreditTable items={items} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
