import { lessons } from "../lib/wiki"

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export const GET = ({ site }: { site: URL }) =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>wiki.tgoyal.me</title><link>${site}</link>
<description>One lesson a day, and a note for every term in it.</description>
${lessons
  .map(
    (l) => `<item><title>${esc(l.title)}</title><link>${new URL(l.url, site)}</link><guid>${new URL(l.url, site)}</guid>
<pubDate>${new Date(String(l.data.created)).toUTCString()}</pubDate><description>${esc(l.lead)}</description></item>`,
  )
  .join("\n")}
</channel></rss>`,
    { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
  )
