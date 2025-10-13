// Popup script for TrackMyOPT
console.log('TrackMyOPT popup loaded');

document.addEventListener('DOMContentLoaded', () => {
  const appDiv = document.getElementById('app');
  if (appDiv) {
    appDiv.innerHTML = `
      <h1>TrackMyOPT</h1>
      <p>Track your OPT timeline with precision</p>
    `;
  }
});

