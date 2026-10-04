import { db } from './database';

export interface HistoryItem {
  id?: number;
  url: string;
  title?: string;
  favicon?: string;
  visitedAt: number;
  visitCount?: number;
}

export const historyService = {
  addVisit: (item: Omit<HistoryItem, 'id' | 'visitCount'>) => {
    if (!item.url || item.url.startsWith('nova://') || item.url.startsWith('devtools://')) {
      return;
    }

    const data = db.get();
    const existing = data.history.find((h: any) => h.url === item.url);

    if (existing) {
      existing.visitedAt = item.visitedAt;
      existing.title = item.title;
      if (item.favicon) existing.favicon = item.favicon;
      existing.visitCount = (existing.visitCount || 1) + 1;
    } else {
      data.history.push({
        id: Date.now(),
        ...item,
        visitCount: 1
      });
    }
    db.save();
  },

  getHistory: (limit = 100, offset = 0) => {
    const data = db.get();
    return data.history.sort((a, b) => b.visitedAt - a.visitedAt).slice(offset, offset + limit);
  },

  searchHistory: (query: string, limit = 50) => {
    const data = db.get();
    const q = query.toLowerCase();
    return data.history
      .filter((h) => h.url.toLowerCase().includes(q) || (h.title && h.title.toLowerCase().includes(q)))
      .sort((a, b) => b.visitedAt - a.visitedAt)
      .slice(0, limit);
  },

  deleteEntry: (id: number) => {
    const data = db.get();
    data.history = data.history.filter((h) => h.id !== id);
    db.save();
  },

  clearHistory: () => {
    const data = db.get();
    data.history = [];
    db.save();
  }
};
