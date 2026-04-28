/**
 * utils.js — Shared Utility Functions
 */

/**
 * Clamp a value between min and max.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Convert degrees to radians.
 */
export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees.
 */
export function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Distance between two touch points.
 */
export function touchDistance(a, b) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

/**
 * Angle between two touch points (in degrees).
 */
export function touchAngle(a, b) {
  return Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * (180 / Math.PI);
}

/**
 * Format a distance in meters to a human-readable string.
 * @param {number} meters - Distance in meters
 * @param {'cm'|'in'} unit - Display unit
 * @returns {string}
 */
export function formatDistance(meters, unit = 'cm') {
  if (unit === 'in') {
    return `${(meters * 39.3701).toFixed(1)} in`;
  }
  return `${(meters * 100).toFixed(1)} cm`;
}

/**
 * Throttle a function to run at most once per `delay` ms.
 */
export function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

/**
 * Generate a simple unique ID.
 */
let _idCounter = 0;
export function uniqueId(prefix = 'obj') {
  return `${prefix}_${++_idCounter}_${Date.now().toString(36)}`;
}
