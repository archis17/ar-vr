/**
 * app.js — Main Application Entry Point
 * Initializes the AR scene, marker detection, and all modules.
 */
(function () {
  'use strict';

  window.currentFurnitureId = 'sofa';

  function init() {
    // Wait for A-Frame scene to load
    const scene = document.querySelector('a-scene');
    if (!scene) {
      console.error('A-Frame scene not found');
      return;
    }

    scene.addEventListener('loaded', onSceneLoaded);

    // Setup marker detection events
    const marker = document.getElementById('ar-marker');
    if (marker) {
      marker.addEventListener('markerFound', onMarkerFound);
      marker.addEventListener('markerLost', onMarkerLost);
    }
  }

  function onSceneLoaded() {
    console.log('[AR Furniture] Scene loaded');

    // Initialize modules
    if (window.initUI) window.initUI();
    if (window.initInteractions) window.initInteractions();

    console.log('[AR Furniture] All modules initialized');
  }

  function onMarkerFound() {
    console.log('[AR Furniture] Marker found');
    if (window.updateStatus) window.updateStatus(true);
  }

  function onMarkerLost() {
    console.log('[AR Furniture] Marker lost');
    if (window.updateStatus) window.updateStatus(false);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
