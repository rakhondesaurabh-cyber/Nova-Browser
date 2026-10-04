# NOVA Architecture

## Overview
NOVA uses a split-process architecture standard for modern Electron applications, ensuring secure, high-performance web browsing. 

## 1. Main Process (`src/main/main.ts`)
The Main Process operates in a privileged Node.js environment. It has two main responsibilities:
- **Application Shell**: Manages the main `BrowserWindow` which hosts the React frontend.
- **Tab Manager**: Instantiates `WebContentsView` for every tab. Each `WebContentsView` acts as an isolated web rendering view attached to the main window.
- **Services layer**: Modules in `src/main/services/` (e.g. database, history, bookmarks, developer) handle persistence, network interception, and log capture securely outside of renderer.
- **Custom Protocols**: Registers protocols like `nova://` to serve internal pages safely.

## 2. Preload Script (`src/preload/preload.ts`)
Acts as a bridge between the React frontend and the Main Process. It safely exposes a typed IPC (Inter-Process Communication) interface to the `window.electronAPI` object, strictly preventing direct access to Node.js APIs from the renderer.

## 3. Renderer (`src/renderer/App.tsx`)
The UI shell is built in React. It renders the toolbar, address bar, and tab list. 
It **never** renders web pages in `<iframe>` tags. Instead, it maintains a lightweight UI state (tab IDs, titles, URLs, loading status) and signals the Main Process via IPC to do the actual navigation and view switching.

## 4. Browser View Architecture
NOVA uses the newer `WebContentsView` API (replacing the deprecated `BrowserView`). 
- When a tab is created, the Main Process creates a `WebContentsView`.
- When a tab is active, its bounds are resized to fit the space below the React toolbar.
- When inactive, its bounds are set to `0x0` to hide it while keeping the DOM alive in the background.

## 5. Security Boundaries
- **contextIsolation**: Enabled.
- **nodeIntegration**: Disabled.
- **sandbox**: Enabled.
- **Window Open Handler**: Captures `target="_blank"` popups from web pages and safely intercepts them to open as new NOVA tabs instead of arbitrary OS windows.

## Future Extension Points
The architecture is modularized to support future phases:
- **State Management**: `tabStates` in `main.ts` can be persisted to a local SQLite database for sessions and history.
- **AI Engine**: Can be integrated as a side-panel `WebContentsView` controlled by the Main Process.
- **Tab Sleeping**: `WebContentsView` instances can be destroyed and reconstructed from their URL and history stack for memory optimization.
