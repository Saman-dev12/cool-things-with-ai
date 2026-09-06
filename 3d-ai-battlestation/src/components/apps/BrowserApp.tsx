import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Search,
  Globe,
  Plus,
  X,
  Lock,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  Play,
  Pause,
  Volume2,
  ShoppingBag,
  Send,
  CloudRain,
  Cpu,
} from 'lucide-react';
import { soundFx } from '../../audio/soundEngine';
import { useOS } from '../../context/OSContext';

interface Tab {
  id: string;
  title: string;
  url: string;
  history: string[];
  historyIndex: number;
}

interface NewsItem {
  id: number;
  title: string;
  url: string;
  points: number;
  author: string;
  timeAgo: string;
  commentsCount: number;
  upvoted: boolean;
  comments: string[];
}

const INITIAL_NEWS: NewsItem[] = [
  {
    id: 1,
    title: 'NVIDIA GeForce RTX 5090 32GB GDDR7: Full Architectural Breakdown & Benchmarks',
    url: 'anandtech.cyber/rtx-5090',
    points: 842,
    author: 'quantum_coder',
    timeAgo: '2 hours ago',
    commentsCount: 156,
    upvoted: false,
    comments: [
      'The 32GB GDDR7 bandwidth is insane for local 70B LLM inference and 240 FPS path tracing.',
      'Glad to see Lian Li 360 AIOs keeping temperatures under 40°C on full load.',
    ],
  },
  {
    id: 2,
    title: 'Show HN: AetherOS - A 3D Spatial Holographic Operating System in React Three Fiber',
    url: 'github.com/aether/aetheros',
    points: 1204,
    author: 'antigravity_dev',
    timeAgo: '4 hours ago',
    commentsCount: 289,
    upvoted: false,
    comments: [
      'The transition between 3D studio orbit and 1:1 desktop screen focus is remarkably smooth.',
      'Web Audio procedural synthesizer with zero external MP3s is pure engineering genius.',
    ],
  },
  {
    id: 3,
    title: 'Why mechanical switches with PBT keycaps remain undefeated in 2026',
    url: 'geekhack.future/switches-2026',
    points: 419,
    author: 'thock_master',
    timeAgo: '6 hours ago',
    commentsCount: 88,
    upvoted: false,
    comments: [
      'Lubed linear switches with POM stems on an aluminum gasket mount will never be beaten.',
    ],
  },
  {
    id: 4,
    title: 'Wi-Fi 7 (802.11be) in practice: 10 Gbps wireless over 320 MHz channels',
    url: 'wireless.ieee/wifi7-field-test',
    points: 630,
    author: 'spectrum_walker',
    timeAgo: '7 hours ago',
    commentsCount: 112,
    upvoted: false,
    comments: [
      'Ping consistency down to 2-3ms feels indistinguishable from Cat8 Ethernet.',
    ],
  },
];

export const BrowserApp: React.FC = () => {
  const { openApp } = useOS();

  // Multi-tab state
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'Giggle Search',
      url: 'https://giggle.cyber/search',
      history: ['https://giggle.cyber/search'],
      historyIndex: 0,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // Active tab helper
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Address bar input
  const [urlInput, setUrlInput] = useState(activeTab.url);

  // Search Engine state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState<string | null>(null);

  // Video player state
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoLikes, setVideoLikes] = useState(4820);
  const [hasLikedVideo, setHasLikedVideo] = useState(false);
  const [videoComments, setVideoComments] = useState<string[]>([
    'CyberCat: Best lofi stream in the entire galaxy! 🐱✨',
    'NeoVibes: Studying for my quantum algorithms exam right now.',
    'SynthLover: The bassline drop at minute 12 was celestial.',
  ]);
  const [newVideoComment, setNewVideoComment] = useState('');

  // News state
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [expandedCommentsId, setExpandedCommentsId] = useState<number | null>(null);

  // Navigation function
  const navigateToUrl = (newUrl: string, title?: string) => {
    soundFx.click();
    setUrlInput(newUrl);

    let derivedTitle = title;
    if (!derivedTitle) {
      if (newUrl.includes('giggle.cyber')) derivedTitle = 'Giggle Search';
      else if (newUrl.includes('cyberpedia.org')) derivedTitle = 'CyberPedia';
      else if (newUrl.includes('cattube.cyber')) derivedTitle = 'CatTube Video';
      else if (newUrl.includes('hackernews.2088')) derivedTitle = 'HackerNews 2088';
      else if (newUrl.includes('store.aether')) derivedTitle = 'Aether Store';
      else derivedTitle = 'Web Document';
    }

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTabId) {
          const nextHistory = [...t.history.slice(0, t.historyIndex + 1), newUrl];
          return {
            ...t,
            url: newUrl,
            title: derivedTitle!,
            history: nextHistory,
            historyIndex: nextHistory.length - 1,
          };
        }
        return t;
      })
    );
  };

  const handleBack = () => {
    soundFx.click();
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const targetUrl = activeTab.history[newIndex];
      setUrlInput(targetUrl);
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, url: targetUrl, historyIndex: newIndex } : t))
      );
    }
  };

  const handleForward = () => {
    soundFx.click();
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const targetUrl = activeTab.history[newIndex];
      setUrlInput(targetUrl);
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, url: targetUrl, historyIndex: newIndex } : t))
      );
    }
  };

  const handleReload = () => {
    soundFx.arcadePowerup();
    const cur = activeTab.url;
    setUrlInput(cur);
  };

  const handleAddTab = () => {
    soundFx.click();
    const newTabId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newTabId,
      title: 'New Tab',
      url: 'https://giggle.cyber/search',
      history: ['https://giggle.cyber/search'],
      historyIndex: 0,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
    setUrlInput('https://giggle.cyber/search');
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.click();
    if (tabs.length <= 1) return;
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[0].id);
      setUrlInput(remaining[0].url);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.click();
    let target = urlInput.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.')) {
        target = `https://${target}`;
      } else {
        // Treat as search query
        setSearchQuery(target);
        setActiveQuery(target);
        target = `https://giggle.cyber/search?q=${encodeURIComponent(target)}`;
      }
    }
    navigateToUrl(target);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.click();
    if (!searchQuery.trim()) return;
    setActiveQuery(searchQuery.trim());
    navigateToUrl(`https://giggle.cyber/search?q=${encodeURIComponent(searchQuery)}`, `Giggle: ${searchQuery}`);
  };

  const toggleUpvote = (id: number) => {
    soundFx.click();
    setNews((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextUpvoted = !item.upvoted;
          return {
            ...item,
            upvoted: nextUpvoted,
            points: nextUpvoted ? item.points + 1 : item.points - 1,
          };
        }
        return item;
      })
    );
  };

  const handleVideoLike = () => {
    soundFx.arcadePowerup();
    setHasLikedVideo(!hasLikedVideo);
    setVideoLikes((l) => (hasLikedVideo ? l - 1 : l + 1));
  };

  const handleAddVideoComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoComment.trim()) return;
    soundFx.click();
    setVideoComments([...videoComments, `You: ${newVideoComment.trim()}`]);
    setNewVideoComment('');
  };

  // Determine which page to render based on URL
  const currentUrl = activeTab.url;
  const isSearchPage = currentUrl.includes('giggle.cyber');
  const isWikiPage = currentUrl.includes('cyberpedia.org');
  const isVideoPage = currentUrl.includes('cattube.cyber');
  const isNewsPage = currentUrl.includes('hackernews.2088');
  const isStorePage = currentUrl.includes('store.aether');

  return (
    <div className="w-full h-full bg-[#080c14] flex flex-col overflow-hidden text-gray-100 select-none font-sans">
      {/* 1. Browser Tab Strip */}
      <div className="bg-[#05080e] border-b border-white/10 px-2 pt-1.5 flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => {
                soundFx.click();
                setActiveTabId(tab.id);
                setUrlInput(tab.url);
              }}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-xl text-xs transition cursor-pointer max-w-[200px] border-t-2 shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white border-cyan-400 font-medium shadow-md'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border-transparent'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate text-xs">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 rounded transition shrink-0 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        <button
          onClick={handleAddTab}
          className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
          title="New Tab"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Navigation & Smart URL Bar */}
      <div className="bg-slate-900 border-b border-white/10 px-3 py-1.5 flex items-center gap-2">
        <div className="flex items-center gap-1 text-gray-400">
          <button
            onClick={handleBack}
            disabled={activeTab.historyIndex <= 0}
            className="p-1 hover:bg-white/10 rounded-md transition disabled:opacity-30 cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleForward}
            disabled={activeTab.historyIndex >= activeTab.history.length - 1}
            className="p-1 hover:bg-white/10 rounded-md transition disabled:opacity-30 cursor-pointer"
            title="Forward"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReload}
            className="p-1 hover:bg-white/10 rounded-md transition cursor-pointer"
            title="Reload"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigateToUrl('https://giggle.cyber/search')}
            className="p-1 hover:bg-white/10 rounded-md transition cursor-pointer"
            title="Giggle Home"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center bg-black/50 border border-white/10 rounded-xl px-3 py-1 text-xs text-gray-300 gap-2 focus-within:border-cyan-400 transition">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full bg-transparent outline-none text-xs text-gray-100 placeholder:text-gray-500 font-mono"
            placeholder="Search Giggle or type a web address..."
          />
        </form>
      </div>

      {/* 3. Bookmarks Quick Bar */}
      <div className="bg-slate-950/70 border-b border-white/5 px-3 py-1 flex items-center gap-3 text-[11px] text-gray-400 overflow-x-auto">
        <button
          onClick={() => navigateToUrl('https://giggle.cyber/search', 'Giggle Search')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 transition cursor-pointer shrink-0 ${
            isSearchPage ? 'text-cyan-400 bg-white/5 font-semibold' : ''
          }`}
        >
          <Search className="w-3 h-3" /> Giggle
        </button>
        <button
          onClick={() => navigateToUrl('https://cyberpedia.org/wiki/Quantum_OS', 'CyberPedia')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 transition cursor-pointer shrink-0 ${
            isWikiPage ? 'text-pink-400 bg-white/5 font-semibold' : ''
          }`}
        >
          <Bookmark className="w-3 h-3" /> CyberPedia
        </button>
        <button
          onClick={() => navigateToUrl('https://cattube.cyber/watch?v=lofi-cat', 'CatTube Live')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 transition cursor-pointer shrink-0 ${
            isVideoPage ? 'text-yellow-400 bg-white/5 font-semibold' : ''
          }`}
        >
          🎬 CatTube Live
        </button>
        <button
          onClick={() => navigateToUrl('https://hackernews.2088/top', 'HackerNews 2088')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 transition cursor-pointer shrink-0 ${
            isNewsPage ? 'text-orange-400 bg-white/5 font-semibold' : ''
          }`}
        >
          🔥 HackerNews 2088
        </button>
        <button
          onClick={() => navigateToUrl('https://store.aether/apps', 'Aether Store')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 transition cursor-pointer shrink-0 ${
            isStorePage ? 'text-emerald-400 bg-white/5 font-semibold' : ''
          }`}
        >
          <ShoppingBag className="w-3 h-3" /> Aether Store
        </button>
      </div>

      {/* 4. Page Viewport */}
      <div className="flex-1 overflow-y-auto p-5 bg-[#090e18]">
        {/* ================= PAGE 1: GIGGLE SEARCH ================= */}
        {isSearchPage && (
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center pt-6 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400 font-mono">
                Giggle
              </span>
              <span className="text-xs ml-2 font-mono text-cyan-400 px-2 py-0.5 bg-cyan-950/60 rounded-full border border-cyan-800">
                Quantum v9.4
              </span>
              <p className="text-xs text-gray-400">The decentralized neural multiverse search index</p>
            </div>

            <form onSubmit={handleSearchSubmit} className="w-full flex gap-2">
              <input
                type="text"
                placeholder="Search quantum multiverse, RTX 5090, weather, games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-slate-900 border border-cyan-500/30 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-cyan-400 focus:outline-none shadow-xl shadow-cyan-950/30"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Trending Quick Search Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
              <span>Trending:</span>
              {['RTX 5090', 'Neo-Tokyo Weather', 'Quantum OS', 'Cyberpunk Games'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    setActiveQuery(tag);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 transition cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Rich Search Result Cards */}
            {activeQuery && (
              <div className="w-full space-y-4 pt-4 border-t border-white/10">
                <div className="text-xs text-gray-400 flex justify-between">
                  <span>Results for <strong className="text-white">"{activeQuery}"</strong></span>
                  <span className="font-mono text-emerald-400">Found 4,289,000,000 results in 0.0002ms</span>
                </div>

                {/* Special Instant Answer: RTX 5090 */}
                {activeQuery.toLowerCase().includes('5090') || activeQuery.toLowerCase().includes('gpu') ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Cpu className="w-4 h-4" />
                      <span>NVIDIA GeForce RTX 5090 32GB GDDR7 Flagship Telemetry</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="text-gray-400 text-[10px]">Architecture</div>
                        <div className="font-semibold text-white">Blackwell GB202</div>
                      </div>
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="text-gray-400 text-[10px]">VRAM</div>
                        <div className="font-semibold text-emerald-400">32GB GDDR7</div>
                      </div>
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="text-gray-400 text-[10px]">Target Display</div>
                        <div className="font-semibold text-cyan-300">240 FPS Path Traced</div>
                      </div>
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="text-gray-400 text-[10px]">AIO Temp</div>
                        <div className="font-semibold text-emerald-400">38°C (Lian Li LCD)</div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Special Instant Answer: Weather */}
                {activeQuery.toLowerCase().includes('weather') ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/40 shadow-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-cyan-300 font-bold">
                        <CloudRain className="w-5 h-5 animate-bounce" />
                        <span>Neo-Tokyo Weather Forecast</span>
                      </div>
                      <span className="text-2xl font-black text-white font-mono">21°C</span>
                    </div>
                    <div className="text-xs text-gray-300">
                      Gentle cyber drizzle with neon reflections. Humidity 72%, Wind 8 km/h NE, Optical Visibility: 99.4%.
                    </div>
                  </div>
                ) : null}

                {/* Standard Results */}
                {[
                  {
                    title: `Quantum Computing and 3D Workstations: The Future of ${activeQuery}`,
                    url: `https://tech.cyber/quantum/${encodeURIComponent(activeQuery)}`,
                    snippet: `Explore how modern high-performance GPUs and Web Audio engines are revolutionizing interactive 3D simulations in ${activeQuery}.`,
                  },
                  {
                    title: `Complete Guide to AetherOS Spatial Computing & Neural Nodes`,
                    url: `https://cyberpedia.org/wiki/AetherOS_Guide`,
                    snippet: `Deep dive into monolithic hybrid microkernels, 60 FPS physics engines, and procedural audio graphs.`,
                  },
                  {
                    title: `Why 240Hz OLED Displays and Mechanical Keyboards Change Everything`,
                    url: `https://hardware.2088/displays/oled-g9-review`,
                    snippet: `Testing the Samsung Odyssey OLED G9 curved ultra-wide monitor with instantaneous 0.03ms pixel response times.`,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-900/60 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition cursor-pointer"
                  >
                    <div className="text-[11px] text-gray-500 font-mono">{item.url}</div>
                    <div className="text-sm font-semibold text-cyan-300 hover:underline mt-0.5">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {item.snippet}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= PAGE 2: CYBERPEDIA ================= */}
        {isWikiPage && (
          <div className="max-w-2xl mx-auto space-y-4 text-xs leading-relaxed text-gray-300">
            <div className="border-b border-white/10 pb-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">Quantum Operating System (AetherOS)</h1>
              <p className="text-gray-400 text-xs">From CyberPedia, the decentralized free encyclopedia</p>
            </div>

            {/* Infobox */}
            <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl float-right ml-4 mb-2 w-64 space-y-2.5 shadow-xl">
              <div className="font-bold text-center text-cyan-300 border-b border-cyan-800/60 pb-1.5 text-sm">
                AetherOS 2026 Ultimate
              </div>
              <div className="text-xs space-y-1.5 text-gray-300">
                <div className="flex justify-between"><span className="text-gray-400">Developer:</span> Aether Labs</div>
                <div className="flex justify-between"><span className="text-gray-400">Platform:</span> WebGL / R3F</div>
                <div className="flex justify-between"><span className="text-gray-400">Hardware Rig:</span> AMD 9950X3D + RTX 5090</div>
                <div className="flex justify-between"><span className="text-gray-400">Audio Engine:</span> 100% Procedural Synth</div>
                <div className="flex justify-between"><span className="text-gray-400">Frame Target:</span> 240 FPS OLED G9</div>
              </div>
            </div>

            <p>
              The <strong className="text-cyan-300">Quantum Operating System (AetherOS)</strong> is a revolutionary spatial desktop environment that blends an interactive 3D studio workstation with a responsive desktop operating system layer.
            </p>

            <h2 className="text-base font-bold text-pink-400 mt-4 border-b border-white/10 pb-1">
              1. Spatial Desktop Paradigm
            </h2>
            <p>
              Unlike legacy flat operating systems, AetherOS projects applications inside an orbitable 3D room with physically based materials, an anodized aluminum PC case with an internal RTX 5090 and Lian Li 360 LCD cooler, studio monitors, and acoustic wall slats. Users can freely switch between 3D Studio exploration and 1:1 Desktop focus mode.
            </p>

            <h2 className="text-base font-bold text-pink-400 mt-4 border-b border-white/10 pb-1">
              2. Procedural Audio Synthesis
            </h2>
            <p>
              Every sound effect and musical composition is generated live through the browser's Web Audio API using mathematical oscillators and frequency filters, eliminating external audio file dependencies.
            </p>
          </div>
        )}

        {/* ================= PAGE 3: CATTUBE VIDEO ================= */}
        {isVideoPage && (
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Simulated Live Video Player */}
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative border border-white/10 flex flex-col items-center justify-center group shadow-2xl">
              <div className="text-center space-y-2 z-10 select-none">
                <div className="text-6xl animate-bounce">🐱🎧</div>
                <div className="text-base font-bold text-white tracking-wide">
                  CyberCat: 24/7 Lofi Synth Beats to Relax/Hack To
                </div>
                <div className="text-xs text-pink-400 font-mono">
                  Live Satellite Feed • Neo-Tokyo Space Station
                </div>
              </div>

              {/* Video Player Controls Bar */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-3 text-xs bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 z-20">
                <button
                  onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                  className="text-white hover:text-cyan-400 transition cursor-pointer"
                >
                  {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <div className="flex-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[10px] text-rose-400 font-bold uppercase font-mono">LIVE</span>
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-4/5 h-full bg-pink-500 rounded-full" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">6,420 watching</span>
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>

            {/* Video Info & Likes */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">Lofi Cyber Cat - 24/7 Relaxing Synth Beats</h2>
                <div className="text-xs text-gray-400 mt-0.5">14,289,102 views • Streamed 2 hours ago</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleVideoLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer text-xs font-semibold ${
                    hasLikedVideo
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{videoLikes}</span>
                </button>
              </div>
            </div>

            {/* Live Comments */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Chat ({videoComments.length})</span>
              </h3>

              <div className="space-y-1.5 max-h-36 overflow-y-auto bg-slate-950/60 p-3 rounded-2xl border border-white/5 font-mono text-xs">
                {videoComments.map((c, i) => (
                  <div key={i} className="text-gray-300 py-0.5">
                    {c}
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddVideoComment} className="flex gap-2">
                <input
                  type="text"
                  value={newVideoComment}
                  onChange={(e) => setNewVideoComment(e.target.value)}
                  placeholder="Send a chat message..."
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-gray-500 outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= PAGE 4: HACKERNEWS 2088 ================= */}
        {isNewsPage && (
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-orange-500 text-black font-black flex items-center justify-center text-xs rounded">
                  Y
                </div>
                <h1 className="text-sm font-bold text-white tracking-wide">HackerNews 2088</h1>
              </div>
              <span className="text-[11px] text-gray-400">Top Tech Articles & Quantum Discussions</span>
            </div>

            {/* News Articles List */}
            <div className="space-y-2">
              {news.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-900/60 rounded-2xl border border-white/10 hover:border-orange-500/30 transition space-y-1.5"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xs text-gray-500 font-mono w-4 shrink-0 pt-0.5">{idx + 1}.</span>
                    <button
                      onClick={() => toggleUpvote(item.id)}
                      className={`p-1 rounded-lg border transition cursor-pointer shrink-0 ${
                        item.upvoted
                          ? 'bg-orange-500 text-black border-orange-400 font-bold'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:text-orange-400'
                      }`}
                      title="Upvote"
                    >
                      ▲
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white hover:text-orange-300 cursor-pointer">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono truncate">{item.url}</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-400 flex items-center gap-3 pl-11">
                    <span className="text-orange-300 font-semibold">{item.points} points</span>
                    <span>by {item.author}</span>
                    <span>{item.timeAgo}</span>
                    <button
                      onClick={() => setExpandedCommentsId(expandedCommentsId === item.id ? null : item.id)}
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      {item.commentsCount} comments
                    </button>
                  </div>

                  {/* Expanded Comments */}
                  {expandedCommentsId === item.id && (
                    <div className="ml-11 mt-2 p-3 rounded-xl bg-slate-950 border border-white/5 space-y-2 text-xs text-gray-300">
                      {item.comments.map((comment, cIdx) => (
                        <div key={cIdx} className="p-2 rounded-lg bg-white/5 border border-white/5">
                          "{comment}"
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= PAGE 5: AETHER STORE ================= */}
        {isStorePage && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-emerald-400" />
                AetherOS App Ecosystem
              </h1>
              <p className="text-xs text-gray-400">Discover and launch built-in workstation applications</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'code',
                  name: 'CodeCraft Studio',
                  desc: 'Full IDE with real JavaScript code sandbox execution, multi-tab files, and quantum benchmarks.',
                  badge: 'Featured',
                },
                {
                  id: 'arcade',
                  name: 'Aether Arcade Hub',
                  desc: '4-in-1 retro games station: Space Defender, Cyber Snake 2088, Neon Breaker, and Hacker Typing.',
                  badge: '4 Games',
                },
                {
                  id: 'music',
                  name: 'WaveBeats Synthesizer',
                  desc: 'Procedural synth music with 5 unique compositions, vinyl visualizer, and seekable tracks.',
                  badge: 'Lossless',
                },
                {
                  id: 'terminal',
                  name: 'CyberTerminal (zsh)',
                  desc: 'Realistic UNIX terminal with neofetch hardware telemetry, matrix stream, and file commands.',
                  badge: 'Flagship',
                },
              ].map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 transition space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white">{app.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                        {app.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{app.desc}</p>
                  </div>
                  <button
                    onClick={() => {
                      soundFx.click();
                      openApp(app.id as any);
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow hover:brightness-110 active:scale-95 transition cursor-pointer"
                  >
                    Launch Application
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
