// After `npm run build`: every internal link in the built site must lead to a page that exists.
//   node scripts/check-built.mjs [dist]
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { join, dirname, resolve } from "node:path"

const root = resolve(process.argv[2] ?? "dist")
const pages = []
const walk = (d) =>
  readdirSync(d).forEach((n) => {
    const p = join(d, n)
    statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") && pages.push(p)
  })
walk(root)

const exists = (p) =>
  [p, p + ".html", join(p, "index.html")].some((c) => existsSync(c) && statSync(c).isFile())

const broken = new Set()
for (const page of pages) {
  const html = readFileSync(page, "utf8")
  for (const [, href] of html.matchAll(/<a [^>]*href="([^"]+)"/g)) {
    if (/^(https?:|mailto:|#|data:)/.test(href) || href.includes("${")) continue // ${...}: a template inside a script
    const path = href.split(/[#?]/)[0]
    if (!path || path.startsWith("/wanted/")) continue
    const target = path.startsWith("/") ? join(root, path) : resolve(dirname(page), path)
    if (!exists(target)) broken.add(`${page.slice(root.length + 1)} -> ${href}`)
  }
}
console.log(`built pages: ${pages.length}, broken links: ${broken.size}`)
for (const b of broken) console.log("  - " + b)
if (broken.size) process.exit(1)
