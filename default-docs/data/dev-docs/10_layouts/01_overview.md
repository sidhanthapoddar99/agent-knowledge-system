---
title: Layouts Overview
description: How layouts receive data, their props interfaces, and how to build custom layouts
---

# Layouts (Developer Reference)

This section covers the implementation side of layouts — what data each layout type receives from the route handler, component conventions, and how to build new layouts.

For choosing and configuring layouts in `site.yaml`, see the [User Guide → Layouts](/user-guide/layouts/overview).

## What's in This Section

| Section | Contents |
|---------|----------|
| [Docs Layout](./docs-layout/overview) | Props interface, sidebar loading, data interface, conventions |
| [Blog Layout](./blog-layout/overview) | Index vs post props, post card data, conventions |
| [Custom Layout](./custom-layout/overview) | YAML loading, flexible data schema, creating new layouts |

## Data Interface Pattern

The route handler passes different props to each layout type. See [Architecture → Data Loading](../05_architecture/03_data-loading.md) for the full flow.

| Layout | Pre-rendered content | Path passed | Loads internally |
|--------|---------------------|-------------|-----------------|
| Docs | Yes (`content`, `headings`) | Folder (`dataPath`) | Sidebar, settings |
| Blog index | No | Folder (`dataPath`) | All posts |
| Blog post | Yes (`content`) | — | Nothing |
| Custom | No | File (`dataPath`) | YAML data |
