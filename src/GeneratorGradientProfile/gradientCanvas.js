/*The drawing engine for the profile card: a colour ramp swept by a diagonal wave, quantised through
  an ordered Bayer dither. Pure - no React, no DOM beyond the 2D context it is handed - so the same
  code paints the on-screen canvas and the exported PNG.

  The colours arrive already built (see `buildGradientStops` in gradientPalette.js). This file only
  knows about SHAPE.*/

// The card's logical size. Fixed rather than a prop: the text block below is laid out in measured
// pixels against these numbers. The canvas is still scaled responsively by CSS.
export const CARD_W = 440;
export const CARD_H = 600;

// Ordered thresholds - the reason the pattern reads as a halftone grid and not as noise.
const BAYER8 = [
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21],
];

const PIXEL = 5;   // side of one dithered "pixel"
const LEVELS = 5;  // steps per channel: fewer steps, more visible dithering
const RADIUS = 30;

function roundRectPath(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
}

/*Position along the wave: a diagonal projection bent by two superimposed sines.

  The phases used to come from a `seed` the user could reroll, which meant the card's shape changed
  under them. The shape is part of the design, not a variable, so both phases are frozen here at the
  values that produce the reference wave. Changing a recipe changes the COLOUR; the form is constant
  across all five, which is exactly how you can tell they are the same artwork recoloured.*/
function waveT(u, v) {
    let t = u * 0.52 + v * 0.78;
    t +=
        Math.sin((u * 3.2 + 1.2) * Math.PI) * 0.13 +
        Math.sin((v * 5.0 - u * 2.4 + 2.7) * Math.PI) * 0.075;
    return t / 1.3;
}

function smoothstep(t) {
    return t * t * (3 - 2 * t);
}

function colorAt(u, v, ramp) {
    const t = Math.min(1, Math.max(0, waveT(u, v)));

    const stops = ramp.stops;
    let i = 0;
    while (i < stops.length - 2 && t > stops[i + 1].t) i++;
    const s0 = stops[i];
    const s1 = stops[i + 1];
    const span = s1.t - s0.t || 1;
    const lt = smoothstep(Math.min(1, Math.max(0, (t - s0.t) / span)));

    let r = s0.color[0] + (s1.color[0] - s0.color[0]) * lt;
    let g = s0.color[1] + (s1.color[1] - s0.color[1]) * lt;
    let b = s0.color[2] + (s1.color[2] - s0.color[2]) * lt;

    const a = ramp.accent;
    if (a) {
        const d = Math.hypot(u - a.cx, v - a.cy) / a.r;
        const w = Math.max(0, 1 - d);
        const w2 = w * w * 0.75;
        r += (a.color[0] - r) * w2;
        g += (a.color[1] - g) * w2;
        b += (a.color[2] - b) * w2;
    }
    return [r, g, b];
}

/*Every cell of the grid is filled, so coverage is total: the white specks are white PIXELS of the
  pattern, never gaps showing the background through.*/
function drawDither(ctx, w, h, ramp) {
    const cols = Math.ceil(w / PIXEL);
    const rows = Math.ceil(h / PIXEL);
    const step = 255 / (LEVELS - 1);

    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            const u = i / (cols - 1);
            const v = j / (rows - 1);
            const c = colorAt(u, v, ramp);

            // the ordered threshold decides which way each channel rounds, which is what mixes
            // neighbouring cells into a tone the palette does not actually contain
            const thr = (BAYER8[j & 7][i & 7] + 0.5) / 64 - 0.5;

            const out = [0, 0, 0];
            for (let k = 0; k < 3; k++) {
                const q = Math.round(c[k] / step + thr * 0.9) * step;
                out[k] = Math.min(255, Math.max(0, q));
            }

            ctx.fillStyle = `rgb(${out[0] | 0},${out[1] | 0},${out[2] | 0})`;
            ctx.fillRect(i * PIXEL, j * PIXEL, PIXEL, PIXEL);
        }
    }
}

/*Recorte con puntos suspensivos, medido contra la fuente que YA está puesta en el contexto - por eso
  recibe el ctx y no un ancho de caracter estimado: el nombre y el correo se pintan a 800 26px, y a
  ese peso una "m" y una "i" no miden ni parecido, así que cortar por cantidad de letras dejaría unos
  textos cortos y otros desbordados.

  Los puntos entran en la medida, no se pegan después: agregarlos a un texto que ya llenaba el ancho
  vuelve a desbordar justo lo que mide el "…". */
function ellipsize(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;

    let cut = text;
    while (cut.length > 0 && ctx.measureText(cut.trimEnd() + '…').width > maxWidth) {
        cut = cut.slice(0, -1);
    }
    return cut.trimEnd() + '…';
}

/*The card: artwork, a scrim over the bottom half, and the identity block.

  The text is white and the scrim is a fixed near-black on purpose. It sits on the ARTWORK, not on a
  theme surface, so `--md-sys-color-on-surface` would be the wrong answer - it would go dark the
  moment the app switches to light mode and vanish into a gradient that did not change with it. The
  scrim is what guarantees the contrast, whatever the accent.*/
export function drawCard(ctx, { name, email, ramp, verifiedLabel }) {
    const W = CARD_W;
    const H = CARD_H;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    roundRectPath(ctx, 0, 0, W, H, RADIUS);
    ctx.clip();

    drawDither(ctx, W, H, ramp);

    const scrim = ctx.createLinearGradient(0, H * 0.5, 0, H);
    scrim.addColorStop(0, 'rgba(8,9,7,0)');
    scrim.addColorStop(1, 'rgba(8,9,7,0.72)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, H * 0.5, W, H * 0.5);

    const textX = 28;
    let ty = H - 168;

    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.fillText('Correo', textX, ty);

    ty += 32;
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 26px system-ui, sans-serif';
    // el mismo ancho útil para los dos campos: el bloque de identidad es una columna, no dos anchos
    const maxWidth = W - textX - 32;
    ctx.fillText(ellipsize(ctx, email || ' ', maxWidth), textX, ty);

    ty += 32;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.fillText('Nombre', textX, ty);

    ty += 32;
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 26px system-ui, sans-serif';
    ctx.fillText(ellipsize(ctx, name || ' ', maxWidth), textX, ty);

    const footerY = H - 34;
    ctx.beginPath();
    ctx.arc(textX + 11, footerY, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#12140f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(textX + 5, footerY);
    ctx.lineTo(textX + 9, footerY + 4);
    ctx.lineTo(textX + 17, footerY - 5);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '700 14px system-ui, sans-serif';
    ctx.fillText(verifiedLabel, textX + 30, footerY + 5);

    ctx.restore();
}
