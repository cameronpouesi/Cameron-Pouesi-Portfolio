// ============================================================================
// PRODUCTION COMPANIES
// ----------------------------------------------------------------------------
// Keyed by the exact string used in a project's `company` field.
// A company with no logo simply shows its name.
//
// logoOn — what the artwork needs behind it. Nothing is ever recoloured
// or inverted; each logo is shown exactly as supplied, on a plate that
// suits it:
//
//   "light"  dark or coloured artwork on transparency  -> white plate
//   "dark"   white artwork on transparency             -> charcoal plate
//   "self"   the file already carries its own solid background
//
// Getting this wrong is what turns a white-on-transparent logo into a
// blank white square, so check a new logo against a white background
// before choosing.
//
// To add one: drop the file in /public/images/logos/, point `logo` at
// it, and set logoOn.
// ============================================================================

export const COMPANIES = {
  "South Pacific Pictures": {
    logo: "/images/logos/south-pacific-pictures.png",
    logoOn: "light",
  },
  "Warner Bros. Discovery": {
    logo: "/images/logos/warner-bros-discovery.png",
    logoOn: "light",
  },
  "Pango Productions": {
    logo: "/images/logos/pango-productions.png",
    logoOn: "dark",
  },
  "NHNZ Worldwide": {
    logo: "/images/logos/nhnz-worldwide.jpg",
    logoOn: "self",
  },
  "Kevin & Co": {
    logo: "/images/logos/kevin-and-co.jpg",
    logoOn: "self",
  },
  "Corner Store": {
    logo: "/images/logos/corner-store.jpg",
    logoOn: "self",
  },
  "Pickled Possum Productions": {
    logo: "/images/logos/pickled-possum-productions.jpg",
    logoOn: "self",
  },
  "Perpetual Entertainment": {
    logo: "/images/logos/perpetual-entertainment.png",
    logoOn: "light",
  },
  "Viva La Dirt League": {
    logo: "/images/logos/viva-la-dirt-league.png",
    logoOn: "light",
  },
  Freelance: {
    logo: null,
  },
};
