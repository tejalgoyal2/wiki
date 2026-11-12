// Auto-linker: turns the first plain-text mention of each note's title or alias into a [[wikilink]].
//
//   node scripts/link.mjs          rewrite pages in place
//   node scripts/link.mjs --check  exit 1 if any page would change (for CI)
//
// Rules (see SCHEMA.md): never inside code, headings, callout titles, existing links or URLs;
// one link per target per page; no self-links; longest terms win; inside table rows the "|" is escaped.
import { writeFileSync } from "node:fs"
import { loadNotes, unquote, LINKABLE } from "./notes.mjs"

const check = process.argv.includes("--check")
const notes = loadNotes()

// term (lowercase) -> slug
const terms = new Map()
for (const n of notes) {
  if (!LINKABLE.has(n.data.type) || n.data.nolink) continue
  // The file name counts as a name too ("hash-map-lookup" -> "hash map lookup"), so aliases never need to repeat it.
  const names = [n.data.title, n.slug.replace(/-/g, " "), ...(n.data.aliases ?? [])].filter(Boolean).map(String)
  for (const t of names) {
    const key = t.toLowerCase().trim()
    if (key.length < 2) continue
    if (terms.has(key) && terms.get(key) !== n.slug) {
      console.warn(`alias "${t}" is used by both ${terms.get(key)} and ${n.slug}; keeping ${terms.get(key)}`)
      continue
    }
    terms.set(key, n.slug)
  }
}
const ordered = [...terms.keys()].sort((a, b) => b.length - a.length)
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const termRe = new Map(
  ordered.map((t) => [t, new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRe(t)}(?![\\p{L}\\p{N}_])`, "iu")]),
)

// Spans that must never be touched.
const PROTECTED = /(`[^`]*`|\[\[[^\]]*\]\]|!?\[[^\]]*\]\([^)]*\)|https?:\/\/\S+|<[^>]+>|\$[^$]+\$)/g

const linkedTargets = (body) =>
  new Set([...body.matchAll(/\[\[([^\]|#\\]+)/g)].map((m) => m[1].trim().toLowerCase()))

function linkLine(line, linked, self, inTable) {
  for (const term of ordered) {
    const slug = terms.get(term)
    if (slug === self || linked.has(slug)) continue
    const parts = line.split(PROTECTED)
    let done = false
    for (let i = 0; i < parts.length && !done; i += 2) {
      // even indexes are plain text, odd ones are protected spans
      const m = parts[i].match(termRe.get(term))
      if (!m) continue
      const sep = inTable ? "\\|" : "|"
      const link = `[[${slug}${sep}${m[0]}]]`
      parts[i] = parts[i].slice(0, m.index) + link + parts[i].slice(m.index + m[0].length)
      done = true
    }
    if (done) {
      line = parts.join("")
      linked.add(slug)
    }
  }
  return line
}

let changed = 0
for (const n of notes) {
  if (n.data.nolink) continue
  const linked = linkedTargets(n.body)
  let inFence = false
  const out = n.body.split("\n").map((raw) => {
    const line = unquote(raw)
    if (/^(```|~~~)/.test(line.trim())) {
      inFence = !inFence
      return raw
    }
    if (inFence) return raw
    const isTable = line.trimStart().startsWith("|")
    let fixed = raw
    // Unescaped [[a|b]] inside a table row breaks the table: escape the pipe.
    if (isTable) fixed = fixed.replace(/\[\[([^\]|\\]+)\|([^\]]+)\]\]/g, "[[$1\\|$2]]")
    if (/^#{1,6}\s/.test(line) || /^\[!/.test(line.trim())) return fixed
    return linkLine(fixed, linked, n.slug, isTable)
  })
  const body = out.join("\n")
  if (body !== n.body) {
    changed++
    if (check) console.log(`would link: ${n.rel}`)
    else writeFileSync(n.path, n.fm + body)
  }
}
console.log(`${check ? "pages needing links" : "pages updated"}: ${changed}`)
if (check && changed) process.exit(1)
