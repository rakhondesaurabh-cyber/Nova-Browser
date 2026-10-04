import React, { useEffect, useState } from 'react';
import { Search, Plus, Video, Book, PenTool, LayoutTemplate, Globe, Code, FileText, MonitorPlay, MessagesSquare, Sparkles, History, Trash2, ExternalLink, Clock, Star, ChevronRight, SlidersHorizontal, MoreVertical, ChevronDown, Folder, Bookmark, FolderPlus, Settings, X, Sun, Moon } from 'lucide-react';
import novaIcon from '../../../assets/icon.png';

export const SettingsPage = () => {
  const [settings, setSettings] = useState<any>({ 
    aiProvider: 'mock', aiModel: 'gemini-1.5-flash', aiApiKey: '',
    searchEngine: 'google', startupBehavior: 'newtab'
  });
  const [updateStatus, setUpdateStatus] = useState<string>('');

  useEffect(() => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.aiGetSettings().then(setSettings);
      
      if ((window as any).electronAPI.onUpdateStatus) {
        (window as any).electronAPI.onUpdateStatus((status: string) => {
          setUpdateStatus(status);
        });
      }
    }
  }, []);

  const saveSettings = (newSettings: any) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if ((window as any).electronAPI) {
      (window as any).electronAPI.aiSaveSettings(updated);
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all browsing data? This will sign you out of all websites.')) {
      if ((window as any).electronAPI && (window as any).electronAPI.clearBrowsingData) {
        await (window as any).electronAPI.clearBrowsingData();
        alert('Browsing data cleared successfully.');
      }
    }
  };

  const handleCheckUpdate = () => {
    setUpdateStatus('Checking for updates...');
    if ((window as any).electronAPI && (window as any).electronAPI.checkForUpdates) {
      (window as any).electronAPI.checkForUpdates();
    }
  };

  return (
    <div className="internal-page settings-page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      {/* General Settings */}
      <div className="settings-section" style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={18} /> General</h2>
        <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--overlay-5)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: 'var(--text-muted)' }}>Default Search Engine</label>
            <select 
              value={settings.searchEngine || 'google'} 
              onChange={e => saveSettings({ searchEngine: e.target.value })}
              style={{ width: '100%', padding: '10px', background: '#1f2231', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px' }}
            >
              <option value="google">Google</option>
              <option value="bing">Bing</option>
              <option value="duckduckgo">DuckDuckGo</option>
              <option value="brave">Brave</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: 'var(--text-muted)' }}>On Startup</label>
            <select 
              value={settings.startupBehavior || 'newtab'} 
              onChange={e => saveSettings({ startupBehavior: e.target.value })}
              style={{ width: '100%', padding: '10px', background: '#1f2231', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px' }}
            >
              <option value="newtab">Open New Tab Page</option>
              <option value="restore">Continue where you left off</option>
            </select>
          </div>

        </div>
      </div>

      {/* AI Settings */}
      <div className="settings-section" style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={18} /> NOVA AI Assistant</h2>
        <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--overlay-5)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: 'var(--text-muted)' }}>AI Provider</label>
            <select 
              value={settings.aiProvider || 'mock'} 
              onChange={e => saveSettings({ aiProvider: e.target.value })}
              style={{ width: '100%', padding: '10px', background: '#1f2231', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px' }}
            >
              <option value="mock">Mock (Testing)</option>
              <option value="gemini">Google Gemini API</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: 'var(--text-muted)' }}>Model (Gemini only)</label>
            <input 
              type="text" 
              value={settings.aiModel || 'gemini-1.5-flash'} 
              onChange={e => saveSettings({ aiModel: e.target.value })}
              style={{ width: '100%', padding: '10px', background: '#1f2231', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: 'var(--text-muted)' }}>API Key</label>
            <input 
              type="password" 
              value={settings.aiApiKey || ''} 
              onChange={e => saveSettings({ aiApiKey: e.target.value })}
              placeholder="Paste your API key here..."
              style={{ width: '100%', padding: '10px', background: '#1f2231', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px' }}
            />
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '5px 0 0 0' }}>Your key is stored locally and never shared with websites.</p>
          </div>
        </div>
      </div>

      {/* Privacy & Updates */}
      <div className="settings-section">
        <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '8px' }}><SlidersHorizontal size={18} /> Privacy & System</h2>
        <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--overlay-5)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: '500', color: '#fff' }}>Clear Browsing Data</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Clears cache, cookies, and local storage for all sites</div>
            </div>
            <button onClick={handleClearData} style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
              Clear Data
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '500', color: '#fff' }}>Software Update</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{updateStatus || 'Check for new versions of NOVA Browser'}</div>
            </div>
            <button onClick={handleCheckUpdate} style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
              Check for Updates
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
// History Page
export const HistoryPage = ({ activeTabId }: { activeTabId?: number | null }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const loadHistory = async () => {
    if ((window as any).electronAPI) {
      if (search) {
        setHistory(await (window as any).electronAPI.searchHistory(search));
      } else {
        setHistory(await (window as any).electronAPI.getHistory(200, 0));
      }
    }
  };

  useEffect(() => {
    loadHistory();
  }, [search]);

  const handleDelete = async (id: number) => {
    if ((window as any).electronAPI) {
      await (window as any).electronAPI.deleteHistoryEntry(id);
      loadHistory();
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      if ((window as any).electronAPI) {
        await (window as any).electronAPI.clearHistory();
        loadHistory();
      }
    }
  };

  const groupHistory = (items: any[]) => {
    const groups: { [key: string]: { label: string, dateStr: string, items: any[] } } = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    items.forEach(item => {
      const d = new Date(item.visitedAt);
      const dateKey = d.toLocaleDateString();
      let label = dateKey;
      let dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      if (d.toDateString() === today.toDateString()) {
        label = 'Today';
      } else if (d.toDateString() === yesterday.toDateString()) {
        label = 'Yesterday';
      } else {
        label = dateStr;
        dateStr = '';
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = { label, dateStr, items: [] };
      }
      groups[dateKey].items.push(item);
    });
    
    // Sort groups descending by dateKey (which works if we use item timestamp)
    return Object.values(groups).sort((a, b) => b.items[0].visitedAt - a.items[0].visitedAt);
  };

  const groups = groupHistory(history);
  
  const stats = {
    total: history.length,
    today: groups.find(g => g.label === 'Today')?.items.length || 0,
    week: history.filter(h => Date.now() - h.visitedAt < 7*24*60*60*1000).length,
    month: history.filter(h => Date.now() - h.visitedAt < 30*24*60*60*1000).length
  };
  
  // Deduplicate for recent sites
  const recentSites = history.filter((v,i,a)=>a.findIndex(t=>(t.title === v.title))===i).slice(0, 4);

  return (
    <div className="internal-page history-page modern-history">
      <div className="history-header">
        <div className="history-header-left">
          <div className="history-header-icon"><History size={26} color="#60a5fa" /></div>
          <div className="history-header-text">
            <h1>History</h1>
            <p>Your recently visited websites</p>
          </div>
        </div>
        <div className="history-filters">
          <button className="filter-pill active"><SlidersHorizontal size={14} /> All</button>
          <button className="filter-pill">Today</button>
          <button className="filter-pill">Yesterday</button>
          <button className="filter-pill">Last 7 days</button>
          <button className="filter-pill">Last 30 days</button>
        </div>
      </div>
      
      <div className="history-layout">
        <div className="history-main">
          <div className="history-search-bar">
            <div className="search-input-wrapper">
              <Search size={16} color="#6b7280" />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="sort-btn"><SlidersHorizontal size={14} /> Sort by: <span>Most recent</span></button>
          </div>
          
          <div className="history-groups">
            {groups.length === 0 && <div className="empty-history">No history found.</div>}
            {groups.map(group => (
              <div className="history-group" key={group.label + group.dateStr}>
                <div className="history-group-title">
                  {group.label} {group.dateStr && <span className="group-date"> • {group.dateStr}</span>}
                </div>
                <div className="history-group-card">
                  {group.items.map(item => (
                    <div className="history-row" key={item.id} onClick={() => {
                      if (activeTabId && (window as any).electronAPI) {
                         (window as any).electronAPI.navigateTab(activeTabId, item.url);
                      }
                    }}>
                      <div className="history-row-icon">
                        {item.favicon ? <img src={item.favicon} alt="" /> : <Globe size={16} color="var(--text-muted)" />}
                      </div>
                      <div className="history-row-details">
                        <div className="hr-title">{item.title || item.url}</div>
                        <div className="hr-url">{item.url}</div>
                      </div>
                      <div className="history-row-time">
                        {new Date(item.visitedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <button className="history-row-menu" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="history-sidebar">
          <div className="history-action-card" onClick={handleClearAll}>
            <div className="action-icon danger"><Trash2 size={16} color="#ef4444" /></div>
            <div className="action-text">
              <div className="action-title">Clear History</div>
              <div className="action-sub">Remove all browsing history</div>
            </div>
            <ChevronRight size={16} color="#4b5563" />
          </div>
          
          <div className="history-action-card">
            <div className="action-icon info"><ExternalLink size={16} color="#60a5fa" /></div>
            <div className="action-text">
              <div className="action-title">Open in New Tab</div>
            </div>
            <ChevronRight size={16} color="#4b5563" />
          </div>
          
          <div className="history-stats-card">
            <div className="stats-header"><Clock size={16} /> History Stats</div>
            <div className="stat-row"><span>Total Visits</span> <span className="stat-val">{stats.total}</span></div>
            <div className="stat-row"><span>Today</span> <span className="stat-val">{stats.today}</span></div>
            <div className="stat-row"><span>This Week</span> <span className="stat-val">{stats.week}</span></div>
            <div className="stat-row"><span>This Month</span> <span className="stat-val">{stats.month}</span></div>
          </div>
          
          {recentSites.length > 0 && (
            <div className="history-recent-card">
              <div className="recent-header"><Star size={16} color="#60a5fa" /> Recent Sites</div>
              {recentSites.map(site => (
                <div className="recent-site-row" key={site.id} onClick={() => {
                  if (activeTabId && (window as any).electronAPI) {
                     (window as any).electronAPI.navigateTab(activeTabId, site.url);
                  }
                }}>
                  {site.favicon ? <img src={site.favicon} alt="" className="recent-site-icon" /> : <Globe size={16} color="var(--text-muted)" className="recent-site-icon" />}
                  <div className="recent-site-info">
                    <div className="rs-title">{site.title || site.url}</div>
                    <div className="rs-url">{new URL(site.url).hostname}</div>
                  </div>
                  <ChevronRight size={14} color="#4b5563" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const BookmarksPage = ({ activeTabId }: { activeTabId?: number | null }) => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<string>('All Bookmarks');
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [bmForm, setBmForm] = useState({ title: '', url: '' });

  const loadBookmarks = async () => {
    if ((window as any).electronAPI) {
      const all = await (window as any).electronAPI.getBookmarks();
      if (search) {
        setBookmarks(all.filter((b: any) => 
          (b.title && b.title.toLowerCase().includes(search.toLowerCase())) || 
          b.url.toLowerCase().includes(search.toLowerCase())
        ));
      } else {
        setBookmarks(all);
      }
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, [search]);

  const handleDelete = async (url: string) => {
    if ((window as any).electronAPI) {
      await (window as any).electronAPI.removeBookmark(url);
      loadBookmarks();
    }
  };

  const getCategory = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.match(/github|react|mozilla|stackoverflow|vscode|developer/)) return 'Development';
    if (lower.match(/drive\.google|moodle|pccoe|edu/)) return 'College';
    if (lower.match(/figma|dribbble|behance|design/)) return 'Design';
    if (lower.match(/youtube|netflix|prime|movie/)) return 'Entertainment';
    return 'Others';
  };

  const submitAddBookmark = async () => {
    if (!bmForm.url) return;
    let finalUrl = bmForm.url;
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl;
    if ((window as any).electronAPI) {
      await (window as any).electronAPI.addBookmark(finalUrl, bmForm.title || finalUrl);
      loadBookmarks();
    }
    setIsAddBookmarkOpen(false);
    setBmForm({ title: '', url: '' });
  };

  const categoriesData = [
    { name: 'Development', color: 'var(--theme-color, #3b82f6)' },
    { name: 'College', color: '#10b981' },
    { name: 'Design', color: '#d946ef' },
    { name: 'Entertainment', color: '#f59e0b' },
    { name: 'Others', color: '#eab308' },
  ];

  const categoryMap: { [key: string]: any[] } = {};
  categoriesData.forEach(c => categoryMap[c.name] = []);
  
  bookmarks.forEach(b => {
    const cat = getCategory(b.url);
    if (categoryMap[cat]) categoryMap[cat].push(b);
    else categoryMap['Others'].push(b);
  });

  const getFilteredCategories = () => {
    if (activeFolder === 'All Bookmarks') return categoriesData.filter(c => categoryMap[c.name].length > 0);
    return categoriesData.filter(c => c.name === activeFolder && categoryMap[c.name].length > 0);
  };

  const visibleCategories = getFilteredCategories();

  return (
    <div className="internal-page history-page modern-history">
      <div className="history-header">
        <div className="history-header-left">
          <div className="history-header-icon"><Star size={26} color="#60a5fa" /></div>
          <div className="history-header-text">
            <h1>Bookmarks</h1>
            <p>Your saved websites, organized for quick access</p>
          </div>
        </div>
        <div className="history-filters">
          <button className="primary-btn" onClick={() => setIsAddBookmarkOpen(true)}><Plus size={14} /> Add Bookmark</button>
          <button className="secondary-btn" onClick={() => setIsNewFolderOpen(true)}><FolderPlus size={14} /> New Folder</button>
        </div>
      </div>
      
      <div className="history-layout">
        <div className="bookmark-sidebar">
          <div 
            className={`bm-folder-row ${activeFolder === 'All Bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveFolder('All Bookmarks')}
          >
            <ChevronRight size={14} className="folder-expander hidden" />
            <Folder size={16} color="#60a5fa" fill="rgba(96,165,250,0.2)" />
            <span className="bm-folder-name">All Bookmarks</span>
            <span className="bm-folder-count">{bookmarks.length}</span>
          </div>
          
          {categoriesData.filter(c => categoryMap[c.name].length > 0).map(cat => (
            <div key={cat.name} className="bm-folder-group">
              <div 
                className={`bm-folder-row ${activeFolder === cat.name ? 'active' : ''}`}
                onClick={() => setActiveFolder(cat.name)}
              >
                <ChevronDown size={14} className="folder-expander hidden" />
                <Folder size={16} color={cat.color} fill={`${cat.color}33`} />
                <span className="bm-folder-name">{cat.name}</span>
                <span className="bm-folder-count">{categoryMap[cat.name].length}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="history-main" style={{ flex: 1.5 }}>
          <div className="history-search-bar">
            <div className="search-input-wrapper">
              <Search size={16} color="#6b7280" />
              <input 
                type="text" 
                placeholder="Search bookmarks..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="sort-btn"><SlidersHorizontal size={14} /> Sort by: <span>Most recent</span></button>
          </div>
          
          <div className="history-groups">
            {visibleCategories.length === 0 && <div className="empty-history">No bookmarks found.</div>}
            {visibleCategories.map(cat => (
              <div className="history-group-card" key={cat.name} style={{ marginBottom: 20 }}>
                <div className="bm-card-header">
                  <Folder size={16} color={cat.color} fill={`${cat.color}33`} />
                  <span className="bm-card-title">{cat.name}</span>
                  <span className="bm-card-count">{categoryMap[cat.name].length} bookmarks</span>
                </div>
                {categoryMap[cat.name].map(item => (
                  <div className="history-row" key={item.id} onClick={() => {
                    if (activeTabId && (window as any).electronAPI) {
                       (window as any).electronAPI.navigateTab(activeTabId, item.url);
                    }
                  }}>
                    <div className="history-row-icon">
                      {item.favicon ? <img src={item.favicon} alt="" /> : <Globe size={16} color="var(--text-muted)" />}
                    </div>
                    <div className="history-row-details">
                      <div className="hr-title">{item.title || item.url}</div>
                      <div className="hr-url">{item.url}</div>
                    </div>
                    <div className="history-row-time">
                      {new Date(item.id || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <button className="history-row-menu" onClick={(e) => { e.stopPropagation(); handleDelete(item.url); }}>
                      <MoreVertical size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="history-sidebar bm-widgets">
          <div className="bm-hero-card">
            <div className="bm-hero-icon"><Bookmark size={24} color="#fff" /></div>
            <div className="bm-hero-title">Bookmarks</div>
            <div className="bm-hero-sub">Save what matters. Access it anytime.</div>
          </div>
          
          <div className="history-action-card quick-actions-card">
            <div className="stats-header"><Clock size={16} /> Quick Actions</div>
            <div className="qa-row">
              <div className="qa-left"><Star size={16} /> Add Bookmark</div>
              <div className="qa-right">Ctrl + D</div>
            </div>
            <div className="qa-row">
              <div className="qa-left"><FolderPlus size={16} /> New Folder</div>
              <div className="qa-right">Ctrl + Shift + N</div>
            </div>
            <div className="qa-row">
              <div className="qa-left"><ExternalLink size={16} /> Open All in Folder</div>
              <div className="qa-right">Ctrl + Shift + O</div>
            </div>
          </div>
          
          <div className="history-recent-card">
            <div className="recent-header"><Clock size={16} color="#60a5fa" /> Recently Added</div>
            {bookmarks.slice(0, 4).map(site => (
              <div className="recent-site-row" key={site.id} onClick={() => {
                if (activeTabId && (window as any).electronAPI) {
                   (window as any).electronAPI.navigateTab(activeTabId, site.url);
                }
              }}>
                {site.favicon ? <img src={site.favicon} alt="" className="recent-site-icon" /> : <Globe size={16} color="var(--text-muted)" className="recent-site-icon" />}
                <div className="recent-site-info">
                  <div className="rs-title">{site.title || site.url}</div>
                  <div className="rs-url">{new URL(site.url).hostname}</div>
                </div>
                <MoreVertical size={14} color="#4b5563" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Add Bookmark Modal */}
      {isAddBookmarkOpen && (
        <div className="palette-overlay" onClick={() => setIsAddBookmarkOpen(false)}>
          <div className="palette-modal" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 500, fontSize: '16px' }}>
              Add New Bookmark
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Name</label>
                <input 
                  type="text" 
                  value={bmForm.title} 
                  onChange={e => setBmForm({...bmForm, title: e.target.value})}
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px', outline: 'none' }}
                  placeholder="e.g. GitHub"
                  autoFocus
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>URL</label>
                <input 
                  type="text" 
                  value={bmForm.url} 
                  onChange={e => setBmForm({...bmForm, url: e.target.value})}
                  onKeyDown={e => { if (e.key === 'Enter') submitAddBookmark(); }}
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px', outline: 'none' }}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div style={{ padding: '15px 20px', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setIsAddBookmarkOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitAddBookmark} style={{ padding: '8px 16px', background: 'var(--theme-color, #3b82f6)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Add Bookmark</button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {isNewFolderOpen && (
        <div className="palette-overlay" onClick={() => setIsNewFolderOpen(false)}>
          <div className="palette-modal" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 500, fontSize: '16px' }}>
              Create New Folder
            </div>
            <div style={{ padding: '20px', fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              NOVA currently features an advanced <b>Dynamic Categorization Engine</b> that automatically organizes your bookmarks into smart folders based on context!
              <br/><br/>
              Custom folder creation will be fully unlocked in a future update.
            </div>
            <div style={{ padding: '15px 20px', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setIsNewFolderOpen(false)} style={{ padding: '8px 16px', background: 'var(--theme-color, #3b82f6)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// New Tab Page
export const NewTabPage = ({ activeTabId }: { activeTabId: number }) => {
  const [time, setTime] = useState(new Date());
  const [isEditingQA, setIsEditingQA] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', url: '' });
  const [quickLinks, setQuickLinks] = useState([
    { id: '1', title: 'GitHub', url: 'https://github.com', color: '#000', icon: <Code color="#fff" size={28} /> },
    { id: '2', title: 'YouTube', url: 'https://youtube.com', color: '#f00', icon: <MonitorPlay color="#fff" size={28} /> },
    { id: '3', title: 'Google', url: 'https://google.com', color: '#fff', icon: <Search color="#4285F4" size={28} /> },
    { id: '4', title: 'MDN Web Docs', url: 'https://developer.mozilla.org', color: '#000', icon: <Book color="#fff" size={28} /> },
    { id: '5', title: 'Stack Overflow', url: 'https://stackoverflow.com', color: '#f48024', icon: <MessagesSquare color="#fff" size={28} /> },
    { id: '6', title: 'Notion', url: 'https://notion.so', color: '#fff', icon: <FileText color="#000" size={28} /> }
  ]);

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [bgStyle, setBgStyle] = useState(() => localStorage.getItem('ntBgStyle') || 'gradient');
  const [bgValue, setBgValue] = useState(() => localStorage.getItem('ntBgValue') || 'linear-gradient(135deg, #1e1e24 0%, #0f111a 100%)');
  const [showQuickAccess, setShowQuickAccess] = useState(() => localStorage.getItem('ntShowQA') !== 'false');
  const [showRecent, setShowRecent] = useState(() => localStorage.getItem('ntShowRecent') !== 'false');
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem('ntThemeColor') || '#3b82f6');
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('ntThemeMode') || 'dark');
  const [recentHistory, setRecentHistory] = useState<any[]>([]);

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor);
    document.body.style.setProperty('--theme-color', themeColor);
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeColor, themeMode]);

  useEffect(() => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.getHistory(50).then((data: any[]) => {
        const filtered = [];
        const seen = new Set();
        for (const item of data) {
          if (!item.url.startsWith('nova://') && !seen.has(item.url)) {
            filtered.push(item);
            seen.add(item.url);
          }
          if (filtered.length >= 6) break;
        }
        setRecentHistory(filtered);
      });
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ntBgStyle', bgStyle);
      localStorage.setItem('ntBgValue', bgValue);
      localStorage.setItem('ntThemeColor', themeColor);
      localStorage.setItem('ntThemeMode', themeMode);
    } catch (e) {
      console.error('Storage quota exceeded for background image:', e);
      alert('The selected image is too large to save. Please choose a smaller file.');
      // Revert to a safe default
      setBgStyle('gradient');
      setBgValue('linear-gradient(135deg, #1e1e24 0%, #0f111a 100%)');
      localStorage.setItem('ntBgStyle', 'gradient');
      localStorage.setItem('ntBgValue', 'linear-gradient(135deg, #1e1e24 0%, #0f111a 100%)');
    }
    localStorage.setItem('ntShowQA', showQuickAccess ? 'true' : 'false');
    localStorage.setItem('ntShowRecent', showRecent ? 'true' : 'false');
  }, [bgStyle, bgValue, showQuickAccess, showRecent, themeColor, themeMode]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000); // update every second
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value.trim();
      if (val) {
        if (/^https?:\/\//i.test(val)) {
          (window as any).electronAPI?.navigateTab(activeTabId, val);
        } else if (val.includes('.') && !val.includes(' ')) {
          (window as any).electronAPI?.navigateTab(activeTabId, 'https://' + val);
        } else {
          (window as any).electronAPI?.navigateTab(activeTabId, 'https://www.google.com/search?q=' + encodeURIComponent(val));
        }
      }
    }
  };

  const submitAddQuickLink = () => {
    let { url } = addForm;
    const { title } = addForm;
    if (!title || !url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    
    setQuickLinks([...quickLinks, {
      id: Date.now().toString(),
      title,
      url,
      color: 'var(--theme-color, #3b82f6)', // default blue
      icon: <Globe color="#fff" size={28} />
    }]);
    setIsAddModalOpen(false);
    setAddForm({ title: '', url: '' });
  };

  const handleRemoveQuickLink = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setQuickLinks(quickLinks.filter(q => q.id !== id));
  };

  const hour = time.getHours();
  let greeting = 'Good evening';
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';

  return (
    <div className="internal-page new-tab" style={{ background: bgStyle === 'image' ? `url(${bgValue})` : bgValue, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      
      {/* Top Right Widget */}
      <div className="nt-widget">
        <div className="nt-time">{time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
        <div className="nt-date">{time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</div>
        <div className="nt-weather">
          <span>⛅ 24°C</span>
          <span style={{ fontSize: '11px' }}>Partly Cloudy</span>
        </div>
      </div>

      <div className="nt-logo">NOVA</div>
      <div className="nt-greeting">{greeting}, Saurabh</div>
      
      <div className="nt-search">
        <Search size={18} className="nt-search-icon" />
        <input 
          type="text" 
          placeholder="Search or enter URL" 
          onKeyDown={handleSearch}
          autoFocus
        />
        <Sparkles size={18} className="nt-search-sparkle" />
      </div>

      {showQuickAccess && (
        <div className="nt-quick-access">
        <div className="nt-section-header">
          <span>Quick Access</span>
          <span 
            style={{ cursor: 'pointer', fontSize: '12px' }} 
            onClick={() => setIsEditingQA(!isEditingQA)}
          >
            {isEditingQA ? 'Done' : 'Edit ✎'}
          </span>
        </div>
        <div className="qa-grid">
          {quickLinks.map(link => (
            <div 
              key={link.id}
              className="qa-item" 
              onClick={() => !isEditingQA && (window as any).electronAPI?.navigateTab(activeTabId, link.url)}
              style={{ position: 'relative' }}
            >
              {isEditingQA && (
                <div 
                  onClick={(e) => handleRemoveQuickLink(e, link.id)}
                  style={{
                    position: 'absolute', top: '-5px', right: '-5px',
                    background: '#ef4444', color: '#fff', borderRadius: '50%',
                    width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 10, fontSize: '12px', fontWeight: 'bold'
                  }}
                >
                  ×
                </div>
              )}
              <div className="qa-icon" style={{ background: link.color, border: 'none' }}>
                {link.icon}
              </div>
              <div className="qa-label">{link.title}</div>
            </div>
          ))}
          <div className="qa-item" onClick={() => setIsAddModalOpen(true)}>
            <div className="qa-icon"><Plus color="var(--text-muted)" size={28} /></div>
            <div className="qa-label">Add</div>
          </div>
        </div>
      </div>
      )}

      {isAddModalOpen && (
        <div className="palette-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="palette-modal" onClick={e => e.stopPropagation()} style={{ padding: '20px', gap: '15px' }}>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '18px' }}>Add Quick Access</h3>
            <input 
              type="text" 
              placeholder="Name (e.g. Google)" 
              value={addForm.title}
              onChange={e => setAddForm({...addForm, title: e.target.value})}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
              autoFocus
            />
            <input 
              type="text" 
              placeholder="URL (e.g. google.com)" 
              value={addForm.url}
              onChange={e => setAddForm({...addForm, url: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && submitAddQuickLink()}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: '6px' }}
              >Cancel</button>
              <button 
                onClick={submitAddQuickLink}
                style={{ background: 'var(--theme-color, #3b82f6)', color: '#fff', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: '6px' }}
              >Add</button>
            </div>
          </div>
        </div>
      )}

      {showRecent && (
        <div className="nt-recently-visited">
        <div className="nt-section-header">
          <span>Recently Visited</span>
          <span style={{ cursor: 'pointer', fontSize: '12px' }}>View All &gt;</span>
        </div>
        <div className="rv-grid">
          {recentHistory.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', padding: '20px', fontSize: '14px' }}>No recent history found.</div>
          ) : (
            recentHistory.map(item => {
              let hostname = item.url;
              try { 
                hostname = new URL(item.url).hostname; 
              } catch (e) {
                // Ignore invalid URL parse
              }
              
              return (
                <div className="rv-item" key={item.id} onClick={() => (window as any).electronAPI?.navigateTab(activeTabId, item.url)}>
                  <div className="rv-icon" style={{ background: 'var(--bg-surface)', color: '#fff', overflow: 'hidden' }}>
                    {item.favicon ? <img src={item.favicon} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" /> : <Globe size={20} />}
                  </div>
                  <div className="rv-text">
                    <div className="rv-title">{item.title || item.url}</div>
                    <div className="rv-url">{hostname}</div>
                  </div>
                  <div className="rv-time">
                    {new Date(item.id).toLocaleDateString([], { month: 'short', day: 'numeric' })} &gt;
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      )}

      {/* Customize Button */}
      <button 
        onClick={() => setIsCustomizeOpen(true)}
        style={{ position: 'absolute', bottom: '30px', right: '30px', background: 'rgba(30, 30, 40, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid var(--overlay-10)', color: '#fff', padding: '10px 18px', borderRadius: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 100, fontSize: '13px', fontWeight: 500, transition: '0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(50, 50, 60, 0.8)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(30, 30, 40, 0.7)'}
      >
        <Settings size={16} /> Customize
      </button>

      {/* Customize Modal */}
      {isCustomizeOpen && (
        <div className="palette-overlay" onClick={() => setIsCustomizeOpen(false)} style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px' }}>
          <div className="palette-modal" onClick={e => e.stopPropagation()} style={{ width: '420px', height: '100%', maxHeight: '600px', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: '-10px 0 40px rgba(0,0,0,0.5)', animation: 'slideIn 0.3s ease' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-main)' }}>Customize NOVA</h3>
              <button onClick={() => setIsCustomizeOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>Background Image</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div 
                    onClick={() => { setBgStyle('image'); setBgValue('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3'); }}
                    style={{ height: '110px', borderRadius: '10px', background: 'url(https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=600) center/cover', cursor: 'pointer', border: bgValue.includes('1472214103451') ? '2px solid var(--theme-color, #3b82f6)' : '2px solid transparent', position: 'relative' }}
                  >
                    {bgValue.includes('1472214103451') && <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'var(--theme-color, #3b82f6)', borderRadius: '50%', padding: '2px', display: 'flex' }}><Sparkles size={12} color="#fff" /></div>}
                  </div>
                  <div 
                    onClick={() => { setBgStyle('image'); setBgValue('https://images.unsplash.com/photo-1506744626753-140285396207?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3'); }}
                    style={{ height: '110px', borderRadius: '10px', background: 'url(https://images.unsplash.com/photo-1506744626753-140285396207?auto=format&fit=crop&q=80&w=600) center/cover', cursor: 'pointer', border: bgValue.includes('1506744626753') ? '2px solid var(--theme-color, #3b82f6)' : '2px solid transparent', position: 'relative' }}
                  >
                    {bgValue.includes('1506744626753') && <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'var(--theme-color, #3b82f6)', borderRadius: '50%', padding: '2px', display: 'flex' }}><Sparkles size={12} color="#fff" /></div>}
                  </div>
                  
                  <div 
                    onClick={() => { setBgStyle('gradient'); setBgValue('linear-gradient(135deg, #1e3a8a 0%, #0f111a 100%)'); }}
                    style={{ height: '110px', borderRadius: '10px', background: 'linear-gradient(135deg, #1e3a8a 0%, #0f111a 100%)', cursor: 'pointer', border: bgValue.includes('#1e3a8a') ? '2px solid var(--theme-color, #3b82f6)' : '2px solid transparent', display: 'flex', alignItems: 'flex-end', padding: '12px', fontSize: '13px', color: '#fff', fontWeight: 500 }}
                  >Ocean Dark</div>
                  
                  <div 
                    onClick={() => { setBgStyle('gradient'); setBgValue('linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'); }}
                    style={{ height: '110px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', cursor: 'pointer', border: bgValue.includes('#8b5cf6') ? '2px solid var(--theme-color, #3b82f6)' : '2px solid transparent', display: 'flex', alignItems: 'flex-end', padding: '12px', fontSize: '13px', color: '#fff', fontWeight: 500 }}
                  >Nova Purple</div>
                  
                  <div 
                    onClick={() => { setBgStyle('gradient'); setBgValue('linear-gradient(135deg, #1e1e24 0%, #0f111a 100%)'); }}
                    style={{ height: '110px', borderRadius: '10px', background: 'linear-gradient(135deg, #1e1e24 0%, #0f111a 100%)', cursor: 'pointer', border: bgValue.includes('#1e1e24') ? '2px solid var(--theme-color, #3b82f6)' : '2px solid transparent', display: 'flex', alignItems: 'flex-end', padding: '12px', fontSize: '13px', color: '#fff', fontWeight: 500 }}
                  >Classic Dark</div>

                  <label 
                    style={{ height: '110px', borderRadius: '10px', border: '2px dashed #4b5563', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px', transition: '0.2s' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#6b7280'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#4b5563'}
                  >
                    <Plus size={20} style={{ marginBottom: '8px' }} />
                    Upload Image
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            setBgStyle('image');
                            setBgValue(ev.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>Theme Appearance</div>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                  <button onClick={() => setThemeMode('light')} style={{ flex: 1, padding: '10px', background: themeMode === 'light' ? 'var(--theme-color, #3b82f6)' : 'var(--overlay-5)', color: themeMode === 'light' ? '#fff' : 'var(--text-main)', border: '1px solid var(--overlay-10)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 500 }}>
                    <Sun size={16} /> Light
                  </button>
                  <button onClick={() => setThemeMode('dark')} style={{ flex: 1, padding: '10px', background: themeMode === 'dark' ? 'var(--theme-color, #3b82f6)' : 'var(--overlay-5)', color: themeMode === 'dark' ? '#fff' : 'var(--text-main)', border: '1px solid var(--overlay-10)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 500 }}>
                    <Moon size={16} /> Dark
                  </button>
                </div>

                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>Theme Color</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {[
                    { id: 'blue', color: '#3b82f6' },
                    { id: 'purple', color: '#8b5cf6' },
                    { id: 'pink', color: '#ec4899' },
                    { id: 'red', color: '#ef4444' },
                    { id: 'orange', color: '#f97316' },
                    { id: 'yellow', color: '#eab308' },
                    { id: 'green', color: '#22c55e' },
                    { id: 'teal', color: '#14b8a6' },
                  ].map(t => (
                    <div 
                      key={t.id}
                      onClick={() => setThemeColor(t.color)}
                      style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', background: t.color, cursor: 'pointer', 
                        border: themeColor === t.color ? '3px solid #fff' : '3px solid transparent',
                        boxShadow: themeColor === t.color ? `0 0 0 2px ${t.color}` : 'none',
                        transition: '0.2s'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>Widgets</div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Show Quick Access</span>
                  <input type="checkbox" checked={showQuickAccess} onChange={e => setShowQuickAccess(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--theme-color, #3b82f6)', cursor: 'pointer' }} />
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Show Recently Visited</span>
                  <input type="checkbox" checked={showRecent} onChange={e => setShowRecent(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--theme-color, #3b82f6)', cursor: 'pointer' }} />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AboutPage = () => {
  return (
    <div className="internal-page settings-page">
      <div className="settings-header">
        <h1>About NOVA</h1>
      </div>
      <div className="settings-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: '20px' }}>
        <img 
          src={novaIcon} 
          alt="NOVA Browser" 
          style={{ 
            width: '80px', 
            height: '80px', 
            objectFit: 'contain',
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))'
          }} 
        />
        <div>
          <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text-main)' }}>NOVA Browser</h2>
          <p style={{ color: 'var(--text-dim)', margin: 0 }}>Version 1.0.0 (Developer Build)</p>
        </div>
        
        <div className="settings-section" style={{ maxWidth: '500px', width: '100%', marginTop: '20px', textAlign: 'left' }}>
          <h3>System Information</h3>
          <div className="settings-card" style={{ fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-dim)' }}>Chromium</span>
              <span style={{ color: 'var(--text-main)' }}>122.0.6261.156</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-dim)' }}>Node.js</span>
              <span style={{ color: 'var(--text-main)' }}>20.9.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-dim)' }}>Electron</span>
              <span style={{ color: 'var(--text-main)' }}>29.1.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ color: 'var(--text-dim)' }}>Architecture</span>
              <span style={{ color: 'var(--text-main)' }}>x64</span>
            </div>
          </div>
        </div>

        <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginTop: '40px' }}>
          &copy; {new Date().getFullYear()} NOVA Browser. All rights reserved.
        </div>
      </div>
    </div>
  );
};
