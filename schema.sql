-- Cloudflare D1 database "wiki": what readers looked for and did not find.
CREATE TABLE IF NOT EXISTS wanted (
  term TEXT PRIMARY KEY,      -- lower-cased
  count INTEGER NOT NULL DEFAULT 1,
  draft TEXT,                 -- JSON {title, one_line, body, related} from the small model
  ok INTEGER,                 -- 1 drafted, 0 the model said it is not a term for this wiki
  first TEXT, last TEXT,      -- dates of the first and latest request
  drafted_on TEXT             -- date the model was called (daily cap)
);
