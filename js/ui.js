/**
 * ui.js — UI Controller for AR E-Commerce Product Viewer
 * Manages overlays, product selector, product info, color picker, toasts.
 */
import { PRODUCT_CATALOG, createProductModel } from './furniture.js';
import { rotateModel, resetTransform, setInteractionTarget } from './interactions.js';

let currentProductIndex = 0;
let currentColorIndex = 0;
let productInfoVisible = false;
let colorPickerVisible = false;

// Callback set by app.js to handle model placement
let onProductChangeCb = null;
let onColorChangeCb = null;

export function setOnFurnitureChange(cb) { onProductChangeCb = cb; }
export function setOnColorChange(cb) { onColorChangeCb = cb; }

export function getCurrentFurnitureId() {
  return PRODUCT_CATALOG[currentProductIndex].id;
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

/* --- Product Selector --- */
function buildProductCards() {
  const grid = document.getElementById('furniture-grid');
  if (!grid) return;
  grid.innerHTML = '';
  PRODUCT_CATALOG.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'furniture-card' + (i === currentProductIndex ? ' selected' : '');
    card.innerHTML = `
      <span class="card-icon">${item.icon}</span>
      <div class="card-name">${item.name}</div>
      <div class="card-dims">${item.dimensions}</div>
      <div class="card-price">${item.price || ''}</div>`;
    card.addEventListener('click', () => selectProduct(i));
    grid.appendChild(card);
  });
}

function selectProduct(index) {
  currentProductIndex = index;
  currentColorIndex = 0;
  const item = PRODUCT_CATALOG[index];

  document.querySelectorAll('.furniture-card').forEach((c, i) => {
    c.classList.toggle('selected', i === index);
  });

  updateProductInfo(item);
  buildColorPicker(item);

  if (onProductChangeCb) onProductChangeCb(item.id, 0);
  showToast(`${item.icon} ${item.name} selected`);
}

/* --- Product Info --- */
function updateProductInfo(item) {
  const panel = document.getElementById('product-info');
  if (!panel) return;
  panel.querySelector('.product-name').textContent = item.name;
  panel.querySelector('.product-dims').textContent = item.dimensions;
  panel.querySelector('.product-desc').textContent = item.description;
  const priceEl = panel.querySelector('.product-price');
  if (priceEl) priceEl.textContent = item.price || '';
  const catEl = panel.querySelector('.product-category');
  if (catEl) catEl.textContent = item.category || '';
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
      if (onColorChangeCb) onColorChangeCb(PRODUCT_CATALOG[currentProductIndex].id, i);
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
  buildProductCards();

  // Select default
  const item = PRODUCT_CATALOG[0];
  updateProductInfo(item);
  buildColorPicker(item);

  // Buttons
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    resetTransform();
    showToast('🔄 Transform reset');
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
