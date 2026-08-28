import { Hct, argbFromHex } from '@material/material-color-utilities';

/*The ramp the card is painted with, derived from the theme seed instead of authored in RGB.

  The recipe below is a SHAPE in colour space, not a colour: hue offsets measured from the seed's
  own hue, chroma multipliers, and a tone curve per mode. Feed it `#005eeb` and the card comes out
  blue-into-magenta; feed it `#4CD964` and the same wave comes out green-into-cyan. That is the whole
  point - the accent picked in ThemeModal has to reach the artwork, and it cannot if the stops are
  literals.

  The `t` positions are the ones the original presets used and are deliberately untouched: the
  stops bunched at 0.5/0.6/0.68 are a high-contrast BAND, and that band is the only reason the wave
  reads as a wave. Spread them out and the whole thing flattens into a soft gradient.*/

// Same threshold `palette.js` uses: below it HCT's hue is arbitrary, so there is no hue to sweep
// around and the card is painted in greys on purpose (the `black` and `grey` accents).
const MIN_SEED_CHROMA = 8;

// A floor, not a target. `#8E8E93`-style low-chroma accents would otherwise produce a ramp so
// washed out that the wave stops reading as one colour's artwork at all.
const CHROMA_FLOOR = 40;

const T = [0, 0.26, 0.5, 0.6, 0.68, 0.86, 1];

/*One recipe, not a menu. The card has a single look; what varies is the accent it is painted with,
  and offering five colour styles on top of ten accents only made the same artwork harder to
  recognise. This is the highest-contrast of the recipes that existed: a near-black head and a light
  band that jumps to tone 96, which is the drop that keeps the wave's edge visible even when the
  accent has very little chroma of its own.*/
export const GRADIENT_RECIPE = {
    id: 'medianoche',
    label: 'Medianoche',
    hueOffset: [-6, 6, 22, 30, 56, 84, 118],
    chromaScale: [0.8, 1.1, 1.2, 0.12, 0.9, 1.1, 0.95],
    tone: {
        light: [14, 30, 52, 96, 76, 60, 72],
        dark: [8, 22, 44, 92, 66, 50, 62],
    },
    blob: { cx: 0.88, cy: 0.42, r: 0.38, hueOffset: 96, chromaScale: 1, tone: 62 },
};

const rgbFromArgb = (argb) => [(argb >> 16) & 255, (argb >> 8) & 255, argb & 255];

const hctRgb = (hue, chroma, tone) => rgbFromArgb(Hct.from(hue, chroma, tone).toInt());

/*Turn the theme seed into the seven stops plus the radial highlight the canvas consumes.

  Returns plain RGB triplets rather than hexes because `colorAt` interpolates between them per
  pixel - about 10.500 samples per card - and parsing a string in that loop would be silly.*/
export function buildGradientStops(seedHex, mode, recipe = GRADIENT_RECIPE) {
    const seed = Hct.fromInt(argbFromHex(seedHex));
    const hasHue = seed.chroma >= MIN_SEED_CHROMA;

    // No hue means no sweep: an achromatic accent gets an achromatic card, the same call
    // `palette.js` makes when it declines to tint the neutrals toward a hue nobody chose.
    const baseChroma = hasHue ? Math.max(seed.chroma, CHROMA_FLOOR) : 0;
    const hueAt = (offset) => (hasHue ? (seed.hue + offset + 360) % 360 : 0);
    const tones = recipe.tone[mode] ?? recipe.tone.light;

    const stops = T.map((t, i) => ({
        t,
        color: hctRgb(hueAt(recipe.hueOffset[i]), baseChroma * recipe.chromaScale[i], tones[i]),
    }));

    const blob = recipe.blob;
    const accent = {
        cx: blob.cx,
        cy: blob.cy,
        r: blob.r,
        color: hctRgb(hueAt(blob.hueOffset), baseChroma * blob.chromaScale, blob.tone),
    };

    return { stops, accent };
}
