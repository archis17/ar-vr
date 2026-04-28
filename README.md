# AR Furniture Visualizer 🪑

A web-based Augmented Reality furniture visualization experience that works directly in your mobile browser — no app installation, no markers needed.

## ✨ Features

- **Markerless Surface Detection**: Uses WebXR Hit Test API — just point at a floor or table and tap to place furniture
- **3 Furniture Models**: Modern Sofa, Dining Chair, and Coffee Table — procedurally generated with Three.js
- **Touch Gestures**: Pinch to scale, drag to move, two-finger twist to rotate
- **Color Customization**: 4 color/material variants per furniture piece
- **Product Info**: View name, dimensions, and description for each item
- **3D Preview Mode**: Non-AR fallback with orbit controls for exploring models
- **Mobile-First UI**: Dark glassmorphism theme with smooth animations

## 🚀 Getting Started

### Deploy to Netlify (Recommended)
1. Push this repo to GitHub
2. Connect to [Netlify](https://netlify.com) and deploy
3. Open the deployed URL on your Android phone's Chrome browser

### Local Development
WebXR requires HTTPS. For local testing:

```bash
# Using ngrok for HTTPS tunnel
python3 -m http.server 8080
npx ngrok http 8080
# Open the ngrok HTTPS URL on your phone
```

### How to Use
1. **Open the app URL** on your Android Chrome browser
2. **Tap "Start AR Experience"**
3. **Allow camera access** when prompted
4. **Slowly scan** a flat surface (floor, table, desk) with your camera
5. A **golden targeting ring** appears on detected surfaces
6. **Tap the screen** to place furniture at the ring
7. **Interact**: Pinch to scale, drag to move, twist to rotate
8. **Switch furniture** using the bottom selector panel

## 📁 Project Structure

```
arvr/
├── index.html          # Main AR experience (Three.js + WebXR)
├── preview.html        # 3D preview mode with orbit controls
├── css/
│   └── styles.css      # Dark glassmorphism theme
├── js/
│   ├── app.js          # WebXR hit-test AR engine
│   ├── furniture.js    # Three.js furniture model builders
│   ├── interactions.js # Touch gesture handling
│   └── ui.js           # UI controller (overlays, selectors)
├── assets/
│   └── markers/
│       └── hiro-marker.png  # Legacy marker (not required)
├── netlify.toml        # Deployment config
└── README.md
```

## 🛠️ Technology Stack

| Technology | Purpose |
|-----------|---------|
| [Three.js r170](https://threejs.org/) | 3D rendering engine |
| [WebXR Hit Test API](https://immersive-web.github.io/hit-test/) | Markerless surface detection |
| Vanilla JS (ES Modules) | Application logic |
| CSS3 | Glassmorphism UI design |
| Google Fonts (Inter) | Typography |

## 📱 Requirements

- ✅ Android phone with **ARCore** support (most phones from 2018+)
- ✅ **Chrome 81+** on Android
- ✅ **Google Play Services for AR** installed
- ✅ Desktop browsers (3D Preview mode only)
- ❌ No app installation required

## 📐 Furniture Specifications

| Model | Dimensions | Colors |
|-------|-----------|--------|
| Modern Sofa | 200 × 80 × 75 cm | Charcoal, Navy, Olive, Burgundy |
| Dining Chair | 45 × 45 × 90 cm | Walnut, Oak, White, Black |
| Coffee Table | 120 × 60 × 45 cm | Walnut, White Oak, Marble, Dark Wood |

## 📄 License

Student capstone project demonstration.
