# CipherDrill

CipherDrill is a local Next.js app for cybersecurity final exam practice. It is built around mechanism-based reasoning: every answer submission reveals the mechanism, why each distractor is wrong, and which trap categories are catching you.

## Stack

- Next.js App Router + TypeScript strict mode
- Tailwind CSS + shadcn/ui-style components
- SQLite through a DB adapter: better-sqlite3 locally, Turso/libSQL for Vercel
- Drizzle ORM schema
- Recharts analytics
- react-markdown, remark-gfm, KaTeX, Prism
- Zustand client state

## Setup

```bash
pnpm install
pnpm db:migrate
pnpm ingest
pnpm dev
```

The dev script also runs migrations and ingestion before starting Next.js, so new question banks are picked up automatically when the dev server starts.

## Database Driver

CipherDrill imports the database only through `lib/db/index.ts`. Local development defaults to better-sqlite3:

```bash
DB_DRIVER=local
LOCAL_DB_PATH=./cipherdrill.db
```

For Turso, set `DB_DRIVER=turso` plus `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. See `.env.example` for the full shape.

## Add Question Banks

Put one JSON file per lecture in `question-banks/`:

```text
question-banks/lecture-03-block-ciphers.json
```

The filename should match `lectureId`. The schema is documented in `question-banks/README.md` and enforced by `question-banks/_schema.json`.

Re-ingest with:

```bash
pnpm ingest
```

or use the Ingest button on the dashboard.

## Add Diagrams

Place diagram assets in:

```text
question-banks/diagrams/{diagramRef}.svg
question-banks/diagrams/{diagramRef}.png
```

Set `diagramRef` on any question that should show the asset.

## Add Concept Primers

Put Markdown primers in `concept-primers/` with the same lecture id:

```text
concept-primers/lecture-03-block-ciphers.md
```

Primers support GFM, code blocks, and KaTeX math. Headings become quick-jump links into practice.

## How It Works

- Ingestion validates every question bank with AJV and reports file path, field path, and validation failure.
- Lectures and questions are upserted into SQLite; orphaned questions are deleted when a lecture file changes.
- Attempts are recorded locally with no auth and no client-side secrets.
- Wrong answers and marked questions enter a lightweight SM-2-style review queue.
- Mixed mode samples across lectures with weights for weak trap categories, never-attempted questions, due review, and random coverage.
- Analytics centers trap-category accuracy so you can see whether the issue is definition boundaries, mechanism confusion, overclaims, or another repeated distractor pattern.

## Deploying to Vercel

1. Create a Turso DB: `turso db create cipherdrill`
2. Get the database URL: `turso db show cipherdrill --url`
3. Get an auth token: `turso db tokens create cipherdrill`
4. In Vercel project settings, set:
   - `DB_DRIVER=turso`
   - `TURSO_DATABASE_URL=<url>`
   - `TURSO_AUTH_TOKEN=<token>`
5. Run migrations against Turso once: `DB_DRIVER=turso pnpm db:migrate`
6. Question banks on Vercel are read-only at runtime. Commit new files in `question-banks/` and `concept-primers/`, then let Vercel redeploy. The ingestion pipeline reads from the deployed files and writes to Turso.
7. Trigger ingestion after deploy from the dashboard Ingest button, or call `/api/ingest`.
