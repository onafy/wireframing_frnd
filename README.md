# wireframing_frnd

Wireframe repository for frndOS pages. Monorepo structure — one command runs all wireframes.

## Stack

React + TypeScript + Tailwind CSS + Vite

## Quick Start

```bash
npm install
npm run dev
```

## Agentation

Agentation is enabled in development only.

```bash
npx agentation-mcp server
npx agentation-mcp doctor
```

When the local MCP server is healthy, open the app in dev mode and use the Agentation toolbar to annotate the UI.

## Wireframes

| Route  | Page            | Module | Status |
|--------|-----------------|--------|--------|
| `/home` | Home            | Core   | Done   |

## Structure

```
src/
├── pages/
│   ├── Dashboard.tsx    ← wireframe index
│   └── home/            ← home wireframe
│       └── HomePage.tsx
├── App.tsx              ← routing
└── main.tsx
```
