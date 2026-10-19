// Creates the "⚡ Zuari" panel inside Chrome / Edge / Arc Developer Tools
chrome.devtools.panels.create(
  "⚡ Zuari",
  "icon.png",
  "panel.html",
  function(panel) {
    console.log("[Zuari DevTools Panel] Initialized.");
  }
);
