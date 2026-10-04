import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  restoreSession: () => ipcRenderer.send('restore-session'),
  showTabMenu: (id: number) => ipcRenderer.send('show-tab-menu', id),
  showBrowserMenu: () => ipcRenderer.send('show-browser-menu'),
  createTab: (url?: string) => ipcRenderer.send('create-tab', url),
  createPrivateWindow: () => ipcRenderer.send('create-private-window'),
  updateThemeMode: (mode: string) => ipcRenderer.send('update-theme-mode', mode),
  closeTab: (id: number) => ipcRenderer.send('close-tab', id),
  switchTab: (id: number) => ipcRenderer.send('switch-tab', id),
  reorderTabs: (ids: number[]) => ipcRenderer.send('reorder-tabs', ids),
  navigateTab: (id: number, url: string) => ipcRenderer.send('navigate-tab', id, url),
  goBack: (id: number) => ipcRenderer.send('go-back', id),
  goForward: (id: number) => ipcRenderer.send('go-forward', id),
  reload: (id: number) => ipcRenderer.send('reload', id),
  undo: (id: number) => ipcRenderer.send('undo', id),
  redo: (id: number) => ipcRenderer.send('redo', id),
  setResponsiveMode: (id: number, mode: {w: number, h: number} | null) => ipcRenderer.send('set-responsive-mode', id, mode),
  setSidebarWidth: (width: number) => ipcRenderer.send('set-sidebar-width', width),
  setAiSidebarWidth: (width: number) => ipcRenderer.send('set-ai-sidebar-width', width),
  setVerticalTabs: (isVertical: boolean) => ipcRenderer.send('set-vertical-tabs', isVertical),
  setSplitTab: (id: number | null) => ipcRenderer.send('set-split-tab', id),
  
  onTabUpdated: (callback: (state: any) => void) => {
    ipcRenderer.on('tab-updated', (_event, state) => callback(state));
  },
  onTabCreated: (callback: (state: any) => void) => {
    ipcRenderer.on('tab-created', (_event, state) => callback(state));
  },
  onTabClosed: (callback: (id: number) => void) => {
    ipcRenderer.on('tab-closed', (_event, id) => callback(id));
  },
  onKeyboardShortcut: (callback: (action: string, payload?: any) => void) => {
    ipcRenderer.on('keyboard-shortcut', (_event, action, payload) => callback(action, payload));
  },
  
  // History
  getHistory: (limit?: number, offset?: number) => ipcRenderer.invoke('get-history', limit, offset),
  searchHistory: (query: string) => ipcRenderer.invoke('search-history', query),
  deleteHistoryEntry: (id: number) => ipcRenderer.invoke('delete-history', id),
  clearHistory: () => ipcRenderer.invoke('clear-history'),

  // Bookmarks
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  addBookmark: (url: string, title: string, favicon?: string) => ipcRenderer.invoke('add-bookmark', url, title, favicon),
  removeBookmark: (url: string) => ipcRenderer.invoke('remove-bookmark', url),
  isBookmarked: (url: string) => ipcRenderer.invoke('is-bookmarked', url),

  // Developer Mode
  getDevLogs: (id: number) => ipcRenderer.invoke('get-dev-logs', id),
  getDevNetwork: (id: number) => ipcRenderer.invoke('get-dev-network', id),
  getDevStorage: (id: number) => ipcRenderer.invoke('get-dev-storage', id),
  getPageInfo: (id: number) => ipcRenderer.invoke('get-page-info', id),
  executeApiRequest: (req: any) => ipcRenderer.invoke('execute-api-request', req),
  clearSiteData: (id: number) => ipcRenderer.invoke('clear-site-data', id),
  takeScreenshot: (id: number) => ipcRenderer.invoke('take-screenshot', id),
  getPageSource: (id: number) => ipcRenderer.invoke('get-page-source', id),

  // AI
  aiGenerate: (reqId: string, prompt: string, context?: string) => ipcRenderer.send('ai-generate', reqId, prompt, context),
  onAiChunk: (callback: (reqId: string, chunk: string) => void) => {
    ipcRenderer.on('ai-chunk', (_event, reqId, chunk) => callback(reqId, chunk));
  },
  onAiDone: (callback: (reqId: string, error?: string) => void) => {
    ipcRenderer.on('ai-done', (_event, reqId, error) => callback(reqId, error));
  },
  aiGetPageContent: (id: number) => ipcRenderer.invoke('ai-get-page-content', id),
  
  
  onDownloadStarted: (callback: (data: any) => void) => ipcRenderer.on('download-started', (_, data) => callback(data)),
  onDownloadProgress: (callback: (data: any) => void) => ipcRenderer.on('download-progress', (_, data) => callback(data)),
  onDownloadCompleted: (callback: (data: any) => void) => ipcRenderer.on('download-completed', (_, data) => callback(data)),
  onDownloadError: (callback: (data: any) => void) => ipcRenderer.on('download-error', (_, data) => callback(data)),
  onDownloadPaused: (callback: (data: any) => void) => ipcRenderer.on('download-paused', (_, data) => callback(data)),
  
  mediaPlayPause: (tabId: number) => ipcRenderer.send('media-play-pause', tabId),
  mediaPip: (tabId: number) => ipcRenderer.send('media-pip', tabId),

  clearBrowsingData: () => ipcRenderer.invoke('clear-browsing-data'),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  onUpdateStatus: (callback: (status: string) => void) => ipcRenderer.on('update-status', (_, status) => callback(status)),

  aiSaveSettings: (settings: any) => ipcRenderer.invoke('ai-save-settings', settings),
  aiGetSettings: () => ipcRenderer.invoke('ai-get-settings'),
});
