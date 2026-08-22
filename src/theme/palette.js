import {
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

// How a seed colour is turned into a palette. A seed alone is not enough to know what someone wants
// from it: `#000000` has no hue at all, so a scheme that insists on finding one invents a colour
// nobody asked for (it lands on a wine red). The variant is what says "this seed means grey".
export const VARIANTS = {
    // Keeps the source colour rather than reinterpreting it — the right default when the seed IS the
    // accent someone picked, not a hint to be harmonised away.
    content: SchemeContent,
    // Ignores the seed's hue outright and builds a true greyscale. Any seed gives the same palette.
    monochrome: SchemeMonochrome,
    // Barely-there hue: a grey that leans warm or cool depending on the seed.
    neutral: SchemeNeutral,
    // The M3 default. Deliberately muted, so it harmonises at the cost of drifting off the seed.
    tonalSpot: SchemeTonalSpot,
    // Pushes chroma as far as the tone allows.
    vibrant: SchemeVibrant,
};

export const DEFAULT_VARIANT = 'content';
export const DEFAULT_SEED = '#005eeb';

// Pinned on purpose. The library's own default is '2025', a newer colour spec that shifts every
// value; leaving it unpinned would mean a routine dependency bump silently repaints the whole app.
const SPEC_VERSION = '2021';

// M3 has no `success` or `warning` role — its status vocabulary stops at `error`. These two go
// through the library's custom-colour API, which builds a full four-token group for each.
//
// `blend: false` on purpose: blending harmonises a custom colour toward the seed, which is right for
// brand accents and wrong here. A success that drifts pink when the seed is pink stops reading as
// "success" — these two have to stay recognisably green and amber whatever the seed is.
export const SUCCESS_SEED = '#16a34a';
export const WARNING_SEED = '#d97706';

// The 29 classic roles, plus the five surface containers. Both come off the same scheme now; the
// containers used to be read tone by tone from the neutral palette because the older API did not
// expose them.
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

// `primaryContainer` -> `primary-container`. Splitting on the lower->upper boundary rather than on
// every capital keeps a run of digits attached to the word it belongs to.
// `toLowerCase` and never `toLocaleLowerCase`: the locale-aware one maps `I` to a dotless `ı` under
// a Turkish locale, emitting a custom property no stylesheet can ever match.
const kebab = (role) => role.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

//The single source of truth for the token set. Both consumers go through it, which is what keeps
//them from drifting: `scripts/generateTheme.js` bakes the default palette into globals.css at build
//time, and ThemeProvider re-runs it in the browser whenever the seed, the mode or the variant
//changes. A token added here shows up in both without further work.
//
//Returns a flat `{ '--md-sys-color-primary': '#0048b8', … }` map for one mode.
export function buildPalette(seedHex, mode, variant = DEFAULT_VARIANT) {
    const argb = argbFromHex(seedHex);
    const Scheme = VARIANTS[variant] ?? VARIANTS[DEFAULT_VARIANT];
    // the third argument is the contrast level: 0 is standard, and the only one exposed for now
    const scheme = new Scheme(Hct.fromInt(argb), mode === 'dark', 0, SPEC_VERSION);

    const tokens = {};

    for (const role of ROLES) {
        tokens[`--md-sys-color-${kebab(role)}`] = hexFromArgb(MaterialDynamicColors[role].getArgb(scheme));
    }

    for (const [name, seed] of [['success', SUCCESS_SEED], ['warning', WARNING_SEED]]) {
        const colors = customColor(argb, { name, value: argbFromHex(seed), blend: false })[mode];

        tokens[`--md-custom-color-${name}`] = hexFromArgb(colors.color);
        tokens[`--md-custom-color-on-${name}`] = hexFromArgb(colors.onColor);
        tokens[`--md-custom-color-${name}-container`] = hexFromArgb(colors.colorContainer);
        tokens[`--md-custom-color-on-${name}-container`] = hexFromArgb(colors.onColorContainer);
    }

    return tokens;
}
