// Generates the parts of the wiki that are derived from other notes, so they never go stale:
//   - on every note with `requires:`, a "Read first" box at the top
//   - on every note that others require, a "Leads to" list at the bottom
//   - content/glossary.md: every concept and pattern with its one-line description, by track
//   - content/practice.md: every "Check yourself" and "How interviews ask it" question, by track
//
//   node scripts/generate.mjs          write
//   node scripts/generate.mjs --check  exit 1 if anything would change (for CI)
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { loadNotes, CONTENT } from "./notes.mjs"

const check = process.argv.includes("--check")
const notes = loadNotes()
const bySlug = new Map(notes.map((n) => [n.slug, n]))
const problems = []
let changed = 0

const TRACKS = [
  ["javascript", "JavaScript"],
  ["python-data", "Python & Data"],
  ["ml", "ML & Data Science"],
  ["llm-rag", "LLMs & RAG"],
  ["backend", "Backend & System Design"],
  ["cs-fundamentals", "CS Fundamentals"],
]
const link = (n) => `[[${n.slug}|${n.data.title}]]`

function write(path, text, rel) {
  const old = existsSync(path) ? readFileSync(path, "utf8") : null
  if (old === text) return
  changed++
  if (check) console.log(`would update: ${rel}`)
  else {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, text)
  }
}

// 1. Learning order: requires -> "Read first", reverse -> "Leads to"
const TOP = /<!-- read-first -->[\s\S]*?<!-- \/read-first -->\n*/
const BOTTOM = /\n*<!-- leads-to -->[\s\S]*?<!-- \/leads-to -->\n?/
const leadsTo = new Map()
for (const n of notes) {
  for (const r of n.data.requires ?? []) {
    if (!bySlug.has(r)) problems.push(`${n.rel}: requires "${r}", which does not exist`)
    else leadsTo.set(r, [...(leadsTo.get(r) ?? []), n])
  }
}
for (const n of notes) {
  if (n.data.generated) continue
  let body = n.body.replace(TOP, "").replace(BOTTOM, "\n")
  const req = (n.data.requires ?? []).filter((r) => bySlug.has(r)).map((r) => bySlug.get(r))
  if (req.length) {
    body =
      `<!-- read-first -->\n> [!info] Read first\n> ${req.map(link).join(" · ")}\n<!-- /read-first -->\n\n` +
      body.replace(/^\n+/, "")
  }
  const next = (leadsTo.get(n.slug) ?? []).sort((a, b) => a.data.title.localeCompare(b.data.title))
  if (next.length) {
    body =
      body.replace(/\n+$/, "") +
      `\n\n<!-- leads-to -->\n## Leads to\n\n${next.map((m) => `- ${link(m)}: ${m.data.description}`).join("\n")}\n<!-- /leads-to -->\n`
  } else body = body.replace(/\n+$/, "") + "\n"
  write(n.path, n.fm + body, n.rel)
}

// 2. Glossary
const glossaryNotes = notes.filter((n) => ["concept", "pattern"].includes(n.data.type))
let glossary = `---
title: Glossary
description: Every concept and pattern in the wiki, with its one-line definition.
generated: true
nolink: true
---

Every term in the wiki in one line. Hover a term for a preview, click it for the full note.
This page is generated from the notes themselves, so it is always complete.
`
for (const [key, name] of TRACKS) {
  const items = glossaryNotes.filter((n) => n.data.track === key).sort((a, b) => a.data.title.localeCompare(b.data.title))
  if (!items.length) continue
  glossary += `\n## ${name}\n\n| Term | In one line |\n|---|---|\n`
  glossary += items.map((n) => `| [[${n.slug}\\|${n.data.title}]] | ${String(n.data.description).replace(/\|/g, "\\|")} |`).join("\n") + "\n"
}
write(join(CONTENT, "glossary.md"), glossary, "glossary.md")

// 3. Practice: every self-test and interview question, grouped by track
function questionBlocks(body, heading) {
  const lines = body.split("\n")
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`)
  if (start < 0) return []
  const blocks = []
  let cur = null
  for (let i = start + 1; i < lines.length && !/^## /.test(lines[i]); i++) {
    const l = lines[i]
    if (/^> \[!question\]/.test(l)) {
      cur = [l]
      blocks.push(cur)
    } else if (cur && l.startsWith(">")) cur.push(l)
    else cur = null
  }
  return blocks.map((b) => b.join("\n"))
}
let practice = `---
title: Practice
description: Every self-test and interview question in the wiki, grouped by track. Answer before you open each one.
generated: true
nolink: true
---

Every **Check yourself** and **How interviews ask it** question in the wiki, in one place. Say the answer out loud
or write it down **before** opening it: testing yourself is what makes knowledge stick. This page is generated from
the notes, so it grows every day.

> [!tip] Prefer flashcards?
> **[Open the Quiz](/quiz/)**: the same questions as cards, scheduled with spaced repetition so each one comes
> back just before you would forget it. Your progress stays in your browser.
`
// URL of a note, for links outside Quartz (the quiz app)
const urlOf = (slug) => (bySlug.has(slug) ? "/" + bySlug.get(slug).rel.replace(/\.md$/, "") : null)
const plainLinks = (md) =>
  md.replace(/\[\[([^\]|\\]+)(?:\\?\|([^\]]+))?\]\]/g, (_, slug, text) => {
    const url = urlOf(slug.trim())
    return url ? `[${text ?? slug}](${url})` : text ?? slug
  })
const hash = (s) => {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.codePointAt(0), 16777619)
  return (h >>> 0).toString(36)
}
const cards = []
let count = 0
for (const [key, name] of TRACKS) {
  const sources = notes
    .filter((n) => n.data.track === key && !n.data.generated)
    .sort((a, b) => String(a.data.created).localeCompare(String(b.data.created)) || a.slug.localeCompare(b.slug))
  const sections = []
  for (const n of sources) {
    const kinds = [
      ["interview", questionBlocks(n.body, "How interviews ask it")],
      ["check", questionBlocks(n.body, "Check yourself")],
    ]
    const qs = kinds.flatMap(([, b]) => b)
    if (!qs.length) continue
    count += qs.length
    sections.push(`### From ${link(n)}\n\n${qs.join("\n\n")}`)
    for (const [kind, blocks] of kinds) {
      for (const b of blocks) {
        const [first, ...rest] = b.split("\n")
        const q = first.replace(/^> \[!question\]-?\s*/, "").replace(/^"(.*)"$/, "$1")
        const a = rest.map((l) => l.replace(/^> ?/, "")).join("\n").trim()
        cards.push({ id: hash(n.slug + "\n" + q), track: key, kind, q: plainLinks(q), a: plainLinks(a), from: { title: n.data.title, url: urlOf(n.slug) } })
      }
    }
  }
  if (sections.length) practice += `\n## ${name}\n\n${sections.join("\n\n")}\n`
}
practice = practice.replace("This page is generated", `${count} questions so far. This page is generated`)
write(join(CONTENT, "practice.md"), practice, "practice.md")

// 4. Quiz data for /quiz/
const QUIZ = new URL("../public/quiz/", import.meta.url).pathname
write(join(QUIZ, "cards.json"), JSON.stringify({ tracks: Object.fromEntries(TRACKS), cards }, null, 1) + "\n", "public/quiz/cards.json")

// 5. Common traps: every "## Traps" section in one page
function section(body, heading) {
  const lines = body.split("\n")
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`)
  if (start < 0) return null
  const out = []
  for (let i = start + 1; i < lines.length && !/^## /.test(lines[i]) && !/^<!-- leads-to -->/.test(lines[i]); i++) out.push(lines[i])
  return out.join("\n").trim() || null
}
let traps = `---
title: Common traps
description: Every trap, gotcha and misconception from the wiki in one page, grouped by track.
generated: true
nolink: true
---

The mistakes that bite people in real code and in interviews, collected from every note. Each one links back to the
note that explains it. This page is generated, so it grows as the wiki does.
`
let trapCount = 0
for (const [key, name] of TRACKS) {
  const parts = notes
    .filter((n) => n.data.track === key && !n.data.generated)
    .sort((a, b) => a.data.title.localeCompare(b.data.title))
    .map((n) => [n, section(n.body, "Traps")])
    .filter(([, s]) => s)
  if (!parts.length) continue
  trapCount += parts.length
  traps += `\n## ${name}\n\n` + parts.map(([n, s]) => `### ${link(n)}\n\n${s}`).join("\n\n") + "\n"
}
write(join(CONTENT, "traps.md"), traps, "traps.md")

// 6. Stats on the home page
const realNotes = notes.filter((n) => n.data.type)
const edges = new Set()
for (const n of realNotes)
  for (const m of n.body.matchAll(/\[\[([^\]|#\\]+)/g)) if (bySlug.has(m[1].trim()) && m[1].trim() !== n.slug) edges.add(n.slug + ">" + m[1].trim())
const countType = (t) => realNotes.filter((n) => n.data.type === t).length
const stats =
  `<!-- stats -->\n**The wiki today:** ${countType("lesson")} lessons · ${countType("concept")} concepts · ` +
  `${countType("puzzle")} puzzles · ${edges.size} links between notes · ${cards.length} practice questions\n<!-- /stats -->`
const index = bySlug.get("index")
if (index) {
  const STATS = /<!-- stats -->[\s\S]*?<!-- \/stats -->/
  const body = STATS.test(index.body) ? index.body.replace(STATS, stats) : index.body.replace(/^\n*/, "\n" + stats + "\n\n")
  write(index.path, index.fm + body, index.rel)
}

for (const p of problems) console.log("  - " + p)
console.log(`${check ? "files needing regeneration" : "files updated"}: ${changed}`)
if (problems.length || (check && changed)) process.exit(1)
