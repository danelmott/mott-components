import { CONTROL_NAMES, ACCENTS } from '../theme/roles.js';
import { SHAPE_NAMES, SCALLOPED_SHAPES } from '../shapes/shapePaths.js';
import { TYPESCALE_ROLES } from '../text/text.jsx';

const prefixLog = '[MOTT-COMPONENTS]';


const show = (value) => (typeof value === 'string' ? `"${value}"` : String(value));

const fail = (component, message) => {
    throw new TypeError(`${prefixLog} <${component}>: ${message}`);
};

const warn = (component, message) => {
    console.error(`${prefixLog} <${component}>: ${message}`);
};

function assertType(component, prop, value, expected) {
    if (value === undefined || value === null) return;
    if (typeof value !== expected) {
        fail(component, `\`${prop}\` must be a ${expected}, received ${typeof value} (${show(value)}).`);
    }
}

function assertRequired(component, prop, value) {
    if (value === undefined || value === null) {
        fail(component, `missing required prop \`${prop}\`.`);
    }
}

function assertRange(component, prop, value, min, max) {
    if (value === undefined || value === null) return;
    assertType(component, prop, value, 'number');
    if (Number.isNaN(value) || value < min || value > max) {
        fail(component, `\`${prop}\` must be a number between ${min} and ${max}, received ${show(value)}.`);
    }
}

function assertOneOf(component, prop, value, allowed, fallback) {
    if (value === undefined || value === null) return;
    if (!allowed.includes(value)) {
        warn(
            component,
            `invalid \`${prop}\`: ${show(value)}. Valid values: ${allowed.join(', ')}.` +
            (fallback !== undefined ? ` Falling back to ${show(fallback)}.` : '')
        );
    }
}

function assertArrayOf(component, prop, value, validateItem) {
    if (value === undefined || value === null) return;
    if (!Array.isArray(value)) {
        fail(component, `\`${prop}\` must be an array, received ${typeof value}.`);
    }
    value.forEach((item, i) => validateItem(item, `${prop}[${i}]`));
}

// both a useRef object and a callback ref are valid — components support either
function assertRef(component, prop, value) {
    if (value === undefined || value === null) return;
    if (typeof value === 'function') return;
    if (typeof value !== 'object' || !('current' in value)) {
        fail(component, `\`${prop}\` must be a ref (useRef or callback), received ${show(value)}.`);
    }
}

function assertIconLike(component, prop, value) {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' || typeof value === 'object') return;
    fail(component, `\`${prop}\` must be an icon name (string) or a React node, received ${typeof value}.`);
}

function assertNode(component, prop, value) {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'object') return;
    fail(component, `\`${prop}\` must be text or a React node, received ${typeof value}.`);
}

function assertPlainObject(component, prop, value) {
    if (value === undefined || value === null) return;
    if (typeof value !== 'object' || Array.isArray(value)) {
        fail(component, `\`${prop}\` must be an object, received ${Array.isArray(value) ? 'array' : typeof value}.`);
    }
}



const CONTROL_SIZES = ['sm', 'md', 'lg'];
const BUTTON_TYPES = ['button', 'submit', 'reset'];
const TOAST_VARIANTS = ['info', 'success', 'warning', 'danger'];
const INPUT_TYPES = ['text', 'number', 'password'];

export function verifyTypesInput({ label, placeholder, type } = {}) {
    assertType('Input', 'label', label, 'string');
    assertType('Input', 'placeholder', placeholder, 'string');
    assertOneOf('Input', 'type', type, INPUT_TYPES, 'text');
    return true;
}

export function verifyTypesTextarea({ label, placeholder, width, height } = {}) {
    assertType('Textarea', 'label', label, 'string');
    assertType('Textarea', 'placeholder', placeholder, 'string');
    assertType('Textarea', 'width', width, 'string');
    assertType('Textarea', 'height', height, 'string');
    return true;
}

export function verifyTypesSearch({ label, placeholder, delay, onSearch, onChange, value, defaultValue } = {}) {
    assertType('Search', 'label', label, 'string');
    assertType('Search', 'placeholder', placeholder, 'string');
    assertType('Search', 'value', value, 'string');
    assertType('Search', 'defaultValue', defaultValue, 'string');
    assertType('Search', 'onSearch', onSearch, 'function');
    assertType('Search', 'onChange', onChange, 'function');
    // upper bound catches a delay passed in seconds by mistake (delay={0.4} debounces nothing)
    assertRange('Search', 'delay', delay, 0, 60000);
    return true;
}

export function verifyTypesButton({ variant, quiet, shape, iconOnly, fullWidth, type } = {}) {
    assertOneOf('Button', 'variant', variant, CONTROL_NAMES, 'default');
    assertOneOf('Button', 'shape', shape, ['rounded', 'pill'], 'rounded');
    assertOneOf('Button', 'type', type, BUTTON_TYPES, 'button');
    assertType('Button', 'quiet', quiet, 'boolean');
    assertType('Button', 'iconOnly', iconOnly, 'boolean');
    assertType('Button', 'fullWidth', fullWidth, 'boolean');
    return true;
}

export function verifyTypesIconButton(component, { icon, variant, quiet, size, type } = {}) {
    assertRequired(component, 'icon', icon);
    assertType(component, 'icon', icon, 'string');
    // an intent from the palette, never a colour: there is no way to hand this component one
    assertOneOf(component, 'variant', variant, CONTROL_NAMES, 'action');
    assertOneOf(component, 'size', size, CONTROL_SIZES, 'md');
    assertOneOf(component, 'type', type, BUTTON_TYPES, 'button');
    assertType(component, 'quiet', quiet, 'boolean');
    return true;
}

export function verifyTypesButtonGroup({ buttons, vertical, variant, allowDeselect, onChange, value, defaultSelected } = {}) {
    assertRequired('ButtonGroup', 'buttons', buttons);
    assertArrayOf('ButtonGroup', 'buttons', buttons, (item, path) => {
        assertPlainObject('ButtonGroup', path, item);
        if (!item) return;
        assertIconLike('ButtonGroup', `${path}.icon`, item.icon);
        assertType('ButtonGroup', `${path}.label`, item.label, 'string');
        assertType('ButtonGroup', `${path}.ariaLabel`, item.ariaLabel, 'string');
        assertRef('ButtonGroup', `${path}.buttonRef`, item.buttonRef);
        if (item.icon === undefined && item.label === undefined) {
            warn('ButtonGroup', `${path} has no \`icon\` or \`label\`: it will render empty.`);
        }
    });
    assertType('ButtonGroup', 'vertical', vertical, 'boolean');
    assertType('ButtonGroup', 'allowDeselect', allowDeselect, 'boolean');
    assertOneOf('ButtonGroup', 'variant', variant, CONTROL_NAMES, 'support');
    assertType('ButtonGroup', 'onChange', onChange, 'function');
    assertType('ButtonGroup', 'value', value, 'number');
    assertType('ButtonGroup', 'defaultSelected', defaultSelected, 'number');
    return true;
}

export function verifyTypesIcon({ name, size, filled, weight, grade, opticalSize } = {}) {
    assertType('Icon', 'name', name, 'string');
    // `size` takes a token (sm/md/lg/xl) or any CSS length — see SIZE_TOKEN in icon.jsx
    assertType('Icon', 'size', size, 'string');
    assertType('Icon', 'filled', filled, 'boolean');
    assertRange('Icon', 'weight', weight, 100, 700);
    assertRange('Icon', 'grade', grade, -50, 200);
    assertRange('Icon', 'opticalSize', opticalSize, 20, 48);
    return true;
}

export function verifyTypesShape({ name, size, color, contentColor, points, rotate, label } = {}) {
    assertRequired('Shape', 'name', name);
    assertOneOf('Shape', 'name', name, SHAPE_NAMES);
    assertType('Shape', 'size', size, 'string');
    assertType('Shape', 'color', color, 'string');
    assertType('Shape', 'contentColor', contentColor, 'string');
    assertType('Shape', 'label', label, 'string');
    assertRange('Shape', 'points', points, 3, 24);
    assertRange('Shape', 'rotate', rotate, -360, 360);

    if (typeof color === 'string' && !ACCENTS[color] && CONTROL_NAMES.includes(color)) {
        warn('Shape', `\`color\` takes an accent (${Object.keys(ACCENTS).join(', ')}) or any CSS colour, not the button intent ${show(color)}.`);
    }
    
    if (points !== undefined && points !== null && !SCALLOPED_SHAPES.includes(name)) {
        warn('Shape', `\`points\` only applies to ${SCALLOPED_SHAPES.join(' and ')}: it does nothing on ${show(name)}.`);
    }
    return true;
}

export function verifyTypesAvatar({ seed, styleDefinition, options, size, shape, alt } = {}) {
    // without a seed there is nothing to draw *from*: every avatar would be the same one
    assertRequired('Avatar', 'seed', seed);
    assertType('Avatar', 'seed', seed, 'string');
    // `size` is the open set the rest of the library uses - a token or any CSS length
    assertType('Avatar', 'size', size, 'string');
    assertType('Avatar', 'alt', alt, 'string');
    assertOneOf('Avatar', 'shape', shape, SHAPE_NAMES);
    // a DiceBear style definition and its options are both plain JSON
    assertPlainObject('Avatar', 'styleDefinition', styleDefinition);
    assertPlainObject('Avatar', 'options', options);
    return true;
}

export function verifyTypesText({ variant, as, tone } = {}) {
    // the closed set here is the point of the component: an unknown role is a size that no other
    // text in the system shares
    assertOneOf('Text', 'variant', variant, TYPESCALE_ROLES, 'body-medium');
    assertOneOf('Text', 'tone', tone, ['default', 'muted'], 'default');
    // any tag name, or a component - both are legal for `as`
    if (as !== undefined && as !== null && typeof as !== 'string' && typeof as !== 'function' && typeof as !== 'object') {
        fail('Text', `\`as\` must be a tag name or a component, received ${typeof as}.`);
    }
    return true;
}

export function verifyTypesSelect({ options, onChange, label, placeholder, disabled } = {}) {
    assertArrayOf('Select', 'options', options, (item, path) => {
        assertPlainObject('Select', path, item);
        if (!item) return;
        assertRequired('Select', `${path}.value`, item.value);
        assertNode('Select', `${path}.label`, item.label);
    });
    assertType('Select', 'onChange', onChange, 'function');
    assertType('Select', 'label', label, 'string');
    assertType('Select', 'placeholder', placeholder, 'string');
    assertType('Select', 'disabled', disabled, 'boolean');
    return true;
}

export function verifyTypesLoading({ size, color, shapes, label } = {}) {
    // open set, like Shape and Avatar: a token or any CSS length
    assertType('Loading', 'size', size, 'string');
    assertType('Loading', 'color', color, 'string');
    assertType('Loading', 'label', label, 'string');
    assertArrayOf('Loading', 'shapes', shapes, (item, prop) => {
        assertPlainObject('Loading', prop, item);
        assertRequired('Loading', `${prop}.name`, item?.name);
        assertOneOf('Loading', `${prop}.name`, item?.name, SHAPE_NAMES);
        // A warning and not a failure: the cycle still runs, the number is simply ignored - the
        // same thing Shape does with `points` on a shape that has no bumps to count.
        if (item?.points !== undefined && !SCALLOPED_SHAPES.includes(item?.name)) {
            warn('Loading', `\`${prop}.points\` does nothing on \`${item.name}\`. Only ${SCALLOPED_SHAPES.join(' and ')} count bumps.`);
        }
        assertRange('Loading', `${prop}.points`, item?.points, 3, 60);
    });
    return true;
}

export function verifyTypesDropdown({ open, onClose, triggerRef } = {}) {
    assertType('Dropdown', 'open', open, 'boolean');
    assertType('Dropdown', 'onClose', onClose, 'function');
    assertRef('Dropdown', 'triggerRef', triggerRef);
    return true;
}

export function verifyTypesCustomModal({ open, onClose, onCloseComplete, triggerRef, animation } = {}) {
    assertType('CustomModal', 'open', open, 'boolean');
    assertType('CustomModal', 'onClose', onClose, 'function');
    assertType('CustomModal', 'onCloseComplete', onCloseComplete, 'function');
    assertRef('CustomModal', 'triggerRef', triggerRef);
    // duck typing instead of `instanceof ModalAnimation`: importing modalAnimation.js here would drag
    // GSAP into this otherwise pure module
    if (animation !== undefined && animation !== null) {
        if (typeof animation?.open !== 'function' || typeof animation?.close !== 'function') {
            fail('CustomModal', '`animation` must be a ModalAnimation (with `open` and `close` methods). See src/animations/modalAnimation.js.');
        }
    }
    return true;
}

// Every auth modal funnels through AuthShell, so the shared half of the contract is checked once
// here and each modal only validates the fields it adds.
export function verifyTypesAuthShell({
    open, onClose, triggerRef, logo, brand, title, submitLabel,
    onSubmit, onGoogle, googleLabel, switchText, switchAction, onSwitch, error, loading,
} = {}) {
    assertType('AuthShell', 'open', open, 'boolean');
    assertType('AuthShell', 'onClose', onClose, 'function');
    assertRef('AuthShell', 'triggerRef', triggerRef);
    assertNode('AuthShell', 'logo', logo);
    assertType('AuthShell', 'brand', brand, 'string');
    assertType('AuthShell', 'title', title, 'string');
    assertType('AuthShell', 'submitLabel', submitLabel, 'string');
    assertType('AuthShell', 'onSubmit', onSubmit, 'function');
    assertType('AuthShell', 'onGoogle', onGoogle, 'function');
    assertType('AuthShell', 'googleLabel', googleLabel, 'string');
    assertType('AuthShell', 'switchText', switchText, 'string');
    assertType('AuthShell', 'switchAction', switchAction, 'string');
    assertType('AuthShell', 'onSwitch', onSwitch, 'function');
    assertType('AuthShell', 'error', error, 'string');
    assertType('AuthShell', 'loading', loading, 'boolean');
    return true;
}

export function verifyTypesLoginModal({
    email, password, onEmailChange, onPasswordChange, onSubmit, onForgotPassword,
} = {}) {
    assertType('LoginModal', 'email', email, 'string');
    assertType('LoginModal', 'password', password, 'string');
    assertType('LoginModal', 'onEmailChange', onEmailChange, 'function');
    assertType('LoginModal', 'onPasswordChange', onPasswordChange, 'function');
    assertType('LoginModal', 'onSubmit', onSubmit, 'function');
    // whether the link exists at all, so a non-function here is a link that renders and does nothing
    assertType('LoginModal', 'onForgotPassword', onForgotPassword, 'function');
    return true;
}

export function verifyTypesRegisterModal({
    email, password, confirmPassword,
    onEmailChange, onPasswordChange, onConfirmPasswordChange, onSubmit,
} = {}) {
    assertType('RegisterModal', 'email', email, 'string');
    assertType('RegisterModal', 'password', password, 'string');
    assertType('RegisterModal', 'confirmPassword', confirmPassword, 'string');
    assertType('RegisterModal', 'onEmailChange', onEmailChange, 'function');
    assertType('RegisterModal', 'onPasswordChange', onPasswordChange, 'function');
    assertType('RegisterModal', 'onConfirmPasswordChange', onConfirmPasswordChange, 'function');
    assertType('RegisterModal', 'onSubmit', onSubmit, 'function');
    return true;
}

export function verifyTypesOtpModal({ code, onCodeChange, length, onSubmit, email, onResend } = {}) {
    assertType('OtpModal', 'code', code, 'string');
    assertType('OtpModal', 'onCodeChange', onCodeChange, 'function');
    // one box is not a code and past eight nobody reads it back from a phone screen
    assertRange('OtpModal', 'length', length, 2, 8);
    assertType('OtpModal', 'onSubmit', onSubmit, 'function');
    assertType('OtpModal', 'email', email, 'string');
    assertType('OtpModal', 'onResend', onResend, 'function');
    return true;
}

export function verifyTypesRecoverPasswordModal({
    step, email, code, onCodeChange, length, onVerifyCode, onResend,
    password, confirmPassword, onPasswordChange, onConfirmPasswordChange, onSubmitPassword,
} = {}) {
    // a closed set, and the only one that has to be: an unrecognised step renders neither the boxes
    // nor the fields, so the panel comes up with a title, a button and nothing in between
    assertOneOf('RecoverPasswordModal', 'step', step, ['code', 'password'], 'code');
    assertType('RecoverPasswordModal', 'email', email, 'string');
    assertType('RecoverPasswordModal', 'code', code, 'string');
    assertType('RecoverPasswordModal', 'onCodeChange', onCodeChange, 'function');
    // same bounds as OtpModal - it is the same field underneath
    assertRange('RecoverPasswordModal', 'length', length, 2, 8);
    assertType('RecoverPasswordModal', 'onVerifyCode', onVerifyCode, 'function');
    assertType('RecoverPasswordModal', 'onResend', onResend, 'function');
    assertType('RecoverPasswordModal', 'password', password, 'string');
    assertType('RecoverPasswordModal', 'confirmPassword', confirmPassword, 'string');
    assertType('RecoverPasswordModal', 'onPasswordChange', onPasswordChange, 'function');
    assertType('RecoverPasswordModal', 'onConfirmPasswordChange', onConfirmPasswordChange, 'function');
    assertType('RecoverPasswordModal', 'onSubmitPassword', onSubmitPassword, 'function');
    return true;
}

export function verifyTypesNavbar({ items, logo, selected, defaultSelected, onChange, align } = {}) {
    assertArrayOf('Navbar', 'items', items, (item, path) => {
        assertPlainObject('Navbar', path, item);
        if (!item) return;
        assertIconLike('Navbar', `${path}.icon`, item.icon);
        assertType('Navbar', `${path}.label`, item.label, 'string');
        assertRef('Navbar', `${path}.buttonRef`, item.buttonRef);
    });
    if (logo !== undefined && logo !== null) {
        assertPlainObject('Navbar', 'logo', logo);
        assertRequired('Navbar', 'logo.icon', logo.icon);
        assertIconLike('Navbar', 'logo.icon', logo.icon);
        assertType('Navbar', 'logo.label', logo.label, 'string');
        assertType('Navbar', 'logo.onClick', logo.onClick, 'function');
        assertType('Navbar', 'logo.active', logo.active, 'boolean');
        assertRef('Navbar', 'logo.buttonRef', logo.buttonRef);
    }
    assertType('Navbar', 'selected', selected, 'number');
    assertType('Navbar', 'defaultSelected', defaultSelected, 'number');
    assertType('Navbar', 'onChange', onChange, 'function');
    assertOneOf('Navbar', 'align', align, ['top', 'center'], 'center');
    return true;
}

export function verifyTypesDragScroll({ axis, inertia, disabled, fade, fadeSize } = {}) {
    assertOneOf('DragScroll', 'axis', axis, ['y', 'x', 'both'], 'y');
    assertType('DragScroll', 'inertia', inertia, 'boolean');
    assertType('DragScroll', 'disabled', disabled, 'boolean');
    assertType('DragScroll', 'fade', fade, 'boolean');
    assertRange('DragScroll', 'fadeSize', fadeSize, 0, 200);
    return true;
}

export function verifyTypesToast({ variant, open, title, duration, dismissThreshold, onClose, onExited } = {}) {
    assertOneOf('Toast', 'variant', variant, TOAST_VARIANTS, 'info');
    assertType('Toast', 'open', open, 'boolean');
    assertNode('Toast', 'title', title);
    assertRange('Toast', 'duration', duration, 0, 600000);
    assertType('Toast', 'onClose', onClose, 'function');
    assertType('Toast', 'onExited', onExited, 'function');
    // 0 would dismiss on the slightest drag; >1 falls outside the Draggable `maxX`, making the toast
    // impossible to dismiss at all
    if (dismissThreshold !== undefined && dismissThreshold !== null) {
        assertType('Toast', 'dismissThreshold', dismissThreshold, 'number');
        if (!(dismissThreshold > 0 && dismissThreshold <= 1)) {
            fail('Toast', `\`dismissThreshold\` must be a number greater than 0 and at most 1, received ${show(dismissThreshold)}.`);
        }
    }
    return true;
}

// validates the showToast() payload — runs on call, not on render
export function verifyTypesShowToast({ variant, title, message, duration } = {}) {
    assertOneOf('useToast', 'variant', variant, TOAST_VARIANTS, 'info');
    assertNode('useToast', 'title', title);
    assertNode('useToast', 'message', message);
    assertRange('useToast', 'duration', duration, 0, 600000);
    if (title === undefined && message === undefined) {
        warn('useToast', 'showToast() called without `title` or `message`: the toast will render empty.');
    }
    return true;
}

export function verifyTypesToastProvider({ duration, dismissThreshold, max } = {}) {
    assertRange('ToastProvider', 'duration', duration, 0, 600000);
    assertRange('ToastProvider', 'max', max, 1, 20);
    if (dismissThreshold !== undefined && dismissThreshold !== null) {
        assertType('ToastProvider', 'dismissThreshold', dismissThreshold, 'number');
        if (!(dismissThreshold > 0 && dismissThreshold <= 1)) {
            fail('ToastProvider', `\`dismissThreshold\` must be a number greater than 0 and at most 1, received ${show(dismissThreshold)}.`);
        }
    }
    return true;
}

const THEME_MODES = ['light', 'dark', 'system'];
const THEME_VARIANTS = ['content', 'monochrome', 'neutral', 'tonalSpot', 'vibrant'];
const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const isThemeSeed = (value) => typeof value === 'string' && HEX_COLOR.test(value);
export const isThemeMode = (value) => THEME_MODES.includes(value);
export const isThemeVariant = (value) => THEME_VARIANTS.includes(value);

export function verifyTypesThemeSeed(component, prop, value) {
    if (isThemeSeed(value)) return true;
    warn(component, `\`${prop}\` must be a hex colour like "#0066ff", received ${show(value)}. Ignoring it.`);
    return false;
}

export function verifyTypesThemeMode(component, prop, value) {
    if (isThemeMode(value)) return true;
    warn(component, `invalid \`${prop}\`: ${show(value)}. Valid values: ${THEME_MODES.join(', ')}. Ignoring it.`);
    return false;
}

export function verifyTypesThemeVariant(component, prop, value) {
    if (isThemeVariant(value)) return true;
    warn(component, `invalid \`${prop}\`: ${show(value)}. Valid values: ${THEME_VARIANTS.join(', ')}. Ignoring it.`);
    return false;
}

export function verifyTypesThemeModal({ open, onClose, triggerRef, title } = {}) {
    assertType('ThemeModal', 'open', open, 'boolean');
    assertType('ThemeModal', 'onClose', onClose, 'function');
    assertType('ThemeModal', 'title', title, 'string');
    assertRef('ThemeModal', 'triggerRef', triggerRef);
    return true;
}

export function verifyTypesThemeProvider({ defaultSeed, defaultMode, themes } = {}) {
    if (defaultSeed !== undefined && defaultSeed !== null) {
        verifyTypesThemeSeed('ThemeProvider', 'defaultSeed', defaultSeed);
    }
    if (defaultMode !== undefined && defaultMode !== null) {
        verifyTypesThemeMode('ThemeProvider', 'defaultMode', defaultMode);
    }
    assertArrayOf('ThemeProvider', 'themes', themes, (item, path) => {
        assertPlainObject('ThemeProvider', path, item);
        if (!item) return;
        assertRequired('ThemeProvider', `${path}.name`, item.name);
        assertType('ThemeProvider', `${path}.name`, item.name, 'string');
        verifyTypesThemeSeed('ThemeProvider', `${path}.hex`, item.hex);
        // optional: an entry without one falls back to the default variant
        if (item.variant !== undefined && item.variant !== null) {
            verifyTypesThemeVariant('ThemeProvider', `${path}.variant`, item.variant);
        }
    });
    return true;
}

export function verifyTypesGradientProfile({ name, email, showControls, verifiedLabel } = {}) {
    assertType('GeneratorGradientProfile', 'name', name, 'string');
    assertType('GeneratorGradientProfile', 'email', email, 'string');
    assertType('GeneratorGradientProfile', 'showControls', showControls, 'boolean');
    assertType('GeneratorGradientProfile', 'verifiedLabel', verifiedLabel, 'string');
    return true;
}

export function verifyTypesOnboardingModal({ open, onClose, triggerRef, icon, onComplete } = {}) {
    assertType('OnboardingModal', 'open', open, 'boolean');
    assertType('OnboardingModal', 'onClose', onClose, 'function');
    assertRef('OnboardingModal', 'triggerRef', triggerRef);
    // a ReactNode and not an icon name: this is where a brand's own SVG logo goes
    assertNode('OnboardingModal', 'icon', icon);
    assertType('OnboardingModal', 'onComplete', onComplete, 'function');
    return true;
}
