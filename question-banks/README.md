# CipherDrill Question Banks

Drop one JSON file per lecture in this folder. Run `pnpm ingest` or press the Ingest button on the dashboard after editing files.

## Naming

Use:

```text
lecture-{NN}-{kebab-topic}.json
```

Example:

```text
lecture-03-block-ciphers.json
```

The `lectureId` inside the file should match the filename without `.json`.

## Diagrams

Put shared diagrams in:

```text
question-banks/diagrams/{diagramRef}.svg
question-banks/diagrams/{diagramRef}.png
```

Then set `"diagramRef": "ind-cpa-game"` on each question that should show that diagram. If the file is missing, CipherDrill shows a placeholder slot.

## Concept Primers

Put matching primers in:

```text
concept-primers/lecture-{NN}-{topic}.md
```

The primer filename should match the question bank `lectureId`.

## Field Reference

- `lectureId`: stable lecture slug, matching `lecture-{NN}-{kebab-topic}`.
- `lectureTitle`: display title.
- `lectureNumber`: numeric order.
- `topics`: lecture-level topic tags.
- `questions`: array of question objects.
- `id`: unique within the lecture, such as `L03-Q01`.
- `type`: one of `MECHANISM`, `NOT_PROVIDE`, `DIAGRAM`, `GAME_WALK`, `DISTRACTOR_TRAP`, `APPLICATION`, `SYNTHESIS`.
- `difficulty`: one of `Foundational`, `Core`, `Advanced`, `Trap`.
- `topic`: primary topic for filtering and analytics.
- `stem`: markdown-enabled prompt text.
- `choices`: answer choices with stable `id` values such as `A`, `B`, `C`, `D`.
- `correctAnswer`: choice id.
- `mechanisticExplanation`: markdown and KaTeX-enabled explanation of the mechanism.
- `distractorAnalysis`: object keyed by wrong choice id explaining why each distractor is wrong.
- `trapCategories`: free-form tags used by analytics.
- `diagramRef`: string id or `null`.
- `gameRef`: string id or `null`; shared ids group procedural game-walk questions.

## Worked Example

```json
{
  "lectureId": "lecture-03-block-ciphers",
  "lectureTitle": "Block Ciphers and Modes of Operation",
  "lectureNumber": 3,
  "topics": ["CBC", "CTR", "ECB", "IND-CPA", "determinism"],
  "questions": [
    {
      "id": "L03-Q01",
      "type": "MECHANISM",
      "difficulty": "Core",
      "topic": "CTR mode",
      "stem": "In CTR mode, an attacker observes that the same nonce was reused across two encryptions under the same key. What is the most precise consequence?",
      "choices": [
        {
          "id": "A",
          "text": "The plaintexts can be recovered directly from the ciphertexts."
        },
        {
          "id": "B",
          "text": "XOR of the two ciphertexts equals XOR of the two plaintexts, leaking information."
        },
        {
          "id": "C",
          "text": "The key is recoverable via known-plaintext attack."
        },
        {
          "id": "D",
          "text": "Confidentiality is preserved as long as the messages are short."
        }
      ],
      "correctAnswer": "B",
      "mechanisticExplanation": "CTR generates a keystream by encrypting `(nonce || counter)`. Reusing nonce + key reproduces the same keystream, so XORing ciphertexts cancels the keystream and exposes `M_1 \\\\oplus M_2`.",
      "distractorAnalysis": {
        "A": "Absolutist trap: recovery is not direct from ciphertexts alone; the structural leak is the XOR relationship.",
        "C": "Conflates keystream reuse with key compromise.",
        "D": "Length does not fix keystream reuse."
      },
      "trapCategories": ["absolutist-language", "mechanism-vs-outcome"],
      "diagramRef": null,
      "gameRef": null
    }
  ]
}
```

## JSON Schema

The authoritative schema is also saved in `_schema.json`. Ingestion validates every file against it with AJV and reports the file path, field path, and failed rule.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://local.cipherdrill/question-bank.schema.json",
  "title": "CipherDrill Question Bank",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "lectureId",
    "lectureTitle",
    "lectureNumber",
    "topics",
    "questions"
  ],
  "properties": {
    "lectureId": {
      "type": "string",
      "pattern": "^lecture-[0-9]{2}-[a-z0-9]+(?:-[a-z0-9]+)*$"
    },
    "lectureTitle": {
      "type": "string",
      "minLength": 1
    },
    "lectureNumber": {
      "type": "integer",
      "minimum": 0
    },
    "topics": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "string",
        "minLength": 1
      }
    },
    "questions": {
      "type": "array",
      "minItems": 1,
      "items": {
        "$ref": "#/definitions/question"
      }
    }
  },
  "definitions": {
    "choice": {
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "text"],
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1
        },
        "text": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "question": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "id",
        "type",
        "difficulty",
        "topic",
        "stem",
        "choices",
        "correctAnswer",
        "mechanisticExplanation",
        "distractorAnalysis",
        "trapCategories",
        "diagramRef",
        "gameRef"
      ],
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1
        },
        "type": {
          "type": "string",
          "enum": [
            "MECHANISM",
            "NOT_PROVIDE",
            "DIAGRAM",
            "GAME_WALK",
            "DISTRACTOR_TRAP",
            "APPLICATION",
            "SYNTHESIS"
          ]
        },
        "difficulty": {
          "type": "string",
          "enum": ["Foundational", "Core", "Advanced", "Trap"]
        },
        "topic": {
          "type": "string",
          "minLength": 1
        },
        "stem": {
          "type": "string",
          "minLength": 1
        },
        "choices": {
          "type": "array",
          "minItems": 2,
          "items": {
            "$ref": "#/definitions/choice"
          }
        },
        "correctAnswer": {
          "type": "string",
          "minLength": 1
        },
        "mechanisticExplanation": {
          "type": "string",
          "minLength": 1
        },
        "distractorAnalysis": {
          "type": "object",
          "additionalProperties": {
            "type": "string",
            "minLength": 1
          }
        },
        "trapCategories": {
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1
          }
        },
        "diagramRef": {
          "type": ["string", "null"]
        },
        "gameRef": {
          "type": ["string", "null"]
        }
      }
    }
  }
}
```
