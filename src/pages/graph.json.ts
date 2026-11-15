// The map on the home page: notes and the links between them.
import { notes, edges } from "../lib/wiki"

export const GET = () => {
  const shown = notes.filter((n) => n.type !== "page" && n.type !== "review")
  const at = new Map(shown.map((n, i) => [n.slug, i]))
  return Response.json({
    n: shown.map((n) => [n.slug, n.title, n.url, n.type]),
    e: edges().filter(([a, b]) => at.has(a) && at.has(b)).map(([a, b]) => [at.get(a), at.get(b)]),
  })
}
