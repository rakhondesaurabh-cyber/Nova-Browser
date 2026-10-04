# NOVA BROWSER - PHASE 3

## Developer Mode Architecture

This phase introduces Developer Mode without breaking the existing architecture or compromising the browser's security boundaries.

### New Components

- **Developer Dashboard (`nova://developer`)**: A unified React view allowing the user to inspect the current page. It runs in the renderer process and uses secure IPC (`electronAPI`) to fetch data from the main process.
- **Developer Services (`src/main/services/developer.ts`)**: Collects network requests, console logs, and storage states on a per-tab basis.
- **API Tester (`nova://api`)**: A REST client UI that uses standard `fetch` within the secured renderer sandbox.
- **JSON Viewer (`nova://json`)**: Pretty-prints JSON responses securely.
- **Responsive Mode**: Dynamically resizes the `WebContentsView` of the active tab while preserving the outer React UI, letting developers preview different viewports.

### Security Implementation

NOVA maintains a strict security model:
- `nodeIntegration` is **false** for all web contents.
- `contextIsolation` is **true**.
- Arbitrary web pages do not have access to developer APIs or Node.js features.
- LocalStorage, SessionStorage, and Cookies are inspected by the main process and passed safely as serializable objects to the developer dashboard.

### Known Limitations

- DOM inspection (Elements tab) currently only fetches a snapshot of `document.documentElement.outerHTML`. Real-time DOM tree manipulation is not implemented in this lightweight version.
- Responsive preview resizes the window content but does not simulate device-specific user agents or touch events yet.
- Color Picker uses a standard HTML5 input picker rather than direct screen pixel sampling due to security limitations of screen capture in standard web APIs.
