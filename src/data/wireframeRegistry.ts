export type WireframeStatus = 'done' | 'pending'
export type WireframeModule = 'Core' | 'Studio' | 'AskFRnD'
export type WireframeIconKey = 'home' | 'layers' | 'layers'

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
  {
    id: 'askfrnd',
    title: 'AskFRnD',
    route: '/askfrnd',
    module: 'AskFRnD',
    description: 'AI execution layer with Cmd+K entry, side panel, Point & Ask, context chips, and workspace toggle.',
    status: 'done',
    owner: 'Novi',
    icon: 'layers',
    sourcePaths: ['src/pages/Askfrnd/askfrnd2.tsx'],
    prdPath: undefined,
  },
  {
    id: 'brand-knowledge',
    title: 'Brand Knowledge',
    route: '/brand-knowledge',
    module: 'Core',
    description: 'Brand Knowledge',
    status: 'done',
    owner: 'Novi',
    icon: 'layers',
    sourcePaths: ['src/pages/brand-knowledge/brand-knowledge.tsx'],
    prdPath: undefined,
  },
  {
    id: 'brand-assets',
    title: 'Brand Assets',
    route: '/brand-assets',
    module: 'Core',
    description: 'Brand Assets',
    status: 'done',
    owner: 'Novi',
    icon: 'layers',
    sourcePaths: ['src/pages/brand-knowledge/brand-assets.tsx'],
    prdPath: undefined,
  },
  {
    id: 'talents',
    title: 'Talents',
    route: '/talents',
    module: 'Core',
    description: 'AI Talents — face-consistent reference library for brand ambassadors',
    status: 'done',
    owner: 'Novi',
    icon: 'layers',
    sourcePaths: ['src/pages/Brand Knowledge/Talents.tsx'],
    prdPath: 'output/brand-knowledge/talents-prd.md',
  },

]

export function getWireframeByRoute(pathname: string) {
  return wireframeRegistry.find((entry) => entry.route === pathname) ?? null
}
