# AR E-Commerce Product Viewer 🛒

A web-based Augmented Reality e-commerce product visualization experience that works directly in your mobile browser — no app installation, no markers needed.

> **"Try before you buy — visualize products in your real environment"**

## ✨ Features

### Core AR Experience
- **Markerless Surface Detection**: Uses WebXR Hit Test API — just point at a floor or table and tap to place products
- **Multi-Object Placement**: Place up to 15 products simultaneously and compare items side-by-side
- **Object Selection & Management**: Tap to select, delete individual objects, or clear entire scene
- **Touch Gestures**: Pinch to scale, drag to move, two-finger twist to rotate per-object

### AR Measurement Tool 📏
- **Point-to-Point Measurement**: Tap two surface points to measure real-world distance
- **Visual Measurement Lines**: 3D rendered lines with distance labels floating in AR
- **Unit Toggle**: Switch between centimeters and inches
- **Measurement History**: Keep up to 5 measurements visible simultaneously

### Product Catalog
- **6 Product Models**: Running Sneakers, Wireless Headphones, Smart Watch, Travel Backpack, Bluetooth Speaker, Aviator Sunglasses
- **Color Customization**: 4 color/material variants per product
- **Product Info**: View name, dimensions, price, category, and description for each item

### Screenshot & Share 📸
- **AR Scene Capture**: Capture the composited AR view with products in your real space
- **Watermarked Export**: Automatic branding watermark and timestamp
- **Native Share**: Web Share API integration for mobile sharing, with download fallback

### Performance Dashboard ⚡
- **Real-time Metrics**: FPS, draw calls, triangle count, texture count
- **Session Timer**: Track AR session duration
- **GPU Info**: Detect and display device GPU information
- **Toggleable Panel**: Hidden by default, accessible via ⚡ button

### Additional
- **3D Preview Mode**: Non-AR fallback with orbit controls for desktop exploring
- **PWA Support**: Installable as a home screen app with offline caching
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
6. **Tap the screen** to place a product at the ring
7. **Place multiple items** — each tap adds a new product
8. **Interact**: Pinch to scale, drag to move, twist to rotate
9. **Switch products** using the bottom selector panel
10. **Measure**: Toggle 📏 mode and tap two points to measure distance
11. **Screenshot**: Tap 📸 to capture and share your AR preview

## 📁 Project Structure

```
arvr/
├── index.html              # Main AR experience
├── preview.html            # 3D preview mode with orbit controls
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline caching
├── netlify.toml            # Deployment config
├── css/
│   └── styles.css          # Dark glassmorphism theme
├── js/
│   ├── app.js              # Main orchestrator (WebXR + managers)
│   ├── state.js            # Centralized reactive state management
│   ├── scene-manager.js    # Multi-object scene management + raycasting
│   ├── furniture.js        # Product model builders (6 models)
│   ├── measurement.js      # AR measurement tool
│   ├── screenshot.js       # Scene capture, watermark, share
│   ├── performance.js      # Real-time FPS/stats dashboard
│   ├── interactions.js     # Touch gesture handling
│   ├── ui.js               # UI controller
│   └── utils.js            # Shared utility functions
├── assets/
│   ├── markers/
│   │   └── hiro-marker.png # Legacy marker (not required)
│   └── textures/           # Texture assets
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
| Web Share API | Native mobile sharing |
| Service Worker | PWA offline support |

## 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│                  app.js                       │
│          (Main Orchestrator)                  │
├──────────┬───────────┬───────────┬───────────┤
│ state.js │scene-mgr.js│measure.js│screenshot │
│ (State)  │(Multi-Obj)│(AR Ruler)│  (.js)    │
├──────────┴───────────┴───────────┴───────────┤
│              furniture.js                     │
│         (6 Product Models)                    │
├──────────────────────────────────────────────┤
│  interactions.js  │  ui.js  │ performance.js │
│  (Touch Gestures) │  (DOM)  │ (FPS/Stats)   │
├──────────────────────────────────────────────┤
│              Three.js + WebXR                 │
└──────────────────────────────────────────────┘
```

## 📱 Requirements

- ✅ Android phone with **ARCore** support (most phones from 2018+)
- ✅ **Chrome 81+** on Android
- ✅ **Google Play Services for AR** installed
- ✅ Desktop browsers (3D Preview mode only)
- ❌ No app installation required

## 🛍️ Product Catalog

| Product | Dimensions | Category | Colors |
|---------|-----------|----------|--------|
| Running Sneakers | 30 × 12 × 14 cm | Footwear | Midnight Black, Cloud White, Sport Red, Forest Green |
| Wireless Headphones | 18 × 17 × 8 cm | Electronics | Matte Black, Silver, Navy Blue, Rose Gold |
| Smart Watch | 4.4 × 3.8 × 1.1 cm | Wearables | Space Grey, Gold, Silver, Midnight |
| Travel Backpack | 50 × 32 × 20 cm | Bags | Charcoal, Navy, Olive, Burgundy |
| Bluetooth Speaker | 18 × 7 × 7 cm | Electronics | Matte Black, Teal, Coral, Slate Blue |
| Aviator Sunglasses | 14 × 5 × 5 cm | Accessories | Gold Frame, Silver Frame, Black Frame, Rose Gold |

## 📄 License

Student capstone project demonstration.
