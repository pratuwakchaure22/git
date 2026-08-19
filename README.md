# Personal Portfolio — Frontend

A complete, responsive personal portfolio frontend built with **React + Vite + TypeScript + Tailwind CSS**.
No backend, database, auth, or AI is wired up yet — everything runs on local dummy data so you can preview
and customize the whole site before connecting anything real.

## Tech stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** (CSS-first config, no `tailwind.config.js` needed — see `src/index.css`)
- **React Router v7** for client-side routing
- **Framer Motion** for scroll-reveal and micro-interactions
- **lucide-react** for icons
- Self-hosted **Space Grotesk / IBM Plex Sans / IBM Plex Mono** via `@fontsource` (no external font requests)

## Getting started

```bash
npm install
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # type-check + production build → dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

Requires Node 18+ (built and tested on Node 22).

## Pages

Home · About · Projects · Research · Achievements · Skills · Education · Resume · AI Assistant (placeholder) · Contact

All content is driven by typed dummy data in `src/data/*.ts` — see **Customizing** below.

## Project structure

```
src/
  components/
    layout/       Navbar, full-screen nav overlay, footer, theme toggle, scroll-to-top
    common/        Button, Badge, Container, SectionHeading, PageHero, animation wrappers, etc.
    home/          Home-page-only sections (Hero, stats, featured projects, skills marquee)
    projects/      research/  achievements/  skills/  education/  contact/  resume/  ai/  about/
                   Page-specific components
  context/         ThemeContext (light/dark, persisted to localStorage)
  data/            Dummy content — profile, projects, research, achievements, skills, education, experience
  hooks/           useDocumentTitle, useScrollToTop
  pages/           One file per route, composes the components above
  types/           Shared TypeScript interfaces for all content
  lib/utils.ts     `cn()` classname helper (clsx + tailwind-merge)
  index.css        Design tokens (colors/fonts as CSS variables), dark mode, print styles
```

## Design system

The visual identity is a "signal / systems log" theme — deliberately not the generic
cream-and-serif or near-black-and-neon look most AI-generated sites default to:

- **Type:** Space Grotesk (display), IBM Plex Sans (body), IBM Plex Mono (labels, dates, tags)
- **Color:** cool paper-white / ink-navy base with an indigo primary accent and a small amber accent,
  all defined as CSS variables in `src/index.css` (`--paper`, `--ink`, `--indigo`, `--amber`, etc.) so
  light/dark mode is just a class swap on `<html>`
- **Signature motif:** an animated waveform (`SignalMark`), used in the hero and as a recurring divider
- Project "images" are generated SVG data-readouts (deterministic per project ID) instead of stock photos

To restyle, start in `src/index.css` (the `:root` / `.dark` variable blocks) — most components
reference semantic Tailwind classes like `bg-surface`, `text-ink`, `text-muted`, `border-line` rather
than hard-coded colors, so changing the variables reskins the whole site.

## Customizing content

Everything under `src/data/` is placeholder content and safe to fully rewrite:

| File | Powers |
|---|---|
| `profile.ts` | Name, role, bio, contact info, nav items, social links, hero stats |
| `projects.ts` | Projects grid (Home + Projects page) |
| `research.ts` | Research / publications page |
| `achievements.ts` | Awards, certifications, competitions |
| `skills.ts` | Skills page + Home marquee |
| `education.ts` | Education timeline |
| `experience.ts` | Work history on the Resume page |

Update the `types/index.ts` interfaces only if you need to add/remove fields — the rest of the app is
typed against them, so TypeScript will flag anywhere else that needs updating.

Other things to swap before deploying:
- `public/favicon.svg` — currently a generated mark, not a real photo
- The `IdentityPanel` on the About page shows initials instead of a photo — swap in an `<img>` if you'd rather use a real headshot
- `index.html` — Open Graph/meta tags reference the placeholder name
- Resume page: the "Print / Save as PDF" button opens the browser print dialog against a styled, print-ready layout (see `@media print` in `index.css`) rather than linking to a static file, so it works with zero setup. Swap in a real `<a href="/resume.pdf" download>` once you have an actual PDF in `public/`.

## What's intentionally not included

Per the brief, this is frontend-only:

- **No Supabase / database** — `ContactForm.tsx` and `NotifyForm.tsx` simulate submission client-side; the
  `handleSubmit` functions have a comment marking exactly where to add a real request later
- **No authentication**
- **No AI integration** — the AI Assistant page is a fully designed placeholder (static chat mockup + a
  "notify me" capture) describing what the feature will do, not a working assistant

## Deployment

The app is a static SPA (client-side routing via React Router), so any static host works. Rewrite rules
for client-side routing are already included:
- `vercel.json` for Vercel
- `public/_redirects` for Netlify

For other hosts, configure a fallback that serves `index.html` for unknown paths.
