/**
 * measurement.js — AR Measurement Tool
 * 
 * Point-to-point distance measurement on detected surfaces.
 * Uses WebXR Hit Test results to place measurement anchors.
 */
import * as THREE from 'three';
import { appState } from './state.js';
import { formatDistance } from './utils.js';

const MAX_MEASUREMENTS = 5;

export class MeasurementTool {
  constructor(scene) {
    this.scene = scene;
    this.measurements = [];      // { startPoint, endPoint, line, label, distance }
    this.pendingPoint = null;    // First tap point waiting for second
    this.pendingMarker = null;   // Visual marker for first point
    this.unit = 'cm';            // 'cm' or 'in'

    // Materials
    this.lineMaterial = new THREE.LineBasicMaterial({
      color: 0x22C55E,
      linewidth: 2,
      transparent: true,
      opacity: 0.9
    });
    this.pointMaterial = new THREE.MeshBasicMaterial({
      color: 0x22C55E,
      transparent: true,
      opacity: 0.8
    });
    this.pointGeometry = new THREE.SphereGeometry(0.015, 12, 12);
  }

  /**
   * Toggle measurement unit between cm and inches.
   */
  toggleUnit() {
    this.unit = this.unit === 'cm' ? 'in' : 'cm';
    // Update all existing labels
    for (const m of this.measurements) {
      this._updateLabel(m);
    }
    return this.unit;
  }

  /**
   * Record a measurement point. First call sets start, second sets end.
   * @param {THREE.Vector3} worldPosition - The hit test position
   * @returns {{ complete: boolean, distance?: number, formatted?: string }}
   */
  addPoint(worldPosition) {
    if (this.pendingPoint === null) {
      // First point
      this.pendingPoint = worldPosition.clone();

      // Visual marker
      this.pendingMarker = this._createPointMarker(this.pendingPoint);
      this.scene.add(this.pendingMarker);

      appState.set('measurementPending', this.pendingPoint);
      return { complete: false };
    } else {
      // Second point — complete measurement
      const startPoint = this.pendingPoint;
      const endPoint = worldPosition.clone();
      const distance = startPoint.distanceTo(endPoint);

      // Remove pending marker
      if (this.pendingMarker) {
        this.scene.remove(this.pendingMarker);
        this.pendingMarker = null;
      }
      this.pendingPoint = null;
      appState.set('measurementPending', null);

      // Enforce max measurements
      if (this.measurements.length >= MAX_MEASUREMENTS) {
        this._removeMeasurement(0);
      }

      // Create measurement visuals
      const measurement = this._createMeasurement(startPoint, endPoint, distance);
      this.measurements.push(measurement);
      appState.set('measurements', [...this.measurements]);

      return {
        complete: true,
        distance,
        formatted: formatDistance(distance, this.unit)
      };
    }
  }

  /**
   * Cancel a pending first point.
   */
  cancelPending() {
    if (this.pendingMarker) {
      this.scene.remove(this.pendingMarker);
      this.pendingMarker = null;
    }
    this.pendingPoint = null;
    appState.set('measurementPending', null);
  }

  /**
   * Remove the last measurement.
   */
  undoLast() {
    if (this.measurements.length === 0) return false;
    this._removeMeasurement(this.measurements.length - 1);
    appState.set('measurements', [...this.measurements]);
    return true;
  }

  /**
   * Clear all measurements.
   */
  clearAll() {
    this.cancelPending();
    while (this.measurements.length > 0) {
      this._removeMeasurement(0);
    }
    appState.set('measurements', []);
  }

  /**
   * Get the count of active measurements.
   */
  get count() {
    return this.measurements.length;
  }

  // --- Private ---

  _createPointMarker(position) {
    const marker = new THREE.Mesh(this.pointGeometry, this.pointMaterial);
    marker.position.copy(position);
    marker.userData._isMeasurement = true;
    return marker;
  }

  _createMeasurement(startPoint, endPoint, distance) {
    const group = new THREE.Group();
    group.userData._isMeasurement = true;

    // Start and end markers
    const startMarker = this._createPointMarker(startPoint);
    const endMarker = this._createPointMarker(endPoint);
    group.add(startMarker);
    group.add(endMarker);

    // Line between points
    const lineGeo = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
    const line = new THREE.Line(lineGeo, this.lineMaterial);
    group.add(line);

    // Dashed extension lines (vertical ticks at each end)
    const tickHeight = 0.03;
    for (const pt of [startPoint, endPoint]) {
      const tickGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pt.x, pt.y, pt.z),
        new THREE.Vector3(pt.x, pt.y + tickHeight, pt.z)
      ]);
      const tick = new THREE.Line(tickGeo, this.lineMaterial);
      group.add(tick);
    }

    // Label (sprite-based text)
    const midPoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
    midPoint.y += 0.04; // Float above the line
    const label = this._createTextSprite(formatDistance(distance, this.unit));
    label.position.copy(midPoint);
    group.add(label);

    this.scene.add(group);

    return { startPoint, endPoint, distance, group, label };
  }

  _createTextSprite(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Background pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 48, 12);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 48, 12);
    ctx.stroke();

    // Text
    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.15, 0.0375, 1);
    sprite.userData._isLabel = true;

    return sprite;
  }

  _updateLabel(measurement) {
    const text = formatDistance(measurement.distance, this.unit);
    // Find and replace the label sprite
    measurement.group.traverse((child) => {
      if (child.isSprite && child.userData._isLabel) {
        // Recreate texture
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.roundRect(8, 8, 240, 48, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(8, 8, 240, 48, 12);
        ctx.stroke();
        ctx.fillStyle = '#22C55E';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 32);
        child.material.map = new THREE.CanvasTexture(canvas);
        child.material.map.minFilter = THREE.LinearFilter;
        child.material.needsUpdate = true;
      }
    });
  }

  _removeMeasurement(index) {
    const m = this.measurements[index];
    if (m) {
      this.scene.remove(m.group);
      // Dispose geometries
      m.group.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });
      this.measurements.splice(index, 1);
    }
  }
}
