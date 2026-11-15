// One small file per note: what a card shows when it opens on the map.
import { notes, cardBody, type Note } from "../../lib/wiki"

export const getStaticPaths = () => notes.map((note) => ({ params: { slug: note.slug }, props: { note } }))

export const GET = ({ props }: { props: { note: Note } }) => Response.json({ html: cardBody(props.note) })
