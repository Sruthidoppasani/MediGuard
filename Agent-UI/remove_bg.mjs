import sharp from 'sharp';
import path from 'path';

const PUBLIC = path.resolve('public');

const files = [
    { src: 'agent_doctor_welcome_magenta.png', out: 'agent_doctor_welcome_clean.png' },
    { src: 'agent_doctor_multitasking_magenta.png', out: 'agent_doctor_multitasking_clean.png' },
    { src: 'agent_doctor_standing_magenta.png', out: 'agent_doctor_standing_clean.png' },
];

// Magenta target: R=255, G=0, B=255
const BG_R = 255, BG_G = 0, BG_B = 255;

async function processImage(srcFile, outFile) {
    const inputPath = path.join(PUBLIC, srcFile);
    const outputPath = path.join(PUBLIC, outFile);

    const image = sharp(inputPath).ensureAlpha();
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    const { width, height } = info;

    console.log(`Processing ${srcFile}: ${width}x${height}`);

    const pixels = Buffer.from(data); // mutable copy

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];

        // Euclidean distance from magenta
        const dr = r - BG_R, dg = g - BG_G, db = b - BG_B;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        // Magenta bias: how much (R+B) dominates G
        const magentaBias = (r + b) / 2 - g;

        // --- HARD CUT: pure magenta and nearby shades ---
        if (dist < 100 || magentaBias > 55) {
            pixels[i + 3] = 0; // fully transparent
            continue;
        }

        // --- TRANSITION BAND: edge feathering ---
        if (dist < 160 && magentaBias > 20) {
            // Map distance 100-160 to alpha 0-255
            const alpha = Math.min(255, Math.max(0, Math.round(((dist - 100) / 60) * 255)));
            pixels[i + 3] = alpha;

            // Despill: remove pink tint from semi-transparent edge pixels
            if (alpha < 230) {
                const lum = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
                pixels[i] = Math.round((r + lum) / 2);
                pixels[i + 1] = Math.round((g + lum) / 2);
                pixels[i + 2] = Math.round((b + lum) / 2);

                // Final check: if still pinkish, squeeze harder
                if (pixels[i] > pixels[i + 1] * 1.3 && pixels[i + 2] > pixels[i + 1] * 1.3) {
                    pixels[i + 3] = Math.max(0, alpha - 80);
                }
            }
            continue;
        }
        // Otherwise keep the pixel as-is (character body)
    }

    await sharp(pixels, { raw: { width, height, channels: 4 } })
        .png({ compressionLevel: 6 })
        .toFile(outputPath);

    console.log('Saved: ' + outputPath);
}

(async () => {
    for (const f of files) {
        await processImage(f.src, f.out);
    }
    console.log('All images processed successfully!');
})();
