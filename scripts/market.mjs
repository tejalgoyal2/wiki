// Writes content/market.md: the terms Canadian entry-level tech job posts asked for this week, and whether the
// wiki covers each one yet. Source: the public gap report of lockin (github.com/tejalgoyal2/lockin), a job scanner.
// Needs the network, so it runs in the daily lesson job, not in CI.
//
//   node scripts/market.mjs
import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { loadNotes, CONTENT, LINKABLE } from "./notes.mjs"

const SRC = "https://raw.githubusercontent.com/tejalgoyal2/lockin/main/reports/gaps.md"
const text = await fetch(SRC).then((r) => {
  if (!r.ok) throw new Error(`gap report: HTTP ${r.status}`)
  return r.text()
})

const generated = text.match(/Generated (\d{4}-\d{2}-\d{2})/)?.[1] ?? "unknown date"
function table(title) {
  const start = text.indexOf(title)
  if (start < 0) return { jobs: null, rows: [] }
  const jobs = text.slice(start).match(/\((\d+) jobs with a JD\)/)?.[1]
  const rows = []
  for (const line of text.slice(start).split("\n").slice(1)) {
    if (/^## /.test(line)) break
    const m = line.match(/^\| ([^|]+?) \| (\d+) \|/)
    if (m) rows.push({ term: m[1].trim(), count: Number(m[2]) })
  }
  return { jobs, rows }
}
const week = table("last 7 days")
const month = table("last 30 days")

// Which wiki note covers a term? Match on titles, file names and aliases, ignoring case.
const names = new Map()
for (const n of loadNotes()) {
  if (!LINKABLE.has(n.data.type)) continue
  for (const t of [n.data.title, n.slug.replace(/-/g, " "), ...(n.data.aliases ?? [])]) names.set(String(t).toLowerCase(), n)
}
const covered = (term) => names.get(term.toLowerCase())
const cell = (term) => {
  const n = covered(term)
  return n ? `[[${n.slug}\\|${n.data.title}]]` : "not yet"
}
const rowsMd = (rows) => rows.map((r) => `| ${r.term} | ${r.count} | ${cell(r.term)} |`).join("\n")
const share = (rows) => (rows.length ? Math.round((100 * rows.filter((r) => covered(r.term)).length) / rows.length) : 0)

const page = `---
title: What the job market asks for
description: The skills Canadian entry-level tech job posts asked for this week, and which of them this wiki covers yet.
generated: true
nolink: true
---

This wiki's to-learn list is driven by real job posts. [lockin](https://github.com/tejalgoyal2/lockin), an
open-source job scanner, reads the descriptions of new entry-level and new-grad tech jobs in Canada every day and
counts the skills they ask for. The terms below are the ones that its owner's skill list doesn't cover yet, so
everyday skills like Python, JavaScript and SQL are left out on purpose: this is a list of **what to learn next**.

Report date: ${generated}. **This wiki covers ${share(week.rows)}% of this week's top terms.**

## Last 7 days${week.jobs ? ` (${week.jobs} job descriptions)` : ""}

| Term | Job posts | In the wiki |
|---|---:|---|
${rowsMd(week.rows)}

## Last 30 days${month.jobs ? ` (${month.jobs} job descriptions)` : ""}

| Term | Job posts | In the wiki |
|---|---:|---|
${rowsMd(month.rows.slice(0, 15))}

Each lesson's **Market word** takes the top term that has no note yet, so this page fills up over time.
`
writeFileSync(join(CONTENT, "market.md"), page)
console.log(`market.md: ${week.rows.length} terms this week, ${share(week.rows)}% covered (report ${generated})`)
