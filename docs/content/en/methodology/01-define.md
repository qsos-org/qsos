---
title: 'Phase 1: Define'
description: "Establish the evaluation framework"
---

## Purpose

To evaluate effectively, you must first know what to evaluate. This phase lays the foundation for the process: you organize your software by categories, assign licenses, and define the versions you wish to compare.

This framework ensures **consistency**: all software in the same category will be evaluated using the same criteria.

In this phase, you define:

- **Software types**: classification of software by functional domain
- **Software**: the software to evaluate, with their licenses and versions

## Software Types

A software type corresponds to a functional domain. It groups software that addresses the same need.

Examples:

- **BI** (Business Intelligence): dashboards, visualization, reporting
- **Web Frameworks**: frontend and backend development
- **ETL**: data integration and transformation
- **Databases**: relational or NoSQL storage
- **CMS**: content management and collaboration

## Software

Within each type, you add the relevant software.

Example: In the "Web Frameworks" type, you can add Vue.js, React, Angular.

Each software is associated with:

- **One or more licenses**: from the SPDX database, the international standard that references free and open source licenses. Licenses can be combined with the `AND`, `OR`, `WITH` operators.
- **One or more versions**: the versions you wish to evaluate. Each version is evaluated separately, allowing you to track software evolution over time.

## Next Step

Once your types and software are defined, move to **[Phase 2: Evaluate](/en/methodology/02-evaluate)** to define criteria and begin scoring.
