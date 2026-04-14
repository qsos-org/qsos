---
title: 'Types de logiciels'
description: 'Créer et gérer les catégories de logiciels dans QSOS'
---

QSOS organise les logiciels en **catégories** pour fournir des critères d'évaluation plus pertinents. Chaque type de logiciel possède des grilles d'évaluation spécifiques adaptées à ses caractéristiques uniques. C'est la **Phase 1** de la méthodologie.

---

## ÉTAPE 1: Créer un Type

Un **type de logiciel** regroupe des solutions comparables. Exemple: "Web frameworks" = React, Angular, Vue.js.

Pour créer un type:
- **Nom** : nom d'affichage (ex: `Web frameworks`)
- **Description** : contexte du type
- **Icône** : optionnel

L'**UID est auto-généré** à partir du nom (ex: "Web frameworks" → `web_frameworks`)

<details>
<summary>Voir le JSON</summary>

```json
{
  "uid": "web_frameworks",
  "name": "Web frameworks",
  "description": "Development frameworks for web applications",
  "icon": "",
  "creatorEmail": "alice@company.fr",
  "createdAt": "2025-09-08T13:44:00.578Z",
  "updatedAt": "2025-09-08T13:44:00.578Z"
}
```

</details>

---

## ÉTAPE 2: Ajouter un Logiciel

Vous pouvez créer un nouveau type ou ajouter vos logiciels à un type existant.

Pour ajouter un logiciel:
- **Nom** : nom officiel (ex: `React`)
- **Description** : courte description
- **Licence** : code SPDX (ex: `MIT`, `Apache-2.0`, `GPL-3.0`)
- **URL** : site officiel
- **Demo URL** : optionnel
- **Icône** : optionnel

L'**UID est auto-généré** à partir du nom (ex: "React" → `react`)

### Licences SPDX courantes

- `MIT` → React, Vue.js, Node.js
- `Apache-2.0` → Android, Kafka
- `GPL-3.0` → Linux
- `BSD-3-Clause` → Django, NumPy
- `ISC` → npm, Yarn
- `MPL-2.0` → Firefox

Exemple React:

<details>
<summary>Voir le JSON</summary>

```json
{
  "uid": "react",
  "name": "React",
  "description": "Library for web and native user interfaces",
  "licenseId": "MIT",
  "url": "https://react.dev/",
  "demoUrl": "https://react.dev/learn",
  "icon": "icon.png"
}
```

</details>

---

## ÉTAPE 3: Ajouter une Version

Pour ajouter une version:
- **Version** : numéro (ex: `19`, `18`, `3.4.0`)
- **Résumé** : changements/features

Exemple React 19:

<details>
<summary>Voir le JSON</summary>

```json
{
  "version": "19",
  "summary": "Introducing Actions and Server Components",
  "dateAdded": "2025-09-08T13:44:00.578Z"
}
```

</details>

---

## Bonnes pratiques

- Noms clairs et descriptifs pour les types
- Licences SPDX officielles uniquement
- Une version = un état du projet (ne pas mélanger branches/forks)
- Réutiliser les types existants plutôt que d'en créer de nouveaux
- Documenter l'icône du logiciel pour la reconnaissance visuelle---
