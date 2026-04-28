/**
 * app.js — Main Application: Three.js + WebXR Hit Test (Markerless AR)
 *
 * Flow:
 *  1. User taps "Start AR" → enters immersive-ar session
 *  2. Camera scans surfaces → reticle appears on detected planes
 *  3. User taps screen → furniture placed at reticle location
 *  4. Gestures to scale/move/rotate
 */
import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { createFurnitureModel, FURNITURE_CATALOG } from './furniture.js';
import { initInteractions, setInteractionTarget, resetTransform } from './interactions.js';
import {
  initUI, hideInstructions, showInstructions,
  updateStatus, showToast,
  setOnFurnitureChange, setOnColorChange,
  getCurrentFurnitureId, getCurrentColorIndex
} from './ui.js';

// --- Scene globals ---
let camera, scene, renderer;
let reticle, reticleVisible = false;
let hitTestSource = null, hitTestSourceRequested = false;
let placedModel = null;
let arSession = null;

function init() {
  // --- Three.js Scene ---
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

  // --- Lighting ---
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
  hemiLight.position.set(0.5, 1, 0.25);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(1, 3, 2);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(512, 512);
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 10;
  scene.add(dirLight);

  // --- Renderer ---
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // Place canvas behind UI
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.inset = '0';
  renderer.domElement.style.zIndex = '0';

  // --- Reticle (targeting ring) ---
  const ringGeo = new THREE.RingGeometry(0.08, 0.11, 32).rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xF59E0B,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  });
  reticle = new THREE.Mesh(ringGeo, ringMat);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  // Add a small dot in the center of the reticle
  const dotGeo = new THREE.CircleGeometry(0.015, 16).rotateX(-Math.PI / 2);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B, transparent: true, opacity: 0.6 });
  const dot = new THREE.Mesh(dotGeo, dotMat);
  reticle.add(dot);

  // --- AR Button setup ---
  const startBtn = document.getElementById('btn-start-ar');

  // Check WebXR support
  if (navigator.xr) {
    navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
      if (supported) {
        startBtn.addEventListener('click', startAR);
      } else {
        document.getElementById('ar-not-supported').style.display = 'block';
        startBtn.style.display = 'none';
      }
    }).catch(() => {
      document.getElementById('ar-not-supported').style.display = 'block';
      startBtn.style.display = 'none';
    });
  } else {
    document.getElementById('ar-not-supported').style.display = 'block';
    startBtn.style.display = 'none';
  }

  // --- UI Callbacks ---
  setOnFurnitureChange((furnitureId, colorIndex) => {
    if (placedModel) {
      const pos = placedModel.position.clone();
      const rot = placedModel.rotation.clone();
      const scl = placedModel.scale.clone();
      scene.remove(placedModel);
      placedModel = createFurnitureModel(furnitureId, colorIndex);
      if (placedModel) {
        placedModel.position.copy(pos);
        placedModel.rotation.copy(rot);
        placedModel.scale.copy(scl);
        scene.add(placedModel);
        setInteractionTarget(placedModel);
      }
    }
  });

  setOnColorChange((furnitureId, colorIndex) => {
    if (placedModel) {
      const pos = placedModel.position.clone();
      const rot = placedModel.rotation.clone();
      const scl = placedModel.scale.clone();
      scene.remove(placedModel);
      placedModel = createFurnitureModel(furnitureId, colorIndex);
      if (placedModel) {
        placedModel.position.copy(pos);
        placedModel.rotation.copy(rot);
        placedModel.scale.copy(scl);
        scene.add(placedModel);
        setInteractionTarget(placedModel);
      }
    }
  });

  // --- Initialize UI ---
  initUI();

  // --- Window resize ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- Start render loop ---
  renderer.setAnimationLoop(animate);
}

/* === Start AR Session === */
async function startAR() {
  try {
    hideInstructions();

    const sessionInit = {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: document.body }
    };

    const session = await navigator.xr.requestSession('immersive-ar', sessionInit);
    arSession = session;

    renderer.xr.setReferenceSpaceType('local');
    await renderer.xr.setSession(session);

    updateStatus('Scanning for surfaces...', false);
    document.getElementById('marker-guide')?.classList.remove('hidden');

    // Controller (tap) event
    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    session.addEventListener('end', () => {
      arSession = null;
      hitTestSourceRequested = false;
      hitTestSource = null;
      updateStatus('AR session ended', false);
      showInstructions();
    });

    showToast('🎯 Scan a flat surface, then tap to place');

  } catch (err) {
    console.error('Failed to start AR:', err);
    showToast('❌ Could not start AR: ' + err.message);
    showInstructions();
  }
}

/* === Tap to Place === */
function onSelect() {
  if (reticle.visible) {
    // Remove old model if exists
    if (placedModel) {
      scene.remove(placedModel);
    }

    // Create furniture at reticle position
    const furnitureId = getCurrentFurnitureId();
    const colorIndex = getCurrentColorIndex();
    placedModel = createFurnitureModel(furnitureId, colorIndex);

    if (placedModel) {
      // Decompose reticle matrix to get position and rotation
      reticle.matrix.decompose(placedModel.position, placedModel.quaternion, placedModel.scale);
      placedModel.scale.set(1, 1, 1); // Reset scale
      scene.add(placedModel);
      setInteractionTarget(placedModel);

      updateStatus('Furniture placed! Tap again to reposition.', true);
      showToast('✅ Furniture placed! Pinch/drag/twist to adjust.');
    }
  }
}

/* === Animation Loop === */
function animate(timestamp, frame) {
  if (frame && arSession) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();

    // Request hit test source (once)
    if (!hitTestSourceRequested) {
      session.requestReferenceSpace('viewer').then((viewerSpace) => {
        session.requestHitTestSource({ space: viewerSpace }).then((source) => {
          hitTestSource = source;
        });
      });

      session.addEventListener('end', () => {
        hitTestSourceRequested = false;
        hitTestSource = null;
      });

      hitTestSourceRequested = true;
    }

    // Process hit test results
    if (hitTestSource) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        reticle.visible = true;
        reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);

        if (!reticleVisible) {
          reticleVisible = true;
          updateStatus('Surface found! Tap to place furniture.', false);
          document.getElementById('marker-guide')?.classList.add('hidden');
        }
      } else {
        reticle.visible = false;
        if (reticleVisible) {
          reticleVisible = false;
          updateStatus('Scanning for surfaces...', false);
        }
      }
    }
  }

  renderer.render(scene, camera);
}

// --- Init Touch Interactions on the renderer canvas ---
function initTouchAfterCanvas() {
  if (renderer && renderer.domElement) {
    initInteractions(renderer.domElement);
  }
}

// --- Boot ---
init();
initTouchAfterCanvas();
