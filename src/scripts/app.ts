// The map. Every note is a card with a fixed place; the camera pans, zooms and flies between them.
// d3-zoom owns the camera (drag, pinch, and the zoom-out-then-in arc of a flight); everything else is plain DOM.
import { select } from "d3-selection"
import { zoom as d3zoom, zoomIdentity, type ZoomTransform } from "d3-zoom"
import "d3-transition"

type Node = {
  s: string; u: string; t: string; a: string[]; d: string; k: string; c: number; m: number; g: number; x: number; y: number
  el: HTMLElement; ghost?: boolean
}
type Hit = { node?: Node; want?: string; t: string; d: string; k: string; c: number }

const $ = <T extends HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!
const $$ = <T extends HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)]
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}+#.]+/gu, " ").trim()
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
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
const prefs = () => ({ theme: "dark", sound: true, ...store.get<Record<string, any>>("prefs", {}) })
const setPref = (key: string, value: unknown) => store.set("prefs", { ...prefs(), [key]: value })

// ---------- sound: a few soft tones, made on the spot, no files ----------

let audio: AudioContext | null = null
function tone(from: number, to: number, seconds: number, volume = 0.05) {
  if (!prefs().sound) return
  try {
    audio ??= new AudioContext()
    const now = audio.currentTime
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.frequency.setValueAtTime(from, now)
    osc.frequency.exponentialRampToValueAtTime(to, now + seconds)
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds)
    osc.connect(gain).connect(audio.destination)
    osc.start(now)
    osc.stop(now + seconds)
  } catch {}
}
const sound = {
  land: () => tone(420, 760, 0.12),
  fly: () => tone(170, 560, 0.55, 0.03),
  leave: () => tone(620, 300, 0.14, 0.04),
  tick: () => tone(1100, 900, 0.03, 0.02),
  win: () => [660, 880, 1320].forEach((f, i) => setTimeout(() => tone(f, f, 0.14), i * 95)),
}

let toastTimer = 0
function toast(text: string) {
  let t = document.getElementById("toast")
  if (!t) document.body.append((t = Object.assign(document.createElement("div"), { id: "toast" })))
  t.textContent = text
  void t.offsetWidth
  t.classList.add("on")
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => t!.classList.remove("on"), 2200)
}

// Little stars around something worth celebrating.
function sparkles(around: Element) {
  if (calm()) return
  const box = around.getBoundingClientRect()
  const colours = ["var(--star)", "var(--pink)", "var(--primary)", "var(--c4)"]
  for (let i = 0; i < 9; i++) {
    const s = document.createElement("span")
    const size = 10 + Math.random() * 16
    s.className = "sparkle"
    s.style.cssText =
      `width:${size}px;height:${size}px;left:${box.left - 14 + Math.random() * (box.width + 28)}px;` +
      `top:${box.top - 14 + Math.random() * (box.height + 28)}px;animation-delay:${i * 70}ms;color:${colours[i % colours.length]}`
    s.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z"/></svg>`
    document.body.append(s)
    setTimeout(() => s.remove(), 1600)
  }
}

// ---------- the map ----------

const stage = $("#stage")
const world = $("#world")
const cards = $("#cards")
const sel = select(stage)
let nodes: Node[] = []
let edges: [number, number][] = []
let regions: { name: string; c: number; x: number; y: number; r: number }[] = []
let today: Node | undefined
let current: Node | null = null
let trail: Node[] = []
let view: ZoomTransform = zoomIdentity
const bySlug = new Map<string, Node>()

const camera = d3zoom<HTMLElement, unknown>()
  .scaleExtent([0.05, 1.6])
  .filter((e: any) => {
    if (e.type === "wheel") return e.ctrlKey // pinch (or ⌘/ctrl + wheel) zooms; a plain wheel pans, see below
    if (e.type === "dblclick") return false
    if (e.type === "mousedown") return !e.button && !e.target.closest(".card.open") // text in an open card stays selectable
    return true
  })
  .on("zoom", (e) => {
    view = e.transform
    world.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.k})`
    world.style.setProperty("--k", String(view.k))
    world.dataset.zoom = view.k < 0.42 ? "far" : "near"
    stage.style.setProperty("--px", view.x + "px")
    stage.style.setProperty("--py", view.y + "px")
    if (e.sourceEvent) document.body.classList.add("touched")
  })

function go(to: ZoomTransform, ms = 1000) {
  if (!ms || calm()) sel.interrupt().call(camera.transform, to)
  else sel.interrupt().transition().duration(ms).call(camera.transform, to)
}
const whole = () => {
  const real = nodes.filter((n) => !n.ghost)
  const xs = real.map((n) => n.x), ys = real.map((n) => n.y)
  const [x0, x1, y0, y1] = [Math.min(...xs) - 260, Math.max(...xs) + 260, Math.min(...ys) - 330, Math.max(...ys) + 220]
  const k = Math.min(innerWidth / (x1 - x0), (innerHeight - 150) / (y1 - y0), 0.85)
  return zoomIdentity.translate(innerWidth / 2 - ((x0 + x1) / 2) * k, innerHeight / 2 + 20 - ((y0 + y1) / 2) * k).scale(k)
}
const reading = (n: Node) => zoomIdentity.translate(innerWidth / 2 - n.x, 104 - n.y)
const beside = (n: Node, k = 0.62) => zoomIdentity.translate(innerWidth / 2 - n.x * k, innerHeight * 0.36 - n.y * k).scale(k)

const curve = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  `M${a.x},${a.y} Q${(a.x + b.x) / 2 - (b.y - a.y) * 0.13},${(a.y + b.y) / 2 + (b.x - a.x) * 0.13} ${b.x},${b.y}`

function makeCard(n: Node) {
  const el = document.createElement("article")
  el.className = "card" + (n.ghost ? " ghost" : "")
  el.dataset.slug = n.s
  el.style.cssText = `left:${n.x}px;top:${n.y}px;--c:var(--c${n.c})`
  el.innerHTML =
    `<header><span class="kind">${esc(n.k || "Page")}</span><span class="mins">${n.m} min</span>` +
    `<h3>${esc(n.t)}</h3><p class="lead">${esc(n.d)}</p></header><div class="body"></div>`
  n.el = el
  cards.append(el)
}

function drawTrail() {
  $("#trail").setAttribute("d", trail.slice(1).map((n, i) => curve(trail[i], n)).join(" "))
}

function where(n: Node | null) {
  $("[data-where]").textContent = n ? (regions.find((r) => r.c === n.c)?.name ?? n.k ?? "the map") : "the map"
}

// ---------- what you've opened and what you understand (kept in this browser only) ----------

function decorate() {
  const seen = store.get<Record<string, number>>("seen", {})
  const known = store.get<Record<string, number>>("known", {})
  for (const el of $$("[data-slug]")) {
    const s = el.dataset.slug!
    el.classList.toggle("known", !!known[s])
    el.classList.toggle("seen", !!seen[s])
  }
  for (const btn of $$("[data-gotit]")) {
    const on = !!known[btn.closest<HTMLElement>(".card")!.dataset.slug!]
    btn.classList.toggle("on", on)
    btn.textContent = on ? "✦ Understood" : "I understand this"
  }
}
function understood() {
  if (!current || current.ghost) return
  const known = store.get<Record<string, number>>("known", {})
  const btn = $("[data-gotit]", current.el)
  if (known[current.s]) delete known[current.s]
  else {
    known[current.s] = Date.now()
    sound.win()
    if (btn) sparkles(btn)
    toast(`${Object.keys(known).length} understood`)
  }
  store.set("known", known)
  decorate()
}

// ---------- flying in and out ----------

async function open(n: Node, { push = true, instant = false } = {}) {
  if (current === n) return
  const from = current
  if (from) fold(from)
  current = n
  n.el.classList.add("open")
  world.classList.add("reading")
  document.body.classList.add("reading")
  if (!n.ghost) {
    const back = trail.indexOf(n)
    trail = back >= 0 ? trail.slice(0, back + 1) : [...trail, n]
    drawTrail()
    store.set("seen", { ...store.get("seen", {}), [n.s]: Date.now() })
    if (push) history.pushState({ s: n.s }, "", n.u)
    document.title = `${n.t} · Wiki`
  }
  where(n)
  const far = from ? Math.hypot(n.x - from.x, n.y - from.y) : 0
  go(reading(n), instant ? 0 : from ? clamp(600 + far * 0.32, 800, 1900) : 1000)
  from ? sound.fly() : sound.land()

  const body = $(".body", n.el)
  if (!body.innerHTML) {
    body.innerHTML = `<p class="wait">Unpacking…</p>`
    try {
      body.innerHTML = n.ghost ? await draftHtml(n) : (await fetch(`/f/${n.s}.json`).then((r) => r.json())).html
    } catch {
      body.innerHTML = `<p class="wait">Couldn't load this one. Check your connection and try again.</p>`
    }
  }
  decorate()
  diagrams()
}

function fold(n: Node) {
  n.el.classList.remove("open")
  if (n.ghost) {
    n.el.remove()
    nodes = nodes.filter((m) => m !== n)
  }
}

function close({ push = true } = {}) {
  if (!current) return go(whole(), 900)
  const n = current
  fold(n)
  current = null
  world.classList.remove("reading")
  document.body.classList.remove("reading")
  where(null)
  go(n.ghost ? whole() : beside(n), 850)
  sound.leave()
  if (push) history.pushState({}, "", "/")
  document.title = "Wiki"
}

// A term nobody has written yet: a ghost card appears beside you with a quick sketch from a small model.
function sketch(term: string) {
  const at = current ?? { x: (innerWidth / 2 - view.x) / view.k - 900, y: (innerHeight * 0.3 - view.y) / view.k }
  const n = { s: "~" + term, u: "", t: term, a: [], d: "Not written yet. Sketching it now…", k: "Unchecked draft", c: -1, m: 1, g: 0, x: at.x + 900, y: at.y, ghost: true } as unknown as Node
  nodes.push(n)
  makeCard(n)
  open(n)
}
async function draftHtml(n: Node) {
  const link = (name: string) => {
    const hit = nodes.find((m) => !m.ghost && [m.t, ...m.a].some((x) => norm(x) === norm(name)))
    return hit
      ? `<a class="term" href="${hit.u}" data-slug="${hit.s}">${esc(name)}</a>`
      : `<a class="term wanted" href="#" data-want="${esc(name)}">${esc(name)}</a>`
  }
  const r = await fetch(`/api/draft?term=${encodeURIComponent(n.t)}`).then((r) => r.json())
  const lead = $(".lead", n.el)
  if (r.status !== "draft") {
    lead.textContent = r.status === "no" ? "That doesn't look like a term this wiki covers. If it is one, it has been noted." : "No note yet. It is on the list now, and the most wanted terms are written first."
    return `<p class="draft-note">Nothing more to show here yet.</p>`
  }
  $("h3", n.el).textContent = r.title
  lead.textContent = r.one_line
  return (
    `<div class="prose">${String(r.body).split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join("")}` +
    ((r.related ?? []).length ? `<p>Nearby: ${r.related.map(link).join(", ")}</p>` : "") +
    `</div><p class="draft-note">A small open model sketched this a moment ago and nobody has checked it against sources. ` +
    `Your request is counted: the most wanted terms get a real card on the map, written from primary sources, in the next daily run.</p>`
  )
}

async function diagrams() {
  const found = $$("pre.mermaid:not([data-processed])")
  if (!found.length) return
  const src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs"
  const mermaid = (await import(/* @vite-ignore */ src)).default
  mermaid.initialize({ startOnLoad: false, theme: document.documentElement.dataset.theme === "light" ? "neutral" : "dark", fontFamily: "Figtree Variable, system-ui, sans-serif" })
  await mermaid.run({ nodes: found })
}

// ---------- search: type, and the map answers ----------

function rank(q: string): Node[] {
  const score = (n: Node) => {
    let best = 0
    ;[n.t, ...n.a].map(norm).forEach((name, i) => {
      const own = i === 0 ? 5 : 0
      if (name === q) best = Math.max(best, 100 + own)
      else if (name.startsWith(q)) best = Math.max(best, 80 + own)
      else if (name.split(" ").some((w) => w.startsWith(q))) best = Math.max(best, 60 + own)
      else if (name.includes(q)) best = Math.max(best, 40 + own)
    })
    if (!best && q.length > 2 && norm(n.d).includes(q)) best = 10
    return best
  }
  return nodes
    .filter((n) => !n.ghost)
    .map((n) => [score(n), n] as const)
    .filter(([s]) => s > 0)
    .sort((a, b) => b[0] - a[0] || a[1].t.length - b[1].t.length)
    .map(([, n]) => n)
}

function wireSearch() {
  const input = $<HTMLInputElement>("#q input")
  const list = $("#q .results")
  let items: Hit[] = []
  let at = 0
  const paint = () => {
    list.innerHTML = items
      .map(
        (h, i) =>
          `<li role="option" aria-selected="${i === at}" data-i="${i}" style="--c:var(--c${h.c})">` +
          `<div class="r1"><span>${esc(h.t)}</span><small>${esc(h.k)}</small></div><div class="r2">${esc(h.d)}</div></li>`,
      )
      .join("")
    list.classList.toggle("on", items.length > 0)
  }
  const light = (found: Node[] | null) => {
    world.classList.toggle("filtering", !!found)
    for (const n of nodes) n.el.classList.toggle("hit", !!found?.includes(n))
  }
  const clear = () => {
    input.value = ""
    items = []
    light(null)
    paint()
    input.blur()
  }
  const pick = (h?: Hit) => {
    if (!h) return
    clear()
    h.node ? open(h.node) : sketch(h.want!)
  }
  input.addEventListener("input", () => {
    const typed = input.value.trim()
    const q = norm(typed)
    if (!q) {
      items = []
      light(null)
      return paint()
    }
    const found = rank(q)
    light(found)
    items = found.slice(0, 6).map((node) => ({ node, t: node.t, d: node.d, k: node.k || "Page", c: node.c }))
    const named = found.some((n) => [n.t, ...n.a].some((x) => norm(x).includes(q)))
    if (!named && q.length > 1) items.push({ want: typed, t: `Nothing on “${typed}” yet`, d: "Enter for a quick sketch. It also joins the list of notes to write.", k: "sketch", c: 2 })
    at = 0
    paint()
  })
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      at = (at + (e.key === "ArrowDown" ? 1 : items.length - 1)) % Math.max(items.length, 1)
      sound.tick()
      paint()
    } else if (e.key === "Enter") pick(items[at])
    else if (e.key === "Escape") clear()
  })
  list.addEventListener("click", (e) => pick(items[Number((e.target as Element).closest<HTMLElement>("li")?.dataset.i)]))
}

// ---------- start ----------

async function start() {
  const data = await fetch("/map.json").then((r) => r.json())
  regions = data.regions
  edges = data.edges
  nodes = data.nodes
  for (const n of nodes) {
    bySlug.set(n.s, n)
    makeCard(n)
  }
  today = bySlug.get(data.today)
  today?.el.classList.add("today")

  $("#regions").innerHTML = regions
    .map((r) => `<div class="region" style="left:${r.x}px;top:${r.y}px;--c:var(--c${r.c});--r:${r.r}"><i></i><b>${esc(r.name)}</b></div>`)
    .join("")
  const NS = "http://www.w3.org/2000/svg"
  edges.forEach(([a, b], i) => {
    const path = document.createElementNS(NS, "path")
    path.setAttribute("class", "edge")
    path.setAttribute("d", curve(nodes[a], nodes[b]))
    path.setAttribute("style", `--c:var(--c${nodes[a].c})`)
    path.dataset.i = String(i)
    document.getElementById("edges")!.append(path)
  })

  sel.call(camera)
  // A plain wheel (or two fingers on a trackpad) moves the map, which is also how you scroll a note you're reading.
  stage.addEventListener("wheel", (e) => {
    if (e.ctrlKey) return
    e.preventDefault()
    document.body.classList.add("touched")
    sel.interrupt().call(camera.translateBy, -e.deltaX / view.k, -e.deltaY / view.k)
  }, { passive: false })

  if (today) {
    const pill = $("[data-today]")
    pill.textContent = `Today's read: ${today.t} · ${today.m} min`
    pill.hidden = false
  }
  $("[data-sound]").classList.toggle("off", !prefs().sound)
  wireSearch()
  decorate()

  // Arrive: straight at a note if the address names one, otherwise ease in over the whole map.
  const focus = bySlug.get(document.body.dataset.focus ?? "")
  const seed = document.getElementById("seed")
  if (focus && seed) $(".body", focus.el).innerHTML = $(".body", seed).innerHTML
  seed?.remove()
  if (focus) open(focus, { push: false, instant: true })
  else {
    const all = whole()
    go(zoomIdentity.translate(all.x + (innerWidth * 0.1) / 2, all.y + (innerHeight * 0.1) / 2).scale(all.k * 0.9), 0)
    go(all, 1400)
    if (document.body.dataset.lost) toast("Nothing at that address. Here's the whole map instead.")
  }
}

// ---------- wiring ----------

document.addEventListener("click", (e) => {
  const el = e.target as Element
  const link = el.closest<HTMLAnchorElement>("a[data-slug], a[data-want]")
  if (link && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
    e.preventDefault()
    const to = bySlug.get(link.dataset.slug ?? "")
    return to ? void open(to) : link.dataset.want ? sketch(link.dataset.want) : undefined
  }
  if (el.closest("[data-gotit]")) return understood()
  const card = el.closest<HTMLElement>(".card:not(.open)")
  if (card) return void open(nodes.find((n) => n.el === card)!)
  if (el.closest("[data-home]")) return e.preventDefault(), current ? (close(), go(whole(), 1100)) : go(whole(), 900)
  if (el.closest("[data-close]")) return close()
  if (el.closest("[data-today]")) return today && void open(today)
  if (el.closest("[data-fit]")) return current ? close() : go(whole(), 900)
  const z = el.closest<HTMLElement>("[data-zoom]")
  if (z) return void sel.transition().duration(260).call(camera.scaleBy, Number(z.dataset.zoom) > 0 ? 1.5 : 1 / 1.5)
  if (el.closest("[data-theme-toggle]")) return theme()
  if (el.closest("[data-sound]")) return mute()
  if (el.closest("[data-open-keys]")) return $<HTMLDialogElement>("#keys").showModal()
  if (el instanceof HTMLDialogElement) el.close()
})

// Hovering a card lights up the wires that leave it.
cards.addEventListener("mouseover", (e) => {
  const card = (e.target as Element).closest<HTMLElement>(".card")
  const i = card ? nodes.findIndex((n) => n.el === card) : -1
  for (const path of $$<any>(".edge")) {
    const [a, b] = edges[Number(path.dataset.i)]
    path.classList.toggle("on", i >= 0 && (a === i || b === i))
  }
})

function theme() {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light"
  document.documentElement.dataset.theme = next
  setPref("theme", next)
}
function mute() {
  const on = !prefs().sound
  setPref("sound", on)
  $("[data-sound]").classList.toggle("off", !on)
  if (on) sound.land()
  toast(on ? "Sound on" : "Sound off")
}
function onward() {
  if (!current) return today && open(today)
  const seen = store.get<Record<string, number>>("seen", {})
  const next = $$<HTMLAnchorElement>("a[data-slug]", current.el).map((a) => bySlug.get(a.dataset.slug!)).find((n) => n && !seen[n.s])
  next ? open(next) : toast("You've opened everything this note links to")
}

document.addEventListener("keydown", (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as Element).tagName)
  if (e.key === "k" && (e.metaKey || e.ctrlKey)) return e.preventDefault(), $<HTMLInputElement>("#q input").focus()
  if (typing || e.metaKey || e.ctrlKey || e.altKey || document.querySelector("dialog[open]")) return
  const pan = (x: number, y: number) => sel.transition().duration(180).call(camera.translateBy, x / view.k, y / view.k)
  const keys: Record<string, () => unknown> = {
    "/": () => $<HTMLInputElement>("#q input").focus(),
    "?": () => $<HTMLDialogElement>("#keys").showModal(),
    Escape: () => close(),
    "0": () => (current ? (close(), go(whole(), 1100)) : go(whole(), 900)),
    "=": () => sel.transition().duration(220).call(camera.scaleBy, 1.4),
    "+": () => sel.transition().duration(220).call(camera.scaleBy, 1.4),
    "-": () => sel.transition().duration(220).call(camera.scaleBy, 1 / 1.4),
    ArrowLeft: () => pan(160, 0),
    ArrowRight: () => pan(-160, 0),
    ArrowUp: () => pan(0, 160),
    ArrowDown: () => pan(0, -160),
    "]": onward,
    "[": () => (trail.length > 1 ? open(trail.at(-2)!) : toast("This is where you started")),
    r: () => {
      const pool = nodes.filter((n) => !n.ghost && n.c >= 0 && n !== current)
      open(pool[Math.floor(Math.random() * pool.length)])
    },
    d: () => today && open(today),
    u: understood,
    a: () => {
      const all = current ? $$<HTMLDetailsElement>("details.callout", current.el) : []
      const on = !all.every((d) => d.open)
      all.forEach((d) => (d.open = on))
    },
    m: mute,
    t: theme,
  }
  if (!keys[e.key]) return
  e.preventDefault()
  keys[e.key]()
})

addEventListener("popstate", () => {
  const n = nodes.find((n) => n.u === location.pathname)
  n ? open(n, { push: false }) : current && close({ push: false })
})

start()
