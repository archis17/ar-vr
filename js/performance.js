/**
 * performance.js — Real-time Performance Monitoring
 * 
 * Tracks FPS, draw calls, triangle count, and session duration.
 * Updates the debug panel UI when visible.
 */
import { appState } from './state.js';

export class PerformanceMonitor {
  constructor(renderer) {
    this.renderer = renderer;
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.sessionStart = null;
    this.panel = null;
    this._visible = false;
  }

  /**
   * Create the debug panel DOM element.
   */
  createPanel() {
    this.panel = document.createElement('div');
    this.panel.id = 'debug-panel';
    this.panel.className = 'debug-panel';
    this.panel.innerHTML = `
      <div class="debug-header">
        <span>⚡ Performance</span>
        <button id="btn-close-debug" class="debug-close" aria-label="Close debug panel">✕</button>
      </div>
      <div class="debug-grid">
        <div class="debug-stat">
          <span class="debug-label">FPS</span>
          <span class="debug-value" id="debug-fps">--</span>
        </div>
        <div class="debug-stat">
          <span class="debug-label">Draw Calls</span>
          <span class="debug-value" id="debug-draws">--</span>
        </div>
        <div class="debug-stat">
          <span class="debug-label">Triangles</span>
          <span class="debug-value" id="debug-tris">--</span>
        </div>
        <div class="debug-stat">
          <span class="debug-label">Textures</span>
          <span class="debug-value" id="debug-textures">--</span>
        </div>
        <div class="debug-stat">
          <span class="debug-label">Objects</span>
          <span class="debug-value" id="debug-objects">--</span>
        </div>
        <div class="debug-stat">
          <span class="debug-label">Session</span>
          <span class="debug-value" id="debug-session">--</span>
        </div>
      </div>
      <div class="debug-device">
        <span class="debug-label">GPU</span>
        <span class="debug-value" id="debug-gpu" style="font-size:10px;">--</span>
      </div>
    `;
    document.body.appendChild(this.panel);

    // Close button
    document.getElementById('btn-close-debug')?.addEventListener('click', () => {
      this.toggle();
    });

    // Detect GPU
    this._detectGPU();
  }

  /**
   * Toggle debug panel visibility.
   */
  toggle() {
    this._visible = !this._visible;
    if (this.panel) {
      this.panel.classList.toggle('visible', this._visible);
    }
    appState.set('debugPanelVisible', this._visible);
  }

  /**
   * Start session timer.
   */
  startSession() {
    this.sessionStart = performance.now();
    appState.set('sessionStartTime', this.sessionStart);
  }

  /**
   * Called once per frame in the render loop.
   */
  update() {
    this.frameCount++;
    const now = performance.now();

    if (now - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;

      if (this._visible && this.panel) {
        this._updatePanel(now);
      }
    }
  }

  // --- Private ---

  _updatePanel(now) {
    const info = this.renderer.info;

    const fpsEl = document.getElementById('debug-fps');
    const drawsEl = document.getElementById('debug-draws');
    const trisEl = document.getElementById('debug-tris');
    const texturesEl = document.getElementById('debug-textures');
    const objectsEl = document.getElementById('debug-objects');
    const sessionEl = document.getElementById('debug-session');

    if (fpsEl) {
      fpsEl.textContent = this.fps;
      fpsEl.style.color = this.fps >= 50 ? '#22C55E' : this.fps >= 30 ? '#F59E0B' : '#EF4444';
    }
    if (drawsEl) drawsEl.textContent = info.render.calls || 0;
    if (trisEl) trisEl.textContent = this._formatNumber(info.render.triangles || 0);
    if (texturesEl) texturesEl.textContent = info.memory?.textures || 0;

    const placed = appState.get('placedObjects');
    if (objectsEl) objectsEl.textContent = placed ? placed.length : 0;

    if (sessionEl && this.sessionStart) {
      const elapsed = (now - this.sessionStart) / 1000;
      const mins = Math.floor(elapsed / 60);
      const secs = Math.floor(elapsed % 60);
      sessionEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  }

  _formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }

  _detectGPU() {
    const gpuEl = document.getElementById('debug-gpu');
    if (!gpuEl) return;

    const gl = this.renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      gpuEl.textContent = gpu || 'Unknown';
    } else {
      gpuEl.textContent = 'Info unavailable';
    }
  }
}
