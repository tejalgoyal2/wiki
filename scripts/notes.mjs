// Shared helpers: load every note in content/ with its frontmatter.
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative, basename } from "node:path"
import YAML from "yaml"

export const CONTENT = new URL("../content/", import.meta.url).pathname

// Notes of these types can be link targets; lessons, reviews and pages like index/about cannot.
export const LINKABLE = new Set(["concept", "pattern", "reference", "puzzle", "path"])
export const TYPES = new Set(["lesson", "concept", "puzzle", "pattern", "reference", "path", "review"])
export const FOLDER_OF = {
  lesson: "lessons",
  concept: "concepts",
  puzzle: "puzzles",
  pattern: "patterns",
  reference: "references",
  path: "paths",
  review: "reviews",
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return walk(p)
    return name.endsWith(".md") ? [p] : []
  })
}

export function splitFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!m) return { data: {}, fm: "", body: text }
  return { data: YAML.parse(m[1]) ?? {}, fm: m[0], body: text.slice(m[0].length) }
}

export function loadNotes() {
  return walk(CONTENT).map((path) => {
    const text = readFileSync(path, "utf8")
    const { data, fm, body } = splitFrontmatter(text)
    return { path, rel: relative(CONTENT, path), slug: basename(path, ".md"), data, fm, body, text }
  })
}

// Strip callout markers ("> ") so code fences inside callouts are found too.
export const unquote = (line) => line.replace(/^(\s*>\s?)+/, "")
