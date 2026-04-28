/**
 * interactions.js — Touch Gesture Handling for placed 3D objects
 * Pinch to scale, drag to move, two-finger twist to rotate.
 * Works on the Three.js renderer canvas.
 */

let currentModel = null;
let isInteracting = false;
let initialPinchDist = 0, initialScale = 1, currentScale = 1;
let initialAngle = 0, currentRotY = 0, initialRotY = 0;
let isDragging = false, lastTX = 0, lastTY = 0;
const MIN_S = 0.3, MAX_S = 3.0;

function dist(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
function angle(a, b) { return Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 57.2958; }

function onTS(e) {
  if (!currentModel) return;
  if (e.touches.length === 2) {
    e.preventDefault();
    isInteracting = true;
    initialPinchDist = dist(e.touches[0], e.touches[1]);
    initialAngle = angle(e.touches[0], e.touches[1]);
    initialScale = currentModel.scale.x;
    initialRotY = currentModel.rotation.y;
  } else if (e.touches.length === 1) {
    isDragging = true;
    lastTX = e.touches[0].clientX;
    lastTY = e.touches[0].clientY;
  }
}

function onTM(e) {
  if (!currentModel) return;
  if (e.touches.length === 2 && isInteracting) {
    e.preventDefault();
    // Pinch to scale
    const d = dist(e.touches[0], e.touches[1]);
    currentScale = Math.max(MIN_S, Math.min(MAX_S, initialScale * (d / initialPinchDist)));
    currentModel.scale.set(currentScale, currentScale, currentScale);
    // Two-finger rotate
    const a = angle(e.touches[0], e.touches[1]);
    currentRotY = initialRotY + (a - initialAngle) * (Math.PI / 180);
    currentModel.rotation.y = currentRotY;
  } else if (e.touches.length === 1 && isDragging) {
    // Drag to move
    const dx = (e.touches[0].clientX - lastTX) * 0.002;
    const dz = (e.touches[0].clientY - lastTY) * 0.002;
    currentModel.position.x += dx;
    currentModel.position.z += dz;
    lastTX = e.touches[0].clientX;
    lastTY = e.touches[0].clientY;
  }
}

function onTE(e) {
  if (e.touches.length < 2) isInteracting = false;
  if (e.touches.length === 0) isDragging = false;
}

export function setInteractionTarget(model) {
  currentModel = model;
  if (model) {
    currentScale = model.scale.x;
    currentRotY = model.rotation.y;
  }
}

export function rotateModel(degrees) {
  if (!currentModel) return;
  currentModel.rotation.y += degrees * (Math.PI / 180);
  currentRotY = currentModel.rotation.y;
}

export function resetTransform(model) {
  const target = model || currentModel;
  if (!target) return;
  target.scale.set(1, 1, 1);
  target.rotation.set(0, 0, 0);
  currentScale = 1;
  currentRotY = 0;
}

export function initInteractions(canvas) {
  canvas.addEventListener('touchstart', onTS, { passive: false });
  canvas.addEventListener('touchmove', onTM, { passive: false });
  canvas.addEventListener('touchend', onTE, { passive: true });
}
