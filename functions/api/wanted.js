// GET /api/wanted : the terms readers asked for, most wanted first.
// The Wanted page shows it, and the daily writer reads it to decide what to write next.
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT term, count, last FROM wanted WHERE ok IS NOT 0 ORDER BY count DESC, last DESC LIMIT 100`,
  ).all()
  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
  })
}
