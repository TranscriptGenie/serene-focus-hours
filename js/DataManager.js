
// Handles all data storage and retrieval operations

export class DataManager {
  constructor() {
    this.dailyGoal = 4; // 4 hours default
    this.dailyProgress = 0;
    this.todaysSessions = [];
  }

  async loadSavedData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['focusData'], (result) => {
        if (result.focusData) {
          const data = result.focusData;
          this.dailyProgress = data.dailyProgress || 0;
          this.dailyGoal = data.goal || 4;
          this.todaysSessions = data.sessions || [];
          
          // Check if data is from today
          const today = new Date().toDateString();
          if (data.date !== today) {
            // Reset for new day
            this.dailyProgress = 0;
            this.todaysSessions = [];
          }
        }
        resolve();
      });
    });
  }

  async loadTimerState() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['timerState'], (result) => {
        resolve(result.timerState || null);
      });
    });
  }

  saveData() {
    const data = {
      dailyProgress: this.dailyProgress,
      goal: this.dailyGoal,
      sessions: this.todaysSessions,
      date: new Date().toDateString()
    };
    chrome.storage.local.set({ focusData: data });
  }

  saveTimerState(isRunning, startTime, seconds) {
    const timerState = {
      isRunning,
      startTime,
      seconds
    };
    chrome.storage.local.set({ timerState });
  }

  clearTimerState() {
    chrome.storage.local.remove('timerState');
  }

  addSession(duration) {
    const sessionHours = duration / 3600;
    this.dailyProgress += sessionHours;
    this.todaysSessions.push({
      duration: duration,
      timestamp: Date.now()
    });
    this.saveData();
  }

  updateGoal(newGoal) {
    this.dailyGoal = newGoal;
    this.saveData();
  }
}
