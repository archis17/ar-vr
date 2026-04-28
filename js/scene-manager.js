/**
 * scene-manager.js — Multi-Object Scene Management
 * 
 * Manages multiple placed product objects with selection,
 * raycasting, and per-object transforms.
 */
import * as THREE from 'three';
import { appState } from './state.js';

const MAX_OBJECTS = 15;

export class SceneManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.objects = [];          // Array of { group, id, productId, colorIndex }
    this.selectedIndex = -1;
    this.raycaster = new THREE.Raycaster();
    this.highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xF59E0B,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false
    });
  }

  /**
   * Add a product group to the scene.
   * @param {THREE.Group} group - The product model group
   * @param {string} productId - e.g., 'sneakers'
   * @param {number} colorIndex
   * @returns {number} Index of the placed object, or -1 if limit reached
   */
  addObject(group, furnitureId, colorIndex) {
    if (this.objects.length >= MAX_OBJECTS) {
      return -1;
    }

    const id = `placed_${Date.now()}_${this.objects.length}`;
    group.userData = { ...group.userData, placedId: id, furnitureId, colorIndex };

    this.scene.add(group);
    this.objects.push({ group, id, furnitureId, colorIndex });

    const index = this.objects.length - 1;
    this.select(index);
    this._updateState();
    return index;
  }

  /**
   * Replace the currently selected object's model (e.g., color/furniture change).
   */
  replaceSelected(newGroup, furnitureId, colorIndex) {
    if (this.selectedIndex < 0 || this.selectedIndex >= this.objects.length) return false;

    const entry = this.objects[this.selectedIndex];
    const oldGroup = entry.group;

    // Preserve transform
    newGroup.position.copy(oldGroup.position);
    newGroup.rotation.copy(oldGroup.rotation);
    newGroup.scale.copy(oldGroup.scale);
    newGroup.userData = { ...newGroup.userData, placedId: entry.id, furnitureId, colorIndex };

    this.scene.remove(oldGroup);
    this._removeHighlight(oldGroup);
    this.scene.add(newGroup);

    entry.group = newGroup;
    entry.furnitureId = furnitureId;
    entry.colorIndex = colorIndex;

    this._addHighlight(newGroup);
    this._updateState();
    return true;
  }

  /**
   * Select an object by index.
   */
  select(index) {
    // Deselect previous
    if (this.selectedIndex >= 0 && this.selectedIndex < this.objects.length) {
      this._removeHighlight(this.objects[this.selectedIndex].group);
    }

    this.selectedIndex = index;
    appState.set('selectedObjectIndex', index);

    // Highlight new selection
    if (index >= 0 && index < this.objects.length) {
      this._addHighlight(this.objects[index].group);
    }
  }

  /**
   * Deselect all.
   */
  deselect() {
    this.select(-1);
  }

  /**
   * Get the currently selected THREE.Group.
   */
  getSelected() {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.objects.length) {
      return this.objects[this.selectedIndex].group;
    }
    return null;
  }

  /**
   * Delete the currently selected object.
   */
  deleteSelected() {
    if (this.selectedIndex < 0) return false;

    const entry = this.objects[this.selectedIndex];
    this._removeHighlight(entry.group);
    this.scene.remove(entry.group);
    this.objects.splice(this.selectedIndex, 1);

    // Select next available or deselect
    if (this.objects.length === 0) {
      this.selectedIndex = -1;
    } else {
      this.selectedIndex = Math.min(this.selectedIndex, this.objects.length - 1);
      this._addHighlight(this.objects[this.selectedIndex].group);
    }

    appState.set('selectedObjectIndex', this.selectedIndex);
    this._updateState();
    return true;
  }

  /**
   * Remove all placed objects.
   */
  clearAll() {
    for (const entry of this.objects) {
      this._removeHighlight(entry.group);
      this.scene.remove(entry.group);
    }
    this.objects = [];
    this.selectedIndex = -1;
    appState.set('selectedObjectIndex', -1);
    this._updateState();
  }

  /**
   * Try to select an object at the given screen coordinates via raycasting.
   * @param {number} x - Normalized device coordinate x (-1 to 1)
   * @param {number} y - Normalized device coordinate y (-1 to 1)
   * @returns {boolean} Whether an object was hit
   */
  raycastSelect(x, y) {
    if (this.objects.length === 0) return false;

    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

    const allMeshes = [];
    for (const entry of this.objects) {
      entry.group.traverse((child) => {
        if (child.isMesh && !child.userData._isHighlight) {
          allMeshes.push(child);
        }
      });
    }

    const intersects = this.raycaster.intersectObjects(allMeshes, false);
    if (intersects.length > 0) {
      // Find which placed object this mesh belongs to
      const hitMesh = intersects[0].object;
      for (let i = 0; i < this.objects.length; i++) {
        let found = false;
        this.objects[i].group.traverse((child) => {
          if (child === hitMesh) found = true;
        });
        if (found) {
          this.select(i);
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get count of placed objects.
   */
  get count() {
    return this.objects.length;
  }

  /**
   * Check if at max capacity.
   */
  get isFull() {
    return this.objects.length >= MAX_OBJECTS;
  }

  // --- Private helpers ---

  _addHighlight(group) {
    // Add a subtle bounding-box outline/glow to the selected object
    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const highlightGeo = new THREE.BoxGeometry(
      size.x + 0.02,
      size.y + 0.02,
      size.z + 0.02
    );
    const highlight = new THREE.Mesh(highlightGeo, this.highlightMaterial);
    highlight.position.copy(center);
    highlight.position.sub(group.position).negate();
    // Adjust to local space
    highlight.position.copy(center);
    group.worldToLocal(highlight.position);
    highlight.userData._isHighlight = true;
    highlight.raycast = () => {}; // Disable raycasting on highlight
    group.add(highlight);
  }

  _removeHighlight(group) {
    const toRemove = [];
    group.traverse((child) => {
      if (child.userData._isHighlight) toRemove.push(child);
    });
    for (const obj of toRemove) {
      obj.geometry?.dispose();
      obj.parent?.remove(obj);
    }
  }

  _updateState() {
    appState.set('placedObjects', [...this.objects]);
  }
}
