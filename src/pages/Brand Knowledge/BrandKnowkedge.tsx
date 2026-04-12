import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Settings,
  Folder,
  Upload,
  X,
  Lock,
  Unlock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Wand2,
  ChevronDown,
  ChevronRight,
  Trash2,
  MessageSquare,
  RefreshCw,
  User,
  GitMerge,
  Search,
  Star,
  Edit3,
  ArrowRight,
  Link,
  AlertTriangle,
  Clock,
  XCircle,
  CornerDownRight,
  StickyNote,
  Sparkles,
  Globe,
  FileUp,
} from 'lucide-react';

type VaultChunk = {
  id: string;
  text: string;
  label: string;
  mapped: boolean;
  pillar: string | null;
  field: string | null;
  pinned: boolean;
  source: string;
  page: number | null;
  confidence: number;
};

// --- MOCK DATA ---
const MOCK_EXTRACTION = {
  dna: {
    mission: "To democratize high-end fashion for the urban professional, providing premium aesthetics without the prohibitive markup.",
    vision: "",
    target: "Urban professionals, 25-40, SES A/B, value-conscious but design-driven.",
    competitors: "Direct: Everlane, COS. Indirect: Zara, H&M.",
    positioning: "Premium basics with architectural silhouettes at accessible price points."
  },
  identity: {
    colors: [
      { id: 1, label: 'Primary Color', hex: '#000000' },
      { id: 2, label: 'Secondary Color', hex: '#FFFFFF' },
      { id: 3, label: 'Accent Color', hex: '#E32645' }
    ],
    typography: [
      { id: 1, hierarchy: 'Heading 1', font: 'Poppins / Bold', size: '64' },
      { id: 2, hierarchy: 'Heading 2', font: 'Poppins / Semibold', size: '48' },
      { id: 3, hierarchy: 'Body Text', font: 'Poppins / Regular', size: '16' }
    ],
    dos: [
      "Always ensure sufficient contrast between text and background.",
      "Use architectural, clean lines in graphic elements."
    ],
    donts: [
      "Never put the logo on a dark background without the white bounding box.",
      "Never use the color red as a primary background."
    ]
  },
  tonality: {
    archetype: "The Creator",
    target: "Urban professionals, 25-40, SES A/B",
    phrases: "Bold, Architectural, Effortless, Sharp",
    forbidden: "Cheap, Bargain, Basic, Standard",
    voiceTone: "Confident, Direct, Understated",
    toneDescriptors: "Minimalist, Punchy, Aspirational"
  }
};

const MOCK_VAULT_CHUNKS: VaultChunk[] = [
  { id: 'vc-1', text: "The brand mascot 'Archie' should only appear in lifestyle contexts — never in formal corporate collateral. Archie's posture must always convey confidence (standing tall, arms uncrossed).", label: 'Mascot Rule', mapped: false, pillar: null, field: null, pinned: true, source: 'Q2_Brand_Book_Final.pdf', page: 12, confidence: 0.92 },
  { id: 'vc-2', text: "All campaign imagery must feature real people, not stock photography. Preference for candid shots over posed studio photos. Diversity in age, ethnicity, and body type is mandatory.", label: 'Campaign Heritage', mapped: false, pillar: null, field: null, pinned: false, source: 'Q2_Brand_Book_Final.pdf', page: 18, confidence: 0.88 },
  { id: 'vc-3', text: "Legal disclaimer: The brand name must always include the trademark symbol (TM) on first mention in any printed material. Digital use exempted unless in formal documents.", label: 'Legal Restriction', mapped: false, pillar: null, field: null, pinned: false, source: 'Q2_Brand_Book_Final.pdf', page: 34, confidence: 0.95 },
  { id: 'vc-4', text: "When addressing Gen Z audiences on TikTok and Instagram Reels, adopt a more casual, meme-aware tone. Avoid corporate jargon. Use sentence fragments and rhetorical questions to drive engagement.", label: 'Tone Example', mapped: false, pillar: null, field: null, pinned: false, source: 'Q2_Brand_Book_Final.pdf', page: 22, confidence: 0.85 },
  { id: 'vc-5', text: "Premium basics with architectural silhouettes at accessible price points.", label: 'Positioning', mapped: true, pillar: 'Brand DNA', field: 'Positioning', pinned: false, source: 'Q2_Brand_Book_Final.pdf', page: 5, confidence: 0.97 },
  { id: 'vc-6', text: "The 2024 Holiday Campaign 'Midnight Architecture' achieved 340% ROAS with a 12% engagement rate. Key learning: pairing minimalist product shots with bold typography outperformed lifestyle imagery by 2.3x.", label: 'Campaign Heritage', mapped: false, pillar: null, field: null, pinned: false, source: 'Q2_Brand_Book_Final.pdf', page: 28, confidence: 0.82 },
  { id: 'vc-7', text: "Humor is acceptable in social media copy but must never be self-deprecating or sarcastic. Wit is preferred over slapstick. The brand laughs with the audience, never at them.", label: 'Tone Example', mapped: false, pillar: null, field: null, pinned: false, source: 'Q2_Brand_Book_Final.pdf', page: 23, confidence: 0.91 },
  { id: 'vc-8', text: "For Southeast Asian markets, use warm and communal language. Replace 'individual style' with 'personal expression within community'. Avoid Western individualism framing.", label: 'Regional Guidance', mapped: false, pillar: null, field: null, pinned: false, source: 'Q2_Brand_Book_Final.pdf', page: 31, confidence: 0.79 },
  { id: 'vc-9', text: "Logo clearspace: minimum 1.5x the height of the logomark on all sides. On dark backgrounds, use the inverted (white) variant only.", label: 'Visual Identity', mapped: true, pillar: 'Brand Identity', field: "Visual Do's", pinned: false, source: 'Q2_Brand_Book_Final.pdf', page: 8, confidence: 0.96 },
  { id: 'vc-10', text: "Customer service tone: empathetic, solution-oriented, never defensive. Acknowledge the issue first, then provide resolution. Use the customer's first name.", label: 'Tone Example', mapped: false, pillar: null, field: null, pinned: false, source: 'Q2_Brand_Book_Final.pdf', page: 25, confidence: 0.87 },
  { id: 'vc-11', text: "Product naming convention: [Adjective] + [Material/Form]. Examples: 'Sharp Wool Blazer', 'Effortless Linen Shirt'. Never use generic names like 'Classic Tee' or 'Basic Pant'.", label: 'Naming Convention', mapped: false, pillar: null, field: null, pinned: false, source: 'Q2_Brand_Book_Final.pdf', page: 15, confidence: 0.93 },
  { id: 'vc-12', text: "Brand partnerships: only collaborate with brands that share our design-first philosophy. Avoid mass-market or discount-positioned partners. Co-branded items must meet our quality bar.", label: 'Partnership Rule', mapped: false, pillar: null, field: null, pinned: false, source: 'Q2_Brand_Book_Final.pdf', page: 36, confidence: 0.84 },
  { id: 'vc-13', text: "Email subject lines: max 6 words. No exclamation marks. Sentence case only. Emojis permitted only for seasonal campaigns (max 1 emoji per subject).", label: 'Tone Example', mapped: false, pillar: null, field: null, pinned: false, source: 'Q2_Brand_Book_Final.pdf', page: 26, confidence: 0.90 },
  { id: 'vc-14', text: "Notes from client call (2026-03-15): Client wants to explore a younger sub-brand targeting 18-24 in Q3. Keep this in mind for future tonality splits.", label: 'Manual Note', mapped: false, pillar: null, field: null, pinned: true, source: 'Manual entry', page: null, confidence: 1.0 },
];

// Archetypes grouped into quadrants for the bubble map
// Based on Margaret Mark & Carol S. Pearson's model
const ARCHETYPE_QUADRANTS = [
  {
    label: 'Freedom',
    sublabel: 'Yearn to explore',
    color: 'text-sky-400',
    border: 'border-sky-400/20',
    bg: 'bg-sky-400/5',
    selectedBg: 'bg-sky-400/20 border-sky-400/50',
    archetypes: ['The Innocent', 'The Explorer', 'The Sage'],
  },
  {
    label: 'Ego',
    sublabel: 'Leave a mark',
    color: 'text-orange-400',
    border: 'border-orange-400/20',
    bg: 'bg-orange-400/5',
    selectedBg: 'bg-orange-400/20 border-orange-400/50',
    archetypes: ['The Hero', 'The Outlaw', 'The Magician'],
  },
  {
    label: 'Social',
    sublabel: 'Connect & belong',
    color: 'text-rose-400',
    border: 'border-rose-400/20',
    bg: 'bg-rose-400/5',
    selectedBg: 'bg-rose-400/20 border-rose-400/50',
    archetypes: ['The Regular Guy', 'The Lover', 'The Jester'],
  },
  {
    label: 'Order',
    sublabel: 'Provide structure',
    color: 'text-emerald-400',
    border: 'border-emerald-400/20',
    bg: 'bg-emerald-400/5',
    selectedBg: 'bg-emerald-400/20 border-emerald-400/50',
    archetypes: ['The Caregiver', 'The Creator', 'The Ruler'],
  },
];

const CONFIDENCE_SCORES = {
  'dna.mission': 0.91,
  'dna.vision': 0.0,
  'dna.target': 0.87,
  'dna.competitors': 0.72,
  'dna.positioning': 0.94,
  'identity.colors': 0.89,
  'identity.typography': 0.83,
  'identity.dos': 0.78,
  'identity.donts': 0.76,
  'tonality.archetype': 0.88,
  'tonality.target': 0.85,
  'tonality.phrases': 0.45,
  'tonality.forbidden': 0.82,
  'tonality.voiceTone': 0.79,
  'tonality.toneDescriptors': 0.71
};

const PILLAR_FIELDS = {
  'Brand DNA': ['Mission', 'Vision', 'Target Audience', 'Competitors', 'Positioning'],
  'Brand Identity': ["Visual Do's", "Visual Don'ts"],
  'Brand Tonality': ['Key Phrases', 'Forbidden Words', 'Voice Tone', 'Tone Descriptors']
};

export default function App() {
  const [activeMenu, setActiveMenu] = useState('knowledge');
  const [knowledgeExpanded, setKnowledgeExpanded] = useState(true);

  // States: 'empty', 'parsing', 'review', 'populated', 'draft', 'error'
  const [ingestionState, setIngestionState] = useState('empty');
  const [parsingProgress, setParsingProgress] = useState(0);
  const [parsingStep, setParsingStep] = useState('');
  const [slowExtractionWarning, setSlowExtractionWarning] = useState(false);
  const [errorState, setErrorState] = useState<{ type: string; message: string } | null>(null);

  // Dropzone states
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    dna: { mission: '', vision: '', target: '', competitors: '', positioning: '' },
    identity: {
      colors: [
        { id: 1, label: 'Primary Color', hex: '#000000' },
        { id: 2, label: 'Secondary Color', hex: '#FFFFFF' },
        { id: 3, label: 'Accent Color', hex: '#E32645' }
      ],
      typography: [
        { id: 1, hierarchy: 'Heading 1', font: '', size: '' }
      ],
      dos: [] as string[],
      donts: [] as string[]
    },
    tonality: { archetype: '', target: '', phrases: '', forbidden: '', voiceTone: '', toneDescriptors: '' }
  });

  // AI Provenance Tracking
  const [aiProvenance, setAiProvenance] = useState<Record<string, string>>({});
  const [conflicts, setConflicts] = useState<Record<string, { existing: string; ai: string }>>({});

  // Inputs
  const [newDo, setNewDo] = useState('');
  const [newDont, setNewDont] = useState('');

  // Vibe Check
  const [isGeneratingVibe, setIsGeneratingVibe] = useState(false);
  const [vibeResult, setVibeResult] = useState('');

  // Locks
  const [locks, setLocks] = useState({ dna: false, identity: false, tonality: false });
  const [lockErrors, setLockErrors] = useState<Record<string, string>>({});

  // Dirty state tracking
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Re-ingest confirmation
  const [showReIngestConfirm, setShowReIngestConfirm] = useState(false);

  // Knowledge Vault Viewer (V1.0)
  const [showVault, setShowVault] = useState(false);
  const [vaultChunks, setVaultChunks] = useState<VaultChunk[]>(MOCK_VAULT_CHUNKS);
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultActiveFilters, setVaultActiveFilters] = useState<string[]>(['All']);
  const [editingChunkId, setEditingChunkId] = useState<string | null>(null);
  const [editingChunkText, setEditingChunkText] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [deletedChunk, setDeletedChunk] = useState<{ chunk: VaultChunk; index: number } | null>(null);
  const [showPromoteDropdown, setShowPromoteDropdown] = useState<string | null>(null);
  const [expandedChunkId, setExpandedChunkId] = useState<string | null>(null);

  // Parsing cancel ref
  const parsingTimers = useRef<NodeJS.Timeout[]>([]);

  // --- UNSAVED CHANGES GUARD ---
  useEffect(() => {
    if (isDirty && ingestionState === 'review') {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
  }, [isDirty, ingestionState]);

  // Undo delete timer
  useEffect(() => {
    if (deletedChunk) {
      const timer = setTimeout(() => setDeletedChunk(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [deletedChunk]);

  // --- NAVIGATION GUARD ---
  const safeNavigate = useCallback((target: string) => {
    if (isDirty && ingestionState === 'review' && target !== 'knowledge') {
      setPendingNavigation(target);
      setShowLeaveDialog(true);
    } else {
      setActiveMenu(target);
    }
  }, [isDirty, ingestionState]);

  // --- ACTIONS ---
  const handleSimulateDrop = (_sourceType: 'pdf' | 'pptx' | 'url' = 'pdf') => {
    setIngestionState('parsing');
    setParsingProgress(0);
    setParsingStep('Parsing document...');
    setSlowExtractionWarning(false);
    setErrorState(null);

    const existingMission = "To sell clothes to professionals.";

    const t1 = setTimeout(() => { setParsingProgress(30); setParsingStep('Extracting brand data...'); }, 1000);
    const t2 = setTimeout(() => { setParsingProgress(70); setParsingStep('Organizing insights...'); }, 2500);
    const t3 = setTimeout(() => {
      setParsingProgress(100);
      setFormData(MOCK_EXTRACTION);

      setAiProvenance({
        'dna.mission': 'conflict',
        'dna.vision': 'not_found',
        'dna.target': 'ai_extracted',
        'dna.competitors': 'ai_extracted',
        'dna.positioning': 'ai_extracted',
        'identity.colors': 'ai_extracted',
        'identity.typography': 'ai_extracted',
        'identity.dos': 'ai_extracted',
        'identity.donts': 'ai_extracted',
        'tonality.archetype': 'ai_extracted',
        'tonality.target': 'ai_extracted',
        'tonality.phrases': 'ai_extracted',
        'tonality.forbidden': 'ai_extracted',
        'tonality.voiceTone': 'ai_extracted',
        'tonality.toneDescriptors': 'ai_extracted'
      });

      setConflicts({
        'dna.mission': { existing: existingMission, ai: MOCK_EXTRACTION.dna.mission }
      });

      setIngestionState('review');
      setIsDirty(true);
    }, 4000);

    parsingTimers.current = [t1, t2, t3];
  };

  const cancelParsing = () => {
    parsingTimers.current.forEach(clearTimeout);
    parsingTimers.current = [];
    setIngestionState('empty');
    setParsingProgress(0);
    setParsingStep('');
    setSlowExtractionWarning(false);
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    handleSimulateDrop('url');
    setShowUrlInput(false);
    setUrlInput('');
  };

  const toggleLock = (pillar: 'dna' | 'identity' | 'tonality') => {
    if (locks[pillar]) {
      setLocks(prev => ({ ...prev, [pillar]: false }));
      setLockErrors(prev => { const n = { ...prev }; delete n[pillar]; return n; });
      return;
    }
    // Validate required fields
    if (pillar === 'dna' && !formData.dna.mission.trim()) {
      setLockErrors(prev => ({ ...prev, dna: 'Please fill in Mission before locking.' }));
      return;
    }
    if (pillar === 'identity' && !formData.identity.colors.some(c => c.label === 'Primary Color' && c.hex.trim())) {
      setLockErrors(prev => ({ ...prev, identity: 'Please add at least one Primary color before locking.' }));
      return;
    }
    if (pillar === 'tonality' && !formData.tonality.archetype) {
      setLockErrors(prev => ({ ...prev, tonality: 'Please select a Brand Archetype before locking.' }));
      return;
    }
    setLockErrors(prev => { const n = { ...prev }; delete n[pillar]; return n; });
    setLocks(prev => ({ ...prev, [pillar]: true }));
  };

  const handleActivate = () => {
    if (locks.dna && locks.identity && locks.tonality) {
      setIngestionState('populated');
      setIsDirty(false);
    }
  };

  const handleSaveDraft = () => {
    setIngestionState('draft');
    setIsDirty(false);
  };

  const resumeReview = () => {
    setIngestionState('review');
    setIsDirty(true);
  };

  const startReIngest = () => {
    setShowReIngestConfirm(false);
    setLocks({ dna: false, identity: false, tonality: false });
    handleSimulateDrop();
  };

  const generateVibeCheck = () => {
    setIsGeneratingVibe(true);
    setVibeResult('');
    setTimeout(() => {
      setVibeResult("\"Sharp lines. Effortless structure. Discover the new architectural basics designed for the urban professional. No compromise on design, no prohibitive markups. Shop the collection.\"");
      setIsGeneratingVibe(false);
    }, 1500);
  };

  const handleFieldEdit = (pillar: string, field: string, value: string) => {
    setFormData(prev => ({ ...prev, [pillar]: { ...prev[pillar as keyof typeof prev], [field]: value } }));
    if (aiProvenance[`${pillar}.${field}`] !== 'human_overridden') {
      setAiProvenance(prev => ({ ...prev, [`${pillar}.${field}`]: 'human_overridden' }));
    }
    setIsDirty(true);
    // Clear lock error on edit
    setLockErrors(prev => { const n = { ...prev }; delete n[pillar]; return n; });
  };

  const resolveConflict = (pillar: string, field: string, chosenValue: string, newProvenanceState: string) => {
    setFormData(prev => ({ ...prev, [pillar]: { ...prev[pillar as keyof typeof prev], [field]: chosenValue } }));
    setAiProvenance(prev => ({ ...prev, [`${pillar}.${field}`]: newProvenanceState }));
    setIsDirty(true);
  };

  const flagArrayEdit = (key: string) => {
    if (aiProvenance[key] !== 'human_overridden') setAiProvenance(prev => ({ ...prev, [key]: 'human_overridden' }));
    setIsDirty(true);
  };

  // Identity Array Handlers
  const addColor = () => {
    setFormData(prev => ({ ...prev, identity: { ...prev.identity, colors: [...prev.identity.colors, { id: Date.now(), label: 'Custom Color', hex: '#000000' }] }}));
    flagArrayEdit('identity.colors');
  };
  const removeColor = (id: number) => {
    setFormData(prev => ({ ...prev, identity: { ...prev.identity, colors: prev.identity.colors.filter(c => c.id !== id) }}));
    flagArrayEdit('identity.colors');
  };
  const updateColor = (id: number, hex: string) => {
    setFormData(prev => ({ ...prev, identity: { ...prev.identity, colors: prev.identity.colors.map(c => c.id === id ? { ...c, hex } : c) }}));
    flagArrayEdit('identity.colors');
  };

  const addDo = () => {
    if (!newDo.trim()) return;
    setFormData(prev => ({ ...prev, identity: { ...prev.identity, dos: [...prev.identity.dos, newDo] }}));
    setNewDo('');
    flagArrayEdit('identity.dos');
  };
  const removeDo = (index: number) => {
    setFormData(prev => ({ ...prev, identity: { ...prev.identity, dos: prev.identity.dos.filter((_, i) => i !== index) }}));
    flagArrayEdit('identity.dos');
  };

  const addDont = () => {
    if (!newDont.trim()) return;
    setFormData(prev => ({ ...prev, identity: { ...prev.identity, donts: [...prev.identity.donts, newDont] }}));
    setNewDont('');
    flagArrayEdit('identity.donts');
  };
  const removeDont = (index: number) => {
    setFormData(prev => ({ ...prev, identity: { ...prev.identity, donts: prev.identity.donts.filter((_, i) => i !== index) }}));
    flagArrayEdit('identity.donts');
  };

  const updateTypeFont = (id: number, font: string) => {
    setFormData(prev => ({ ...prev, identity: { ...prev.identity, typography: prev.identity.typography.map(t => t.id === id ? { ...t, font } : t) }}));
    flagArrayEdit('identity.typography');
  };
  const updateTypeSize = (id: number, size: string) => {
    setFormData(prev => ({ ...prev, identity: { ...prev.identity, typography: prev.identity.typography.map(t => t.id === id ? { ...t, size } : t) }}));
    flagArrayEdit('identity.typography');
  };
  const removeType = (id: number) => {
    setFormData(prev => ({ ...prev, identity: { ...prev.identity, typography: prev.identity.typography.filter(t => t.id !== id) }}));
    flagArrayEdit('identity.typography');
  };

  // --- VAULT ACTIONS ---
  const toggleVaultFilter = (filter: string) => {
    if (filter === 'All') {
      setVaultActiveFilters(['All']);
    } else {
      setVaultActiveFilters(prev => {
        const without = prev.filter(f => f !== 'All');
        if (without.includes(filter)) {
          const result = without.filter(f => f !== filter);
          return result.length === 0 ? ['All'] : result;
        }
        return [...without, filter];
      });
    }
  };

  const getFilteredVaultChunks = () => {
    let chunks = [...vaultChunks];

    // Search filter
    if (vaultSearch.trim()) {
      const q = vaultSearch.toLowerCase();
      chunks = chunks.filter(c => c.text.toLowerCase().includes(q) || c.label.toLowerCase().includes(q));
    }

    // Cluster filter
    if (!vaultActiveFilters.includes('All')) {
      chunks = chunks.filter(c => {
        if (vaultActiveFilters.includes('Mapped') && c.mapped) return true;
        if (vaultActiveFilters.includes('Unmapped') && !c.mapped) return true;
        if (vaultActiveFilters.includes(c.label)) return true;
        return false;
      });
    }

    // Pinned first
    chunks.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    return chunks;
  };

  const togglePinChunk = (id: string) => {
    setVaultChunks(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const deleteChunk = (id: string) => {
    const idx = vaultChunks.findIndex(c => c.id === id);
    if (idx === -1) return;
    const chunk = vaultChunks[idx];
    setDeletedChunk({ chunk, index: idx });
    setVaultChunks(prev => prev.filter(c => c.id !== id));
  };

  const undoDelete = () => {
    if (!deletedChunk) return;
    setVaultChunks(prev => {
      const arr = [...prev];
      arr.splice(deletedChunk.index, 0, deletedChunk.chunk);
      return arr;
    });
    setDeletedChunk(null);
  };

  const startEditChunk = (id: string) => {
    const chunk = vaultChunks.find(c => c.id === id);
    if (chunk) {
      setEditingChunkId(id);
      setEditingChunkText(chunk.text);
    }
  };

  const saveEditChunk = () => {
    if (!editingChunkId) return;
    setVaultChunks(prev => prev.map(c => c.id === editingChunkId ? { ...c, text: editingChunkText } : c));
    setEditingChunkId(null);
    setEditingChunkText('');
  };

  const addManualNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: `vc-${Date.now()}`,
      text: newNote,
      label: 'Manual Note',
      mapped: false,
      pillar: null,
      field: null,
      pinned: false,
      source: 'Manual entry',
      page: null,
      confidence: 1.0
    };
    setVaultChunks(prev => [note, ...prev]);
    setNewNote('');
    setShowAddNote(false);
  };

  const promoteChunk = (chunkId: string, pillar: string, field: string) => {
    setVaultChunks(prev => prev.map(c => c.id === chunkId ? { ...c, mapped: true, pillar, field } : c));
    setShowPromoteDropdown(null);
  };

  // --- COVERAGE HELPERS ---
  const getDnaCoverage = () => {
    let filled = 0;
    if (formData.dna.mission.trim()) filled++;
    if (formData.dna.vision.trim()) filled++;
    if (formData.dna.target.trim()) filled++;
    if (formData.dna.competitors.trim()) filled++;
    if (formData.dna.positioning.trim()) filled++;
    return { filled, total: 5 };
  };

  const getIdentityCoverage = () => {
    let filled = 0;
    const total = 4;
    if (formData.identity.colors.length > 0) filled++;
    if (formData.identity.typography.some(t => t.font.trim())) filled++;
    if (formData.identity.dos.length > 0) filled++;
    if (formData.identity.donts.length > 0) filled++;
    return { filled, total };
  };

  const getTonalityCoverage = () => {
    let filled = 0;
    const total = 6;
    if (formData.tonality.archetype) filled++;
    if (formData.tonality.target.trim()) filled++;
    if (formData.tonality.phrases.trim()) filled++;
    if (formData.tonality.forbidden.trim()) filled++;
    if (formData.tonality.voiceTone.trim()) filled++;
    if (formData.tonality.toneDescriptors.trim()) filled++;
    return { filled, total };
  };

  const getVaultClusterLabels = () => {
    const labels = new Set(vaultChunks.filter(c => !c.mapped).map(c => c.label));
    return Array.from(labels);
  };

  const unmappedCount = vaultChunks.filter(c => !c.mapped).length;
  const mappedCount = vaultChunks.filter(c => c.mapped).length;

  // --- REUSABLE COMPONENTS ---
  const ProvenanceBadge = ({ fieldKey }: { fieldKey: string }) => {
    const state = aiProvenance[fieldKey];
    const confidence = CONFIDENCE_SCORES[fieldKey as keyof typeof CONFIDENCE_SCORES];

    if (state === 'ai_extracted') {
      const isLowConf = confidence !== undefined && confidence < 0.5;
      return (
        <div className="flex items-center gap-2">
          {isLowConf && (
            <span className="flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/50 border border-neutral-700/50 px-1.5 py-0.5 rounded font-mono tracking-widest uppercase">
              <AlertTriangle size={10} /> Low Confidence
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/50 border border-neutral-700/50 px-1.5 py-0.5 rounded font-mono tracking-widest uppercase">
            <Wand2 size={10} /> AI
          </span>
        </div>
      );
    }
    if (state === 'human_overridden') {
      return (
        <span className="flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/50 border border-neutral-700/50 px-1.5 py-0.5 rounded font-mono tracking-widest uppercase">
          <User size={10} /> Edited
        </span>
      );
    }
    if (state === 'not_found') {
      return (
        <span className="flex items-center gap-1 text-[10px] text-neutral-500 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded font-mono tracking-widest uppercase">
          <AlertCircle size={10} /> Not Found
        </span>
      );
    }
    if (state === 'conflict') {
      return (
        <span className="flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/50 border border-neutral-700/50 px-1.5 py-0.5 rounded font-mono tracking-widest uppercase">
          <GitMerge size={10} /> Review
        </span>
      );
    }
    return null;
  };

  const getContainerStyle = (fieldKey: string) => {
    const state = aiProvenance[fieldKey];
    const confidence = CONFIDENCE_SCORES[fieldKey as keyof typeof CONFIDENCE_SCORES];
    if (state === 'conflict') return 'border-neutral-600/30 bg-neutral-800/10';
    if (state === 'not_found') return 'border-neutral-800 border-dashed bg-neutral-800/40 opacity-80 hover:opacity-100';
    if (state === 'ai_extracted' && confidence !== undefined && confidence < 0.5) return 'border-neutral-600/30 bg-neutral-800/10';
    if (state === 'ai_extracted') return 'border-neutral-700/40 bg-neutral-800/10';
    return 'border-neutral-800/60 bg-neutral-900/20';
  };

  // Cluster label — semantic neutral only, no rainbow
  const getLabelColor = (_label: string) => {
    return 'text-neutral-500 bg-neutral-800/50 border-neutral-700/50';
  };

  return (
    <div className="h-screen bg-black text-neutral-300 font-sans overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">

      {/* LEAVE CONFIRMATION DIALOG */}
      {showLeaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="border border-neutral-800/80 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-sm font-medium text-white mb-2">Unsaved changes</h3>
            <p className="text-sm text-neutral-400 mb-6">You have unsaved changes. Are you sure you want to leave?</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowLeaveDialog(false); setPendingNavigation(null); }} className="flex-1 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-medium hover:bg-neutral-700 transition-colors">Stay</button>
              <button onClick={() => { setShowLeaveDialog(false); if (pendingNavigation) { setActiveMenu(pendingNavigation); setIsDirty(false); } setPendingNavigation(null); }} className="flex-1 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors">Leave</button>
            </div>
          </div>
        </div>
      )}

      {/* RE-INGEST CONFIRMATION DIALOG */}
      {showReIngestConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="border border-neutral-800/80 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-neutral-800/50 border border-neutral-700/50 rounded-lg flex items-center justify-center">
                <AlertTriangle size={16} className="text-neutral-400" />
              </div>
              <h3 className="text-sm font-medium text-white">Re-ingest from new source</h3>
            </div>
            <p className="text-sm text-neutral-400 mb-6">Re-ingesting will create a new extraction. Your current pillar data will not be overwritten until you review and save the new extraction. Proceed?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowReIngestConfirm(false)} className="flex-1 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-medium hover:bg-neutral-700 transition-colors">Cancel</button>
              <button onClick={startReIngest} className="flex-1 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors">Proceed</button>
            </div>
          </div>
        </div>
      )}

      {/* UNDO DELETE TOAST */}
      {deletedChunk && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 border border-neutral-800/80 rounded-lg px-4 py-3 flex items-center gap-4 shadow-2xl">
          <span className="text-sm text-neutral-300">Chunk deleted</span>
          <button onClick={undoDelete} className="text-sm text-white font-medium hover:text-neutral-400 transition-colors">Undo</button>
          <span className="text-xs text-neutral-600">10s</span>
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
              onClick={() => safeNavigate('general')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-light transition-colors ${activeMenu === 'general' ? 'bg-neutral-900/50 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900/30'}`}
            >
              <Settings size={16} /> General
            </button>

            {/* BRAND KNOWLEDGE PARENT */}
            <div className="pt-2">
              <button
                onClick={() => {
                  safeNavigate('knowledge');
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
                    { id: 'dna', label: 'Brand DNA', locked: locks.dna },
                    { id: 'identity', label: 'Brand Identity', locked: locks.identity },
                    { id: 'tonality', label: 'Brand Tonality', locked: locks.tonality }
                  ].map((pillar) => (
                    <button
                      key={pillar.id}
                      onClick={() => safeNavigate(pillar.id)}
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
          <div className="px-8 pt-8 pb-4 border-b border-neutral-800/50 shrink-0 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-light tracking-tight text-white">
                {activeMenu === 'knowledge' && 'Brand Knowledge'}
                {activeMenu === 'dna' && 'Brand DNA'}
                {activeMenu === 'general' && 'General'}
                {activeMenu === 'identity' && 'Brand Identity'}
                {activeMenu === 'tonality' && 'Brand Tonality'}
              </h1>
              <p className="text-sm font-light text-neutral-400 mt-1">
                {activeMenu === 'knowledge' && 'Unified Intelligence Ingestion'}
                {activeMenu === 'dna' && 'Core mission, audience, and market positioning'}
                {activeMenu === 'identity' && 'Visual guardrails, color palettes, and typography rules'}
                {activeMenu === 'tonality' && 'Brand voice, archetypes, and linguistic boundaries'}
                {activeMenu === 'general' && 'Brand name, workspace, and configuration'}
              </p>
            </div>

            {['dna', 'identity', 'tonality'].includes(activeMenu) && (
               <button className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors">
                 Save {activeMenu === 'dna' ? 'DNA' : activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}
               </button>
            )}
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto p-8 pb-20">

            {/* ==================== GENERAL SETTINGS ==================== */}
            {activeMenu === 'general' && (
              <div className="max-w-2xl mx-auto animate-in fade-in duration-300 space-y-6">
                <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6">
                  <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-4">Brand Name</label>
                  <input
                    defaultValue="PERSIB"
                    className="w-full bg-neutral-900/20 border border-neutral-800/50 rounded-lg px-4 py-3 text-sm font-light text-white outline-none focus:border-neutral-700 transition-colors"
                  />
                </div>
                <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6">
                  <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-4">Brand Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-neutral-900/20 border border-neutral-800/50 rounded-xl flex items-center justify-center text-neutral-600">
                      <FileUp size={24} />
                    </div>
                    <div>
                      <button className="text-sm text-neutral-400 hover:text-white transition-colors">Upload logo</button>
                      <p className="text-xs text-neutral-600 mt-1">PNG, SVG, or JPG. Max 2MB.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6">
                  <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-4">Industry</label>
                  <select className="w-full bg-neutral-900/20 border border-neutral-800/50 rounded-lg px-4 py-3 text-sm font-light text-white outline-none appearance-none cursor-pointer">
                    <option>Fashion & Apparel</option>
                    <option>Technology</option>
                    <option>Food & Beverage</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6">
                  <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-4">Website</label>
                  <input
                    defaultValue="https://persib.co.id"
                    className="w-full bg-neutral-900/20 border border-neutral-800/50 rounded-lg px-4 py-3 text-sm font-light text-white outline-none focus:border-neutral-700 transition-colors"
                  />
                </div>
                <div className="rounded-xl border border-red-900/30 bg-red-900/5 p-6">
                  <label className="block text-[10px] font-mono tracking-widest text-red-400/60 uppercase mb-2">Danger Zone</label>
                  <p className="text-sm text-neutral-500 mb-4">Permanently delete this brand and all associated data.</p>
                  <button className="px-4 py-2 rounded-lg bg-red-900/20 border border-red-900/30 text-red-400 text-xs font-medium hover:bg-red-900/30 transition-colors">Delete Brand</button>
                </div>
              </div>
            )}

            {/* ==================== BRAND KNOWLEDGE: EMPTY STATE ==================== */}
            {activeMenu === 'knowledge' && ingestionState === 'empty' && (
              <div className="max-w-2xl mx-auto mt-8 animate-in fade-in zoom-in duration-300">
                <div
                  onClick={() => handleSimulateDrop('pdf')}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleSimulateDrop('pdf'); }}
                  className={`border border-dashed rounded-xl p-16 text-center cursor-pointer transition-all group relative overflow-hidden ${
                    isDragOver
                      ? 'border-white/40 bg-white/5 scale-[1.01]'
                      : 'border-neutral-800/60 bg-neutral-900/20 hover:border-neutral-700 hover:bg-neutral-950/60'
                  }`}
                >
                  {isDragOver && (
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                  )}
                  <div className={`w-12 h-12 bg-neutral-800/40 border border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-5 transition-transform duration-300 ${isDragOver ? '-translate-y-2 scale-110' : 'group-hover:-translate-y-1'}`}>
                    <Upload size={20} className="text-neutral-300" />
                  </div>
                  <h3 className="text-lg font-light text-white mb-2">Drop brand guideline here</h3>
                  <p className="text-sm font-light text-neutral-500 max-w-sm mx-auto">
                    Upload a brand guideline once. We'll auto-populate DNA, Identity, and Tonality for you.
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <span className="text-[10px] font-mono tracking-widest text-neutral-600 uppercase">PDF</span>
                    <span className="text-neutral-800">|</span>
                    <span className="text-[10px] font-mono tracking-widest text-neutral-600 uppercase">PPTX</span>
                    <span className="text-neutral-800">|</span>
                    <span className="text-[10px] font-mono tracking-widest text-neutral-600 uppercase">50MB max</span>
                  </div>
                </div>

                {/* URL Paste Input */}
                <div className="mt-4">
                  {!showUrlInput ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowUrlInput(true); }}
                      className="w-full flex items-center justify-center gap-2 text-sm font-light text-neutral-500 hover:text-neutral-300 transition-colors py-3 rounded-lg border border-transparent hover:border-neutral-800/40"
                    >
                      <Globe size={14} /> or paste a URL
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center bg-neutral-900/20 border border-neutral-800/50 rounded-lg px-4 py-3 focus-within:border-neutral-700 transition-colors">
                        <Link size={14} className="text-neutral-600 mr-3 shrink-0" />
                        <input
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                          className="w-full bg-transparent border-none outline-none text-sm font-light text-white placeholder-neutral-600"
                          placeholder="https://brand-website.com/guidelines"
                          autoFocus
                        />
                      </div>
                      <button onClick={handleUrlSubmit} className="px-4 py-2.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors">Fetch</button>
                      <button onClick={() => { setShowUrlInput(false); setUrlInput(''); }} className="px-3 py-2.5 rounded-lg bg-neutral-800 text-neutral-400 text-xs hover:bg-neutral-700 transition-colors"><X size={14} /></button>
                    </div>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => { setActiveMenu('dna'); setKnowledgeExpanded(true); }}
                    className="text-sm font-light text-neutral-500 hover:text-neutral-300 transition-colors underline decoration-neutral-800 underline-offset-4"
                  >
                    or set up each pillar manually &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* ==================== PARSING STATE ==================== */}
            {activeMenu === 'knowledge' && ingestionState === 'parsing' && (
              <div className="max-w-md mx-auto mt-32 text-center animate-in fade-in duration-300">
                <div className="w-12 h-12 bg-neutral-800/40 border border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Wand2 size={20} className="text-neutral-400" />
                </div>
                <h3 className="text-lg font-light text-white mb-2">Analyzing Brand Structure</h3>
                <p className="text-sm font-light text-neutral-500 mb-2">{parsingStep}</p>

                {slowExtractionWarning && (
                  <p className="text-xs text-neutral-500 mb-4 flex items-center justify-center gap-1.5">
                    <Clock size={12} /> This is taking longer than usual — processing large documents
                  </p>
                )}

                <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden mt-6 mb-6">
                  <div
                    className="h-full bg-neutral-300 transition-all duration-500 ease-out"
                    style={{ width: `${parsingProgress}%` }}
                  />
                </div>

                <button
                  onClick={cancelParsing}
                  className="text-sm font-light text-neutral-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* ==================== ERROR STATE ==================== */}
            {activeMenu === 'knowledge' && ingestionState === 'error' && errorState && (
              <div className="max-w-md mx-auto mt-24 text-center animate-in fade-in duration-300">
                <div className="w-12 h-12 bg-red-900/20 border border-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle size={20} className="text-red-400" />
                </div>
                <h3 className="text-lg font-light text-white mb-3">Extraction Failed</h3>
                <p className="text-sm font-light text-neutral-400 mb-8 max-w-sm mx-auto">{errorState.message}</p>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => { setErrorState(null); handleSimulateDrop(); }}
                    className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={14} /> Retry
                  </button>
                  <button
                    onClick={() => { setErrorState(null); setIngestionState('empty'); setActiveMenu('dna'); setKnowledgeExpanded(true); }}
                    className="px-5 py-2.5 rounded-lg bg-neutral-800 text-neutral-300 text-sm font-medium hover:bg-neutral-700 transition-colors"
                  >
                    Set up manually
                  </button>
                </div>
              </div>
            )}

            {/* ==================== UNIFIED REVIEW SCREEN ==================== */}
            {activeMenu === 'knowledge' && ingestionState === 'review' && (
              <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">

                {/* Extraction Success Banner */}
                <div className="flex items-center gap-3 mb-6 bg-neutral-800/40 border border-neutral-800 text-neutral-300 p-3 rounded-lg text-sm font-light shadow-2xl">
                  <CheckCircle2 size={16} className="text-neutral-500 shrink-0" />
                  <span className="flex-1">Extraction complete. Review and lock each pillar to activate the brand.</span>
                  <span className="text-[10px] font-mono text-neutral-600">Q2_Brand_Book_Final.pdf</span>
                </div>

                <div className="space-y-6">

                  {/* ---- PILLAR 1: DNA ---- */}
                  <div className={`p-5 transition-colors duration-300 ${locks.dna ? 'opacity-60' : ''}`}>
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-3">
                        <h4 className={`text-sm font-medium ${locks.dna ? 'text-neutral-500' : 'text-white'}`}>Brand DNA</h4>
                        {locks.dna && <Lock size={12} className="text-neutral-500" />}
                        {locks.dna && <span className="text-[10px] font-mono text-neutral-600">{getDnaCoverage().filled}/{getDnaCoverage().total} fields</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {lockErrors.dna && <span className="text-[10px] text-red-400">{lockErrors.dna}</span>}
                        <button
                          onClick={() => toggleLock('dna')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${locks.dna ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white' : 'bg-white text-black hover:bg-neutral-200'}`}
                        >
                          {locks.dna ? <><Unlock size={12}/> Unlock</> : <><Lock size={12}/> Lock DNA</>}
                        </button>
                      </div>
                    </div>

                    {!locks.dna ? (
                      <div className="space-y-6 pt-2 border-t border-neutral-800/50 mt-4">
                        <div className="grid grid-cols-2 gap-6">

                          {/* CONFLICT UI FOR MISSION */}
                          <div className={`rounded-xl border p-6 flex flex-col transition-colors ${getContainerStyle('dna.mission')}`}>
                            <div className="flex items-center justify-between mb-4">
                              <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Mission *</label>
                              <ProvenanceBadge fieldKey="dna.mission" />
                            </div>

                            {aiProvenance['dna.mission'] === 'conflict' ? (
                              <div className="flex flex-col gap-4">
                                <div className="p-3 rounded-lg bg-neutral-900/20 border border-neutral-800/50">
                                  <span className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-1">Existing Value</span>
                                  <p className="text-sm font-light text-neutral-500 line-through decoration-neutral-600">{conflicts['dna.mission']?.existing}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-neutral-800/40 border border-neutral-700/50">
                                  <span className="block text-[10px] font-mono tracking-widest text-neutral-500/80 uppercase mb-1">New AI Extraction</span>
                                  <p className="text-sm font-light text-white leading-relaxed">{conflicts['dna.mission']?.ai}</p>
                                </div>
                                <div className="flex gap-3 mt-1">
                                  <button onClick={() => resolveConflict('dna', 'mission', conflicts['dna.mission']?.existing || '', 'human_overridden')} className="flex-1 py-2 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-medium hover:bg-neutral-700 transition-colors">Keep Existing</button>
                                  <button onClick={() => resolveConflict('dna', 'mission', conflicts['dna.mission']?.ai || '', 'ai_extracted')} className="flex-1 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors shadow-sm">Accept New</button>
                                </div>
                              </div>
                            ) : (
                              <textarea
                                value={formData.dna.mission}
                                onChange={(e) => handleFieldEdit('dna', 'mission', e.target.value)}
                                className="w-full flex-1 bg-transparent border-none outline-none text-sm font-light text-white placeholder-neutral-600 resize-none leading-relaxed"
                                rows={3}
                                placeholder="e.g. To democratize premium design for the urban professional — no luxury markup, no compromise."
                              />
                            )}
                          </div>

                          {/* NOT FOUND UI FOR VISION */}
                          <div className={`rounded-xl border p-6 flex flex-col transition-colors ${getContainerStyle('dna.vision')}`}>
                            <div className="flex items-center justify-between mb-4">
                              <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Vision</label>
                              <ProvenanceBadge fieldKey="dna.vision" />
                            </div>
                            <textarea
                              value={formData.dna.vision}
                              onChange={(e) => handleFieldEdit('dna', 'vision', e.target.value)}
                              className="w-full flex-1 bg-transparent border-none outline-none text-sm font-light text-white placeholder-neutral-600 resize-none leading-relaxed"
                              placeholder="e.g. A world where everyone has access to beautifully designed, lasting clothing."
                              rows={3}
                            />
                          </div>
                        </div>

                          {/* TARGET AUDIENCE — chip input */}
                          <div className={`rounded-xl border p-6 transition-colors ${getContainerStyle('dna.target')}`}>
                            <div className="flex items-center justify-between mb-4">
                              <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Target Audience</label>
                              <ProvenanceBadge fieldKey="dna.target" />
                            </div>
                            <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                              {formData.dna.target ? formData.dna.target.split(',').map((tag, i) => (
                                <span key={i} className="bg-neutral-800/80 text-neutral-300 text-[10px] font-mono tracking-wide px-2 py-1 rounded border border-neutral-800 flex items-center gap-1.5">
                                  {tag.trim()}<button onClick={() => {
                                    const tags = formData.dna.target!.split(',').filter((_, idx) => idx !== i);
                                    handleFieldEdit('dna', 'target', tags.join(', '));
                                  }}><X size={12} /></button>
                                </span>
                              )) : null}
                              <input
                                className="bg-transparent border-none outline-none text-sm font-light text-white placeholder-neutral-600 flex-1 min-w-[140px]"
                                placeholder={formData.dna.target ? "" : "e.g. Urban professionals · 25-40 · SES A/B"}
                                onKeyDown={(e) => {
                                  if ((e.key === 'Enter' || e.key === ',') && e.currentTarget.value.trim()) {
                                    const val = e.currentTarget.value.trim().replace(/,$/, '');
                                    handleFieldEdit('dna', 'target', formData.dna.target ? `${formData.dna.target}, ${val}` : val);
                                    e.currentTarget.value = '';
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </div>
                            {!formData.dna.target && (
                              <p className="text-[10px] text-neutral-600 mt-2">Try: "Urban millennials, 25-34" or "Gen Z, 18-24, fashion-forward"</p>
                            )}
                          </div>

                          <div className="grid grid-cols-5 gap-6">
                          {/* COMPETITORS — chip input */}
                          <div className={`col-span-2 rounded-xl border p-6 transition-colors ${getContainerStyle('dna.competitors')}`}>
                            <div className="flex items-center justify-between mb-6">
                              <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Competitors</label>
                              <ProvenanceBadge fieldKey="dna.competitors" />
                            </div>
                            <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                              {formData.dna.competitors ? formData.dna.competitors.split(',').map((tag, i) => (
                                <span key={i} className="bg-neutral-800/80 text-neutral-300 text-[10px] font-mono tracking-wide px-2 py-1 rounded border border-neutral-800 flex items-center gap-1.5">
                                  {tag.trim()}<button onClick={() => {
                                    const tags = formData.dna.competitors!.split(',').filter((_, idx) => idx !== i);
                                    handleFieldEdit('dna', 'competitors', tags.join(', '));
                                  }}><X size={12} /></button>
                                </span>
                              )) : null}
                              <input
                                className="bg-transparent border-none outline-none text-sm font-light text-white placeholder-neutral-600 flex-1 min-w-[120px]"
                                placeholder={formData.dna.competitors ? "" : "e.g. Nike · Zara · Everlane"}
                                onKeyDown={(e) => {
                                  if ((e.key === 'Enter' || e.key === ',') && e.currentTarget.value.trim()) {
                                    const val = e.currentTarget.value.trim().replace(/,$/, '');
                                    handleFieldEdit('dna', 'competitors', formData.dna.competitors ? `${formData.dna.competitors}, ${val}` : val);
                                    e.currentTarget.value = '';
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </div>
                            {!formData.dna.competitors && (
                              <p className="text-[10px] text-neutral-600 mt-2">Press Enter or comma to add · Direct competitors first</p>
                            )}
                          </div>
                          <div className={`col-span-3 rounded-xl border p-6 flex flex-col transition-colors ${getContainerStyle('dna.positioning')}`}>
                            <div className="flex items-center justify-between mb-4">
                              <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Market Positioning</label>
                              <ProvenanceBadge fieldKey="dna.positioning" />
                            </div>
                            <textarea
                              value={formData.dna.positioning}
                              onChange={(e) => handleFieldEdit('dna', 'positioning', e.target.value)}
                              className="w-full flex-1 bg-transparent border-none outline-none text-sm font-light text-white placeholder-neutral-600 resize-none leading-relaxed"
                              placeholder="e.g. Premium basics with architectural silhouettes at accessible price points."
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm font-light text-neutral-500">Brand DNA fields are locked and ready for production.</div>
                    )}
                  </div>

                  {/* ---- PILLAR 2: IDENTITY ---- */}
                  <div className={`p-5 transition-colors duration-300 ${locks.identity ? 'opacity-60' : ''}`}>
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-3">
                        <h4 className={`text-sm font-medium ${locks.identity ? 'text-neutral-500' : 'text-white'}`}>Brand Identity</h4>
                        {locks.identity && <Lock size={12} className="text-neutral-500" />}
                        {locks.identity && <span className="text-[10px] font-mono text-neutral-600">{getIdentityCoverage().filled}/{getIdentityCoverage().total} fields</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {lockErrors.identity && <span className="text-[10px] text-red-400">{lockErrors.identity}</span>}
                        <button
                          onClick={() => toggleLock('identity')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${locks.identity ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white' : 'bg-white text-black hover:bg-neutral-200'}`}
                        >
                          {locks.identity ? <><Unlock size={12}/> Unlock</> : <><Lock size={12}/> Lock Identity</>}
                        </button>
                      </div>
                    </div>

                    {!locks.identity ? (
                      <div className="space-y-6 pt-2 border-t border-neutral-800/50 mt-4">

                        <div className={`rounded-xl border p-6 transition-colors ${getContainerStyle('identity.colors')}`}>
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                              <h3 className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Color Palettes *</h3>
                              <ProvenanceBadge fieldKey="identity.colors" />
                            </div>
                            <button onClick={addColor} className="px-4 py-2 rounded-lg bg-neutral-800 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-neutral-700 transition-colors">
                              Add
                            </button>
                          </div>
                          <div className="space-y-5">
                            {formData.identity.colors.map((color) => (
                              <div key={color.id} className="space-y-2">
                                <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase">{color.label}</label>
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-lg border border-neutral-700/50 shrink-0" style={{ backgroundColor: color.hex || '#000000' }} />
                                  <div className="flex-1 flex items-center bg-neutral-900/20 border border-neutral-800/50 rounded-lg px-4 py-3 focus-within:border-neutral-700 transition-colors">
                                    <input
                                      value={color.hex}
                                      onChange={(e) => updateColor(color.id, e.target.value)}
                                      className="bg-transparent border-none outline-none text-sm font-mono text-neutral-300 w-full uppercase"
                                    />
                                  </div>
                                  {!['Primary Color', 'Secondary Color', 'Accent Color'].includes(color.label) && (
                                    <button onClick={() => removeColor(color.id)} className="text-neutral-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={`rounded-xl border p-6 transition-colors ${getContainerStyle('identity.typography')}`}>
                          <div className="flex items-center justify-between mb-6 pb-6 border-b border-neutral-800/50">
                            <div className="flex items-center gap-3">
                              <h3 className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Typography Rules</h3>
                              <ProvenanceBadge fieldKey="identity.typography" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            {formData.identity.typography.map((type) => (
                              <div key={type.id} className="flex items-center gap-4 group">
                                <div className="w-1/4">
                                  <div className="bg-neutral-900/20 border border-neutral-800/50 rounded-lg px-3 py-2.5">
                                    <select className="w-full bg-transparent border-none outline-none text-sm font-light text-neutral-300 appearance-none cursor-pointer">
                                      <option>{type.hierarchy}</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="flex-1 flex gap-2">
                                  <div className="flex-1 bg-neutral-900/20 border border-neutral-800/50 rounded-lg px-4 py-2.5 flex items-center">
                                    <input
                                      value={type.font}
                                      onChange={(e) => updateTypeFont(type.id, e.target.value)}
                                      className="w-full bg-transparent border-none outline-none text-sm font-light text-neutral-300"
                                    />
                                  </div>
                                  <div className="w-20 bg-neutral-900/20 border border-neutral-800/50 rounded-lg px-4 py-2.5 flex items-center">
                                    <input
                                      value={type.size}
                                      onChange={(e) => updateTypeSize(type.id, e.target.value)}
                                      className="w-full bg-transparent border-none outline-none text-sm font-mono text-neutral-300 text-center"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          <div className={`rounded-xl border p-6 transition-colors ${getContainerStyle('identity.dos')}`}>
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Things To Do</h3>
                              <ProvenanceBadge fieldKey="identity.dos" />
                            </div>
                            <div className="flex gap-3 mb-6">
                              <div className="flex-1 bg-neutral-900/20 border border-neutral-800/50 rounded-lg px-4 py-2.5 flex items-center focus-within:border-neutral-700 transition-colors">
                                <input
                                  value={newDo} onChange={(e) => setNewDo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addDo()}
                                  className="w-full bg-transparent border-none outline-none text-sm font-light text-white" placeholder="Add a rule..."
                                />
                              </div>
                              <button onClick={addDo} className="px-5 py-2.5 rounded-lg bg-neutral-800 text-white text-xs font-medium hover:bg-neutral-700 transition-colors">Add</button>
                            </div>
                            <div className="space-y-3">
                              {formData.identity.dos.map((rule, i) => (
                                <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-neutral-800/30 last:border-0 group">
                                  <p className="text-sm font-light text-white leading-relaxed">{rule}</p>
                                  <button onClick={() => removeDo(i)} className="text-xs font-light text-neutral-600 hover:text-red-400 transition-colors pt-0.5">Remove</button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className={`rounded-xl border p-6 transition-colors ${getContainerStyle('identity.donts')}`}>
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Things To Avoid</h3>
                              <ProvenanceBadge fieldKey="identity.donts" />
                            </div>
                            <div className="flex gap-3 mb-6">
                              <div className="flex-1 bg-neutral-900/20 border border-neutral-800/50 rounded-lg px-4 py-2.5 flex items-center focus-within:border-neutral-700 transition-colors">
                                <input
                                  value={newDont} onChange={(e) => setNewDont(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addDont()}
                                  className="w-full bg-transparent border-none outline-none text-sm font-light text-white" placeholder="Add a constraint..."
                                />
                              </div>
                              <button onClick={addDont} className="px-5 py-2.5 rounded-lg bg-neutral-800 text-white text-xs font-medium hover:bg-neutral-700 transition-colors">Add</button>
                            </div>
                            <div className="space-y-3">
                              {formData.identity.donts.map((rule, i) => (
                                <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-neutral-800/30 last:border-0 group">
                                  <p className="text-sm font-light text-white leading-relaxed">{rule}</p>
                                  <button onClick={() => removeDont(i)} className="text-xs font-light text-neutral-600 hover:text-red-400 transition-colors pt-0.5">Remove</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>
                    ) : (
                       <div className="text-sm font-light text-neutral-500">Brand Identity fields are locked and ready for production.</div>
                    )}
                  </div>

                  {/* ---- PILLAR 3: TONALITY ---- */}
                  <div className={`p-5 transition-colors duration-300 ${locks.tonality ? 'opacity-60' : ''}`}>
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-3">
                        <h4 className={`text-sm font-medium ${locks.tonality ? 'text-neutral-500' : 'text-white'}`}>Brand Tonality</h4>
                        {locks.tonality && <Lock size={12} className="text-neutral-500" />}
                        {locks.tonality && <span className="text-[10px] font-mono text-neutral-600">{getTonalityCoverage().filled}/{getTonalityCoverage().total} fields</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {lockErrors.tonality && <span className="text-[10px] text-red-400">{lockErrors.tonality}</span>}
                        <button
                          onClick={() => toggleLock('tonality')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${locks.tonality ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white' : 'bg-white text-black hover:bg-neutral-200'}`}
                        >
                          {locks.tonality ? <><Unlock size={12}/> Unlock</> : <><Lock size={12}/> Lock Tonality</>}
                        </button>
                      </div>
                    </div>

                    {!locks.tonality ? (
                      <div className="space-y-6 pt-2 border-t border-neutral-800/50 mt-4">

                        {/* ARCHETYPE BUBBLE MAP */}
                        <div className={`rounded-xl border p-6 transition-colors ${getContainerStyle('tonality.archetype')}`}>
                          <div className="flex items-center justify-between mb-5">
                            <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Brand Archetype *</label>
                            <ProvenanceBadge fieldKey="tonality.archetype" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {ARCHETYPE_QUADRANTS.map((quad) => (
                              <div key={quad.label} className={`rounded-xl border ${quad.border} ${quad.bg} p-4`}>
                                <div className="mb-3">
                                  <span className={`text-[10px] font-mono tracking-widest uppercase font-semibold ${quad.color}`}>{quad.label}</span>
                                  <span className="text-[10px] text-neutral-600 ml-2">{quad.sublabel}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {quad.archetypes.map((arch) => {
                                    const isSelected = formData.tonality.archetype === arch;
                                    return (
                                      <button
                                        key={arch}
                                        onClick={() => handleFieldEdit('tonality', 'archetype', arch)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-light border transition-all ${
                                          isSelected
                                            ? `${quad.selectedBg} text-white font-medium shadow-sm`
                                            : `border-neutral-800/60 text-neutral-400 hover:text-white hover:border-neutral-600 bg-transparent`
                                        }`}
                                      >
                                        {arch.replace('The ', '')}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                          {formData.tonality.archetype && (
                            <p className="mt-4 text-[10px] text-neutral-500 font-mono">
                              Selected: <span className="text-white">{formData.tonality.archetype}</span>
                            </p>
                          )}
                        </div>

                        {/* TARGET AUDIENCE + KEY PHRASES */}
                        <div className="grid grid-cols-2 gap-6">
                          <div className={`rounded-xl border p-6 flex flex-col transition-colors ${getContainerStyle('tonality.target')}`}>
                            <div className="flex items-center justify-between mb-4">
                              <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Target Audience</label>
                              <ProvenanceBadge fieldKey="tonality.target" />
                            </div>
                            <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                              {formData.tonality.target ? formData.tonality.target.split(',').map((tag, i) => (
                                <span key={i} className="bg-neutral-800/80 text-neutral-300 text-[10px] font-mono tracking-wide px-2 py-1 rounded border border-neutral-800 flex items-center gap-1.5">
                                  {tag.trim()}<button onClick={() => { const tags = formData.tonality.target!.split(',').filter((_, idx) => idx !== i); handleFieldEdit('tonality', 'target', tags.join(', ')); }}><X size={12} /></button>
                                </span>
                              )) : null}
                              <input
                                className="bg-transparent border-none outline-none text-sm font-light text-white flex-1 min-w-[140px]"
                                placeholder={formData.tonality.target ? "" : "e.g. Urban millennials · 25-34"}
                                onKeyDown={(e) => {
                                  if ((e.key === 'Enter' || e.key === ',') && e.currentTarget.value.trim()) {
                                    const val = e.currentTarget.value.trim().replace(/,$/, '');
                                    handleFieldEdit('tonality', 'target', formData.tonality.target ? `${formData.tonality.target}, ${val}` : val);
                                    e.currentTarget.value = '';
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </div>
                            {!formData.tonality.target && (
                              <p className="text-[10px] text-neutral-600 mt-2">Press Enter or comma to add a segment</p>
                            )}
                          </div>

                          <div className={`rounded-xl border p-6 transition-colors ${getContainerStyle('tonality.phrases')}`}>
                            <div className="flex items-center justify-between mb-4">
                              <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Key Phrases</label>
                              <ProvenanceBadge fieldKey="tonality.phrases" />
                            </div>
                            <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                              {formData.tonality.phrases ? formData.tonality.phrases.split(',').map((tag, i) => (
                                <span key={i} className="bg-neutral-800/80 text-neutral-300 text-[10px] font-mono tracking-wide px-2 py-1 rounded border border-neutral-800 flex items-center gap-1.5">
                                  {tag.trim()}<button onClick={() => { const tags = formData.tonality.phrases!.split(',').filter((_, idx) => idx !== i); handleFieldEdit('tonality', 'phrases', tags.join(', ')); }}><X size={12} /></button>
                                </span>
                              )) : null}
                              <input
                                className="bg-transparent border-none outline-none text-sm font-light text-white flex-1 min-w-[140px]"
                                placeholder={formData.tonality.phrases ? "" : "e.g. Sharp · Effortless · Bold"}
                                onKeyDown={(e) => {
                                  if ((e.key === 'Enter' || e.key === ',') && e.currentTarget.value.trim()) {
                                    const val = e.currentTarget.value.trim().replace(/,$/, '');
                                    handleFieldEdit('tonality', 'phrases', formData.tonality.phrases ? `${formData.tonality.phrases}, ${val}` : val);
                                    e.currentTarget.value = '';
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </div>
                            {!formData.tonality.phrases && (
                              <p className="text-[10px] text-neutral-600 mt-2">Brand words that should appear in copy</p>
                            )}
                          </div>
                        </div>

                        {/* VOICE TONE + TONE DESCRIPTORS (attitudinal vs lexical) */}
                        <div className="grid grid-cols-2 gap-6">
                          <div className={`rounded-xl border p-6 transition-colors ${getContainerStyle('tonality.voiceTone')}`}>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Voice Tone</label>
                              <ProvenanceBadge fieldKey="tonality.voiceTone" />
                            </div>
                            <p className="text-[10px] text-neutral-600 mb-4">Attitudinal — how the brand feels emotionally</p>
                            <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                              {formData.tonality.voiceTone ? formData.tonality.voiceTone.split(',').map((tag, i) => (
                                <span key={i} className="bg-violet-400/10 text-violet-300 text-[10px] font-mono tracking-wide px-2 py-1 rounded border border-violet-400/20 flex items-center gap-1.5">
                                  {tag.trim()}<X size={12} className="cursor-pointer hover:text-white transition-colors" />
                                </span>
                              )) : null}
                              <input
                                className="bg-transparent border-none outline-none text-sm font-light text-white flex-1 min-w-[120px]"
                                placeholder="e.g. Confident, Warm, Direct..."
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ',') {
                                    const val = (e.target as HTMLInputElement).value.trim().replace(/,$/, '');
                                    if (val) { handleFieldEdit('tonality', 'voiceTone', formData.tonality.voiceTone ? `${formData.tonality.voiceTone}, ${val}` : val); (e.target as HTMLInputElement).value = ''; }
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </div>
                          </div>

                          <div className={`rounded-xl border p-6 transition-colors ${getContainerStyle('tonality.toneDescriptors')}`}>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Tone Descriptors</label>
                              <ProvenanceBadge fieldKey="tonality.toneDescriptors" />
                            </div>
                            <p className="text-[10px] text-neutral-600 mb-4">Lexical — how the brand writes stylistically</p>
                            <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                              {formData.tonality.toneDescriptors ? formData.tonality.toneDescriptors.split(',').map((tag, i) => (
                                <span key={i} className="bg-teal-400/10 text-teal-300 text-[10px] font-mono tracking-wide px-2 py-1 rounded border border-teal-400/20 flex items-center gap-1.5">
                                  {tag.trim()}<X size={12} className="cursor-pointer hover:text-white transition-colors" />
                                </span>
                              )) : null}
                              <input
                                className="bg-transparent border-none outline-none text-sm font-light text-white flex-1 min-w-[120px]"
                                placeholder="e.g. Minimalist, Punchy, Poetic..."
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ',') {
                                    const val = (e.target as HTMLInputElement).value.trim().replace(/,$/, '');
                                    if (val) { handleFieldEdit('tonality', 'toneDescriptors', formData.tonality.toneDescriptors ? `${formData.tonality.toneDescriptors}, ${val}` : val); (e.target as HTMLInputElement).value = ''; }
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* FORBIDDEN WORDS */}
                        <div className={`rounded-xl border p-6 transition-colors ${getContainerStyle('tonality.forbidden')}`}>
                          <div className="flex items-center justify-between mb-4">
                            <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Forbidden Words</label>
                            <ProvenanceBadge fieldKey="tonality.forbidden" />
                          </div>
                          <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                            {formData.tonality.forbidden ? formData.tonality.forbidden.split(',').map((tag, i) => (
                              <span key={i} className="bg-red-400/10 text-red-300 text-[10px] font-mono tracking-wide px-2 py-1 rounded border border-red-400/20 flex items-center gap-1.5">
                                {tag.trim()}<button onClick={() => { const tags = formData.tonality.forbidden!.split(',').filter((_, idx) => idx !== i); handleFieldEdit('tonality', 'forbidden', tags.join(', ')); }}><X size={12} /></button>
                              </span>
                            )) : null}
                            <input
                              className="bg-transparent border-none outline-none text-sm font-light text-white flex-1 min-w-[140px]"
                              placeholder={formData.tonality.forbidden ? "" : "e.g. Cheap · Basic · Discount"}
                              onKeyDown={(e) => {
                                if ((e.key === 'Enter' || e.key === ',') && e.currentTarget.value.trim()) {
                                  const val = e.currentTarget.value.trim().replace(/,$/, '');
                                  handleFieldEdit('tonality', 'forbidden', formData.tonality.forbidden ? `${formData.tonality.forbidden}, ${val}` : val);
                                  e.currentTarget.value = '';
                                  e.preventDefault();
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* Vibe Check — now reflects all 6 fields */}
                        <div className="rounded-xl border border-neutral-800 bg-neutral-900/20 overflow-hidden mt-4 shadow-xl">
                          <div className="p-3 border-b border-neutral-800/50 flex justify-between items-center">
                            <div>
                              <span className="text-xs font-medium text-neutral-300 flex items-center gap-2"><MessageSquare size={14}/> Vibe Check</span>
                              <span className="text-[10px] text-neutral-600 mt-0.5 block">Generated from all 6 tonality fields</span>
                            </div>
                            <button
                              onClick={generateVibeCheck} disabled={isGeneratingVibe}
                              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs flex items-center gap-1.5 hover:bg-neutral-700 hover:text-white transition-colors"
                            >
                              {isGeneratingVibe ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />} Generate
                            </button>
                          </div>
                          <div className="p-4 min-h-[80px] flex items-center justify-center">
                            {isGeneratingVibe ? (
                              <RefreshCw size={16} className="animate-spin text-neutral-500" />
                            ) : vibeResult ? (
                              <p className="text-sm font-light text-neutral-300 italic border-l border-neutral-700 pl-3">{vibeResult}</p>
                            ) : (
                              <span className="text-xs text-neutral-600">Generate a sample post to validate tone across archetype, voice, descriptors, and key phrases.</span>
                            )}
                          </div>
                        </div>

                      </div>
                    ) : (
                       <div className="text-sm font-light text-neutral-500">Brand Tonality fields are locked and ready for production.</div>
                    )}
                  </div>

                  {/* KNOWLEDGE VAULT BADGE */}
                  <div className="mt-8 flex items-center justify-center">
                    <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-full px-4 py-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-600/80" />
                      <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500">{unmappedCount} additional insights saved to Knowledge Vault</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ==================== POPULATED / ACTIVATED STATE ==================== */}
            {activeMenu === 'knowledge' && (ingestionState === 'populated' || ingestionState === 'draft') && (
              <div className="max-w-2xl mx-auto animate-in fade-in duration-300">

                {/* Source File Card */}
                <div className="bg-neutral-800/40 border border-neutral-800 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-neutral-900/20 border border-neutral-800 rounded-lg flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-neutral-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white">Q2_Brand_Book_Final.pdf</h3>
                        <p className="text-xs font-light text-neutral-500 mt-1">
                          Ingested 9 Apr 2026 &middot; {mappedCount + unmappedCount} total insights ({mappedCount} mapped, {unmappedCount} unmapped)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowReIngestConfirm(true)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs hover:bg-neutral-700 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw size={12} /> Re-ingest
                    </button>
                  </div>
                </div>

                {/* Draft Resume Button */}
                {ingestionState === 'draft' && (
                  <button
                    onClick={resumeReview}
                    className="w-full mb-6 py-3 rounded-xl bg-neutral-800/40 border border-neutral-700/50 text-neutral-400 text-sm font-medium hover:bg-neutral-800/60 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit3 size={14} /> Continue Review &rarr;
                  </button>
                )}

                {/* Pillar Coverage Summary */}
                <div className="space-y-2 mb-6">
                  {[
                    { id: 'dna', label: 'Brand DNA', coverage: getDnaCoverage(), locked: locks.dna },
                    { id: 'identity', label: 'Brand Identity', coverage: getIdentityCoverage(), locked: locks.identity },
                    { id: 'tonality', label: 'Brand Tonality', coverage: getTonalityCoverage(), locked: locks.tonality }
                  ].map((pillar) => (
                    <div key={pillar.id} className="flex items-center justify-between border border-neutral-800/60 bg-neutral-900/20 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        {pillar.locked ? (
                          <CheckCircle2 size={16} className="text-neutral-500/70 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-neutral-700 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                          </div>
                        )}
                        <span className="text-sm font-light text-neutral-300">{pillar.label}</span>
                        <span className="text-[10px] font-mono text-neutral-600">{pillar.coverage.filled}/{pillar.coverage.total} fields</span>
                      </div>
                      <button
                        onClick={() => setActiveMenu(pillar.id)}
                        className="text-xs font-light text-neutral-500 hover:text-white transition-colors flex items-center gap-1"
                      >
                        Review <ArrowRight size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Knowledge Vault Section */}
                <div className="border border-neutral-800/60 bg-neutral-900/20 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowVault(!showVault)}
                    className="w-full flex items-center justify-between p-4 hover:bg-neutral-950/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-600/80" />
                      <span className="text-sm font-light text-neutral-300">Knowledge Vault</span>
                      <span className="text-[10px] font-mono text-neutral-600">{unmappedCount} unmapped insights</span>
                    </div>
                    <ChevronDown size={14} className={`text-neutral-500 transition-transform ${showVault ? 'rotate-180' : ''}`} />
                  </button>

                  {/* ==================== KNOWLEDGE VAULT VIEWER (V1.0) ==================== */}
                  {showVault && (
                    <div className="border-t border-neutral-800/50">
                      {/* Search Bar */}
                      <div className="p-4 border-b border-neutral-800/30">
                        <div className="flex items-center bg-neutral-900/20 border border-neutral-800/50 rounded-lg px-4 py-2.5 focus-within:border-neutral-700 transition-colors">
                          <Search size={14} className="text-neutral-600 mr-3 shrink-0" />
                          <input
                            value={vaultSearch}
                            onChange={(e) => setVaultSearch(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-sm font-light text-white placeholder-neutral-600"
                            placeholder="Search brand knowledge (e.g., 'rules about humor', 'logo clearspace')"
                          />
                          {vaultSearch && (
                            <button onClick={() => setVaultSearch('')} className="text-neutral-600 hover:text-white transition-colors"><X size={14} /></button>
                          )}
                        </div>
                      </div>

                      {/* Cluster Filter Chips */}
                      <div className="px-4 py-3 border-b border-neutral-800/30 flex flex-wrap gap-2">
                        {['All', 'Mapped', 'Unmapped', ...getVaultClusterLabels()].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => toggleVaultFilter(filter)}
                            className={`px-3 py-1 rounded-full text-[10px] font-mono tracking-wide transition-colors border ${
                              vaultActiveFilters.includes(filter)
                                ? 'bg-white/10 text-white border-white/20'
                                : 'bg-transparent text-neutral-500 border-neutral-800 hover:text-neutral-300 hover:border-neutral-700'
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>

                      {/* Add Note + Actions Bar */}
                      <div className="px-4 py-3 border-b border-neutral-800/30 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-neutral-600">{getFilteredVaultChunks().length} results</span>
                        <button
                          onClick={() => setShowAddNote(!showAddNote)}
                          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                        >
                          <StickyNote size={12} /> Add Note
                        </button>
                      </div>

                      {/* Add Note Input */}
                      {showAddNote && (
                        <div className="px-4 py-3 border-b border-neutral-800/30">
                          <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="w-full bg-neutral-800/40 border border-neutral-800/50 rounded-lg px-4 py-3 text-sm font-light text-white placeholder-neutral-600 outline-none resize-none focus:border-neutral-700 transition-colors"
                            placeholder="Add a manual note (meeting notes, client call notes, ad hoc context)..."
                            rows={3}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => { setShowAddNote(false); setNewNote(''); }} className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 text-xs hover:bg-neutral-700 transition-colors">Cancel</button>
                            <button onClick={addManualNote} disabled={!newNote.trim()} className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">Save Note</button>
                          </div>
                        </div>
                      )}

                      {/* Chunk List */}
                      <div className="max-h-[400px] overflow-y-auto">
                        {getFilteredVaultChunks().length === 0 ? (
                          <div className="p-8 text-center">
                            <span className="text-sm text-neutral-600">No matching insights found.</span>
                          </div>
                        ) : (
                          getFilteredVaultChunks().map((chunk) => (
                            <div key={chunk.id} className={`px-4 py-4 border-b border-neutral-800/20 hover:bg-neutral-900/30 transition-colors ${chunk.pinned ? 'bg-neutral-800/40' : ''}`}>
                              <div className="flex items-start gap-3">
                                {/* Pin indicator */}
                                {chunk.pinned && (
                                  <Star size={12} className="text-neutral-500 mt-1 shrink-0 fill-neutral-500" />
                                )}

                                <div className="flex-1 min-w-0">
                                  {/* Chunk header */}
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className={`text-[10px] font-mono tracking-wide px-1.5 py-0.5 rounded border ${getLabelColor(chunk.label)}`}>
                                      {chunk.label}
                                    </span>
                                    {chunk.mapped && chunk.pillar && chunk.field && (
                                      <span className="flex items-center gap-1 text-[10px] text-neutral-600">
                                        <CornerDownRight size={10} /> {chunk.pillar} &rarr; {chunk.field}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-neutral-700 ml-auto shrink-0">
                                      {chunk.source}{chunk.page ? `, p.${chunk.page}` : ''}
                                    </span>
                                  </div>

                                  {/* Chunk text */}
                                  {editingChunkId === chunk.id ? (
                                    <div>
                                      <textarea
                                        value={editingChunkText}
                                        onChange={(e) => setEditingChunkText(e.target.value)}
                                        className="w-full bg-neutral-900/20 border border-neutral-800/50 rounded-lg px-3 py-2 text-sm font-light text-white outline-none resize-none focus:border-neutral-700 transition-colors"
                                        rows={3}
                                      />
                                      <div className="flex gap-2 mt-2">
                                        <button onClick={() => setEditingChunkId(null)} className="px-2 py-1 text-[10px] text-neutral-500 hover:text-white transition-colors">Cancel</button>
                                        <button onClick={saveEditChunk} className="px-2 py-1 text-[10px] text-white bg-neutral-800 rounded hover:bg-neutral-700 transition-colors">Save</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p
                                      onClick={() => setExpandedChunkId(expandedChunkId === chunk.id ? null : chunk.id)}
                                      className={`text-sm font-light text-neutral-400 leading-relaxed cursor-pointer ${expandedChunkId === chunk.id ? '' : 'line-clamp-3'}`}
                                    >
                                      {chunk.text}
                                    </p>
                                  )}

                                  {/* Chunk actions */}
                                  {editingChunkId !== chunk.id && (
                                    <div className="flex items-center gap-4 mt-3">
                                      {/* Promote */}
                                      <div className="relative">
                                        <button
                                          onClick={() => setShowPromoteDropdown(showPromoteDropdown === chunk.id ? null : chunk.id)}
                                          className="flex items-center gap-1 text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors"
                                        >
                                          <Sparkles size={10} /> Promote
                                        </button>
                                        {showPromoteDropdown === chunk.id && (
                                          <div className="absolute bottom-full left-0 mb-1 bg-neutral-800/40 border border-neutral-800 rounded-lg shadow-2xl py-1 z-20 min-w-[200px]">
                                            {Object.entries(PILLAR_FIELDS).map(([pillar, fields]) => (
                                              <div key={pillar}>
                                                <div className="px-3 py-1.5 text-[10px] font-mono tracking-widest text-neutral-600 uppercase">{pillar}</div>
                                                {fields.map((field) => (
                                                  <button
                                                    key={field}
                                                    onClick={() => promoteChunk(chunk.id, pillar, field)}
                                                    className="w-full text-left px-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-900/50 transition-colors"
                                                  >
                                                    {field}
                                                  </button>
                                                ))}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <button onClick={() => startEditChunk(chunk.id)} className="flex items-center gap-1 text-[10px] text-neutral-600 hover:text-white transition-colors">
                                        <Edit3 size={10} /> Edit
                                      </button>
                                      <button onClick={() => togglePinChunk(chunk.id)} className="flex items-center gap-1 text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors">
                                        <Star size={10} className={chunk.pinned ? 'fill-neutral-500 text-neutral-500' : ''} /> {chunk.pinned ? 'Unpin' : 'Pin'}
                                      </button>
                                      <button onClick={() => deleteChunk(chunk.id)} className="flex items-center gap-1 text-[10px] text-neutral-600 hover:text-red-400 transition-colors">
                                        <Trash2 size={10} /> Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== MANUAL SETUP VIEWS ==================== */}

            {activeMenu === 'tonality' && ingestionState !== 'review' && (
              <div className="max-w-4xl mx-auto animate-in fade-in duration-300 space-y-6">

                {/* ARCHETYPE BUBBLE MAP */}
                <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 transition-colors">
                  <div className="mb-5">
                    <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-1">Brand Archetype *</label>
                    <p className="text-xs text-neutral-600">Select the psychological profile that best represents this brand.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {ARCHETYPE_QUADRANTS.map((quad) => (
                      <div key={quad.label} className={`rounded-xl border ${quad.border} ${quad.bg} p-4`}>
                        <div className="mb-3">
                          <span className={`text-[10px] font-mono tracking-widest uppercase font-semibold ${quad.color}`}>{quad.label}</span>
                          <span className="text-[10px] text-neutral-600 ml-2">{quad.sublabel}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {quad.archetypes.map((arch) => {
                            const isSelected = formData.tonality.archetype === arch;
                            return (
                              <button
                                key={arch}
                                onClick={() => handleFieldEdit('tonality', 'archetype', arch)}
                                className={`px-3 py-1.5 rounded-full text-xs font-light border transition-all ${
                                  isSelected
                                    ? `${quad.selectedBg} text-white font-medium shadow-sm`
                                    : `border-neutral-800/60 text-neutral-400 hover:text-white hover:border-neutral-600 bg-transparent`
                                }`}
                              >
                                {arch.replace('The ', '')}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {formData.tonality.archetype && (
                    <p className="mt-4 text-[10px] text-neutral-500 font-mono">
                      Selected: <span className="text-white">{formData.tonality.archetype}</span>
                    </p>
                  )}
                </div>

                {/* TARGET AUDIENCE + KEY PHRASES */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 transition-colors">
                    <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-1">Target Audience Context</label>
                    <p className="text-xs text-neutral-600 mb-4">Audience overlap for voice generation.</p>
                    <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                      {formData.tonality.target ? formData.tonality.target.split(',').map((tag, i) => (
                        <span key={i} className="bg-neutral-950 text-neutral-300 text-[10px] font-mono tracking-wide px-2 py-1 rounded border border-neutral-800 flex items-center gap-1.5">
                          {tag.trim()}<X size={12} className="cursor-pointer hover:text-white transition-colors" />
                        </span>
                      )) : null}
                      <input className="bg-transparent border-none outline-none text-sm font-light text-white flex-1 min-w-[120px]" placeholder="Add segment..." />
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 transition-colors">
                    <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-1">Key Phrases</label>
                    <p className="text-xs text-neutral-600 mb-4">Words that define what the brand talks about.</p>
                    <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                      {formData.tonality.phrases ? formData.tonality.phrases.split(',').map((tag, i) => (
                        <span key={i} className="bg-neutral-950 text-neutral-300 text-[10px] font-mono tracking-wide px-2 py-1 rounded border border-neutral-800 flex items-center gap-1.5">
                          {tag.trim()}<X size={12} className="cursor-pointer hover:text-white transition-colors" />
                        </span>
                      )) : null}
                    </div>
                  </div>
                </div>

                {/* VOICE TONE + TONE DESCRIPTORS */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 transition-colors">
                    <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-1">Voice Tone</label>
                    <p className="text-xs text-neutral-600 mb-4">Attitudinal — how the brand feels emotionally</p>
                    <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                      {formData.tonality.voiceTone ? formData.tonality.voiceTone.split(',').map((tag, i) => (
                        <span key={i} className="bg-violet-400/10 text-violet-300 text-[10px] font-mono tracking-wide px-2 py-1 rounded border border-violet-400/20 flex items-center gap-1.5">
                          {tag.trim()}<X size={12} className="cursor-pointer hover:text-white transition-colors" />
                        </span>
                      )) : null}
                      <input className="bg-transparent border-none outline-none text-sm font-light text-white flex-1 min-w-[120px]" placeholder="e.g. Confident, Warm, Direct..." />
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 transition-colors">
                    <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-1">Tone Descriptors</label>
                    <p className="text-xs text-neutral-600 mb-4">Lexical — how the brand writes stylistically</p>
                    <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                      {formData.tonality.toneDescriptors ? formData.tonality.toneDescriptors.split(',').map((tag, i) => (
                        <span key={i} className="bg-teal-400/10 text-teal-300 text-[10px] font-mono tracking-wide px-2 py-1 rounded border border-teal-400/20 flex items-center gap-1.5">
                          {tag.trim()}<X size={12} className="cursor-pointer hover:text-white transition-colors" />
                        </span>
                      )) : null}
                      <input className="bg-transparent border-none outline-none text-sm font-light text-white flex-1 min-w-[120px]" placeholder="e.g. Minimalist, Punchy, Poetic..." />
                    </div>
                  </div>
                </div>

                {/* FORBIDDEN WORDS */}
                <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 transition-colors">
                  <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-1">Forbidden Words</label>
                  <p className="text-xs text-neutral-600 mb-4">Words the AI must never use.</p>
                  <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                    {formData.tonality.forbidden ? formData.tonality.forbidden.split(',').map((tag, i) => (
                      <span key={i} className="bg-red-400/10 text-red-300 text-[10px] font-mono tracking-wide px-2 py-1 rounded border border-red-400/20 flex items-center gap-1.5">
                        {tag.trim()}<X size={12} className="cursor-pointer hover:text-white transition-colors" />
                      </span>
                    )) : null}
                    <input className="bg-transparent border-none outline-none text-sm font-light text-white flex-1 min-w-[120px]" placeholder="Add word..." />
                  </div>
                </div>

                {/* Vibe Check — all 6 fields */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/20 overflow-hidden shadow-xl">
                  <div className="p-3 border-b border-neutral-800/50 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-medium text-neutral-300 flex items-center gap-2"><MessageSquare size={14}/> Vibe Check</span>
                      <span className="text-[10px] text-neutral-600 mt-0.5 block">Generated from all 6 tonality fields</span>
                    </div>
                    <button
                      onClick={generateVibeCheck} disabled={isGeneratingVibe}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs flex items-center gap-1.5 hover:bg-neutral-700 hover:text-white transition-colors"
                    >
                      {isGeneratingVibe ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />} Generate
                    </button>
                  </div>
                  <div className="p-4 min-h-[80px] flex items-center justify-center">
                    {isGeneratingVibe ? (
                      <RefreshCw size={16} className="animate-spin text-neutral-500" />
                    ) : vibeResult ? (
                      <p className="text-sm font-light text-neutral-300 italic border-l border-neutral-700 pl-3">{vibeResult}</p>
                    ) : (
                      <span className="text-xs text-neutral-600">Generate a sample post to validate tone across archetype, voice, descriptors, and key phrases.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'identity' && ingestionState !== 'review' && (
              <div className="max-w-4xl mx-auto animate-in fade-in duration-300 space-y-8">
                <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 transition-colors">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-sm font-medium text-white">Color Palettes *</h3>
                      <p className="text-xs text-neutral-500 mt-1">Define the exact hex codes for AI generation.</p>
                    </div>
                    <button onClick={addColor} className="px-4 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors shadow-sm">Add</button>
                  </div>
                  <div className="space-y-5">
                    {formData.identity.colors.map((color) => (
                      <div key={color.id} className="space-y-2">
                        <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase">{color.label}</label>
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg border border-neutral-700/50 shrink-0" style={{ backgroundColor: color.hex || '#000000' }} />
                          <div className="flex-1 flex items-center bg-neutral-800/40 border border-neutral-800/50 rounded-lg px-4 py-3">
                            <input value={color.hex} onChange={(e) => updateColor(color.id, e.target.value)} className="bg-transparent border-none outline-none text-sm font-mono text-neutral-300 w-full uppercase" />
                            {!['Primary Color', 'Secondary Color', 'Accent Color'].includes(color.label) && (
                              <button onClick={() => removeColor(color.id)} className="ml-2 text-neutral-600 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 transition-colors">
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-neutral-800/50">
                    <div>
                      <h3 className="text-sm font-medium text-white">Font</h3>
                      <p className="text-xs text-neutral-500 mt-1">Upload custom font files for this brand.</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors">Upload</button>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Typography Rules</h3>
                  </div>
                  <div className="space-y-3">
                    {formData.identity.typography.map((type) => (
                      <div key={type.id} className="flex items-center gap-4 group">
                        <div className="w-1/4">
                          <div className="bg-neutral-800/40 border border-neutral-800/50 rounded-lg px-3 py-2.5">
                            <select className="w-full bg-transparent border-none outline-none text-sm font-light text-neutral-300 appearance-none cursor-pointer">
                              <option>{type.hierarchy}</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex-1 flex gap-2">
                          <div className="flex-1 bg-neutral-800/40 border border-neutral-800/50 rounded-lg px-4 py-2.5">
                            <input value={type.font} onChange={(e) => updateTypeFont(type.id, e.target.value)} className="w-full bg-transparent border-none outline-none text-sm font-light text-neutral-300" />
                          </div>
                          <div className="w-20 bg-neutral-800/40 border border-neutral-800/50 rounded-lg px-4 py-2.5">
                            <input value={type.size} onChange={(e) => updateTypeSize(type.id, e.target.value)} className="w-full bg-transparent border-none outline-none text-sm font-mono text-neutral-300 text-center" />
                          </div>
                          <button onClick={() => removeType(type.id)} className="w-10 flex items-center justify-center rounded-lg border border-neutral-800/50 bg-neutral-800/40 text-neutral-600 hover:text-red-400 hover:border-red-900/50 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 transition-colors">
                    <h3 className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Things To Do</h3>
                    <div className="flex gap-3 mb-6 mt-4">
                      <div className="flex-1 bg-neutral-800/40 border border-neutral-800/50 rounded-lg px-4 py-2.5">
                        <input value={newDo} onChange={(e) => setNewDo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addDo()} className="w-full bg-transparent border-none outline-none text-sm font-light text-white" placeholder="Add a rule..." />
                      </div>
                      <button onClick={addDo} className="px-5 py-2.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors">Add</button>
                    </div>
                    <div className="space-y-3">
                      {formData.identity.dos.map((rule, i) => (
                        <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-neutral-800/30 last:border-0 group">
                          <p className="text-sm font-light text-white leading-relaxed">{rule}</p>
                          <button onClick={() => removeDo(i)} className="text-xs font-light text-neutral-600 hover:text-red-400 transition-colors pt-0.5">Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 transition-colors">
                    <h3 className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Things To Avoid</h3>
                    <div className="flex gap-3 mb-6 mt-4">
                      <div className="flex-1 bg-neutral-800/40 border border-neutral-800/50 rounded-lg px-4 py-2.5">
                        <input value={newDont} onChange={(e) => setNewDont(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addDont()} className="w-full bg-transparent border-none outline-none text-sm font-light text-white" placeholder="Add a constraint..." />
                      </div>
                      <button onClick={addDont} className="px-5 py-2.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors">Add</button>
                    </div>
                    <div className="space-y-3">
                      {formData.identity.donts.map((rule, i) => (
                        <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-neutral-800/30 last:border-0 group">
                          <p className="text-sm font-light text-white leading-relaxed">{rule}</p>
                          <button onClick={() => removeDont(i)} className="text-xs font-light text-neutral-600 hover:text-red-400 transition-colors pt-0.5">Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'dna' && ingestionState !== 'review' && (
               <div className="max-w-4xl mx-auto animate-in fade-in duration-300 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 flex flex-col transition-colors">
                    <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-1">Mission *</label>
                    <p className="text-xs text-neutral-500 mb-4">The brand's core purpose and reason for existing.</p>
                    <textarea value={formData.dna.mission} onChange={(e) => handleFieldEdit('dna', 'mission', e.target.value)} className="w-full flex-1 bg-transparent border-none outline-none text-sm font-light text-white resize-none leading-relaxed" rows={4} />
                  </div>
                  <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 flex flex-col transition-colors">
                    <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-1">Vision</label>
                    <p className="text-xs text-neutral-500 mb-4">The future state the brand wants to achieve.</p>
                    <textarea value={formData.dna.vision} onChange={(e) => handleFieldEdit('dna', 'vision', e.target.value)} className="w-full flex-1 bg-transparent border-none outline-none text-sm font-light text-white resize-none leading-relaxed" rows={4} />
                  </div>
                </div>
                <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 transition-colors">
                  <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-1">Target Audience</label>
                  <div className="min-h-[40px] flex flex-wrap gap-2 items-center mt-4">
                    {formData.dna.target ? formData.dna.target.split(',').map((tag, i) => (
                      <span key={i} className="bg-neutral-950 text-neutral-300 text-[10px] font-mono tracking-wide px-2 py-1 rounded border border-neutral-800 flex items-center gap-1.5">
                        {tag.trim()}<X size={12} className="cursor-pointer hover:text-white transition-colors" />
                      </span>
                    )) : null}
                    <input className="bg-transparent border-none outline-none text-sm font-light text-white flex-1 min-w-[120px]" placeholder="Add segment..." />
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-6">
                  <div className="col-span-2 rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 transition-colors">
                    <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-5">Competitors</label>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-2">Direct</label>
                        <input value={formData.dna.competitors} onChange={(e) => handleFieldEdit('dna', 'competitors', e.target.value)} className="w-full bg-transparent border-b border-neutral-800/50 pb-2 outline-none text-sm font-light text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-6 flex flex-col transition-colors">
                    <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-4">Market Positioning</label>
                    <textarea value={formData.dna.positioning} onChange={(e) => handleFieldEdit('dna', 'positioning', e.target.value)} className="w-full flex-1 bg-transparent border-none outline-none text-sm font-light text-white resize-none leading-relaxed" />
                  </div>
                </div>
              </div>
            )}

            {/* FOOTER BRANDING */}
            <div className="absolute bottom-4 right-8 pointer-events-none">
               <span className="text-[10px] text-neutral-600 font-mono tracking-widest">frndOS // SECURE WORKSPACE</span>
            </div>

          </div>

          {/* FIXED BOTTOM BAR (Review state) */}
          {activeMenu === 'knowledge' && ingestionState === 'review' && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-neutral-800/40 p-4 px-8 flex justify-between items-center shrink-0 h-16">
              <button
                onClick={handleSaveDraft}
                className="text-sm font-light text-neutral-400 hover:text-white transition-colors"
              >
                Save as Draft
              </button>

              <div className="flex items-center gap-4">
                {!(locks.dna && locks.identity && locks.tonality) && (
                  <span className="text-xs font-light text-neutral-500 flex items-center gap-1.5">
                    <AlertCircle size={14} /> Lock all pillars to activate
                  </span>
                )}
                <button
                  onClick={handleActivate}
                  disabled={!(locks.dna && locks.identity && locks.tonality)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    locks.dna && locks.identity && locks.tonality
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                  }`}
                >
                  Save & Activate Brand
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
