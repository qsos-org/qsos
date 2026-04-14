---
title: 'Software Comparison'
description: 'Compare software using QSOS methodology'
---

The **QSOS comparison feature** allows you to evaluate multiple software options side-by-side using structured criteria and custom weights. This is **Phase 4** of the methodology.

---

## STEP 1: Select software to compare

Go to a software type in comparison mode

**Card or table view** (on the left):
- Check at least 2 software to compare
- Toggle at the top to change view (cards ↔ table)

**Selection panel** (on the right, appears when you check):
- Displays checked software
- Click "Compare" (button enabled if ≥ 2 selected)

---

## STEP 2: View comparison table

**At the top**: Dropdown to choose the **grid version**

The table displays:
- **Criteria**: all criteria from the grid
- **Weights**: editable column to weight (0-2)
- **Software**: columns with scores for each software
  - Dropdown to choose version for each software
  - Number of evaluations available for that version

Scores calculated automatically

<details>
<summary>View JSON data</summary>

```json
{
  "softwareType": "web_frameworks",
  "gridVersion": "1.7",
  "selectedSoftwares": [
    {
      "uid": "react",
      "version": "19"
    },
    {
      "uid": "angular",
      "version": "18"
    }
  ]
}
```

</details>

---

## STEP 3: Apply weighting (optional)

Dropdown "Presets" to load existing weightings

Or modify weights manually

Button "Save weights"

---

## STEP 4: Visualize and export

**"Export PDF" button** to generate a report

Charts: Radar, Bubble (change view)

---

## Best Practices

- Always load an existing grid (v1.0 minimum)
- Check available versions for each software
- Weights should reflect actual organizational priorities
- Save presets for future reuse
- Export results before modifying weights
