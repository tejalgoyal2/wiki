// Everything the reader's browser does: search, the side trail, remembering what you've met,
// the map on the home page. No framework; pages work without it, this makes them smooth.
import { navigate } from "astro:transitions/client"

type Entry = { s: string; u: string; t: string; a: string[]; d: string; k: string }
type Hit = Partial<Entry> & { t: string; d: string; k: string; want?: string }
type Stop = { slug?: string; want?: string; title: string }

const $ = <T extends HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}+#.]+/gu, " ").trim()

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

// ---------- what you've met and what you understand (kept in this browser only) ----------

const meet = (slug: string) => {
  const seen = store.get<Record<string, number>>("seen", {})
  if (!seen[slug]) store.set("seen", { ...seen, [slug]: Date.now() })
}
function decorate(root: ParentNode = document) {
  const seen = store.get<Record<string, number>>("seen", {})
  const known = store.get<Record<string, number>>("known", {})
  root.querySelectorAll<HTMLElement>("a[data-slug]").forEach((a) => {
    const s = a.dataset.slug!
    a.classList.toggle("known", !!known[s])
    a.classList.toggle("seen", !known[s] && !!seen[s])
  })
  const slug = document.body.dataset.slug
  const btn = $("[data-gotit]")
  if (btn && slug) {
    btn.classList.toggle("on", !!known[slug])
    btn.textContent = known[slug] ? "Understood ✓" : "I understand this"
  }
  const you = $("[data-you]")
  const met = Object.keys(seen).length
  if (you && met) you.textContent = `${you.dataset.total} notes · you've met ${met} · understood ${Object.keys(known).length}`
}

// ---------- search ----------

let index: Promise<Entry[]> | null = null
const getIndex = () => (index ??= fetch("/search.json").then((r) => r.json()))
let hot = new Set<string>() // notes matching the current search; the home map lights them up

function rank(q: string, all: Entry[]): Entry[] {
  const score = (e: Entry) => {
    const names = [e.t, ...e.a].map(norm)
    let best = 0
    names.forEach((n, i) => {
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
  let items: Hit[] = []
  let sel = 0
  const paint = () => {
    list.innerHTML = items
      .map(
        (h, i) =>
          `<li role="option" aria-selected="${i === sel}" data-i="${i}" class="${h.want ? "ask" : ""}">` +
          `<div class="r1"><span>${esc(h.t)}</span><small>${esc(h.k)}</small></div><div class="r2">${esc(h.d)}</div></li>`,
      )
      .join("")
    list.classList.toggle("on", items.length > 0)
  }
  const go = (h?: Hit) => {
    if (!h) return
    $<HTMLDialogElement>("#palette")?.close()
    input.value = ""
    items = []
    hot = new Set()
    paint()
    if (h.want) openPeek({ want: h.want, title: h.want }, false)
    else navigate(h.u!)
  }
  input.addEventListener("input", async () => {
    const typed = input.value.trim()
    const q = norm(typed)
    if (!q) {
      items = []
      hot = new Set()
      return paint()
    }
    const found = rank(q, await getIndex()).slice(0, 7)
    if (norm(input.value) !== q) return // typed more while loading
    hot = new Set(found.map((e) => e.s))
    items = found
    // Offer a draft only when no note's name matches what was typed.
    const named = found.some((e) => [e.t, ...e.a].some((n) => norm(n).includes(q)))
    if (!named && q.length > 1)
      items = [...found, { t: `No note on “${typed}” yet`, d: "Get a quick draft now. It also goes on the list to be written properly.", k: "draft", want: typed }]
    sel = 0
    paint()
  })
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      sel = (sel + (e.key === "ArrowDown" ? 1 : items.length - 1)) % Math.max(items.length, 1)
      paint()
    } else if (e.key === "Enter") go(items[sel])
    else if (e.key === "Escape" && !box.closest("dialog")) input.blur()
  })
  list.addEventListener("click", (e) => go(items[Number((e.target as Element).closest("li")?.dataset.i)]))
}

function openSearch() {
  const hero = $<HTMLInputElement>("#hero-q input")
  if (hero) return hero.focus()
  const p = $<HTMLDialogElement>("#palette")!
  if (!p.open) p.showModal()
  $<HTMLInputElement>("input", p)!.focus()
}

// ---------- the side trail: follow a term without leaving what you're reading ----------

const HUES = [200, 250, 290, 330, 20, 60, 110, 160] // one step warmer for every term deeper
let trail: Stop[] = []
let turn = 0

function closePeek() {
  trail = []
  $("#peek")?.classList.remove("open")
  document.documentElement.classList.remove("peeking")
}

function openPeek(stop: Stop, deeper: boolean) {
  // A term that leads back to somewhere you already are takes you back there, instead of looping.
  if (stop.slug && stop.slug === document.body.dataset.slug) return closePeek()
  const back = deeper ? trail.findIndex((t) => (stop.slug ? t.slug === stop.slug : t.want === stop.want)) : -1
  trail = back >= 0 ? trail.slice(0, back + 1) : deeper ? [...trail, stop] : [stop]
  showPeek()
}

async function showPeek() {
  const peek = $("#peek")!
  const body = $(".peek-body", peek)!
  const stop = trail.at(-1)!
  const mine = ++turn
  peek.style.setProperty("--h", String(HUES[trail.length % HUES.length]))
  peek.classList.add("open")
  document.documentElement.classList.add("peeking")
  const start = document.body.dataset.title
  const crumbs = () => ($(".crumbs", peek)!.innerHTML = [start && `<button data-i="-1">${esc(start)}</button>`, ...trail.map((t, i) => `<button data-i="${i}">${esc(t.title)}</button>`)]
    .filter(Boolean)
    .join("<span>›</span>"))
  crumbs()
  $(".crumbs", peek)!.scrollLeft = 1e6
  body.innerHTML = `<div class="skel"><i></i><i></i><i></i><i></i></div>`
  body.scrollTop = 0

  let html: string
  try {
    html = stop.slug ? await noteHtml(stop) : await draftHtml(stop.want!)
  } catch {
    html = `<p class="lead">Couldn't load that. Check your connection and try again.</p>`
  }
  if (mine !== turn) return
  crumbs() // the trail shows note titles, not the words that happened to link to them
  body.innerHTML = html
  body.classList.remove("swap")
  void body.offsetWidth
  body.classList.add("swap")
  decorate(body)
}

async function noteHtml(stop: Stop) {
  const n = await fetch(`/f/${stop.slug}.json`).then((r) => r.json())
  meet(n.slug)
  stop.title = n.title
  return (
    `<p class="kicker"><span>${esc(n.kind)}</span></p><h2 class="t">${esc(n.title)}</h2><p class="lead">${esc(n.lead)}</p>${n.html}` +
    `<a class="go" href="${n.url}"><span>Read the full note</span><span>→</span></a>`
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
  const r = await fetch(`/api/draft?term=${encodeURIComponent(term)}`).then((r) => r.json())
  if (r.status === "draft") {
    const paras = String(r.body).split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join("")
    const related = (r.related ?? []).length ? `<p>Related: ${r.related.map(link).join(" · ")}</p>` : ""
    return (
      `<p class="kicker draft"><span>Unchecked draft</span></p><h2 class="t">${esc(r.title)}</h2><p class="lead">${esc(r.one_line)}</p>${paras}${related}` +
      `<p class="draft-note">A small open model wrote this in a few seconds. Nobody has checked it against sources, so treat it as a first sketch. ` +
      `Your request is counted, and the most wanted terms get a real note, written from primary sources, in the next daily run.</p>`
    )
  }
  if (r.status === "no")
    return `<h2 class="t">${esc(term)}</h2><p class="lead">That doesn't look like a term this wiki covers. If it is one, it has been noted.</p>`
  return `<h2 class="t">${esc(term)}</h2><p class="lead">No note yet. It is now on the <a href="/wanted/">wanted list</a>, and the most wanted terms are written first.</p>`
}

// ---------- diagrams (loaded only on pages that have one) ----------

async function diagrams() {
  const nodes = document.querySelectorAll<HTMLElement>("pre.mermaid:not([data-processed])")
  if (!nodes.length) return
  const src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs"
  const mermaid = (await import(/* @vite-ignore */ src)).default
  const dark = getComputedStyle(document.documentElement).colorScheme.includes("dark")
    ? document.documentElement.dataset.theme !== "light" && (document.documentElement.dataset.theme === "dark" || matchMedia("(prefers-color-scheme: dark)").matches)
    : false
  mermaid.initialize({ startOnLoad: false, theme: dark ? "dark" : "neutral", fontFamily: "Geist Variable, system-ui, sans-serif" })
  await mermaid.run({ nodes })
}

// ---------- the map on the home page ----------

async function sky() {
  const c = $<HTMLCanvasElement>("#sky")
  if (!c) return
  const g: { n: [string, string, string][]; e: [number, number][] } = await fetch("/graph.json").then((r) => r.json())
  const ctx = c.getContext("2d")!
  const N = g.n.map(([slug, title, url]) => ({ slug, title, url, x: 0, y: 0, dx: 0, dy: 0, deg: 0, ph: Math.random() * 6.28 }))
  g.e.forEach(([a, b]) => (N[a].deg++, N[b].deg++))
  let W = 0
  let H = 0
  let over: (typeof N)[number] | null = null

  function layout() {
    const dpr = Math.min(devicePixelRatio, 2)
    W = c!.clientWidth
    H = c!.clientHeight
    c!.width = W * dpr
    c!.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    // Spring layout: linked notes pull together, all notes push apart, and the middle stays clear for the search box.
    const cx = W / 2, cy = H * 0.43, rx = Math.min(390, W * 0.6), ry = 135
    N.forEach((n, i) => {
      const a = i * 2.399963, r = Math.sqrt((i + 0.5) / N.length)
      n.x = cx + Math.cos(a) * r * W * 0.46
      n.y = H / 2 + Math.sin(a) * r * H * 0.44
    })
    const k = Math.sqrt((W * H) / N.length) * 0.75
    for (let it = 0; it < 240; it++) {
      const heat = k * 0.4 * (1 - it / 240)
      for (const n of N) n.dx = n.dy = 0
      for (let i = 0; i < N.length; i++)
        for (let j = i + 1; j < N.length; j++) {
          const a = N[i], b = N[j]
          const x = a.x - b.x, y = a.y - b.y, d = Math.hypot(x, y) || 1, f = (k * k) / d / d
          a.dx += x * f; a.dy += y * f; b.dx -= x * f; b.dy -= y * f
        }
      for (const [i, j] of g.e) {
        const a = N[i], b = N[j]
        const x = a.x - b.x, y = a.y - b.y, f = Math.hypot(x, y) / k / 1.6
        a.dx -= x * f; a.dy -= y * f; b.dx += x * f; b.dy += y * f
      }
      for (const n of N) {
        const ex = (n.x - cx) / rx, ey = (n.y - cy) / ry, e = ex * ex + ey * ey
        if (e < 1) { n.dx += ex * k * 3 * (1 - e); n.dy += (ey || 0.1) * k * 5 * (1 - e) }
        const d = Math.hypot(n.dx, n.dy) || 1
        n.x = Math.min(W - 20, Math.max(20, n.x + (n.dx / d) * Math.min(d, heat)))
        n.y = Math.min(H - 24, Math.max(64, n.y + (n.dy / d) * Math.min(d, heat)))
      }
    }
  }

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches
  function draw(t: number) {
    if (!c!.isConnected) return
    // The canvas borrows its colours from CSS, so it follows the theme.
    const css = getComputedStyle(document.body)
    const probe = (v: string) => ((c!.style.color = `var(${v})`), getComputedStyle(c!).color)
    const accent = probe("--accent"), muted = probe("--muted"), ink = probe("--ink")
    const seen = store.get<Record<string, number>>("seen", {})
    const at = (n: (typeof N)[number]) =>
      still ? [n.x, n.y] : [n.x + Math.sin(t * 0.0004 + n.ph) * 5, n.y + Math.cos(t * 0.0005 + n.ph) * 5]
    ctx.clearRect(0, 0, W, H)
    ctx.lineWidth = 1
    ctx.strokeStyle = muted
    ctx.globalAlpha = 0.16
    ctx.beginPath()
    for (const [i, j] of g.e) {
      const [ax, ay] = at(N[i]), [bx, by] = at(N[j])
      ctx.moveTo(ax, ay); ctx.lineTo(bx, by)
    }
    ctx.stroke()
    for (const n of N) {
      const [x, y] = at(n)
      const lit = hot.has(n.slug) || n === over
      const r = 2 + Math.min(n.deg, 9) * 0.4
      ctx.globalAlpha = lit ? 1 : seen[n.slug] ? 0.9 : 0.4
      ctx.fillStyle = lit || seen[n.slug] ? accent : muted
      ctx.beginPath(); ctx.arc(x, y, lit ? r + 2 : r, 0, 6.3); ctx.fill()
      if (lit) {
        ctx.globalAlpha = 0.18
        ctx.beginPath(); ctx.arc(x, y, r + 9, 0, 6.3); ctx.fill()
        ctx.globalAlpha = 1
        ctx.fillStyle = ink
        ctx.font = `500 12px ${css.getPropertyValue("--sans")}`
        const w = ctx.measureText(n.title).width
        ctx.fillText(n.title, Math.min(W - w - 8, Math.max(8, x - w / 2)), y - r - 12)
      }
    }
    ctx.globalAlpha = 1
    if (!still) requestAnimationFrame(draw)
  }

  c.addEventListener("pointermove", (e) => {
    const b = c.getBoundingClientRect()
    const x = e.clientX - b.left, y = e.clientY - b.top
    over = N.find((n) => Math.hypot(n.x - x, n.y - y) < 16) ?? null
    c.style.cursor = over ? "pointer" : ""
    if (still) draw(0)
  })
  c.addEventListener("click", () => over && navigate(over.url))
  addEventListener("resize", () => c.isConnected && (layout(), still && draw(0)))
  layout()
  await document.fonts.ready
  requestAnimationFrame(draw)
}

// ---------- the wanted page ----------

async function wantedPage() {
  const live = $("[data-wanted-live]")
  if (!live) return
  const q = new URLSearchParams(location.search).get("q")
  if (q) openPeek({ want: q, title: q }, false)
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

// ---------- wiring ----------

document.addEventListener("click", (e) => {
  const el = e.target as Element
  const term = el.closest<HTMLAnchorElement>("a.term")
  if (term && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && term.closest(".prose")) {
    e.preventDefault()
    openPeek({ slug: term.dataset.slug, want: term.dataset.want, title: term.textContent!.replace(/\s+\d+$/, "").trim() }, !!term.closest("#peek"))
    return
  }
  const crumb = el.closest<HTMLElement>(".crumbs button")
  if (crumb) {
    const i = Number(crumb.dataset.i)
    if (i < 0) return closePeek()
    trail = trail.slice(0, i + 1)
    return void showPeek()
  }
  if (el.closest("[data-peek-close]")) return closePeek()
  if (el.closest("[data-open-search]")) return openSearch()
  if (el.id === "palette") return (el as HTMLDialogElement).close()
  if (el.closest("[data-theme-toggle]")) {
    const root = document.documentElement
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches
    root.dataset.theme = dark ? "light" : "dark"
    return store.set("theme", root.dataset.theme)
  }
  if (el.closest("[data-gotit]")) {
    const slug = document.body.dataset.slug!
    const known = store.get<Record<string, number>>("known", {})
    if (known[slug]) delete known[slug]
    else known[slug] = Date.now()
    store.set("known", known)
    decorate()
  }
}, true) // capture: decide before the page router treats a term as an ordinary link

document.addEventListener("keydown", (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as Element).tagName)
  if ((e.key === "/" && !typing) || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
    e.preventDefault()
    openSearch()
  } else if (e.key === "Escape" && !$<HTMLDialogElement>("#palette")?.open) closePeek()
})

document.addEventListener("astro:before-swap", (e: any) => {
  closePeek()
  // Carry the reader's theme choice onto the next page.
  const theme = document.documentElement.dataset.theme
  if (theme) e.newDocument.documentElement.dataset.theme = theme
})

document.addEventListener("astro:page-load", () => {
  const slug = document.body.dataset.slug
  if (slug) meet(slug)
  decorate()
  document.querySelectorAll<HTMLElement>(".q").forEach(wire)
  if (matchMedia("(pointer: fine)").matches) $<HTMLInputElement>("#hero-q input")?.focus()
  diagrams()
  sky()
  wantedPage()
})
