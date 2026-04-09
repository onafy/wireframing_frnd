import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, Command, Maximize2, Minimize2, PanelRightClose,
  MoreHorizontal, Copy, RefreshCcw, Edit2,
  GitBranch, Send, Settings, Share, ChevronRight, FileText,
  Clock, Sparkles, History, Image as ImageIcon, Video, X, BarChart2,
  Link2, Users, Download, Trash2, PenLine,
  Sliders, Brain, ChevronDown, MessageCircle, Layers,
  Palette, LayoutGrid, Upload, Globe, Lightbulb,
  Eye, Zap, Timer, Link
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────
type PanelState = 'closed' | 'narrow' | 'split' | 'fullscreen'
type ModalType  = 'none' | 'settings' | 'history' | 'files' | 'share'
type PageId     = 'chat' | 'brand-insight' | 'documents' | 'studio'

interface Widget { id: string; title: string }
interface ModelOption { id: string; name: string; tag: string }

interface CommandItem {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
}

interface HistorySession {
  id: string
  title: string
  date: string
  brand: string
  timeGroup: 'today' | 'older'
  pillarId: PageId
  branchedFrom?: string
  linkShared?: boolean
}
interface MockAsset { id: number; type: 'image' | 'video'; aspect: string; name: string }

interface Message {
  id: number
  role: 'user' | 'assistant' | 'branch-divider'
  content: string
  model: string
  context?: Widget[]
  toolUsed?: string
  branchOriginTitle?: string
  responseTime?: number
  creditsUsed?: number
}

// ── Component ──────────────────────────────────────────────────────
export default function AskFrndPage() {
  // Core UI State
  const [isCmdKOpen, setIsCmdKOpen] = useState(false)
  const [panelState, setPanelState] = useState<PanelState>('closed')
  const [searchQuery, setSearchQuery] = useState('')
  const [inputText, setInputText] = useState('')
  const [activeChatModel, setActiveChatModel] = useState('Gemini 3.1 Pro')
  const [activeImageModel, setActiveImageModel] = useState('Nano Banana 2')
  const [activeVideoModel, setActiveVideoModel] = useState('Kling v3')
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [showAllModels, setShowAllModels] = useState(true)
  const [sharedMessageId, setSharedMessageId] = useState<number | null>(null)
  const [, setActiveTab] = useState<string>('thread')
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false)
  const [selectedContext, setSelectedContext] = useState<Widget[]>([])
  const [activeModal, setActiveModal] = useState<ModalType>('none')
  useState(false)
  const [activePage, setActivePage] = useState<PageId>('brand-insight')

  // Settings State
  const [chatMemoryEnabled, setChatMemoryEnabled] = useState(false)
  const [chatHistoryRefEnabled, setChatHistoryRefEnabled] = useState(false)

  // Share State
  const [liveChatEnabled, setLiveChatEnabled] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  // History filter
  const [historyTab, setHistoryTab] = useState<'yours' | 'shared'>('yours')
  const [historySearch, setHistorySearch] = useState('')
  const [historyPillarFilter, setHistoryPillarFilter] = useState<'all' | PageId>('brand-insight')

  // Generated Files filter
  const [filesFilter, setFilesFilter] = useState<'all' | 'image' | 'video'>('all')

  // Branch flow
  const [branchingFromMsgId, setBranchingFromMsgId] = useState<number | null>(null)
  const [branchOriginTitle, setBranchOriginTitle] = useState('')
  const [isAnswering, setIsAnswering] = useState(false)

  // History drawer — active brand context + per-brand collapsed state
  const [activeBrand] = useState<string>('Nike')
  const [collapsedBrands, setCollapsedBrands] = useState<Set<string>>(new Set())

  // Per-message action menu state
  const [openMenuMsgId, setOpenMenuMsgId] = useState<number | null>(null)

  // Omnibar input (floating bar)
  const [omnibarText, setOmnibarText] = useState('')

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const omnibarRef = useRef<HTMLTextAreaElement>(null)
  const cmdKInputRef = useRef<HTMLInputElement>(null)

  // ── Mock Data ────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', content: "What insight are we working on?", model: 'Gemini 3.1 Pro' }
  ])

  // Full model catalogue — Chat / Image / Video
  // Cap icon map for chat models
  const capIcons: Record<string, React.ReactNode> = {
    thinking: <Lightbulb size={10} className="text-neutral-500" />,
    vision:   <Eye size={10} className="text-neutral-500" />,
    doc:      <FileText size={10} className="text-neutral-500" />,
    web:      <Globe size={10} className="text-neutral-500" />,
  }

  const allModels = {
    chat: [
      { id: 'gemini-flash',  name: 'Gemini 3 Flash',    desc: 'Lightweight, fast for chat and easy task',     tag: '/gemini-flash',  caps: ['thinking','vision','doc','web'] },
      { id: 'gemini-pro',    name: 'Gemini 3.1 Pro',    desc: 'Latest powerful gemini model',                 tag: '/gemini',        caps: ['thinking','vision','doc','web'] },
      { id: 'gpt52',         name: 'GPT 5.2',            desc: 'OpenAI best and fast chat model',              tag: '/gpt5',          caps: ['thinking','vision','doc','web'] },
      { id: 'gpt52pro',      name: 'GPT 5.2 Pro',        desc: 'Best OpenAI model for complex task',           tag: '/gpt5pro',       caps: ['thinking','vision','doc','web'] },
      { id: 'deepseek',      name: 'DeepSeek V3.2',      desc: 'Best Deepseek model for chat',                 tag: '/deepseek',      caps: ['thinking','doc','web'] },
      { id: 'claude-sonnet', name: 'Claude Sonnet 4.6',  desc: 'Best Claude model for general task',           tag: '/claude',        caps: ['vision','doc','web'] },
      { id: 'claude-opus',   name: 'Claude Opus 4.6',    desc: 'Claude most intelligent model',                tag: '/opus',          caps: ['vision','doc','web'] },
    ],
    image: [
      { id: 'gpt-image',  name: 'GPT Image 1.5',      desc: 'New! Flagship OpenAI image model',              tag: '/gpt-img' },
      { id: 'nb1pro',     name: 'Nano Banana 1 Pro',   desc: 'Most powerful model for image editing',         tag: '/nb1pro' },
      { id: 'nb2',        name: 'Nano Banana 2',       desc: 'Fast and affordable Gemini image model',        tag: '/nb2' },
      { id: 'flux',       name: 'Flux Kontext Pro',    desc: 'High quality midjourney alternative',           tag: '/flux' },
      { id: 'seedream',   name: 'Seedream 4.5',        desc: 'Latest best image model from ByteDance',        tag: '/seedream' },
    ],
    video: [
      { id: 'sora2',       name: 'Sora 2',        desc: 'Fastest, cheapest. ~10 credits/s',                    tag: '/sora2' },
      { id: 'veo31fast',   name: 'Veo 3.1 Fast',  desc: 'Best quality but fast. ~15 credits/s',               tag: '/veo-fast' },
      { id: 'sora2pro',    name: 'Sora 2 Pro',    desc: 'Extended features. ~30 credits/s',                    tag: '/sora2pro' },
      { id: 'veo31pro',    name: 'Veo 3.1 Pro',   desc: 'The best video model. ~40 credits/s',                 tag: '/veo-pro' },
      { id: 'kling3',      name: 'Kling v3',       desc: 'Latest Kling video model. ~40 credits/s',            tag: '/kling3' },
      { id: 'kling3omni',  name: 'Kling v3 Omni', desc: 'Support video input. ~80 credits/s',                  tag: '/kling3o' },
      { id: 'hunyuan',     name: 'Hunyuan',        desc: 'High quality from Tencent. ~180 credits/video',      tag: '/hunyuan' },
    ],
  }

  // Contextual greeting per pillar — short and natural
  const contextualGreeting: Record<PageId, string> = {
    'brand-insight': "What insight are we working on?",
    'studio':        "What are we creating today?",
    'documents':     "Which document do you need help with?",
    'chat':          "Hey, how can I help?",
  }

  // Slim models list for slash command shortcut (chat only)
  const models: ModelOption[] = allModels.chat.map(m => ({ id: m.id, name: m.name, tag: m.tag }))

  // Page-aware commands
  const commandsByPage: Record<PageId, CommandItem[]> = {
    'brand-insight': [
      { id: 'ask-brand', title: 'Ask about brand', subtitle: 'Synthesize cross-referenced pitch narratives', icon: <Sparkles size={16} /> },
      { id: 'search-assets', title: 'Search pitch assets', subtitle: 'Find files, decks, and documents', icon: <Search size={16} /> },
      { id: 'new-draft', title: 'Start deep work draft', subtitle: 'Open fullscreen editor', icon: <FileText size={16} /> },
    ],
    'studio': [
      { id: 'generate-kv', title: 'Generate Key Visual', subtitle: 'Create campaign visuals from brief', icon: <ImageIcon size={16} /> },
      { id: 'edit-asset', title: 'Edit existing asset', subtitle: 'Modify colors, layout, or copy on a generated asset', icon: <Edit2 size={16} /> },
      { id: 'batch-resize', title: 'Batch resize for platforms', subtitle: 'Adapt one KV into IG, FB, TikTok formats', icon: <LayoutGrid size={16} /> },
      { id: 'style-transfer', title: 'Apply style transfer', subtitle: 'Match a reference moodboard aesthetic', icon: <Palette size={16} /> },
    ],
    'documents': [
      { id: 'summarize-doc', title: 'Summarize document', subtitle: 'Get key points from a pitch deck or brief', icon: <FileText size={16} /> },
      { id: 'draft-proposal', title: 'Draft proposal', subtitle: 'Generate a client proposal from notes', icon: <Sparkles size={16} /> },
      { id: 'compare-versions', title: 'Compare versions', subtitle: 'Diff two document revisions side by side', icon: <GitBranch size={16} /> },
    ],
    'chat': [
      { id: 'ask-brand', title: 'Ask anything', subtitle: 'General purpose AI assistant', icon: <Sparkles size={16} /> },
      { id: 'search-assets', title: 'Search workspace', subtitle: 'Find files, chats, and assets across projects', icon: <Search size={16} /> },
      { id: 'new-draft', title: 'Start deep work draft', subtitle: 'Open fullscreen editor', icon: <FileText size={16} /> },
    ],
  }
  const commands = commandsByPage[activePage]

  // Page-specific chat mode labels
  const chatModeLabel: Record<PageId, string> = {
    'brand-insight': 'AskFRnD',
    'studio': 'Studio Assistant',
    'documents': 'Doc Assistant',
    'chat': 'General Chat',
  }
  const chatModeSubtitle: Record<PageId, string> = {
    'brand-insight': 'Insight Mode',
    'studio': 'Creative Mode',
    'documents': 'Document Mode',
    'chat': 'Global Mode',
  }

  // Studio mock projects
  const studioProjects = [
    { id: 'sp1', title: 'Telkomsel Cashback KV', status: 'In Progress', assets: 4, updated: '2 hours ago' },
    { id: 'sp2', title: 'Nike Q3 Social Pack', status: 'Review', assets: 12, updated: '1 day ago' },
    { id: 'sp3', title: 'Apple Keynote Slides', status: 'Draft', assets: 6, updated: '3 days ago' },
    { id: 'sp4', title: 'Internal Brand Guidelines', status: 'Completed', assets: 18, updated: '1 week ago' },
  ]

  // Documents mock
  const mockDocuments = [
    { id: 'd1', title: 'Nike Q3 Pitch Deck v2.1', type: 'Pitch Deck', updated: 'Today', pages: 24 },
    { id: 'd2', title: 'Telkomsel Campaign Brief', type: 'Brief', updated: 'Yesterday', pages: 8 },
    { id: 'd3', title: 'Apple Q4 Media Plan', type: 'Media Plan', updated: '3 days ago', pages: 12 },
    { id: 'd4', title: 'Brand Voice Guidelines', type: 'Guidelines', updated: '1 week ago', pages: 32 },
    { id: 'd5', title: 'FRnD Product Roadmap', type: 'Roadmap', updated: '2 weeks ago', pages: 16 },
  ]

  const historySessions: HistorySession[] = [
    { id: 'h0', title: 'Mengatasi Distorsi Wajah pada AI Video',              date: '13 minutes ago',    brand: 'Telkomsel',  timeGroup: 'today',  pillarId: 'studio',        branchedFrom: 'Layered 15-Second Promo Animation for Telkomsel' },
    { id: 'h7', title: 'Layered 15-Second Promo Animation for Telkomsel',     date: '15 minutes ago',   brand: 'Telkomsel',  timeGroup: 'today',  pillarId: 'studio'         },
    { id: 'h6', title: 'Edit KV: Model Laki-Laki dengan Outfit Sama',         date: 'about 1 month ago', brand: 'Telkomsel',  timeGroup: 'older',  pillarId: 'studio',        linkShared: true },
    { id: 'h10',title: 'Cinematic Slow-Motion Product Reveal in Snow',       date: 'about 2 months ago',brand: 'Apple',      timeGroup: 'older',  pillarId: 'studio'         },
    { id: 'h11',title: 'Cinematic 16:9 Slow-Motion Product Reveal',         date: 'about 2 months ago',brand: 'Apple',     timeGroup: 'older',  pillarId: 'studio'         },
    { id: 'h1', title: 'Visual Moodboard Sync',                               date: '2 days ago',        brand: 'Nike',       timeGroup: 'older',  pillarId: 'brand-insight'  },
    { id: 'h2', title: 'Target Demographic Analysis',                          date: '3 days ago',        brand: 'Nike',       timeGroup: 'older',  pillarId: 'brand-insight'  },
    { id: 'h3', title: 'Competitor Brand Voice',                               date: '1 week ago',        brand: 'Nike',       timeGroup: 'older',  pillarId: 'brand-insight'  },
    { id: 'h4', title: 'Keynote Storytelling',                                date: '1 week ago',        brand: 'Apple',      timeGroup: 'older',  pillarId: 'brand-insight'  },
    { id: 'h13',title: 'Nike Q3 Pitch Deck — Content Review',                date: '4 days ago',        brand: 'Nike',       timeGroup: 'older',  pillarId: 'documents'      },
    { id: 'h14',title: 'Telkomsel Campaign Brief Summary',                  date: '5 days ago',        brand: 'Telkomsel',  timeGroup: 'older',  pillarId: 'documents'      },
    { id: 'h12',title: 'Sejarah Pembentukan Future Creative Network (FCN)', date: 'about 2 months ago',brand: 'FRnD',      timeGroup: 'older',  pillarId: 'chat'           },
    { id: 'h8', title: 'UI Paradigm Research',                                date: '2 months ago',      brand: 'FRnD',       timeGroup: 'older',  pillarId: 'chat'           },
    { id: 'h9', title: 'Monochrome Aesthetic Guidelines',                   date: '2 months ago',      brand: 'FRnD',       timeGroup: 'older',  pillarId: 'chat'           },
  ]

  const mockAssets: MockAsset[] = [
    { id: 1, type: 'image', aspect: 'aspect-square', name: 'KV_Telkomsel_01.png' },
    { id: 2, type: 'video', aspect: 'aspect-video', name: 'Promo_15s_v2.mp4' },
    { id: 3, type: 'image', aspect: 'aspect-[3/4]', name: 'Moodboard_Nike.png' },
    { id: 4, type: 'image', aspect: 'aspect-square', name: 'Brand_Palette.png' },
    { id: 5, type: 'video', aspect: 'aspect-video', name: 'Reveal_Cinematic.mp4' },
    { id: 6, type: 'image', aspect: 'aspect-square', name: 'Social_Post_IG.png' },
  ]

  const mockWidgets: Widget[] = [
    { id: 'w1', title: 'Audience Demographics' },
    { id: 'w2', title: 'Q2 Engagement Metrics' },
    { id: 'w3', title: 'Competitor Ad Spend' },
  ]

  const quickReplies = [
    'Lanjutkan dengan variasi pose berikutnya',
    'Tambahkan detail warna aksesorisnya',
    'Coba versi outfit berbeda tapi tetap tema',
  ]

  // Pillar identity maps — used in history
  const pillarIcon: Record<PageId, React.ReactNode> = {
    'brand-insight': <Layers size={10} />,
    'studio':        <Palette size={10} />,
    'documents':     <FileText size={10} />,
    'chat':          <MessageCircle size={10} />,
  }
  const pillarLabel: Record<PageId, string> = {
    'brand-insight': 'Insight',
    'studio':        'Studio',
    'documents':     'Docs',
    'chat':          'Chat',
  }
  const pillarFilterChips: Array<{ key: 'all' | PageId; label: string }> = [
    { key: 'all',           label: 'All'     },
    { key: 'brand-insight', label: 'Insight' },
    { key: 'studio',        label: 'Studio'  },
    { key: 'documents',     label: 'Docs'    },
    { key: 'chat',          label: 'Chat'    },
  ]

  // ── Derived State ────────────────────────────────────────────────

  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return commands
    const q = searchQuery.toLowerCase()
    return commands.filter(c =>
      c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q)
    )
  }, [searchQuery, activePage])

  const filteredHistory = useMemo(() => {
    let sessions = historySessions
    if (historyPillarFilter !== 'all') {
      sessions = sessions.filter(s => s.pillarId === historyPillarFilter)
    }
    if (!historySearch.trim()) return sessions
    const q = historySearch.toLowerCase()
    return sessions.filter(s => s.title.toLowerCase().includes(q))
  }, [historySearch, historyPillarFilter])

  const filteredAssets = useMemo(() => {
    if (filesFilter === 'all') return mockAssets
    return mockAssets.filter(a => a.type === (filesFilter === 'video' ? 'video' : 'image'))
  }, [filesFilter])

  // ── Handlers ─────────────────────────────────────────────────────

  const toggleWidgetContext = (widget: Widget) => {
    setSelectedContext(prev =>
      prev.find(w => w.id === widget.id)
        ? prev.filter(w => w.id !== widget.id)
        : [...prev, widget]
    )
  }

  // Auto-close floating bar when no chips and no text
  useEffect(() => {
    if (selectedContext.length === 0 && !omnibarText.trim() && panelState === 'closed') {
      // bar will not render due to condition
    }
  }, [selectedContext, omnibarText, panelState])

  // Handle Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()

        // Bypass modal if widgets are selected and panel is closed
        if (selectedContext.length > 0 && panelState === 'closed') {
          setPanelState('narrow')
          setActiveTab('thread')
          setIsHistoryDrawerOpen(false)
          // Port omnibar text to panel input
          if (omnibarText.trim()) {
            setInputText(omnibarText)
            setOmnibarText('')
          }
          setTimeout(() => inputRef.current?.focus(), 300)
        } else if (panelState !== 'closed') {
          // Close panel if already open
          setPanelState('closed')
        } else {
          setIsCmdKOpen(prev => !prev)
        }
      }
      if (e.key === 'Escape') {
        if (isCmdKOpen) setIsCmdKOpen(false)
        if (activeModal !== 'none') setActiveModal('none')
        if (openMenuMsgId !== null) setOpenMenuMsgId(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCmdKOpen, panelState, selectedContext, omnibarText, activeModal, openMenuMsgId])

  // Close message action menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (openMenuMsgId !== null) {
        const target = e.target as HTMLElement
        if (!target.closest('[data-msg-menu]')) {
          setOpenMenuMsgId(null)
        }
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openMenuMsgId])

  // Auto-focus Cmd+K input
  useEffect(() => {
    if (isCmdKOpen) {
      setTimeout(() => cmdKInputRef.current?.focus(), 50)
    } else {
      setSearchQuery('')
    }
  }, [isCmdKOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setInputText(val)
    // Slash-to-model is disabled on Brand Insight (model is locked)
    setShowSlashMenu(val.startsWith('/') && activePage !== 'brand-insight')
  }

  const selectModel = (model: ModelOption) => {
    setActiveChatModel(model.name)
    setInputText('')
    setShowSlashMenu(false)
    setShowModelPicker(false)
    inputRef.current?.focus()
    console.log('Event Logged: askfrnd_slash_command_used')
  }

  const handleCommandSelect = (cmdId: string) => {
    setIsCmdKOpen(false)
    const portedText = searchQuery.trim()

    if (cmdId === 'new-draft') {
      setPanelState('fullscreen')
      setIsHistoryDrawerOpen(false)
      setActiveTab('thread')
      if (portedText) { setInputText(portedText); setSearchQuery('') }
    } else if (cmdId === 'search-assets' || cmdId === 'search-workspace') {
      setPanelState('narrow')
      setIsHistoryDrawerOpen(false)
      setActiveTab('assets')
    } else {
      // All other commands open narrow panel with thread
      setPanelState('narrow')
      setIsHistoryDrawerOpen(false)
      setActiveTab('thread')
      if (portedText) { setInputText(portedText); setSearchQuery('') }
      console.log(`Event Logged: ${activePage}_chat_launched_via_palette`)
    }
  }

  const cyclePanelState = () => {
    if (panelState === 'narrow') {
      setPanelState('split')
      console.log('Event Logged: askfrnd_panel_expanded_to_split')
    } else if (panelState === 'split') {
      setPanelState('fullscreen')
      console.log('Event Logged: askfrnd_panel_expanded_to_fullscreen')
    } else {
      setPanelState('narrow')
    }
  }

  const handleSendMessage = (text?: string, context?: Widget[]) => {
    const msgText = text ?? inputText
    const msgContext = context ?? [...selectedContext]

    if (!msgText.trim() && msgContext.length === 0) return

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: msgText,
      model: activeChatModel,
      context: msgContext.length > 0 ? msgContext : undefined,
    }

    // Branch mode: prepend a divider before the user message
    if (branchingFromMsgId !== null) {
      const divider: Message = {
        id: Date.now() - 1,
        role: 'branch-divider',
        content: '',
        model: activeChatModel,
        branchOriginTitle: branchOriginTitle,
      }
      setMessages(prev => [...prev, divider, userMsg])
      setBranchingFromMsgId(null)
      setBranchOriginTitle('')
    } else {
      setMessages(prev => [...prev, userMsg])
    }

    setInputText('')
    setSelectedContext([])
    setOmnibarText('')
    setIsAnswering(true)

    // Simulate AI response based on page context
    const responseByPage: Record<PageId, string> = {
      'brand-insight': `The brand's core demographic leans towards minimalist aesthetics and frictionless experiences. Based on the ${msgContext.length > 0 ? msgContext.map(c => c.title).join(', ') : 'current context'}, I recommend focusing on a visual-first approach with muted tones and editorial-grade typography.`,
      'studio': `I've analyzed the creative brief. Here's what I recommend:\n\n1. **Color Palette:** Muted earth tones (#8B7355, #C4A882) with a vibrant accent (#FF6B35)\n2. **Typography:** Editorial serif for headlines, clean sans-serif for body\n3. **Layout:** Asymmetric grid with generous whitespace\n\nReady to generate when you are.`,
      'documents': `Here's a summary of the key points:\n\n- **Objective:** Increase brand awareness by 25% in Q3\n- **Target:** Urban millennials, 25-34, Tier 1 cities\n- **Budget:** Rp 1.2B across digital and OOH\n- **Timeline:** 8 weeks from creative approval\n\nWant me to draft a more detailed proposal from this?`,
      'chat': `I can help with that. Based on your recent projects across Nike Q3, Telkomsel Cashback, and Apple Q4 campaigns, here are some cross-project insights that might be useful for your question.`,
    }
    const toolByPage: Record<PageId, string | undefined> = {
      'brand-insight': msgContext.length > 0 ? 'Data Synthesis' : undefined,
      'studio': 'Creative Analysis',
      'documents': 'Document Summary',
      'chat': undefined,
    }
    setTimeout(() => {
      setIsAnswering(false)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: responseByPage[activePage],
        model: activeChatModel,
        toolUsed: toolByPage[activePage],
        responseTime: parseFloat((Math.random() * 25 + 8).toFixed(2)),
        creditsUsed:  parseFloat((Math.random() * 4 + 1).toFixed(2)),
      }])
    }, 900)
  }

  const handleBranch = (msg: Message) => {
    // Use the chat title from history or a snippet of the message content
    const snippet = msg.content.length > 55 ? msg.content.slice(0, 55) + '…' : msg.content
    // Try to find the active history session title; fall back to the snippet
    const sessionTitle = historySessions.find(s => s.id === 'h7')?.title ?? snippet
    setBranchingFromMsgId(msg.id)
    setBranchOriginTitle(sessionTitle)
    // Close quick replies by focusing input
    setTimeout(() => inputRef.current?.focus(), 50)
    console.log('Event Logged: askfrnd_message_branched')
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    handleSendMessage()
  }

  const handleOmnibarSubmit = () => {
    if (!omnibarText.trim() && selectedContext.length === 0) return
    // Capture before state changes
    const text = omnibarText
    const ctx = [...selectedContext]
    setPanelState('narrow')
    setActiveTab('thread')
    setIsHistoryDrawerOpen(false)
    // Send message after panel transition
    setTimeout(() => {
      handleSendMessage(text, ctx)
    }, 400)
  }

  const handleCopyLink = () => {
    setLinkCopied(true)
    console.log('Event Logged: askfrnd_public_link_generated')
    setTimeout(() => setLinkCopied(false), 2000)
  }

  // ── Sidebar Navigation ──────────────────────────────────────────
  const handlePageSwitch = (pageId: PageId) => {
    setActivePage(pageId)
    setHistoryPillarFilter(pageId === 'brand-insight' ? 'brand-insight' : 'all')
    // Reset context when leaving brand insight
    if (pageId !== 'brand-insight') {
      setSelectedContext([])
      setOmnibarText('')
    }
    // Close panel on page switch for clean UX
    setPanelState('closed')
    setIsHistoryDrawerOpen(false)
    // If switching to Chat, auto-open panel with contextual greeting
    if (pageId === 'chat') {
      setTimeout(() => {
        setPanelState('narrow')
        setActiveTab('thread')
        setMessages([{ id: Date.now(), role: 'assistant', content: contextualGreeting[pageId], model: activeChatModel }])
      }, 100)
    }
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#080808] text-[#e0e0e0] font-sans overflow-hidden flex flex-col selection:bg-neutral-700 selection:text-white">

      {/* ═══ TOP BAR — workspace selector + cmd+k ═══ */}
      <header className="flex-none h-11 flex items-center justify-between px-6 border-b border-neutral-800/30 bg-[#080808]">
        {/* Logo */}
        <div className="text-sm font-semibold tracking-tighter text-neutral-400">
          fr<span className="text-white">nd</span>
          <span className="text-[10px] font-mono text-neutral-600 ml-1">OS</span>
        </div>

        {/* Workspace selector */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-neutral-800/50 transition-colors">
          <div className="w-4 h-4 rounded bg-neutral-700 flex items-center justify-center text-[9px] font-bold text-white">A</div>
          <span className="text-xs text-neutral-300">Alva Intelligence</span>
          <ChevronDown size={11} className="text-neutral-600" />
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsCmdKOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-neutral-800/80 hover:bg-neutral-800/50 text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <Search size={13} />
            <kbd className="font-mono text-[10px] text-neutral-600">⌘K</kbd>
          </button>
          <button className="p-1.5 text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/50 rounded-lg transition-colors">
            <Settings size={14} />
          </button>
        </div>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex min-h-0">
        {/* Content Area — full width, no sidebar */}
        <main className={`flex-1 overflow-hidden relative transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${panelState === 'fullscreen' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <div className="h-full overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">

              {/* ── PAGE: Brand Insight ── */}
              {activePage === 'brand-insight' && (
                <>
                  <div className="mb-10">
                    <h2 className="text-2xl font-light tracking-tight text-white mb-1">Brand Insight</h2>
                    <p className="text-sm text-neutral-500 font-light">Select widgets to add context to your query.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    {mockWidgets.map(widget => {
                      const isSelected = selectedContext.some(w => w.id === widget.id)
                      return (
                        <div
                          key={widget.id}
                          onClick={() => toggleWidgetContext(widget)}
                          className={`h-44 rounded-xl border p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 group ${
                            isSelected
                              ? 'border-neutral-400 bg-neutral-800/40 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                              : 'border-neutral-800/60 bg-neutral-900/20 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-neutral-200 text-black' : 'bg-neutral-800 text-neutral-500 group-hover:bg-neutral-700 group-hover:text-neutral-400'
                            }`}>
                              <BarChart2 size={14} />
                            </div>
                            {isSelected && <div className="text-[10px] font-mono tracking-widest text-neutral-400">CONTEXT ADDED</div>}
                          </div>
                          <div className="space-y-3">
                            <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-neutral-400'}`}>{widget.title}</div>
                            <div className="space-y-1.5">
                              <div className={`h-1.5 w-3/4 rounded-full ${isSelected ? 'bg-neutral-600' : 'bg-neutral-800'}`} />
                              <div className={`h-1.5 w-1/2 rounded-full ${isSelected ? 'bg-neutral-600' : 'bg-neutral-800'}`} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* ── PAGE: Studio ── */}
              {activePage === 'studio' && (
                <>
                  <div className="mb-10">
                    <h2 className="text-2xl font-light tracking-tight text-white mb-1">Studio</h2>
                    <p className="text-sm text-neutral-500 font-light">Creative workspace. Press <kbd className="font-mono text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-300">⌘K</kbd> for AI creative tools.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {studioProjects.map(project => (
                      <div key={project.id} className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 hover:border-neutral-700 p-5 transition-all group cursor-pointer">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">{project.title}</div>
                            <div className="text-xs text-neutral-600 mt-1">{project.updated}</div>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            project.status === 'In Progress' ? 'text-amber-400 border-amber-400/30 bg-amber-400/5' :
                            project.status === 'Review' ? 'text-blue-400 border-blue-400/30 bg-blue-400/5' :
                            project.status === 'Completed' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5' :
                            'text-neutral-400 border-neutral-700 bg-neutral-800/30'
                          }`}>{project.status}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-1">
                            {Array.from({ length: Math.min(project.assets, 4) }).map((_, i) => (
                              <div key={i} className="w-8 h-8 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                                <ImageIcon size={10} className="text-neutral-600" />
                              </div>
                            ))}
                            {project.assets > 4 && (
                              <div className="w-8 h-8 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] text-neutral-500 font-mono">+{project.assets - 4}</div>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-600 font-mono">{project.assets} assets</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick action hint */}
                  <div className="flex items-center justify-center gap-3 py-8 border-t border-neutral-800/30">
                    <span className="text-xs text-neutral-600">Quick actions:</span>
                    {commandsByPage.studio.slice(0, 3).map(cmd => (
                      <button
                        key={cmd.id}
                        onClick={() => { setIsCmdKOpen(true) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-500 bg-neutral-900/50 border border-neutral-800/60 rounded-lg hover:bg-neutral-800 hover:text-neutral-300 transition-colors"
                      >
                        {cmd.icon}
                        <span>{cmd.title}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* ── PAGE: Documents ── */}
              {activePage === 'documents' && (
                <>
                  <div className="mb-10">
                    <h2 className="text-2xl font-light tracking-tight text-white mb-1">Documents</h2>
                    <p className="text-sm text-neutral-500 font-light">Pitch decks, briefs, and proposals. Press <kbd className="font-mono text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-300">⌘K</kbd> to summarize or draft.</p>
                  </div>

                  <div className="space-y-1">
                    {/* Table Header */}
                    <div className="grid grid-cols-[1fr_120px_100px_80px] gap-4 px-4 py-2 text-[10px] font-mono text-neutral-500 tracking-wider uppercase">
                      <span>Name</span>
                      <span>Type</span>
                      <span>Updated</span>
                      <span>Pages</span>
                    </div>
                    {mockDocuments.map(doc => (
                      <div key={doc.id} className="grid grid-cols-[1fr_120px_100px_80px] gap-4 px-4 py-3 rounded-lg border border-transparent hover:border-neutral-800 hover:bg-neutral-900/30 cursor-pointer transition-all group">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-neutral-600 group-hover:text-neutral-400 flex-none transition-colors" />
                          <span className="text-sm text-neutral-200 group-hover:text-white truncate transition-colors">{doc.title}</span>
                        </div>
                        <span className="text-xs text-neutral-500 self-center">{doc.type}</span>
                        <span className="text-xs text-neutral-600 self-center">{doc.updated}</span>
                        <span className="text-xs text-neutral-600 self-center font-mono">{doc.pages}p</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-3 py-8 mt-6 border-t border-neutral-800/30">
                    <span className="text-xs text-neutral-600">Quick actions:</span>
                    {commandsByPage.documents.slice(0, 3).map(cmd => (
                      <button
                        key={cmd.id}
                        onClick={() => { setIsCmdKOpen(true) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-500 bg-neutral-900/50 border border-neutral-800/60 rounded-lg hover:bg-neutral-800 hover:text-neutral-300 transition-colors"
                      >
                        {cmd.icon}
                        <span>{cmd.title}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* ── PAGE: Chat (empty state — panel is the focus) ── */}
              {activePage === 'chat' && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4">
                    <MessageCircle size={20} className="text-neutral-500" />
                  </div>
                  <h2 className="text-xl font-light tracking-tight text-white mb-2">General Chat</h2>
                  <p className="text-sm text-neutral-500 font-light max-w-md mb-6">
                    Your general purpose AI assistant. No specific context — ask anything across all your projects and brands.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <span>Chat panel is open on the right</span>
                    <span className="text-neutral-700">|</span>
                    <span>Press <kbd className="font-mono text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-300">⌘K</kbd> for commands</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>

      {/* ═══ BOTTOM NAV ═══ */}
      <nav className="flex-none h-12 border-t border-neutral-800/40 bg-[#080808] flex items-center px-8">
        {/* Left: Home */}
        <button
          onClick={() => handlePageSwitch('chat')}
          className={`text-sm px-3 py-1 transition-colors ${activePage === 'chat' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
        >Home</button>

        {/* Center: Page nav */}
        <div className="flex-1 flex items-center justify-center gap-1">
          {[
            { label: 'Insights', pageId: 'brand-insight' as PageId },
            { label: 'Studio', pageId: 'studio' as PageId },
            { label: 'Research', pageId: 'documents' as PageId },
            { label: 'Growth', pageId: 'chat' as PageId },
            { label: 'Wireframes', pageId: 'chat' as PageId },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => item.pageId !== 'chat' ? handlePageSwitch(item.pageId) : undefined}
              className={`relative text-sm px-4 py-1 transition-colors ${
                (item.pageId !== 'chat' && activePage === item.pageId)
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {item.label}
              {item.pageId !== 'chat' && activePage === item.pageId && (
                <span className="absolute bottom-0 left-4 right-4 h-px bg-white" />
              )}
            </button>
          ))}
        </div>

        {/* Right: Chat toggle + settings */}
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/50 rounded-lg transition-colors">
            <Settings size={14} />
          </button>
          <button
            onClick={() => {
              if (panelState === 'closed') {
                setPanelState('narrow')
                setActiveTab('thread')
                setIsHistoryDrawerOpen(false)
                setShowModelPicker(false)
                setMessages([{ id: Date.now(), role: 'assistant', content: contextualGreeting[activePage], model: activeChatModel }])
              } else {
                setPanelState('closed')
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              panelState !== 'closed'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Chat
          </button>
        </div>
      </nav>

      {/* ═══ FLOATING OMNIBAR ═══ */}
      {selectedContext.length > 0 && panelState === 'closed' && !isCmdKOpen && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="bg-[#111]/95 border border-neutral-700/80 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden">
            {/* Context Chips */}
            <div className="flex flex-wrap items-center gap-1.5 px-4 pt-3 pb-2">
              <span className="text-[10px] text-neutral-500 font-mono mr-1 flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                CONTEXT
              </span>
              {selectedContext.map(ctx => (
                <div key={ctx.id} className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-md text-[10px] font-mono text-neutral-300">
                  <BarChart2 size={10} className="text-neutral-500" />
                  {ctx.title}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleWidgetContext(ctx) }}
                    className="text-neutral-500 hover:text-white transition-colors ml-0.5"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>

            {/* Input Row */}
            <div className="flex items-end px-4 pb-3 gap-2">
              <textarea
                ref={omnibarRef}
                rows={1}
                value={omnibarText}
                onChange={(e) => setOmnibarText(e.target.value)}
                placeholder="Ask about these insights..."
                className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-neutral-200 placeholder-neutral-600 font-light min-h-[36px] max-h-24 py-1"
                style={{ fieldSizing: 'content' } as React.CSSProperties}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleOmnibarSubmit()
                  }
                }}
              />
              <div className="flex items-center gap-2 flex-none pb-0.5">
                <div className="text-[10px] text-neutral-500 font-mono hidden sm:flex items-center gap-1">
                  <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-300">⌘K</kbd>
                  expand
                </div>
                <button
                  onClick={handleOmnibarSubmit}
                  disabled={!omnibarText.trim() && selectedContext.length === 0}
                  className="p-2 rounded-lg bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 transition-colors"
                >
                  <Send size={14} />
                </button>
                <button
                  onClick={() => { setSelectedContext([]); setOmnibarText('') }}
                  className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  title="Clear"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CMD+K SPOTLIGHT MODAL ═══ */}
      {isCmdKOpen && activePage === 'brand-insight' && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-[#0f0f0f]/95 border border-neutral-700/80 rounded-2xl shadow-[0_-4px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl overflow-hidden">
            {/* Context chips if widgets selected */}
            {selectedContext.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-4 pt-3 pb-2 border-b border-neutral-800/50">
                <span className="text-[10px] text-neutral-500 font-mono mr-1 self-center">CONTEXT:</span>
                {selectedContext.map(ctx => (
                  <span key={ctx.id} className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-[10px] font-mono text-neutral-300">
                    <BarChart2 size={10} className="text-neutral-500" />{ctx.title}
                  </span>
                ))}
              </div>
            )}
            {/* Input row */}
            <div className="flex items-center px-4 py-3.5">
              <Command className="text-neutral-500 mr-3 flex-none" size={16} />
              <input
                ref={cmdKInputRef}
                type="text"
                placeholder="Ask about this data..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-neutral-600 text-base font-light"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) handleCommandSelect('ask-brand')
                  if (e.key === 'Escape') setIsCmdKOpen(false)
                }}
              />
              <kbd className="font-mono text-[10px] text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 flex-none">ESC</kbd>
            </div>
            {/* Compact commands — shown when no query, or filtered results */}
            <div className="border-t border-neutral-800/40 max-h-52 overflow-y-auto">
              <div className="px-4 py-2 text-[10px] font-mono text-neutral-600 tracking-wider">
                {searchQuery ? 'RESULTS' : 'SUGGESTED'}
              </div>
              <ul className="pb-2">
                {filteredCommands.map(cmd => (
                  <li key={cmd.id}>
                    <button
                      onClick={() => handleCommandSelect(cmd.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-800/50 text-left group transition-colors"
                    >
                      <div className="text-neutral-500 group-hover:text-white transition-colors flex-none">{cmd.icon}</div>
                      <div className="min-w-0">
                        <div className="text-sm text-neutral-300 group-hover:text-white leading-tight">{cmd.title}</div>
                        <div className="text-[10px] text-neutral-600 truncate">{cmd.subtitle}</div>
                      </div>
                      <ChevronRight size={12} className="text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-none" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {isCmdKOpen && activePage !== 'brand-insight' && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsCmdKOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-[#0f0f0f] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Search Input */}
            <div className="flex items-center px-4 py-3 border-b border-neutral-800">
              <Command className="text-neutral-500 mr-3 flex-none" size={18} />
              <input
                ref={cmdKInputRef}
                type="text"
                placeholder="Type a command or ask AskFRnD..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-neutral-600 text-lg font-light"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    // If text typed and Enter pressed, treat as "Ask about brand"
                    handleCommandSelect('ask-brand')
                  }
                }}
              />
              <kbd className="font-mono text-[10px] text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 flex-none">ESC</kbd>
            </div>

            {/* Context chips in Cmd+K if widgets selected */}
            {selectedContext.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-b border-neutral-800/50 bg-neutral-900/30">
                <span className="text-[10px] text-neutral-500 font-mono mr-1 self-center">CONTEXT:</span>
                {selectedContext.map(ctx => (
                  <span key={ctx.id} className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-[10px] font-mono text-neutral-300">
                    <BarChart2 size={10} className="text-neutral-500" />
                    {ctx.title}
                  </span>
                ))}
              </div>
            )}

            {/* Context badge */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-800/30">
              <div className={`w-1.5 h-1.5 rounded-full ${({ 'brand-insight': 'bg-amber-400', 'studio': 'bg-violet-400', 'documents': 'bg-blue-400', 'chat': 'bg-neutral-400' }[activePage] ?? 'bg-neutral-400')}`} />
              <span className="text-[10px] font-mono text-neutral-500 tracking-wider uppercase">{chatModeSubtitle[activePage]}</span>
            </div>

            {/* Commands */}
            <div className="p-2">
              <div className="px-3 py-2 text-[10px] font-mono text-neutral-500 tracking-wider">
                {searchQuery ? 'RESULTS' : 'SUGGESTED COMMANDS'}
              </div>
              <ul className="space-y-0.5">
                {filteredCommands.map((cmd) => (
                  <li key={cmd.id}>
                    <button
                      onClick={() => handleCommandSelect(cmd.id)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-neutral-800/50 text-left group transition-colors focus:bg-neutral-800/50 outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-neutral-400 group-hover:text-white transition-colors">{cmd.icon}</div>
                        <div>
                          <div className="text-sm font-medium text-neutral-200 group-hover:text-white">{cmd.title}</div>
                          <div className="text-xs text-neutral-600">{cmd.subtitle}</div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                ))}
                {filteredCommands.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm text-neutral-600">No commands found</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ASKFRND SIDE PANEL ═══ */}
      <aside
        className={`fixed top-0 right-0 h-full bg-[#0a0a0a] border-l border-neutral-800/80 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 flex flex-col overflow-hidden ${
          panelState === 'closed' ? 'translate-x-full w-[400px]' :
          panelState === 'narrow' ? 'translate-x-0 w-[400px]' :
          panelState === 'split' ? 'translate-x-0 w-[50vw]' :
          'translate-x-0 w-full'
        }`}
      >
        {/* Panel Header */}
        <header className="flex-none h-14 border-b border-neutral-800/50 px-4 flex items-center justify-between bg-[#0a0a0a] z-30 relative">
          <div className="flex items-center gap-3 w-1/3">
            <div className="flex flex-col">
              <span className="text-sm font-medium tracking-tight">{chatModeLabel[activePage]}</span>
              {/* Active model — locked on Brand Insight, switchable on all other pillars */}
              {activePage === 'brand-insight' ? (
                <span className="text-[10px] text-neutral-600 font-mono tracking-widest uppercase">{activeChatModel}</span>
              ) : (
                <button
                  onClick={() => { setShowModelPicker(p => !p); setIsHistoryDrawerOpen(false) }}
                  className="flex items-center gap-1 group"
                >
                  <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase group-hover:text-neutral-300 transition-colors">{activeChatModel}</span>
                  <ChevronDown size={10} className="text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                </button>
              )}
            </div>
          </div>

          {/* Center spacer */}
          <div className="w-1/3" />

          <div className="flex items-center justify-end gap-1 w-1/3">
            {/* History Drawer Toggle */}
            <button
              onClick={() => {
                const willOpen = !isHistoryDrawerOpen
                setIsHistoryDrawerOpen(willOpen)
                if (willOpen) { setShowModelPicker(false); console.log('Event Logged: askfrnd_history_drawer_opened') }
              }}
              className={`p-2 rounded-md transition-colors ${isHistoryDrawerOpen ? 'bg-white text-black' : 'text-neutral-500 hover:text-white hover:bg-neutral-900'}`}
              title="Contextual History"
            >
              <History size={16} />
            </button>

            <div className="w-px h-4 bg-neutral-800 mx-0.5" />

            {/* Expand / Minimize */}
            <button
              onClick={cyclePanelState}
              className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-900 rounded-md transition-colors"
              title={panelState === 'fullscreen' ? 'Minimize' : 'Expand'}
            >
              {panelState === 'fullscreen' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Meatball Menu */}
            <div className="relative group">
              <button className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-900 rounded-md transition-colors">
                <MoreHorizontal size={16} />
              </button>
              <div className="absolute right-0 top-full mt-1 w-52 bg-[#111] border border-neutral-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                  onClick={() => setActiveModal('settings')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white text-left rounded-t-lg transition-colors"
                >
                  <Settings size={14} /> Chat Settings
                </button>
                <button
                  onClick={() => setActiveModal('share')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white text-left transition-colors"
                >
                  <Share size={14} /> Share Chat
                </button>
                <button
                  onClick={() => setActiveModal('history')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white text-left transition-colors"
                >
                  <History size={14} /> Chat History
                </button>
                <button
                  onClick={() => setActiveModal('files')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white text-left rounded-b-lg transition-colors"
                >
                  <Download size={14} /> Generated Files
                </button>
              </div>
            </div>

            <div className="w-px h-4 bg-neutral-800 mx-0.5" />

            <button
              onClick={() => setPanelState('closed')}
              className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-900 rounded-md transition-colors"
            >
              <PanelRightClose size={16} />
            </button>
          </div>
        </header>

        {/* Panel Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative bg-[#050505]" style={{clipPath: 'inset(0 0 0 0)'}}>

          {/* History Drawer (z-20 overlay) — auto-filtered by active brand */}
          <div className={`absolute inset-0 z-20 bg-[#0a0a0a] flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isHistoryDrawerOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'}`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex-none px-5 pt-5 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-medium text-white tracking-tight">History</h2>
                  <span className="text-[10px] font-mono text-neutral-500 tracking-wider uppercase">
                    {activePage === 'brand-insight' ? 'Insight sessions' : activePage === 'studio' ? 'Studio sessions' : activePage === 'documents' ? 'Document sessions' : 'All sessions'}
                  </span>
                </div>
                {/* Search input */}
                <div className="relative mt-2">
                  <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-neutral-900/60 border border-neutral-800 rounded-lg outline-none text-neutral-300 placeholder-neutral-600 focus:border-neutral-600 transition-colors"
                  />
                </div>
              </div>

              {/* Pillar filter chips — on brand-insight: all chips with Insight locked; on other pages: exclude Insight chip */}
              <div className="flex items-center gap-1.5 px-3 pb-3 flex-wrap flex-none">
                {pillarFilterChips
                  .filter(f => activePage !== 'brand-insight' ? f.key !== 'brand-insight' : true)
                  .map(f => {
                    const isLockedInsight = activePage === 'brand-insight' && f.key !== 'brand-insight'
                    const isActive = activePage === 'brand-insight'
                      ? f.key === 'brand-insight'
                      : historyPillarFilter === f.key
                    return (
                      <button key={f.key}
                        onClick={() => !isLockedInsight && setHistoryPillarFilter(f.key)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono border transition-colors ${
                          isActive
                            ? 'bg-white text-black border-white'
                            : isLockedInsight
                            ? 'text-neutral-700 border-neutral-800 cursor-default'
                            : 'text-neutral-500 border-neutral-800 hover:border-neutral-600 hover:text-neutral-300'
                        }`}>
                        {f.label}
                      </button>
                    )
                  })}
              </div>

              {/* Session list grouped by brand → time, sorted: active brand first, then by most recent chat */}
              <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
                {(() => {
                  // Build brand order: active brand first, rest sorted by most recent session position in filteredHistory
                  const seenBrands = new Set<string>()
                  const brandOrder = new Map<string, number>()
                  filteredHistory.forEach((s, i) => {
                    if (!seenBrands.has(s.brand)) {
                      seenBrands.add(s.brand)
                      brandOrder.set(s.brand, i)
                    }
                  })
                  const brands = Array.from(brandOrder.keys()).sort((a, b) => {
                    if (a === activeBrand) return -1
                    if (b === activeBrand) return 1
                    return (brandOrder.get(a) ?? 0) - (brandOrder.get(b) ?? 0)
                  })

                  const toggleBrand = (brand: string) => {
                    setCollapsedBrands(prev => {
                      const next = new Set(prev)
                      next.has(brand) ? next.delete(brand) : next.add(brand)
                      return next
                    })
                  }

                  const renderSession = (session: HistorySession) => (
                    <div key={session.id} className="relative group/session">
                      <button className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-neutral-800/40 transition-colors pr-10">
                        <Clock size={13} className="text-neutral-600 group-hover/session:text-neutral-400 flex-none mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-neutral-300 group-hover/session:text-white truncate transition-colors">{session.title}</div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-[10px] text-neutral-600">{session.date}</span>
                            <span className="flex items-center gap-0.5 text-[9px] font-mono text-neutral-600">
                              {pillarIcon[session.pillarId]}{pillarLabel[session.pillarId]}
                            </span>
                            {session.branchedFrom && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-neutral-800 rounded text-[9px] font-mono text-neutral-500">
                                <GitBranch size={8} />{session.branchedFrom.slice(0, 28)}…
                              </span>
                            )}
                            {session.linkShared && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">Link Shared</span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* ⋮ context menu */}
                      <div className="absolute right-2 top-2 opacity-0 group-hover/session:opacity-100 transition-opacity">
                        <div className="relative group/menu">
                          <button className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
                            <MoreHorizontal size={13} />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-60 bg-[#141414] border border-neutral-800 rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-30">
                            {/* Share as Live Chat */}
                            <div className="p-3.5 space-y-3 border-b border-neutral-800">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-xs font-medium text-white">Share as Live Chat</div>
                                  <div className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">Allow workspace members to see past and future messages.</div>
                                </div>
                                <div className={`w-9 h-5 rounded-full relative cursor-pointer flex-none mt-0.5 ${session.linkShared ? 'bg-blue-500' : 'bg-neutral-700'}`}>
                                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${session.linkShared ? 'left-4' : 'left-0.5'}`} />
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-medium text-white">Share Public Link</div>
                                  <div className="text-[10px] text-neutral-500 mt-0.5">Get shareable link of this chat.</div>
                                </div>
                                <button className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
                                  <Link2 size={12} />
                                </button>
                              </div>
                            </div>
                            {/* Rename / Delete */}
                            <div className="flex items-center">
                              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-bl-xl transition-colors">
                                <PenLine size={11} /> Rename
                              </button>
                              <div className="w-px h-6 bg-neutral-800" />
                              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs text-red-400 hover:bg-neutral-800 hover:text-red-300 rounded-br-xl transition-colors">
                                <Trash2 size={11} /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )

                  return brands.map(brand => {
                    const brandSessions = filteredHistory.filter(s => s.brand === brand)
                    const todaySessions = brandSessions.filter(s => s.timeGroup === 'today')
                    const olderSessions = brandSessions.filter(s => s.timeGroup === 'older')
                    const isCollapsed = collapsedBrands.has(brand)
                    const isActive = brand === activeBrand

                    return (
                      <div key={brand}>
                        {/* Collapsible brand header — prominent visual band */}
                        <div className={`flex items-center justify-between px-3 py-3 border-t rounded-t-lg ${
                          isActive
                            ? 'border-neutral-600/80 bg-amber-500/10'
                            : 'border-neutral-800/50 bg-neutral-800/20'
                        }`}>
                          <button
                            onClick={() => toggleBrand(brand)}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                          >
                            <ChevronRight size={12} className={`text-neutral-400 flex-none transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
                            {isActive && <div className="w-2 h-2 rounded-full bg-amber-400 flex-none" />}
                            <span className={`text-[10px] font-mono tracking-widest uppercase ${isActive ? 'text-amber-400/70' : 'text-neutral-600'}`}>Brand:</span>
                            <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-neutral-300'}`}>{brand}</span>
                          </button>
                          <span className={`text-[10px] font-mono ${isActive ? 'text-amber-400/60' : 'text-neutral-700'}`}>{brandSessions.length}</span>
                        </div>

                        {/* Session list — collapsed when toggled */}
                        {!isCollapsed && (
                          <>
                            {todaySessions.length > 0 && (
                              <div className="mb-2">
                                <div className="px-3 py-1 text-[9px] font-mono text-neutral-600 tracking-wider uppercase">Today</div>
                                <div className="space-y-0.5">
                                  {todaySessions.map(renderSession)}
                                </div>
                              </div>
                            )}
                            {olderSessions.length > 0 && (
                              <div>
                                <div className="px-3 py-1 text-[9px] font-mono text-neutral-600 tracking-wider uppercase">Older</div>
                                <div className="space-y-0.5">
                                  {olderSessions.map(renderSession)}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })
                })()}

                {filteredHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search size={20} className="text-neutral-700 mb-2" />
                    <p className="text-xs text-neutral-600">No sessions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Model Picker (z-20 overlay) ── */}
          <div className={`absolute inset-0 z-20 bg-[#0a0a0a] flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${showModelPicker && !isHistoryDrawerOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'}`}>
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Header */}
              <div className="flex-none flex items-center justify-between px-5 pt-5 pb-4 border-b border-neutral-800/50">
                <div>
                  <h2 className="text-sm font-medium text-white">Select Model</h2>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Active: <span className="text-neutral-300">{activeChatModel}</span> · <span className="text-neutral-300">{activeImageModel}</span> · <span className="text-neutral-300">{activeVideoModel}</span></p>
                </div>
                <button onClick={() => setShowModelPicker(false)} className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"><X size={14} /></button>
              </div>

              {/* 3-Column grid */}
              <div className="flex-1 grid grid-cols-3 divide-x divide-neutral-800/50 min-h-0">

                {/* Chat Models */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800/40">
                    <MessageCircle size={12} className="text-neutral-500" />
                    <span className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Chat Model</span>
                  </div>
                  <div className="flex-1 overflow-y-auto py-1">
                    {allModels.chat.map(m => (
                      <button key={m.id} onClick={() => setActiveChatModel(m.name)}
                        className={`w-full px-4 py-3 text-left hover:bg-neutral-800/40 transition-colors flex items-start justify-between gap-2 group ${activeChatModel === m.name ? 'bg-neutral-800/30' : ''}`}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className={`text-xs font-medium ${activeChatModel === m.name ? 'text-white' : 'text-neutral-300 group-hover:text-white'} transition-colors`}>{m.name}</span>
                            {/* Capability icons */}
                            <div className="flex items-center gap-1">
                              {m.caps.map(cap => (
                                <span key={cap} className="opacity-50">{capIcons[cap]}</span>
                              ))}
                            </div>
                          </div>
                          <div className="text-[10px] text-neutral-600 leading-snug">{m.desc}</div>
                        </div>
                        {activeChatModel === m.name && <span className="text-white flex-none mt-0.5 text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Models */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800/40">
                    <ImageIcon size={12} className="text-neutral-500" />
                    <span className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Image Model</span>
                  </div>
                  <div className="flex-1 overflow-y-auto py-1">
                    {allModels.image.map(m => (
                      <button key={m.id} onClick={() => setActiveImageModel(m.name)}
                        className={`w-full px-4 py-3 text-left hover:bg-neutral-800/40 transition-colors flex items-start justify-between gap-2 group ${activeImageModel === m.name ? 'bg-neutral-800/30' : ''}`}>
                        <div className="min-w-0">
                          <span className={`text-xs font-medium ${activeImageModel === m.name ? 'text-white' : 'text-neutral-300 group-hover:text-white'} transition-colors`}>{m.name}</span>
                          <div className="text-[10px] text-neutral-600 mt-0.5 leading-snug">{m.desc}</div>
                        </div>
                        {activeImageModel === m.name && <span className="text-white flex-none mt-0.5">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video Models */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800/40">
                    <Video size={12} className="text-neutral-500" />
                    <span className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Video Model</span>
                  </div>
                  <div className="flex-1 overflow-y-auto py-1">
                    {allModels.video.map(m => (
                      <button key={m.id} onClick={() => setActiveVideoModel(m.name)}
                        className={`w-full px-4 py-3 text-left hover:bg-neutral-800/40 transition-colors flex items-start justify-between gap-2 group ${activeVideoModel === m.name ? 'bg-neutral-800/30' : ''}`}>
                        <div className="min-w-0">
                          <span className={`text-xs font-medium ${activeVideoModel === m.name ? 'text-white' : 'text-neutral-300 group-hover:text-white'} transition-colors`}>{m.name}</span>
                          <div className="text-[10px] text-neutral-600 mt-0.5 leading-snug">{m.desc}</div>
                        </div>
                        {activeVideoModel === m.name && <span className="text-white flex-none mt-0.5">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Collapse to top 4 per column */}
              <div className="flex-none border-t border-neutral-800/50 flex justify-center py-2.5">
                <button
                  onClick={() => setShowAllModels(p => !p)}
                  className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white px-4 py-1 rounded-lg hover:bg-neutral-800/50 transition-colors"
                >
                  {showAllModels ? <><Minimize2 size={11} /> Show Less</> : <><Maximize2 size={11} /> Show More</>}
                </button>
              </div>
            </div>
          </div>

          {/* Thread View */}
          <div className={`flex-1 flex flex-col relative transition-opacity duration-300 ${!isHistoryDrawerOpen && !showModelPicker ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Chat Feed */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-48">
              {messages.map((msg) => {
                // ── Branch Divider ──
                if (msg.role === 'branch-divider') {
                  return (
                    <div key={msg.id} className="flex items-center gap-3 my-2 px-1">
                      <div className="flex-1 h-px bg-neutral-800/80" />
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 flex-none">
                        <GitBranch size={10} className="text-neutral-500 flex-none" />
                        <span className="text-[10px] font-mono text-neutral-500 whitespace-nowrap">Branched from</span>
                        <span className="text-[10px] font-mono text-neutral-300 max-w-[150px] truncate">{msg.branchOriginTitle}</span>
                      </div>
                      <div className="flex-1 h-px bg-neutral-800/80" />
                    </div>
                  )
                }

                return (
                  <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} group`}>
                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-neutral-900 border border-neutral-800' : 'bg-transparent'} rounded-lg p-4`}>

                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={14} className="text-neutral-500" />
                          <span className="text-xs font-medium text-neutral-400">{msg.model}</span>
                          {msg.toolUsed && (
                            <span className="text-[10px] font-mono text-neutral-600 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">{msg.toolUsed}</span>
                          )}
                        </div>
                      )}

                      {/* User Context Chips */}
                      {msg.role === 'user' && msg.context && msg.context.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {msg.context.map(ctx => (
                            <span key={ctx.id} className="flex items-center gap-1.5 px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-[10px] font-mono text-neutral-400">
                              <BarChart2 size={10} />
                              {ctx.title}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="text-sm font-light leading-relaxed text-neutral-200 whitespace-pre-line">
                        {msg.content}
                      </div>
                    </div>

                    {/* ── Action bar: assistant messages ── */}
                    {msg.role === 'assistant' && (
                      <div className="max-w-[85%] w-full relative">
                        {/* Share link popover */}
                        {sharedMessageId === msg.id && (
                          <div className="flex items-center gap-2 mb-1.5 px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg animate-in fade-in slide-in-from-top-1 duration-150">
                            <Link size={10} className="text-neutral-500 flex-none" />
                            <span className="text-[11px] font-mono text-neutral-300 flex-1 truncate">
                              https://frnd.io/s/{msg.id.toString(36).slice(-6)}…
                            </span>
                            <button
                              onClick={() => setSharedMessageId(null)}
                              className="p-0.5 text-neutral-600 hover:text-red-400 transition-colors"
                              title="Remove link"
                            ><Trash2 size={11} /></button>
                            <button
                              className="p-0.5 text-neutral-600 hover:text-white transition-colors"
                              title="Copy link"
                            ><Copy size={11} /></button>
                          </div>
                        )}

                        {/* ── Full action bar (md: split/fullscreen) ── */}
                        <div className="hidden md:flex items-center justify-between px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {/* Left: action icons */}
                          <div className="flex items-center gap-0.5">
                            {/* Share as link */}
                            <div className="relative group/share">
                              <button
                                onClick={() => setSharedMessageId(prev => prev === msg.id ? null : msg.id)}
                                className={`p-1.5 rounded transition-colors ${sharedMessageId === msg.id ? 'text-white bg-neutral-800' : 'text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/60'}`}
                              ><Link2 size={13} /></button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px] font-mono text-neutral-200 whitespace-nowrap opacity-0 group-hover/share:opacity-100 pointer-events-none transition-opacity z-10">
                                Share public link
                              </div>
                            </div>
                            {/* Branch */}
                            <div className="relative group/branch">
                              <button
                                onClick={() => handleBranch(msg)}
                                className={`p-1.5 rounded transition-colors ${branchingFromMsgId === msg.id ? 'text-white bg-neutral-800' : 'text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/60'}`}
                              ><GitBranch size={13} /></button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px] font-mono text-neutral-200 whitespace-nowrap opacity-0 group-hover/branch:opacity-100 pointer-events-none transition-opacity z-10">
                                Branch from here
                              </div>
                            </div>
                            {/* Copy */}
                            <button className="p-1.5 rounded text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/60 transition-colors" title="Copy"><Copy size={13} /></button>
                            {/* Undo */}
                            <button className="p-1.5 rounded text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/60 transition-colors" title="Undo"><Edit2 size={13} /></button>
                            {/* Regenerate */}
                            <button className="p-1.5 rounded text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/60 transition-colors" title="Regenerate"><RefreshCcw size={13} /></button>
                          </div>
                          {/* Right: model · time · credits */}
                          <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-600">
                            <span>{msg.model}</span>
                            {msg.responseTime != null && (
                              <>
                                <span className="text-neutral-700">·</span>
                                <span className="flex items-center gap-0.5"><Timer size={9} />{msg.responseTime}s</span>
                                <span className="text-neutral-700">·</span>
                                <span className="flex items-center gap-0.5"><Zap size={9} />{msg.creditsUsed}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* ── Compact action menu (below md: narrow panel) ── */}
                        <div className="flex md:hidden items-center justify-between px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {/* Left: condensed — just Share + Branch */}
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => setSharedMessageId(prev => prev === msg.id ? null : msg.id)}
                              className="p-1.5 rounded text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/60 transition-colors"
                            ><Link2 size={13} /></button>
                            <button
                              onClick={() => handleBranch(msg)}
                              className="p-1.5 rounded text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/60 transition-colors"
                            ><GitBranch size={13} /></button>
                            {/* More actions */}
                            <div className="relative">
                              <button
                                onClick={() => setOpenMenuMsgId(prev => prev === msg.id ? null : msg.id)}
                                className={`p-1.5 rounded transition-colors ${openMenuMsgId === msg.id ? 'text-white bg-neutral-800' : 'text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/60'}`}
                              ><MoreHorizontal size={13} /></button>
                              {openMenuMsgId === msg.id && (
                                <div data-msg-menu className="absolute left-0 top-full mt-1 w-44 bg-[#141414] border border-neutral-800 rounded-xl shadow-2xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                                  <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white text-left transition-colors">
                                    <Copy size={12} /> Copy
                                  </button>
                                  <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white text-left transition-colors">
                                    <Edit2 size={12} /> Undo
                                  </button>
                                  <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white text-left transition-colors">
                                    <RefreshCcw size={12} /> Regenerate
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Right: compact metadata */}
                          <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-600">
                            <span>{msg.model}</span>
                            {msg.responseTime != null && (
                              <span className="flex items-center gap-0.5"><Timer size={9} />{msg.responseTime}s</span>
                            )}
                            {msg.creditsUsed != null && (
                              <span className="flex items-center gap-0.5"><Zap size={9} />{msg.creditsUsed}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Minimal actions: user messages (hover only) ── */}
                    {msg.role === 'user' && (
                      <div className="flex items-center gap-0.5 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="p-1.5 rounded text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/60 transition-colors" title="Copy"><Copy size={12} /></button>
                        <button className="p-1.5 rounded text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/60 transition-colors" title="Edit"><Edit2 size={12} /></button>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Answering indicator */}
              {isAnswering && (
                <div className="flex justify-start pl-1">
                  <div className="flex items-center gap-2.5 py-2">
                    <span className="relative flex h-2 w-2 flex-none">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-500" />
                    </span>
                    <span className="text-sm text-neutral-500 font-light tracking-wide">✦ Answering…</span>
                  </div>
                </div>
              )}

              {/* Quick Reply Suggestions — hidden while in branch mode or answering */}
              {!branchingFromMsgId && !isAnswering && messages.length > 1 && messages[messages.length - 1].role === 'assistant' && (
                <div className="flex flex-wrap gap-2 pl-0 pt-2">
                  {quickReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputText(reply)
                        inputRef.current?.focus()
                      }}
                      className="px-3 py-2 text-xs text-neutral-400 bg-neutral-900/50 border border-neutral-800/60 rounded-lg hover:bg-neutral-800 hover:text-neutral-200 hover:border-neutral-700 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-16">
              <div className="relative max-w-3xl mx-auto">

                {/* Slash Command Popover */}
                {showSlashMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#111] border border-neutral-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-3 py-2 text-[10px] font-mono text-neutral-500 border-b border-neutral-800/50 bg-[#0a0a0a]">SELECT AI MODEL</div>
                    <div className="p-1">
                      {models.map(model => (
                        <button
                          key={model.id}
                          onClick={() => selectModel(model)}
                          className={`w-full flex justify-between items-center px-3 py-2 text-sm text-left rounded text-neutral-300 hover:text-white transition-colors ${
                            activeChatModel === model.name ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-800'
                          }`}
                        >
                          <span>{model.name}</span>
                          <span className="text-xs font-mono text-neutral-600">{model.tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="relative flex flex-col bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-600 focus-within:border-neutral-500 rounded-xl overflow-hidden transition-colors shadow-lg">

                  {/* Branch Mode Banner */}
                  {branchingFromMsgId !== null && (
                    <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-neutral-800/70 bg-neutral-900/60 animate-in fade-in slide-in-from-top-1 duration-200">
                      <span className="text-[11px] text-amber-400/80 flex-none">⚡</span>
                      <span className="text-[11px] text-neutral-400 flex-1 font-light">Send a message to branch from this point.</span>
                      <button
                        type="button"
                        onClick={() => { setBranchingFromMsgId(null); setBranchOriginTitle('') }}
                        className="text-[10px] font-mono text-neutral-500 hover:text-white px-2 py-0.5 rounded hover:bg-neutral-800 transition-colors flex-none"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Context Chips Area */}
                  {selectedContext.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-4 pt-3 pb-1 border-b border-neutral-800/50 bg-neutral-900/30">
                      <span className="text-[10px] text-neutral-500 font-mono mr-1 self-center">ATTACHED:</span>
                      {selectedContext.map(ctx => (
                        <div key={ctx.id} className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-md text-[10px] font-mono text-neutral-300 group/chip">
                          <BarChart2 size={10} className="text-neutral-500" />
                          {ctx.title}
                          <button
                            type="button"
                            onClick={() => toggleWidgetContext(ctx)}
                            className="text-neutral-500 hover:text-white transition-colors ml-0.5"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Textarea row */}
                  <div className="relative flex items-end w-full">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={inputText}
                      onChange={handleInputChange}
                      placeholder={activePage === 'brand-insight' ? 'Ask about these insights…' : "What do you want to ask…"}
                      className="w-full max-h-32 min-h-[48px] py-3.5 pl-4 pr-12 bg-transparent border-none outline-none resize-none text-sm text-neutral-200 placeholder-neutral-600 font-light"
                      style={{ fieldSizing: 'content' } as React.CSSProperties}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleFormSubmit(e)
                        }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() && selectedContext.length === 0}
                      className="absolute right-2 bottom-2 p-2 rounded-lg bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-900 disabled:text-neutral-600 transition-colors"
                    >
                      <Send size={14} />
                    </button>
                  </div>

                  {/* Tool Capabilities Bar — hidden on Brand Insight (read-only context mode) */}
                  {activePage !== 'brand-insight' && (
                    <div className="flex items-center gap-0.5 px-3 pb-2.5 pt-0.5">
                      {[
                        { icon: <Upload size={15} />, label: 'Upload file', onClick: () => {} },
                        { icon: <ImageIcon size={15} />, label: 'Generate image', onClick: () => {} },
                        { icon: <Video size={15} />, label: 'Generate video', onClick: () => {} },
                        { icon: <Globe size={15} />, label: 'Web search', onClick: () => {} },
                        { icon: <Lightbulb size={15} />, label: 'Suggestions', onClick: () => {} },
                      ].map((tool) => (
                        <div key={tool.label} className="relative group/tool">
                          <button
                            type="button"
                            onClick={tool.onClick}
                            className="p-2 text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/60 rounded-lg transition-colors"
                          >
                            {tool.icon}
                          </button>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-[10px] font-mono text-neutral-200 whitespace-nowrap shadow-lg opacity-0 group-hover/tool:opacity-100 pointer-events-none transition-opacity duration-150 z-10">
                            {tool.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </form>
                <div className="text-center mt-2">
                  <span className="text-[10px] text-neutral-600 font-mono tracking-widest">frndOS // SECURE WORKSPACE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ MODAL: CHAT SETTINGS ═══ */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal('none')} />
          <div className="relative w-full max-w-lg bg-[#111] border border-neutral-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <h3 className="text-lg font-medium text-white">Chat Settings</h3>
              <button onClick={() => setActiveModal('none')} className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex min-h-[320px]">
              {/* Sidebar Tabs */}
              <div className="w-44 border-r border-neutral-800 p-3 space-y-1">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/30 transition-colors">
                  <Sliders size={15} /> Customization
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md bg-neutral-800/50 text-white">
                  <Brain size={15} /> Memory
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Enable chat memory</div>
                    <div className="text-xs text-neutral-500 mt-0.5">Let FRnD automatically save your important memories while you chat.</div>
                  </div>
                  <button
                    onClick={() => setChatMemoryEnabled(!chatMemoryEnabled)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${chatMemoryEnabled ? 'bg-white' : 'bg-neutral-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${chatMemoryEnabled ? 'left-5 bg-black' : 'left-0.5 bg-neutral-400'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Reference your chat history</div>
                    <div className="text-xs text-neutral-500 mt-0.5">Enable FRnD to access your recent conversations when answering.</div>
                  </div>
                  <button
                    onClick={() => setChatHistoryRefEnabled(!chatHistoryRefEnabled)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${chatHistoryRefEnabled ? 'bg-white' : 'bg-neutral-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${chatHistoryRefEnabled ? 'left-5 bg-black' : 'left-0.5 bg-neutral-400'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-white">Manage saved memories</div>
                  <button className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-md border border-neutral-700 transition-colors">
                    Manage
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 text-sm bg-neutral-200 hover:bg-white text-black rounded-md font-medium transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: CHAT HISTORY ═══ */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal('none')} />
          <div className="relative w-full max-w-xl bg-[#111] border border-neutral-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 flex-none">
              <h3 className="text-lg font-medium text-white">Chat History</h3>
              <button onClick={() => setActiveModal('none')} className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 pt-4 flex-none">
              {/* Tabs */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setHistoryTab('yours')}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    historyTab === 'yours' ? 'bg-neutral-800 text-white border-neutral-700' : 'text-neutral-500 border-neutral-800 hover:border-neutral-700 hover:text-neutral-300'
                  }`}
                >Your Chat</button>
                <button
                  onClick={() => setHistoryTab('shared')}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    historyTab === 'shared' ? 'bg-neutral-800 text-white border-neutral-700' : 'text-neutral-500 border-neutral-800 hover:border-neutral-700 hover:text-neutral-300'
                  }`}
                >Live Shared Chat</button>

                <div className="ml-auto relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search all chats"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="pl-8 pr-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-lg outline-none text-neutral-300 placeholder-neutral-600 focus:border-neutral-600 w-44 transition-colors"
                  />
                </div>
              </div>

              {/* Pillar filter chips — on brand-insight: all chips with Insight locked; on other pages: exclude Insight chip */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {pillarFilterChips
                  .filter(f => activePage !== 'brand-insight' ? f.key !== 'brand-insight' : true)
                  .map(f => {
                    const isLockedInsight = activePage === 'brand-insight' && f.key !== 'brand-insight'
                    const isActive = activePage === 'brand-insight'
                      ? f.key === 'brand-insight'
                      : historyPillarFilter === f.key
                    return (
                      <button key={f.key}
                        onClick={() => !isLockedInsight && setHistoryPillarFilter(f.key)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono border transition-colors ${
                          isActive
                            ? 'bg-white text-black border-white'
                            : isLockedInsight
                            ? 'text-neutral-700 border-neutral-800 cursor-default'
                            : 'text-neutral-500 border-neutral-800 hover:border-neutral-600 hover:text-neutral-300'
                        }`}>
                        {f.label}
                      </button>
                    )
                  })}
              </div>
            </div>

            {/* History List — grouped by brand → time, sorted: active brand first, then by most recent chat */}
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
              {(() => {
                // Sort: active brand first, rest by most recent session position
                const seenBrands = new Set<string>()
                const brandOrder = new Map<string, number>()
                filteredHistory.forEach((s, i) => {
                  if (!seenBrands.has(s.brand)) {
                    seenBrands.add(s.brand)
                    brandOrder.set(s.brand, i)
                  }
                })
                const brands = Array.from(brandOrder.keys()).sort((a, b) => {
                  if (a === activeBrand) return -1
                  if (b === activeBrand) return 1
                  return (brandOrder.get(a) ?? 0) - (brandOrder.get(b) ?? 0)
                })

                const toggleBrand = (brand: string) => {
                  setCollapsedBrands(prev => {
                    const next = new Set(prev)
                    next.has(brand) ? next.delete(brand) : next.add(brand)
                    return next
                  })
                }

                const renderSession = (session: HistorySession) => (
                  <div key={session.id} className="group relative rounded-xl hover:bg-neutral-800/30 transition-colors">
                    <button className="w-full flex items-start px-3 py-3 text-left pr-10">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-neutral-200 group-hover:text-white transition-colors leading-snug">{session.title}</div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[10px] text-neutral-600">{session.date}</span>
                          <span className="flex items-center gap-0.5 text-[9px] font-mono text-neutral-600">
                            {pillarIcon[session.pillarId]}{pillarLabel[session.pillarId]}
                          </span>
                          {session.branchedFrom && (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 bg-neutral-800/80 px-1.5 py-0.5 rounded">
                              <GitBranch size={9} />{session.branchedFrom.slice(0, 34)}…
                            </span>
                          )}
                          {session.linkShared && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded">Link Shared</span>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* ⋮ context menu */}
                    <div className="absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="relative group/menu">
                        <button className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-64 bg-[#141414] border border-neutral-800 rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20">
                          {/* Share as Live Chat */}
                          <div className="p-4 space-y-3 border-b border-neutral-800">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-xs font-medium text-white">Share as Live Chat</div>
                                <div className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">Allow workspace's member to see past and future messages of this chat.</div>
                              </div>
                              <div className={`w-9 h-5 rounded-full relative cursor-pointer flex-none mt-0.5 ${session.linkShared ? 'bg-blue-500' : 'bg-neutral-700'}`}>
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${session.linkShared ? 'left-4' : 'left-0.5'}`} />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs font-medium text-white">Share Public Link</div>
                                <div className="text-[10px] text-neutral-500 mt-0.5">Get shareable link of the latest chat.</div>
                              </div>
                              <button className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
                                <Share size={13} />
                              </button>
                            </div>
                          </div>
                          {/* Rename / Delete */}
                          <div className="flex items-center">
                            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-bl-xl transition-colors">
                              <PenLine size={12} /> Rename
                            </button>
                            <div className="w-px h-6 bg-neutral-800" />
                            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs text-red-400 hover:bg-neutral-800 hover:text-red-300 rounded-br-xl transition-colors">
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )

                return brands.map(brand => {
                  const brandSessions = filteredHistory.filter(s => s.brand === brand)
                  const todaySessions = brandSessions.filter(s => s.timeGroup === 'today')
                  const olderSessions = brandSessions.filter(s => s.timeGroup === 'older')
                  const isCollapsed = collapsedBrands.has(brand)
                  const isActive = brand === activeBrand

                  return (
                    <div key={brand}>
                      {/* Collapsible brand header — prominent visual band */}
                      <div className={`flex items-center justify-between px-1 py-3 border-t rounded-t-lg ${
                        isActive
                          ? 'border-neutral-600/80 bg-amber-500/10'
                          : 'border-neutral-800/50 bg-neutral-800/20'
                      }`}>
                        <button
                          onClick={() => toggleBrand(brand)}
                          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                          <ChevronRight size={12} className={`text-neutral-400 flex-none transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
                          {isActive && <div className="w-2 h-2 rounded-full bg-amber-400 flex-none" />}
                          <span className={`text-[10px] font-mono tracking-widest uppercase ${isActive ? 'text-amber-400/70' : 'text-neutral-600'}`}>Brand:</span>
                          <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-neutral-300'}`}>{brand}</span>
                        </button>
                        <span className={`text-[10px] font-mono ${isActive ? 'text-amber-400/60' : 'text-neutral-700'}`}>{brandSessions.length}</span>
                      </div>

                      {/* Session list — hidden when collapsed */}
                      {!isCollapsed && (
                        <>
                          {todaySessions.length > 0 && (
                            <div className="mb-2">
                              <div className="text-[9px] font-mono text-neutral-600 tracking-wider uppercase px-1 mb-1.5">Today</div>
                              <div className="space-y-0.5">
                                {todaySessions.map(renderSession)}
                              </div>
                            </div>
                          )}
                          {olderSessions.length > 0 && (
                            <div>
                              <div className="text-[9px] font-mono text-neutral-600 tracking-wider uppercase px-1 mb-1.5">Older</div>
                              <div className="space-y-0.5">
                                {olderSessions.map(renderSession)}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })
              })()}

              {filteredHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search size={22} className="text-neutral-700 mb-3" />
                  <p className="text-sm text-neutral-600">No sessions found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: GENERATED FILES ═══ */}
      {activeModal === 'files' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal('none')} />
          <div className="relative w-full max-w-lg bg-[#111] border border-neutral-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[70vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 flex-none">
              <h3 className="text-lg font-medium text-white">Generated Files</h3>
              <button onClick={() => setActiveModal('none')} className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 pt-4 flex-none">
              <div className="flex items-center gap-2 mb-4">
                {(['all', 'image', 'video'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilesFilter(f)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors capitalize ${
                      filesFilter === f ? 'bg-neutral-800 text-white border-neutral-700' : 'text-neutral-500 border-neutral-800 hover:border-neutral-700 hover:text-neutral-300'
                    }`}
                  >{f === 'image' ? 'Image' : f === 'video' ? 'Videos' : 'All'}</button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-3 gap-3">
                {filteredAssets.map(asset => (
                  <div key={asset.id} className="relative bg-neutral-900/50 rounded-xl border border-neutral-800/50 overflow-hidden group cursor-pointer hover:border-neutral-600 transition-colors aspect-square">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {asset.type === 'video'
                        ? <Video size={20} className="text-neutral-700 group-hover:text-neutral-500 transition-colors" />
                        : <ImageIcon size={20} className="text-neutral-700 group-hover:text-neutral-500 transition-colors" />}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-[9px] font-mono text-white bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md truncate">{asset.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: SHARE CHAT ═══ */}
      {activeModal === 'share' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal('none')} />
          <div className="relative w-full max-w-md bg-[#111] border border-neutral-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <h3 className="text-lg font-medium text-white">Share Chat</h3>
              <button onClick={() => setActiveModal('none')} className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Share as Live Chat */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Users size={15} className="text-neutral-400" />
                    <span className="text-sm font-medium text-white">Share as Live Chat</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 ml-[23px]">Allow workspace members to see past and future messages.</p>
                </div>
                <button
                  onClick={() => {
                    setLiveChatEnabled(!liveChatEnabled)
                    if (!liveChatEnabled) console.log('Event Logged: askfrnd_live_chat_enabled')
                  }}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-none ${liveChatEnabled ? 'bg-emerald-500' : 'bg-neutral-700'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${liveChatEnabled ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Share Public Link */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Link2 size={15} className="text-neutral-400" />
                    <span className="text-sm font-medium text-white">Share Public Link</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 ml-[23px]">Get shareable link of the latest chat.</p>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-md border border-neutral-700 transition-colors flex-none"
                >
                  {linkCopied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              {/* Fork hint */}
              <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <GitBranch size={13} className="flex-none" />
                  <span>Anyone viewing a shared link can <strong className="text-neutral-300">Fork to My Workspace</strong> to iterate independently.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
