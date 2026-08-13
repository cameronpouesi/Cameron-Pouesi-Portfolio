// ============================================================================
// PROJECTS DATA FILE
// ----------------------------------------------------------------------------
// This is the ONLY file you need to edit to add, remove, reorder, or update
// projects on the site. No code changes required.
//
// FIELD GUIDE
//   id           unique slug, lowercase-with-dashes, no spaces
//   title        project title shown on the site
//   category     must exactly match one of the CATEGORIES below
//   company      production company / client — must match a key in
//                companies.js to get a logo, or null
//   role         your credited role, e.g. "Offline Editor"
//   channels     where it aired / streamed (array of strings, optional)
//   description  1-2 sentences saying what the project actually is.
//                Kept clear of company/role/channels on purpose: those
//                are shown as their own lines on the credit card, and
//                repeating them here just makes the card longer without
//                telling anyone anything new.
//   season       optional, e.g. "SEASON 3" or "SEASONS 1 & 2". Shown
//                small and quiet under the credit — reference, not
//                headline. Season only: the broadcaster belongs in
//                `channels`, which already has its own line on the card
//                and its own column in the credit list, and naming it
//                here as well printed it twice in both places.
//   creditOnly   optional. true = list this in the Full Credit List but
//                keep it out of the environment. For work with no
//                artwork yet: a card with no picture is a hole in the
//                room, but the credit still belongs on the site.
//   prestigeTag  optional. One short badge — GLOBAL FORMAT,
//                INTERNATIONAL SERIES, NZ ORIGINAL, or a view count such
//                as "2.4M+ VIEWS". Only where it is factually true of
//                that title; most entries have none, which is what keeps
//                it worth reading on the ones that do. One badge per
//                project: a hard number beats a soft claim, so where a
//                view count is known it takes the slot.
//   thumbnail    path to a still, lives in /public/images/thumbnails/
//   video        null if there's no clip for this project yet — it will
//                still show its artwork, it just won't play.
//                Otherwise an object:
//                  video.type       "youtube" | "local"
//                  video.src        for "local": path to the mp4 in
//                                    /public/video/clips/
//                  video.youtubeId  for "youtube": just the ID from the URL,
//                                    e.g. https://youtu.be/dQw4w9WgXcQ ->
//                                    "dQw4w9WgXcQ"
//   featured     true = this show is part of the opening arrangement for
//                its category. Everything else waits behind "View All".
//                Aim for 6-9 featured per category.
//   artFit       optional, Reality TV only. The CRT screens are 4:3 and
//                artwork is 16:9, so by default the picture is scaled up
//                until it fills the glass and the overhang is trimmed
//                evenly off both sides — about 13% each. If a show's
//                title runs so close to the edge of its key art that it
//                loses letters, set artFit: "whole" to show all of it
//                with bars above and below instead, or a number between
//                1 (whole) and about 1.4 (fill) to split the difference.
//
// TWO KINDS OF VIDEO, ONE FIELD
//   You only ever fill in `video`. The short muted loop that plays when
//   someone hovers a screen is generated from it by make-previews.sh and
//   lives in /public/video/previews/ under the same filename — see
//   previewSrcFor() at the bottom. Run that script after adding a clip.
//
//   Only "local" mp4s can play on hover. A YouTube embed can't be read
//   into a WebGL texture (cross-origin), so YouTube projects show their
//   artwork on the screen and play in full when clicked.
//
// TODO (Cameron):
//   - Jess B — What You Know Bout Me has no clip yet, and its company
//     is still unconfirmed.
//   - You Got This has no artwork yet, so it is creditOnly. Its category
//     is inferred as Children's TV — confirm when you get a chance.
//   - Māori All Blacks: Bound by Blood came through as the full 26-minute
//     programme. Fine for the click-through, but send a short cut if
//     you'd rather not host the whole thing.
// ============================================================================

export const CATEGORIES = [
  "Reality TV",
  "Documentaries",
  "Comedy",
  "Advertising",
  "Children's TV",
  "Freelance",
];

// The line that sits under each section heading. Kept short and quiet on
// purpose — it introduces the room without competing with it.
export const CATEGORY_INTROS = {
  "Reality TV":
    "From reality and competition formats to unscripted entertainment, shaping stories that keep audiences invested from beginning to end.",
  Documentaries:
    "Story-driven work exploring real people, experiences and subjects through a considered and engaging editorial approach.",
  Comedy:
    "A collection of work built around humour, personalities and entertaining moments.",
  Advertising:
    "Commercial edits and branded campaigns designed to communicate clearly, connect with audiences and leave a lasting impression across digital platforms.",
  "Children's TV":
    "Engaging and energetic content created for young audiences, spanning entertainment, games, comedy and interactive formats.",
  Freelance:
    "Working with independent clients across music videos, successful YouTube channels and digital content, bringing a flexible editorial approach to a wide range of creative projects and formats.",
};

// Paths below stay as plain "/video/..." strings; media.js resolves them
// to wherever the video is actually hosted.
import { mediaUrl } from "./media";

const PLACEHOLDER_DESCRIPTION =
  "Add a 1-2 sentence description of your work on this project.";

export const projects = [
  // --------------------------------------------------------------------
  // Reality TV
  // --------------------------------------------------------------------
  {
    id: "celebrity-treasure-island",
    season: "SEASON 1",
    title: "Celebrity Treasure Island",
    category: "Reality TV",
    company: "Warner Bros. Discovery",
    role: "Offline Editor",
    channels: ["TVNZ"],
    description:
      "New Zealand's iconic celebrity reality competition, where contestants battle through challenges, alliances and strategy while raising money for charity.",
    prestigeTag: "NZ ORIGINAL",
    thumbnail: "/images/thumbnails/celebrity-treasure-island.jpg",
    video: { type: "local", src: "/video/clips/celebrity-treasure-island.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "the-bachelorette",
    season: "SEASONS 1 & 2",
    title: "The Bachelorette NZ",
    category: "Reality TV",
    company: "Warner Bros. Discovery",
    role: "Offline Editor",
    channels: ["TVNZ"],
    description:
      "The New Zealand edition of the global Bachelorette franchise, following a single woman as she searches for love while navigating romance and competition.",
    prestigeTag: "GLOBAL FORMAT",
    thumbnail: "/images/thumbnails/the-bachelorette.jpg",
    video: { type: "local", src: "/video/clips/the-bachelorette.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "the-traitors-australia",
    season: "SEASON 3",
    title: "The Traitors Australia",
    category: "Reality TV",
    company: "South Pacific Pictures",
    role: "Offline Editor",
    channels: ["Channel 10 Australia", "Three"],
    description:
      "The Australian edition of the global reality phenomenon, where contestants navigate deception, alliances and betrayal while competing for a shared prize.",
    prestigeTag: "GLOBAL FORMAT",
    thumbnail: "/images/thumbnails/the-traitors-australia.jpg",
    video: { type: "local", src: "/video/clips/the-traitors-australia.mp4", youtubeId: null },
    // The "T" of TRAITORS starts 7.8% across this key art, and an even
    // centre crop begins at 13% — so it was being cut in half. Nudging
    // the window left brings the whole lockup in with room to spare, and
    // the portrait on the right is well inside the other edge.
    artOffsetX: 0.08,
    featured: true,
  },
  {
    id: "match-fit",
    season: "SEASONS 1–4",
    title: "Match Fit",
    category: "Reality TV",
    company: "Pango Productions",
    role: "Offline Editor",
    channels: ["Three"],
    description:
      "A New Zealand sports reality series pushing former professional athletes and personalities through demanding physical challenges and personal transformation.",
    prestigeTag: "NZ ORIGINAL",
    thumbnail: "/images/thumbnails/match-fit.jpg",
    video: { type: "local", src: "/video/clips/match-fit.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "rupauls-dragrace-downunder",
    season: "SEASON 1",
    title: "RuPaul's Drag Race Down Under",
    category: "Reality TV",
    company: "Warner Bros. Discovery",
    role: "Offline Editor",
    channels: ["TVNZ", "STAN Australia", "BBC Three UK", "WOW Presents Plus"],
    description:
      "The Australian and New Zealand edition of the global Drag Race phenomenon, where queens compete through challenges, runway presentations and lip-sync battles.",
    prestigeTag: "GLOBAL FORMAT",
    thumbnail: "/images/thumbnails/rupauls-dragrace-downunder.jpg",
    video: { type: "local", src: "/video/clips/rupauls-dragrace-downunder.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "married-at-first-sight",
    season: "SEASON 2",
    title: "Married at First Sight NZ",
    category: "Reality TV",
    company: "Warner Bros. Discovery",
    role: "Offline Editor",
    channels: ["Three"],
    description:
      "New Zealand's version of the internationally successful dating format, where singles marry complete strangers selected for them by relationship experts.",
    prestigeTag: "GLOBAL FORMAT",
    thumbnail: "/images/thumbnails/married-at-first-sight.jpg",
    video: null,
    featured: true,
  },
  {
    id: "snackmasters",
    season: "SEASON 2",
    title: "Snackmasters NZ",
    category: "Reality TV",
    company: "South Pacific Pictures",
    role: "Offline Editor",
    channels: ["TVNZ"],
    description:
      "A cooking competition where professional chefs attempt to recreate some of the world's most recognisable snacks with incredible precision.",
    prestigeTag: "GLOBAL FORMAT",
    thumbnail: "/images/thumbnails/snackmasters.jpg",
    video: null,
    featured: true,
  },
  {
    id: "the-block-season-8",
    season: "SEASONS 8, 9 & 10",
    title: "The Block NZ Season 8",
    category: "Reality TV",
    company: "Warner Bros. Discovery",
    role: "Offline Editor",
    channels: ["Three"],
    description:
      "Another season of New Zealand's flagship renovation competition, following four teams as they transform houses while navigating pressure, deadlines and competition.",
    thumbnail: "/images/thumbnails/the-block-season-8.jpg",
    video: null,
    featured: true,
  },

  {
    id: "the-traitors-nz-season-3",
    season: "SEASON 3",
    title: "The Traitors NZ Season 3",
    category: "Reality TV",
    company: "South Pacific Pictures",
    role: "Offline Editor",
    channels: ["Three"],
    description:
      "The third season of New Zealand's hit reality format, bringing contestants together for another high-stakes game of deception, strategy and betrayal.",
    prestigeTag: "GLOBAL FORMAT",
    thumbnail: "/images/thumbnails/the-traitors-nz-season-3.jpg",
    video: { type: "local", src: "/video/clips/the-traitors-nz-season-3.mp4", youtubeId: null },
    featured: false,
  },
  {
    id: "the-traitors-nz-season-2",
    season: "SEASON 2",
    title: "The Traitors NZ Season 2",
    category: "Reality TV",
    company: "South Pacific Pictures",
    role: "Offline Editor",
    channels: ["Three"],
    description:
      "The second season of New Zealand's internationally successful reality format, where Faithfuls attempt to identify the hidden Traitors through strategy, deception and deduction.",
    prestigeTag: "GLOBAL FORMAT",
    thumbnail: "/images/thumbnails/the-traitors-nz-season-2.jpg",
    video: { type: "local", src: "/video/clips/the-traitors-nz-season-2.mp4", youtubeId: null },
    featured: false,
  },
  {
    id: "glow-up-nz",
    season: "SEASON 1",
    title: "Glow Up NZ",
    category: "Reality TV",
    company: "Warner Bros. Discovery",
    role: "Music Editor",
    channels: ["TVNZ"],
    description:
      "New Zealand's adaptation of the internationally successful makeup competition format, following aspiring artists through creative challenges and high-pressure transformations.",
    prestigeTag: "GLOBAL FORMAT",
    thumbnail: "/images/thumbnails/glow-up-nz.jpg",
    video: { type: "local", src: "/video/clips/glow-up-nz.mp4", youtubeId: null },
    featured: false,
  },
  {
    id: "fboy-island-nz",
    season: "SEASON 1",
    title: "FBOY Island NZ",
    category: "Reality TV",
    company: "Warner Bros. Discovery",
    role: "Offline Editor",
    channels: ["TVNZ+"],
    description:
      "A dating reality series where three women attempt to distinguish genuine Nice Guys from Fboys competing for love and a cash prize.",
    prestigeTag: "GLOBAL FORMAT",
    thumbnail: "/images/thumbnails/fboy-island-nz.jpg",
    video: null,
    featured: false,
  },
  {
    id: "boss-babes",
    season: "SEASONS 2 & 3",
    title: "Boss Babes",
    category: "Reality TV",
    company: "Warner Bros. Discovery",
    role: "Offline Editor",
    channels: ["TVNZ"],
    description:
      "A reality series following young Kiwi entrepreneurs as they navigate business, ambition and the challenges of building their brands and businesses.",
    thumbnail: "/images/thumbnails/boss-babes.jpg",
    video: null,
    featured: false,
  },
  {
    id: "design-junkies",
    season: "SEASON 2",
    title: "Design Junkies",
    category: "Reality TV",
    company: "Warner Bros. Discovery",
    role: "Music Editor",
    channels: ["TVNZ"],
    description:
      "A reality series celebrating Kiwi creativity, challenging designers to transform everyday materials and discarded objects into innovative designs.",
    thumbnail: "/images/thumbnails/design-junkies.jpg",
    video: null,
    featured: false,
  },
  {
    id: "house-of-drag",
    season: "SEASONS 1 & 2",
    title: "House of Drag",
    category: "Reality TV",
    company: "Warner Bros. Discovery",
    role: "Offline Editor",
    channels: ["TVNZ"],
    description:
      "A New Zealand drag competition where performers battle through outrageous challenges and performances to become the next House of Drag superstar.",
    prestigeTag: "NZ ORIGINAL",
    thumbnail: "/images/thumbnails/house-of-drag.jpg",
    video: null,
    featured: false,
  },
  {
    id: "ready-gamer-mum",
    season: "SEASON 1",
    title: "Ready Gamer Mum",
    category: "Reality TV",
    company: "South Pacific Pictures",
    role: "Offline Editor",
    channels: ["TVNZ"],
    description:
      "A reality gaming competition where young gamers teach their mums to play before putting them to the ultimate test in gaming and physical challenges.",
    thumbnail: "/images/thumbnails/ready-gamer-mum.jpg",
    video: { type: "local", src: "/video/clips/ready-gamer-mum.mp4", youtubeId: null },
    // Its preview carries audio that should not play on the wall.
    silentPreview: true,
    featured: false,
  },
  {
    id: "the-bachelor",
    season: "SEASON 4",
    title: "The Bachelor NZ",
    category: "Reality TV",
    company: "Warner Bros. Discovery",
    role: "Offline Editor",
    channels: ["TVNZ"],
    description:
      "New Zealand's edition of the internationally successful Bachelor franchise, following one bachelor as he dates a group of women competing for his heart.",
    prestigeTag: "GLOBAL FORMAT",
    thumbnail: "/images/thumbnails/the-bachelor.jpg",
    video: null,
    featured: false,
  },
  {
    id: "the-block-season-7",
    season: "SEASON 7",
    title: "The Block NZ: On Point",
    category: "Reality TV",
    company: "Warner Bros. Discovery",
    role: "Assistant Editor",
    channels: ["Three"],
    description:
      "New Zealand's hugely popular renovation competition, following teams of couples as they transform houses under intense deadlines before competing at auction.",
    thumbnail: "/images/thumbnails/the-block-season-7.jpg",
    video: null,
    featured: false,
  },
  {
    id: "the-ex-best-thing",
    season: "SEASON 1",
    title: "The Ex Best Thing",
    category: "Reality TV",
    company: "Pango Productions",
    role: "Offline Editor",
    channels: ["TVNZ"],
    description:
      "A reality series exploring complicated relationships and friendships as former couples confront the dynamics of their past.",
    thumbnail: "/images/thumbnails/the-ex-best-thing.jpg",
    video: null,
    featured: false,
  },
  {
    id: "the-great-kiwi-bakeoff",
    season: "SEASON 3",
    title: "The Great Kiwi Bake Off",
    category: "Reality TV",
    company: "Warner Bros. Discovery",
    role: "Offline Editor",
    channels: ["TVNZ"],
    description:
      "New Zealand's adaptation of the beloved international baking format, bringing amateur Kiwi bakers together to compete through technical bakes, signature challenges and showstoppers.",
    prestigeTag: "GLOBAL FORMAT",
    thumbnail: "/images/thumbnails/the-great-kiwi-bakeoff.jpg",
    video: null,
    featured: false,
  },

  // --------------------------------------------------------------------
  // Documentaries
  // --------------------------------------------------------------------
  {
    id: "maori-all-blacks-bound-by-blood",
    title: "Māori All Blacks: Bound by Blood",
    category: "Documentaries",
    company: "Pango Productions",
    role: "Offline Editor",
    channels: ["Whakaata Māori", "YouTube"],
    description:
      "A documentary series following the Māori All Blacks and exploring the team's connection to whakapapa, culture, identity and the legacy of the jersey.",
    thumbnail: "/images/thumbnails/maori-all-blacks-bound-by-blood.jpg",
    video: { type: "local", src: "/video/clips/maori-all-blacks-bound-by-blood.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "triple-threat",
    title: "Triple Threat",
    category: "Documentaries",
    company: "NHNZ Worldwide",
    role: "Offline Editor",
    channels: ["SKY"],
    description:
      "A documentary series following three Black Ferns as they navigate elite rugby, personal challenges and the pressure of representing New Zealand.",
    thumbnail: "/images/thumbnails/triple-threat.jpg",
    video: { type: "local", src: "/video/clips/triple-threat.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "sneakerholics",
    title: "Sneakerholics",
    category: "Documentaries",
    company: "Warner Bros. Discovery",
    role: "Offline Editor",
    channels: ["TVNZ+"],
    description:
      "A documentary series exploring New Zealand's sneaker culture through collectors, creatives, musicians and enthusiasts and the stories behind their obsession.",
    thumbnail: "/images/thumbnails/sneakerholics.jpg",
    video: { type: "local", src: "/video/clips/sneakerholics.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "george-clarke-homes-in-the-wild",
    season: "SEASON 1",
    title: "Wild Homes with George Clarke",
    category: "Documentaries",
    company: "Perpetual Entertainment",
    role: "Offline Editor",
    channels: ["Channel 4 UK"],
    description:
      "A lifestyle series exploring remarkable homes in extraordinary locations, uncovering the unique stories and ideas behind them.",
    prestigeTag: "INTERNATIONAL SERIES",
    thumbnail: "/images/thumbnails/george-clarke-homes-in-the-wild.jpg",
    video: { type: "local", src: "/video/clips/george-clarke-homes-in-the-wild.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "auckland-fc",
    season: "SEASON 1",
    title: "Forever Auckland FC",
    category: "Documentaries",
    company: "NHNZ Worldwide",
    role: "Offline Editor",
    channels: ["SKY", "Netflix"],
    description:
      "A documentary series following the birth of Auckland FC and their historic first season in the A-League, with behind-the-scenes access to the club, players and fans.",
    thumbnail: "/images/thumbnails/auckland-fc.jpg",
    video: { type: "local", src: "/video/clips/auckland-fc.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "game-on",
    title: "Game On",
    category: "Documentaries",
    company: "Pango Productions",
    role: "Offline Editor",
    channels: ["Three"],
    description:
      "A documentary series following former Silver Ferns as they attempt one final tournament while training the next generation of netballers and testing whether they still have what it takes.",
    thumbnail: "/images/thumbnails/game-on.jpg",
    video: { type: "local", src: "/video/clips/game-on.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "national-treasures",
    season: "SEASON 2",
    title: "National Treasures",
    category: "Documentaries",
    company: "Pango Productions",
    role: "Offline Editor",
    channels: ["TVNZ"],
    description:
      "A documentary series uncovering the fascinating stories behind some of New Zealand's most unusual, significant and treasured objects.",
    thumbnail: "/images/thumbnails/national-treasures.jpg",
    video: null,
    featured: true,
  },

  // --------------------------------------------------------------------
  // Comedy
  // --------------------------------------------------------------------
  {
    id: "taskmaster-australia",
    season: "SEASON 6",
    title: "Taskmaster Australia",
    category: "Comedy",
    company: "Kevin & Co",
    role: "Offline Editor",
    channels: ["Channel 10 Australia"],
    description:
      "The Australian edition of the hugely popular Taskmaster format, where comedians and personalities compete in ridiculous and inventive challenges.",
    prestigeTag: "GLOBAL FORMAT",
    thumbnail: "/images/thumbnails/taskmaster-australia.jpg",
    video: { type: "local", src: "/video/clips/taskmaster-australia.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "last-dad-standing",
    season: "SEASON 1",
    title: "Last Dad Standing",
    category: "Comedy",
    company: "Warner Bros. Discovery",
    role: "Offline Editor",
    channels: ["TVNZ"],
    description:
      "A comedy competition where Kiwi dads battle it out with their best jokes, with the funniest dads taking the win.",
    thumbnail: "/images/thumbnails/last-dad-standing.jpg",
    video: null,
    featured: true,
  },

  // --------------------------------------------------------------------
  // Advertising
  // --------------------------------------------------------------------
  {
    id: "aon-x-surf-life-saving",
    title: "Aon x Surf Life Saving",
    category: "Advertising",
    company: "Corner Store",
    role: "Advertising Editor",
    description:
      "Commercial content highlighting the people and split-second decisions that help keep New Zealand's beaches safe.",
    thumbnail: "/images/thumbnails/aon-x-surf-life-saving.jpg",
    video: { type: "local", src: "/video/clips/aon-x-surf-life-saving.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "auckland-airport",
    title: "Auckland Airport — Socials",
    category: "Advertising",
    company: "Corner Store",
    role: "Advertising Editor",
    channels: ["Social"],
    description:
      "Commercial content created for Auckland Airport, showcasing the people, places and experiences connecting travellers with Aotearoa and the world.",
    thumbnail: "/images/thumbnails/auckland-airport.jpg",
    video: { type: "local", src: "/video/clips/auckland-airport.mp4", youtubeId: null },
    orientation: "portrait",
    featured: true,
  },
  {
    id: "hyoketsu",
    title: "Hyoketsu",
    category: "Advertising",
    company: "Corner Store",
    role: "Advertising Editor",
    channels: ["Social"],
    description:
      "Commercial content for Kirin Hyoketsu, showcasing the Japanese RTD brand and its distinctive approach to fruit-infused vodka sodas.",
    thumbnail: "/images/thumbnails/hyoketsu.jpg",
    video: { type: "local", src: "/video/clips/hyoketsu.mp4", youtubeId: null },
    orientation: "portrait",
    featured: true,
  },
  {
    id: "coachmate-app",
    title: "Coachmate",
    category: "Advertising",
    company: "Corner Store",
    role: "Advertising Editor",
    channels: ["Coachmate App"],
    description:
      "Digital content created to assist coaches across NZ Rugby League, Basketball New Zealand, and Golf New Zealand and Australia.",
    thumbnail: "/images/thumbnails/coachmate-app.jpg",
    video: { type: "local", src: "/video/clips/coachmate-app.mp4", youtubeId: null },
    featured: true,
  },
  // No artwork or clip supplied for these two, so they are `creditOnly`:
  // they stay out of the poster wall — a poster with no picture is a hole
  // in it — but they are listed in Advertising's Full Credit List, so the
  // work is still documented. Give either one a thumbnail and drop the
  // flag to promote it to a real card.
  {
    id: "nz-of-the-year-2025-socials",
    title: "New Zealander of the Year 2025 Socials",
    category: "Advertising",
    company: "Corner Store",
    role: "Advertising Editor",
    channels: ["Instagram"],
    description: PLACEHOLDER_DESCRIPTION,
    thumbnail: null,
    video: null,
    creditOnly: true,
    featured: false,
  },
  {
    id: "wellington-airport-emas",
    title: "Wellington Airport EMAS Project",
    category: "Advertising",
    company: "Wrestler",
    role: "Offline Editor",
    // No channel supplied; the credit list prints an em dash for this.
    channels: [],
    description: PLACEHOLDER_DESCRIPTION,
    thumbnail: null,
    video: null,
    creditOnly: true,
    featured: false,
  },

  // --------------------------------------------------------------------
  // Children's TV
  // --------------------------------------------------------------------
  // No artwork or clip has been supplied for this one, so it is
  // `creditOnly`: it never appears in the bedroom scene — a card with no
  // picture would just be a hole in it — but it is listed in Children's
  // TV's Full Credit List, so the work is still documented on the site.
  // Give it a thumbnail and drop this flag to promote it to a real card.
  //
  // Category, company and role confirmed by Cameron, 13 Aug 2026.
  {
    id: "you-got-this",
    season: "SEASON 1",
    title: "You Got This",
    category: "Children's TV",
    company: "Warner Bros. Discovery",
    role: "Offline Editor",
    channels: ["TVNZ"],
    description: PLACEHOLDER_DESCRIPTION,
    thumbnail: null,
    video: null,
    creditOnly: true,
    featured: false,
  },
  {
    id: "sticky-tv",
    season: "2 SEASONS",
    title: "Sticky TV",
    category: "Children's TV",
    company: "Pickled Possum Productions",
    role: "Junior Editor",
    channels: ["Three"],
    description:
      "A long-running New Zealand children's entertainment series combining games, competitions, comedy and interactive content for young audiences.",
    prestigeTag: "NZ ORIGINAL",
    thumbnail: "/images/thumbnails/sticky-tv.jpg",
    video: { type: "local", src: "/video/clips/sticky-tv.mp4", youtubeId: null },
    featured: true,
  },

  // --------------------------------------------------------------------
  // Freelance
  //
  // The Bramble, Hurtlocker and Viva La Dirt League entries use a frame
  // pulled from their own clip as artwork. Drop a proper still into
  // /public/images/thumbnails/ under the same name to replace it.
  // --------------------------------------------------------------------
  {
    id: "unspoken-manu-vatuvei",
    title: "Unspoken: Manu Vatuvei",
    category: "Freelance",
    company: "Athlete Empire",
    role: "Editor",
    channels: ["YouTube", "Coconet TV"],
    description:
      
      "An emotional and deeply personal conversation between former New Zealand rugby league players Sione Faumuina and Manu Vatuvei, opening up about their lives after rugby and some of their darkest moments.",
    thumbnail: "/images/thumbnails/unspoken-manu-vatuvei.jpg",
    video: { type: "local", src: "/video/clips/unspoken-manu-vatuvei.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "hurtlocker-promo",
    title: "Hurtlocker Gym",
    category: "Freelance",
    company: null,
    role: "Videographer & Editor",
    description:
      "A promotional piece created for Hurtlocker, capturing the energy and visual identity of the project through fast-paced storytelling.",
    thumbnail: "/images/thumbnails/hurtlocker-promo.jpg",
    video: { type: "local", src: "/video/clips/hurtlocker-promo.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "vldl-choice",
    title: "When Game Choices Make No Difference",
    category: "Freelance",
    company: "Viva La Dirt League",
    role: "YouTube Editor",
    channels: ["YouTube"],
    description:
      "A gaming comedy sketch created for Viva La Dirt League and their huge international YouTube audience.",
    prestigeTag: "6M+ VIEWS",
    thumbnail: "/images/thumbnails/vldl-choice.jpg",
    video: { type: "local", src: "/video/clips/vldl-choice.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "bramble-dark-and-stormy",
    title: "The Bramble x First — The Dark and Stormy",
    category: "Freelance",
    company: "First Rum",
    role: "Editor",
    channels: ["Instagram"],
    description:
      "A promo created in collaboration between Bramble Bar and First Rum, showcasing First Rum-inspired cocktails through a stylish campaign.",
    thumbnail: "/images/thumbnails/bramble-dark-and-stormy.jpg",
    video: { type: "local", src: "/video/clips/bramble-dark-and-stormy.mp4", youtubeId: null },
    orientation: "portrait",
    featured: true,
  },
  {
    id: "bramble-last-word",
    title: "The Bramble x First — The Last Word",
    category: "Freelance",
    company: "First Rum",
    role: "Editor",
    channels: ["Instagram"],
    description:
      "A promo created in collaboration between Bramble Bar and First Rum, showcasing First Rum-inspired cocktails and the bar's take on classic cocktail culture.",
    thumbnail: "/images/thumbnails/bramble-last-word.jpg",
    video: { type: "local", src: "/video/clips/bramble-last-word.mp4", youtubeId: null },
    orientation: "portrait",
    featured: true,
  },
  {
    id: "vldl-chest",
    title: "Looting Random Chests in Games",
    category: "Freelance",
    company: "Viva La Dirt League",
    role: "YouTube Editor",
    channels: ["YouTube"],
    description:
      "A gaming comedy sketch created for New Zealand comedy group Viva La Dirt League and their huge international YouTube audience.",
    prestigeTag: "2.4M+ VIEWS",
    thumbnail: "/images/thumbnails/vldl-chest.jpg",
    video: { type: "local", src: "/video/clips/vldl-chest.mp4", youtubeId: null },
    featured: false,
  },
  {
    id: "vldl-chips",
    title: "Having a Co-worker That Eats Too Loudly",
    category: "Freelance",
    company: "Viva La Dirt League",
    role: "YouTube Editor",
    channels: ["YouTube"],
    description:
      "A comedy sketch created for Viva La Dirt League, combining gaming culture and character-driven comedy for their global digital audience.",
    prestigeTag: "950K+ VIEWS",
    thumbnail: "/images/thumbnails/vldl-chips.jpg",
    video: { type: "local", src: "/video/clips/vldl-chips.mp4", youtubeId: null },
    featured: true,
  },
  {
    id: "vldl-wagon",
    title: "When Mugging Gets Stupid",
    category: "Freelance",
    company: "Viva La Dirt League",
    role: "YouTube Editor",
    channels: ["YouTube"],
    description:
      "A comedy sketch created for Viva La Dirt League, using gaming culture and character-driven humour for their global online audience.",
    prestigeTag: "1M+ VIEWS",
    thumbnail: "/images/thumbnails/vldl-wagon.jpg",
    video: { type: "local", src: "/video/clips/vldl-wagon.mp4", youtubeId: null },
    featured: false,
  },
  {
    id: "vldl-provoked",
    title: "Attacked During a Cutscene",
    category: "Freelance",
    company: "Viva La Dirt League",
    role: "YouTube Editor",
    channels: ["YouTube"],
    description:
      "A gaming comedy sketch created for Viva La Dirt League, combining gaming culture, character comedy and fast-paced digital storytelling.",
    prestigeTag: "1.9M+ VIEWS",
    thumbnail: "/images/thumbnails/vldl-provoked.jpg",
    video: { type: "local", src: "/video/clips/vldl-provoked.mp4", youtubeId: null },
    featured: false,
  },
  {
    id: "lime-after-lime",
    title: "Lime After Lime — Cyndi Lauper Parody",
    category: "Freelance",
    company: "Carbolic Productions",
    role: "Editor",
    channels: ["YouTube"],
    description:
      "A parody music video created for a stage production, reimagining Cyndi Lauper's \"Time After Time\" as a comedy piece about Lime scooters.",
    thumbnail: "/images/thumbnails/lime-after-lime.jpg",
    video: { type: "local", src: "/video/clips/lime-after-lime.mp4", youtubeId: null },
    featured: false,
  },
  {
    id: "tiki-taane-live",
    title: "Tiki Taane — Live at Leigh Sawmill",
    category: "Freelance",
    company: null,
    role: "Editor",
    channels: ["YouTube"],
    description:
      "Live performance content capturing the energy and atmosphere of New Zealand artist Tiki Taane in concert.",
    thumbnail: "/images/thumbnails/tiki-taane-live.jpg",
    video: { type: "local", src: "/video/clips/tiki-taane-live.mp4", youtubeId: null },
    featured: false,
  },
  // No clip has been supplied for this one yet, so `video` is null: the
  // artwork shows, nothing tries to wake a preview, and the lightbox
  // stays shut rather than opening on a missing file. Add a clip at
  // /video/clips/jessb-what-you-know-bout-me.mp4 and give this the same
  // `video` shape as its neighbours to turn it on.
  //
  // Company and role are the only two fields here I could not read off
  // anything supplied — please confirm them.
  {
    id: "jessb-what-you-know-bout-me",
    title: "Jess B — What You Know Bout Me",
    category: "Freelance",
    company: null,
    role: "Director & Editor",
    channels: ["YouTube", "Facebook"],
    description:
      "A seven-part visual album created for New Zealand artist JessB early in her career, directed and edited as an interconnected series of music videos.",
    thumbnail: "/images/thumbnails/jessb-what-you-know-bout-me.jpg",
    video: null,
    featured: false,
  },

];

/** Everything in a category, including credit-only entries. This is what
 *  the Full Credit List reads, so a credit can never be missing from it. */
export const projectsByCategory = (category) =>
  projects.filter((p) => p.category === category);

/** What an environment can actually show: the same list, minus anything
 *  with no artwork to put on a screen or a wall. */
export const showcaseProjects = (category) =>
  projectsByCategory(category).filter((p) => !p.creditOnly);

/**
 * The short, silent, fast-starting loop used for hover previews.
 *
 * Returns null when there's nothing to play — a project with no clip, or
 * one hosted on YouTube, which can't be read into a WebGL texture. In
 * both cases the screen simply keeps showing its artwork.
 */
/**
 * The shape a project's media actually is.
 *
 * Anything shot 9:16 keeps 9:16 wherever it appears — the surface it's
 * shown on is built to match rather than the picture being letterboxed
 * into a landscape one. Set `orientation: "portrait"` on the project and
 * every environment sizes its hardware accordingly.
 */
export const PORTRAIT_ASPECT = 9 / 16;
export const LANDSCAPE_ASPECT = 16 / 9;

export const isPortrait = (project) => project?.orientation === "portrait";

export const aspectFor = (project) =>
  isPortrait(project) ? PORTRAIT_ASPECT : LANDSCAPE_ASPECT;

// Derived from the clip's own path — the swap happens while it is still
// a plain path, then the result is resolved to wherever the video is
// hosted. Doing it in that order is what keeps the rule readable: the
// preview of a clip is the same filename in the previews folder.
export const previewSrcFor = (project) =>
  project?.video?.type === "local"
    ? mediaUrl(project.video.src.replace("/video/clips/", "/video/previews/"))
    : null;

/** True when a description is still the boilerplate, so UI can hide it
 *  rather than showing "Add a 1-2 sentence description..." to a viewer. */
export const hasRealDescription = (project) =>
  Boolean(project?.description) && project.description !== PLACEHOLDER_DESCRIPTION;
