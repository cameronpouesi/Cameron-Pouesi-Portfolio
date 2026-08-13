# Cameron Pouesi — Portfolio

Cinematic portfolio site built with React + Vite and Framer Motion.

---

## Running it locally

```bash
npm install
npm run dev
```

Then open the local URL it prints (usually `http://localhost:5173`).

To build the production version:

```bash
npm run build   # outputs to /dist
npm run preview # serve that build locally to sanity-check it
```

---

## Adding / editing projects (no code required)

Everything shown in **Featured Work** and the genre galleries comes from one
file: [`src/data/projects.js`](src/data/projects.js). Open it in any text
editor (VS Code, Notepad, etc.) — you don't need to touch any other file.

### To add a new project

1. Copy an existing project object (the block between `{` and `},`).
2. Paste it inside the `projects = [ ... ]` array.
3. Give it a unique `id` (lowercase, dashes instead of spaces).
4. Fill in the fields — see the field guide below.
5. Save the file. If the dev server is running, the site updates instantly.

### To remove a project

Delete its whole `{ ... }` block from the array.

### To reorder projects

Projects appear in the order they're listed in the file, within their
category. Cut and paste a block to a new position in the array to reorder it.

### Field guide

| Field | What it does |
|---|---|
| `id` | Unique slug, e.g. `"midnight-reef"`. Never reuse an id. |
| `title` | Project title shown on the site. |
| `category` | Must exactly match one in `CATEGORIES` at the top of the file: `"Reality TV"`, `"Documentaries"`, `"Commercial / Branded"`, `"Music Videos"`. Add a new genre by adding a string to that list. |
| `year` | Production year, a number. |
| `role` | Your credited role, e.g. `"Offline Editor"`. |
| `description` | 1–2 sentence description. Keep it short — this is a visual site. |
| `thumbnail` | Path to a still image in `/public/images/thumbnails/`, e.g. `"/images/thumbnails/midnight-reef.jpg"`. Used as the video poster and grid preview. |
| `video.type` | `"youtube"` or `"local"`. |
| `video.youtubeId` | Only for `"youtube"` — just the ID from the URL. From `https://youtu.be/dQw4w9WgXcQ` the id is `dQw4w9WgXcQ`. Set to `null` for local videos. |
| `video.src` | Only for `"local"` — path to the mp4 in `/public/video/clips/`, e.g. `"/video/clips/midnight-reef.mp4"`. Set to `null` for YouTube videos. |
| `featured` | `true` puts it in the homepage Featured Work section. Keep this to roughly 3–4 projects total — that section is meant to be a highlight reel, not the full list. |

### Where media files go

```
public/
├── video/
│   ├── reel-bg.mp4          ← hero background loop (silent, auto-plays)
│   └── clips/                ← one mp4 per "local" project
├── images/
│   ├── thumbnails/            ← one still per project (any type)
│   └── headshot.jpg           ← your Bio photo
└── cv/
    └── Cameron_Pouesi_CV.pdf  ← linked from the Bio "Download CV" button
```

Just drop files in with those exact names (or update the paths in
`projects.js` to match whatever you name them) — no build step needed.

If `reel-bg.mp4` or `headshot.jpg` are missing, the site gracefully falls
back to a plain dark gradient / your initials instead of a broken image, so
it's safe to preview the layout before you have final assets.

### Video guidance for local clips

- Keep clips short — under 30–60 seconds, since they autoplay muted on
  scroll-into-view.
- Export as **H.264 mp4**, 1080p or 720p is plenty for a background/preview
  clip.
- Aim for roughly **5–15MB per clip**. Free hosting tiers (Vercel/Netlify)
  are bandwidth-limited on the free plan, and large videos slow down first
  load. If a clip comes out much bigger than that, drop the resolution or
  bitrate in your export settings (e.g. Premiere/Media Encoder ~5–8 Mbps
  target bitrate, 2-pass VBR).
- If you eventually have a lot of heavy footage, consider moving local clips
  to a dedicated video host (Cloudflare Stream, Mux, Bunny.net) and swapping
  `video.type` to `"youtube"`-style embed pattern later — the data structure
  already supports mixing sources per project.

---

## Deploying (free) — Vercel

Vercel auto-detects Vite and needs zero config.

1. Push this project to a GitHub repository (Vercel deploys from Git).
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio site"
   git branch -M main
   git remote add origin <your-empty-github-repo-url>
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and sign up/log in (GitHub login is
   easiest).
3. Click **Add New → Project**, select your GitHub repo.
4. Vercel will detect **Vite** automatically:
   - Build command: `npm run build`
   - Output directory: `dist`
   Leave these as-is and click **Deploy**.
5. In a minute or two you'll get a live URL like
   `your-project.vercel.app`.

Every time you push to `main`, Vercel redeploys automatically.

*(Netlify works nearly identically if you'd rather use that: same build
command `npm run build`, publish directory `dist`.)*

---

## Connecting a custom domain

You don't have a domain yet — here's the cheap path.

### 1. Buy a domain

Recommended registrars (both sell at/near cost, no big markup, easy DNS):

- **Cloudflare Registrar** — sells at wholesale cost, no markup. Usually the
  cheapest option, but you can only *transfer in* an existing domain or
  register through their dashboard — it's not always the very first place
  you can buy a brand-new domain instantly, so Namecheap is sometimes
  simpler for a first purchase.
- **Namecheap** — easy first-time purchase, competitive pricing, frequent
  first-year discount promos.

Rough pricing (check current price at checkout — prices vary and change):
- `.com` — typically around **$10–15/year**
- `.co` — typically pricier, around **$25–30/year**

If budget matters, a `.com` is usually the better value and the more
expected default for a professional site.

### 2. Point the domain at Vercel

In your Vercel project:

1. Go to **Project → Settings → Domains**.
2. Type your domain (e.g. `cameronpouesi.com`) and click **Add**.
3. Vercel will show you DNS records to set:
   - Usually an **A record** (`@` → an IP Vercel gives you) for the root
     domain, and a **CNAME** (`www` → `cname.vercel-dns.com`) for the `www`
     subdomain.
4. Go to your registrar's DNS settings for that domain and add the exact
   records Vercel showed you.
5. Wait for DNS to propagate (usually minutes, sometimes up to a few hours).
   Vercel's dashboard will show a green checkmark once it's verified and
   auto-issues a free HTTPS certificate.

That's it — no paid CMS, no backend, no server to maintain. The whole site
is static files served for free.

---

## Project structure

```
src/
├── components/       ← all UI sections + the video/lightbox system
├── data/projects.js  ← the file you edit to manage content
├── hooks/useInView.js← powers scroll-triggered autoplay
├── App.jsx           ← page composition (order of sections)
└── index.css         ← design tokens (colors, type, spacing)
public/
├── video/, images/, cv/  ← your media, see above
```
