import { app, BrowserWindow, WebContentsView, ipcMain, Menu, MenuItem, MenuItemConstructorOptions, protocol, session as electronSession } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { initDatabase, db } from './services/database';
import { historyService } from './services/history';
import { bookmarksService } from './services/bookmarks';
import { developerService } from './services/developer';
import { aiService } from './services/ai';

if (started) {
  app.quit();
}

class BrowserSession {
  window: BrowserWindow | null = null;
  tabs = new Map<number, WebContentsView>();
  tabStates = new Map<number, any>();
  tabResponsive = new Map<number, { w: number, h: number } | null>();
  activeTabId: number | null = null;
  splitTabId: number | null = null;
  sidebarWidth = 260;
  aiSidebarWidth = 0;
  isPrivate = false;
  isVerticalTabs = false;

  constructor(isPrivate = false) {
    this.isPrivate = isPrivate;
  }
}
const normalSession = new BrowserSession(false);
const privateSession = new BrowserSession(true);

function getSession(id: number): BrowserSession | null {
  if (normalSession.tabs.has(id)) return normalSession;
  if (privateSession.tabs.has(id)) return privateSession;
  return null;
}

function getSessionByEvent(event: Electron.IpcMainEvent): BrowserSession {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && privateSession.window && win.id === privateSession.window.id) return privateSession;
  return normalSession;
}



function setupMenu() {
  const isMac = process.platform === 'darwin';
  
  const getFoc = () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win && privateSession.window && win.id === privateSession.window.id) return privateSession;
    return normalSession;
  };

  const template: MenuItemConstructorOptions[] = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] as MenuItemConstructorOptions[] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: () => createWindow(false)
        },
        {
          label: 'New Private Window',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => createWindow(true)
        },
        { type: 'separator' },
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            const s = getFoc();
            if (s.window) s.window.webContents.send('keyboard-shortcut', 'new-tab');
          }
        },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            const s = getFoc();
            if (s.activeTabId && s.tabs.has(s.activeTabId)) {
              const id = s.activeTabId;
              const view = s.tabs.get(id)!;
              if (s.window) s.window.contentView.removeChildView(view);
              view.webContents.close();
              s.tabs.delete(id);
              s.tabStates.delete(id);
              if (s.window) s.window.webContents.send('tab-closed', id);
            }
          }
        },
        {
          label: 'Next Tab',
          accelerator: 'CmdOrCtrl+Tab',
          click: () => {
            const s = getFoc();
            const ids = Array.from(s.tabs.keys());
            if (ids.length < 2) return;
            const currentIndex = ids.indexOf(s.activeTabId as number);
            const nextIndex = (currentIndex + 1) % ids.length;
            if (s.window) s.window.webContents.send('keyboard-shortcut', 'switch-tab', ids[nextIndex]);
          }
        },
        {
          label: 'Previous Tab',
          accelerator: 'CmdOrCtrl+Shift+Tab',
          click: () => {
            const s = getFoc();
            const ids = Array.from(s.tabs.keys());
            if (ids.length < 2) return;
            const currentIndex = ids.indexOf(s.activeTabId as number);
            const prevIndex = (currentIndex - 1 + ids.length) % ids.length;
            if (s.window) s.window.webContents.send('keyboard-shortcut', 'switch-tab', ids[prevIndex]);
          }
        },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'History',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            const s = getFoc();
            if (s.activeTabId && s.tabs.has(s.activeTabId)) {
              s.tabs.get(s.activeTabId)!.webContents.loadURL('nova://history/');
            } else {
              if (s.window) s.window.webContents.send('keyboard-shortcut', 'new-tab-url', 'nova://history/');
            }
          }
        },
        {
          label: 'Bookmarks',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            const s = getFoc();
            if (s.activeTabId && s.tabs.has(s.activeTabId)) {
              s.tabs.get(s.activeTabId)!.webContents.loadURL('nova://bookmarks/');
            } else {
              if (s.window) s.window.webContents.send('keyboard-shortcut', 'new-tab-url', 'nova://bookmarks/');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Focus Address Bar',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            const s = getFoc();
            if (s.window) s.window.webContents.send('keyboard-shortcut', 'focus-url');
          }
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Developer',
      submenu: [
        {
          label: 'Developer Dashboard',
          accelerator: 'CmdOrCtrl+Shift+J',
          click: () => {
            const s = getFoc();
            if (s.window) s.window.webContents.send('keyboard-shortcut', 'navigate-developer');
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            const s = getFoc();
            if (s.activeTabId && s.tabs.has(s.activeTabId)) {
              s.tabs.get(s.activeTabId)!.webContents.toggleDevTools();
            }
          }
        },
        {
          label: 'Responsive Preview',
          accelerator: 'CmdOrCtrl+Shift+M',
          click: () => {
            const s = getFoc();
            if (s.window) s.window.webContents.send('keyboard-shortcut', 'toggle-responsive');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

const createWindow = (isPrivate = false) => {
  const session = isPrivate ? privateSession : normalSession;
  if (session.window) {
    session.window.focus();
    return;
  }

  session.window = new BrowserWindow({
    width: 1200,
    height: 800,
    title: isPrivate ? 'NOVA Browser - Private' : 'NOVA Browser',
    icon: path.join(__dirname, '../../assets/icon.png'),
    titleBarStyle: 'hidden', // Looks modern
    titleBarOverlay: {
      color: '#0f111a',
      symbolColor: '#ffffff',
      height: 40
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    session.window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + (isPrivate ? '?private=true' : ''));
  } else {
    session.window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`), { query: { private: isPrivate ? 'true' : '' } });
  }

  session.window.on('resize', () => {
    if (session.activeTabId && session.tabs.has(session.activeTabId)) {
      switchTab(session.activeTabId);
    }
  });

  session.window.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] ${message} (at ${sourceId}:${line})`);
  });

  session.window.on('closed', () => {
    for (const [id, view] of session.tabs.entries()) {
      view.webContents.close();
    }
    session.tabs.clear();
    session.tabStates.clear();
    session.window = null;
  });
};

// import moved to top

app.on('ready', () => {
  initDatabase();

  protocol.registerStringProtocol('nova', (request, callback) => {
    callback({
      mimeType: 'text/html',
      data: `
        <!DOCTYPE html>
        <html>
          <head><title>NOVA Internal</title></head>
          <body></body>
        </html>
      `
    });
  });

  createWindow();
  setupIPC();
  setupMenu();
});

app.on('window-all-closed', () => {
  const sessionTabs = Array.from(normalSession.tabs.entries()).map(([id, view]) => ({
    url: view.webContents.getURL(),
        isAudible: view.webContents.isCurrentlyAudible(),
    isActive: normalSession.activeTabId === id
  }));
  const data = db.get();
  data.closed_tabs = sessionTabs;
  db.save();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow(false);
  }
});
function createTab(url?: string, targetSession?: BrowserSession) {
  const session = targetSession || normalSession;
  if (!session.window) createWindow(session.isPrivate);

  const view = new WebContentsView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      partition: session.isPrivate ? 'incognito' : undefined
    }
  });
  const id = view.webContents.id;
  session.tabs.set(id, view);
  if (session.window) session.window.contentView.addChildView(view);
  
  view.webContents.setWindowOpenHandler(({ url }) => {
    if (session.window) session.window.webContents.send('keyboard-shortcut', 'new-tab-url', url);
    return { action: 'deny' };
  });

  view.webContents.loadURL(url || 'about:blank');
  
  developerService.setupTab(id, view.webContents);
  
  view.webContents.on('did-finish-load', () => {
    sendTabState(id);
    if (session.activeTabId === id) switchTab(id);
    if (!session.isPrivate) {
      const currentUrl = view.webContents.getURL();
      const currentTitle = view.webContents.getTitle();
      const state = session.tabStates.get(id) || {};
      historyService.addVisit({
        url: currentUrl,
        title: currentTitle,
        favicon: state.favicon,
        visitedAt: Date.now()
      });
    }
  });
  
  view.webContents.on('page-title-updated', () => {
    sendTabState(id);
  });
  
  view.webContents.on('page-favicon-updated', (event, favicons) => {
    const state = session.tabStates.get(id) || {};
    state.favicon = favicons.length > 0 ? favicons[0] : null;
    session.tabStates.set(id, state);
    sendTabState(id);
  });

  view.webContents.on('did-navigate', () => {
    sendTabState(id);
    if (session.activeTabId === id) switchTab(id);
  });

  view.webContents.on('did-navigate-in-page', () => {
    sendTabState(id);
    if (session.activeTabId === id) switchTab(id);
  });

  view.webContents.on('did-start-loading', () => {
    sendTabState(id);
  });

  
  view.webContents.on('media-started-playing', () => sendTabState(id));
  view.webContents.on('media-paused', () => sendTabState(id));
  view.webContents.on("did-stop-loading", () => {
    sendTabState(id);
  });

  view.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (isMainFrame && errorCode !== -3) {
      const isOffline = errorCode === -106;
      view.webContents.loadURL(`data:text/html;charset=utf-8,
        <!DOCTYPE html>
        <html>
          <head>
            <title>${isOffline ? 'You are offline' : 'Navigation Error'}</title>
            <style>
              body { background: #1a1a1c; color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .container { text-align: center; max-width: 600px; padding: 40px; background: #2a2a2e; border-radius: 12px; border: 1px solid #444; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
              h1 { margin-top: 0; color: ${isOffline ? '#eab308' : '#ff6b6b'}; font-size: 24px; }
              p { color: #ccc; line-height: 1.5; margin-bottom: 24px; }
              .url { color: #fff; background: #111; padding: 4px 8px; border-radius: 4px; word-break: break-all; font-family: monospace; }
              button { background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 1rem; transition: all 0.2s ease; }
              button:hover { background: #4f46e5; transform: translateY(-1px); }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${isOffline ? 'You are currently offline' : 'Unable to load this page'}</h1>
              <p>We couldn't reach: <br><span class="url">${validatedURL}</span></p>
              <p>Error: ${errorDescription} (${errorCode})</p>
              <button onclick="window.history.back()">Go Back</button>
            </div>
          </body>
        </html>
      `);
    }
  });

  view.webContents.on('render-process-gone', (event, details) => {
    view.webContents.loadURL(`data:text/html;charset=utf-8,
      <!DOCTYPE html>
      <html>
        <head>
          <title>Aw, Snap!</title>
          <style>
            body { background: #1a1a1c; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .container { text-align: center; max-width: 600px; padding: 40px; background: #2a2a2e; border-radius: 12px; border: 1px solid #444; }
            h1 { margin-top: 0; color: #ff6b6b; }
            button { background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
            button:hover { background: #4f46e5; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Aw, Snap!</h1>
            <p>Something went wrong while displaying this webpage.</p>
            <p style="font-size: 12px; color: #888;">Reason: ${details.reason}</p>
            <button onclick="window.location.reload()">Reload Page</button>
          </div>
        </body>
      </html>
    `);
  });

  view.webContents.on('context-menu', (event, params) => {
    const menu = new Menu();
    
    if (params.linkURL) {
      menu.append(new MenuItem({ label: 'Open Link in New Tab', click: () => {
        const id = createTab(params.linkURL, session);
        switchTab(id);
      }}));
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({ label: 'Copy Link Address', role: 'copy' }));
    } else {
      if (params.editFlags.canUndo) menu.append(new MenuItem({ role: 'undo' }));
      if (params.editFlags.canRedo) menu.append(new MenuItem({ role: 'redo' }));
      menu.append(new MenuItem({ type: 'separator' }));
      if (params.editFlags.canCut) menu.append(new MenuItem({ role: 'cut' }));
      if (params.editFlags.canCopy) menu.append(new MenuItem({ role: 'copy' }));
      if (params.editFlags.canPaste) menu.append(new MenuItem({ role: 'paste' }));
    }
    
    menu.append(new MenuItem({ type: 'separator' }));
    menu.append(new MenuItem({ label: 'Reload', click: () => view.webContents.reload() }));
    menu.append(new MenuItem({ label: 'Inspect Element', click: () => view.webContents.inspectElement(params.x, params.y) }));
    
    menu.popup({ window: session.window || undefined });
  });

  if (session.window) session.window.webContents.send('tab-created', getTabState(id));
  switchTab(id);
  return id;
}

function setupIPC() {
  ipcMain.handle('get-history', (event, limit, offset) => historyService.getHistory(limit, offset));
  ipcMain.handle('search-history', (event, query) => historyService.searchHistory(query));
  ipcMain.handle('delete-history', (event, id) => historyService.deleteEntry(id));
  ipcMain.handle('clear-history', () => historyService.clearHistory());

  ipcMain.handle('get-bookmarks', () => bookmarksService.getAllBookmarks());
  ipcMain.handle('add-bookmark', (event, url, title, favicon) => bookmarksService.addBookmark({ url, title, favicon }));
  ipcMain.handle('remove-bookmark', (event, url) => bookmarksService.removeBookmark(url));
  ipcMain.handle('is-bookmarked', (event, url) => bookmarksService.isBookmarked(url));

  // Developer Mode Handlers
  ipcMain.handle('get-dev-logs', (event, id) => developerService.getLogs(id));
  ipcMain.handle('get-dev-network', (event, id) => developerService.getNetworkRequests(id));
  ipcMain.handle('get-dev-storage', async (event, id) => {
    if (!getSession(id)?.tabs.has(id)) return null;
    const wc = getSession(id)?.tabs.get(id)!.webContents;
    const localStorage = await wc.executeJavaScript('JSON.stringify(window.localStorage)').catch(() => '{}');
    const sessionStorage = await wc.executeJavaScript('JSON.stringify(window.sessionStorage)').catch(() => '{}');
    const cookies = await wc.session.cookies.get({ url: wc.getURL() });
    return {
      localStorage: JSON.parse(localStorage),
      sessionStorage: JSON.parse(sessionStorage),
      cookies
    };
  });
  ipcMain.handle('get-page-info', async (event, id) => {
    if (!getSession(id)?.tabs.has(id)) return null;
    const wc = getSession(id)?.tabs.get(id)!.webContents;
    try {
      const perf = await wc.executeJavaScript('JSON.stringify(window.performance.timing)');
      return {
        url: wc.getURL(),
        title: wc.getTitle(),
        isLoading: wc.isLoading(),
        perf: JSON.parse(perf)
      };
    } catch {
      return null;
    }
  });
  ipcMain.handle('get-page-source', async (event, id) => {
    if (!getSession(id)?.tabs.has(id)) return null;
    return await getSession(id)?.tabs.get(id)!.webContents.executeJavaScript('document.documentElement.outerHTML').catch(() => '');
  });
  ipcMain.handle('take-screenshot', async (event, id) => {
    if (!getSession(id)?.tabs.has(id)) return null;
    const img = await getSession(id)?.tabs.get(id)!.webContents.capturePage();
    return img.toDataURL();
  });
  ipcMain.handle('clear-site-data', async (event, id) => {
    if (!getSession(id)?.tabs.has(id)) return;
    const wc = getSession(id)?.tabs.get(id)!.webContents;
    await wc.session.clearStorageData();
    developerService.clearLogs(id);
    developerService.clearNetworkRequests(id);
  });
  ipcMain.handle('execute-api-request', async (event, req) => {
    try {
      const startTime = Date.now();
      const res = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body
      });
      const text = await res.text();
      const duration = Date.now() - startTime;
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => headers[k] = v);
      return { status: res.status, statusText: res.statusText, headers, body: text, duration };
    } catch (e: any) {
      return { error: e.message };
    }
  });

  electronSession.defaultSession.on('will-download', (event: any, item: any, webContents: any) => {
    const window = BrowserWindow.fromWebContents(webContents) || (normalSession.window || privateSession.window);
    if (!window) return;

    const id = Date.now().toString();
    const fileName = item.getFilename();
    const totalBytes = item.getTotalBytes();

    window.webContents.send('download-started', { id, fileName, totalBytes });

    item.on('updated', (event: any, state: string) => {
      if (state === 'interrupted') {
        window.webContents.send('download-error', { id, error: 'Interrupted' });
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          window.webContents.send('download-paused', { id });
        } else {
          window.webContents.send('download-progress', { id, receivedBytes: item.getReceivedBytes(), totalBytes });
        }
      }
    });

    item.once('done', (event: any, state: string) => {
      if (state === 'completed') {
        window.webContents.send('download-completed', { id, savePath: item.getSavePath() });
      } else {
        window.webContents.send('download-error', { id, error: state });
      }
    });
  });

  ipcMain.on('media-play-pause', async (event, tabId) => {
    const session = getSessionByEvent(event);
    if (!session) return;
    const view = session.tabs.get(tabId);
    if (!view) return;

    try {
      await view.webContents.executeJavaScript(`
        (function() {
          const media = document.querySelector('video, audio');
          if (media) {
            if (media.paused) media.play();
            else media.pause();
          }
        })();
      `);
    } catch(e) { /* ignore */ }
  });

  ipcMain.on('media-pip', async (event, tabId) => {
    const session = getSessionByEvent(event);
    if (!session) return;
    const view = session.tabs.get(tabId);
    if (!view) return;

    try {
      await view.webContents.executeJavaScript(`
        (function() {
          const video = document.querySelector('video');
          if (video) {
            if (document.pictureInPictureElement) {
              document.exitPictureInPicture();
            } else {
              video.requestPictureInPicture();
            }
          }
        })();
      `);
    } catch(e) { /* ignore */ }
  });
  ipcMain.on('create-tab', (event, url) => {
    const session = getSessionByEvent(event);
    if (!session) return;
    const id = createTab(url || "nova://newtab/", session);
    switchTab(id);
  });

  ipcMain.on('create-private-window', () => {
    createWindow(true);
  });

  ipcMain.on('show-browser-menu', (event) => {
    const session = getSessionByEvent(event);
    if (!session || !session.window) return;
    
    const menu = Menu.buildFromTemplate([
      { label: 'New Tab', accelerator: 'CmdOrCtrl+T', click: () => {
        const id = createTab("nova://newtab/", session);
        switchTab(id);
      }},
      { label: 'New Private Window', accelerator: 'CmdOrCtrl+Shift+N', click: () => createWindow(true) },
      { type: 'separator' },
      { label: 'History', accelerator: 'CmdOrCtrl+H', click: () => {
        const id = createTab("nova://history/", session);
        switchTab(id);
      }},
      { label: 'Bookmarks', accelerator: 'CmdOrCtrl+B', click: () => {
        const id = createTab("nova://bookmarks/", session);
        switchTab(id);
      }},
      { type: 'separator' },
      { label: 'Settings', click: () => {
        const id = createTab("nova://settings/", session);
        switchTab(id);
      }},
      { label: 'Developer Dashboard', click: () => {
        const id = createTab("nova://developer/", session);
        switchTab(id);
      }},
      { type: 'separator' },
      { label: 'Zoom In', role: 'zoomIn' },
      { label: 'Zoom Out', role: 'zoomOut' },
      { label: 'Reset Zoom', role: 'resetZoom' },
      { type: 'separator' },
      { label: 'Full Screen', role: 'togglefullscreen' },
      { type: 'separator' },
      { label: 'Exit', role: 'quit' }
    ]);
    
    menu.popup({ window: session.window });
  });

  ipcMain.on('restore-session', (event) => {
    const session = getSessionByEvent(event);
    if (!session) return;
    
    // Always open new tab for private windows
    if (session.isPrivate) {
      const id = createTab("nova://newtab/", session);
      switchTab(id);
      return;
    }

    const data = db.get();
    const settings = data.settings || {};
    const startupBehavior = settings.startupBehavior || 'newtab';

    const savedSession = data.session;
    if (startupBehavior === 'restore' && savedSession && savedSession.tabs && savedSession.tabs.length > 0) {
      let firstId = null;
      for (const t of savedSession.tabs) {
        const id = createTab(t.url, session);
        if (!firstId) firstId = id;
        if (t.id === savedSession.activeTabId) {
          switchTab(id);
        }
      }
      if (!session.activeTabId && firstId) {
        switchTab(firstId);
      }
    } else {
      const id = createTab("nova://newtab/", session);
      switchTab(id);
    }
  });

  ipcMain.on('show-tab-menu', (event, tabId) => {
    const template: MenuItemConstructorOptions[] = [
      { label: 'New Tab', click: () => {
          const id = createTab("nova://newtab/", getSessionByEvent(event));
          switchTab(id);
        }
      },
      { type: 'separator' },
      { label: 'Reload', click: () => getSessionByEvent(event).tabs.get(tabId)?.webContents.reload() },
      { label: 'Duplicate', click: () => {
          const url = getSessionByEvent(event).tabs.get(tabId)?.webContents.getURL();
          if (url) {
            const id = createTab(url, getSessionByEvent(event));
            switchTab(id);
          }
        }
      },
      { type: 'separator' },
      { label: getSessionByEvent(event).splitTabId === tabId ? 'Exit Split View' : 'Split View with Active Tab', click: () => {
          const session = getSessionByEvent(event);
          if (session.splitTabId === tabId) {
            session.splitTabId = null;
          } else if (session.activeTabId && session.activeTabId !== tabId) {
            session.splitTabId = tabId;
          }
          updateSessionBounds(session);
        }
      },
      { type: 'separator' },
      { label: 'Close Tab', click: () => {
          const session = getSessionByEvent(event);
          if (session.tabs.has(tabId)) {
            const view = session.tabs.get(tabId)!;
            session.window?.contentView.removeChildView(view);
            view.webContents.close();
            session.tabs.delete(tabId);
            session.tabStates.delete(tabId);
            event.sender.send('tab-closed', tabId);
          }
        }
      }
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender)! });
  });

  ipcMain.on('update-theme-mode', (event, mode) => {
  if ((getSessionByEvent(event).window)) {
    const isLight = mode === 'light';
    (getSessionByEvent(event).window).setTitleBarOverlay({
      color: isLight ? '#00000000' : '#00000000',
      symbolColor: isLight ? '#111827' : '#ffffff'
    });
  }
});

  ipcMain.on('close-tab', (event, id) => {
    if (getSession(id)?.tabs.has(id)) {
      const view = getSession(id)!.tabs.get(id)!;
      (getSessionByEvent(event).window).contentView.removeChildView(view);
      view.webContents.close();
      getSession(id)?.tabs.delete(id);
      getSession(id)?.tabStates.delete(id);
      getSession(id)?.tabResponsive.delete(id);
      developerService.cleanupTab(id);
      event.sender.send('tab-closed', id);
    }
  });

  ipcMain.on('switch-tab', (event, id) => {
    switchTab(id);
  });

  ipcMain.on('navigate-tab', (event, id, url) => {
    if (getSession(id)?.tabs.has(id)) {
      const view = getSession(id)!.tabs.get(id)!;
      if (!url.startsWith('nova://')) {
        updateSessionBounds(getSessionByEvent(event));
      } else {
        if ((getSessionByEvent(event).window)?.contentView.children.includes(view)) {
          (getSessionByEvent(event).window)?.contentView.removeChildView(view);
        }
      }
      view.webContents.loadURL(url);
    }
  });


  ipcMain.on('reorder-tabs', (event, orderedIds: number[]) => {
    const session = getSessionByEvent(event);
    const newTabs = new Map<number, WebContentsView>();
    const newStates = new Map<number, any>();
    const newResponsive = new Map<number, any>();
    
    for (const id of orderedIds) {
      if (session.tabs.has(id)) {
        newTabs.set(id, session.tabs.get(id)!);
        newStates.set(id, session.tabStates.get(id));
        newResponsive.set(id, session.tabResponsive.get(id));
      }
    }
    
    session.tabs.clear();
    session.tabStates.clear();
    session.tabResponsive.clear();
    
    for (const [id, view] of newTabs.entries()) {
      session.tabs.set(id, view);
      session.tabStates.set(id, newStates.get(id));
      session.tabResponsive.set(id, newResponsive.get(id));
    }
    
    if (orderedIds.length > 0) {
      // Re-trigger a save or keep order
    }
  });

  ipcMain.on('go-back', (event, id) => {
    const view = getSession(id)?.tabs.get(id);
    if (view && view.webContents?.navigationHistory.canGoBack()) {
      view.webContents.navigationHistory.goBack();
    }
  });

  ipcMain.on('go-forward', (event, id) => {
    const view = getSession(id)?.tabs.get(id);
    if (view && view.webContents?.navigationHistory.canGoForward()) {
      view.webContents.navigationHistory.goForward();
    }
  });

  ipcMain.on('reload', (event, id) => {
    if (getSession(id)?.tabs.has(id)) {
      getSession(id)?.tabs.get(id)?.webContents?.reload();
    }
  });

  ipcMain.on('set-zoom', (event, id, level) => {
    if (getSession(id)?.tabs.has(id)) {
      getSession(id)?.tabs.get(id)?.webContents?.setZoomLevel(level);
    }
  });

  ipcMain.handle('get-zoom', (event, id) => {
    if (getSession(id)?.tabs.has(id)) {
      return getSession(id)?.tabs.get(id)?.webContents?.getZoomLevel() || 0;
    }
    return 0;
  });

  ipcMain.on('toggle-fullscreen', (event) => {
    const session = getSessionByEvent(event);
    if (session && session.window) {
      session.window.setFullScreen(!session.window.isFullScreen());
    }
  });

  ipcMain.on('undo', (event, id) => {
    if (getSession(id)?.tabs.has(id)) {
      getSession(id)?.tabs.get(id)?.webContents?.undo();
    }
  });

  ipcMain.on('redo', (event, id) => {
    if (getSession(id)?.tabs.has(id)) {
      getSession(id)?.tabs.get(id)?.webContents?.redo();
    }
  });

  ipcMain.on('set-responsive-mode', (event, id, mode) => {
    if (getSession(id)?.tabs.has(id)) {
      getSession(id)?.tabResponsive.set(id, mode);
      if (id === (getSessionByEvent(event).activeTabId)) switchTab(id);
    }
  });

  ipcMain.on('set-vertical-tabs', (event, isVertical) => {
    getSessionByEvent(event).isVerticalTabs = isVertical;
    updateSessionBounds(getSessionByEvent(event));
  });

  ipcMain.on('set-split-tab', (event, id) => {
    getSessionByEvent(event).splitTabId = id;
    updateSessionBounds(getSessionByEvent(event));
  });

  ipcMain.on('set-sidebar-width', (event, width) => {
    getSessionByEvent(event).sidebarWidth = width;
    updateSessionBounds(getSessionByEvent(event));
  });

  ipcMain.on('set-ai-sidebar-width', (event, width) => {
    getSessionByEvent(event).aiSidebarWidth = width;
    updateSessionBounds(getSessionByEvent(event));
  });

  ipcMain.on('ai-generate', async (event, reqId, prompt, context) => {
    try {
      const stream = aiService.generateStream(prompt, context);
      for await (const chunk of stream) {
        event.sender.send('ai-chunk', reqId, chunk);
      }
      event.sender.send('ai-done', reqId);
    } catch (err: any) {
      event.sender.send('ai-done', reqId, err.message);
    }
  });

  ipcMain.handle('ai-get-page-content', async (event, id) => {
    if (getSession(id)?.tabs.has(id)) {
      try {
        const text = await getSession(id)?.tabs.get(id)!.webContents.executeJavaScript('window.getSelection().toString() || document.body.innerText');
        return text;
      } catch (err) {
        return '';
      }
    }
    return '';
  });

  
  ipcMain.handle('clear-browsing-data', async () => {
    await electronSession.defaultSession.clearStorageData({
      storages: ['cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'serviceworkers', 'cachestorage']
    });
    return true;
  });

  ipcMain.on('check-for-updates', (event) => {
    try {
      if (app.isPackaged) {
        // Assume autoUpdater is imported or require it
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { autoUpdater } = require("electron");
        autoUpdater.on('update-available', () => event.sender.send('update-status', 'Update available. Downloading...'));
        autoUpdater.on('update-not-available', () => event.sender.send('update-status', 'You are up to date!'));
        autoUpdater.on('update-downloaded', () => event.sender.send('update-status', 'Update downloaded. Restart to install.'));
        autoUpdater.on('error', (err: any) => event.sender.send('update-status', 'Error: ' + err.message));
        
        autoUpdater.checkForUpdates();
      } else {
        event.sender.send('update-status', 'Updates are only available in the packaged app.');
      }
    } catch (e: any) {
      event.sender.send('update-status', 'Error checking for updates: ' + e.message);
    }
  });

  ipcMain.handle('ai-save-settings', (event, settings) => {
    const data = db.get();
    data.settings = { ...data.settings, ...settings };
    db.save();
    return true;
  });

  ipcMain.handle('ai-get-settings', () => {
    return db.get().settings || {};
  });
}

function switchTab(id: number) {
  const session = getSession(id);
  if (!session || !session.window) return;
  
  session.activeTabId = id;
  if (session.splitTabId === id) {
    session.splitTabId = null; // Unsplit if activating the same tab
  }
  
  updateSessionBounds(session);
}

function updateSessionBounds(session: BrowserSession) {
  if (!session.window) return;
  const bounds = session.window.getContentBounds();
  
  for (const [tabId, view] of session.tabs.entries()) {
    const url = view.webContents.getURL();
    const isSplitMode = session.splitTabId !== null;
    const isVisible = tabId === session.activeTabId || tabId === session.splitTabId;

    if (isVisible && !url.startsWith('nova://')) {
      if (!session.window.contentView.children.includes(view)) {
        session.window.contentView.addChildView(view);
      }
      const responsive = session.tabResponsive.get(tabId);
      
      const totalWidth = bounds.width - session.sidebarWidth - session.aiSidebarWidth;
      const finalWidth = isSplitMode ? Math.floor(totalWidth / 2) : totalWidth;
      const isRightSide = isSplitMode && tabId === session.splitTabId;
      const finalX = session.sidebarWidth + (isRightSide ? finalWidth : 0);

      if (responsive) {
        view.setBounds({
          x: finalX + Math.max(0, Math.floor((finalWidth - responsive.w) / 2)),
          y: (session.isVerticalTabs ? 50 : 90) + 40,
          width: responsive.w,
          height: responsive.h,
        });
      } else {
        view.setBounds({
          x: finalX,
          y: session.isVerticalTabs ? 50 : 90,
          width: finalWidth,
          height: bounds.height - (session.isVerticalTabs ? 50 : 90),
        });
      }
    } else {
      if (session.window.contentView.children.includes(view)) {
        session.window.contentView.removeChildView(view);
      }
    }
  }
}

function getTabState(id: number) {
  const session = getSession(id);
  if (!session || !session.tabs.has(id)) return null;
  const wc = session.tabs.get(id)!.webContents;
  const state = session.tabStates.get(id) || {};
  let title = wc.getTitle();
  const url = wc.getURL();
  
  if (url === 'nova://newtab/') title = 'New Tab';
  else if (url === 'nova://history/') title = 'History';
  else if (url === 'nova://bookmarks/') title = 'Bookmarks';
  
  return {
    id,
    url,
    title,
    isLoading: wc.isLoading(),
    canGoBack: wc.navigationHistory.canGoBack(),
    canGoForward: wc.navigationHistory.canGoForward(),
    favicon: state.favicon,
    isAudible: wc.isCurrentlyAudible()
  };
}

function sendTabState(id: number) {
  const state = getTabState(id);
  const session = getSession(id);
  if (state && session && session.window) {
    session.window.webContents.send('tab-updated', state);
  }
}
