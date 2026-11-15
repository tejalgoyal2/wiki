// One small file per note: the opening of the note, shown in search while you type.
import { notes, type Note } from "../../lib/wiki"

export const getStaticPaths = () => notes.map((note) => ({ params: { slug: note.slug }, props: { note } }))

export const GET = ({ props }: { props: { note: Note } }) => Response.json({ html: props.note.peek })
