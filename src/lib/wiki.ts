// Loads every note in content/, renders it, and works out the graph between notes.
// Runs once per build; every page and JSON endpoint reads from here.
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative, basename } from "node:path"
import YAML from "yaml"
import MarkdownIt from "markdown-it"
import { createHighlighter } from "shiki"

const ROOT = join(process.cwd(), "content")

export const TRACKS: Record<string, string> = {
  javascript: "JavaScript",
  "python-data": "Python & Data",
  ml: "ML & Data Science",
  "llm-rag": "LLMs & RAG",
  backend: "Backend & System Design",
  "cs-fundamentals": "CS Fundamentals",
}

export type Note = {
  slug: string // file name without .md: what [[links]] point at
  url: string
  type: string // lesson | concept | puzzle | pattern | reference | path | review | page
  title: string
  lead: string // the one-line answer
  data: Record<string, any>
  body: string
  html: string
  peek: string // the opening of the note, shown in the side trail
  words: number
  minutes: number
  requires: Note[]
  leadsTo: Note[]
  mentionedIn: Note[]
}

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : name.endsWith(".md") ? [p] : []
  })

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const slugify = (s: string) =>
  s.toLowerCase().replace(/`/g, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "")

// ---------- markdown ----------

const THEMES = { light: "vitesse-light", dark: "vitesse-dark" }
const hl = await createHighlighter({
  themes: Object.values(THEMES),
  langs: ["js", "ts", "python", "java", "sql", "bash", "json", "yaml", "html", "css", "go", "rust", "c", "cpp", "http", "diff"],
})
const LANG: Record<string, string> = { py: "python", javascript: "js", typescript: "ts", sh: "bash", shell: "bash" }

const md = new MarkdownIt({ html: true })

// ```js run  ->  highlighted code with a small "this code is run before publishing" mark
md.renderer.rules.fence = (tokens, i) => {
  const [name = "", ...flags] = tokens[i].info.trim().split(/\s+/)
  const code = tokens[i].content.replace(/\n$/, "")
  if (name === "mermaid") return `<pre class="mermaid">${esc(code)}</pre>\n`
  const lang = LANG[name] ?? name
  const known = hl.getLoadedLanguages().includes(lang)
  const html = hl.codeToHtml(code, { lang: known ? lang : "text", themes: THEMES, defaultColor: false })
  const run = flags.includes("run") ? `<span class="runs" title="This code is run before every publish">runs ✓</span>` : ""
  return `<figure class="code"><figcaption><span>${esc(name)}</span>${run}</figcaption>${html}</figure>\n`
}

// [[target]] and [[target|label]]
md.inline.ruler.before("link", "wikilink", (state, silent) => {
  const { src, pos } = state
  if (src.charCodeAt(pos) !== 0x5b || src.charCodeAt(pos + 1) !== 0x5b) return false
  const end = src.indexOf("]]", pos + 2)
  if (end < 0) return false
  const inner = src.slice(pos + 2, end)
  if (inner.includes("\n")) return false
  if (!silent) {
    const [target, label] = inner.split("|")
    state.push("wikilink", "", 0).meta = { target: target.split("#")[0].trim(), label: label?.trim() }
  }
  state.pos = end + 2
  return true
})
md.renderer.rules.wikilink = (tokens, i, _o, env) => env.link(tokens[i].meta.target, tokens[i].meta.label)

// > [!question]- Title   ->  a callout; "-" means folded
md.core.ruler.after("block", "callout", (state) => {
  const t = state.tokens
  for (let i = 0; i < t.length; i++) {
    if (t[i].type !== "blockquote_open" || t[i + 2]?.type !== "inline") continue
    const m = t[i + 2].content.match(/^\[!(\w+)\]([-+]?)[ \t]*([^\n]*)\n?/)
    if (!m) continue
    t[i + 2].content = t[i + 2].content.slice(m[0].length)
    let depth = 0
    let j = i
    for (; j < t.length; j++) {
      if (t[j].type === "blockquote_open") depth++
      else if (t[j].type === "blockquote_close" && --depth === 0) break
    }
    const fold = m[2] === "-"
    t[i].type = "callout_open"
    t[i].meta = { kind: m[1], fold, title: m[3] || m[1][0].toUpperCase() + m[1].slice(1) }
    t[j].type = "callout_close"
    t[j].meta = { fold }
  }
})
md.renderer.rules.callout_open = (tokens, i, _o, env) => {
  const { kind, fold, title } = tokens[i].meta
  const head = md.renderInline(title, env)
  return fold
    ? `<details class="callout c-${kind}"><summary>${head}</summary><div class="callout-body">`
    : `<div class="callout c-${kind}"><p class="callout-title">${head}</p><div class="callout-body">`
}
md.renderer.rules.callout_close = (tokens, i) => (tokens[i].meta.fold ? "</div></details>\n" : "</div></div>\n")

md.core.ruler.push("heading-ids", (state) => {
  state.tokens.forEach((tok, i) => {
    if (tok.type === "heading_open") tok.attrSet("id", slugify(state.tokens[i + 1].content))
  })
})
md.renderer.rules.table_open = () => `<div class="table"><table>\n`
md.renderer.rules.table_close = () => `</table></div>\n`

// ---------- notes ----------

const GENERATED = /<!-- (read-first|leads-to|stats) -->[\s\S]*?<!-- \/\1 -->\n*/g

const raw = walk(ROOT)
  .map((path) => {
    const text = readFileSync(path, "utf8")
    const m = text.match(/^---\n([\s\S]*?)\n---\n?/)
    const data = m ? (YAML.parse(m[1]) ?? {}) : {}
    const rel = relative(ROOT, path).replace(/\.md$/, "")
    return { rel, slug: basename(rel), data, body: text.slice(m?.[0].length ?? 0).replace(GENERATED, "") }
  })
  .filter((n) => n.rel !== "index")

const bySlug = new Map<string, Note>()
export const notes: Note[] = raw.map((r) => {
  const words = r.body.split(/\s+/).length
  const note: Note = {
    slug: r.slug,
    url: `/${r.rel}/`,
    type: r.data.type ?? "page",
    title: String(r.data.title ?? r.slug),
    lead: String(r.data.description ?? ""),
    data: r.data,
    body: r.body,
    html: "",
    peek: "",
    words,
    minutes: Math.max(1, Math.round(words / 120)), // technical reading with code is slow reading
    requires: [],
    leadsTo: [],
    mentionedIn: [],
  }
  bySlug.set(r.slug.toLowerCase(), note)
  return note
})

/** Terms that notes link to but nobody has written yet: the edge of the map. */
export const wanted = new Map<string, Set<Note>>()

function render(note: Note, source: string, track: boolean) {
  const env = {
    link(target: string, label?: string) {
      const to = bySlug.get(target.toLowerCase())
      if (to) {
        if (track && to !== note && !to.mentionedIn.includes(note)) to.mentionedIn.push(note)
        return `<a class="term" href="${to.url}" data-slug="${to.slug}">${esc(label ?? to.title)}</a>`
      }
      if (track) (wanted.get(target) ?? wanted.set(target, new Set()).get(target)!).add(note)
      return `<a class="term wanted" href="/wanted/?q=${encodeURIComponent(target)}" data-want="${esc(target)}">${esc(label ?? target)}</a>`
    },
  }
  return md.render(source, env).replace(/<p><\/p>\n?/g, "")
}

for (const note of notes) {
  note.html = render(note, note.body, true)
  // The side trail shows the opening of a note: everything before its first heading
  // (plus the first section when the opening is only a sentence or two).
  const parts = note.body.split(/^(?=## )/m)
  const opening = parts[0].split(/\s+/).length < 60 && parts[1] ? parts[0] + parts[1] : parts[0]
  note.peek = render(note, opening, false)
  for (const slug of note.data.requires ?? []) {
    const req = bySlug.get(String(slug).toLowerCase())
    if (req) {
      note.requires.push(req)
      req.leadsTo.push(note)
    }
  }
}
for (const n of notes) {
  // "Mentioned in" is for mentions that the learning order doesn't already show.
  n.mentionedIn = n.mentionedIn.filter((m) => !n.requires.includes(m) && !n.leadsTo.includes(m))
}

export const find = (slug: string) => bySlug.get(slug.toLowerCase())
export const ofType = (type: string) => notes.filter((n) => n.type === type)
export const lessons = ofType("lesson").sort((a, b) => b.data.lesson - a.data.lesson)

export const kind = (n: Note) =>
  n.type === "lesson" ? `Lesson ${n.data.lesson}` : n.type === "page" ? "" : n.type[0].toUpperCase() + n.type.slice(1)

export const day = (d: unknown) =>
  d ? new Date(String(d)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : ""

/** Every pair of notes joined by a link or a "requires". */
export function edges() {
  const seen = new Set<string>()
  const add = (a: Note, b: Note) => seen.add([a.slug, b.slug].sort().join("|"))
  for (const n of notes) {
    n.requires.forEach((r) => add(n, r))
    n.mentionedIn.forEach((m) => add(n, m))
  }
  return [...seen].map((s) => s.split("|"))
}
