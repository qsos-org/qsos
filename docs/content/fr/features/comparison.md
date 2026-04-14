---
title: 'Comparaison de logiciels'
description: 'Comparer des logiciels avec la méthodologie QSOS'
---

La fonctionnalité de **comparaison QSOS** vous permet d'évaluer plusieurs options de logiciels côte à côte en utilisant des critères structurés et des poids personnalisés. C'est la **Phase 4** de la méthodologie.

---

## ÉTAPE 1: Sélectionner les logiciels à comparer

Allez sur un type en mode comparaison

**Vue cards ou tableau** (à gauche):
- Cochez au moins 2 logiciels à comparer
- Toggle en haut pour changer de vue (cards ↔ tableau)

**Panneau de sélection** (à droite, apparaît quand vous cochez):
- Affiche les logiciels cochés
- Cliquez "Comparer" (bouton activé si ≥ 2 sélectionnés)

---

## ÉTAPE 2: Voir le tableau de comparaison

**En haut**: Dropdown pour choisir la **version de la grille**

Le tableau affiche:
- **Critères** : tous les critères de la grille
- **Poids**: colonne éditable pour pondérer (0-2)
- **Softwares** : colonnes avec scores pour chaque logiciel
  - Dropdown pour choisir la version de chaque software
  - Nombre d'évaluations disponibles pour cette version

Scores calculés automatiquement

<details>
<summary>Voir le JSON des données</summary>

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

## ÉTAPE 3: Appliquer une pondération (optionnel)

Dropdown "Préréglages" pour charger des pondérations existantes

Ou modifier les poids manuellement

Bouton "Sauvegarder les poids"

---

## ÉTAPE 4: Visualiser et exporter

**Bouton "Exporter PDF"** pour générer un rapport

Graphiques: Radar, Bubble (changement de vue)

---

## Bonnes pratiques

- Toujours charger une grille existante (v1.0 minimum)
- Vérifier les versions disponibles pour chaque logiciel
- Les poids doivent refléter les priorités organisationnelles réelles
- Sauvegarder les préréglages pour réutilisation future
- Exporter les résultats avant de modifier les poids
