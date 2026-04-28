# AR Furniture Visualizer 🪑

A web-based Augmented Reality furniture visualization experience that works directly in your mobile browser — no app installation required.

## ✨ Features

- **Marker-Based AR**: Point your phone camera at the Hiro marker to see furniture appear in your real environment
- **3 Furniture Models**: Modern Sofa, Dining Chair, and Coffee Table — all procedurally generated
- **Touch Gestures**: Pinch to scale, drag to move, two-finger twist to rotate
- **Color Customization**: 4 color/material variants per furniture piece
- **Product Info**: View name, dimensions, and description for each item
- **3D Preview Mode**: Non-AR fallback for exploring models without a marker
- **Mobile-First UI**: Glassmorphism dark theme with smooth animations

## 🚀 Getting Started

### Quick Start (Netlify)
1. Push this repo to GitHub
2. Connect to [Netlify](https://netlify.com) and deploy
3. Open the deployed URL on your Android phone's Chrome browser

### Local Development
Since AR.js requires camera access, you need HTTPS:

```bash
# Install a simple HTTPS server
npm install -g local-web-server

# Run with HTTPS
ws --https --port 8443

# Or use Python
python3 -m http.server 8443
# (Note: Python's server doesn't support HTTPS natively, use ngrok instead)

# Using ngrok for HTTPS tunnel
npx ngrok http 8080
```

### How to Use
1. **Print or display the Hiro marker** on another screen (download from the app or use `assets/markers/hiro-marker.png`)
2. **Open the app URL** on your Android Chrome browser
3. **Allow camera access** when prompted
4. **Point your camera** at the Hiro marker
5. **Interact**: Select furniture, pinch to scale, drag to move, twist to rotate

## 📁 Project Structure

```
arvr/
├── index.html          # Main AR experience
├── preview.html        # 3D preview mode (no AR)
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── app.js          # Application entry point
│   ├── furniture.js    # Furniture model definitions
│   ├── interactions.js # Touch gesture handling
│   └── ui.js           # UI controller
├── assets/
│   └── markers/
│       └── hiro-marker.png  # Printable Hiro marker
└── README.md
```

## 🛠️ Technology Stack

| Technology | Purpose |
|-----------|---------|
| [A-Frame 1.6.0](https://aframe.io/) | WebGL 3D scene framework |
| [AR.js](https://ar-js-org.github.io/AR.js-Docs/) | Marker-based AR for web |
| Vanilla JS | Application logic |
| CSS3 | Glassmorphism UI design |
| Google Fonts (Inter) | Typography |

## 📱 Compatibility

- ✅ Android Chrome (primary target)
- ✅ Desktop Chrome/Firefox (3D Preview mode)
- ⚠️ iOS Safari (may work with limitations)
- ❌ Does not require any app installation

## 📐 Furniture Specifications

| Model | Dimensions | Colors |
|-------|-----------|--------|
| Modern Sofa | 200 × 80 × 75 cm | Charcoal, Navy, Olive, Burgundy |
| Dining Chair | 45 × 45 × 90 cm | Walnut, Oak, White, Black |
| Coffee Table | 120 × 60 × 45 cm | Walnut, White Oak, Marble, Dark Wood |

## 📄 License

This project is created as a student capstone demonstration.
