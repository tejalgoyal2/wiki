// Every concept gets a face: an emblem drawn from the term's own name.
// Same name, same emblem, always; no two names share one. Rings of arcs, ticks and points around a core,
// like the dial of an instrument. Used on the wall, on note pages, in search and in hover previews.
// It draws in `currentColor`, so whatever holds it decides the colour (grey until opened, then the subject's).

function seeded(text: string) {
  let h = 1779033703 ^ text.length
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

export function emblem(name: string): string {
  const r = seeded(name.toLowerCase())
  const pick = <T,>(list: T[]) => list[Math.floor(r() * list.length)]
  const rings = 3 + Math.floor(r() * 3)
  const parts: string[] = []
  for (let i = 0; i < rings; i++) {
    const radius = 13 + (i * 33) / (rings - 1)
    const turn = Math.round(r() * 360)
    const speed = Math.round((18 + r() * 40) * (r() < 0.5 ? -1 : 1))
    const kind = pick(["arc", "arc", "ticks", "points", "line", "arc"])
    let shape = ""
    if (kind === "line") shape = `<circle cx="50" cy="50" r="${radius}" stroke-width="0.9" opacity="0.55"/>`
    else if (kind === "ticks") {
      const gap = pick([1.2, 1.6, 2.4])
      shape = `<circle cx="50" cy="50" r="${radius}" pathLength="100" stroke-width="${pick([3, 4.5, 6])}" stroke-dasharray="${pick([0.5, 0.8])} ${gap}" opacity="0.8"/>`
    } else if (kind === "points") {
      const n = 2 + Math.floor(r() * 6)
      const size = pick([1.8, 2.4, 3.2])
      shape = `<circle cx="50" cy="50" r="${radius}" stroke-width="0.6" opacity="0.3"/>`
      for (let p = 0; p < n; p++) {
        const a = (p / n) * Math.PI * 2 + (r() < 0.4 ? r() * 0.5 : 0)
        shape += `<circle cx="${(50 + Math.cos(a) * radius).toFixed(1)}" cy="${(50 + Math.sin(a) * radius).toFixed(1)}" r="${size}" fill="currentColor" stroke="none"/>`
      }
    } else {
      const a = 12 + Math.round(r() * 38), b = 6 + Math.round(r() * 20)
      const dash = r() < 0.5 ? `${a} ${100 - a}` : `${a} ${b} ${Math.max(4, 60 - a)} ${Math.max(6, 40 - b)}`
      shape = `<circle cx="50" cy="50" r="${radius}" pathLength="100" stroke-width="${pick([2.2, 3.4, 5])}" stroke-linecap="round" stroke-dasharray="${dash}"/>`
    }
    parts.push(`<g class="ring" style="--s:${speed}s;rotate:${turn}deg">${shape}</g>`)
  }
  const core = pick([
    `<circle cx="50" cy="50" r="5" fill="currentColor" stroke="none"/>`,
    `<circle cx="50" cy="50" r="6.5" stroke-width="2.4"/>`,
    `<rect x="45" y="45" width="10" height="10" rx="1.5" fill="currentColor" stroke="none" transform="rotate(45 50 50)"/>`,
    `<circle cx="50" cy="50" r="2.6" fill="currentColor" stroke="none"/><circle cx="50" cy="50" r="7.5" stroke-width="1"/>`,
  ])
  return `<svg class="emblem" viewBox="0 0 100 100" fill="none" stroke="currentColor" aria-hidden="true">${parts.join("")}${core}</svg>`
}
