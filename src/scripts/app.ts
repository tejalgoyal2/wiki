// What the reader's browser does: search that answers while you type, hover previews, the dive between
// notes, the trail of how deep you are, and remembering what you've opened. No framework.
import { navigate } from "astro:transitions/client"
import { emblem } from "../lib/emblem"

type Entry = { s: string; u: string; t: string; a: string[]; d: string; k: string; c: number; m: number }
type Hit = { e?: Entry; want?: string }
type Step = { s: string; t: string; u: string; c: number }

const $ = <T extends HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)
const $$ = <T extends HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)]
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}+#.]+/gu, " ").trim()
const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches
const face = (slug: string, c: number) => `<div class="face" style="--c:var(--c${c})">${emblem(slug)}</div>`

const store = {
  get<T>(key: string, fallback: T, where: Storage = localStorage): T {
    try {
      return JSON.parse(where.getItem("wiki:" + key)!) ?? fallback
    } catch {
      return fallback
    }
  },
  set(key: string, value: unknown, where: Storage = localStorage) {
    try {
      where.setItem("wiki:" + key, JSON.stringify(value))
    } catch {}
  },
}
const prefs = () => ({ theme: "dark", sound: true, ...store.get<Record<string, any>>("prefs", {}) })
const setPref = (key: string, value: unknown) => store.set("prefs", { ...prefs(), [key]: value })

// ---------- sound: a few soft tones, made on the spot ----------

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
  dive: () => tone(520, 190, 0.42, 0.035),
  rise: () => tone(200, 540, 0.36, 0.035),
  tick: () => tone(1100, 900, 0.03, 0.02),
  open: () => tone(420, 760, 0.1, 0.04),
  win: () => [660, 880, 1320].forEach((f, i) => setTimeout(() => tone(f, f, 0.14), i * 95)),
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

// ---------- the index of every note (also what search runs on) ----------

let index: Promise<Entry[]> | null = null
const all = () => (index ??= fetch("/map.json").then((r) => r.json()).then((d) => d.nodes))

function rank(q: string, list: Entry[]): Entry[] {
  const score = (e: Entry) => {
    let best = 0
    ;[e.t, ...e.a].map(norm).forEach((name, i) => {
      const own = i === 0 ? 5 : 0
      if (name === q) best = Math.max(best, 100 + own)
      else if (name.startsWith(q)) best = Math.max(best, 80 + own)
      else if (name.split(" ").some((w) => w.startsWith(q))) best = Math.max(best, 60 + own)
      else if (name.includes(q)) best = Math.max(best, 40 + own)
    })
    if (!best && q.length > 2 && norm(e.d).includes(q)) best = 10
    return best
  }
  return list
    .map((e) => [score(e), e] as const)
    .filter(([s]) => s > 0)
    .sort((a, b) => b[0] - a[0] || a[1].t.length - b[1].t.length)
    .map(([, e]) => e)
}

// ---------- what you've opened and what you understand (kept in this browser only) ----------

function decorate(root: ParentNode = document) {
  const seen = store.get<Record<string, number>>("seen", {})
  const known = store.get<Record<string, number>>("known", {})
  for (const el of $$("[data-slug]", root)) {
    if (el === document.body) continue
    el.classList.toggle("known", !!known[el.dataset.slug!])
    el.classList.toggle("seen", !!seen[el.dataset.slug!])
  }
  const slug = document.body.dataset.slug
  const btn = $("[data-gotit]")
  if (btn && slug) {
    btn.classList.toggle("on", !!known[slug])
    btn.textContent = known[slug] ? "✦ Understood" : "I understand this"
  }
  const you = $("[data-you]")
  const lit = $$(".tile.seen, .tile.known").length
  if (you) you.textContent = lit ? `${lit} of ${you.dataset.total} lit · ${Object.keys(known).length} understood` : `${you.dataset.total} notes, all waiting to be lit`
}
function understood() {
  const slug = document.body.dataset.slug
  const btn = $("[data-gotit]")
  if (!slug || !btn) return
  const known = store.get<Record<string, number>>("known", {})
  if (known[slug]) delete known[slug]
  else {
    known[slug] = Date.now()
    sound.win()
    sparkles(btn)
    toast(`${Object.keys(known).length} understood`)
  }
  store.set("known", known)
  decorate()
}

// ---------- search: the answer shows while you type ----------

const peeks = new Map<string, string>()
function wireSearch() {
  const dialog = $<HTMLDialogElement>("#palette")!
  const input = $<HTMLInputElement>("input", dialog)!
  const list = $(".results", dialog)!
  const pane = $("[data-preview]", dialog)!
  let items: Hit[] = []
  let at = 0

  const show = async () => {
    const h = items[at]
    if (!h) return (pane.innerHTML = "")
    if (h.want) {
      pane.innerHTML =
        `<p class="label" style="--c:var(--pink)">Not written yet</p><h2>${esc(h.want)}</h2>` +
        `<p class="lead">Press enter for a quick sketch from a small model. It is marked as unchecked, and your request puts the term on the list to be written properly.</p>`
      return
    }
    const e = h.e!
    const head = `${face(e.s, e.c).replace('class="face"', 'class="face live"')}<p class="label" style="--c:var(--c${e.c})"><span>${esc(e.k || "Page")}</span><span>${e.m} min</span></p><h2>${esc(e.t)}</h2><p class="lead">${esc(e.d)}</p>`
    pane.innerHTML = head + (peeks.has(e.s) ? `<div class="prose">${peeks.get(e.s)}</div>` : "")
    if (!peeks.has(e.s)) {
      try {
        peeks.set(e.s, (await fetch(`/f/${e.s}.json`).then((r) => r.json())).html)
      } catch {
        return
      }
      if (items[at]?.e === e) pane.innerHTML = head + `<div class="prose">${peeks.get(e.s)}</div>`
    }
  }
  const paint = () => {
    list.innerHTML = items.length
      ? items
          .map((h, i) =>
            h.e
              ? `<li role="option" aria-selected="${i === at}" data-i="${i}" style="--c:var(--c${h.e.c})">${face(h.e.s, h.e.c)}<div><b>${esc(h.e.t)}</b><small>${esc(h.e.k || "Page")}</small></div></li>`
              : `<li role="option" aria-selected="${i === at}" data-i="${i}" style="--c:var(--pink)"><div><b>“${esc(h.want!)}”</b><small>sketch it</small></div></li>`,
          )
          .join("")
      : `<li class="hintrow">Type a term. The answer appears here as you type.</li>`
    show()
  }
  const fill = async () => {
    const typed = input.value.trim()
    const q = norm(typed)
    const list = await all()
    if (norm(input.value) !== q) return
    const found = q ? rank(q, list) : list.filter((e) => e.k).sort((a, b) => b.m - a.m).slice(0, 0)
    items = found.slice(0, 7).map((e) => ({ e }))
    const named = found.some((e) => [e.t, ...e.a].some((n) => norm(n).includes(q)))
    if (q.length > 1 && !named) items.push({ want: typed })
    at = 0
    paint()
  }
  const pick = (h?: Hit) => {
    if (!h) return
    dialog.close()
    if (h.e) navigate(h.e.u)
    else sketch(h.want!)
  }
  input.oninput = fill
  input.onkeydown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      at = (at + (e.key === "ArrowDown" ? 1 : items.length - 1)) % Math.max(items.length, 1)
      sound.tick()
      paint()
      $(`li[data-i="${at}"]`, list)?.scrollIntoView({ block: "nearest" })
    } else if (e.key === "Enter") pick(items[at])
  }
  list.onclick = (e) => pick(items[Number((e.target as Element).closest<HTMLElement>("li")?.dataset.i)])
  list.onmousemove = (e) => {
    const i = Number((e.target as Element).closest<HTMLElement>("li")?.dataset.i)
    if (i >= 0 && i !== at) {
      at = i
      paint()
    }
  }
}
function openSearch(first = "") {
  const dialog = $<HTMLDialogElement>("#palette")!
  const input = $<HTMLInputElement>("input", dialog)!
  if (!dialog.open) dialog.showModal()
  input.value = first
  input.dispatchEvent(new Event("input"))
  input.focus()
  sound.open()
}

// A term nobody has written yet: a quick sketch from a small model, clearly marked.
async function sketch(term: string) {
  const dialog = $<HTMLDialogElement>("#sketch")!
  const panel = $(".panel", dialog)!
  panel.innerHTML = `<p class="label">Unchecked sketch</p><h2>${esc(term)}</h2><p class="lead">Sketching it now…</p>`
  if (!dialog.open) dialog.showModal()
  const list = await all()
  const link = (name: string) => {
    const e = list.find((e) => [e.t, ...e.a].some((n) => norm(n) === norm(name)))
    return e ? `<a class="term" href="${e.u}" data-slug="${e.s}">${esc(name)}</a>` : `<a class="term wanted" href="#" data-want="${esc(name)}">${esc(name)}</a>`
  }
  try {
    const r = await fetch(`/api/draft?term=${encodeURIComponent(term)}`).then((r) => r.json())
    if (r.status !== "draft") {
      $(".lead", panel)!.textContent = r.status === "no" ? "That doesn't look like a term this wiki covers. If it is one, it has been noted." : "No note yet. It is on the list now, and the most wanted terms are written first."
      return
    }
    panel.innerHTML =
      `<p class="label">Unchecked sketch</p><h2>${esc(r.title)}</h2><p class="lead">${esc(r.one_line)}</p>` +
      `<div class="prose">${String(r.body).split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join("")}` +
      ((r.related ?? []).length ? `<p>Nearby: ${r.related.map(link).join(", ")}</p>` : "") +
      `</div><p class="draft-note">A small open model wrote this a moment ago and nobody has checked it against sources. Your request is counted: the most wanted terms get a real note, written from primary sources, in the next daily run.</p>`
    decorate(panel)
  } catch {
    $(".lead", panel)!.textContent = "Couldn't reach the sketcher. Check your connection and try again."
  }
}

// ---------- hover a term: its meaning, without leaving the sentence ----------

let tipTimer = 0
function wireTips() {
  if (!matchMedia("(hover: hover)").matches) return
  let tip = $("#tip")
  if (!tip) document.body.append((tip = Object.assign(document.createElement("div"), { id: "tip" })))
  document.addEventListener("mouseover", (e) => {
    const a = (e.target as Element).closest?.<HTMLAnchorElement>("article a.term[data-slug], .panel a.term[data-slug]")
    clearTimeout(tipTimer)
    if (!a) return tip!.classList.remove("on")
    tipTimer = window.setTimeout(async () => {
      const entry = (await all()).find((x) => x.s === a.dataset.slug)
      if (!entry) return
      tip!.style.setProperty("--c", `var(--c${entry.c})`)
      tip!.innerHTML = `${face(entry.s, entry.c)}<div><span class="label">${esc(entry.k)}</span><b>${esc(entry.t)}</b><p>${esc(entry.d)}</p><small>Click to dive in · ${entry.m} min</small></div>`
      const box = a.getBoundingClientRect()
      const below = box.top < 220
      tip!.style.left = Math.max(12, Math.min(innerWidth - 352, box.left + box.width / 2 - 170)) + scrollX + "px"
      tip!.style.top = (below ? box.bottom + 10 : box.top - 10) + scrollY + "px"
      tip!.style.translate = below ? "0 0" : "0 -100%"
      tip!.classList.add("on")
    }, 220)
  })
}

// ---------- the dive: the word you click becomes the next page's title ----------

let viaTerm = false
let direction = "forward"
const anchors = () => $$<HTMLAnchorElement>("main a[data-slug]")
const morph = (el: HTMLElement) => ((el.querySelector<HTMLElement>("h3") ?? el).style.viewTransitionName = "dive")

document.addEventListener("astro:before-preparation", (e: any) => {
  direction = e.direction
  const a = (e.sourceElement as Element | undefined)?.closest?.<HTMLAnchorElement>("main a[data-slug]")
  viaTerm = !!a?.closest("article")
  if (direction !== "forward") return sound.rise()
  if (!a) return
  const title = $("h1.title")
  if (title) title.style.viewTransitionName = "none" // only one thing on a page may carry the name
  morph(a)
  store.set("dive:" + location.pathname, anchors().indexOf(a), sessionStorage) // so coming back can shrink into the same word
  sound.dive()
})

document.addEventListener("astro:after-swap", () => {
  if (prefs().theme === "light") document.documentElement.dataset.theme = "light"
  if (direction !== "back") return
  const from = anchors()[store.get("dive:" + location.pathname, -1, sessionStorage)]
  if (!from) return
  const title = $("h1.title")
  if (title) title.style.viewTransitionName = "none"
  morph(from)
  setTimeout(() => {
    ;(from.querySelector<HTMLElement>("h3") ?? from).style.viewTransitionName = ""
    if (title) title.style.viewTransitionName = ""
  }, 900)
})

// The trail: every term you dived through to get here.
function trail() {
  const body = document.body.dataset
  let steps = store.get<Step[]>("trail", [], sessionStorage)
  if (!body.slug) steps = []
  else {
    const here: Step = { s: body.slug, t: body.title!.replace(/^#\d+\s*·\s*/, ""), u: location.pathname, c: Number(body.c) }
    const back = steps.findIndex((s) => s.s === here.s)
    steps = back >= 0 ? steps.slice(0, back + 1) : viaTerm ? [...steps, here] : [here]
  }
  store.set("trail", steps, sessionStorage)
  const el = $("[data-trail]")!
  el.innerHTML =
    steps.map((s, i) => (i ? `<i style="--hue:var(--c${s.c})"></i>` : "") + `<a href="${s.u}">${esc(s.t)}</a>`).join("") +
    (steps.length > 2 ? `<small>${steps.length - 1} deep</small>` : "")
  el.scrollLeft = 1e6
  return steps
}

// ---------- small things ----------

function contents() {
  const toc = $("[data-toc]")
  const heads = $$("article .prose > h2")
  if (!toc || heads.length < 2) return
  toc.innerHTML = `<b>On this page</b>` + heads.map((h) => `<a href="#${h.id}">${esc(h.textContent!)}</a>`).join("")
  const watch = new IntersectionObserver(
    (seen) => {
      for (const s of seen) if (s.isIntersecting) $$("a", toc).forEach((a) => a.classList.toggle("here", a.hash === "#" + s.target.id))
    },
    { rootMargin: "-90px 0px -65% 0px" },
  )
  heads.forEach((h) => watch.observe(h))
}

async function diagrams() {
  const found = $$("pre.mermaid:not([data-processed])")
  if (!found.length) return
  const src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs"
  const mermaid = (await import(/* @vite-ignore */ src)).default
  mermaid.initialize({ startOnLoad: false, theme: document.documentElement.dataset.theme === "light" ? "neutral" : "dark", fontFamily: "Figtree Variable, system-ui, sans-serif" })
  await mermaid.run({ nodes: found })
}

function theme() {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light"
  document.documentElement.dataset.theme = next
  setPref("theme", next)
}
function mute() {
  const on = !prefs().sound
  setPref("sound", on)
  $("[data-sound]")?.classList.toggle("off", !on)
  if (on) sound.open()
  toast(on ? "Sound on" : "Sound off")
}
async function random() {
  const pool = (await all()).filter((e) => e.c >= 0 && e.s !== document.body.dataset.slug)
  navigate(pool[Math.floor(Math.random() * pool.length)].u)
}
function onward() {
  const seen = store.get<Record<string, number>>("seen", {})
  const next = $$<HTMLAnchorElement>("article a[data-slug]").find((a) => !seen[a.dataset.slug!] && a.dataset.slug !== document.body.dataset.slug)
  next ? next.click() : toast(document.body.dataset.slug ? "You've opened everything this note links to" : "Open a note first")
}

// ---------- wiring ----------

document.addEventListener("click", (e) => {
  const el = e.target as Element
  const want = el.closest<HTMLElement>("a[data-want]")
  if (want) return e.preventDefault(), void sketch(want.dataset.want!)
  if (el.closest("#sketch a[data-slug]")) $<HTMLDialogElement>("#sketch")!.close()
  if (el.closest("[data-open-search]")) return openSearch()
  if (el.closest("[data-random]")) return void random()
  if (el.closest("[data-gotit]")) return understood()
  if (el.closest("[data-theme-toggle]")) return theme()
  if (el.closest("[data-sound]")) return mute()
  if (el.closest("[data-open-keys]")) return $<HTMLDialogElement>("#keys")!.showModal()
  if (el instanceof HTMLDialogElement) el.close() // a click outside the panel
})

document.addEventListener("keydown", (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as Element).tagName)
  if (e.key === "k" && (e.metaKey || e.ctrlKey)) return e.preventDefault(), openSearch()
  if (typing || e.metaKey || e.ctrlKey || e.altKey || $("dialog[open]")) return
  const up = () => (store.get<Step[]>("trail", [], sessionStorage).length > 1 ? history.back() : document.body.dataset.slug && navigate("/"))
  const keys: Record<string, () => unknown> = {
    "/": () => openSearch(),
    "?": () => $<HTMLDialogElement>("#keys")!.showModal(),
    "]": onward,
    "[": up,
    Escape: up,
    r: random,
    h: () => navigate("/"),
    d: () => document.body.dataset.today && navigate(document.body.dataset.today),
    u: understood,
    a: () => {
      const list = $$<HTMLDetailsElement>("article details.callout")
      const on = !list.every((d) => d.open)
      list.forEach((d) => (d.open = on))
    },
    m: mute,
    t: theme,
  }
  if (keys[e.key]) return e.preventDefault(), void keys[e.key]()
  // On the home page, just start typing: the first letter opens search.
  if (!document.body.dataset.slug && e.key.length === 1 && /[\p{L}\p{N}]/u.test(e.key)) {
    e.preventDefault()
    openSearch(e.key)
  }
})

document.addEventListener("astro:page-load", () => {
  const slug = document.body.dataset.slug
  if (slug) store.set("seen", { ...store.get("seen", {}), [slug]: Date.now() })
  trail()
  decorate()
  wireSearch()
  contents()
  diagrams()
  $("[data-sound]")?.classList.toggle("off", !prefs().sound)
})
wireTips()
