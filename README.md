# wiki.tgoyal.me

A tech wiki built around what a visitor needs: find the word, understand it, follow the next word, come back.
Every note has its own emblem, drawn by code from its name (`src/lib/emblem.ts`). The home page is a wall of
emblems that take their subject's colour once you open them. One new lesson a day.

## How it fits together

| Part | Where | What it does |
|---|---|---|
| Notes | `content/` | Markdown with frontmatter. Rules in [SCHEMA.md](SCHEMA.md) |
| Site | `src/` (Astro) | `lib/wiki.ts` renders notes; `lib/emblem.ts` draws emblems; `scripts/app.ts` is search, hover previews, the dive between notes and the trail; design rules are at the top of `styles/global.css` |
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
