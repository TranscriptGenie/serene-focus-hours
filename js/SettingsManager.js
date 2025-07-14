
// Handles settings functionality

import { showToast } from './utils.js';

export class SettingsManager {
  constructor(dataManager, onGoalUpdate) {
    this.dataManager = dataManager;
    this.onGoalUpdate = onGoalUpdate;
    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    this.settingsToggle = document.getElementById('settingsToggle');
    this.settingsPanel = document.getElementById('settingsPanel');
    this.goalInput = document.getElementById('goalInput');
    this.saveGoalBtn = document.getElementById('saveGoal');
  }

  bindEvents() {
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
      this.dataManager.updateGoal(newGoal);
      this.onGoalUpdate();
      showToast("Goal updated!", `Daily goal set to ${newGoal} hours`);
      this.settingsPanel.classList.add('hidden');
    } else {
      showToast("Invalid goal", "Please enter a value between 0.5 and 24 hours");
    }
  }

  updateGoalInput() {
    if (this.goalInput) {
      this.goalInput.value = this.dataManager.dailyGoal;
    }
  }
}
