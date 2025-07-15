
// Handles auto-saving focus sessions when browser is closed

export class AutoSaveManager {
  constructor(dataManager, historyManager) {
    this.dataManager = dataManager;
    this.historyManager = historyManager;
    this.setupAutoSave();
  }

  setupAutoSave() {
    // Listen for browser close events
    window.addEventListener('beforeunload', () => {
      this.autoSaveSession();
    });

    // Listen for visibility changes (tab switching, minimizing)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.autoSaveSession();
      }
    });

    // Periodic auto-save every 30 seconds
    setInterval(() => {
      this.autoSaveSession();
    }, 30000);
  }

  autoSaveSession() {
    const timerState = this.dataManager.getTimerState();
    
    if (timerState && timerState.isRunning && timerState.seconds > 0) {
      // Auto-complete the current session
      this.dataManager.addSession(timerState.seconds);
      this.dataManager.clearTimerState();
      
      // Save to history
      const today = new Date().toDateString();
      this.historyManager.addDailyRecord(
        today,
        this.dataManager.dailyProgress,
        this.dataManager.todaysSessions,
        this.dataManager.dailyGoal
      );
    }
  }
}
