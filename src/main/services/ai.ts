import { db } from './database';

export class AIService {
  private getSettings() {
    const settings = db.get().settings || {};
    return {
      enabled: settings['aiEnabled'] !== 'false',
      provider: settings['aiProvider'] || 'mock',
      apiKey: settings['aiApiKey'] || '',
      model: settings['aiModel'] || 'gemini-1.5-flash',
    };
  }

  async *generateStream(prompt: string, context?: string): AsyncGenerator<string, void, unknown> {
    const settings = this.getSettings();
    if (!settings.enabled) {
      yield "AI Assistant is currently disabled in Settings.";
      return;
    }

    if (settings.provider === 'mock') {
      const mockResponse = `This is a mock response from NOVA AI.\n\nPrompt: ${prompt}\n\nContext provided: ${context ? context.substring(0, 100) + '...' : 'None'}\n\nTo use a real AI, please configure your API Key in Settings.`;
      
      const words = mockResponse.split(' ');
      for (const word of words) {
        yield word + ' ';
        await new Promise(r => setTimeout(r, 50));
      }
      return;
    }

    if (!settings.apiKey) {
      yield "API Key is missing. Please configure your API key in NOVA Settings.";
      return;
    }

    if (settings.provider === 'gemini') {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:streamGenerateContent?alt=sse&key=${settings.apiKey}`;
        const fullPrompt = context ? `Context: ${context}\n\nTask: ${prompt}` : prompt;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }]
          })
        });

        if (!response.ok) {
          const err = await response.json();
          yield `AI Provider Error: ${err.error?.message || response.statusText}`;
          return;
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");

        if (reader) {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer
            
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const dataStr = trimmed.slice(6);
                if (dataStr === '[DONE]') continue;
                try {
                  const json = JSON.parse(dataStr);
                  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) yield text;
                } catch (e) {
                  // Ignore JSON parse errors for incomplete blocks
                }
              }
            }
          }
        }
      } catch (err: any) {
        yield `Network Error: ${err.message}`;
      }
    }
  }
}

export const aiService = new AIService();
