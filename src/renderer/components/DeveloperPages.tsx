import React, { useEffect, useState } from 'react';

// API Tester
export const ApiTesterPage = () => {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{\n  "Accept": "application/json"\n}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      let parsedHeaders = {};
      try {
        if (headers.trim()) parsedHeaders = JSON.parse(headers);
      } catch (e) {
        alert("Invalid JSON in headers");
        setLoading(false);
        return;
      }
      
      const req = { url, method, headers: parsedHeaders, body: ['GET', 'HEAD'].includes(method) ? undefined : body };
      const res = await (window as any).electronAPI.executeApiRequest(req);
      setResponse(res);
    } catch (e: any) {
      setResponse({ error: e.message });
    }
    setLoading(false);
  };

  return (
    <div className="internal-page api-tester-page">
      <div className="page-header">
        <h1>API Tester</h1>
      </div>
      <div className="api-layout" style={{ display: 'flex', gap: '20px' }}>
        <div className="api-request" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={method} onChange={e => setMethod(e.target.value)} style={{ padding: '8px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m}>{m}</option>)}
            </select>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} style={{ flex: 1, padding: '8px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }} placeholder="https://api.example.com" />
            <button onClick={handleSend} disabled={loading} style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>Headers (JSON)</label>
            <textarea value={headers} onChange={e => setHeaders(e.target.value)} rows={4} style={{ width: '100%', padding: '8px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', fontFamily: 'monospace' }} />
          </div>
          {!['GET', 'HEAD'].includes(method) && (
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>Body</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} style={{ width: '100%', padding: '8px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', fontFamily: 'monospace' }} />
            </div>
          )}
        </div>
        
        <div className="api-response" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '1px solid #444', paddingLeft: '20px' }}>
          <h3>Response</h3>
          {response ? (
            response.error ? (
              <div style={{ color: '#ff6b6b' }}>Error: {response.error}</div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#aaa' }}>
                  <span>Status: <span style={{ color: response.status >= 200 && response.status < 300 ? '#4ade80' : '#ff6b6b' }}>{response.status} {response.statusText}</span></span>
                  <span>Time: {response.duration}ms</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', background: '#111', padding: '10px', borderRadius: '4px', border: '1px solid #333' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '13px', fontFamily: 'monospace' }}>
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(response.body), null, 2);
                      } catch {
                        return response.body;
                      }
                    })()}
                  </pre>
                </div>
              </>
            )
          ) : (
            <div style={{ color: '#888', fontStyle: 'italic' }}>Send a request to see the response.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// JSON Viewer
export const JsonViewerPage = ({ url }: { url: string }) => {
  const [json, setJson] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchJson = async () => {
      try {
        const u = new URL(url);
        const actualUrl = u.searchParams.get('url');
        if (actualUrl) {
          const res = await fetch(actualUrl);
          const text = await res.text();
          setJson(JSON.stringify(JSON.parse(text), null, 2));
        }
      } catch (e: any) {
        setError(e.message);
      }
    };
    fetchJson();
  }, [url]);

  return (
    <div className="internal-page json-viewer-page" style={{ maxWidth: '1000px' }}>
      <div className="page-header">
        <h1>JSON Viewer</h1>
      </div>
      {error ? (
        <div style={{ color: '#ff6b6b' }}>Error loading JSON: {error}</div>
      ) : json ? (
        <pre style={{ background: '#111', padding: '20px', borderRadius: '8px', border: '1px solid #333', overflowX: 'auto', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5' }}>
          {json}
        </pre>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

// Developer Dashboard
export const DeveloperDashboardPage = ({ activeTabId }: { activeTabId: number | null }) => {
  const [activePanel, setActivePanel] = useState('elements');
  const [pageInfo, setPageInfo] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [network, setNetwork] = useState<any[]>([]);
  const [storage, setStorage] = useState<any>(null);
  const [source, setSource] = useState<string>('');

  useEffect(() => {
    if (!activeTabId) return;
    
    // In a real app we'd want to know WHICH tab we are inspecting.
    // Since this runs in a tab, we assume we inspect the previous tab?
    // Actually the prompt asks for Developer Mode accessible from Menu/Command Palette.
    // If they click "Developer Mode", maybe it inspects the LAST active tab, passed via query param?
    // For simplicity, let's just use window.location.search to get targetId
    const targetId = new URLSearchParams(window.location.search).get('targetId') || activeTabId;
    const tid = parseInt(targetId as string);

    const loadData = async () => {
      const api = (window as any).electronAPI;
      setPageInfo(await api.getPageInfo(tid));
      setLogs(await api.getDevLogs(tid));
      setNetwork(await api.getDevNetwork(tid));
      setStorage(await api.getDevStorage(tid));
      setSource(await api.getPageSource(tid));
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [activeTabId]);

  return (
    <div className="internal-page developer-dashboard" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', maxWidth: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', background: '#222', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{pageInfo?.title || 'Unknown Page'}</h2>
          <div style={{ color: '#aaa', fontSize: '13px' }}>{pageInfo?.url || 'No URL'}</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => (window as any).electronAPI.takeScreenshot(activeTabId!)} style={{ padding: '6px 12px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Screenshot</button>
          <button onClick={() => (window as any).electronAPI.clearSiteData(activeTabId!)} style={{ padding: '6px 12px', background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Clear Data</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2px', marginBottom: '10px', borderBottom: '1px solid #444' }}>
        {['Elements', 'Console', 'Network', 'Storage'].map(p => (
          <div 
            key={p} 
            onClick={() => setActivePanel(p.toLowerCase())}
            style={{ 
              padding: '10px 20px', cursor: 'pointer',
              borderBottom: activePanel === p.toLowerCase() ? '2px solid #6366f1' : '2px solid transparent',
              color: activePanel === p.toLowerCase() ? '#fff' : '#888'
            }}
          >
            {p}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: '#1a1a1c', border: '1px solid #333', borderRadius: '0 0 8px 8px' }}>
        {activePanel === 'elements' && (
          <div style={{ padding: '15px' }}>
            <h3 style={{ marginTop: 0, fontSize: '14px', color: '#ccc', marginBottom: '10px' }}>Color Picker</h3>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', background: '#111', padding: '10px', borderRadius: '4px' }}>
              <input type="color" id="dev-color" defaultValue="#6366f1" onChange={(e) => {
                const hex = e.target.value;
                const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
                document.getElementById('c-hex')!.innerText = hex;
                document.getElementById('c-rgb')!.innerText = `rgb(${r}, ${g}, ${b})`;
              }} style={{ width: '50px', height: '50px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
              <div>
                <div style={{ color: '#aaa', fontSize: '12px' }}>HEX: <span id="c-hex" style={{ color: '#fff', userSelect: 'all' }}>#6366f1</span></div>
                <div style={{ color: '#aaa', fontSize: '12px' }}>RGB: <span id="c-rgb" style={{ color: '#fff', userSelect: 'all' }}>rgb(99, 102, 241)</span></div>
              </div>
            </div>
            
            <h3 style={{ marginTop: 0, fontSize: '14px', color: '#ccc', marginBottom: '10px' }}>Page Source</h3>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
              {source || '<html><body>No content loaded or unable to fetch source.</body></html>'}
            </pre>
          </div>
        )}
        {activePanel === 'console' && (
          <div style={{ padding: '0' }}>
            {logs.length === 0 ? <div style={{ padding: '15px', color: '#888' }}>No console logs.</div> : logs.map((l, i) => (
              <div key={i} style={{ 
                padding: '8px 15px', 
                borderBottom: '1px solid #2a2a2e',
                color: l.level === 3 ? '#ff6b6b' : l.level === 2 ? '#eab308' : '#e2e8f0',
                background: l.level === 3 ? 'rgba(255, 107, 107, 0.1)' : l.level === 2 ? 'rgba(234, 179, 8, 0.1)' : 'transparent',
                fontFamily: 'monospace', fontSize: '12px', display: 'flex', gap: '15px'
              }}>
                <span style={{ flex: 1 }}>{l.message}</span>
                <span style={{ color: '#666', flexShrink: 0 }}>{l.sourceId.split('/').pop()}:{l.line}</span>
              </div>
            ))}
          </div>
        )}
        {activePanel === 'network' && (
          <div style={{ padding: '0' }}>
            {network.length === 0 ? <div style={{ padding: '15px', color: '#888' }}>No network requests recorded.</div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#222', borderBottom: '1px solid #444' }}>
                    <th style={{ padding: '8px 15px', fontWeight: 'normal', color: '#aaa' }}>Method</th>
                    <th style={{ padding: '8px 15px', fontWeight: 'normal', color: '#aaa' }}>Status</th>
                    <th style={{ padding: '8px 15px', fontWeight: 'normal', color: '#aaa' }}>Type</th>
                    <th style={{ padding: '8px 15px', fontWeight: 'normal', color: '#aaa' }}>URL</th>
                    <th style={{ padding: '8px 15px', fontWeight: 'normal', color: '#aaa' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {network.map((req, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #2a2a2e' }}>
                      <td style={{ padding: '6px 15px', color: '#93c5fd' }}>{req.method}</td>
                      <td style={{ padding: '6px 15px', color: req.status === 0 || req.status >= 400 ? '#ff6b6b' : '#4ade80' }}>{req.status || '...'}</td>
                      <td style={{ padding: '6px 15px', color: '#ccc' }}>{req.type}</td>
                      <td style={{ padding: '6px 15px', color: '#e2e8f0', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.url}</td>
                      <td style={{ padding: '6px 15px', color: '#888' }}>{req.duration ? `${req.duration}ms` : 'pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {activePanel === 'storage' && (
          <div style={{ padding: '15px' }}>
            <h3 style={{ marginTop: 0, fontSize: '14px', color: '#ccc' }}>Local Storage</h3>
            <pre style={{ background: '#111', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>{JSON.stringify(storage?.localStorage, null, 2)}</pre>
            
            <h3 style={{ marginTop: '20px', fontSize: '14px', color: '#ccc' }}>Session Storage</h3>
            <pre style={{ background: '#111', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>{JSON.stringify(storage?.sessionStorage, null, 2)}</pre>
            
            <h3 style={{ marginTop: '20px', fontSize: '14px', color: '#ccc' }}>Cookies</h3>
            <pre style={{ background: '#111', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>{JSON.stringify(storage?.cookies, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
