# wireframing_frnd

Wireframe repository for frndOS pages. Monorepo structure — one command runs all wireframes.

## Stack

React + TypeScript + Tailwind CSS + Vite

## Quick Start

```bash
npm install
npm run dev
```

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
