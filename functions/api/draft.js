// GET /api/draft?term=cpu
// Someone searched for a term that has no note. Count the request, and answer with a short draft from a
// small open model on Workers AI (free tier). Each term is drafted once and then served from the database.
// The daily writer reads the counts (see wanted.js) and replaces drafts with real, sourced notes.

const DRAFTS_PER_DAY = 120 // stays inside the free 10,000 neurons a day
const MODELS = ["@cf/meta/llama-3.3-70b-instruct-fp8-fast", "@cf/meta/llama-3.1-8b-instruct-fp8"]

const SYSTEM = `You write short entries for a public learning wiki about software, computing, data, machine learning, networks, maths and how technology works.
The user gives you one term. Reply with JSON only, no other text:
{"ok":true,"title":"the term, properly capitalised","one_line":"what it is, in one plain sentence of at most 30 words","paragraphs":["two or three short paragraphs, 120 to 180 words in total. Simple everyday English and short sentences. Say what it is, how it works, and give one concrete example. No markdown, no lists."],"related":["up to 5 closely related technical terms"]}
If the term is not a real concept in those fields, is offensive, is a request rather than a term, or you are not sure what it means, reply {"ok":false}.
Never invent version numbers, dates, names or statistics. If a detail is uncertain, leave it out.`

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } })

export async function onRequestGet({ request, env }) {
  const raw = (new URL(request.url).searchParams.get("term") ?? "").normalize("NFKC").replace(/\s+/g, " ").trim()
  if (!/^[\p{L}\p{N}][\p{L}\p{N} .+#/'&()-]{0,59}$/u.test(raw)) return json({ status: "no" }, 400)
  const term = raw.toLowerCase()
  const today = new Date().toISOString().slice(0, 10)

  await env.DB.prepare(
    `INSERT INTO wanted (term, count, first, last) VALUES (?1, 1, ?2, ?2)
     ON CONFLICT(term) DO UPDATE SET count = count + 1, last = ?2`,
  ).bind(term, today).run()
  const row = await env.DB.prepare(`SELECT draft, ok FROM wanted WHERE term = ?1`).bind(term).first()
  if (row?.ok === 0) return json({ status: "no" })
  if (row?.draft) return json({ status: "draft", ...JSON.parse(row.draft) })

  const used = await env.DB.prepare(`SELECT COUNT(*) AS n FROM wanted WHERE drafted_on = ?1`).bind(today).first()
  if (used.n >= DRAFTS_PER_DAY) return json({ status: "queued" })

  let draft = null
  for (const model of MODELS) {
    try {
      const out = await env.AI.run(model, {
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: `Term: ${raw}` }],
        max_tokens: 500,
        temperature: 0.2,
      })
      const text = typeof out.response === "string" ? out.response : JSON.stringify(out.response ?? "")
      // Models sometimes put raw line breaks inside JSON strings; as spaces they are harmless.
      draft = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1).replace(/[\r\n\t]+/g, " "))
      if (Array.isArray(draft.paragraphs)) draft.body = draft.paragraphs.join("\n\n")
      break
    } catch {}
  }
  if (!draft) return json({ status: "queued" })

  const clean = (v, max) => String(v ?? "").replace(/[<>]/g, "").slice(0, max).trim()
  if (!draft.ok || !draft.body) {
    await env.DB.prepare(`UPDATE wanted SET ok = 0, drafted_on = ?2 WHERE term = ?1`).bind(term, today).run()
    return json({ status: "no" })
  }
  const saved = {
    title: clean(draft.title, 80) || raw,
    one_line: clean(draft.one_line, 300),
    body: clean(draft.body, 2000),
    related: (Array.isArray(draft.related) ? draft.related : []).slice(0, 5).map((r) => clean(r, 50)).filter(Boolean),
  }
  await env.DB.prepare(`UPDATE wanted SET draft = ?2, ok = 1, drafted_on = ?3 WHERE term = ?1`)
    .bind(term, JSON.stringify(saved), today).run()
  return json({ status: "draft", ...saved })
}
