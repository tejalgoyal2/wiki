# wiki.tgoyal.me

A learning wiki drawn as a map. Every note is a card with a fixed place; notes of one track form a region.
Click a card and the camera flies in and it opens; click a term inside it and you fly to that term's card.
One new lesson a day.

## How it fits together

| Part | Where | What it does |
|---|---|---|
| Notes | `content/` | Markdown with frontmatter. Rules in [SCHEMA.md](SCHEMA.md) |
| Site | `src/` (Astro) | `lib/wiki.ts` renders notes and lays out the map at build time; `scripts/app.ts` is the camera, cards, search, trail and sound; design rules are at the top of `styles/global.css` |
| Checks | `scripts/` | Links terms, generates Glossary / Practice / Traps / quiz cards, runs every code block marked `run` |
| Wanted | `functions/api/`, `schema.sql` | Counts searches that found nothing; a small open model on Cloudflare Workers AI writes a labelled draft |
| Daily writer | the `daily-drop` Claude skill | Writes the lesson, its puzzle and new notes (most wanted terms first), then checks and deploys |

## Commands

```bash
npm run dev                  # local site at localhost:4321
npm run check                # generated files, links, frontmatter, runnable code
sh scripts/deploy.sh         # check, build, publish to wiki.tgoyal.me
sh scripts/deploy.sh preview # publish to a preview address only
```

Text is CC BY 4.0. Code is MIT.
