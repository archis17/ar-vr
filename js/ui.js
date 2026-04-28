/**
 * ui.js — UI Controller for AR Furniture Visualizer
 * Manages overlays, furniture selector, product info, color picker, toasts.
 */
(function () {
  'use strict';

  let currentFurnitureIndex = 0;
  let currentColorIndex = 0;
  let markerDetected = false;
  let productInfoVisible = false;
  let colorPickerVisible = false;

  /* --- Toast Notifications --- */
  function showToast(msg, duration) {
    duration = duration || 2500;
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), duration);
  }

  /* --- Loading Screen --- */
  function hideLoading() {
    const ls = document.getElementById('loading-screen');
    if (ls) ls.classList.add('hidden');
  }

  /* --- Instruction Overlay --- */
  function showInstructions() {
    const ov = document.getElementById('instruction-overlay');
    if (ov) ov.classList.remove('hidden');
  }

  function hideInstructions() {
    const ov = document.getElementById('instruction-overlay');
    if (ov) ov.classList.add('hidden');
  }

  /* --- Status Badge --- */
  function updateStatus(detected) {
    markerDetected = detected;
    const badge = document.getElementById('status-badge');
    const guide = document.getElementById('marker-guide');
    if (badge) {
      if (detected) {
        badge.classList.add('detected');
        badge.querySelector('.status-text').textContent = 'Marker Detected';
      } else {
        badge.classList.remove('detected');
        badge.querySelector('.status-text').textContent = 'Looking for marker...';
      }
    }
    if (guide) {
      if (detected) guide.classList.add('hidden');
      else guide.classList.remove('hidden');
    }
  }

  /* --- Furniture Selector --- */
  function buildFurnitureCards() {
    const grid = document.getElementById('furniture-grid');
    if (!grid || !window.FurnitureCatalog) return;
    grid.innerHTML = '';
    window.FurnitureCatalog.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'furniture-card' + (i === currentFurnitureIndex ? ' selected' : '');
      card.dataset.index = i;
      card.innerHTML = `
        <span class="card-icon">${item.icon}</span>
        <div class="card-name">${item.name}</div>
        <div class="card-dims">${item.dimensions}</div>`;
      card.addEventListener('click', () => selectFurniture(i));
      grid.appendChild(card);
    });
  }

  function selectFurniture(index) {
    currentFurnitureIndex = index;
    currentColorIndex = 0;
    const item = window.FurnitureCatalog[index];
    window.currentFurnitureId = item.id;

    // Update cards
    document.querySelectorAll('.furniture-card').forEach((c, i) => {
      c.classList.toggle('selected', i === index);
    });

    // Place model
    const marker = document.getElementById('ar-marker');
    if (marker) {
      const old = marker.querySelector('#furniture-model');
      if (old) old.remove();
      const model = window.createFurnitureModel(item.id, currentColorIndex);
      if (model) marker.appendChild(model);
    }

    // Update product info
    updateProductInfo(item);
    // Update color picker
    buildColorPicker(item);
    showToast(`${item.icon} ${item.name} selected`);
  }

  /* --- Product Info --- */
  function updateProductInfo(item) {
    const panel = document.getElementById('product-info');
    if (!panel) return;
    panel.querySelector('.product-name').textContent = item.name;
    panel.querySelector('.product-dims').textContent = item.dimensions;
    panel.querySelector('.product-desc').textContent = item.description;
  }

  function toggleProductInfo() {
    const panel = document.getElementById('product-info');
    if (!panel) return;
    productInfoVisible = !productInfoVisible;
    panel.classList.toggle('visible', productInfoVisible);
  }

  /* --- Color Picker --- */
  function buildColorPicker(item) {
    const picker = document.getElementById('color-picker');
    if (!picker) return;
    picker.innerHTML = '';
    item.colors.forEach((c, i) => {
      const swatch = document.createElement('button');
      swatch.className = 'color-swatch' + (i === currentColorIndex ? ' selected' : '');
      swatch.style.background = c.base;
      swatch.title = c.name;
      swatch.setAttribute('aria-label', `Color: ${c.name}`);
      swatch.addEventListener('click', () => {
        currentColorIndex = i;
        document.querySelectorAll('.color-swatch').forEach((s, j) => {
          s.classList.toggle('selected', j === i);
        });
        window.updateFurnitureColor(item.id, i);
        showToast(`Color: ${c.name}`);
      });
      picker.appendChild(swatch);
    });
  }

  function toggleColorPicker() {
    const picker = document.getElementById('color-picker');
    if (!picker) return;
    colorPickerVisible = !colorPickerVisible;
    picker.classList.toggle('visible', colorPickerVisible);
  }

  /* --- Reset Scene --- */
  function resetScene() {
    if (window.resetTransform) window.resetTransform();
    showToast('🔄 Scene reset');
  }

  /* --- Download Marker --- */
  function downloadMarker() {
    const link = document.createElement('a');
    link.href = 'assets/markers/hiro-marker.png';
    link.download = 'hiro-marker.png';
    link.click();
    showToast('📥 Marker downloaded');
  }

  /* --- Initialize UI --- */
  function initUI() {
    // Build furniture cards
    buildFurnitureCards();

    // Start AR button
    const startBtn = document.getElementById('btn-start-ar');
    if (startBtn) startBtn.addEventListener('click', hideInstructions);

    // Download marker button
    const dlBtn = document.getElementById('btn-download-marker');
    if (dlBtn) dlBtn.addEventListener('click', downloadMarker);

    // Reset button
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) resetBtn.addEventListener('click', resetScene);

    // Rotate buttons
    const rotLeftBtn = document.getElementById('btn-rotate-left');
    const rotRightBtn = document.getElementById('btn-rotate-right');
    if (rotLeftBtn) rotLeftBtn.addEventListener('click', () => {
      if (window.rotateModel) window.rotateModel(-45);
      showToast('↺ Rotated -45°');
    });
    if (rotRightBtn) rotRightBtn.addEventListener('click', () => {
      if (window.rotateModel) window.rotateModel(45);
      showToast('↻ Rotated +45°');
    });

    // Info button
    const infoBtn = document.getElementById('btn-info');
    if (infoBtn) infoBtn.addEventListener('click', toggleProductInfo);

    // Color button
    const colorBtn = document.getElementById('btn-color');
    if (colorBtn) colorBtn.addEventListener('click', toggleColorPicker);

    // Help button
    const helpBtn = document.getElementById('btn-help');
    if (helpBtn) helpBtn.addEventListener('click', showInstructions);

    // Select default furniture
    selectFurniture(0);

    // Hide loading after short delay
    setTimeout(hideLoading, 1500);
  }

  // Export
  window.initUI = initUI;
  window.showToast = showToast;
  window.updateStatus = updateStatus;
  window.hideInstructions = hideInstructions;
  window.selectFurniture = selectFurniture;
})();
