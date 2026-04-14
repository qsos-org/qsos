---
title: "Grilles d'évaluation"
description: "Créer et utiliser les grilles d'évaluation dans QSOS"
---

Les **grilles d'évaluation** sont le **composant central** de la méthodologie QSOS. Elles fournissent une manière **structurée** d'évaluer les logiciels open source selon des critères spécifiques et reproductibles. C'est la **Phase 2** de la méthodologie.

Une grille d'évaluation est un **modèle immuable** qui définit:
- **Critères d'évaluation** : aspects spécifiques à noter (Performance, Sécurité, Maintenabilité, etc.)
- **Exigences par type** : spécifiques aux types de logiciels (Web frameworks ≠ Databases)
- **Système de notation** : échelle 0-1-2 avec descriptions claires pour chaque niveau

---

## ÉTAPE 1: Créer une Grille

Où: Type → Onglet "Grilles" → "+ Créer une grille"

Vous remplissez:
- **Nom**: Exemple `Web Frameworks Evaluation`
- **Description**: Contexte de la grille

La **section Maturité QSOS 2.0** s'ajoute automatiquement (immuable et verrouillée).

<details>
<summary>Voir le JSON</summary>

```json
{
  "gridVersion": "1.0",
  "qsosVersion": "2.0",
  "name": "Web Frameworks Evaluation",
  "description": "Grille pour évaluer les frameworks web modernes",
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

## ÉTAPE 2: Ajouter Sections et Critères

Après Maturité, vous créez vos sections custom (Performance, Maintenability, Security, etc.)

Pour chaque section:
- **Nom**: Libellé (ex: `Performance`)
- **Description**: Contexte

Pour chaque critère:
- **Nom**: (ex: `Client-side reactivity`)
- **Description**: Qu'on évalue
- **desc0**: Score 0 - Qu'est-ce que ça signifie?
- **desc1**: Score 1 - Qu'est-ce que ça signifie?
- **desc2**: Score 2 - Qu'est-ce que ça signifie?

Vous pouvez ajouter des sous-sections pour une meilleure hiérarchie (ex: Performance → Client-side → critères).

Validation: min 3 sections (Maturité incluse), chaque critère doit avoir desc0/1/2.

<details>
<summary>Voir le JSON</summary>

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

## ÉTAPE 3: Sauvegarder et Versionner

Vous sauvegardez → Grille v1.0 créée (immuable)

Pour modifier: créer nouvelle version (1.0 → 1.1 ou 2.0)

Vous remplissez:
- **Changelog**: Résumé des changements
- **Type**: Patch (1.0→1.1), Minor (1.0→2.0), Major (2.0→3.0)

Si nouvelle version QSOS disponible: option pour updater la section Maturité

<details>
<summary>Voir le JSON - v1.1</summary>

```json
{
  "gridVersion": "1.1",
  "qsosVersion": "2.0",
  "changelog": "Clarified desc2 for Client-side reactivity criterion"
}
```

</details>

---

## ÉTAPE 4: Utiliser une Grille pour Évaluer

Où: Type → Software → Version → "Évaluations" → "+ Créer une évaluation"

Vous sélectionnez la grille (ex: v1.0)

Pour chaque critère:
- **Score**: 0, 1, ou 2
- **Justification**: Pourquoi ce score?
- **Sources**: Liens/références

<details>
<summary>Voir le JSON</summary>

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
          "comment": "React 19 avec concurrent rendering. Sub-millisecond updates.",
          "sources": "https://react.dev/blog/2024/12/19/react-19"
        }
      ]
    }
  ]
}
```

</details>

---

## Bonnes pratiques

- Garder les critères mesurables et objectifs
- Documenter la justification des notes
- Réviser et mettre à jour les grilles régulièrement
- Impliquer plusieurs évaluateurs pour l'objectivité
