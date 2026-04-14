---
title: 'Phase 3: Qualify'
description: 'Weighting criteria and requirement presets'
---

## Purpose

Once software is evaluated (Phase 2), you must compare them. Phase 3 adds **organizational context**: "Which criteria matter MOST to US?"

This is done through **requirement presets**: sets of weights that encode your priorities.

## Key Concept

Presets map each criterion to a **numeric weight** that determines its influence in the final comparison:

**Formula**: `Final Score = (∑ score × weight) / (∑ weights)`

Example:
```
Performance:      2 × 100  = 200
Maintainability:  2 × 300  = 600
Activity:         1 × 150  = 150
───────────────────────────────
Score = (200+600+150) / (100+300+150) = 950/550 = 1.73
```

A weight of 300 vs 100 means that criterion is **3x more influential** in the final score.

---

## Next Step

Once presets are created → **[Phase 4: Select](/en/methodology/04-select)**

You apply weights to evaluations to generate ranked comparisons.

---
