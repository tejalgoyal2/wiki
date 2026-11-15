// The search index: small enough to load whole. [slug, url, title, aliases, one line, kind]
import { notes, kind } from "../lib/wiki"

export const GET = () =>
  Response.json(
    notes
      .filter((n) => n.type !== "review")
      .map((n) => ({ s: n.slug, u: n.url, t: n.title, a: (n.data.aliases ?? []).map(String), d: n.lead, k: kind(n) })),
  )
