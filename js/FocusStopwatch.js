
// Main Focus Stopwatch class with core timer logic

import { DataManager } from './DataManager.js';
import { UIController } from './UIController.js';
import { SettingsManager } from './SettingsManager.js';
import { showToast } from './utils.js';

export class FocusStopwatch {
  constructor() {
    this.isRunning = false;
    this.seconds = 0;
    this.intervalId = null;
    this.startTime = null;

    this.dataManager = new DataManager();
    this.uiController = new UIController();
    
    this.init();
  }

  async init() {
    await this.dataManager.loadSavedData();
    this.settingsManager = new SettingsManager(this.dataManager, () => this.updateDisplay());
    this.settingsManager.updateGoalInput();
    
    await this.restoreTimerState();
    this.bindEvents();
    this.updateDisplay();
  }

  async restoreTimerState() {
    const timerState = await this.dataManager.loadTimerState();
    if (timerState && timerState.isRunning) {
      const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
      this.seconds = elapsed;
      this.startTimer();
    }
  }

  bindEvents() {
    this.uiController.startBtn.addEventListener('click', () => this.handleStart());
    this.uiController.pauseBtn.addEventListener('click', () => this.handlePause());
    this.uiController.stopBtn.addEventListener('click', () => this.handleStop());
  }

  updateDisplay() {
    const timerData = {
      seconds: this.seconds,
      isRunning: this.isRunning
    };
    
    const progressData = {
      dailyProgress: this.dataManager.dailyProgress,
      dailyGoal: this.dataManager.dailyGoal,
      sessions: this.dataManager.todaysSessions
    };

    this.uiController.updateAll(timerData, progressData);
  }

  handleStart() {
    this.startTimer();
    showToast("Focus session started", "You're in the zone now ✨");
  }

  handlePause() {
    this.pauseTimer();
    showToast("Session paused", "Take a mindful break");
  }

  handleStop() {
    if (this.seconds > 0) {
      const sessionMinutes = Math.round(this.seconds / 60);
      this.dataManager.addSession(this.seconds);
      showToast("Focus session completed!", `${sessionMinutes} minutes of deep work recorded`);
    }
    
    this.stopTimer();
  }

  startTimer() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = Date.now() - (this.seconds * 1000);
      
      this.intervalId = setInterval(() => {
        this.seconds++;
        this.updateDisplay();
      }, 1000);

      this.dataManager.saveTimerState(this.isRunning, this.startTime, this.seconds);
      this.updateDisplay();
    }
  }

  pauseTimer() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.dataManager.saveTimerState(this.isRunning, this.startTime, this.seconds);
    this.updateDisplay();
  }

  stopTimer() {
    this.pauseTimer();
    this.seconds = 0;
    this.dataManager.clearTimerState();
    this.updateDisplay();
  }
}
