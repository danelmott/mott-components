import {
    Contrast,
    Hct,
    argbFromHex,
    hexFromArgb,
    customColor,
    MaterialDynamicColors,
    SchemeContent,
    SchemeMonochrome,
    SchemeNeutral,
    SchemeTonalSpot,
    SchemeVibrant,
} from '@material/material-color-utilities';


export const VARIANTS = {
    content: SchemeContent,
    monochrome: SchemeMonochrome,
    neutral: SchemeNeutral,
    tonalSpot: SchemeTonalSpot,
    vibrant: SchemeVibrant,
};

export const DEFAULT_VARIANT = 'content';
export const DEFAULT_SEED = '#000000';


/*The tone that reads on top of an arbitrary colour. M3 hands every role its `on-` partner, but a
  swatch paints a raw hex the consumer picked - there is no role to ask, so the partner has to be
  derived. Keeping hue and chroma and moving only the tone is what makes the mark look like part of
  the colour instead of stamped onto it: the check over green is a near-black green, not flat black.

  Both ends are measured and the more contrasting one wins, with no threshold in between. A rule
  like `tone >= 60` gets the middle wrong exactly where it hurts - grey #8E8E93 lands on tone 59.2
  and would be handed a white mark at 3.26:1. Measured across the ten built-in themes this never
  falls below 5.28:1, and it stays right for any hex added later, #ffffff included.

  Contrast.ratioOfTones works on L* alone, but it picks the same winner as the full WCAG ratio on
  every colour in the set, so there is no reason to compute luminance by hand here.*/
export function onColorFor(hex) {
    const argb = argbFromHex(hex);
    const tone = Hct.fromInt(argb).tone;
    const mark = Hct.fromInt(argb);

    mark.tone = Contrast.ratioOfTones(tone, 10) >= Contrast.ratioOfTones(tone, 100) ? 10 : 100;
    return hexFromArgb(mark.toInt());
}

const SPEC_VERSION = '2021';

export const SUCCESS_SEED = '#16a34a';
export const WARNING_SEED = '#d97706';

const ROLES = [
    'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer',
    'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
    'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
    'error', 'onError', 'errorContainer', 'onErrorContainer',
    'background', 'onBackground',
    'surface', 'onSurface', 'surfaceVariant', 'onSurfaceVariant',
    'outline', 'outlineVariant', 'shadow', 'scrim',
    'inverseSurface', 'inverseOnSurface', 'inversePrimary',
    'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer',
    'surfaceContainerHigh', 'surfaceContainerHighest',
];

// The roles M3 deliberately keeps near-grey: pages, cards, body text, edges. The accent families are
// absent because they already carry the seed's hue at full strength.
const TINTED_ROLES = new Set([
    'background', 'onBackground',
    'surface', 'onSurface', 'surfaceVariant', 'onSurfaceVariant',
    'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer',
    'surfaceContainerHigh', 'surfaceContainerHighest',
    'outline', 'outlineVariant',
    'inverseSurface', 'inverseOnSurface',
]);


export const DEFAULT_TINT = 16;

const MIN_SEED_CHROMA = 8;

const pushTint = (argb, hue, chroma) => {
    const hct = Hct.fromInt(argb);
    return Hct.from(hue, Math.max(hct.chroma, chroma), hct.tone).toInt();
};


const kebab = (role) => role.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

export function buildPalette(seedHex, mode, variant = DEFAULT_VARIANT, tint = DEFAULT_TINT) {
    const argb = argbFromHex(seedHex);
    const seed = Hct.fromInt(argb);
    const Scheme = VARIANTS[variant] ?? VARIANTS[DEFAULT_VARIANT];
    const scheme = new Scheme(seed, mode === 'dark', 0, SPEC_VERSION);

    const hasHue = seed.chroma >= MIN_SEED_CHROMA;
    const tintChroma = hasHue ? tint : 0;

    const tokens = {};

    for (const role of ROLES) {
        const value = MaterialDynamicColors[role].getArgb(scheme);
        const tinted = tintChroma && TINTED_ROLES.has(role)
            ? pushTint(value, seed.hue, tintChroma)
            : value;

        tokens[`--md-sys-color-${kebab(role)}`] = hexFromArgb(tinted);
    }

    for (const [name, seed] of [['success', SUCCESS_SEED], ['warning', WARNING_SEED]]) {
        // `blend` harmonises the fixed green/orange toward the seed's hue - Material caps the rotation
        // at 15 degrees, so success still reads as green while belonging to the theme. Without it the
        // semantic colours are the one thing in the palette that ignores the accent.
        //
        // Guarded by `hasHue` for the same reason the tint is: below MIN_SEED_CHROMA the hue HCT
        // reports is arbitrary, and harmonising toward it drags the green somewhere nobody chose -
        // measured, black lands on an olive #336b00 and grey on a teal #006c4b. A greyscale theme
        // has no hue to belong to, so its semantic colours are left exactly as they were authored.
        const colors = customColor(argb, { name, value: argbFromHex(seed), blend: hasHue })[mode];

        tokens[`--md-custom-color-${name}`] = hexFromArgb(colors.color);
        tokens[`--md-custom-color-on-${name}`] = hexFromArgb(colors.onColor);
        tokens[`--md-custom-color-${name}-container`] = hexFromArgb(colors.colorContainer);
        tokens[`--md-custom-color-on-${name}-container`] = hexFromArgb(colors.onColorContainer);
    }

    return tokens;
}
