# NOVA Browser

NOVA is a premium, minimal, and fast desktop web browser built with Electron, React, and TypeScript. It is designed with a secure architecture, providing a clean foundation for future features such as AI assistance, tab management, and workspaces.

## Tech Stack
- **Desktop Engine**: Electron
- **Frontend Framework**: React
- **Language**: TypeScript
- **Styling**: Modern CSS (Glassmorphism, custom dark themes)
- **Bundler**: Vite & Electron Forge

## Architecture Overview
NOVA uses a modern Electron architecture:
- **Main Process**: Handles application lifecycle, window management, and native menus. It maintains the isolated `WebContentsView` for each tab and implements custom protocols (e.g. `nova://`).
- **Preload Script**: Uses `contextBridge` to securely expose IPC methods to the renderer. Node Integration is disabled.
- **Renderer Process**: A React shell that manages tab UI, the address bar, and browser state. The web pages themselves are securely rendered by Electron, NOT via iframes.

## How to Install & Run

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the browser in development mode:
   ```bash
   npm start
   # or
   npm run electron:dev
   ```

## Security
- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- Websites cannot execute arbitrary Node.js code.
- IPC is strictly typed and limited to necessary browser actions.

## Current Features (Phases 1-3)
- **Application Window**: Borderless, sleek desktop window.
- **Browser Navigation**: Smart address bar (detects URLs vs search queries), back/forward history handling, reload.
- **Tab System**: Robust multi-tab management, independent rendering processes, loading states, favicons.
- **New Tab Page**: Custom `nova://newtab` internal start page.
- **Keyboard Shortcuts**: Ctrl/Cmd + T (New Tab), Ctrl/Cmd + W (Close Tab), Ctrl/Cmd + L (Focus URL), Ctrl/Cmd + Tab (Switch Tab), Ctrl/Cmd + Shift + I/J/M (DevTools/Preview).
- **Error Handling**: Graceful native error pages for failed navigations.
- **Browser System**: History, Bookmarks, and Session restoration.
- **Developer Mode**: API Tester, JSON Viewer, Responsive Preview, and Developer Dashboard (Console, Network, Storage).
- **AI Assistant**: Sidebar, page summarization, context-aware Q&A, and configurable provider via Settings.
- **Command Palette**: Ctrl/Cmd + K to quickly navigate, run commands, or trigger AI actions.

## Known Limitations
- The tab UI currently scrolls horizontally instead of squishing when many tabs are open.
- Recently closed tabs (Ctrl+Shift+T) are not yet implemented.

## Future Roadmap (Phase 5+)
- Tab suspension/sleeping for memory management.
- Workspaces and vertical tabs.
- Research Mode and Advanced AI Agents.
- Built-in Privacy Engine and Ad Blocker.
