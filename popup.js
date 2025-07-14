
// Main entry point for the Focus Stopwatch extension

import { FocusStopwatch } from './js/FocusStopwatch.js';

// Initialize the app when popup loads
document.addEventListener('DOMContentLoaded', () => {
  new FocusStopwatch();
});
