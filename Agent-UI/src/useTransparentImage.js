import { useState, useEffect } from 'react';

// Cache processed transparent cutouts to avoid redoing the expensive
// per-pixel canvas work on every mount (and in React dev StrictMode).
const cutoutCache = new Map();

/**
 * Removes a background color from an image and returns a data-URL
 * with that color range made transparent.
 *
 * @param {string} src            – image path
 * @param {string} bgColorHex    – hex color of the background to REMOVE  (the actual BG in the PNG)
 * @param {number} tolerance     – how far from bgColorHex a pixel can be and still be removed
 */
export function useTransparentImage(src, bgColorHex = '#242424', tolerance = 50) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    if (!src) return;

    const cacheKey = `${src}|${bgColorHex}|${tolerance}`;
    const cached = cutoutCache.get(cacheKey);
    if (cached) {
      // Avoid synchronous setState within the effect body (eslint react-hooks rule).
      Promise.resolve().then(() => setDataUrl(cached));
      return;
    }

    let cancelled = false;
    const img = new Image();
    // Only set crossOrigin when loading from another origin.
    if (/^https?:\/\//i.test(src)) img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const hexToRgb = (hex) => {
        const bigint = parseInt(hex.replace('#', ''), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
      };
      const [bgR, bgG, bgB] = hexToRgb(bgColorHex);
      const isMagenta = bgColorHex.toUpperCase() === '#FF00FF';

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const dr = r - bgR, dg = g - bgG, db = b - bgB;
        const dist2 = dr * dr + dg * dg + db * db;

        // --- EXTREME CHROMA KEY FOR MAGENTA ---
        if (isMagenta) {
          // Magenta is G-suppressed. Bias = how much (R+B) dominates G.
          const magentaBias = (r + b) / 2 - g;
          const dist = Math.sqrt(dist2);

          // If it's even slightly magenta-ish or close to the target color
          if (magentaBias > 30 || dist < 140) {
            // Hard cut for the majority of the background
            if (magentaBias > 50 || dist < 100) {
              data[i + 3] = 0;
            } else {
              // Very sharp transition band (width 5 instead of 15)
              const alpha = Math.min(255, Math.max(0, (dist - 100) * 51));
              data[i + 3] = alpha;

              // HEAVY DESPILL: Force edge pixels toward neutral grey/white
              // This kills the 'pink halo' on the white coat.
              if (alpha < 240) {
                const lum = (r * 0.299 + g * 0.587 + b * 0.114);
                data[i] = (r + lum) / 2;
                data[i + 1] = (g + lum) / 2;
                data[i + 2] = (b + lum) / 2;

                // Final squeeze: if it's still pink, kill it
                if (data[i] > data[i + 1] * 1.2 && data[i + 2] > data[i + 1] * 1.2) {
                  data[i + 3] = Math.max(0, data[i + 3] - 100);
                }
              }
            }
          }
        } else {
          // Classic RGB distance
          const tol2 = tolerance * tolerance;
          const edge2 = (tolerance + 35) * (tolerance + 35);
          if (dist2 < tol2) {
            data[i + 3] = 0;
          } else if (dist2 < edge2) {
            const d = Math.sqrt(dist2);
            data[i + 3] = Math.floor(((d - tolerance) / 35) * 255);
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);

      let out;
      try {
        out = canvas.toDataURL('image/webp', 0.85);
      } catch {
        out = canvas.toDataURL('image/png');
      }

      if (!cancelled) {
        cutoutCache.set(cacheKey, out);
        setDataUrl(out);
      }
    };
    // Cache buster to force fresh canvas processing
    img.src = src + (src.includes('?') ? '&' : '?') + 't=' + Date.now();
    return () => {
      cancelled = true;
    };
  }, [src, bgColorHex, tolerance]);

  return dataUrl;
}
