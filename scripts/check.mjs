// Checks that must pass before the site is published:
//   1. frontmatter: required fields, known type, right folder
//   2. links: a [[wikilink]] to a note that does not exist yet is allowed (the site shows it as "wanted"),
//      but it is reported, so a typo does not pass unnoticed
//   3. code: every block marked "run" (```js run, ```py run) runs without error
//
//   node scripts/check.mjs            all checks
//   node scripts/check.mjs --no-run   skip running code
import { mkdtempSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { spawnSync } from "node:child_process"
import { loadNotes, unquote, TYPES, FOLDER_OF } from "./notes.mjs"

const notes = loadNotes()
const errors = []
const err = (n, msg) => errors.push(`${n.rel}: ${msg}`)

// 1. frontmatter
for (const n of notes) {
  const d = n.data
  if (!d.title) err(n, "missing title")
  if (!d.description) err(n, "missing description")
  const top = !n.rel.includes("/")
  if (top) continue // index.md, about.md
  if (!TYPES.has(d.type)) err(n, `unknown type "${d.type}"`)
  else if (!n.rel.startsWith(FOLDER_OF[d.type] + "/")) err(n, `type ${d.type} belongs in ${FOLDER_OF[d.type]}/`)
  if (!d.created || !d.updated) err(n, "missing created/updated")
  if (d.type === "lesson" && typeof d.lesson !== "number") err(n, "lesson needs a lesson number")
  if (d.type === "concept" && !d.sources?.length) err(n, "concept needs at least one source")
  // The linker already links the file name, so an alias that repeats it is noise.
  for (const a of d.aliases ?? []) {
    if (String(a).toLowerCase().trim().replace(/\s+/g, "-") === n.slug.toLowerCase())
      err(n, `alias "${a}" repeats the file name; remove it (the linker already uses the file name)`)
  }
}

// 2. links
const slugs = new Set(notes.map((n) => n.slug.toLowerCase()))
const wanted = new Map()
for (const n of notes) {
  let inFence = false
  for (const raw of n.body.split("\n")) {
    const line = unquote(raw)
    if (/^(```|~~~)/.test(line.trim())) inFence = !inFence
    if (inFence) continue
    for (const m of line.replace(/`[^`]*`/g, "").matchAll(/\[\[([^\]|#\\]+)/g)) {
      const target = m[1].trim().toLowerCase()
      if (!/^[a-z0-9][a-z0-9 .+#-]*$/.test(target)) err(n, `odd link target [[${m[1]}]]`)
      else if (!slugs.has(target)) wanted.set(target, [...(wanted.get(target) ?? []), n.rel])
    }
  }
}

// 3. runnable code
const RUNNERS = {
  js: ["node"],
  javascript: ["node"],
  py: ["python3", "-I"],
  python: ["python3", "-I"],
}
if (!process.argv.includes("--no-run")) {
  const dir = mkdtempSync(join(tmpdir(), "wiki-check-"))
  let ran = 0
  for (const n of notes) {
    const lines = n.body.split("\n")
    for (let i = 0; i < lines.length; i++) {
      const open = unquote(lines[i]).trim().match(/^```(\w+)\s+run\b/)
      if (!open) continue
      const lang = open[1]
      const code = []
      let j = i + 1
      while (j < lines.length && !/^```/.test(unquote(lines[j]).trim())) code.push(unquote(lines[j])), j++
      i = j
      if (!RUNNERS[lang]) {
        err(n, `don't know how to run "${lang}"`)
        continue
      }
      const file = join(dir, `block-${ran}.${lang.startsWith("p") ? "py" : "mjs"}`)
      writeFileSync(file, code.join("\n"))
      const [cmd, ...args] = RUNNERS[lang]
      const r = spawnSync(cmd, [...args, file], { encoding: "utf8", timeout: 15000, cwd: dir })
      ran++
      if (r.status !== 0) err(n, `${lang} block failed:\n${(r.stderr || r.error?.message || "").trim().split("\n").slice(-3).join("\n")}`)
    }
  }
  rmSync(dir, { recursive: true, force: true })
  console.log(`code blocks run: ${ran}`)
}

if (wanted.size) {
  console.log(`wanted (linked, not written yet): ${wanted.size}`)
  for (const [t, from] of wanted) console.log(`  + ${t}  <- ${[...new Set(from)].join(", ")}`)
}
console.log(`notes: ${notes.length}, problems: ${errors.length}`)
for (const e of errors) console.log("  - " + e)
if (errors.length) process.exit(1)
