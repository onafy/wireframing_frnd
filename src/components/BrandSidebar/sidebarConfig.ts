import {
  Settings,
  Folder,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
  locked?: boolean;
  badge?: number;
  children?: NavItem[];
};

export type NavSection = {
  items: NavItem[];
};

export const BRAND_KNOWLEDGE_PARENT: NavItem = {
  id: 'knowledge',
  label: 'Brand Knowledge',
  icon: Folder,
  children: [
    { id: 'dna', label: 'Brand DNA', locked: true },
    { id: 'identity', label: 'Brand Identity', locked: true },
    { id: 'tonality', label: 'Brand Tonality', locked: true },
    { id: 'vault', label: 'Knowledge Vault' },
  ],
};

export const BRAND_KNOWLEDGE_PARENT_WITH_ASSETS: NavItem = {
  id: 'knowledge',
  label: 'Brand Knowledge',
  icon: Folder,
  children: [
    { id: 'assets', label: 'Brand Assets' },
    { id: 'talents', label: 'Talents' },
  ],
};

// Per-page sidebar configs
export const SIDEBAR_CONFIGS = {
  'brand-knowledge': {
    title: 'Brand Settings',
    sections: [
      {
        items: [
          { id: 'general', label: 'General', icon: Settings },
          BRAND_KNOWLEDGE_PARENT,
        ],
      },
    ],
  },
  'brand-assets': {
    title: 'Brand Settings',
    sections: [
      {
        items: [
          { id: 'general', label: 'General', icon: Settings },
          BRAND_KNOWLEDGE_PARENT_WITH_ASSETS,
        ],
      },
    ],
  },
  talents: {
    title: 'Brand Settings',
    sections: [
      {
        items: [
          { id: 'general', label: 'General', icon: Settings },
          { id: 'knowledge', label: 'Brand Knowledge', icon: Folder },
          { id: 'assets', label: 'Brand Assets' },
          { id: 'talents', label: 'Talents' },
        ],
      },
    ],
  },
} as const;
