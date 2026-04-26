# CipherDrill Concept Primers

Drop one Markdown primer per lecture in this folder. The filename must match the question bank `lectureId`.

Example:

```text
concept-primers/lecture-02-ind-cpa-determinism.md
question-banks/lecture-02-ind-cpa-determinism.json
```

## Supported Markdown

Primers support:

- GitHub-flavored Markdown tables and checklists.
- Fenced code blocks with Prism highlighting.
- Inline math with `$...$`.
- Display math with `$$...$$`.
- Headings, which become quick-jump practice links in the concept viewer.

## Re-ingestion

After adding or editing primers, run:

```bash
pnpm ingest
```

You can also press Ingest on the CipherDrill dashboard. The app links primers by matching the Markdown filename to `lectureId`.
