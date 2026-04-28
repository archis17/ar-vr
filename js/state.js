/**
 * state.js — Centralized Reactive State Management
 * 
 * Single source of truth for the entire application.
 * Components subscribe to state changes via addEventListener('change', ...).
 */

export class AppState extends EventTarget {
  #state = {
    // AR Session
    mode: 'placement',           // 'placement' | 'measurement' | 'selection'
    arSessionActive: false,
    surfaceDetected: false,

    // Furniture
    currentFurnitureId: 'sofa',
    currentColorIndex: 0,

    // Scene
    placedObjects: [],           // Array of THREE.Group references
    selectedObjectIndex: -1,     // Index into placedObjects, -1 = none

    // Measurements
    measurements: [],            // Array of { start, end, distance }
    measurementPending: null,    // Pending first point for measurement

    // Performance
    fps: 0,
    drawCalls: 0,
    triangles: 0,
    sessionStartTime: null,

    // UI
    debugPanelVisible: false,
    productInfoVisible: false,
    colorPickerVisible: false
  };

  get(key) {
    return this.#state[key];
  }

  set(key, value) {
    const oldValue = this.#state[key];
    if (oldValue === value) return;
    this.#state[key] = value;
    this.dispatchEvent(new CustomEvent('change', {
      detail: { key, value, oldValue }
    }));
  }

  /**
   * Batch-update multiple keys, firing one event per key.
   */
  update(updates) {
    for (const [key, value] of Object.entries(updates)) {
      this.set(key, value);
    }
  }

  /**
   * Subscribe to changes on a specific key.
   * Returns an unsubscribe function.
   */
  subscribe(key, callback) {
    const handler = (e) => {
      if (e.detail.key === key) {
        callback(e.detail.value, e.detail.oldValue);
      }
    };
    this.addEventListener('change', handler);
    return () => this.removeEventListener('change', handler);
  }

  /**
   * Get all state (read-only snapshot).
   */
  snapshot() {
    return { ...this.#state };
  }
}

// Global singleton
export const appState = new AppState();
