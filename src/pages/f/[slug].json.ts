// One small file per note: what the side trail shows when you click a term.
import { notes, kind, type Note } from "../../lib/wiki"

export const getStaticPaths = () => notes.map((note) => ({ params: { slug: note.slug }, props: { note } }))

export const GET = ({ props }: { props: { note: Note } }) => {
  const n = props.note
  return Response.json({ slug: n.slug, url: n.url, title: n.title, kind: kind(n), lead: n.lead, html: n.peek, minutes: n.minutes })
}
