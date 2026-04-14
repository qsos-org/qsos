---
title: 'Evaluation Grids'
description: 'Create and use evaluation grids in QSOS'
---

**Evaluation grids** are the **central component** of the QSOS methodology. They provide a **structured** way to evaluate open source software according to specific and reproducible criteria. This is **Phase 2** of the methodology.

An evaluation grid is an **immutable template** that defines:
- **Evaluation criteria**: specific aspects to score (Performance, Security, Maintainability, etc.)
- **Type-specific requirements**: tailored to software types (Web frameworks ≠ Databases)
- **Scoring system**: 0-1-2 scale with clear descriptions for each level

---

## STEP 1: Create a Grid

Where: Type → "Grids" tab → "+ Create a grid"

You fill in:
- **Name**: Example `Web Frameworks Evaluation`
- **Description**: Context of the grid

The **QSOS 2.0 Maturity section** is added automatically (immutable and locked).

<details>
<summary>View JSON</summary>

```json
{
  "gridVersion": "1.0",
  "qsosVersion": "2.0",
  "name": "Web Frameworks Evaluation",
  "description": "Grid to evaluate modern web frameworks",
  "sections": [
    {
      "name": "qsos_maturity_2_0.maturity",
      "locked": true
    }
  ]
}
```

</details>

---

## STEP 2: Add Sections and Criteria

After Maturity, you create your custom sections (Performance, Maintainability, Security, etc.)

For each section:
- **Name**: Label (e.g., `Performance`)
- **Description**: Context

For each criterion:
- **Name**: (e.g., `Client-side reactivity`)
- **Description**: What we evaluate
- **desc0**: Score 0 - What does it mean?
- **desc1**: Score 1 - What does it mean?
- **desc2**: Score 2 - What does it mean?

You can add sub-sections for better hierarchy (e.g., Performance → Client-side → criteria).

Validation: min 3 sections (Maturity included), each criterion must have desc0/1/2.

<details>
<summary>View JSON</summary>

```json
{
  "gridVersion": "1.0",
  "qsosVersion": "2.0",
  "sections": [
    {
      "name": "qsos_maturity_2_0.maturity",
      "locked": true
    },
    {
      "name": "Performance",
      "sections": [
        {
          "name": "Client side reactivity",
          "desc0": "Refresh time > 500ms",
          "desc1": "Refresh time 100-500ms",
          "desc2": "Refresh time < 100ms"
        }
      ]
    },
    {
      "name": "Maintainability",
      "sections": [
        {
          "name": "Code documentation",
          "desc0": "No documentation",
          "desc1": "Basic documentation",
          "desc2": "Excellent documentation"
        }
      ]
    }
  ]
}
```

</details>

---

## STEP 3: Save and Version

You save → Grid v1.0 created (immutable)

To modify: create new version (1.0 → 1.1 or 2.0)

You fill in:
- **Changelog**: Summary of changes
- **Type**: Patch (1.0→1.1), Minor (1.0→2.0), Major (2.0→3.0)

If new QSOS version available: option to update Maturity section

<details>
<summary>View JSON - v1.1</summary>

```json
{
  "gridVersion": "1.1",
  "qsosVersion": "2.0",
  "changelog": "Clarified desc2 for Client-side reactivity criterion"
}
```

</details>

---

## STEP 4: Use a Grid to Evaluate

Where: Type → Software → Version → "Evaluations" → "+ Create an evaluation"

You select the grid (e.g., v1.0)

For each criterion:
- **Score**: 0, 1, or 2
- **Justification**: Why this score?
- **Sources**: Links/references

<details>
<summary>View JSON</summary>

```json
{
  "evaluationUid": "eval-123",
  "gridVersion": "1.0",
  "software": "react",
  "softwareVersion": "19",
  "sections": [
    {
      "name": "Performance",
      "sections": [
        {
          "name": "Client side reactivity",
          "score": 2,
          "comment": "React 19 with concurrent rendering. Sub-millisecond updates.",
          "sources": "https://react.dev/blog/2024/12/19/react-19"
        }
      ]
    }
  ]
}
```

</details>

---

## Best Practices

- Keep criteria measurable and objective
- Document scoring rationale
- Review and update grids regularly
- Involve multiple evaluators for objectivity