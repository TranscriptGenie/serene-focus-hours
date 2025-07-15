
// Manages the history view UI

import { formatTime } from './utils.js';

export class HistoryUI {
  constructor(historyManager) {
    this.historyManager = historyManager;
    this.isHistoryVisible = false;
    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    this.historyToggle = document.getElementById('historyToggle');
    this.historyPanel = document.getElementById('historyPanel');
    this.historyList = document.getElementById('historyList');
    this.statsSection = document.getElementById('statsSection');
  }

  bindEvents() {
    this.historyToggle.addEventListener('click', () => this.toggleHistory());
  }

  toggleHistory() {
    this.isHistoryVisible = !this.isHistoryVisible;
    this.historyPanel.classList.toggle('hidden');
    
    if (this.isHistoryVisible) {
      this.updateHistoryDisplay();
    }
  }

  updateHistoryDisplay() {
    const recentHistory = this.historyManager.getRecentHistory(7);
    const stats = this.historyManager.getTotalStats();

    // Update stats
    this.statsSection.innerHTML = `
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${stats.totalHours}h</div>
          <div class="stat-label">Total Hours</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.completedDays}</div>
          <div class="stat-label">Goals Met</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.completionRate}%</div>
          <div class="stat-label">Success Rate</div>
        </div>
      </div>
    `;

    // Update history list
    this.historyList.innerHTML = '';
    
    if (recentHistory.length === 0) {
      this.historyList.innerHTML = '<div class="no-history">No focus history yet. Start your first session!</div>';
      return;
    }

    recentHistory.forEach(record => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      
      const date = new Date(record.date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
      
      let dateLabel = date.toLocaleDateString();
      if (isToday) dateLabel = 'Today';
      else if (isYesterday) dateLabel = 'Yesterday';
      
      historyItem.innerHTML = `
        <div class="history-date">${dateLabel}</div>
        <div class="history-details">
          <div class="history-hours">${record.totalHours}h</div>
          <div class="history-sessions">${record.sessions} sessions</div>
          <div class="history-goal">Goal: ${record.goal}h</div>
        </div>
        <div class="history-status ${record.completed ? 'completed' : 'incomplete'}">
          ${record.completed ? '✓' : '○'}
        </div>
      `;
      
      this.historyList.appendChild(historyItem);
    });
  }
}
