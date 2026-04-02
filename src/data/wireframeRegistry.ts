export type WireframeStatus = 'done' | 'pending'
export type WireframeModule = 'Core' | 'Studio'
export type WireframeIconKey = 'home' | 'layers'

export interface WireframeEntry {
  id: string
  title: string
  route: string
  module: WireframeModule
  description: string
  status: WireframeStatus
  owner: string
  icon: WireframeIconKey
  /** Repo-relative paths used for `git log` (page TSX plus optional PRD markdown). */
  sourcePaths: string[]
  prdPath?: string
}

export const wireframeRegistry: WireframeEntry[] = [
  {
    id: 'homepage',
    title: 'Home',
    route: '/homepage',
    module: 'Core',
    description: 'frndOS landing with signals, module discovery, recent work, and action bar demos.',
    status: 'done',
    owner: 'Rafly',
    icon: 'home',
    sourcePaths: ['src/pages/home/HomePage.tsx', 'docs/prds/home-experience.md'],
    prdPath: 'docs/prds/home-experience.md',
  },
  {
    id: 'studio',
    title: 'Home / frndOS Studio',
    route: '/studio',
    module: 'Studio',
    description: 'Tool grid, brand guardrails, readiness warning, and recent Studio project continuity.',
    status: 'done',
    owner: 'Budi',
    icon: 'layers',
    sourcePaths: ['src/pages/studio/StudioPage.tsx', 'docs/prds/frndos-studio-home.md'],
    prdPath: 'docs/prds/frndos-studio-home.md',
  },
]

export function getWireframeByRoute(pathname: string) {
  return wireframeRegistry.find((entry) => entry.route === pathname) ?? null
}
