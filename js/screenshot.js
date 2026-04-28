/**
 * screenshot.js — AR Scene Capture & Share
 * 
 * Captures the composited AR view (camera feed + 3D products),
 * adds a watermark, and enables download/share.
 */

/**
 * Capture the current renderer output as a PNG blob.
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @returns {Promise<Blob>}
 */
export async function captureScene(renderer, scene, camera) {
  // Force a render to ensure the latest frame
  renderer.render(scene, camera);

  const canvas = renderer.domElement;

  // Create an offscreen canvas for watermarking
  const offscreen = document.createElement('canvas');
  offscreen.width = canvas.width;
  offscreen.height = canvas.height;
  const ctx = offscreen.getContext('2d');

  // Draw the rendered scene
  ctx.drawImage(canvas, 0, 0);

  // Add watermark
  _addWatermark(ctx, offscreen.width, offscreen.height);

  // Add timestamp
  _addTimestamp(ctx, offscreen.width, offscreen.height);

  // Convert to blob
  return new Promise((resolve) => {
    offscreen.toBlob(resolve, 'image/png', 1.0);
  });
}

/**
 * Download the captured image.
 */
export async function downloadScreenshot(renderer, scene, camera) {
  const blob = await captureScene(renderer, scene, camera);
  if (!blob) return false;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ar-product-${_timestamp()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Share via Web Share API (mobile native share sheet).
 * Falls back to download if Web Share is unavailable.
 */
export async function shareScreenshot(renderer, scene, camera) {
  const blob = await captureScene(renderer, scene, camera);
  if (!blob) return false;

  const file = new File([blob], `ar-product-${_timestamp()}.png`, { type: 'image/png' });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: 'My AR Product Preview',
        text: 'Check out this product I previewed in AR — try before you buy!',
        files: [file]
      });
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Share failed, falling back to download:', err);
        return downloadScreenshot(renderer, scene, camera);
      }
      return false;
    }
  } else {
    // Fallback to download
    return downloadScreenshot(renderer, scene, camera);
  }
}

// --- Private helpers ---

function _addWatermark(ctx, width, height) {
  const padding = 16;
  const fontSize = Math.max(12, Math.floor(height * 0.018));

  ctx.save();
  ctx.font = `600 ${fontSize}px Inter, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';

  const text = '🛒 AR Product Viewer';
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;

  // Background pill
  const pillPadX = 12;
  const pillPadY = 6;
  const pillX = padding;
  const pillY = height - padding - fontSize - pillPadY * 2;
  const pillW = textWidth + pillPadX * 2;
  const pillH = fontSize + pillPadY * 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 8);
  ctx.fill();

  // Text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText(text, pillX + pillPadX, pillY + pillH - pillPadY);

  ctx.restore();
}

function _addTimestamp(ctx, width, height) {
  const padding = 16;
  const fontSize = Math.max(10, Math.floor(height * 0.014));

  ctx.save();
  ctx.font = `400 ${fontSize}px Inter, sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';

  const date = new Date();
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  ctx.fillText(`${dateStr} • ${timeStr}`, width - padding, height - padding);
  ctx.restore();
}

function _timestamp() {
  const d = new Date();
  return `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}_${d.getHours().toString().padStart(2, '0')}${d.getMinutes().toString().padStart(2, '0')}`;
}
