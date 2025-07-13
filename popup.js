
class FocusStopwatch {
  constructor() {
    this.isRunning = false;
    this.seconds = 0;
    this.dailyGoal = 4; // 4 hours default
    this.dailyProgress = 0;
    this.todaysSessions = [];
    this.intervalId = null;
    this.startTime = null;

    this.initializeElements();
    this.loadSavedData();
    this.bindEvents();
    this.updateDisplay();
  }

  initializeElements() {
    this.timeDisplay = document.getElementById('timeDisplay');
    this.statusText = document.getElementById('statusText');
    this.startBtn = document.getElementById('startBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.stopBtn = document.getElementById('stopBtn');
    this.totalHours = document.getElementById('totalHours');
    this.dailyGoalSpan = document.getElementById('dailyGoal');
    this.progressFill = document.getElementById('progressFill');
    this.progressPercent = document.getElementById('progressPercent');
    this.remainingTime = document.getElementById('remainingTime');
    this.sessionCount = document.getElementById('sessionCount');
    this.sessionsList = document.getElementById('sessionsList');
    this.sessionsSection = document.getElementById('sessionsSection');
    
    // Settings elements
    this.settingsToggle = document.getElementById('settingsToggle');
    this.settingsPanel = document.getElementById('settingsPanel');
    this.goalInput = document.getElementById('goalInput');
    this.saveGoalBtn = document.getElementById('saveGoal');
  }

  loadSavedData() {
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
      this.updateDisplay();
      this.updateGoalInput();
    });

    // Check if timer was running when popup was closed
    chrome.storage.local.get(['timerState'], (result) => {
      if (result.timerState && result.timerState.isRunning) {
        const elapsed = Math.floor((Date.now() - result.timerState.startTime) / 1000);
        this.seconds = elapsed;
        this.startTimer();
      }
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

  saveTimerState() {
    const timerState = {
      isRunning: this.isRunning,
      startTime: this.startTime,
      seconds: this.seconds
    };
    chrome.storage.local.set({ timerState });
  }

  bindEvents() {
    this.startBtn.addEventListener('click', () => this.handleStart());
    this.pauseBtn.addEventListener('click', () => this.handlePause());
    this.stopBtn.addEventListener('click', () => this.handleStop());
    
    // Settings events
    this.settingsToggle.addEventListener('click', () => this.toggleSettings());
    this.saveGoalBtn.addEventListener('click', () => this.saveGoal());
    this.goalInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.saveGoal();
      }
    });
  }

  toggleSettings() {
    this.settingsPanel.classList.toggle('hidden');
  }

  saveGoal() {
    const newGoal = parseFloat(this.goalInput.value);
    if (newGoal && newGoal >= 0.5 && newGoal <= 24) {
      this.dailyGoal = newGoal;
      this.saveData();
      this.updateDisplay();
      this.showToast("Goal updated!", `Daily goal set to ${newGoal} hours`);
      this.settingsPanel.classList.add('hidden');
    } else {
      this.showToast("Invalid goal", "Please enter a value between 0.5 and 24 hours");
    }
  }

  updateGoalInput() {
    if (this.goalInput) {
      this.goalInput.value = this.dailyGoal;
    }
  }

  formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  updateDisplay() {
    // Update timer display
    this.timeDisplay.textContent = this.formatTime(this.seconds);
    this.statusText.textContent = this.isRunning ? "In deep focus" : "Ready to begin";

    // Update daily progress
    const currentSessionHours = this.seconds / 3600;
    const totalHours = this.dailyProgress + currentSessionHours;
    this.totalHours.textContent = `${totalHours.toFixed(1)}h`;
    this.dailyGoalSpan.textContent = this.dailyGoal;

    // Update progress bar
    const progressPercentage = Math.min((totalHours / this.dailyGoal) * 100, 100);
    this.progressFill.style.width = `${progressPercentage}%`;
    this.progressPercent.textContent = `${Math.round(progressPercentage)}% complete`;

    const remaining = this.dailyGoal - this.dailyProgress;
    if (remaining > 0) {
      this.remainingTime.textContent = `${remaining.toFixed(1)}h remaining`;
    } else {
      this.remainingTime.textContent = "Goal achieved! ✨";
    }

    // Update sessions
    this.updateSessionsDisplay();

    // Update button states
    this.updateButtonStates();
  }

  updateSessionsDisplay() {
    const sessionCount = this.todaysSessions.length;
    this.sessionCount.textContent = `${sessionCount} session${sessionCount !== 1 ? 's' : ''} today`;

    if (sessionCount > 0) {
      this.sessionsSection.style.display = 'block';
      this.sessionsList.innerHTML = '';
      
      // Show last 5 sessions
      const recentSessions = this.todaysSessions.slice(-5);
      recentSessions.forEach(session => {
        const badge = document.createElement('div');
        badge.className = 'session-badge';
        badge.textContent = `${Math.round(session.duration / 60)}m`;
        this.sessionsList.appendChild(badge);
      });
    } else {
      this.sessionsSection.style.display = 'none';
    }
  }

  updateButtonStates() {
    if (this.isRunning) {
      this.startBtn.classList.add('hidden');
      this.pauseBtn.classList.remove('hidden');
      this.stopBtn.disabled = false;
    } else {
      this.startBtn.classList.remove('hidden');
      this.pauseBtn.classList.add('hidden');
      this.stopBtn.disabled = this.seconds === 0;
    }
  }

  handleStart() {
    this.startTimer();
    this.showToast("Focus session started", "You're in the zone now ✨");
  }

  handlePause() {
    this.pauseTimer();
    this.showToast("Session paused", "Take a mindful break");
  }

  handleStop() {
    if (this.seconds > 0) {
      const sessionMinutes = Math.round(this.seconds / 60);
      const sessionHours = this.seconds / 3600;
      
      this.dailyProgress += sessionHours;
      this.todaysSessions.push({
        duration: this.seconds,
        timestamp: Date.now()
      });

      this.saveData();
      this.showToast("Focus session completed!", `${sessionMinutes} minutes of deep work recorded`);
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

      this.saveTimerState();
      this.updateDisplay();
    }
  }

  pauseTimer() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.saveTimerState();
    this.updateDisplay();
  }

  stopTimer() {
    this.pauseTimer();
    this.seconds = 0;
    chrome.storage.local.remove('timerState');
    this.updateDisplay();
  }

  showToast(title, description) {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastDescription = document.getElementById('toastDescription');

    toastTitle.textContent = title;
    toastDescription.textContent = description;
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

// Initialize the app when popup loads
document.addEventListener('DOMContentLoaded', () => {
  new FocusStopwatch();
});
