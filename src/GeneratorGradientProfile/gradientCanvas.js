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

/*Lado de un "pixel" del dither, en los px logicos de la tarjeta. La mitad de lo que era (5): el
  canvas ya no se rasteriza al tamano de la tarjeta y se estira, sino por encima de la resolucion de
  pantalla (ver `SUPERSAMPLE` en GeneratorGradientProfile.jsx), asi que el grano se puede permitir
  ser mas fino sin convertirse en una papilla al escalar. 440/2.5 y 600/2.5 dan celdas exactas: la
  rejilla no cae a mitad de pixel y no hay costuras que tapar.*/
const PIXEL = 2.5;
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
  recibe el ctx y no un ancho de caracter estimado: el nombre y el correo se pintan a 900 40px, y a
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

/*Baja el cuerpo de letra hasta que el texto quepa, y solo entonces se recorta. Al reves - recortar
  siempre al mismo tamano - un correo normal se quedaba en la mitad y con puntos suspensivos, que es
  peor que verlo un poco mas pequeno: el dato esta ahi para leerse. El suelo existe porque por debajo
  de el la linea deja de leerse como el valor y empieza a competir con su propia etiqueta.

  Deja la fuente PUESTA en el contexto: quien llama despues mide y pinta con la que quepa.*/
function fitFont(ctx, text, maxWidth, { weight, from, to, step = 2 }) {
    let size = from;
    for (; size > to; size -= step) {
        ctx.font = `${weight} ${size}px system-ui, sans-serif`;
        if (ctx.measureText(text).width <= maxWidth) return size;
    }
    ctx.font = `${weight} ${size}px system-ui, sans-serif`;
    return size;
}

/*Un correo se recorta por el MEDIO, no por el final. Cortando por el final lo primero que se pierde
  es el dominio, que es justo la mitad que dice de que cuenta se trata - "mantillapalomin..." no
  identifica nada, "mantilla...@gmail.com" si. Se come el nombre de usuario, que es la parte que
  admite perder letras y seguir reconociendose.

  Si ni el dominio solo cabe, no hay recorte por el medio que salve nada y se cae al de siempre.*/
function ellipsizeEmail(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;

    const at = text.lastIndexOf('@');
    if (at <= 0 || ctx.measureText(`…${text.slice(at)}`).width > maxWidth) {
        return ellipsize(ctx, text, maxWidth);
    }

    const domain = text.slice(at);
    let local = text.slice(0, at);
    while (local.length > 1 && ctx.measureText(`${local}…${domain}`).width > maxWidth) {
        local = local.slice(0, -1);
    }
    return `${local}…${domain}`;
}

/*The card: artwork, a scrim over the bottom half, and the identity block.

  The text is white and the scrim is a fixed near-black on purpose. It sits on the ARTWORK, not on a
  theme surface, so `--md-sys-color-on-surface` would be the wrong answer - it would go dark the
  moment the app switches to light mode and vanish into a gradient that did not change with it. The
  scrim is what guarantees the contrast, whatever the accent.*/
export function drawCard(ctx, { name, email, ramp }) {
    const W = CARD_W;
    const H = CARD_H;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    roundRectPath(ctx, 0, 0, W, H, RADIUS);
    ctx.clip();

    drawDither(ctx, W, H, ramp);

    // Arranca mucho antes que el bloque de texto (que ahora vive centrado, no pegado al fondo) para
    // que el scrim ya este dando contraste cuando el texto empieza, y sigue oscureciendo hasta el
    // badge del footer, que se queda donde siempre.
    const scrim = ctx.createLinearGradient(0, H * 0.1, 0, H);
    scrim.addColorStop(0, 'rgba(8,9,7,0)');
    scrim.addColorStop(1, 'rgba(8,9,7,0.88)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, H * 0.1, W, H * 0.9);

    const textX = 28;
    // Centrado vertical del bloque de 4 lineas (label+valor x2): el badge de abajo no se mueve.
    // El bloque crecio otra vez (18/40px) asi que el espaciado entre lineas crece con el, y el
    // arranque sube la mitad de lo que crecio el bloque entero para seguir centrado.
    let ty = H / 2 - 68;
    const LINE = 44;

    ctx.textBaseline = 'alphabetic';

    /*`letterSpacing` va ANTES de cada `fillText` y, sobre todo, antes de `ellipsize`: `measureText`
      ya cuenta el tracking, asi que si se pusiera despues el recorte mediria contra un ancho que no
      es el que se termina pintando. Donde el motor no lo soporte, la asignacion se ignora sola.*/
    const LABEL_FONT = '700 18px system-ui, sans-serif';
    // el valor arranca en 40 y baja de dos en dos hasta 28 si hace falta (ver `fitFont`)
    const VALUE_FIT = { weight: 900, from: 40, to: 28 };

    // el mismo ancho útil para los dos campos: el bloque de identidad es una columna, no dos anchos
    const maxWidth = W - textX - 32;
    const emailText = email || ' ';
    const nameText = name || ' ';

    /*Un solo cuerpo de letra para los dos valores. Ajustando cada uno por su cuenta el nombre - casi
      siempre mas corto - se quedaba en 40px mientras el correo bajaba a 28, y el bloque se leia como
      dos jerarquias distintas cuando es una sola: la identidad. Manda el que menos aguanta.*/
    ctx.letterSpacing = '0.01em'; // el tracking del valor, puesto antes de medir (ver nota arriba)
    const VALUE_SIZE = Math.min(
        fitFont(ctx, emailText, maxWidth, VALUE_FIT),
        fitFont(ctx, nameText, maxWidth, VALUE_FIT)
    );
    const VALUE_FONT = `${VALUE_FIT.weight} ${VALUE_SIZE}px system-ui, sans-serif`;

    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = LABEL_FONT;
    ctx.letterSpacing = '0.04em';
    ctx.fillText('Correo', textX, ty);

    ty += LINE;
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '0.01em';
    ctx.font = VALUE_FONT;
    ctx.fillText(ellipsizeEmail(ctx, emailText, maxWidth), textX, ty);

    ty += LINE;
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = LABEL_FONT;
    ctx.letterSpacing = '0.04em';
    ctx.fillText('Nombre', textX, ty);

    ty += LINE;
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '0.01em';
    ctx.font = VALUE_FONT;
    ctx.fillText(ellipsize(ctx, nameText, maxWidth), textX, ty);

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

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '700 18px system-ui, sans-serif';
    ctx.letterSpacing = '0.02em';
    ctx.fillText('Correo verificado', textX + 30, footerY + 6);

    ctx.restore();
}
