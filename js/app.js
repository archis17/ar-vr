/**
 * app.js — Main Application Orchestrator
 *
 * Coordinates WebXR AR session, scene management, measurement tool,
 * screenshot system, and performance monitoring.
 *
 * Flow:
 *  1. User taps "Start AR" → enters immersive-ar session
 *  2. Camera scans surfaces → reticle appears on detected planes
 *  3. User taps screen → product placed at reticle location (multi-object)
 *  4. Gestures to scale/move/rotate selected object
 *  5. Measurement mode: tap two surface points → distance displayed
 */
import * as THREE from 'three';
import { appState } from './state.js';
import { createProductModel, PRODUCT_CATALOG } from './furniture.js';
import { SceneManager } from './scene-manager.js';
import { MeasurementTool } from './measurement.js';
import { PerformanceMonitor } from './performance.js';
import { downloadScreenshot, shareScreenshot } from './screenshot.js';
import { initInteractions, setInteractionTarget, resetTransform } from './interactions.js';
import {
  initUI, hideInstructions, showInstructions,
  updateStatus, showToast,
  setOnFurnitureChange, setOnColorChange,
  getCurrentFurnitureId, getCurrentColorIndex
} from './ui.js';

// --- Core globals ---
let camera, scene, renderer;
let reticle, reticleVisible = false;
let hitTestSource = null, hitTestSourceRequested = false;
let arSession = null;

// --- Managers ---
let sceneManager = null;
let measurementTool = null;
let perfMonitor = null;

function init() {
  // --- Three.js Scene ---
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

  // --- Enhanced Lighting ---
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
  hemiLight.position.set(0.5, 1, 0.25);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(1, 3, 2);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(1024, 1024);
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 10;
  dirLight.shadow.camera.left = -3;
  dirLight.shadow.camera.right = 3;
  dirLight.shadow.camera.top = 3;
  dirLight.shadow.camera.bottom = -3;
  scene.add(dirLight);

  // Fill light for softer shadows
  const fillLight = new THREE.DirectionalLight(0xfff0e6, 0.6);
  fillLight.position.set(-2, 2, -1);
  scene.add(fillLight);

  // --- Renderer ---
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
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

  // Center dot
  const dotGeo = new THREE.CircleGeometry(0.015, 16).rotateX(-Math.PI / 2);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B, transparent: true, opacity: 0.6 });
  reticle.add(new THREE.Mesh(dotGeo, dotMat));

  // --- Initialize Managers ---
  sceneManager = new SceneManager(scene, camera);
  measurementTool = new MeasurementTool(scene);
  perfMonitor = new PerformanceMonitor(renderer);
  perfMonitor.createPanel();

  // --- AR Button setup ---
  const startBtn = document.getElementById('btn-start-ar');
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
  setOnFurnitureChange((productId, colorIndex) => {
    if (sceneManager.getSelected()) {
      const newModel = createProductModel(productId, colorIndex);
      if (newModel) {
        sceneManager.replaceSelected(newModel, productId, colorIndex);
        setInteractionTarget(sceneManager.getSelected());
      }
    }
  });

  setOnColorChange((productId, colorIndex) => {
    if (sceneManager.getSelected()) {
      const newModel = createProductModel(productId, colorIndex);
      if (newModel) {
        sceneManager.replaceSelected(newModel, productId, colorIndex);
        setInteractionTarget(sceneManager.getSelected());
      }
    }
  });

  // --- Initialize UI ---
  initUI();

  // --- Wire up new buttons ---
  _setupNewControls();

  // --- State subscriptions ---
  appState.subscribe('mode', (mode) => {
    _updateReticleForMode(mode);
  });

  // --- Window resize ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- Start render loop ---
  renderer.setAnimationLoop(animate);
}

/* === Setup New Controls === */
function _setupNewControls() {
  // Delete selected object
  document.getElementById('btn-delete')?.addEventListener('click', () => {
    if (sceneManager.deleteSelected()) {
      setInteractionTarget(sceneManager.getSelected());
      showToast('🗑️ Object removed');
      _updateObjectCount();
    } else {
      showToast('No object selected');
    }
  });

  // Clear all objects
  document.getElementById('btn-clear-all')?.addEventListener('click', () => {
    const count = sceneManager.count;
    if (count > 0) {
      sceneManager.clearAll();
      measurementTool.clearAll();
      setInteractionTarget(null);
      showToast(`🧹 Cleared ${count} objects`);
      _updateObjectCount();
    } else {
      showToast('Scene is empty');
    }
  });

  // Measurement mode toggle
  document.getElementById('btn-measure')?.addEventListener('click', () => {
    const current = appState.get('mode');
    if (current === 'measurement') {
      appState.set('mode', 'placement');
      measurementTool.cancelPending();
      document.getElementById('btn-measure')?.classList.remove('active');
      showToast('📦 Placement mode');
      _updateReticleForMode('placement');
    } else {
      appState.set('mode', 'measurement');
      document.getElementById('btn-measure')?.classList.add('active');
      showToast('📏 Measurement mode — tap two points');
      _updateReticleForMode('measurement');
    }
  });

  // Measurement undo
  document.getElementById('btn-measure-undo')?.addEventListener('click', () => {
    if (measurementTool.undoLast()) {
      showToast('↩️ Measurement removed');
    }
  });

  // Measurement unit toggle
  document.getElementById('btn-measure-unit')?.addEventListener('click', () => {
    const unit = measurementTool.toggleUnit();
    showToast(`📐 Units: ${unit === 'cm' ? 'Centimeters' : 'Inches'}`);
  });

  // Screenshot
  document.getElementById('btn-screenshot')?.addEventListener('click', async () => {
    showToast('📸 Capturing...');
    const success = await shareScreenshot(renderer, scene, camera);
    if (success) {
      showToast('✅ Screenshot saved!');
    }
  });

  // Performance toggle
  document.getElementById('btn-perf')?.addEventListener('click', () => {
    perfMonitor.toggle();
  });
}

function _updateReticleForMode(mode) {
  if (mode === 'measurement') {
    reticle.material.color.setHex(0x22C55E);
    reticle.children.forEach(c => {
      if (c.material) c.material.color.setHex(0x22C55E);
    });
  } else {
    reticle.material.color.setHex(0xF59E0B);
    reticle.children.forEach(c => {
      if (c.material) c.material.color.setHex(0xF59E0B);
    });
  }
}

function _updateObjectCount() {
  const badge = document.getElementById('object-count');
  if (badge) {
    const count = sceneManager.count;
    badge.textContent = count > 0 ? `${count} object${count !== 1 ? 's' : ''}` : '';
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
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
    appState.set('arSessionActive', true);

    renderer.xr.setReferenceSpaceType('local');
    await renderer.xr.setSession(session);

    perfMonitor.startSession();

    updateStatus('Scanning for surfaces...', false);
    document.getElementById('marker-guide')?.classList.remove('hidden');

    // Controller (tap) event
    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    session.addEventListener('end', () => {
      arSession = null;
      appState.update({
        arSessionActive: false,
        surfaceDetected: false
      });
      hitTestSourceRequested = false;
      hitTestSource = null;
      updateStatus('AR session ended', false);
      showInstructions();
    });

    showToast('🎯 Scan a flat surface, then tap to place product');

  } catch (err) {
    console.error('Failed to start AR:', err);
    showToast('❌ Could not start AR: ' + err.message);
    showInstructions();
  }
}

/* === Tap Handler (routes to placement or measurement) === */
function onSelect() {
  if (!reticle.visible) return;

  // Get the world position from the reticle
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  reticle.matrix.decompose(position, quaternion, scale);

  const mode = appState.get('mode');

  if (mode === 'measurement') {
    // --- Measurement Mode ---
    const result = measurementTool.addPoint(position);
    if (result.complete) {
      showToast(`📏 Distance: ${result.formatted}`);
      updateStatus(`Last measurement: ${result.formatted}`, true);
    } else {
      showToast('📍 First point set — tap second point');
      updateStatus('Tap the second point to measure', false);
    }
  } else {
    // --- Placement Mode ---
    if (sceneManager.isFull) {
      showToast('⚠️ Maximum products reached. Delete some first.');
      return;
    }

    const productId = getCurrentFurnitureId();
    const colorIndex = getCurrentColorIndex();
    const model = createProductModel(productId, colorIndex);

    if (model) {
      model.position.copy(position);
      model.quaternion.copy(quaternion);
      model.scale.set(1, 1, 1);

      const index = sceneManager.addObject(model, productId, colorIndex);
      if (index >= 0) {
        setInteractionTarget(sceneManager.getSelected());
        _updateObjectCount();

        const count = sceneManager.count;
        updateStatus(`${count} product${count !== 1 ? 's' : ''} placed`, true);
        showToast(`✅ ${PRODUCT_CATALOG.find(p => p.id === productId)?.name} placed! (${count})`);
      }
    }
  }
}

/* === Animation Loop === */
function animate(timestamp, frame) {
  // Performance monitoring
  perfMonitor.update();

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
          appState.set('surfaceDetected', true);
          const mode = appState.get('mode');
          if (mode === 'measurement') {
            updateStatus('Surface found! Tap to set measurement point.', true);
          } else {
            updateStatus('Surface found! Tap to place product.', true);
          }
          document.getElementById('marker-guide')?.classList.add('hidden');
        }
      } else {
        reticle.visible = false;
        if (reticleVisible) {
          reticleVisible = false;
          appState.set('surfaceDetected', false);
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
