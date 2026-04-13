import { useState, useCallback } from 'react';
import {
  Settings,
  Folder,
  Search,
  Plus,
  X,
  Trash2,
  User,
  Users,
  Play,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Lock,
  Film,
  AlertCircle,
  Tag,
  Link2,
} from 'lucide-react';

// --- TYPES ---

type TalentRole = 'Brand Ambassador' | 'Actor' | 'Spokesperson' | 'Influencer' | 'Internal Talent' | 'Other';

type DAMPhoto = {
  id: string;
  url: string;
  title: string;
  shootDate: string;
};

type DAMVideo = {
  id: string;
  title: string;
  thumbnail: string;
  shootDate: string;
  duration: string;
};

type Talent = {
  id: string;
  name: string;
  role: TalentRole;
  profilePhoto: string;
  bio: string;
  tags: string[];
  damTag: string;
  damPhotos: DAMPhoto[];
  damVideos: DAMVideo[];
  createdAt: string;
};

// --- MOCK DATA ---

const MOCK_TALENTS: Talent[] = [
  {
    id: 't-1',
    name: 'Raffi Ahmad',
    role: 'Brand Ambassador',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400',
    bio: 'Brand ambassador since 2024, exclusive for youth segment campaigns. Known for energetic, approachable persona.',
    tags: ['youth', 'exclusive', 'lifestyle'],
    damTag: 'raffi-ahmad',
    damPhotos: [
      { id: 'dp-1', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=400', title: 'Youth Campaign — Front Facing', shootDate: '2026-02-15' },
      { id: 'dp-2', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400', title: 'Studio — Side Profile', shootDate: '2026-02-15' },
      { id: 'dp-3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400', title: 'Outdoor — Casual', shootDate: '2026-02-10' },
      { id: 'dp-4', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400', title: 'Studio — Three-Quarter', shootDate: '2026-02-10' },
    ],
    damVideos: [
      { id: 'dv-1', title: 'Telkomsel Youth Campaign — Hero TVC', thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=320&h=180', shootDate: '2026-02-15', duration: '0:30' },
      { id: 'dv-2', title: 'BTS Shoot — Studio Day 1', thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=320&h=180', shootDate: '2026-02-10', duration: '2:45' },
    ],
    createdAt: '2026-03-01',
  },
  {
    id: 't-2',
    name: 'Maudy Ayunda',
    role: 'Brand Ambassador',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400&h=400',
    bio: "Education and empowerment segment ambassador. Represents the brand's premium-accessible positioning.",
    tags: ['education', 'premium', 'empowerment'],
    damTag: 'maudy-ayunda',
    damPhotos: [
      { id: 'dp-5', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400&h=400', title: 'Education Campaign — Smiling', shootDate: '2026-01-20' },
      { id: 'dp-6', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400', title: 'Studio — Formal', shootDate: '2026-01-20' },
      { id: 'dp-7', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=400', title: 'Outdoor — Casual', shootDate: '2026-01-15' },
    ],
    damVideos: [
      { id: 'dv-3', title: 'Telkomsel Edu — "Your Future" Campaign', thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=320&h=180', shootDate: '2026-01-20', duration: '0:45' },
    ],
    createdAt: '2026-03-05',
  },
  {
    id: 't-3',
    name: 'Nicholas Saputra',
    role: 'Actor',
    profilePhoto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400&h=400',
    bio: 'Featured in the Q2 lifestyle campaign. Selective brand work — prefers understated, cinematic aesthetics.',
    tags: ['cinematic', 'lifestyle', 'premium'],
    damTag: 'nicholas-saputra',
    damPhotos: [
      { id: 'dp-8', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400&h=400', title: 'Lifestyle Campaign — Natural', shootDate: '2026-03-10' },
      { id: 'dp-9', url: 'https://images.unsplash.com/photo-1488161628813-04466f0016e4?auto=format&fit=crop&q=80&w=400&h=400', title: 'Studio — Three-Quarter', shootDate: '2026-03-10' },
    ],
    damVideos: [],
    createdAt: '2026-03-10',
  },
  {
    id: 't-4',
    name: 'Anya Geraldine',
    role: 'Influencer',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400',
    bio: 'Social-first talent for Instagram and TikTok activations. Strong Gen Z reach.',
    tags: ['social', 'genz', 'tiktok', 'instagram'],
    damTag: 'anya-geraldine',
    damPhotos: [
      { id: 'dp-10', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400&h=400', title: 'Social — Lifestyle Shot', shootDate: '2026-03-01' },
    ],
    damVideos: [
      { id: 'dv-4', title: 'TikTok Collab — #StyleYourWay', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=320&h=180', shootDate: '2026-03-01', duration: '0:15' },
      { id: 'dv-5', title: 'IG Reels — Product Unboxing', thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=320&h=180', shootDate: '2026-03-05', duration: '0:30' },
      { id: 'dv-6', title: 'BTS — Social Content Day', thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=320&h=180', shootDate: '2026-02-28', duration: '1:12' },
    ],
    createdAt: '2026-03-12',
  },
  {
    id: 't-5',
    name: 'Dian Sastrowardoyo',
    role: 'Spokesperson',
    profilePhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400',
    bio: 'Corporate spokesperson for press events and investor relations content. Represents brand maturity and authority.',
    tags: ['corporate', 'press', 'authority'],
    damTag: 'dian-sastro',
    damPhotos: [
      { id: 'dp-11', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400', title: 'Press Conference — Formal', shootDate: '2026-01-15' },
      { id: 'dp-12', url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=400&h=400', title: 'Natural Light — Smiling', shootDate: '2026-01-15' },
      { id: 'dp-13', url: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&q=80&w=400&h=400', title: 'Studio — Side Profile', shootDate: '2026-01-10' },
      { id: 'dp-14', url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=400&h=400', title: 'Outdoor — Casual', shootDate: '2026-01-10' },
      { id: 'dp-15', url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400&h=400', title: 'Natural Light — Neutral', shootDate: '2026-01-05' },
    ],
    damVideos: [
      { id: 'dv-7', title: 'Press Conference — Q1 Launch', thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=320&h=180', shootDate: '2026-01-15', duration: '12:30' },
    ],
    createdAt: '2026-02-20',
  },
];

const ROLE_OPTIONS: TalentRole[] = ['Brand Ambassador', 'Actor', 'Spokesperson', 'Influencer', 'Internal Talent', 'Other'];

const ROLE_COLORS: Record<TalentRole, string> = {
  'Brand Ambassador': 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  'Actor': 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  'Spokesperson': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  'Influencer': 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  'Internal Talent': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'Other': 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20',
};

const TAG_SUGGESTIONS = ['youth', 'premium', 'lifestyle', 'corporate', 'social', 'genz', 'cinematic', 'education', 'exclusive', 'tiktok', 'instagram', 'press', 'music', 'sports'];

// --- COMPONENT ---

export default function App() {
  // Sidebar state
  const [activeMenu, setActiveMenu] = useState('talents');
  const [knowledgeExpanded, setKnowledgeExpanded] = useState(true);

  // Talents list state
  const [talents, setTalents] = useState<Talent[]>(MOCK_TALENTS);
  const [talentView, setTalentView] = useState<'list' | 'editor'>('list');
  const [editingTalent, setEditingTalent] = useState<Talent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<TalentRole | 'All'>('All');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Editor state
  const [editorName, setEditorName] = useState('');
  const [editorRole, setEditorRole] = useState<TalentRole>('Brand Ambassador');
  const [editorBio, setEditorBio] = useState('');
  const [editorTags, setEditorTags] = useState<string[]>([]);
  const [editorTagInput, setEditorTagInput] = useState('');
  const [editorProfilePhoto, setEditorProfilePhoto] = useState('');
  const [editorDamTag, setEditorDamTag] = useState('');
  const [editorDamPhotos, setEditorDamPhotos] = useState<DAMPhoto[]>([]);
  const [editorDamVideos, setEditorDamVideos] = useState<DAMVideo[]>([]);
  const [showEditorRoleDropdown, setShowEditorRoleDropdown] = useState(false);
  const [damStatus] = useState<'loading' | 'loaded' | 'error'>('loaded');

  // --- HANDLERS ---

  const openEditor = useCallback((talent?: Talent) => {
    if (talent) {
      setEditingTalent(talent);
      setEditorName(talent.name);
      setEditorRole(talent.role);
      setEditorBio(talent.bio);
      setEditorTags([...talent.tags]);
      setEditorProfilePhoto(talent.profilePhoto);
      setEditorDamTag(talent.damTag);
      setEditorDamPhotos([...talent.damPhotos]);
      setEditorDamVideos([...talent.damVideos]);
    } else {
      setEditingTalent(null);
      setEditorName('');
      setEditorRole('Brand Ambassador');
      setEditorBio('');
      setEditorTags([]);
      setEditorProfilePhoto('');
      setEditorDamTag('');
      setEditorDamPhotos([]);
      setEditorDamVideos([]);
    }
    setTalentView('editor');
  }, []);

  const closeEditor = useCallback(() => {
    setTalentView('list');
    setEditingTalent(null);
  }, []);

  const saveTalent = useCallback(() => {
    if (!editorName.trim()) return;
    const talentData: Talent = {
      id: editingTalent?.id || `t-${Date.now()}`,
      name: editorName.trim(),
      role: editorRole,
      profilePhoto: editorProfilePhoto || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=400&h=400',
      bio: editorBio,
      tags: editorTags,
      damTag: editorDamTag.trim(),
      damPhotos: editorDamPhotos,
      damVideos: editorDamVideos,
      createdAt: editingTalent?.createdAt || new Date().toISOString().split('T')[0],
    };
    if (editingTalent) {
      setTalents(prev => prev.map(t => t.id === editingTalent.id ? talentData : t));
    } else {
      setTalents(prev => [...prev, talentData]);
    }
    closeEditor();
  }, [editingTalent, editorName, editorRole, editorBio, editorTags, editorProfilePhoto, editorDamTag, editorDamPhotos, editorDamVideos, closeEditor]);

  const deleteTalent = useCallback((id: string) => {
    setTalents(prev => prev.filter(t => t.id !== id));
    setShowDeleteConfirm(null);
  }, []);

  const addTag = useCallback(() => {
    const tag = editorTagInput.trim().toLowerCase();
    if (tag && !editorTags.includes(tag)) {
      setEditorTags(prev => [...prev, tag]);
    }
    setEditorTagInput('');
  }, [editorTagInput, editorTags]);

  const removeTag = useCallback((tag: string) => {
    setEditorTags(prev => prev.filter(t => t !== tag));
  }, []);

  // Filter talents
  const filteredTalents = talents.filter(t => {
    const matchesSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'All' || t.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const isEmptyState = talents.length === 0;

  // --- RENDER ---

  return (
    <div className="h-screen bg-black text-neutral-300 font-sans overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">

      {/* DELETE CONFIRMATION DIALOG */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-medium text-white mb-2">Delete talent</h3>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              This will permanently remove the talent profile. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-1.5 rounded-full text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteTalent(showDeleteConfirm);
                  closeEditor();
                }}
                className="px-4 py-1.5 rounded-full bg-red-900/30 border border-red-800/30 text-sm text-red-400 hover:bg-red-900/50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONTAINER */}
      <div className="w-full max-w-6xl h-[85vh] bg-black border border-neutral-800/80 rounded-xl shadow-2xl flex overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">

        {/* CLOSE BUTTON */}
        <button className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors z-10">
          <X size={20} />
        </button>

        {/* SIDEBAR */}
        <div className="w-64 border-r border-neutral-800/40 flex flex-col p-4 shrink-0">
          <h2 className="text-white text-lg font-medium mb-6 px-2 mt-2">Brand Settings</h2>

          <div className="space-y-1">
            <button
              onClick={() => setActiveMenu('general')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-light transition-colors ${activeMenu === 'general' ? 'bg-neutral-900/50 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900/30'}`}
            >
              <Settings size={16} /> General
            </button>

            {/* BRAND KNOWLEDGE PARENT */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setActiveMenu('knowledge');
                  setKnowledgeExpanded(!knowledgeExpanded);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-light transition-colors ${activeMenu === 'knowledge' ? 'bg-neutral-900/50 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900/30'}`}
              >
                <div className="flex items-center gap-3">
                  <Folder size={16} /> Brand Knowledge
                </div>
                {knowledgeExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {knowledgeExpanded && (
                <div className="ml-5 mt-1 border-l border-neutral-800/50 flex flex-col pl-2 space-y-1">
                  {[
                    { id: 'dna', label: 'Brand DNA', locked: false },
                    { id: 'identity', label: 'Brand Identity', locked: false },
                    { id: 'tonality', label: 'Brand Tonality', locked: false },
                    { id: 'assets', label: 'Brand Assets', locked: false },
                    { id: 'talents', label: 'Talents', locked: false },
                  ].map((pillar) => (
                    <button
                      key={pillar.id}
                      onClick={() => setActiveMenu(pillar.id)}
                      className={`text-left px-3 py-1.5 rounded-md text-sm font-light transition-colors flex items-center justify-between ${activeMenu === pillar.id ? 'bg-neutral-900/50 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                      <span>{pillar.label}</span>
                      {pillar.locked && <Lock size={10} className="text-neutral-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR FOOTER */}
          <div className="mt-auto pt-4 border-t border-neutral-800/30">
            <span className="text-[10px] text-neutral-700 font-mono tracking-widest px-2">frndOS v4.2</span>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 bg-black flex flex-col relative overflow-hidden">

          {/* HEADER ROW */}
          {!(activeMenu === 'talents' && talentView === 'editor') && (
            <div className="px-8 pt-8 pb-4 border-b border-neutral-800/50 shrink-0 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-light tracking-tight text-white">
                  {activeMenu === 'knowledge' && 'Brand Knowledge'}
                  {activeMenu === 'dna' && 'Brand DNA'}
                  {activeMenu === 'general' && 'General'}
                  {activeMenu === 'identity' && 'Brand Identity'}
                  {activeMenu === 'tonality' && 'Brand Tonality'}
                  {activeMenu === 'assets' && 'Brand Assets'}
                  {activeMenu === 'talents' && 'Talents'}
                </h1>
                <p className="text-xs text-neutral-500 mt-1 font-light">
                  {activeMenu === 'knowledge' && 'Unified Intelligence Ingestion'}
                  {activeMenu === 'dna' && 'Core mission, audience, and market positioning'}
                  {activeMenu === 'identity' && 'Visual guardrails, color palettes, and typography rules'}
                  {activeMenu === 'tonality' && 'Brand voice, archetypes, and linguistic boundaries'}
                  {activeMenu === 'general' && 'Brand name, workspace, and configuration'}
                  {activeMenu === 'assets' && 'Centralized library of visual files and metadata'}
                  {activeMenu === 'talents' && 'Manage brand ambassadors and link their DAM assets'}
                </p>
              </div>
              {activeMenu === 'talents' && !isEmptyState && (
                <button
                  onClick={() => openEditor()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
                >
                  <Plus size={14} />
                  Add new talent
                </button>
              )}
            </div>
          )}

          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto">

            {/* ===== PLACEHOLDER FOR OTHER MENUS ===== */}
            {activeMenu !== 'talents' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-900/40 border border-neutral-800/40 flex items-center justify-center mx-auto mb-4">
                    <Settings size={20} className="text-neutral-600" />
                  </div>
                  <p className="text-sm text-neutral-500">
                    {activeMenu === 'general' && 'General settings'}
                    {activeMenu === 'knowledge' && 'Brand Knowledge ingestion'}
                    {activeMenu === 'dna' && 'Brand DNA configuration'}
                    {activeMenu === 'identity' && 'Brand Identity configuration'}
                    {activeMenu === 'tonality' && 'Brand Tonality configuration'}
                    {activeMenu === 'assets' && 'Brand Assets library'}
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">Navigate to Talents to view the wireframe</p>
                </div>
              </div>
            )}

            {/* ===== TALENTS: EMPTY STATE ===== */}
            {activeMenu === 'talents' && isEmptyState && talentView === 'list' && (
              <div className="flex items-center justify-center h-full p-8">
                <div className="max-w-lg w-full text-center animate-in fade-in duration-500">
                  <div className="w-16 h-16 rounded-full bg-neutral-900/60 border border-neutral-800/60 flex items-center justify-center mx-auto mb-8">
                    <Users size={24} className="text-neutral-500" />
                  </div>
                  <h2 className="text-xl font-light text-white mb-3">No talents yet</h2>
                  <p className="text-sm text-neutral-500 leading-relaxed mb-10 max-w-sm mx-auto">
                    Create profiles for your brand ambassadors, actors, and spokespersons. Link each talent to their DAM tag to surface existing shoot assets automatically.
                  </p>
                  <button
                    onClick={() => openEditor()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
                  >
                    <Plus size={16} />
                    Add new talent
                  </button>

                  {/* Preview hint */}
                  <div className="mt-16 rounded-xl border border-dashed border-neutral-800/40 p-6 max-w-xs mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-800/60" />
                      <div className="flex-1 text-left">
                        <div className="h-3 w-24 bg-neutral-800/40 rounded mb-1.5" />
                        <div className="h-2 w-16 bg-neutral-800/30 rounded" />
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded bg-neutral-800/30" />
                      ))}
                      <div className="w-8 h-8 rounded bg-neutral-800/20 flex items-center justify-center">
                        <span className="text-[9px] text-neutral-600">+4</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== TALENTS: POPULATED LIST ===== */}
            {activeMenu === 'talents' && !isEmptyState && talentView === 'list' && (
              <div className="p-8 animate-in fade-in duration-300">
                {/* Search & Filter bar */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search by name or tag..."
                      className="w-full bg-neutral-900/40 border border-neutral-800/50 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700/60 transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-900/40 border border-neutral-800/50 text-sm text-neutral-400 hover:text-white hover:border-neutral-700/60 transition-colors"
                    >
                      {roleFilter === 'All' ? 'All roles' : roleFilter}
                      <ChevronDown size={12} />
                    </button>
                    {showRoleDropdown && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-neutral-900 border border-neutral-800/60 rounded-lg shadow-2xl z-20 py-1 animate-in fade-in zoom-in-95 duration-150">
                        <button
                          onClick={() => { setRoleFilter('All'); setShowRoleDropdown(false); }}
                          className={`w-full px-3 py-2 text-left text-sm transition-colors ${roleFilter === 'All' ? 'text-white bg-neutral-800/50' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/30'}`}
                        >
                          All roles
                        </button>
                        {ROLE_OPTIONS.map(role => (
                          <button
                            key={role}
                            onClick={() => { setRoleFilter(role); setShowRoleDropdown(false); }}
                            className={`w-full px-3 py-2 text-left text-sm transition-colors ${roleFilter === role ? 'text-white bg-neutral-800/50' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/30'}`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Talent grid */}
                {filteredTalents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                    <Search size={20} className="mb-3 text-neutral-600" />
                    <p className="text-sm">No talents match your search</p>
                  </div>
                ) : (
                  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                    {filteredTalents.map(talent => (
                      <button
                        key={talent.id}
                        onClick={() => openEditor(talent)}
                        className="group text-left rounded-xl border border-neutral-800/50 bg-neutral-900/20 p-5 hover:border-neutral-700/50 hover:bg-neutral-900/40 transition-all"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <img
                            src={talent.profilePhoto}
                            alt={talent.name}
                            className="w-12 h-12 rounded-full object-cover bg-neutral-800 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-white truncate">{talent.name}</h3>
                            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border mt-1.5 font-mono tracking-wider uppercase ${ROLE_COLORS[talent.role]}`}>
                              {talent.role}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] mb-3">
                          {talent.damTag ? (
                            <span className="flex items-center gap-1.5 text-emerald-500/70 font-mono truncate max-w-[120px]">
                              <Tag size={10} className="flex-shrink-0" />
                              {talent.damTag}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-neutral-600">
                              <Tag size={10} />
                              No DAM tag
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 text-neutral-500">
                            <Film size={11} />
                            {talent.damVideos.length} video{talent.damVideos.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {talent.damPhotos.length > 0 && (
                          <div className="flex gap-1.5">
                            {talent.damPhotos.slice(0, 4).map(photo => (
                              <img key={photo.id} src={photo.url} alt="" className="w-9 h-9 rounded object-cover bg-neutral-800" />
                            ))}
                            {talent.damPhotos.length > 4 && (
                              <div className="w-9 h-9 rounded bg-neutral-800/40 flex items-center justify-center text-[10px] text-neutral-500">
                                +{talent.damPhotos.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                        {talent.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {talent.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[9px] text-neutral-500 bg-neutral-800/30 px-1.5 py-0.5 rounded font-mono tracking-wider">
                                {tag}
                              </span>
                            ))}
                            {talent.tags.length > 3 && (
                              <span className="text-[9px] text-neutral-600">+{talent.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== TALENTS: EDITOR ===== */}
            {activeMenu === 'talents' && talentView === 'editor' && (
              <div className="flex flex-col h-full animate-in fade-in duration-300">
                {/* Editor header */}
                <div className="px-8 pt-6 pb-4 flex items-center justify-between border-b border-neutral-800/40 shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={closeEditor}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800/40 transition-colors"
                    >
                      <X size={16} />
                    </button>
                    <h2 className="text-lg font-light text-white">
                      {editingTalent ? editingTalent.name : 'New talent'}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingTalent && (
                      <button
                        onClick={() => setShowDeleteConfirm(editingTalent.id)}
                        className="px-3 py-1.5 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-900/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <button
                      onClick={closeEditor}
                      className="px-4 py-1.5 rounded-full text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveTalent}
                      disabled={!editorName.trim()}
                      className="px-5 py-1.5 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {editingTalent ? 'Save' : 'Create talent'}
                    </button>
                  </div>
                </div>

                {/* Editor body — two columns */}
                <div className="flex-1 overflow-y-auto">
                  <div className="flex gap-0 min-h-full">

                    {/* LEFT: Identity panel */}
                    <div className="w-[340px] flex-shrink-0 border-r border-neutral-800/30 p-8">
                      <h3 className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 mb-6">Identity</h3>

                      {/* Profile photo */}
                      <div className="mb-6">
                        <div className="flex items-center gap-4">
                          {editorProfilePhoto ? (
                            <img src={editorProfilePhoto} alt="" className="w-20 h-20 rounded-full object-cover bg-neutral-800" />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-neutral-900/60 border border-dashed border-neutral-700/40 flex items-center justify-center">
                              <User size={24} className="text-neutral-600" />
                            </div>
                          )}
                          <div>
                            <button
                              onClick={() => setEditorProfilePhoto('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400')}
                              className="text-xs text-neutral-400 hover:text-white transition-colors"
                            >
                              Upload photo
                            </button>
                            {editorProfilePhoto && (
                              <button
                                onClick={() => setEditorProfilePhoto('')}
                                className="block text-xs text-neutral-600 hover:text-red-400 transition-colors mt-1"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Name */}
                      <div className="mb-5">
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-600 mb-2">Name</label>
                        <input
                          type="text"
                          value={editorName}
                          onChange={e => setEditorName(e.target.value)}
                          placeholder="e.g. Raffi Ahmad"
                          className="w-full bg-transparent border-b border-neutral-800/60 pb-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-neutral-600 transition-colors"
                        />
                      </div>

                      {/* Role */}
                      <div className="mb-5 relative">
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-600 mb-2">Role</label>
                        <button
                          onClick={() => setShowEditorRoleDropdown(!showEditorRoleDropdown)}
                          className="w-full flex items-center justify-between border-b border-neutral-800/60 pb-2 text-sm text-white hover:border-neutral-600 transition-colors"
                        >
                          <span>{editorRole}</span>
                          <ChevronDown size={12} className="text-neutral-500" />
                        </button>
                        {showEditorRoleDropdown && (
                          <div className="absolute left-0 top-full mt-1 w-full bg-neutral-900 border border-neutral-800/60 rounded-lg shadow-2xl z-20 py-1 animate-in fade-in zoom-in-95 duration-150">
                            {ROLE_OPTIONS.map(role => (
                              <button
                                key={role}
                                onClick={() => { setEditorRole(role); setShowEditorRoleDropdown(false); }}
                                className={`w-full px-3 py-2 text-left text-sm transition-colors ${editorRole === role ? 'text-white bg-neutral-800/50' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/30'}`}
                              >
                                {role}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bio */}
                      <div className="mb-5">
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-600 mb-2">Bio / Notes</label>
                        <textarea
                          value={editorBio}
                          onChange={e => setEditorBio(e.target.value)}
                          placeholder="Context about this talent's relationship with the brand..."
                          rows={3}
                          className="w-full bg-transparent border border-neutral-800/40 rounded-lg p-3 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-neutral-700/60 transition-colors resize-none"
                        />
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-600 mb-2">Tags</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {editorTags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 text-[10px] text-neutral-300 bg-neutral-800/50 border border-neutral-700/30 px-2 py-0.5 rounded-full font-mono tracking-wider"
                            >
                              {tag}
                              <button onClick={() => removeTag(tag)} className="text-neutral-600 hover:text-red-400 transition-colors">
                                <X size={8} />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editorTagInput}
                            onChange={e => setEditorTagInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addTag()}
                            placeholder="Add tag..."
                            className="flex-1 bg-transparent border-b border-neutral-800/40 pb-1.5 text-xs text-white placeholder:text-neutral-700 focus:outline-none focus:border-neutral-600 transition-colors"
                          />
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {TAG_SUGGESTIONS.filter(s => !editorTags.includes(s)).slice(0, 6).map(suggestion => (
                            <button
                              key={suggestion}
                              onClick={() => setEditorTags(prev => [...prev, suggestion])}
                              className="text-[9px] text-neutral-600 hover:text-neutral-400 bg-neutral-900/30 px-1.5 py-0.5 rounded font-mono tracking-wider transition-colors"
                            >
                              +{suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: DAM Connection + Asset Preview */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

                      {/* ---- DAM TAG CONNECTION ---- */}
                      <div className="p-8 border-b border-neutral-800/30">
                        <h3 className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 mb-5">DAM Connection</h3>

                        <div>
                          <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-600 mb-2">DAM Tag</label>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                              <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                              <input
                                type="text"
                                value={editorDamTag}
                                onChange={e => setEditorDamTag(e.target.value)}
                                placeholder="e.g. raffi-ahmad"
                                className="w-full bg-neutral-900/40 border border-neutral-800/50 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700/60 transition-colors font-mono"
                              />
                            </div>
                            {editorDamTag.trim() ? (
                              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono tracking-wider whitespace-nowrap">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Linked
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 font-mono tracking-wider whitespace-nowrap">
                                <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                                Not linked
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-600 mt-2 leading-relaxed">
                            Enter the tag assigned to this talent in the DAM. Photos and videos tagged with this label will appear below as a read-only preview.
                          </p>
                        </div>
                      </div>

                      {/* ---- RELATED ASSETS ---- */}
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-[10px] font-mono tracking-widest uppercase text-neutral-500">
                            Related Assets
                            {(editorDamPhotos.length + editorDamVideos.length) > 0 && (
                              <span className="text-neutral-600 ml-2">{editorDamPhotos.length + editorDamVideos.length}</span>
                            )}
                          </h3>
                          <span className="text-[9px] text-neutral-600 font-mono tracking-wider">READ-ONLY</span>
                        </div>

                        {!editorDamTag.trim() ? (
                          <div className="rounded-xl border border-dashed border-neutral-800/40 p-8 text-center">
                            <Link2 size={16} className="text-neutral-700 mx-auto mb-3" />
                            <p className="text-xs text-neutral-600">Link a DAM tag above to preview assets</p>
                          </div>
                        ) : damStatus === 'error' ? (
                          <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-900/30 border border-neutral-800/30 rounded-lg p-3">
                            <AlertCircle size={12} className="text-amber-500/50 flex-shrink-0" />
                            DAM integration temporarily unavailable — linked assets will refresh later.
                          </div>
                        ) : (editorDamPhotos.length === 0 && editorDamVideos.length === 0) ? (
                          <p className="text-xs text-neutral-600 py-4 text-center">
                            No assets found in DAM for tag "{editorDamTag}"
                          </p>
                        ) : (
                          <div className="space-y-6">
                            {/* Photos */}
                            {editorDamPhotos.length > 0 && (
                              <div>
                                <p className="text-[9px] font-mono tracking-widest uppercase text-neutral-600 mb-3">
                                  Photos <span className="text-neutral-700 ml-1">{editorDamPhotos.length}</span>
                                </p>
                                <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
                                  {editorDamPhotos.map(photo => (
                                    <div key={photo.id} className="group relative rounded-lg overflow-hidden bg-neutral-900 aspect-square">
                                      <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                        <p className="text-[8px] text-neutral-300 leading-tight line-clamp-2">{photo.title}</p>
                                        <p className="text-[8px] text-neutral-500 mt-0.5">{photo.shootDate}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Videos */}
                            {editorDamVideos.length > 0 && (
                              <div>
                                <p className="text-[9px] font-mono tracking-widest uppercase text-neutral-600 mb-3">
                                  Videos <span className="text-neutral-700 ml-1">{editorDamVideos.length}</span>
                                </p>
                                <div className="space-y-2">
                                  {editorDamVideos.map(video => (
                                    <div
                                      key={video.id}
                                      className="flex items-center gap-3 rounded-lg bg-neutral-900/20 border border-neutral-800/30 p-3 hover:border-neutral-700/40 transition-colors"
                                    >
                                      <div className="w-24 h-14 rounded bg-neutral-800 overflow-hidden flex-shrink-0 relative">
                                        <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                                            <Play size={10} className="text-white ml-0.5" />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white truncate">{video.title}</p>
                                        <div className="flex items-center gap-3 mt-1 text-[10px] text-neutral-500">
                                          <span>{video.shootDate}</span>
                                          <span>{video.duration}</span>
                                        </div>
                                      </div>
                                      <button className="p-1.5 text-neutral-600 hover:text-neutral-400 transition-colors flex-shrink-0">
                                        <ExternalLink size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
