const prefixLog = '[MOTT-COMPONENTS]';

// Validators run in every environment on purpose — there is no `process.env.NODE_ENV` guard, so the
// library never depends on the environment being declared. Invalid props are a bug in the consuming
// code and it is the consumer's job to fix them before shipping.
//
// Severity is what keeps that safe:
// - `fail` (throw) when the value would break anyway: wrong type, missing required prop.
// - `warn` (console.error) when the component already falls back (`PRESETS[x] ?? PRESETS.y`) — a
//   misspelled variant should not take down an end user's screen.

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

// NOTE: `color` (Badge, FabButton, ButtonFullRounded, Loading, Progress) and Icon's `size` do NOT
// belong here. Those resolve with `PRESETS[x] ?? x` on purpose, so they accept any CSS color or
// length — checking them against a list would be a false positive (e.g. color="#7c3aed").
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

export function verifyTypesButton({ variant, shape, iconOnly, fullWidth, type } = {}) {
    assertOneOf('Button', 'variant', variant, ['primary', 'secondary', 'outline', 'ghost', 'danger'], 'primary');
    assertOneOf('Button', 'shape', shape, ['rounded', 'pill'], 'rounded');
    assertOneOf('Button', 'type', type, BUTTON_TYPES, 'button');
    assertType('Button', 'iconOnly', iconOnly, 'boolean');
    assertType('Button', 'fullWidth', fullWidth, 'boolean');
    return true;
}

// shared by FabButton and ButtonFullRounded — same prop surface
export function verifyTypesIconButton(component, { icon, color, iconColor, size, type } = {}) {
    assertRequired(component, 'icon', icon);
    assertType(component, 'icon', icon, 'string');
    assertType(component, 'color', color, 'string');
    assertType(component, 'iconColor', iconColor, 'string');
    assertOneOf(component, 'size', size, CONTROL_SIZES, 'md');
    assertOneOf(component, 'type', type, BUTTON_TYPES, 'button');
    return true;
}

export function verifyTypesButtonGroup({ buttons, vertical, color, allowDeselect, onChange, value, defaultSelected } = {}) {
    assertRequired('ButtonGroup', 'buttons', buttons);
    assertArrayOf('ButtonGroup', 'buttons', buttons, (item, path) => {
        assertPlainObject('ButtonGroup', path, item);
        if (!item) return;
        assertIconLike('ButtonGroup', `${path}.icon`, item.icon);
        assertType('ButtonGroup', `${path}.label`, item.label, 'string');
        assertRef('ButtonGroup', `${path}.buttonRef`, item.buttonRef);
        if (item.icon === undefined && item.label === undefined) {
            warn('ButtonGroup', `${path} has no \`icon\` or \`label\`: it will render empty.`);
        }
    });
    assertType('ButtonGroup', 'vertical', vertical, 'boolean');
    assertType('ButtonGroup', 'allowDeselect', allowDeselect, 'boolean');
    assertType('ButtonGroup', 'color', color, 'string');
    assertType('ButtonGroup', 'onChange', onChange, 'function');
    assertType('ButtonGroup', 'value', value, 'number');
    assertType('ButtonGroup', 'defaultSelected', defaultSelected, 'number');
    return true;
}

export function verifyTypesBadge({ color, solid, size, icon, dot } = {}) {
    assertType('Badge', 'color', color, 'string');
    assertType('Badge', 'icon', icon, 'string');
    assertType('Badge', 'solid', solid, 'boolean');
    assertType('Badge', 'dot', dot, 'boolean');
    assertOneOf('Badge', 'size', size, CONTROL_SIZES, 'sm');
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

export function verifyTypesProgress({ value, color } = {}) {
    // undefined/null is the indeterminate mode, not an error (see progress.jsx)
    assertRange('Progress', 'value', value, 0, 100);
    assertType('Progress', 'color', color, 'string');
    return true;
}

export function verifyTypesLoading({ size, color } = {}) {
    // closed set here: the box comes from `var(--control-size-${size})`, defined only for sm/md/lg
    assertOneOf('Loading', 'size', size, CONTROL_SIZES, 'sm');
    assertType('Loading', 'color', color, 'string');
    return true;
}

export function verifyTypesDropdown({ open, onClose, width, height, triggerRef } = {}) {
    assertType('Dropdown', 'open', open, 'boolean');
    assertType('Dropdown', 'onClose', onClose, 'function');
    assertType('Dropdown', 'width', width, 'string');
    assertType('Dropdown', 'height', height, 'string');
    assertRef('Dropdown', 'triggerRef', triggerRef);
    return true;
}

export function verifyTypesCustomModal({ open, onClose, onCloseComplete, backdropOpacity, triggerRef, animation } = {}) {
    assertType('CustomModal', 'open', open, 'boolean');
    assertType('CustomModal', 'onClose', onClose, 'function');
    assertType('CustomModal', 'onCloseComplete', onCloseComplete, 'function');
    assertRange('CustomModal', 'backdropOpacity', backdropOpacity, 0, 1);
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

export function verifyTypesNavbar({ items, logo, selected, defaultSelected, onChange, color, align } = {}) {
    assertArrayOf('Navbar', 'items', items, (item, path) => {
        assertPlainObject('Navbar', path, item);
        if (!item) return;
        assertIconLike('Navbar', `${path}.icon`, item.icon);
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
    assertType('Navbar', 'color', color, 'string');
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
