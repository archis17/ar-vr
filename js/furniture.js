/**
 * furniture.js — Furniture Model Definitions & A-Frame Component Registration
 *
 * Defines 3 procedural furniture models built from A-Frame primitives.
 * Each model includes metadata (name, dimensions, description) and
 * color variants for material customization.
 */

const FURNITURE_CATALOG = [
  {
    id: 'sofa',
    name: 'Modern Sofa',
    icon: '🛋️',
    dimensions: '200 × 80 × 75 cm',
    description: 'A sleek modern 3-seater sofa with plush cushions and low-profile arms.',
    scale: { x: 1, y: 1, z: 1 },
    colors: [
      { name: 'Charcoal', base: '#3D3D3D', accent: '#2A2A2A', id: 'charcoal' },
      { name: 'Navy',     base: '#1E3A5F', accent: '#152C4A', id: 'navy' },
      { name: 'Olive',    base: '#556B2F', accent: '#3E4F22', id: 'olive' },
      { name: 'Burgundy', base: '#722F37', accent: '#5A252C', id: 'burgundy' }
    ],
    defaultColor: 0
  },
  {
    id: 'chair',
    name: 'Dining Chair',
    icon: '🪑',
    dimensions: '45 × 45 × 90 cm',
    description: 'An elegant wooden dining chair with curved backrest and fabric seat.',
    scale: { x: 1, y: 1, z: 1 },
    colors: [
      { name: 'Walnut',  base: '#5C4033', accent: '#8B6914', id: 'walnut' },
      { name: 'Oak',     base: '#C4A35A', accent: '#A68B3C', id: 'oak' },
      { name: 'White',   base: '#E8E4DF', accent: '#D4CFC9', id: 'white' },
      { name: 'Black',   base: '#1A1A1A', accent: '#333333', id: 'black' }
    ],
    defaultColor: 0
  },
  {
    id: 'table',
    name: 'Coffee Table',
    icon: '🪵',
    dimensions: '120 × 60 × 45 cm',
    description: 'A minimalist coffee table with a wooden top and sleek metal legs.',
    scale: { x: 1, y: 1, z: 1 },
    colors: [
      { name: 'Walnut',    base: '#5C4033', accent: '#8B8B8B', id: 'walnut' },
      { name: 'White Oak',  base: '#DDD5C0', accent: '#333333', id: 'whiteoak' },
      { name: 'Marble',    base: '#E0DDD5', accent: '#B8B0A0', id: 'marble' },
      { name: 'Dark Wood', base: '#2C1B0E', accent: '#666666', id: 'darkwood' }
    ],
    defaultColor: 0
  }
];

/**
 * Creates the 3D entity group for a given furniture item.
 * Returns an <a-entity> DOM element with child primitives.
 */
function createFurnitureModel(furnitureId, colorIndex) {
  const item = FURNITURE_CATALOG.find(f => f.id === furnitureId);
  if (!item) return null;

  const color = item.colors[colorIndex ?? item.defaultColor];
  const el = document.createElement('a-entity');
  el.setAttribute('id', 'furniture-model');
  el.setAttribute('class', 'furniture-piece');
  el.setAttribute('scale', `${item.scale.x} ${item.scale.y} ${item.scale.z}`);

  switch (furnitureId) {
    case 'sofa':
      el.innerHTML = buildSofa(color);
      break;
    case 'chair':
      el.innerHTML = buildChair(color);
      break;
    case 'table':
      el.innerHTML = buildTable(color);
      break;
  }

  return el;
}

/* ---- Sofa Builder ---- */
function buildSofa(color) {
  return `
    <!-- Sofa base/frame -->
    <a-box position="0 0.18 0" width="1.0" height="0.16" depth="0.42"
           color="${color.accent}" material="roughness:0.8; metalness:0.05"
           shadow="cast:true; receive:false"></a-box>
    <!-- Back cushion -->
    <a-box position="0 0.36 -0.15" width="0.96" height="0.22" depth="0.10"
           color="${color.base}" material="roughness:0.9; metalness:0"
           shadow="cast:true; receive:false"></a-box>
    <!-- Seat cushions (3 sections) -->
    <a-box position="-0.32 0.28 0.03" width="0.29" height="0.06" depth="0.28"
           color="${color.base}" material="roughness:0.9; metalness:0"
           shadow="cast:true; receive:false"></a-box>
    <a-box position="0 0.28 0.03" width="0.29" height="0.06" depth="0.28"
           color="${color.base}" material="roughness:0.9; metalness:0"
           shadow="cast:true; receive:false"></a-box>
    <a-box position="0.32 0.28 0.03" width="0.29" height="0.06" depth="0.28"
           color="${color.base}" material="roughness:0.9; metalness:0"
           shadow="cast:true; receive:false"></a-box>
    <!-- Left arm -->
    <a-box position="-0.52 0.28 0" width="0.06" height="0.16" depth="0.38"
           color="${color.accent}" material="roughness:0.8; metalness:0.05"
           shadow="cast:true; receive:false"></a-box>
    <!-- Right arm -->
    <a-box position="0.52 0.28 0" width="0.06" height="0.16" depth="0.38"
           color="${color.accent}" material="roughness:0.8; metalness:0.05"
           shadow="cast:true; receive:false"></a-box>
    <!-- Legs -->
    <a-cylinder position="-0.44 0.05 0.16" radius="0.018" height="0.10" color="#222"
                shadow="cast:true; receive:false"></a-cylinder>
    <a-cylinder position="0.44 0.05 0.16" radius="0.018" height="0.10" color="#222"
                shadow="cast:true; receive:false"></a-cylinder>
    <a-cylinder position="-0.44 0.05 -0.16" radius="0.018" height="0.10" color="#222"
                shadow="cast:true; receive:false"></a-cylinder>
    <a-cylinder position="0.44 0.05 -0.16" radius="0.018" height="0.10" color="#222"
                shadow="cast:true; receive:false"></a-cylinder>
    <!-- Shadow plane -->
    <a-plane position="0 0.005 0" rotation="-90 0 0" width="1.2" height="0.6"
             material="color:#000; opacity:0.15; transparent:true; shader:flat"
             shadow="receive:true; cast:false"></a-plane>
  `;
}

/* ---- Chair Builder ---- */
function buildChair(color) {
  return `
    <!-- Seat -->
    <a-box position="0 0.24 0" width="0.24" height="0.03" depth="0.24"
           color="${color.base}" material="roughness:0.7; metalness:0.05"
           shadow="cast:true; receive:false"></a-box>
    <!-- Backrest -->
    <a-box position="0 0.40 -0.10" width="0.22" height="0.30" depth="0.025"
           color="${color.base}" material="roughness:0.7; metalness:0.05"
           shadow="cast:true; receive:false"></a-box>
    <!-- Backrest top curve decoration -->
    <a-cylinder position="0 0.56 -0.10" radius="0.11" height="0.025"
                rotation="90 0 0" color="${color.base}"
                material="roughness:0.7; metalness:0.05"
                theta-length="180" theta-start="0"
                shadow="cast:true; receive:false"></a-cylinder>
    <!-- Front left leg -->
    <a-cylinder position="-0.09 0.12 0.09" radius="0.012" height="0.24"
                color="${color.accent}" material="roughness:0.6; metalness:0.1"
                shadow="cast:true; receive:false"></a-cylinder>
    <!-- Front right leg -->
    <a-cylinder position="0.09 0.12 0.09" radius="0.012" height="0.24"
                color="${color.accent}" material="roughness:0.6; metalness:0.1"
                shadow="cast:true; receive:false"></a-cylinder>
    <!-- Back left leg -->
    <a-cylinder position="-0.09 0.12 -0.09" radius="0.012" height="0.24"
                color="${color.accent}" material="roughness:0.6; metalness:0.1"
                shadow="cast:true; receive:false"></a-cylinder>
    <!-- Back right leg -->
    <a-cylinder position="0.09 0.12 -0.09" radius="0.012" height="0.24"
                color="${color.accent}" material="roughness:0.6; metalness:0.1"
                shadow="cast:true; receive:false"></a-cylinder>
    <!-- Seat cushion pad -->
    <a-box position="0 0.265 0.01" width="0.21" height="0.02" depth="0.20"
           color="${color.base}" material="roughness:0.95; metalness:0"
           shadow="cast:true; receive:false"></a-box>
    <!-- Cross bar front -->
    <a-box position="0 0.06 0.09" width="0.16" height="0.015" depth="0.015"
           color="${color.accent}" material="roughness:0.6; metalness:0.1"
           shadow="cast:true; receive:false"></a-box>
    <!-- Shadow plane -->
    <a-plane position="0 0.005 0" rotation="-90 0 0" width="0.35" height="0.35"
             material="color:#000; opacity:0.12; transparent:true; shader:flat"
             shadow="receive:true; cast:false"></a-plane>
  `;
}

/* ---- Table Builder ---- */
function buildTable(color) {
  return `
    <!-- Table top -->
    <a-box position="0 0.235 0" width="0.6" height="0.03" depth="0.30"
           color="${color.base}" material="roughness:0.5; metalness:0.05"
           shadow="cast:true; receive:false"></a-box>
    <!-- Table top edge bevel -->
    <a-box position="0 0.222 0" width="0.58" height="0.01" depth="0.28"
           color="${color.base}" material="roughness:0.5; metalness:0.05"
           shadow="cast:true; receive:false"></a-box>
    <!-- Front left leg -->
    <a-box position="-0.25 0.11 0.11" width="0.025" height="0.22" depth="0.025"
           color="${color.accent}" material="roughness:0.3; metalness:0.6"
           shadow="cast:true; receive:false"></a-box>
    <!-- Front right leg -->
    <a-box position="0.25 0.11 0.11" width="0.025" height="0.22" depth="0.025"
           color="${color.accent}" material="roughness:0.3; metalness:0.6"
           shadow="cast:true; receive:false"></a-box>
    <!-- Back left leg -->
    <a-box position="-0.25 0.11 -0.11" width="0.025" height="0.22" depth="0.025"
           color="${color.accent}" material="roughness:0.3; metalness:0.6"
           shadow="cast:true; receive:false"></a-box>
    <!-- Back right leg -->
    <a-box position="0.25 0.11 -0.11" width="0.025" height="0.22" depth="0.025"
           color="${color.accent}" material="roughness:0.3; metalness:0.6"
           shadow="cast:true; receive:false"></a-box>
    <!-- Bottom shelf -->
    <a-box position="0 0.06 0" width="0.50" height="0.015" depth="0.22"
           color="${color.base}" material="roughness:0.6; metalness:0.05; opacity:0.8"
           shadow="cast:true; receive:false"></a-box>
    <!-- Shadow plane -->
    <a-plane position="0 0.005 0" rotation="-90 0 0" width="0.7" height="0.4"
             material="color:#000; opacity:0.12; transparent:true; shader:flat"
             shadow="receive:true; cast:false"></a-plane>
  `;
}

/**
 * Updates the color/material of the current furniture model.
 */
function updateFurnitureColor(furnitureId, colorIndex) {
  const marker = document.getElementById('ar-marker');
  if (!marker) return;

  // Remove existing model
  const existing = marker.querySelector('#furniture-model');
  if (existing) existing.remove();

  // Create new model with updated color
  const model = createFurnitureModel(furnitureId, colorIndex);
  if (model) {
    marker.appendChild(model);
  }
}

// Export for use in other modules
window.FurnitureCatalog = FURNITURE_CATALOG;
window.createFurnitureModel = createFurnitureModel;
window.updateFurnitureColor = updateFurnitureColor;
