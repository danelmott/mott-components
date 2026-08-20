const prefixLog = '[MOTT-COMPONENTS]';

const isDev = typeof process === 'undefined' || process.env.NODE_ENV !== 'production';


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
        fail(component, `\`${prop}\` debe ser ${expected}, se recibió ${typeof value} (${show(value)}).`);
    }
}

function assertRequired(component, prop, value) {
    if (value === undefined || value === null) {
        fail(component, `falta la prop requerida \`${prop}\`.`);
    }
}

function assertRange(component, prop, value, min, max) {
    if (value === undefined || value === null) return;
    assertType(component, prop, value, 'number');
    if (Number.isNaN(value) || value < min || value > max) {
        fail(component, `\`${prop}\` debe ser un número entre ${min} y ${max}, se recibió ${show(value)}.`);
    }
}

// el fallback se nombra en el mensaje para que se entienda qué se va a ver en pantalla
function assertOneOf(component, prop, value, allowed, fallback) {
    if (value === undefined || value === null) return;
    if (!allowed.includes(value)) {
        warn(
            component,
            `\`${prop}\` inválida: ${show(value)}. Válidas: ${allowed.join(', ')}.` +
            (fallback !== undefined ? ` Se usa ${show(fallback)}.` : '')
        );
    }
}

function assertArrayOf(component, prop, value, validateItem) {
    if (value === undefined || value === null) return;
    if (!Array.isArray(value)) {
        fail(component, `\`${prop}\` debe ser un array, se recibió ${typeof value}.`);
    }
    value.forEach((item, i) => validateItem(item, `${prop}[${i}]`));
}

// tanto el objeto de useRef como el callback ref son válidos: los componentes soportan los dos
// (ver `setRefs` en navbar.jsx y `btn.buttonRef` en buttonGroup.jsx)
function assertRef(component, prop, value) {
    if (value === undefined || value === null) return;
    if (typeof value === 'function') return;
    if (typeof value !== 'object' || !('current' in value)) {
        fail(component, `\`${prop}\` debe ser un ref (useRef o callback), se recibió ${show(value)}.`);
    }
}

// `icon` acepta tanto el nombre de un Material Symbol como un nodo React ya armado
function assertIconLike(component, prop, value) {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' || typeof value === 'object') return;
    fail(component, `\`${prop}\` debe ser el nombre de un ícono (string) o un nodo React, se recibió ${typeof value}.`);
}

// título y mensaje pueden ser texto o JSX
function assertNode(component, prop, value) {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'object') return;
    fail(component, `\`${prop}\` debe ser texto o un nodo React, se recibió ${typeof value}.`);
}

function assertPlainObject(component, prop, value) {
    if (value === undefined || value === null) return;
    if (typeof value !== 'object' || Array.isArray(value)) {
        fail(component, `\`${prop}\` debe ser un objeto, se recibió ${Array.isArray(value) ? 'array' : typeof value}.`);
    }
}

// --- sets cerrados ---------------------------------------------------------------------------
// OJO: `color` (Badge, FabButton, ButtonFullRounded, Loading, Progress) y `size` de Icon NO van acá.
// Esos componentes resuelven con `PRESETS[x] ?? x` a propósito, así que aceptan cualquier color o
// medida CSS — validarlos contra una lista sería un falso positivo (ej. color="#7c3aed").

const CONTROL_SIZES = ['sm', 'md', 'lg'];
const BUTTON_TYPES = ['button', 'submit', 'reset'];
const TOAST_VARIANTS = ['info', 'success', 'warning', 'danger'];
const INPUT_TYPES = ['text', 'number', 'password'];

export { TOAST_VARIANTS };

// --- validadores por componente --------------------------------------------------------------

export function verifyTypesInput({ label, placeholder, type } = {}) {
    if (!isDev) return true;
    assertType('Input', 'label', label, 'string');
    assertType('Input', 'placeholder', placeholder, 'string');
    assertOneOf('Input', 'type', type, INPUT_TYPES, 'text');
    return true;
}

export function verifyTypesTextarea({ label, placeholder, width, height } = {}) {
    if (!isDev) return true;
    assertType('Textarea', 'label', label, 'string');
    assertType('Textarea', 'placeholder', placeholder, 'string');
    assertType('Textarea', 'width', width, 'string');
    assertType('Textarea', 'height', height, 'string');
    return true;
}

export function verifyTypesSearch({ label, placeholder, delay, onSearch, onChange, value, defaultValue } = {}) {
    if (!isDev) return true;
    assertType('Search', 'label', label, 'string');
    assertType('Search', 'placeholder', placeholder, 'string');
    assertType('Search', 'value', value, 'string');
    assertType('Search', 'defaultValue', defaultValue, 'string');
    assertType('Search', 'onSearch', onSearch, 'function');
    assertType('Search', 'onChange', onChange, 'function');
    assertRange('Search', 'delay', delay, 0, 60000);
    return true;
}

export function verifyTypesButton({ variant, shape, iconOnly, fullWidth, type } = {}) {
    if (!isDev) return true;
    assertOneOf('Button', 'variant', variant, ['primary', 'secondary', 'outline', 'ghost', 'danger'], 'primary');
    assertOneOf('Button', 'shape', shape, ['rounded', 'pill'], 'rounded');
    assertOneOf('Button', 'type', type, BUTTON_TYPES, 'button');
    assertType('Button', 'iconOnly', iconOnly, 'boolean');
    assertType('Button', 'fullWidth', fullWidth, 'boolean');
    return true;
}

// compartido por FabButton y ButtonFullRounded: misma superficie de props
export function verifyTypesIconButton(component, { icon, color, iconColor, size, type } = {}) {
    if (!isDev) return true;
    assertRequired(component, 'icon', icon);
    assertType(component, 'icon', icon, 'string');
    assertType(component, 'color', color, 'string');
    assertType(component, 'iconColor', iconColor, 'string');
    assertOneOf(component, 'size', size, CONTROL_SIZES, 'md');
    assertOneOf(component, 'type', type, BUTTON_TYPES, 'button');
    return true;
}

export function verifyTypesButtonGroup({ buttons, vertical, color, allowDeselect, onChange, value, defaultSelected } = {}) {
    if (!isDev) return true;
    assertRequired('ButtonGroup', 'buttons', buttons);
    assertArrayOf('ButtonGroup', 'buttons', buttons, (item, path) => {
        assertPlainObject('ButtonGroup', path, item);
        if (!item) return;
        assertIconLike('ButtonGroup', `${path}.icon`, item.icon);
        assertType('ButtonGroup', `${path}.label`, item.label, 'string');
        assertRef('ButtonGroup', `${path}.buttonRef`, item.buttonRef);
        if (item && item.icon === undefined && item.label === undefined) {
            warn('ButtonGroup', `${path} no tiene \`icon\` ni \`label\`: se va a renderizar vacío.`);
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
    if (!isDev) return true;
    assertType('Badge', 'color', color, 'string');
    assertType('Badge', 'icon', icon, 'string');
    assertType('Badge', 'solid', solid, 'boolean');
    assertType('Badge', 'dot', dot, 'boolean');
    assertOneOf('Badge', 'size', size, CONTROL_SIZES, 'sm');
    return true;
}

export function verifyTypesIcon({ name, size, filled, weight, grade, opticalSize } = {}) {
    if (!isDev) return true;
    assertType('Icon', 'name', name, 'string');
    // `size` acepta el token (sm/md/lg/xl) o cualquier medida CSS — ver SIZE_TOKEN en icon.jsx
    assertType('Icon', 'size', size, 'string');
    assertType('Icon', 'filled', filled, 'boolean');
    assertRange('Icon', 'weight', weight, 100, 700);
    assertRange('Icon', 'grade', grade, -50, 200);
    assertRange('Icon', 'opticalSize', opticalSize, 20, 48);
    return true;
}

export function verifyTypesSelect({ options, onChange, label, placeholder, disabled } = {}) {
    if (!isDev) return true;
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
    if (!isDev) return true;
    // `undefined`/`null` es el modo indeterminado, no un error (ver progress.jsx:19)
    assertRange('Progress', 'value', value, 0, 100);
    assertType('Progress', 'color', color, 'string');
    return true;
}

export function verifyTypesLoading({ size, color } = {}) {
    if (!isDev) return true;
    // acá sí es set cerrado: el box sale de `var(--control-size-${size})`, que solo existe en sm/md/lg
    assertOneOf('Loading', 'size', size, CONTROL_SIZES, 'sm');
    assertType('Loading', 'color', color, 'string');
    return true;
}

export function verifyTypesDropdown({ open, onClose, width, height, triggerRef } = {}) {
    if (!isDev) return true;
    assertType('Dropdown', 'open', open, 'boolean');
    assertType('Dropdown', 'onClose', onClose, 'function');
    assertType('Dropdown', 'width', width, 'string');
    assertType('Dropdown', 'height', height, 'string');
    assertRef('Dropdown', 'triggerRef', triggerRef);
    return true;
}

export function verifyTypesCustomModal({ open, onClose, onCloseComplete, width, height, backdropOpacity, triggerRef, animation } = {}) {
    if (!isDev) return true;
    assertType('CustomModal', 'open', open, 'boolean');
    assertType('CustomModal', 'onClose', onClose, 'function');
    assertType('CustomModal', 'onCloseComplete', onCloseComplete, 'function');
    assertType('CustomModal', 'width', width, 'string');
    assertType('CustomModal', 'height', height, 'string');
    assertRange('CustomModal', 'backdropOpacity', backdropOpacity, 0, 1);
    assertRef('CustomModal', 'triggerRef', triggerRef);
    // duck typing en vez de `instanceof ModalAnimation`: importar modalAnimation.js acá arrastraría
    // GSAP a este módulo, que si no es puro
    if (animation !== undefined && animation !== null) {
        if (typeof animation?.open !== 'function' || typeof animation?.close !== 'function') {
            fail('CustomModal', '`animation` debe ser una ModalAnimation (con métodos `open` y `close`). Ver src/animations/modalAnimation.js.');
        }
    }
    return true;
}

export function verifyTypesNavbar({ items, logo, selected, defaultSelected, onChange, color, align } = {}) {
    if (!isDev) return true;
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

export function verifyTypesToast({ variant, open, title, duration, dismissThreshold, onClose, onExited } = {}) {
    if (!isDev) return true;
    assertOneOf('Toast', 'variant', variant, TOAST_VARIANTS, 'info');
    assertType('Toast', 'open', open, 'boolean');
    assertNode('Toast', 'title', title);
    assertRange('Toast', 'duration', duration, 0, 600000);
    assertType('Toast', 'onClose', onClose, 'function');
    assertType('Toast', 'onExited', onExited, 'function');
    // 0 dejaría al toast descartándose con el mínimo roce; >1 lo volvería imposible de descartar,
    // porque el umbral quedaría fuera del `maxX` del Draggable (ver toast.jsx:167)
    if (dismissThreshold !== undefined && dismissThreshold !== null) {
        assertType('Toast', 'dismissThreshold', dismissThreshold, 'number');
        if (!(dismissThreshold > 0 && dismissThreshold <= 1)) {
            fail('Toast', `\`dismissThreshold\` debe ser un número mayor a 0 y hasta 1, se recibió ${show(dismissThreshold)}.`);
        }
    }
    return true;
}

// valida el payload de showToast() — corre al llamarla, no en render
export function verifyTypesShowToast({ variant, title, message, duration } = {}) {
    if (!isDev) return true;
    assertOneOf('useToast', 'variant', variant, TOAST_VARIANTS, 'info');
    assertNode('useToast', 'title', title);
    assertNode('useToast', 'message', message);
    assertRange('useToast', 'duration', duration, 0, 600000);
    if (title === undefined && message === undefined) {
        warn('useToast', 'showToast() sin `title` ni `message`: el toast se va a ver vacío.');
    }
    return true;
}

export function verifyTypesToastProvider({ duration, dismissThreshold, max } = {}) {
    if (!isDev) return true;
    assertRange('ToastProvider', 'duration', duration, 0, 600000);
    assertRange('ToastProvider', 'max', max, 1, 20);
    if (dismissThreshold !== undefined && dismissThreshold !== null) {
        assertType('ToastProvider', 'dismissThreshold', dismissThreshold, 'number');
        if (!(dismissThreshold > 0 && dismissThreshold <= 1)) {
            fail('ToastProvider', `\`dismissThreshold\` debe ser un número mayor a 0 y hasta 1, se recibió ${show(dismissThreshold)}.`);
        }
    }
    return true;
}
