
// Manages all UI updates and DOM interactions

import { formatTime } from './utils.js';

export class UIController {
  constructor() {
    this.initializeElements();
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
  }

  updateTimerDisplay(seconds, isRunning) {
    this.timeDisplay.textContent = formatTime(seconds);
    this.statusText.textContent = isRunning ? "In deep focus" : "Ready to begin";
  }

  updateProgressDisplay(dailyProgress, currentSessionSeconds, dailyGoal) {
    const currentSessionHours = currentSessionSeconds / 3600;
    const totalHours = dailyProgress + currentSessionHours;
    
    this.totalHours.textContent = `${totalHours.toFixed(1)}h`;
    this.dailyGoalSpan.textContent = dailyGoal;

    // Update progress bar
    const progressPercentage = Math.min((totalHours / dailyGoal) * 100, 100);
    this.progressFill.style.width = `${progressPercentage}%`;
    this.progressPercent.textContent = `${Math.round(progressPercentage)}% complete`;

    const remaining = dailyGoal - dailyProgress;
    if (remaining > 0) {
      this.remainingTime.textContent = `${remaining.toFixed(1)}h remaining`;
    } else {
      this.remainingTime.textContent = "Goal achieved! ✨";
    }
  }

  updateSessionsDisplay(sessions) {
    const sessionCount = sessions.length;
    this.sessionCount.textContent = `${sessionCount} session${sessionCount !== 1 ? 's' : ''} today`;

    if (sessionCount > 0) {
      this.sessionsSection.style.display = 'block';
      this.sessionsList.innerHTML = '';
      
      // Show last 5 sessions
      const recentSessions = sessions.slice(-5);
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

  updateButtonStates(isRunning, seconds) {
    if (isRunning) {
      this.startBtn.classList.add('hidden');
      this.pauseBtn.classList.remove('hidden');
      this.stopBtn.disabled = false;
    } else {
      this.startBtn.classList.remove('hidden');
      this.pauseBtn.classList.add('hidden');
      this.stopBtn.disabled = seconds === 0;
    }
  }

  updateAll(timerData, progressData) {
    this.updateTimerDisplay(timerData.seconds, timerData.isRunning);
    this.updateProgressDisplay(progressData.dailyProgress, timerData.seconds, progressData.dailyGoal);
    this.updateSessionsDisplay(progressData.sessions);
    this.updateButtonStates(timerData.isRunning, timerData.seconds);
  }
}
