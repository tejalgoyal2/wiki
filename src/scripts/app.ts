// What the reader's browser does: search, unfolding terms in place, remembering what you've opened.
// No framework. Pages read fine without it; this is what makes them feel like one continuous text.
import { navigate } from "astro:transitions/client"

type Entry = { s: string; u: string; t: string; a: string[]; d: string; k: string }
type Hit = Partial<Entry> & { t: string; d: string; k: string; want?: string }

const $ = <T extends HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)
const $$ = <T extends HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)]
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}+#.]+/gu, " ").trim()
const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches

const store = {
  get<T>(key: string, fallback: T): T {
    try {
      return JSON.parse(localStorage.getItem("wiki:" + key)!) ?? fallback
    } catch {
      return fallback
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem("wiki:" + key, JSON.stringify(value))
    } catch {}
  },
}

// ---------- options (kept in this browser only) ----------

type Prefs = { theme: string; font: string; size: string; open: string }
const DEFAULTS: Prefs = { theme: "auto", font: "serif", size: "m", open: "unfold" }
const PAPERS = ["paper", "sand", "night"]
const prefs = (): Prefs => ({ ...DEFAULTS, ...store.get<Partial<Prefs>>("prefs", {}) })

function applyPrefs(root = document.documentElement) {
  const p = prefs()
  root.dataset.theme = PAPERS.includes(p.theme) ? p.theme : matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "paper"
  root.dataset.font = p.font
  root.dataset.size = p.size
  $$("[data-pref]").forEach((b) => b.setAttribute("aria-pressed", String(p[b.dataset.pref as keyof Prefs] === b.dataset.value)))
}
function setPref(key: keyof Prefs, value: string) {
  store.set("prefs", { ...prefs(), [key]: value })
  applyPrefs()
}

let toastTimer = 0
function toast(text: string) {
  let t = $("#toast")
  if (!t) document.body.append((t = Object.assign(document.createElement("div"), { id: "toast" })))
  t.textContent = text
  void t.offsetWidth
  t.classList.add("on")
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => t!.classList.remove("on"), 2200)
}

// ---------- what you've opened and what you understand ----------

const meet = (slug: string) => {
  const seen = store.get<Record<string, number>>("seen", {})
  if (!seen[slug]) store.set("seen", { ...seen, [slug]: Date.now() })
}
function decorate(root: ParentNode = document) {
  const seen = store.get<Record<string, number>>("seen", {})
  const known = store.get<Record<string, number>>("known", {})
  $$("a[data-slug]", root).forEach((a) => {
    const s = a.dataset.slug!
    a.classList.toggle("known", !!known[s])
    a.classList.toggle("seen", !known[s] && !!seen[s])
  })
  const slug = document.body.dataset.slug
  const btn = $("[data-gotit]")
  if (btn && slug) {
    btn.classList.toggle("on", !!known[slug])
    btn.textContent = known[slug] ? "Understood" : "I understand this"
  }
  const you = $("[data-you]")
  const opened = $$(".wall a.seen, .wall a.known").length
  if (you && opened) you.textContent = `${you.dataset.total} notes. You've opened ${opened}; the pale ones are still waiting.`
}

// ---------- search ----------

let index: Promise<Entry[]> | null = null
const getIndex = () => (index ??= fetch("/search.json").then((r) => r.json()))

function rank(q: string, all: Entry[]): Entry[] {
  const score = (e: Entry) => {
    let best = 0
    ;[e.t, ...e.a].map(norm).forEach((n, i) => {
      const own = i === 0 ? 5 : 0
      if (n === q) best = Math.max(best, 100 + own)
      else if (n.startsWith(q)) best = Math.max(best, 80 + own)
      else if (n.split(" ").some((w) => w.startsWith(q))) best = Math.max(best, 60 + own)
      else if (n.includes(q)) best = Math.max(best, 40 + own)
    })
    if (!best && q.length > 2 && norm(e.d).includes(q)) best = 10
    return best
  }
  return all
    .map((e) => [score(e), e] as const)
    .filter(([s]) => s > 0)
    .sort((a, b) => b[0] - a[0] || a[1].t.length - b[1].t.length)
    .map(([, e]) => e)
}

function wire(box: HTMLElement) {
  const input = $<HTMLInputElement>("input", box)!
  const list = $(".results", box)!
  const wall = box.id === "hero-q" ? $(".wall") : null // on the home page the index filters as you type
  let items: Hit[] = []
  let sel = 0
  const paint = () => {
    list.innerHTML = items
      .map(
        (h, i) =>
          `<li role="option" aria-selected="${i === sel}" data-i="${i}" class="${h.want ? "ask" : ""}">` +
          `<div class="r1">${esc(h.t)}<small>${esc(h.k)}</small></div><div class="r2">${esc(h.d)}</div></li>`,
      )
      .join("")
  }
  const mark = (found: Entry[] | null) => {
    if (!wall) return
    const hit = new Set(found?.map((e) => e.s))
    wall.classList.toggle("filtering", !!found)
    $$("a", wall).forEach((a) => a.classList.toggle("hit", hit.has(a.dataset.slug!)))
  }
  const go = (h?: Hit) => {
    if (!h) return
    $<HTMLDialogElement>("#palette")?.close()
    navigate(h.want ? `/wanted/?q=${encodeURIComponent(h.want)}` : h.u!)
  }
  input.addEventListener("input", async () => {
    const typed = input.value.trim()
    const q = norm(typed)
    if (!q) {
      items = []
      mark(null)
      return paint()
    }
    const found = rank(q, await getIndex())
    if (norm(input.value) !== q) return // typed more while loading
    mark(found)
    items = found.slice(0, 6)
    // Offer a draft only when no note's name matches what was typed.
    const named = found.some((e) => [e.t, ...e.a].some((n) => norm(n).includes(q)))
    if (!named && q.length > 1)
      items.push({ t: `No note on “${typed}” yet`, d: "Press enter for a quick draft. It also joins the list of notes to write.", k: "", want: typed })
    sel = 0
    paint()
  })
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      sel = (sel + (e.key === "ArrowDown" ? 1 : items.length - 1)) % Math.max(items.length, 1)
      paint()
    } else if (e.key === "Enter") go(items[sel])
    else if (e.key === "Escape" && !box.closest("dialog")) {
      input.value = ""
      input.dispatchEvent(new Event("input"))
      input.blur()
    }
  })
  list.addEventListener("click", (e) => go(items[Number((e.target as Element).closest("li")?.dataset.i)]))
}

function openSearch() {
  const hero = $<HTMLInputElement>("#hero-q input")
  if (hero) {
    hero.focus()
    return hero.scrollIntoView({ block: "center", behavior: calm() ? "auto" : "smooth" })
  }
  const p = $<HTMLDialogElement>("#palette")!
  if (!p.open) p.showModal()
  $<HTMLInputElement>("input", p)!.focus()
}

// The home line types out words from the index while it waits for you.
async function suggest(input: HTMLInputElement) {
  const words = $$(".wall a").map((a) => a.textContent!.trim().toLowerCase()).filter((w) => w.length < 22)
  if (calm() || !words.length) return
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
  while (input.isConnected) {
    await wait(2600)
    const word = words[Math.floor(Math.random() * words.length)]
    for (let n = 1; n <= word.length && input.isConnected; n++) {
      input.placeholder = word.slice(0, n)
      await wait(55)
    }
  }
}

// ---------- unfolding: a term opens inside the text; terms inside it unfold again ----------

const boxes = new Map<HTMLAnchorElement, HTMLElement>()
let opened: HTMLElement[] = [] // in the order they were unfolded, so esc folds the latest

function fold(box: HTMLElement) {
  for (const [a, b] of boxes) {
    if (box.contains(b)) {
      a.classList.remove("open")
      a.style.removeProperty("--u")
      boxes.delete(a)
    }
  }
  opened = opened.filter((b) => !box.contains(b))
  box.classList.remove("in")
  setTimeout(() => box.remove(), calm() ? 0 : 560)
}

async function unfold(a: HTMLAnchorElement) {
  const had = boxes.get(a)
  if (had) return fold(had)
  const { slug, want } = a.dataset
  if (slug && slug === document.body.dataset.slug && !a.closest(".unfold")) return toast("That's the note you're reading")

  const box = document.createElement("aside")
  box.className = "unfold"
  box.innerHTML = `<div><div class="u"><p class="wait">Opening…</p></div></div>`
  // Open right after the sentence's own block, or inside the list item or table cell that holds it.
  const cell = a.closest("li, td, dd")
  if (cell) cell.append(box)
  else a.closest("p, blockquote, div")!.after(box)
  boxes.set(a, box)
  opened.push(box)
  a.classList.add("open")
  a.style.setProperty("--u", getComputedStyle(box).getPropertyValue("--u")) // the term takes its level's pencil colour
  void box.offsetHeight // let the closed state register, so opening animates
  box.classList.add("in")

  let html: string
  try {
    html = slug ? await noteHtml(slug) : await draftHtml(want!)
  } catch {
    html = `<p class="wait">Couldn't load that. Check your connection and try again.</p>`
  }
  $(".u", box)!.innerHTML = html
  decorate(box)
}

async function noteHtml(slug: string) {
  const n = await fetch(`/f/${slug}.json`).then((r) => r.json())
  meet(n.slug)
  return (
    `<header><a href="${n.url}">${esc(n.title)}</a><i>${esc(n.kind.toLowerCase())}</i><button type="button" data-fold>fold</button></header>` +
    `<p class="ul">${esc(n.lead)}</p>${n.html}<a class="more" href="${n.url}">The whole note, ${n.minutes} min →</a>`
  )
}

async function draftHtml(term: string) {
  const all = await getIndex()
  const link = (name: string) => {
    const e = all.find((e) => [e.t, ...e.a].some((n) => norm(n) === norm(name)))
    return e
      ? `<a class="term" href="${e.u}" data-slug="${e.s}">${esc(name)}</a>`
      : `<a class="term wanted" href="/wanted/?q=${encodeURIComponent(name)}" data-want="${esc(name)}">${esc(name)}</a>`
  }
  const head = (title: string) => `<header><a>${esc(title)}</a><i>unchecked draft</i><button type="button" data-fold>fold</button></header>`
  const r = await fetch(`/api/draft?term=${encodeURIComponent(term)}`).then((r) => r.json())
  if (r.status === "draft") {
    const paras = String(r.body).split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join("")
    const related = (r.related ?? []).length ? `<p>Related: ${r.related.map(link).join(", ")}</p>` : ""
    return (
      `${head(r.title)}<p class="ul">${esc(r.one_line)}</p>${paras}${related}` +
      `<p class="draft">A small open model wrote this a moment ago and nobody has checked it against sources: a first sketch, not a note. ` +
      `The request is counted, and the most wanted terms get a real note, written from primary sources, in the next daily run.</p>`
    )
  }
  if (r.status === "no") return `${head(term)}<p class="ul">That doesn't look like a term this wiki covers. If it is one, it has been noted.</p>`
  return `${head(term)}<p class="ul">No note yet. It is now on the <a href="/wanted/">wanted list</a>; the most wanted are written first.</p>`
}

// ] and [ step through the terms on the page, unfolding one at a time.
let cursor = -1
let walked: HTMLAnchorElement | null = null
function walk(step: number) {
  const terms = $$<HTMLAnchorElement>("main .prose a.term").filter((a) => !a.closest(".unfold"))
  if (!terms.length) return toast("No terms on this page")
  if (walked && boxes.has(walked)) fold(boxes.get(walked)!)
  cursor = cursor < 0 && step < 0 ? terms.length - 1 : (cursor + step + terms.length) % terms.length
  walked = terms[cursor]
  walked.scrollIntoView({ block: "center", behavior: calm() ? "auto" : "smooth" })
  unfold(walked)
}

// ---------- small things ----------

async function diagrams() {
  const nodes = $$("pre.mermaid:not([data-processed])")
  if (!nodes.length) return
  const src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs"
  const mermaid = (await import(/* @vite-ignore */ src)).default
  const dark = document.documentElement.dataset.theme === "night"
  mermaid.initialize({ startOnLoad: false, theme: dark ? "dark" : "neutral", fontFamily: "Geist Variable, system-ui, sans-serif" })
  await mermaid.run({ nodes })
}

async function wantedPage() {
  const live = $("[data-wanted-live]")
  if (!live) return
  const q = new URLSearchParams(location.search).get("q")
  if (q) {
    const here = $("[data-draft-here]")!
    here.innerHTML = `<aside class="unfold in"><div><div class="u"><p class="wait">Sketching “${esc(q)}”…</p></div></div></aside>`
    draftHtml(q).then((html) => (($(".u", here)!.innerHTML = html), decorate(here)))
  }
  try {
    const rows: { term: string; count: number }[] = await fetch("/api/wanted").then((r) => r.json())
    const all = await getIndex()
    const open = rows.filter((r) => !all.some((e) => [e.t, ...e.a].some((n) => norm(n) === norm(r.term))))
    live.innerHTML = open.length
      ? open.map((r) => `<a class="term wanted" href="/wanted/?q=${encodeURIComponent(r.term)}" data-want="${esc(r.term)}">${esc(r.term)} <small>${r.count}</small></a>`).join("")
      : "Nothing yet. Search for a term that has no note and it will show up here."
  } catch {
    live.textContent = "Couldn't load the list right now."
  }
}

function understood() {
  const slug = document.body.dataset.slug
  if (!slug || !$("[data-gotit]")) return
  const known = store.get<Record<string, number>>("known", {})
  if (known[slug]) delete known[slug]
  else {
    known[slug] = Date.now()
    toast(`${Object.keys(known).length} understood`)
  }
  store.set("known", known)
  decorate()
}

async function random() {
  const pool = (await getIndex()).filter((e) => e.k && e.s !== document.body.dataset.slug)
  navigate(pool[Math.floor(Math.random() * pool.length)].u)
}

function openSheet(id: string) {
  $$<HTMLDialogElement>("dialog[open]").forEach((d) => d.close())
  $<HTMLDialogElement>(id)!.showModal()
}

// ---------- wiring ----------

document.addEventListener("click", (e) => {
  const el = e.target as Element
  const term = el.closest<HTMLAnchorElement>("a.term")
  const inText = term?.closest(".prose, .lead")
  const here = prefs().open === "unfold" || term?.dataset.want || term?.closest(".unfold")
  if (term && inText && here && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
    e.preventDefault()
    return void unfold(term)
  }
  if (el.closest("[data-fold]")) return fold(el.closest<HTMLElement>(".unfold")!)
  if (el instanceof HTMLDialogElement) return el.close() // a click outside the panel
  if (el.closest("[data-open-search]")) return openSearch()
  if (el.closest("[data-open-prefs]")) return openSheet("#prefs")
  if (el.closest("[data-open-keys]")) return openSheet("#keys")
  const pref = el.closest<HTMLElement>("[data-pref]")
  if (pref) return setPref(pref.dataset.pref as keyof Prefs, pref.dataset.value!)
  if (el.closest("[data-gotit]")) understood()
}, true) // capture: decide before the page router treats a term as an ordinary link

// Hovering a word in the index shows what it means, without leaving the page.
document.addEventListener("mouseover", (e) => {
  const word = (e.target as Element).closest?.<HTMLElement>(".wall a[data-d]")
  const line = $("[data-define]")
  if (line) line.textContent = word ? `${word.textContent!.trim()}: ${word.dataset.d}` : ""
})

document.addEventListener("keydown", (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as Element).tagName)
  if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    return openSearch()
  }
  if (typing || e.metaKey || e.ctrlKey || e.altKey || $("dialog[open]")) return
  const keys: Record<string, () => unknown> = {
    "/": openSearch,
    "?": () => openSheet("#keys"),
    ",": () => openSheet("#prefs"),
    r: random,
    h: () => navigate("/"),
    w: () => navigate("/wanted/"),
    d: () => document.body.dataset.today && navigate(document.body.dataset.today),
    u: understood,
    "]": () => walk(1),
    "[": () => walk(-1),
    t: () => {
      const next = PAPERS[(PAPERS.indexOf(document.documentElement.dataset.theme!) + 1) % PAPERS.length]
      setPref("theme", next)
      toast(next[0].toUpperCase() + next.slice(1))
    },
    f: () => toast(document.documentElement.classList.toggle("focus") ? "Focus. Press f to come back." : "Back"),
    a: () => {
      const all = $$<HTMLDetailsElement>("main details.callout")
      const open = !all.every((d) => d.open)
      all.forEach((d) => (d.open = open))
    },
    Escape: () => opened.length && fold(opened.at(-1)!),
  }
  if (!keys[e.key]) return
  e.preventDefault()
  keys[e.key]()
})

document.addEventListener("astro:before-swap", (e: any) => {
  boxes.clear()
  opened = []
  applyPrefs(e.newDocument.documentElement) // carry the reader's paper onto the next page
})

document.addEventListener("astro:page-load", () => {
  const slug = document.body.dataset.slug
  if (slug) meet(slug)
  cursor = -1
  walked = null
  applyPrefs()
  decorate()
  $$(".q").forEach(wire)
  const hero = $<HTMLInputElement>("#hero-q input")
  if (hero) {
    if (matchMedia("(pointer: fine)").matches) hero.focus({ preventScroll: true })
    suggest(hero)
  }
  diagrams()
  wantedPage()
})
