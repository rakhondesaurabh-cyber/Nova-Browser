import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, ArrowRight, RotateCw, Undo2, Redo2, Home, Search, Star, Menu as MenuIcon, History, Bookmark, Settings, Terminal, LayoutTemplate, Braces, Smartphone, Sparkles, EyeOff, Info , Columns , ChevronDown , ChevronUp , Download, PlayCircle, PictureInPicture2, Pause, Volume2, XCircle, ZoomIn, Maximize, Minus } from 'lucide-react';
import { HistoryPage, BookmarksPage, NewTabPage, SettingsPage, AboutPage } from './components/InternalPages';
import { DeveloperDashboardPage, ApiTesterPage, JsonViewerPage } from './components/DeveloperPages';
import { CommandPalette } from './components/CommandPalette';
import { AISidebar } from './components/AISidebar';
import './styles/index.css';
import novaIcon from '../../assets/icon.png';

const SidebarItem = ({ icon, label, active, onClick, isCollapsed }: any) => (
  <div onClick={onClick} className={`sidebar-item ${active ? 'active' : ''}`} title={isCollapsed ? label : ''}>
    <div className="icon-wrapper">{icon}</div>
    {!isCollapsed && <span>{label}</span>}
  </div>
);

const isPrivate = new URLSearchParams(window.location.search).get('private') === 'true';

export default function App() {
  const [tabs, setTabs] = useState<any[]>([]);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [url, setUrl] = useState('');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSplitMenu, setShowSplitMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isVerticalTabs, setIsVerticalTabs] = useState(localStorage.getItem('ntVerticalTabs') === 'true');
  const [responsiveMode, setResponsiveMode] = useState<{w: number, h: number} | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [draggedTabId, setDraggedTabId] = useState<number | null>(null);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [zoomLevel, setZoomLevel] = useState(0);

  useEffect(() => {
    if (isMenuOpen && activeTabId && (window as any).electronAPI?.getZoom) {
      (window as any).electronAPI.getZoom(activeTabId).then((lvl: number) => {
        setZoomLevel(lvl);
      });
    }
  }, [isMenuOpen, activeTabId]);

  const handleZoom = (delta: number) => {
    const newLevel = zoomLevel + delta;
    setZoomLevel(newLevel);
    if (activeTabId && (window as any).electronAPI?.setZoom) {
      (window as any).electronAPI.setZoom(activeTabId, newLevel);
    }
  };

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.('.menu-container')) {
        setIsMenuOpen(false);
        setIsMediaOpen(false);
        setIsDownloadsOpen(false);
        setShowSplitMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkBookmark = async (checkUrl: string) => {
    if ((window as any).electronAPI) {
      setIsBookmarked(await (window as any).electronAPI.isBookmarked(checkUrl));
    }
  };

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAIOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);

    // Initial setup from main process
    // For now we'll just mock it if not running in electron
    if ((window as any).electronAPI) {
      (window as any).electronAPI.onTabUpdated((tab: any) => {
        setTabs((prev) => prev.map((t) => (t.id === tab.id ? { ...t, ...tab } : t)));
        if (tab.id === activeTabId) {
          setUrl(tab.url);
        }
      });
      (window as any).electronAPI.onTabCreated((tab: any) => {
        setTabs((prev) => {
          if (prev.find((t: any) => t.id === tab.id)) return prev;
          return [...prev, tab];
        });
        setActiveTabId(tab.id);
        setUrl(tab.url);
      });
      (window as any).electronAPI.onTabClosed((id: number) => {
        setTabs((prev) => {
          const newTabs = prev.filter((t) => t.id !== id);
          if (activeTabId === id && newTabs.length > 0) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
          }
          return newTabs;
        });
      });
      
      (window as any).electronAPI.onKeyboardShortcut((action: string, payload?: any) => {
        if (action === 'new-tab') {
          handleCreateTab();
        } else if (action === 'new-tab-url' && payload) {
          if ((window as any).electronAPI) {
            (window as any).electronAPI.createTab(payload);
          }
        } else if (action === 'switch-tab' && payload) {
          setActiveTabId(payload);
        } else if (action === 'focus-url') {
          const urlInput = document.querySelector('.url-input') as HTMLInputElement;
          if (urlInput) {
            urlInput.focus();
            urlInput.select();
          }
        } else if (action === 'navigate-developer') {
          if ((window as any).electronAPI && activeTabId) {
            (window as any).electronAPI.navigateTab(activeTabId, 'nova://developer');
          }
        } else if (action === 'toggle-responsive') {
          setResponsiveMode(prev => prev ? null : { w: 390, h: 844 });
        } else if (action === 'close-tab') {
          // Handled in main
        }
      });
      (window as any).electronAPI.restoreSession();

      if ((window as any).electronAPI.onDownloadStarted) {
        (window as any).electronAPI.onDownloadStarted((data: any) => {
          setDownloads(prev => [{ ...data, state: 'progressing', receivedBytes: 0 }, ...prev]);
          setIsDownloadsOpen(true);
        });
        (window as any).electronAPI.onDownloadProgress((data: any) => {
          setDownloads(prev => prev.map((d: any) => d.id === data.id ? { ...d, receivedBytes: data.receivedBytes, totalBytes: data.totalBytes, state: 'progressing' } : d));
        });
        (window as any).electronAPI.onDownloadCompleted((data: any) => {
          setDownloads(prev => prev.map((d: any) => d.id === data.id ? { ...d, state: 'completed', savePath: data.savePath } : d));
        });
        (window as any).electronAPI.onDownloadError((data: any) => {
          setDownloads(prev => prev.map((d: any) => d.id === data.id ? { ...d, state: 'error', error: data.error } : d));
        });
        (window as any).electronAPI.onDownloadPaused((data: any) => {
          setDownloads(prev => prev.map((d: any) => d.id === data.id ? { ...d, state: 'paused' } : d));
        });
      }
    } else {
      // Mock for browser testing
      setTabs([{ id: 1, title: 'New Tab', url: 'nova://newtab/', isLoading: false }]);
      setActiveTabId(1);
      setUrl('nova://newtab/');
    }

    // Apply global theme color
    const savedTheme = localStorage.getItem('ntThemeColor') || '#3b82f6';
    const savedMode = isPrivate ? 'dark' : (localStorage.getItem('ntThemeMode') || 'dark');
    document.documentElement.style.setProperty('--theme-color', savedTheme);
    document.body.style.setProperty('--theme-color', savedTheme);
    document.documentElement.setAttribute('data-theme', savedMode);
    if ((window as any).electronAPI) {
      (window as any).electronAPI.updateThemeMode(savedMode);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ntThemeColor' && e.newValue) {
        document.documentElement.style.setProperty('--theme-color', e.newValue);
        document.body.style.setProperty('--theme-color', e.newValue);
      }
      if (e.key === 'ntThemeMode' && e.newValue) {
        document.documentElement.setAttribute('data-theme', e.newValue);
        if ((window as any).electronAPI) {
          (window as any).electronAPI.updateThemeMode(e.newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Also check periodically in case of origin mismatch during dev
    const interval = setInterval(() => {
      const currentTheme = localStorage.getItem('ntThemeColor');
      const currentMode = localStorage.getItem('ntThemeMode');
      if (currentTheme && document.documentElement.style.getPropertyValue('--theme-color') !== currentTheme) {
        document.documentElement.style.setProperty('--theme-color', currentTheme);
        document.body.style.setProperty('--theme-color', currentTheme);
      }
      if (currentMode && document.documentElement.getAttribute('data-theme') !== currentMode) {
        document.documentElement.setAttribute('data-theme', currentMode);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab) {
      setUrl(activeTab.url);
      checkBookmark(activeTab.url);
      if ((window as any).electronAPI) {
        (window as any).electronAPI.switchTab(activeTabId);
        // Ensure responsive mode follows the tab
        (window as any).electronAPI.setResponsiveMode(activeTabId, responsiveMode);
      }
    }
  }, [activeTabId, tabs, responsiveMode]);

  useEffect(() => {
    if ((window as any).electronAPI && (window as any).electronAPI.setAiSidebarWidth) {
      (window as any).electronAPI.setAiSidebarWidth(isAIOpen ? 320 : 0);
    }
  }, [isAIOpen]);

  const toggleResponsiveMode = (preset: {w: number, h: number} | null) => {
    setResponsiveMode(preset);
    if (activeTabId && (window as any).electronAPI) {
      (window as any).electronAPI.setResponsiveMode(activeTabId, preset);
    }
  };

  const handleCreateTab = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.createTab('nova://newtab/');
    } else {
      const newId = Date.now();
      setTabs([...tabs, { id: newId, title: 'New Tab', url: 'nova://newtab/', isLoading: false }]);
      setActiveTabId(newId);
    }
  };

  const handleCloseTab = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if ((window as any).electronAPI) {
      (window as any).electronAPI.closeTab(id);
    } else {
      setTabs(tabs.filter(t => t.id !== id));
    }
  };

  const handleToggleBookmark = async () => {
    if (!activeTabId) return;
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab || activeTab.url.startsWith('nova://')) return;

    if ((window as any).electronAPI) {
      if (isBookmarked) {
        await (window as any).electronAPI.removeBookmark(activeTab.url);
        setIsBookmarked(false);
      } else {
        await (window as any).electronAPI.addBookmark(activeTab.url, activeTab.title, activeTab.favicon);
        setIsBookmarked(true);
      }
    }
  };

  const handleNavigate = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = url;

    let searchEngine = 'google';
    if ((window as any).electronAPI) {
      const settings = await (window as any).electronAPI.aiGetSettings();
      if (settings?.searchEngine) searchEngine = settings.searchEngine;
    }

    if (/^https?:\/\//i.test(finalUrl)) {
      // Do nothing, it's a valid URL
    } else if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
      finalUrl = 'https://' + finalUrl;
    } else {
      const queries: any = {
        google: 'https://www.google.com/search?q=',
        bing: 'https://www.bing.com/search?q=',
        duckduckgo: 'https://duckduckgo.com/?q=',
        brave: 'https://search.brave.com/search?q='
      };
      const prefix = queries[searchEngine] || queries.google;
      finalUrl = prefix + encodeURIComponent(finalUrl);
    }
    
    if ((window as any).electronAPI && activeTabId) {
      (window as any).electronAPI.navigateTab(activeTabId, finalUrl);
    } else {
      setTabs(tabs.map(t => t.id === activeTabId ? { ...t, url: finalUrl } : t));
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  useEffect(() => {
    localStorage.setItem('ntVerticalTabs', isVerticalTabs.toString());
    if ((window as any).electronAPI) {
      (window as any).electronAPI.setVerticalTabs(isVerticalTabs);
    }
  }, [isVerticalTabs]);

  useEffect(() => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.setSidebarWidth(isSidebarCollapsed ? 68 : 260);
    }
  }, [isSidebarCollapsed]);

  return (
    <div className="browser-shell new-ui">
      {/* SIDEBAR */}
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header" style={{ justifyContent: isSidebarCollapsed ? 'center' : 'space-between', paddingRight: isSidebarCollapsed ? '0' : '16px' }}>
          {!isSidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={novaIcon} className="logo-icon" alt="NOVA" />
              <span>NOVA</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', WebkitAppRegion: 'no-drag' } as any}
            title="Toggle Sidebar"
          >
            <MenuIcon size={18} />
          </button>
        </div>
        
        <div className="sidebar-nav-actions">
          <ArrowLeft size={16} onClick={() => activeTabId && (window as any).electronAPI?.goBack(activeTabId)} className={activeTab?.canGoBack ? 'active-icon' : 'disabled-icon'} />
          <ArrowRight size={16} onClick={() => activeTabId && (window as any).electronAPI?.goForward(activeTabId)} className={activeTab?.canGoForward ? 'active-icon' : 'disabled-icon'} />
          <RotateCw size={16} onClick={() => activeTabId && (window as any).electronAPI?.reload(activeTabId)} className="active-icon" />
        </div>

        
        {!isSidebarCollapsed && isVerticalTabs && (
          <div className="sidebar-vertical-tabs">
            <div className="sidebar-section-title">Open Tabs</div>
            <div className={`tabs-container ${isVerticalTabs ? 'vertical' : 'horizontal'}`}>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                draggable
                onDragStart={(e) => {
                  setDraggedTabId(tab.id);
                  e.dataTransfer.effectAllowed = 'move';
                  e.currentTarget.style.opacity = '0.5';
                }}
                onDragEnd={(e) => {
                  setDraggedTabId(null);
                  e.currentTarget.style.opacity = '1';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!draggedTabId || draggedTabId === tab.id) return;
                  const newTabs = [...tabs];
                  const dragIndex = newTabs.findIndex(t => t.id === draggedTabId);
                  const dropIndex = newTabs.findIndex(t => t.id === tab.id);
                  const [removed] = newTabs.splice(dragIndex, 1);
                  newTabs.splice(dropIndex, 0, removed);
                  setTabs(newTabs);
                  if ((window as any).electronAPI) {
                    (window as any).electronAPI.reorderTabs(newTabs.map(t => t.id));
                  }
                  setDraggedTabId(null);
                }}
                className={`nova-tab ${activeTabId === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTabId(tab.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if ((window as any).electronAPI) (window as any).electronAPI.showTabMenu(tab.id);
                }}
              >
                {tab.isLoading ? (
                  <RotateCw size={12} className="tab-favicon spin" />
                ) : tab.favicon ? (
                  <img src={tab.favicon} className="tab-favicon" alt="" />
                ) : (
                  <div className="tab-favicon-placeholder">
                    {tab.url.startsWith('nova://') ? <Terminal size={12} color="#888" /> : null}
                  </div>
                )}
                <span className="tab-title">{tab.title || 'New Tab'}</span>
                <button className="close-tab" onClick={(e) => handleCloseTab(e, tab.id)}>×</button>
              </div>
            ))}
            <button className="new-tab-btn" onClick={handleCreateTab}>
              <Plus size={16} />
            </button>
          </div>
          </div>
        )}
        <div className="sidebar-menus">
          <SidebarItem icon={<Home size={16} />} label="Home" active={activeTab?.url.startsWith('nova://newtab')} onClick={() => activeTabId && (window as any).electronAPI.navigateTab(activeTabId, 'nova://newtab/')} isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={<History size={16} />} label="History" active={activeTab?.url.startsWith('nova://history')} onClick={() => activeTabId && (window as any).electronAPI.navigateTab(activeTabId, 'nova://history/')} isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={<Bookmark size={16} />} label="Bookmarks" active={activeTab?.url.startsWith('nova://bookmarks')} onClick={() => activeTabId && (window as any).electronAPI.navigateTab(activeTabId, 'nova://bookmarks/')} isCollapsed={isSidebarCollapsed} />

          {!isSidebarCollapsed && <div className="sidebar-section-title">Nova Pages</div>}
          <SidebarItem icon={<Plus size={16} />} label="New Tab" onClick={handleCreateTab} isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={<History size={16} />} label="History" onClick={() => activeTabId && (window as any).electronAPI.navigateTab(activeTabId, 'nova://history/')} isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={<Bookmark size={16} />} label="Bookmarks" onClick={() => activeTabId && (window as any).electronAPI.navigateTab(activeTabId, 'nova://bookmarks/')} isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={<Settings size={16} />} label="Settings" onClick={() => activeTabId && (window as any).electronAPI.navigateTab(activeTabId, 'nova://settings/')} isCollapsed={isSidebarCollapsed} />
          <SidebarItem icon={<Info size={16} />} label="About NOVA" onClick={() => activeTabId && (window as any).electronAPI.navigateTab(activeTabId, 'nova://about/')} isCollapsed={isSidebarCollapsed} />
        </div>

        {!isSidebarCollapsed && (
          <div className="sidebar-footer">
            <img src={novaIcon} className="logo-icon" alt="NOVA" />
            <div className="footer-text">
              <div className="title">NOVA Browser</div>
              <div className="subtitle">Browse the web, your way.</div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN AREA */}
      <div className="main-area">
        {/* TITLE BAR (Tabs) */}
        {!isVerticalTabs && (
          <div className="title-bar">
            <div className={`tabs-container ${isVerticalTabs ? 'vertical' : 'horizontal'}`}>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                draggable
                onDragStart={(e) => {
                  setDraggedTabId(tab.id);
                  e.dataTransfer.effectAllowed = 'move';
                  e.currentTarget.style.opacity = '0.5';
                }}
                onDragEnd={(e) => {
                  setDraggedTabId(null);
                  e.currentTarget.style.opacity = '1';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!draggedTabId || draggedTabId === tab.id) return;
                  const newTabs = [...tabs];
                  const dragIndex = newTabs.findIndex(t => t.id === draggedTabId);
                  const dropIndex = newTabs.findIndex(t => t.id === tab.id);
                  const [removed] = newTabs.splice(dragIndex, 1);
                  newTabs.splice(dropIndex, 0, removed);
                  setTabs(newTabs);
                  if ((window as any).electronAPI) {
                    (window as any).electronAPI.reorderTabs(newTabs.map(t => t.id));
                  }
                  setDraggedTabId(null);
                }}
                className={`nova-tab ${activeTabId === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTabId(tab.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if ((window as any).electronAPI) (window as any).electronAPI.showTabMenu(tab.id);
                }}
              >
                {tab.isLoading ? (
                  <RotateCw size={12} className="tab-favicon spin" />
                ) : tab.favicon ? (
                  <img src={tab.favicon} className="tab-favicon" alt="" />
                ) : (
                  <div className="tab-favicon-placeholder">
                    {tab.url.startsWith('nova://') ? <Terminal size={12} color="#888" /> : null}
                  </div>
                )}
                <span className="tab-title">{tab.title || 'New Tab'}</span>
                <button className="close-tab" onClick={(e) => handleCloseTab(e, tab.id)}>×</button>
              </div>
            ))}
            <button className="new-tab-btn" onClick={handleCreateTab}>
              <Plus size={16} />
            </button>
          </div>
          </div>
        )}

        {/* ADDRESS BAR */}
        <div className="address-bar-container">
          <button className={`nav-icon ${activeTab?.canGoBack ? 'active' : 'disabled'}`} onClick={() => activeTabId && (window as any).electronAPI?.goBack(activeTabId)}>
            <ArrowLeft size={16} />
          </button>
          <button className="nav-icon active" onClick={() => activeTabId && (window as any).electronAPI?.reload(activeTabId)}>
            <RotateCw size={16} />
          </button>
          
          {isPrivate && (
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', padding: '4px 8px', borderRadius: '16px', fontSize: '11px', marginRight: '8px', fontWeight: 'bold' }}>
              <EyeOff size={12} style={{ marginRight: '4px' }} /> Private
            </div>
          )}

          <form className="url-bar" onSubmit={handleNavigate}>
            <Search size={14} className="search-icon" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Search or enter URL"
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setUrl(activeTab?.url || '');
                  e.currentTarget.blur();
                }
              }}
            />
          </form>
          
          {activeTab && !activeTab.url.startsWith('nova://') && (
            <button 
              type="button" 
              className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={handleToggleBookmark}
            >
              <Star size={16} fill={isBookmarked ? "#eab308" : "none"} color={isBookmarked ? "#eab308" : "#888"} />
            </button>
          )}

          <button className="nav-icon active" onClick={() => setIsAIOpen(!isAIOpen)} title="Ask NOVA AI (Ctrl+Shift+A)">
            <Sparkles size={16} color="#c084fc" />
          </button>

          {/* Media Button */}
          {tabs.some(t => (t as any).isAudible) && (
            <div className="menu-container" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
              <button className="nav-icon active" style={{ color: '#ec4899' }} onClick={() => setIsMediaOpen(prev => !prev)} title="Media Controls">
                <Volume2 size={16} />
              </button>
              {isMediaOpen && (
                <div className="browser-menu" style={{ width: '250px' }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>Playing Now</div>
                  {tabs.filter(t => (t as any).isAudible).map(t => (
                    <div key={t.id} style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {t.favicon ? <img src={t.favicon} style={{ width: 16, height: 16 }} /> : <Volume2 size={16} />}
                        <span style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                        <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => (window as any).electronAPI.mediaPlayPause(t.id)}>
                          <PlayCircle size={20} />
                        </button>
                        <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => (window as any).electronAPI.mediaPip(t.id)}>
                          <PictureInPicture2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Downloads Button */}
          <div className="menu-container" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            <button className="nav-icon active" onClick={() => setIsDownloadsOpen(prev => !prev)}>
              <Download size={16} />
              {downloads.some((d: any) => d.state === 'progressing') && (
                <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%' }}></div>
              )}
            </button>
            {isDownloadsOpen && (
              <div className="browser-menu" style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Downloads</span>
                  {downloads.length > 0 && <button onClick={() => setDownloads([])} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>Clear</button>}
                </div>
                {downloads.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No downloads yet</div>
                ) : (
                  downloads.map((d: any) => (
                    <div key={d.id} style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>{d.fileName}</div>
                      {d.state === 'progressing' && (
                        <div>
                          <div style={{ height: '4px', background: 'var(--overlay-5)', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                            <div style={{ height: '100%', background: '#3b82f6', width: `${Math.max(5, (d.receivedBytes / d.totalBytes) * 100)}%` }}></div>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{(d.receivedBytes / 1024 / 1024).toFixed(1)} MB / {(d.totalBytes / 1024 / 1024).toFixed(1)} MB</span>
                            <span>Downloading...</span>
                          </div>
                        </div>
                      )}
                      {d.state === 'completed' && <div style={{ fontSize: '11px', color: '#10b981' }}>Completed</div>}
                      {d.state === 'error' && <div style={{ fontSize: '11px', color: '#ef4444' }}>Failed</div>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          
          <div className="menu-container">
            <button className="nav-icon active" onClick={() => {
              if ((window as any).electronAPI) (window as any).electronAPI.showBrowserMenu();
            }}>
              <MenuIcon size={16} />
            </button>
          </div>
        </div>

        {/* Responsive Bar */}
        {responsiveMode && !activeTab?.url.startsWith('nova://') && (
          <div style={{ height: '40px', background: '#333', borderBottom: '1px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <button onClick={() => toggleResponsiveMode({ w: 1440, h: 900 })} style={{ padding: '4px 8px', background: responsiveMode.w === 1440 ? '#6366f1' : '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Desktop (1440x900)</button>
            <button onClick={() => toggleResponsiveMode({ w: 768, h: 1024 })} style={{ padding: '4px 8px', background: responsiveMode.w === 768 ? '#6366f1' : '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Tablet (768x1024)</button>
            <button onClick={() => toggleResponsiveMode({ w: 390, h: 844 })} style={{ padding: '4px 8px', background: responsiveMode.w === 390 ? '#6366f1' : '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Mobile (390x844)</button>
            <button onClick={() => toggleResponsiveMode(null)} style={{ padding: '4px 8px', background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '20px' }}>Close</button>
          </div>
        )}

        {/* TAB CONTENT */}
        <div className="tab-content">
          {activeTab?.url.startsWith('nova://history') && <HistoryPage activeTabId={activeTabId} />}
          {activeTab?.url.startsWith('nova://bookmarks') && <BookmarksPage activeTabId={activeTabId} />}
          {activeTab?.url.startsWith('nova://newtab') && <NewTabPage activeTabId={activeTabId!} />}
          {activeTab?.url.startsWith('nova://settings') && <SettingsPage />}
          {activeTab?.url.startsWith('nova://about') && <AboutPage />}
          {activeTab?.url.startsWith('nova://developer') && <DeveloperDashboardPage activeTabId={activeTabId} />}
          {activeTab?.url.startsWith('nova://api') && <ApiTesterPage />}
          {activeTab?.url.startsWith('nova://json') && <JsonViewerPage url={activeTab?.url} />}
        </div>
      </div>
      
      <CommandPalette 
        isVisible={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
        activeTabId={activeTabId}
        onToggleResponsive={() => toggleResponsiveMode(responsiveMode ? null : { w: 390, h: 844 })}
        onOpenAI={() => setIsAIOpen(true)}
      />
      <AISidebar 
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        activeTabId={activeTabId}
      />
    </div>
  );
}
