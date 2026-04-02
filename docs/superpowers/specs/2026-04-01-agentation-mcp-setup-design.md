# Agentation MCP Setup Design

## Goal

Add Agentation to the wireframing app so UI feedback can be attached directly to live elements during local development, while keeping production and Vercel output unchanged.

## Scope

- Install `agentation` as a development dependency.
- Render the Agentation toolbar only in development.
- Point the toolbar to a local MCP endpoint on `http://localhost:4747`.
- Auto-configure the Agentation MCP server for compatible coding agents on this machine.
- Verify local build and MCP health.

## Design

### App integration

Agentation will be mounted near the app root so it can annotate every routed page. The integration will be guarded by Vite's development flag so the toolbar does not appear in production builds.

### MCP integration

The local machine will be configured using the official `add-mcp` command so supported agents can discover and run the Agentation MCP server automatically. The app component will target the default local server port.

### Safety

- No Agentation UI in production.
- No Vercel behavior change outside local development.
- Existing routes and page structure remain unchanged.

## Verification

- `npm run build` still passes.
- Agentation toolbar appears in local dev.
- `npx agentation-mcp doctor` reports a healthy setup.
