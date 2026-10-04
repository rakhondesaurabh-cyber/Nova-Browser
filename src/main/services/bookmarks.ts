import { db } from './database';

export interface Bookmark {
  id?: number;
  url: string;
  title?: string;
  favicon?: string;
  folderId?: number;
  createdAt: number;
  updatedAt: number;
}

export const bookmarksService = {
  addBookmark: (item: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
    const data = db.get();
    if (data.bookmarks.find((b: any) => b.url === item.url)) {
      return false; // Already bookmarked
    }
    const now = Date.now();
    data.bookmarks.push({
      id: Date.now(),
      ...item,
      folderId: item.folderId || 0,
      createdAt: now,
      updatedAt: now
    });
    db.save();
    return true;
  },

  removeBookmark: (url: string) => {
    const data = db.get();
    data.bookmarks = data.bookmarks.filter((b: any) => b.url !== url);
    db.save();
  },

  isBookmarked: (url: string) => {
    const data = db.get();
    return !!data.bookmarks.find((b: any) => b.url === url);
  },

  getAllBookmarks: () => {
    const data = db.get();
    return data.bookmarks.sort((a, b) => b.createdAt - a.createdAt);
  },

  updateBookmark: (id: number, title: string, folderId: number) => {
    const data = db.get();
    const bookmark = data.bookmarks.find((b: any) => b.id === id);
    if (bookmark) {
      bookmark.title = title;
      bookmark.folderId = folderId;
      bookmark.updatedAt = Date.now();
      db.save();
    }
  }
};
