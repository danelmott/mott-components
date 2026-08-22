// The single place a Material Design 3 role name is written down.
//
// A COLOUR FAMILY is not a colour: it is the four roles that always travel together — the fill, what
// goes ON the fill, the quiet container, and what goes on the container. Every tint in the library
// is one of these seven, which is what lets a component say "primary" and derive its whole styling
// instead of restating five hardcoded pairs of its own.
const family = (fill, on, container, onContainer) => ({
    fill: `var(${fill})`,
    on: `var(${on})`,
    container: `var(${container})`,
    onContainer: `var(${onContainer})`,
});

export const FAMILIES = {
    primary: family(
        '--md-sys-color-primary', '--md-sys-color-on-primary',
        '--md-sys-color-primary-container', '--md-sys-color-on-primary-container'),
    secondary: family(
        '--md-sys-color-secondary', '--md-sys-color-on-secondary',
        '--md-sys-color-secondary-container', '--md-sys-color-on-secondary-container'),
    tertiary: family(
        '--md-sys-color-tertiary', '--md-sys-color-on-tertiary',
        '--md-sys-color-tertiary-container', '--md-sys-color-on-tertiary-container'),
    danger: family(
        '--md-sys-color-error', '--md-sys-color-on-error',
        '--md-sys-color-error-container', '--md-sys-color-on-error-container'),
    success: family(
        '--md-custom-color-success', '--md-custom-color-on-success',
        '--md-custom-color-success-container', '--md-custom-color-on-success-container'),
    warning: family(
        '--md-custom-color-warning', '--md-custom-color-on-warning',
        '--md-custom-color-warning-container', '--md-custom-color-on-warning-container'),
    // Neutral is a family like the others once you see what its high-emphasis fill is: inverting the
    // page IS how a neutral thing shouts. Its container step is the ordinary raised surface.
    neutral: family(
        '--md-sys-color-inverse-surface', '--md-sys-color-inverse-on-surface',
        '--md-sys-color-surface-container', '--md-sys-color-on-surface'),
};

export const TRANSPARENT = 'transparent';

// M3 does not ship `-hover` or `-pressed` roles. It models them as a STATE LAYER: the `on` colour of
// whatever you are touching, composited over that surface at a fixed opacity. Expressed as a
// color-mix of two roles rather than stored as a third token, which is what makes every interactive
// state follow the seed for free.
export const HOVER_OPACITY = 8;
export const PRESSED_OPACITY = 12;

export const stateLayer = (on, over, opacity = HOVER_OPACITY) =>
    `color-mix(in srgb, ${on} ${opacity}%, ${over})`;

// The three emphases, loudest first. Nothing here draws a frame: a control is told apart from the
// page by how much colour it carries, never by an edge around it.

// Filled: the family's own fill, with its `on` colour riding on top.
const filled = (name) => {
    const { fill, on } = FAMILIES[name];
    return { surface: fill, on, hover: stateLayer(on, fill) };
};

// Tonal: the quiet step of the same family. Still a surface you can see, one notch above the page.
const tonal = (name) => {
    const { container, onContainer } = FAMILIES[name];
    return { surface: container, on: onContainer, hover: stateLayer(onContainer, container) };
};

// Text: no surface at all, only a tinted label. Its state layer mixes into `transparent`, so
// whatever it happens to be sitting on shows through instead of being painted over.
const text = (name) => {
    const { fill } = FAMILIES[name];
    return { surface: TRANSPARENT, on: fill, hover: stateLayer(fill, TRANSPARENT) };
};

const CONTROL_VARIANTS = {
    primary: filled('primary'),
    secondary: filled('secondary'),
    danger: filled('danger'),
    // Keeps the name for the sake of the prop, but it is a tonal button now: a soft neutral fill
    // rather than a frame. A frame around every quiet control was what made a screen full of them
    // look busy.
    outline: tonal('neutral'),
    ghost: text('primary'),
};

export const CONTROL_NAMES = Object.keys(CONTROL_VARIANTS);

//The raw tint, or null when the name is not one of ours — which is how the icon buttons tell a
//variant apart from a bare CSS colour a caller passed in.
export const controlTint = (name) => CONTROL_VARIANTS[name] ?? null;

//A caller's own colour, dressed as a tint so it flows through the same code path. Its state layer
//has to be built from the foreground, since there is no `on` role to ask.
export const customTint = (surface, on) => ({
    surface,
    on,
    hover: stateLayer(on, surface),
});

//Turns a tint into the CSS custom properties a component spreads into `style`. This indirection is
//what keeps the Tailwind classes STATIC: Tailwind scans source text for literal class names, so a
//class assembled by interpolation would never reach the stylesheet. The values move, the class list
//does not.
export const asCustomProperties = (tint) => ({
    '--mott-surface': tint.surface,
    '--mott-on': tint.on,
    '--mott-hover': tint.hover,
});

//Badge speaks in status names rather than family names, and has two emphases: `solid` fills with the
//family, plain uses the container step. Both pairs come straight off the family, so a badge can
//never end up with a foreground that was not designed to sit on its background.
const BADGE_FAMILY = {
    neutral: 'neutral',
    info: 'primary',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
};

export const BADGE_NAMES = Object.keys(BADGE_FAMILY);

export function badgeTint(name, solid) {
    const key = BADGE_FAMILY[name];
    if (!key) return null;

    const { fill, on, container, onContainer } = FAMILIES[key];
    return solid ? { surface: fill, on } : { surface: container, on: onContainer };
}

//Where only one colour is needed - a spinner, a progress fill, a toast icon - it is always the
//family's fill. `info` is Toast's and Badge's name for the same thing Button calls `primary`.
export const ACCENTS = {
    primary: FAMILIES.primary.fill,
    info: FAMILIES.primary.fill,
    secondary: FAMILIES.secondary.fill,
    success: FAMILIES.success.fill,
    warning: FAMILIES.warning.fill,
    danger: FAMILIES.danger.fill,
};
