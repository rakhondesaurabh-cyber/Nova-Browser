import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Copy, Trash2, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTabId: number | null;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isStreaming?: boolean;
}

export const AISidebar = ({ isOpen, onClose, activeTabId }: AISidebarProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.onAiChunk((reqId: string, chunk: string) => {
        setMessages(prev => prev.map(m => {
          if (m.id === reqId) {
            return { ...m, content: m.content + chunk };
          }
          return m;
        }));
      });

      (window as any).electronAPI.onAiDone((reqId: string, error?: string) => {
        setIsGenerating(false);
        if (error) {
          setMessages(prev => prev.map(m => m.id === reqId ? { ...m, content: m.content + `\n\n**Error**: ${error}`, isStreaming: false } : m));
        } else {
          setMessages(prev => prev.map(m => m.id === reqId ? { ...m, isStreaming: false } : m));
        }
      });
    }
  }, []);

  const handleAsk = async (prompt: string, includePageContext = false) => {
    if (!prompt.trim() || isGenerating) return;
    
    let context = '';
    if (includePageContext && activeTabId && (window as any).electronAPI) {
      context = await (window as any).electronAPI.aiGetPageContent(activeTabId);
    }
    
    const reqId = Date.now().toString();
    
    setMessages(prev => [
      ...prev, 
      { id: Date.now().toString() + '-u', role: 'user', content: prompt },
      { id: reqId, role: 'ai', content: '', isStreaming: true }
    ]);
    
    setInput('');
    setIsGenerating(true);
    
    if ((window as any).electronAPI) {
      (window as any).electronAPI.aiGenerate(reqId, prompt, context);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="ai-sidebar">
      <div className="ai-header">
        <div className="ai-header-title">
          <Sparkles size={18} color="#c084fc" />
          <span>NOVA AI</span>
        </div>
        <div className="ai-header-actions">
          <button className="ai-icon-btn" onClick={() => setMessages([])} title="Clear Conversation"><Trash2 size={16} /></button>
          <button className="ai-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
      </div>
      
      <div className="ai-messages">
        {messages.length === 0 && (
          <div className="ai-empty">
            <Sparkles size={32} color="#c084fc" className="mb-4 opacity-50" />
            <p>Ask anything about this page</p>
            <div className="ai-presets">
              <button onClick={() => handleAsk("Please summarize this page.", true)}>Summarize</button>
              <button onClick={() => handleAsk("Explain the main concepts of this page simply.", true)}>Explain</button>
              <button onClick={() => handleAsk("Extract the key points from this page as a bulleted list.", true)}>Key Points</button>
            </div>
          </div>
        )}
        
        {messages.map(msg => (
          <div key={msg.id} className={`ai-message ${msg.role}`}>
            {msg.role === 'ai' && (
              <div className="ai-avatar"><Sparkles size={12} color="#fff" /></div>
            )}
            <div className="ai-bubble">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
              {msg.isStreaming && <span className="ai-cursor"></span>}
            </div>
            {msg.role === 'ai' && !msg.isStreaming && (
              <button className="ai-copy-btn" onClick={() => copyToClipboard(msg.content)}><Copy size={12} /></button>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="ai-input-area">
        <div className="ai-input-wrapper">
          <input 
            type="text" 
            placeholder="Ask NOVA..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAsk(input, true);
            }}
          />
          <button 
            className="ai-send-btn" 
            disabled={!input.trim() || isGenerating}
            onClick={() => handleAsk(input, true)}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="ai-disclaimer">AI can make mistakes. Verify important info.</div>
      </div>
    </div>
  );
};
