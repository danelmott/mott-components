
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
    neutral: family(
        '--md-sys-color-inverse-surface', '--md-sys-color-inverse-on-surface',
        '--md-sys-color-surface-container', '--md-sys-color-on-surface'),
};

export const TRANSPARENT = 'transparent';


// A tint is only ever `{ surface, on }` - the two colours a control actually paints. There is no
// `hover` here on purpose: the state layer is `currentColor` at 8% in the stylesheet, which is the
// same thing the Material 3 spec asks for and needs no colour of its own to be computed in JS.
const filled = (name) => {
    const { fill, on } = FAMILIES[name];
    return { surface: fill, on };
};

// Tonal: the quiet step of the same family. Still a surface you can see, one notch above the page.
const tonal = (name) => {
    const { container, onContainer } = FAMILIES[name];
    return { surface: container, on: onContainer };
};

// Text: no surface at all, only a tinted label. Because the state layer is `currentColor`, hovering
// one of these tints whatever it happens to be sitting on instead of painting a box over it.
const text = (name) => {
    const { fill } = FAMILIES[name];
    return { surface: TRANSPARENT, on: fill };
};

// What a control MEANS, never how it is painted. Every intent maps to a family of the palette, so a
// change of seed or of mode repaints all of them at once and none of them can drift out of the
// system - which is the whole point of naming them this way instead of taking a colour from the dev.
const CONTROL_FAMILY = {
    default: 'neutral',    // carries no weight of its own - Cancel, Back
    action: 'primary',     // the one thing the screen is for - Save, Send
    support: 'secondary',  // helps the main action without competing with it
    danger: 'danger',      // destructive - Delete, Revoke
    success: 'success',    // confirms something that went right - Approve
    warning: 'warning',    // caution that does not destroy - Archive, Suspend
};

// `ghost` is the one value that is emphasis rather than intent: no surface at all, just a label.
export const CONTROL_NAMES = [...Object.keys(CONTROL_FAMILY), 'ghost'];

// `quiet` swaps the pair, not the family: `danger` goes from `error`/`on-error` to
// `error-container`/`on-error-container`. Both pairs are the same red and both are contrast-checked
// by Material, so a quiet button still reads as its own intent - it just stops shouting. That is
// what lets a destructive action sit inside a menu without stealing the screen.
export const controlTint = (name, quiet = false) => {
    // no surface to soften, so `quiet` has nothing to do here
    if (name === 'ghost') return text('primary');

    const key = CONTROL_FAMILY[name];
    if (!key) return null;

    // the neutral's filled step is the *inverted* surface - a dark chip on a light page. That is an
    // emphasis of its own, not a resting button, so `default` stays tonal whether quiet or not.
    if (key === 'neutral') return tonal('neutral');

    return quiet ? tonal(key) : filled(key);
};


const SELECTION_FAMILY = {
    default: 'secondary',
    action: 'primary',
    support: 'secondary',
    danger: 'danger',
    success: 'success',
    warning: 'warning',
    ghost: 'secondary',
};

export const selectionTint = (name) => tonal(SELECTION_FAMILY[name] ?? 'secondary');


export const ACCENTS = {
    primary: FAMILIES.primary.fill,
    info: FAMILIES.primary.fill,
    secondary: FAMILIES.secondary.fill,
    success: FAMILIES.success.fill,
    warning: FAMILIES.warning.fill,
    danger: FAMILIES.danger.fill,
};

// The other half of ACCENTS - for each of those fills, the colour Material already contrast-checked
// against it. A decorative surface that carries something on top (a Shape with an icon or a letter
// inside) reads from here, so the consumer never has to pick a readable colour by hand. Keyed the
// same as ACCENTS on purpose: whatever `color` resolves to a surface up there resolves to its
// counterpart down here.
export const ACCENT_ON = {
    primary: FAMILIES.primary.on,
    info: FAMILIES.primary.on,
    secondary: FAMILIES.secondary.on,
    success: FAMILIES.success.on,
    warning: FAMILIES.warning.on,
    danger: FAMILIES.danger.on,
};
