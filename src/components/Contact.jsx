import { motion } from "framer-motion";
import "./Contact.css";

// LinkedIn only. A CV link is expected here later; there is deliberately
// no placeholder for it, because a link that goes nowhere is worse than
// one that isn't there yet.
const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/cameron-pouesi-5703716a",
  },
];

const EMAIL = "Cameronpouesi@hotmail.co.nz";

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <motion.div
        className="contact__inner"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="eyebrow">Get In Touch</p>
        <h2 className="contact__heading">Let's cut something together.</h2>

        <a className="contact__email" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>

        <ul className="contact__socials">
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer noopener">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </motion.div>

      <footer className="contact__footer">
        <p>© {new Date().getFullYear()} Cameron Pouesi</p>
      </footer>
    </section>
  );
}
