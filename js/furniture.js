/**
 * furniture.js — Three.js Furniture Model Definitions
 * Builds procedural 3D furniture using Three.js geometry groups.
 */
import * as THREE from 'three';

export const FURNITURE_CATALOG = [
  {
    id: 'sofa', name: 'Modern Sofa', icon: '🛋️',
    dimensions: '200 × 80 × 75 cm',
    description: 'A sleek modern 3-seater sofa with plush cushions and low-profile arms.',
    colors: [
      { name: 'Charcoal', base: '#3D3D3D', accent: '#2A2A2A' },
      { name: 'Navy',     base: '#1E3A5F', accent: '#152C4A' },
      { name: 'Olive',    base: '#556B2F', accent: '#3E4F22' },
      { name: 'Burgundy', base: '#722F37', accent: '#5A252C' }
    ],
    defaultColor: 0
  },
  {
    id: 'chair', name: 'Dining Chair', icon: '🪑',
    dimensions: '45 × 45 × 90 cm',
    description: 'An elegant wooden dining chair with curved backrest and fabric seat.',
    colors: [
      { name: 'Walnut',  base: '#5C4033', accent: '#8B6914' },
      { name: 'Oak',     base: '#C4A35A', accent: '#A68B3C' },
      { name: 'White',   base: '#E8E4DF', accent: '#D4CFC9' },
      { name: 'Black',   base: '#1A1A1A', accent: '#333333' }
    ],
    defaultColor: 0
  },
  {
    id: 'table', name: 'Coffee Table', icon: '🪵',
    dimensions: '120 × 60 × 45 cm',
    description: 'A minimalist coffee table with a wooden top and sleek metal legs.',
    colors: [
      { name: 'Walnut',    base: '#5C4033', accent: '#8B8B8B' },
      { name: 'White Oak',  base: '#DDD5C0', accent: '#333333' },
      { name: 'Marble',    base: '#E0DDD5', accent: '#B8B0A0' },
      { name: 'Dark Wood', base: '#2C1B0E', accent: '#666666' }
    ],
    defaultColor: 0
  }
];

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

/* ---- Build Sofa ---- */
function buildSofa(base, accent) {
  const group = new THREE.Group();
  const mBase = mat(base, { roughness: 0.9 });
  const mAccent = mat(accent, { roughness: 0.8 });
  const mLeg = mat('#222222', { roughness: 0.4, metalness: 0.3 });

  // Frame
  group.add(box(1.0, 0.16, 0.42, mAccent, 0, 0.18, 0));
  // Back cushion
  group.add(box(0.96, 0.22, 0.10, mBase, 0, 0.36, -0.15));
  // Seat cushions
  group.add(box(0.29, 0.06, 0.28, mBase, -0.32, 0.28, 0.03));
  group.add(box(0.29, 0.06, 0.28, mBase, 0, 0.28, 0.03));
  group.add(box(0.29, 0.06, 0.28, mBase, 0.32, 0.28, 0.03));
  // Arms
  group.add(box(0.06, 0.16, 0.38, mAccent, -0.52, 0.28, 0));
  group.add(box(0.06, 0.16, 0.38, mAccent, 0.52, 0.28, 0));
  // Legs
  group.add(cyl(0.018, 0.10, mLeg, -0.44, 0.05, 0.16));
  group.add(cyl(0.018, 0.10, mLeg, 0.44, 0.05, 0.16));
  group.add(cyl(0.018, 0.10, mLeg, -0.44, 0.05, -0.16));
  group.add(cyl(0.018, 0.10, mLeg, 0.44, 0.05, -0.16));

  return group;
}

/* ---- Build Chair ---- */
function buildChair(base, accent) {
  const group = new THREE.Group();
  const mBase = mat(base, { roughness: 0.7 });
  const mAccent = mat(accent, { roughness: 0.6, metalness: 0.1 });

  // Seat
  group.add(box(0.24, 0.03, 0.24, mBase, 0, 0.24, 0));
  // Backrest
  group.add(box(0.22, 0.30, 0.025, mBase, 0, 0.40, -0.10));
  // Seat cushion
  group.add(box(0.21, 0.02, 0.20, mBase, 0, 0.265, 0.01));
  // Legs
  group.add(cyl(0.012, 0.24, mAccent, -0.09, 0.12, 0.09));
  group.add(cyl(0.012, 0.24, mAccent, 0.09, 0.12, 0.09));
  group.add(cyl(0.012, 0.24, mAccent, -0.09, 0.12, -0.09));
  group.add(cyl(0.012, 0.24, mAccent, 0.09, 0.12, -0.09));
  // Cross bar
  group.add(box(0.16, 0.015, 0.015, mAccent, 0, 0.06, 0.09));

  return group;
}

/* ---- Build Table ---- */
function buildTable(base, accent) {
  const group = new THREE.Group();
  const mBase = mat(base, { roughness: 0.5 });
  const mLeg = mat(accent, { roughness: 0.3, metalness: 0.6 });

  // Table top
  group.add(box(0.6, 0.03, 0.30, mBase, 0, 0.235, 0));
  // Edge bevel
  group.add(box(0.58, 0.01, 0.28, mBase, 0, 0.222, 0));
  // Legs
  group.add(box(0.025, 0.22, 0.025, mLeg, -0.25, 0.11, 0.11));
  group.add(box(0.025, 0.22, 0.025, mLeg, 0.25, 0.11, 0.11));
  group.add(box(0.025, 0.22, 0.025, mLeg, -0.25, 0.11, -0.11));
  group.add(box(0.025, 0.22, 0.025, mLeg, 0.25, 0.11, -0.11));
  // Bottom shelf
  group.add(box(0.50, 0.015, 0.22, mBase, 0, 0.06, 0));

  return group;
}

/**
 * Creates a Three.js Group for the given furniture ID and color index.
 */
export function createFurnitureModel(furnitureId, colorIndex) {
  const item = FURNITURE_CATALOG.find(f => f.id === furnitureId);
  if (!item) return null;

  const color = item.colors[colorIndex ?? item.defaultColor];
  let group;

  switch (furnitureId) {
    case 'sofa':  group = buildSofa(color.base, color.accent); break;
    case 'chair': group = buildChair(color.base, color.accent); break;
    case 'table': group = buildTable(color.base, color.accent); break;
    default: return null;
  }

  group.name = 'furniture-model';
  group.userData = { furnitureId, colorIndex: colorIndex ?? item.defaultColor };
  return group;
}
