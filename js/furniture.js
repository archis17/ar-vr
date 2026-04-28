/**
 * furniture.js — Three.js Product Model Definitions
 * 
 * Builds procedural 3D e-commerce product models using Three.js geometry groups.
 * Enhanced with better materials and detailed models.
 */
import * as THREE from 'three';

export const PRODUCT_CATALOG = [
  {
    id: 'sneakers', name: 'Running Sneakers', icon: '👟',
    dimensions: '30 × 12 × 14 cm',
    description: 'Lightweight performance running shoes with breathable mesh upper and responsive cushioning.',
    price: '$149',
    category: 'Footwear',
    colors: [
      { name: 'Midnight Black', base: '#1A1A1A', accent: '#F59E0B' },
      { name: 'Cloud White',    base: '#F5F0EB', accent: '#3B82F6' },
      { name: 'Sport Red',      base: '#DC2626', accent: '#FFFFFF' },
      { name: 'Forest Green',   base: '#166534', accent: '#D4D4D4' }
    ],
    defaultColor: 0
  },
  {
    id: 'headphones', name: 'Wireless Headphones', icon: '🎧',
    dimensions: '18 × 17 × 8 cm',
    description: 'Premium over-ear wireless headphones with active noise cancellation and 30-hour battery.',
    price: '$299',
    category: 'Electronics',
    colors: [
      { name: 'Matte Black',    base: '#2A2A2A', accent: '#444444' },
      { name: 'Silver',         base: '#A0A0A0', accent: '#D4D4D4' },
      { name: 'Navy Blue',      base: '#1E3A5F', accent: '#3B82F6' },
      { name: 'Rose Gold',      base: '#B76E79', accent: '#F0C8CE' }
    ],
    defaultColor: 0
  },
  {
    id: 'watch', name: 'Smart Watch', icon: '⌚',
    dimensions: '4.4 × 3.8 × 1.1 cm',
    description: 'Advanced smartwatch with AMOLED display, heart rate monitor, GPS, and 5ATM water resistance.',
    price: '$399',
    category: 'Wearables',
    colors: [
      { name: 'Space Grey', base: '#3D3D3D', accent: '#1A1A1A' },
      { name: 'Gold',       base: '#C9A84C', accent: '#8B6914' },
      { name: 'Silver',     base: '#C0C0C0', accent: '#888888' },
      { name: 'Midnight',   base: '#0F172A', accent: '#1E293B' }
    ],
    defaultColor: 0
  },
  {
    id: 'backpack', name: 'Travel Backpack', icon: '🎒',
    dimensions: '50 × 32 × 20 cm',
    description: 'Durable 40L travel backpack with laptop compartment, USB charging port, and waterproof zippers.',
    price: '$89',
    category: 'Bags',
    colors: [
      { name: 'Charcoal',   base: '#3D3D3D', accent: '#F59E0B' },
      { name: 'Navy',       base: '#1E3A5F', accent: '#64748B' },
      { name: 'Olive',      base: '#556B2F', accent: '#8B8B3B' },
      { name: 'Burgundy',   base: '#722F37', accent: '#D4A373' }
    ],
    defaultColor: 0
  },
  {
    id: 'speaker', name: 'Bluetooth Speaker', icon: '🔊',
    dimensions: '18 × 7 × 7 cm',
    description: 'Portable waterproof Bluetooth speaker with 360° sound, 20-hour battery, and bass boost.',
    price: '$79',
    category: 'Electronics',
    colors: [
      { name: 'Matte Black', base: '#1A1A1A', accent: '#333333' },
      { name: 'Teal',        base: '#0D9488', accent: '#115E59' },
      { name: 'Coral',       base: '#FB923C', accent: '#C2410C' },
      { name: 'Slate Blue',  base: '#475569', accent: '#334155' }
    ],
    defaultColor: 0
  },
  {
    id: 'sunglasses', name: 'Aviator Sunglasses', icon: '🕶️',
    dimensions: '14 × 5 × 5 cm',
    description: 'Classic aviator sunglasses with polarized lenses, UV400 protection, and titanium frame.',
    price: '$199',
    category: 'Accessories',
    colors: [
      { name: 'Gold Frame',   base: '#C9A84C', accent: '#1A1A1A' },
      { name: 'Silver Frame', base: '#A0A0A0', accent: '#1A1A1A' },
      { name: 'Black Frame',  base: '#1A1A1A', accent: '#333333' },
      { name: 'Rose Gold',    base: '#B76E79', accent: '#3D2020' }
    ],
    defaultColor: 0
  }
];

// Backward compatibility alias
export const FURNITURE_CATALOG = PRODUCT_CATALOG;

function mat(color, opts) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: opts?.roughness ?? 0.7,
    metalness: opts?.metalness ?? 0.05,
    ...opts
  });
}

function box(w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  return mesh;
}

function cyl(r, h, material, x, y, z, segs) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, segs || 16), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}

/* ---- Build Sneaker ---- */
function buildSneakers(base, accent) {
  const group = new THREE.Group();
  const mBase = mat(base, { roughness: 0.85 });
  const mAccent = mat(accent, { roughness: 0.6 });
  const mSole = mat('#EEEEEE', { roughness: 0.9 });
  const mSole2 = mat('#CCCCCC', { roughness: 0.8 });

  // Sole — elongated rounded shape
  const soleGeo = new THREE.BoxGeometry(0.30, 0.03, 0.12);
  const sole = new THREE.Mesh(soleGeo, mSole);
  sole.position.set(0, 0.015, 0);
  sole.castShadow = true;
  group.add(sole);

  // Midsole
  group.add(box(0.28, 0.025, 0.11, mSole2, 0, 0.04, 0));

  // Upper body
  group.add(box(0.26, 0.06, 0.10, mBase, 0, 0.08, 0));

  // Toe cap — slightly raised
  const toeGeo = new THREE.SphereGeometry(0.06, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const toe = new THREE.Mesh(toeGeo, mBase);
  toe.position.set(0.12, 0.055, 0);
  toe.rotation.z = -Math.PI / 2;
  toe.castShadow = true;
  group.add(toe);

  // Collar / ankle area — rear raised section
  group.add(box(0.06, 0.04, 0.09, mBase, -0.11, 0.12, 0));

  // Accent stripe
  group.add(box(0.14, 0.015, 0.105, mAccent, 0.02, 0.075, 0));

  // Lace area
  const laceMat = mat('#FFFFFF', { roughness: 0.9 });
  for (let i = 0; i < 4; i++) {
    group.add(box(0.01, 0.005, 0.04, laceMat, -0.03 + i * 0.04, 0.115, 0));
  }

  // Tongue
  group.add(box(0.06, 0.03, 0.06, mAccent, 0.01, 0.13, 0));

  return group;
}

/* ---- Build Headphones ---- */
function buildHeadphones(base, accent) {
  const group = new THREE.Group();
  const mBase = mat(base, { roughness: 0.4, metalness: 0.3 });
  const mAccent = mat(accent, { roughness: 0.6, metalness: 0.1 });
  const mPad = mat('#1A1A1A', { roughness: 0.95 });
  const mCushion = mat('#333333', { roughness: 0.9 });

  // Headband — curved arc using a torus segment
  const bandGeo = new THREE.TorusGeometry(0.12, 0.012, 8, 32, Math.PI);
  const band = new THREE.Mesh(bandGeo, mBase);
  band.position.set(0, 0.30, 0);
  band.rotation.x = Math.PI;
  band.castShadow = true;
  group.add(band);

  // Headband padding (top cushion)
  const padGeo = new THREE.TorusGeometry(0.12, 0.018, 6, 24, Math.PI * 0.6);
  const pad = new THREE.Mesh(padGeo, mCushion);
  pad.position.set(0, 0.30, 0);
  pad.rotation.x = Math.PI;
  pad.castShadow = true;
  group.add(pad);

  // Left ear cup
  const cupGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.03, 24);
  const leftCup = new THREE.Mesh(cupGeo, mBase);
  leftCup.position.set(-0.12, 0.18, 0);
  leftCup.rotation.z = Math.PI / 2;
  leftCup.castShadow = true;
  group.add(leftCup);

  // Left ear cushion
  const cushionGeo = new THREE.TorusGeometry(0.04, 0.012, 8, 24);
  const leftCushion = new THREE.Mesh(cushionGeo, mPad);
  leftCushion.position.set(-0.135, 0.18, 0);
  leftCushion.rotation.y = Math.PI / 2;
  group.add(leftCushion);

  // Right ear cup
  const rightCup = new THREE.Mesh(cupGeo, mBase);
  rightCup.position.set(0.12, 0.18, 0);
  rightCup.rotation.z = Math.PI / 2;
  rightCup.castShadow = true;
  group.add(rightCup);

  // Right ear cushion
  const rightCushion = new THREE.Mesh(cushionGeo, mPad);
  rightCushion.position.set(0.135, 0.18, 0);
  rightCushion.rotation.y = Math.PI / 2;
  group.add(rightCushion);

  // Extension arms (connect band to cups)
  group.add(box(0.01, 0.06, 0.015, mAccent, -0.12, 0.22, 0));
  group.add(box(0.01, 0.06, 0.015, mAccent, 0.12, 0.22, 0));

  // Accent ring on cups
  const ringGeo = new THREE.RingGeometry(0.025, 0.035, 24);
  const ringMat = mat(accent, { roughness: 0.3, metalness: 0.5 });
  const leftRing = new THREE.Mesh(ringGeo, ringMat);
  leftRing.position.set(-0.145, 0.18, 0);
  leftRing.rotation.y = Math.PI / 2;
  group.add(leftRing);
  const rightRing = new THREE.Mesh(ringGeo, ringMat);
  rightRing.position.set(0.145, 0.18, 0);
  rightRing.rotation.y = Math.PI / 2;
  group.add(rightRing);

  return group;
}

/* ---- Build Smart Watch ---- */
function buildWatch(base, accent) {
  const group = new THREE.Group();
  const mCase = mat(base, { roughness: 0.3, metalness: 0.6 });
  const mAccent = mat(accent, { roughness: 0.4, metalness: 0.4 });
  const mScreen = mat('#000000', { roughness: 0.1, metalness: 0.0 });
  const mBand = mat(base, { roughness: 0.8 });

  // Watch case (rounded square)
  const caseGeo = new THREE.BoxGeometry(0.044, 0.006, 0.038);
  const watchCase = new THREE.Mesh(caseGeo, mCase);
  watchCase.position.set(0, 0.07, 0);
  watchCase.castShadow = true;
  group.add(watchCase);

  // Bezel ring
  group.add(box(0.046, 0.003, 0.040, mAccent, 0, 0.073, 0));

  // Screen face (slightly inset, dark)
  group.add(box(0.036, 0.002, 0.030, mScreen, 0, 0.075, 0));

  // Screen content — green time indicator dot
  const dotMat = new THREE.MeshStandardMaterial({
    color: 0x22C55E, emissive: 0x22C55E, emissiveIntensity: 0.4,
    roughness: 0.2, metalness: 0.0
  });
  const timeDot = new THREE.Mesh(new THREE.CircleGeometry(0.003, 12), dotMat);
  timeDot.position.set(0, 0.077, 0);
  timeDot.rotation.x = -Math.PI / 2;
  group.add(timeDot);

  // Crown button (side)
  group.add(cyl(0.003, 0.008, mAccent, 0.026, 0.07, 0));

  // Top band lug
  group.add(box(0.018, 0.004, 0.006, mCase, 0, 0.07, -0.022));
  // Bottom band lug
  group.add(box(0.018, 0.004, 0.006, mCase, 0, 0.07, 0.022));

  // Top strap
  group.add(box(0.018, 0.003, 0.06, mBand, 0, 0.068, -0.052));
  // Bottom strap
  group.add(box(0.018, 0.003, 0.06, mBand, 0, 0.068, 0.052));

  // Strap buckle
  group.add(box(0.020, 0.004, 0.008, mAccent, 0, 0.069, 0.078));

  // Scale up for visibility
  group.scale.set(3, 3, 3);

  return group;
}

/* ---- Build Backpack ---- */
function buildBackpack(base, accent) {
  const group = new THREE.Group();
  const mBase = mat(base, { roughness: 0.85 });
  const mAccent = mat(accent, { roughness: 0.7 });
  const mZipper = mat('#888888', { roughness: 0.3, metalness: 0.5 });
  const mStrap = mat(base, { roughness: 0.9 });

  // Main body
  group.add(box(0.32, 0.50, 0.20, mBase, 0, 0.30, 0));

  // Front pocket
  group.add(box(0.28, 0.20, 0.04, mAccent, 0, 0.18, 0.12));

  // Top flap
  group.add(box(0.30, 0.04, 0.18, mBase, 0, 0.56, 0.01));

  // Zipper line on front pocket
  group.add(box(0.22, 0.005, 0.005, mZipper, 0, 0.28, 0.145));

  // Main zipper
  group.add(box(0.005, 0.005, 0.14, mZipper, 0.14, 0.48, 0.04));
  group.add(box(0.005, 0.005, 0.14, mZipper, -0.14, 0.48, 0.04));

  // Left shoulder strap
  group.add(box(0.04, 0.40, 0.02, mStrap, -0.11, 0.32, -0.11));
  // Right shoulder strap
  group.add(box(0.04, 0.40, 0.02, mStrap, 0.11, 0.32, -0.11));

  // Handle (top)
  group.add(box(0.08, 0.02, 0.03, mAccent, 0, 0.59, -0.02));

  // Side pocket (left)
  group.add(box(0.04, 0.12, 0.16, mAccent, -0.18, 0.22, 0));

  // Bottom padding
  group.add(box(0.30, 0.02, 0.18, mat('#222222', { roughness: 0.9 }), 0, 0.05, 0));

  // USB port indicator (accent dot)
  const usbMat = new THREE.MeshStandardMaterial({
    color: 0x3B82F6, emissive: 0x3B82F6, emissiveIntensity: 0.3,
    roughness: 0.2
  });
  const usb = new THREE.Mesh(new THREE.CircleGeometry(0.008, 8), usbMat);
  usb.position.set(0.165, 0.35, 0);
  usb.rotation.y = Math.PI / 2;
  group.add(usb);

  return group;
}

/* ---- Build Bluetooth Speaker ---- */
function buildSpeaker(base, accent) {
  const group = new THREE.Group();
  const mBase = mat(base, { roughness: 0.5, metalness: 0.1 });
  const mAccent = mat(accent, { roughness: 0.6 });
  const mGrill = mat('#1A1A1A', { roughness: 0.9, metalness: 0.0 });

  // Main cylindrical body
  const bodyGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.18, 24);
  const body = new THREE.Mesh(bodyGeo, mBase);
  body.position.set(0, 0.035, 0);
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  group.add(body);

  // End caps
  const capGeo = new THREE.SphereGeometry(0.035, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);

  const leftCap = new THREE.Mesh(capGeo, mAccent);
  leftCap.position.set(-0.09, 0.035, 0);
  leftCap.rotation.z = Math.PI / 2;
  leftCap.castShadow = true;
  group.add(leftCap);

  const rightCap = new THREE.Mesh(capGeo, mAccent);
  rightCap.position.set(0.09, 0.035, 0);
  rightCap.rotation.z = -Math.PI / 2;
  rightCap.castShadow = true;
  group.add(rightCap);

  // Speaker grill (perforated pattern - simulated with a dark band)
  const grillGeo = new THREE.CylinderGeometry(0.0355, 0.0355, 0.12, 24, 1, true);
  const grill = new THREE.Mesh(grillGeo, mGrill);
  grill.position.set(0, 0.035, 0);
  grill.rotation.z = Math.PI / 2;
  group.add(grill);

  // Control buttons (3 small circles on top)
  const btnMat = mat('#666666', { roughness: 0.3, metalness: 0.4 });
  for (let i = -1; i <= 1; i++) {
    const btn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.003, 12),
      btnMat
    );
    btn.position.set(i * 0.02, 0.07, 0);
    btn.castShadow = true;
    group.add(btn);
  }

  // LED indicator
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x3B82F6, emissive: 0x3B82F6, emissiveIntensity: 0.6,
    roughness: 0.1
  });
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 8), ledMat);
  led.position.set(0, 0.068, 0.02);
  group.add(led);

  // Rubber base strip
  group.add(box(0.14, 0.003, 0.025, mat('#222222', { roughness: 0.95 }), 0, 0.0, 0));

  // Scale up for visibility in AR
  group.scale.set(2.5, 2.5, 2.5);

  return group;
}

/* ---- Build Sunglasses ---- */
function buildSunglasses(base, accent) {
  const group = new THREE.Group();
  const mFrame = mat(base, { roughness: 0.3, metalness: 0.7 });
  const mLens = mat(accent, { roughness: 0.1, metalness: 0.0, transparent: true, opacity: 0.7 });
  const mNosePad = mat('#D4D4D4', { roughness: 0.4, metalness: 0.3 });

  // Left lens (slightly convex, teardrop shape approximated with ellipsoid)
  const lensGeo = new THREE.SphereGeometry(0.03, 16, 12);
  lensGeo.scale(1.6, 1.0, 0.3);
  const leftLens = new THREE.Mesh(lensGeo, mLens);
  leftLens.position.set(-0.035, 0.10, 0.01);
  leftLens.castShadow = true;
  group.add(leftLens);

  // Right lens
  const rightLens = new THREE.Mesh(lensGeo.clone(), mLens);
  rightLens.position.set(0.035, 0.10, 0.01);
  rightLens.castShadow = true;
  group.add(rightLens);

  // Left lens frame ring
  const frameGeo = new THREE.TorusGeometry(0.032, 0.002, 8, 32);
  const leftFrame = new THREE.Mesh(frameGeo, mFrame);
  leftFrame.position.set(-0.035, 0.10, 0.015);
  group.add(leftFrame);

  // Right lens frame ring
  const rightFrame = new THREE.Mesh(frameGeo.clone(), mFrame);
  rightFrame.position.set(0.035, 0.10, 0.015);
  group.add(rightFrame);

  // Bridge (connects two lenses)
  const bridgeGeo = new THREE.TorusGeometry(0.015, 0.0015, 6, 12, Math.PI);
  const bridge = new THREE.Mesh(bridgeGeo, mFrame);
  bridge.position.set(0, 0.105, 0.015);
  bridge.rotation.x = Math.PI;
  group.add(bridge);

  // Left temple arm
  group.add(box(0.003, 0.003, 0.10, mFrame, -0.065, 0.10, -0.04));
  // Right temple arm
  group.add(box(0.003, 0.003, 0.10, mFrame, 0.065, 0.10, -0.04));

  // Temple tips (curved ends)
  group.add(cyl(0.003, 0.02, mFrame, -0.065, 0.098, -0.095));
  group.add(cyl(0.003, 0.02, mFrame, 0.065, 0.098, -0.095));

  // Nose pads
  const nosePadGeo = new THREE.SphereGeometry(0.004, 8, 8);
  const leftPad = new THREE.Mesh(nosePadGeo, mNosePad);
  leftPad.position.set(-0.012, 0.088, 0.018);
  group.add(leftPad);
  const rightPad = new THREE.Mesh(nosePadGeo, mNosePad);
  rightPad.position.set(0.012, 0.088, 0.018);
  group.add(rightPad);

  // Scale up for visibility
  group.scale.set(3, 3, 3);

  return group;
}

/**
 * Creates a Three.js Group for the given product ID and color index.
 */
export function createProductModel(productId, colorIndex) {
  const item = PRODUCT_CATALOG.find(p => p.id === productId);
  if (!item) return null;

  const color = item.colors[colorIndex ?? item.defaultColor];
  let group;

  switch (productId) {
    case 'sneakers':    group = buildSneakers(color.base, color.accent); break;
    case 'headphones':  group = buildHeadphones(color.base, color.accent); break;
    case 'watch':       group = buildWatch(color.base, color.accent); break;
    case 'backpack':    group = buildBackpack(color.base, color.accent); break;
    case 'speaker':     group = buildSpeaker(color.base, color.accent); break;
    case 'sunglasses':  group = buildSunglasses(color.base, color.accent); break;
    default: return null;
  }

  group.name = 'product-model';
  group.userData = { productId, colorIndex: colorIndex ?? item.defaultColor };
  return group;
}

// Backward compatibility alias
export const createFurnitureModel = createProductModel;
