import { WebContents, ipcMain, session } from 'electron';

export interface ConsoleLog {
  level: number;
  message: string;
  sourceId: string;
  line: number;
  timestamp: number;
}

export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status?: number;
  type: string;
  startTime: number;
  duration?: number;
}

class DeveloperService {
  private consoleLogs = new Map<number, ConsoleLog[]>();
  private networkRequests = new Map<number, NetworkRequest[]>();

  setupTab(id: number, wc: WebContents) {
    this.consoleLogs.set(id, []);
    this.networkRequests.set(id, []);

    wc.on('console-message', (event, level, message, line, sourceId) => {
      const logs = this.consoleLogs.get(id) || [];
      logs.push({ level, message, sourceId, line, timestamp: Date.now() });
      // Keep last 1000 logs
      if (logs.length > 1000) logs.shift();
      this.consoleLogs.set(id, logs);
    });

    const filter = { urls: ['<all_urls>'] };
    wc.session.webRequest.onBeforeRequest(filter, (details, callback) => {
      const requests = this.networkRequests.get(id) || [];
      requests.push({
        id: details.id.toString(),
        url: details.url,
        method: details.method,
        type: details.resourceType,
        startTime: Date.now()
      });
      if (requests.length > 1000) requests.shift();
      this.networkRequests.set(id, requests);
      callback({});
    });

    wc.session.webRequest.onCompleted(filter, (details) => {
      const requests = this.networkRequests.get(id) || [];
      const req = requests.find(r => r.id === details.id.toString());
      if (req) {
        req.status = details.statusCode;
        req.duration = Date.now() - req.startTime;
      }
    });

    wc.session.webRequest.onErrorOccurred(filter, (details) => {
      const requests = this.networkRequests.get(id) || [];
      const req = requests.find(r => r.id === details.id.toString());
      if (req) {
        req.status = 0; // Error
        req.duration = Date.now() - req.startTime;
      }
    });
  }

  cleanupTab(id: number) {
    this.consoleLogs.delete(id);
    this.networkRequests.delete(id);
  }

  getLogs(id: number) {
    return this.consoleLogs.get(id) || [];
  }

  getNetworkRequests(id: number) {
    return this.networkRequests.get(id) || [];
  }

  clearLogs(id: number) {
    this.consoleLogs.set(id, []);
  }

  clearNetworkRequests(id: number) {
    this.networkRequests.set(id, []);
  }
}

export const developerService = new DeveloperService();
