---
title: 'Software Types'
description: 'Create and manage software categories in QSOS'
---

QSOS organizes software into **categories** to provide more relevant evaluation criteria. Each software type has specific evaluation grids tailored to its unique characteristics. This is **Phase 1** of the methodology.

---

## STEP 1: Create a Type

A **software type** groups comparable solutions. Example: "Web frameworks" = React, Angular, Vue.js.

To create a type:
- **Name**: display name (ex: `Web frameworks`)
- **Description**: context for the type
- **Icon**: optional

The **UID is auto-generated** from the name (ex: "Web frameworks" → `web_frameworks`)

<details>
<summary>View JSON</summary>

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

## STEP 2: Add a Software

You can create a new type or add your software to an existing type.

To add a software:
- **Name**: official name (ex: `React`)
- **Description**: brief description
- **License**: SPDX code (ex: `MIT`, `Apache-2.0`, `GPL-3.0`)
- **URL**: official site
- **Demo URL**: optional
- **Icon**: optional

The **UID is auto-generated** from the name (ex: "React" → `react`)

### Common SPDX Licenses

- `MIT` → React, Vue.js, Node.js
- `Apache-2.0` → Android, Kafka
- `GPL-3.0` → Linux
- `BSD-3-Clause` → Django, NumPy
- `ISC` → npm, Yarn
- `MPL-2.0` → Firefox

Example React:

<details>
<summary>View JSON</summary>

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

## STEP 3: Add a Version

To add a version:
- **Version**: number (ex: `19`, `18`, `3.4.0`)
- **Summary**: changes/features

Example React 19:

<details>
<summary>View JSON</summary>


```json
{
  "version": "19",
  "summary": "Introducing Actions and Server Components",
  "dateAdded": "2025-09-08T13:44:00.578Z"
}
```

</details>

---

## Best Practices

- Clear and descriptive names for types
- Official SPDX licenses only
- One version = one project state (don't mix branches/forks)
- Reuse existing types rather than creating new ones
- Document software icon for visual recognition