// Manages historical focus data and daily records

export class HistoryManager {
  constructor() {
    this.historyData = [];
  }

  async loadHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['focusHistory'], (result) => {
        this.historyData = result.focusHistory || [];
        resolve();
      });
    });
  }

  saveHistory() {
    chrome.storage.local.set({ focusHistory: this.historyData });
  }

  addDailyRecord(date, totalHours, sessions, goal) {
    // Check if record for this date already exists
    const existingIndex = this.historyData.findIndex(record => record.date === date);
    
    const record = {
      date,
      totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
      sessions: sessions.length,
      goal,
      completed: totalHours >= goal
    };

    if (existingIndex >= 0) {
      // Update existing record
      this.historyData[existingIndex] = record;
    } else {
      // Add new record
      this.historyData.push(record);
    }

    // Sort by date (newest first) and keep only last 30 days
    this.historyData.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.historyData = this.historyData.slice(0, 30);
    
    this.saveHistory();
  }

  getRecentHistory(days = 7) {
    return this.historyData.slice(0, days);
  }

  getTotalStats() {
    const totalDays = this.historyData.length;
    const completedDays = this.historyData.filter(record => record.completed).length;
    const totalHours = this.historyData.reduce((sum, record) => sum + record.totalHours, 0);
    
    return {
      totalDays,
      completedDays,
      totalHours: Math.round(totalHours * 100) / 100,
      completionRate: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
    };
  }
}
