/**
 * interactions.js — Gesture Handling for AR Furniture
 * Pinch to scale, drag to move, two-finger twist to rotate
 */
(function () {
  'use strict';
  let isInteracting = false;
  let initialPinchDist = 0, initialScale = 1, currentScale = 1;
  let initialAngle = 0, currentRotY = 0, initialRotY = 0;
  let isDragging = false, lastTX = 0, lastTY = 0;
  const MIN_S = 0.3, MAX_S = 3.0;

  function getModel() { return document.getElementById('furniture-model'); }
  function dist(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
  function angle(a, b) { return Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 57.2958; }

  function onTS(e) {
    const m = getModel(); if (!m) return;
    if (e.touches.length === 2) {
      e.preventDefault(); isInteracting = true;
      initialPinchDist = dist(e.touches[0], e.touches[1]);
      initialAngle = angle(e.touches[0], e.touches[1]);
      const s = m.getAttribute('scale'); initialScale = s ? s.x : 1;
      const r = m.getAttribute('rotation'); initialRotY = r ? r.y : 0;
    } else if (e.touches.length === 1) {
      isDragging = true; lastTX = e.touches[0].clientX; lastTY = e.touches[0].clientY;
    }
  }

  function onTM(e) {
    const m = getModel(); if (!m) return;
    if (e.touches.length === 2 && isInteracting) {
      e.preventDefault();
      const d = dist(e.touches[0], e.touches[1]);
      currentScale = Math.max(MIN_S, Math.min(MAX_S, initialScale * (d / initialPinchDist)));
      m.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
      const a = angle(e.touches[0], e.touches[1]);
      currentRotY = initialRotY + (a - initialAngle);
      const r = m.getAttribute('rotation') || {x:0,y:0,z:0};
      m.setAttribute('rotation', `${r.x} ${currentRotY} ${r.z}`);
    } else if (e.touches.length === 1 && isDragging) {
      const dx = (e.touches[0].clientX - lastTX) * 0.002;
      const dz = (e.touches[0].clientY - lastTY) * 0.002;
      const p = m.getAttribute('position') || {x:0,y:0,z:0};
      m.setAttribute('position', {x: p.x+dx, y: p.y, z: p.z+dz});
      lastTX = e.touches[0].clientX; lastTY = e.touches[0].clientY;
    }
  }

  function onTE(e) {
    if (e.touches.length < 2) isInteracting = false;
    if (e.touches.length === 0) isDragging = false;
  }

  function rotateModel(deg) {
    const m = getModel(); if (!m) return;
    const r = m.getAttribute('rotation') || {x:0,y:0,z:0};
    currentRotY = r.y + deg;
    m.setAttribute('rotation', `${r.x} ${currentRotY} ${r.z}`);
  }

  function resetTransform() {
    const m = getModel(); if (!m) return;
    m.setAttribute('scale', '1 1 1');
    m.setAttribute('rotation', '0 0 0');
    m.setAttribute('position', '0 0 0');
    currentScale = 1; currentRotY = 0;
  }

  function initInteractions() {
    const el = document.querySelector('a-scene');
    const bind = (t) => {
      t.addEventListener('touchstart', onTS, {passive:false});
      t.addEventListener('touchmove', onTM, {passive:false});
      t.addEventListener('touchend', onTE, {passive:true});
    };
    if (el && el.canvas) { bind(el.canvas); }
    else if (el) { el.addEventListener('loaded', () => { if(el.canvas) bind(el.canvas); }); }
    bind(document.body);
  }

  window.initInteractions = initInteractions;
  window.rotateModel = rotateModel;
  window.resetTransform = resetTransform;
})();
