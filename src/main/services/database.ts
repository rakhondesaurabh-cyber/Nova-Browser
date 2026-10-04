import path from 'node:path';
import { app } from 'electron';
import fs from 'node:fs';

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'nova_browser_data.json');

interface DatabaseSchema {
  history: any[];
  bookmarks: any[];
  settings: Record<string, string>;
  downloads: any[];
  closed_tabs: any[];
  session?: any;
}

let dbData: DatabaseSchema = {
  history: [],
  bookmarks: [],
  settings: {},
  downloads: [],
  closed_tabs: []
};

// Initialize database schema
export function initDatabase() {
  if (fs.existsSync(dbPath)) {
    try {
      const data = fs.readFileSync(dbPath, 'utf8');
      dbData = JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse DB, using empty DB');
    }
  } else {
    saveDatabase();
  }
}

export function saveDatabase() {
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
}

export const db = {
  get: () => dbData,
  save: saveDatabase
};
