/**
 * ui.js — UI Controller for AR Furniture Visualizer
 * Manages overlays, furniture selector, product info, color picker, toasts.
 */
import { FURNITURE_CATALOG, createFurnitureModel } from './furniture.js';
import { rotateModel, resetTransform, setInteractionTarget } from './interactions.js';

let currentFurnitureIndex = 0;
let currentColorIndex = 0;
let productInfoVisible = false;
let colorPickerVisible = false;

// Callback set by app.js to handle model placement
let onFurnitureChangeCb = null;
let onColorChangeCb = null;

export function setOnFurnitureChange(cb) { onFurnitureChangeCb = cb; }
export function setOnColorChange(cb) { onColorChangeCb = cb; }

export function getCurrentFurnitureId() {
  return FURNITURE_CATALOG[currentFurnitureIndex].id;
}
export function getCurrentColorIndex() {
  return currentColorIndex;
}

/* --- Toast --- */
export function showToast(msg, duration) {
  duration = duration || 2500;
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast'; t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

/* --- Loading Screen --- */
export function hideLoading() {
  const ls = document.getElementById('loading-screen');
  if (ls) ls.classList.add('hidden');
}

/* --- Instruction Overlay --- */
export function showInstructions() {
  const ov = document.getElementById('instruction-overlay');
  if (ov) ov.classList.remove('hidden');
}
export function hideInstructions() {
  const ov = document.getElementById('instruction-overlay');
  if (ov) ov.classList.add('hidden');
}

/* --- Status Badge --- */
export function updateStatus(text, detected) {
  const badge = document.getElementById('status-badge');
  const guide = document.getElementById('marker-guide');
  if (badge) {
    badge.querySelector('.status-text').textContent = text;
    badge.classList.toggle('detected', !!detected);
  }
  if (guide) guide.classList.toggle('hidden', !!detected);
}

/* --- Furniture Selector --- */
function buildFurnitureCards() {
  const grid = document.getElementById('furniture-grid');
  if (!grid) return;
  grid.innerHTML = '';
  FURNITURE_CATALOG.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'furniture-card' + (i === currentFurnitureIndex ? ' selected' : '');
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
  const item = FURNITURE_CATALOG[index];

  document.querySelectorAll('.furniture-card').forEach((c, i) => {
    c.classList.toggle('selected', i === index);
  });

  updateProductInfo(item);
  buildColorPicker(item);

  if (onFurnitureChangeCb) onFurnitureChangeCb(item.id, 0);
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
      if (onColorChangeCb) onColorChangeCb(FURNITURE_CATALOG[currentFurnitureIndex].id, i);
      showToast(`Color: ${c.name}`);
    });
    picker.appendChild(swatch);
  });
}

function toggleColorPicker() {
  colorPickerVisible = !colorPickerVisible;
  const picker = document.getElementById('color-picker');
  if (picker) picker.classList.toggle('visible', colorPickerVisible);
}

/* --- Init UI --- */
export function initUI() {
  buildFurnitureCards();

  // Select default
  const item = FURNITURE_CATALOG[0];
  updateProductInfo(item);
  buildColorPicker(item);

  // Buttons
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    resetTransform();
    showToast('🔄 Scene reset');
  });
  document.getElementById('btn-rotate-left')?.addEventListener('click', () => {
    rotateModel(-45);
    showToast('↺ Rotated -45°');
  });
  document.getElementById('btn-rotate-right')?.addEventListener('click', () => {
    rotateModel(45);
    showToast('↻ Rotated +45°');
  });
  document.getElementById('btn-info')?.addEventListener('click', toggleProductInfo);
  document.getElementById('btn-color')?.addEventListener('click', toggleColorPicker);
  document.getElementById('btn-help')?.addEventListener('click', showInstructions);

  setTimeout(hideLoading, 800);
}
