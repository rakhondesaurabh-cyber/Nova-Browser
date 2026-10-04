import React, { useEffect, useState, useRef } from 'react';

export const CommandPalette = ({ onClose, isVisible, activeTabId, onToggleResponsive, onOpenAI }: { onClose: () => void, isVisible: boolean, activeTabId: number | null, onToggleResponsive: () => void, onOpenAI?: () => void }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      loadInitial();
    }
  }, [isVisible]);

  const loadInitial = async () => {
    if ((window as any).electronAPI) {
      const history = await (window as any).electronAPI.getHistory(5, 0);
      setResults([
        { type: 'command', title: 'New Tab', action: () => (window as any).electronAPI.createTab('nova://newtab/') },
        { type: 'command', title: 'History', action: () => (window as any).electronAPI.createTab('nova://history/') },
        { type: 'command', title: 'Bookmarks', action: () => (window as any).electronAPI.createTab('nova://bookmarks/') },
        { type: 'command', title: 'Toggle AI Sidebar', action: () => onOpenAI?.() },
        { type: 'command', title: 'Developer Mode', action: () => activeTabId && (window as any).electronAPI.navigateTab(activeTabId, 'nova://developer') },
        { type: 'command', title: 'Open API Tester', action: () => activeTabId && (window as any).electronAPI.navigateTab(activeTabId, 'nova://api') },
        { type: 'command', title: 'Open JSON Viewer', action: () => activeTabId && (window as any).electronAPI.navigateTab(activeTabId, 'nova://json') },
        { type: 'command', title: 'Responsive Preview', action: () => onToggleResponsive() },
        { type: 'command', title: 'Take Screenshot', action: () => activeTabId && (window as any).electronAPI.takeScreenshot(activeTabId) },
        { type: 'command', title: 'Clear Site Data', action: () => activeTabId && (window as any).electronAPI.clearSiteData(activeTabId) },
        ...history.map((h: any) => ({ type: 'history', title: h.title || h.url, url: h.url, action: () => (window as any).electronAPI.createTab(h.url) }))
      ]);
    }
  };

  const handleSearch = async (val: string) => {
    setSearch(val);
    setSelectedIndex(0);
    if (!val.trim()) {
      loadInitial();
      return;
    }
    
    if ((window as any).electronAPI) {
      const history = await (window as any).electronAPI.searchHistory(val);
      const bookmarks = await (window as any).electronAPI.getBookmarks();
      const filteredBookmarks = bookmarks.filter((b: any) => b.title?.toLowerCase().includes(val.toLowerCase()) || b.url.toLowerCase().includes(val.toLowerCase()));
      
      const commands = [
        { type: 'command', title: 'New Tab', action: () => (window as any).electronAPI.createTab('nova://newtab/') },
        { type: 'command', title: 'History', action: () => (window as any).electronAPI.createTab('nova://history/') },
        { type: 'command', title: 'Bookmarks', action: () => (window as any).electronAPI.createTab('nova://bookmarks/') },
        { type: 'command', title: 'Ask NOVA (AI)', action: () => onOpenAI?.() },
        { type: 'command', title: 'Toggle AI Sidebar', action: () => onOpenAI?.() },
        { type: 'command', title: 'Summarize Page (AI)', action: () => onOpenAI?.() },
        { type: 'command', title: 'Developer Mode', action: () => activeTabId && (window as any).electronAPI.navigateTab(activeTabId, 'nova://developer') },
        { type: 'command', title: 'Open API Tester', action: () => activeTabId && (window as any).electronAPI.navigateTab(activeTabId, 'nova://api') },
        { type: 'command', title: 'Open JSON Viewer', action: () => activeTabId && (window as any).electronAPI.navigateTab(activeTabId, 'nova://json') },
        { type: 'command', title: 'Responsive Preview', action: () => onToggleResponsive() },
        { type: 'command', title: 'Take Screenshot', action: () => activeTabId && (window as any).electronAPI.takeScreenshot(activeTabId) },
        { type: 'command', title: 'Clear Site Data', action: () => activeTabId && (window as any).electronAPI.clearSiteData(activeTabId) }
      ].filter(c => c.title.toLowerCase().includes(val.toLowerCase()));

      const searchResult: any[] = [];
      if (!/^https?:\/\//i.test(val) && val.includes('.') && !val.includes(' ')) {
        searchResult.push({ type: 'search', title: `Go to ${val}`, action: () => (window as any).electronAPI.createTab('https://' + val) });
      } else {
        searchResult.push({ type: 'search', title: `Search Google for "${val}"`, action: () => (window as any).electronAPI.createTab('https://www.google.com/search?q=' + encodeURIComponent(val)) });
      }

      setResults([
        ...searchResult,
        ...commands,
        ...filteredBookmarks.map((b: any) => ({ type: 'bookmark', title: b.title || b.url, url: b.url, action: () => (window as any).electronAPI.createTab(b.url) })),
        ...history.map((h: any) => ({ type: 'history', title: h.title || h.url, url: h.url, action: () => (window as any).electronAPI.createTab(h.url) }))
      ].slice(0, 10));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div className="palette-modal" onClick={e => e.stopPropagation()}>
        <input 
          ref={inputRef}
          type="text" 
          className="palette-search" 
          placeholder="Search history, bookmarks, or type a command..." 
          value={search}
          onChange={e => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="palette-results">
          {results.map((r, i) => (
            <div 
              key={i} 
              className={`palette-item ${i === selectedIndex ? 'selected' : ''}`}
              onClick={() => { r.action(); onClose(); }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <div className="palette-item-icon">
                {r.title.includes('AI') ? '✨' : r.type === 'command' ? '⚡' : r.type === 'search' ? '🔍' : r.type === 'bookmark' ? '⭐' : '🕒'}
              </div>
              <div className="palette-item-text">
                <div className="palette-item-title">{r.title}</div>
                {r.url && <div className="palette-item-url">{r.url}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
