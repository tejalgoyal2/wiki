# wiki.tgoyal.me

A public, growing, linked wiki of software, data and ML. One deep lesson a day; every term links to its own note.

Read it at **https://wiki.tgoyal.me**.

## How it is built

- Notes are Markdown in `content/`, written to the rules in [SCHEMA.md](SCHEMA.md).
- [Quartz 5](https://quartz.jzhao.xyz/) turns them into the site (links, backlinks, hover previews, search, graph).
- `scripts/link.mjs` links the first mention of every note's name on every page.
- `scripts/check.mjs` checks frontmatter and links, and runs every code block marked `run`.
- `scripts/check-built.mjs` checks the built site for broken links.
- Cloudflare Pages builds and publishes `main`; a failing check stops the deploy.

## Working on it

```bash
npm ci
node scripts/link.mjs          # add links
node scripts/check.mjs         # check everything (needs node and python3)
npx quartz build --serve       # preview at http://localhost:8080
```

The `content/` folder is also an Obsidian vault: open it in Obsidian to read or edit with the same links.

**Cloudflare Pages build command:**

```bash
node scripts/link.mjs --check && node scripts/check.mjs && npx quartz plugin install && npx quartz build && node scripts/check-built.mjs public
```

Output directory `public`, environment variable `NODE_VERSION=22`.

## Licenses

- Text in `content/`: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Reuse it with credit.
- Code (Quartz and `scripts/`): MIT, see [LICENSE.txt](LICENSE.txt). Quartz is by jackyzha0 and contributors.
