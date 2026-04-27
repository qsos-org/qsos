---
title: 'Phase 1 : Définir'
description: "Établir le cadre d'évaluation"
---

## Objectif

Pour évaluer efficacement, il faut d'abord savoir quoi évaluer. Cette phase pose les fondations du processus : vous organisez vos logiciels par catégories, leur associez une licence et définissez les versions concernées.

Ce cadre assure la cohérence : tous les logiciels d'une même catégorie seront évalués selon les mêmes critères.

Dans cette phase, vous définissez :

- **Types de logiciels** : classification des logiciels par domaine fonctionnel
- **Logiciels** : les logiciels à évaluer, avec leurs licences et versions

## Types de logiciels

Un type de logiciel correspond à un domaine fonctionnel. Il regroupe des logiciels qui répondent à un même besoin.

Exemples :

- **BI** (Business Intelligence) : dashboards, visualisation, reporting
- **Frameworks Web** : développement frontend et backend
- **ETL** : intégration et transformation de données
- **Bases de données** : stockage relationnel ou NoSQL
- **CMS** : gestion de contenu et collaboration

## Logiciels

Au sein de chaque type, vous ajoutez les logiciels concernés.

Exemple : dans le type "Frameworks Web", vous pouvez ajouter Vue.js, React, Angular.

Chaque logiciel est associé à :

- **Une ou plusieurs licences** : provenant de la base SPDX, le standard international qui référence les licences libres et open source. Les licences peuvent être combinées avec les opérateurs `AND`, `OR`, `WITH`.
- **Une ou plusieurs versions** : les versions que vous souhaitez évaluer. Chaque version est évaluée séparément, ce qui permet de suivre l'évolution du logiciel dans le temps.

## Prochaine étape

Une fois vos types et logiciels définis, passez à la **[Phase 2 : Évaluer](/fr/methodology/02-evaluate)** pour définir les critères et commencer à noter.
