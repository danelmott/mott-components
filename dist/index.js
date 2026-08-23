// src/buttons/button.jsx
import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// src/theme/roles.js
var family = (fill, on, container, onContainer) => ({
  fill: `var(${fill})`,
  on: `var(${on})`,
  container: `var(${container})`,
  onContainer: `var(${onContainer})`
});
var FAMILIES = {
  primary: family(
    "--md-sys-color-primary",
    "--md-sys-color-on-primary",
    "--md-sys-color-primary-container",
    "--md-sys-color-on-primary-container"
  ),
  secondary: family(
    "--md-sys-color-secondary",
    "--md-sys-color-on-secondary",
    "--md-sys-color-secondary-container",
    "--md-sys-color-on-secondary-container"
  ),
  tertiary: family(
    "--md-sys-color-tertiary",
    "--md-sys-color-on-tertiary",
    "--md-sys-color-tertiary-container",
    "--md-sys-color-on-tertiary-container"
  ),
  danger: family(
    "--md-sys-color-error",
    "--md-sys-color-on-error",
    "--md-sys-color-error-container",
    "--md-sys-color-on-error-container"
  ),
  success: family(
    "--md-custom-color-success",
    "--md-custom-color-on-success",
    "--md-custom-color-success-container",
    "--md-custom-color-on-success-container"
  ),
  warning: family(
    "--md-custom-color-warning",
    "--md-custom-color-on-warning",
    "--md-custom-color-warning-container",
    "--md-custom-color-on-warning-container"
  ),
  neutral: family(
    "--md-sys-color-inverse-surface",
    "--md-sys-color-inverse-on-surface",
    "--md-sys-color-surface-container",
    "--md-sys-color-on-surface"
  )
};
var TRANSPARENT = "transparent";
var filled = (name) => {
  const { fill, on } = FAMILIES[name];
  return { surface: fill, on };
};
var tonal = (name) => {
  const { container, onContainer } = FAMILIES[name];
  return { surface: container, on: onContainer };
};
var text = (name) => {
  const { fill } = FAMILIES[name];
  return { surface: TRANSPARENT, on: fill };
};
var CONTROL_FAMILY = {
  default: "neutral",
  // carries no weight of its own - Cancel, Back
  action: "primary",
  // the one thing the screen is for - Save, Send
  support: "secondary",
  // helps the main action without competing with it
  danger: "danger",
  // destructive - Delete, Revoke
  success: "success",
  // confirms something that went right - Approve
  warning: "warning"
  // caution that does not destroy - Archive, Suspend
};
var CONTROL_NAMES = [...Object.keys(CONTROL_FAMILY), "ghost"];
var controlTint = (name, quiet = false) => {
  if (name === "ghost") return text("primary");
  const key = CONTROL_FAMILY[name];
  if (!key) return null;
  if (key === "neutral") return tonal("neutral");
  return quiet ? tonal(key) : filled(key);
};
var SELECTION_FAMILY = {
  default: "secondary",
  action: "primary",
  support: "secondary",
  danger: "danger",
  success: "success",
  warning: "warning",
  ghost: "secondary"
};
var selectionTint = (name) => tonal(SELECTION_FAMILY[name] ?? "secondary");
var ACCENTS = {
  primary: FAMILIES.primary.fill,
  info: FAMILIES.primary.fill,
  secondary: FAMILIES.secondary.fill,
  success: FAMILIES.success.fill,
  warning: FAMILIES.warning.fill,
  danger: FAMILIES.danger.fill
};
var ACCENT_ON = {
  primary: FAMILIES.primary.on,
  info: FAMILIES.primary.on,
  secondary: FAMILIES.secondary.on,
  success: FAMILIES.success.on,
  warning: FAMILIES.warning.on,
  danger: FAMILIES.danger.on
};

// src/shapes/shapePaths.js
var TAU = Math.PI * 2;
var BOX = 100;
var GAP = 0.92;
var round = (n) => Math.round(n * 100) / 100;
var distance = ([ax, ay], [bx, by]) => Math.hypot(bx - ax, by - ay);
var along = ([fx, fy], [tx, ty], length) => {
  const span = distance([fx, fy], [tx, ty]) || 1;
  return [fx + (tx - fx) / span * length, fy + (ty - fy) / span * length];
};
var polar = (angle, radius, [cx, cy] = [50, 50]) => [
  cx + Math.cos(angle) * radius,
  cy + Math.sin(angle) * radius
];
var lineTo = (to) => ({ type: "L", to });
var arcTo = (to, radius, center, sweep) => ({ type: "A", to, radius, center, sweep });
function turned(segment, from) {
  const { center, sweep } = segment;
  const start = Math.atan2(from[1] - center[1], from[0] - center[0]);
  const end = Math.atan2(segment.to[1] - center[1], segment.to[0] - center[0]);
  let delta = end - start;
  if (sweep === 1 && delta < 0) delta += TAU;
  if (sweep === 0 && delta > 0) delta -= TAU;
  return { start, delta };
}
var STEPS = 12;
function samples(segment, from) {
  if (segment.type === "L") return [segment.to];
  const { start, delta } = turned(segment, from);
  const points = [];
  for (let i = 1; i <= STEPS; i += 1) {
    points.push(polar(start + delta * i / STEPS, segment.radius, segment.center));
  }
  return points;
}
function advances(start, segments) {
  let cursor = start;
  let previous2 = Math.atan2(start[1] - 50, start[0] - 50);
  for (const segment of segments) {
    for (const point of samples(segment, cursor)) {
      const angle = Math.atan2(point[1] - 50, point[0] - 50);
      let step = angle - previous2;
      while (step > Math.PI) step -= TAU;
      while (step < -Math.PI) step += TAU;
      if (step < -1e-9) return false;
      previous2 = angle;
    }
    cursor = segment.to;
  }
  return true;
}
function fit(start, segments) {
  let cursor = start;
  const points = [start];
  for (const segment of segments) {
    points.push(...samples(segment, cursor));
    cursor = segment.to;
  }
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const scaleX = BOX / (Math.max(...xs) - minX);
  const scaleY = BOX / (Math.max(...ys) - minY);
  const move = ([x, y]) => [(x - minX) * scaleX, (y - minY) * scaleY];
  return [
    move(start),
    segments.map((segment) => segment.type === "L" ? lineTo(move(segment.to)) : {
      ...segment,
      to: move(segment.to),
      // the two radii part company here - that is the ellipse the stretch creates
      radius: [segment.radius * scaleX, segment.radius * scaleY]
    })
  ];
}
function serialize(start, segments) {
  const xy = ([x, y]) => `${round(x)} ${round(y)}`;
  const body = segments.map((segment) => {
    if (segment.type === "L") return `L ${xy(segment.to)}`;
    const [rx, ry] = segment.radius;
    return `A ${round(Math.abs(rx))} ${round(Math.abs(ry))} 0 ${segment.large} ${segment.sweep} ${xy(segment.to)}`;
  });
  return `M ${xy(start)} ${body.join(" ")} Z`;
}
function build(start, segments) {
  let cursor = start;
  const flagged = segments.map((segment) => {
    if (segment.type === "L") {
      cursor = segment.to;
      return segment;
    }
    const { delta } = turned(segment, cursor);
    cursor = segment.to;
    return { ...segment, large: Math.abs(delta) > Math.PI ? 1 : 0 };
  });
  return serialize(...fit(start, flagged));
}
function roundedPolygon(vertices, radius) {
  const total = vertices.length;
  const corners = vertices.map((vertex, index) => {
    const previous2 = vertices[(index - 1 + total) % total];
    const next = vertices[(index + 1) % total];
    const incoming = Math.atan2(vertex[1] - previous2[1], vertex[0] - previous2[0]);
    const outgoing = Math.atan2(next[1] - vertex[1], next[0] - vertex[0]);
    let turn = outgoing - incoming;
    while (turn <= -Math.PI) turn += TAU;
    while (turn > Math.PI) turn -= TAU;
    const half = (Math.PI - Math.abs(turn)) / 2;
    const limit = Math.min(distance(previous2, vertex), distance(vertex, next)) / 2;
    const cut = Math.min(radius / Math.tan(half), limit);
    const start = along(vertex, previous2, cut);
    const end = along(vertex, next, cut);
    const bisector = Math.atan2(
      (start[1] + end[1]) / 2 - vertex[1],
      (start[0] + end[0]) / 2 - vertex[0]
    );
    return {
      start,
      end,
      // the corner circle sits on the bisector, one hypotenuse away from the vertex
      center: polar(bisector, cut / Math.cos(half), vertex),
      radius: cut * Math.tan(half),
      sweep: turn > 0 ? 1 : 0
    };
  });
  const segments = [];
  corners.forEach((corner, index) => {
    if (index > 0) segments.push(lineTo(corner.start));
    segments.push(arcTo(corner.end, corner.radius, corner.center, corner.sweep));
  });
  return build(corners[0].start, segments);
}
function scallop(points, { innerRadius, bumpRadius }) {
  const step = TAU / points;
  const start = -Math.PI / 2;
  const k = Math.cos(Math.PI / points);
  const clearance = Math.sin(Math.PI / points);
  const widest = Math.min(bumpRadius, GAP * (50 * clearance) / (1 + clearance));
  const filleted = (bump, inner) => {
    const centre = 50 - bump;
    const valley = (bump * bump - centre * centre - inner * inner + 2 * centre * k * inner) / (2 * (inner - centre * k - bump));
    if (valley < 0.5) return null;
    const bumpCentre = (i) => polar(start + step * i, centre);
    const valleyCentre = (i) => polar(start + step * (i + 0.5), inner + valley);
    const touch = (i, j) => along(bumpCentre(i), valleyCentre(j), bump);
    const segments = [];
    for (let i = 0; i < points; i += 1) {
      segments.push(arcTo(touch(i, i), bump, bumpCentre(i), 1));
      segments.push(arcTo(touch(i + 1, i), valley, valleyCentre(i), 0));
    }
    return { first: touch(0, -1), segments };
  };
  const onCore = (bump, inner) => {
    const centre = 50 - bump;
    const cosine = (inner * inner + centre * centre - bump * bump) / (2 * inner * centre);
    if (cosine < -1 || cosine > 1) return null;
    const reach = Math.acos(cosine);
    if (reach >= step / 2) return null;
    const segments = [];
    for (let i = 0; i < points; i += 1) {
      const angle = start + step * i;
      segments.push(arcTo(polar(angle + reach, inner), bump, polar(angle, centre), 1));
      segments.push(arcTo(polar(angle + step - reach, inner), inner, [50, 50], 1));
    }
    return { first: polar(start - reach, inner), segments };
  };
  for (let bump = widest; bump > 1; bump *= 0.9) {
    for (let inner = innerRadius; inner < 50; inner += 1) {
      for (const attempt of [filleted(bump, inner), onCore(bump, inner)]) {
        if (attempt && advances(attempt.first, attempt.segments)) {
          return build(attempt.first, attempt.segments);
        }
      }
    }
  }
  return "M 50 0 A 50 50 0 1 1 49.99 0 Z";
}
var ARCH = "M 0 50 A 50 50 0 0 1 100 50 L 100 84 A 16 16 0 0 1 84 100 L 16 100 A 16 16 0 0 1 0 84 Z";
var SHAPE_PATHS = {
  triangle: roundedPolygon([[50, 0], [100, 100], [0, 100]], 17),
  diamond: roundedPolygon([[50, 0], [100, 50], [50, 100], [0, 50]], 26),
  arch: ARCH,
  // deep valleys and a fat bump: each petal swings well past a half circle, so it comes out an
  // oval joined to its neighbours by a narrow notch
  flower: ({ points = 8 } = {}) => scallop(points, { innerRadius: 34, bumpRadius: 12.5 }),
  // shallow valleys and a small bump: the wave barely dips, which is what a scalloped biscuit is
  cookie: ({ points = 12 } = {}) => scallop(points, { innerRadius: 46, bumpRadius: 11 })
};
var SHAPE_NAMES = Object.keys(SHAPE_PATHS);
var SCALLOPED_SHAPES = ["flower", "cookie"];
var shapePath = (name, options) => {
  const shape = SHAPE_PATHS[name];
  return typeof shape === "function" ? shape(options) : shape;
};

// src/utils/verifyTypes.js
var prefixLog = "[MOTT-COMPONENTS]";
var show = (value) => typeof value === "string" ? `"${value}"` : String(value);
var fail = (component, message) => {
  throw new TypeError(`${prefixLog} <${component}>: ${message}`);
};
var warn = (component, message) => {
  console.error(`${prefixLog} <${component}>: ${message}`);
};
function assertType(component, prop, value, expected) {
  if (value === void 0 || value === null) return;
  if (typeof value !== expected) {
    fail(component, `\`${prop}\` must be a ${expected}, received ${typeof value} (${show(value)}).`);
  }
}
function assertRequired(component, prop, value) {
  if (value === void 0 || value === null) {
    fail(component, `missing required prop \`${prop}\`.`);
  }
}
function assertRange(component, prop, value, min, max) {
  if (value === void 0 || value === null) return;
  assertType(component, prop, value, "number");
  if (Number.isNaN(value) || value < min || value > max) {
    fail(component, `\`${prop}\` must be a number between ${min} and ${max}, received ${show(value)}.`);
  }
}
function assertOneOf(component, prop, value, allowed, fallback) {
  if (value === void 0 || value === null) return;
  if (!allowed.includes(value)) {
    warn(
      component,
      `invalid \`${prop}\`: ${show(value)}. Valid values: ${allowed.join(", ")}.` + (fallback !== void 0 ? ` Falling back to ${show(fallback)}.` : "")
    );
  }
}
function assertArrayOf(component, prop, value, validateItem) {
  if (value === void 0 || value === null) return;
  if (!Array.isArray(value)) {
    fail(component, `\`${prop}\` must be an array, received ${typeof value}.`);
  }
  value.forEach((item, i) => validateItem(item, `${prop}[${i}]`));
}
function assertRef(component, prop, value) {
  if (value === void 0 || value === null) return;
  if (typeof value === "function") return;
  if (typeof value !== "object" || !("current" in value)) {
    fail(component, `\`${prop}\` must be a ref (useRef or callback), received ${show(value)}.`);
  }
}
function assertIconLike(component, prop, value) {
  if (value === void 0 || value === null) return;
  if (typeof value === "string" || typeof value === "object") return;
  fail(component, `\`${prop}\` must be an icon name (string) or a React node, received ${typeof value}.`);
}
function assertNode(component, prop, value) {
  if (value === void 0 || value === null) return;
  if (typeof value === "string" || typeof value === "number" || typeof value === "object") return;
  fail(component, `\`${prop}\` must be text or a React node, received ${typeof value}.`);
}
function assertPlainObject(component, prop, value) {
  if (value === void 0 || value === null) return;
  if (typeof value !== "object" || Array.isArray(value)) {
    fail(component, `\`${prop}\` must be an object, received ${Array.isArray(value) ? "array" : typeof value}.`);
  }
}
var CONTROL_SIZES = ["sm", "md", "lg"];
var BUTTON_TYPES = ["button", "submit", "reset"];
var TOAST_VARIANTS = ["info", "success", "warning", "danger"];
var INPUT_TYPES = ["text", "number", "password"];
function verifyTypesInput({ label, placeholder, type } = {}) {
  assertType("Input", "label", label, "string");
  assertType("Input", "placeholder", placeholder, "string");
  assertOneOf("Input", "type", type, INPUT_TYPES, "text");
  return true;
}
function verifyTypesTextarea({ label, placeholder, width, height } = {}) {
  assertType("Textarea", "label", label, "string");
  assertType("Textarea", "placeholder", placeholder, "string");
  assertType("Textarea", "width", width, "string");
  assertType("Textarea", "height", height, "string");
  return true;
}
function verifyTypesSearch({ label, placeholder, delay, onSearch, onChange, value, defaultValue } = {}) {
  assertType("Search", "label", label, "string");
  assertType("Search", "placeholder", placeholder, "string");
  assertType("Search", "value", value, "string");
  assertType("Search", "defaultValue", defaultValue, "string");
  assertType("Search", "onSearch", onSearch, "function");
  assertType("Search", "onChange", onChange, "function");
  assertRange("Search", "delay", delay, 0, 6e4);
  return true;
}
function verifyTypesButton({ variant, quiet, shape, iconOnly, fullWidth, type } = {}) {
  assertOneOf("Button", "variant", variant, CONTROL_NAMES, "default");
  assertOneOf("Button", "shape", shape, ["rounded", "pill"], "rounded");
  assertOneOf("Button", "type", type, BUTTON_TYPES, "button");
  assertType("Button", "quiet", quiet, "boolean");
  assertType("Button", "iconOnly", iconOnly, "boolean");
  assertType("Button", "fullWidth", fullWidth, "boolean");
  return true;
}
function verifyTypesIconButton(component, { icon, variant, quiet, size, type } = {}) {
  assertRequired(component, "icon", icon);
  assertType(component, "icon", icon, "string");
  assertOneOf(component, "variant", variant, CONTROL_NAMES, "action");
  assertOneOf(component, "size", size, CONTROL_SIZES, "md");
  assertOneOf(component, "type", type, BUTTON_TYPES, "button");
  assertType(component, "quiet", quiet, "boolean");
  return true;
}
function verifyTypesButtonGroup({ buttons, vertical, variant, allowDeselect, onChange, value, defaultSelected } = {}) {
  assertRequired("ButtonGroup", "buttons", buttons);
  assertArrayOf("ButtonGroup", "buttons", buttons, (item, path) => {
    assertPlainObject("ButtonGroup", path, item);
    if (!item) return;
    assertIconLike("ButtonGroup", `${path}.icon`, item.icon);
    assertType("ButtonGroup", `${path}.label`, item.label, "string");
    assertType("ButtonGroup", `${path}.ariaLabel`, item.ariaLabel, "string");
    assertRef("ButtonGroup", `${path}.buttonRef`, item.buttonRef);
    if (item.icon === void 0 && item.label === void 0) {
      warn("ButtonGroup", `${path} has no \`icon\` or \`label\`: it will render empty.`);
    }
  });
  assertType("ButtonGroup", "vertical", vertical, "boolean");
  assertType("ButtonGroup", "allowDeselect", allowDeselect, "boolean");
  assertOneOf("ButtonGroup", "variant", variant, CONTROL_NAMES, "support");
  assertType("ButtonGroup", "onChange", onChange, "function");
  assertType("ButtonGroup", "value", value, "number");
  assertType("ButtonGroup", "defaultSelected", defaultSelected, "number");
  return true;
}
function verifyTypesIcon({ name, size, filled: filled2, weight, grade, opticalSize } = {}) {
  assertType("Icon", "name", name, "string");
  assertType("Icon", "size", size, "string");
  assertType("Icon", "filled", filled2, "boolean");
  assertRange("Icon", "weight", weight, 100, 700);
  assertRange("Icon", "grade", grade, -50, 200);
  assertRange("Icon", "opticalSize", opticalSize, 20, 48);
  return true;
}
function verifyTypesShape({ name, size, color, contentColor, points, rotate, label } = {}) {
  assertRequired("Shape", "name", name);
  assertOneOf("Shape", "name", name, SHAPE_NAMES);
  assertType("Shape", "size", size, "string");
  assertType("Shape", "color", color, "string");
  assertType("Shape", "contentColor", contentColor, "string");
  assertType("Shape", "label", label, "string");
  assertRange("Shape", "points", points, 3, 24);
  assertRange("Shape", "rotate", rotate, -360, 360);
  if (typeof color === "string" && !ACCENTS[color] && CONTROL_NAMES.includes(color)) {
    warn("Shape", `\`color\` takes an accent (${Object.keys(ACCENTS).join(", ")}) or any CSS colour, not the button intent ${show(color)}.`);
  }
  if (points !== void 0 && points !== null && !SCALLOPED_SHAPES.includes(name)) {
    warn("Shape", `\`points\` only applies to ${SCALLOPED_SHAPES.join(" and ")}: it does nothing on ${show(name)}.`);
  }
  return true;
}
function verifyTypesAvatar({ seed, styleDefinition, options, size, shape, alt } = {}) {
  assertRequired("Avatar", "seed", seed);
  assertType("Avatar", "seed", seed, "string");
  assertType("Avatar", "size", size, "string");
  assertType("Avatar", "alt", alt, "string");
  assertOneOf("Avatar", "shape", shape, SHAPE_NAMES);
  assertPlainObject("Avatar", "styleDefinition", styleDefinition);
  assertPlainObject("Avatar", "options", options);
  return true;
}
function verifyTypesSelect({ options, onChange, label, placeholder, disabled } = {}) {
  assertArrayOf("Select", "options", options, (item, path) => {
    assertPlainObject("Select", path, item);
    if (!item) return;
    assertRequired("Select", `${path}.value`, item.value);
    assertNode("Select", `${path}.label`, item.label);
  });
  assertType("Select", "onChange", onChange, "function");
  assertType("Select", "label", label, "string");
  assertType("Select", "placeholder", placeholder, "string");
  assertType("Select", "disabled", disabled, "boolean");
  return true;
}
function verifyTypesProgress({ value, color } = {}) {
  assertRange("Progress", "value", value, 0, 100);
  assertType("Progress", "color", color, "string");
  return true;
}
function verifyTypesLoading({ size, color } = {}) {
  assertOneOf("Loading", "size", size, CONTROL_SIZES, "sm");
  assertType("Loading", "color", color, "string");
  return true;
}
function verifyTypesDropdown({ open, onClose, triggerRef } = {}) {
  assertType("Dropdown", "open", open, "boolean");
  assertType("Dropdown", "onClose", onClose, "function");
  assertRef("Dropdown", "triggerRef", triggerRef);
  return true;
}
function verifyTypesCustomModal({ open, onClose, onCloseComplete, triggerRef, animation } = {}) {
  assertType("CustomModal", "open", open, "boolean");
  assertType("CustomModal", "onClose", onClose, "function");
  assertType("CustomModal", "onCloseComplete", onCloseComplete, "function");
  assertRef("CustomModal", "triggerRef", triggerRef);
  if (animation !== void 0 && animation !== null) {
    if (typeof (animation == null ? void 0 : animation.open) !== "function" || typeof (animation == null ? void 0 : animation.close) !== "function") {
      fail("CustomModal", "`animation` must be a ModalAnimation (with `open` and `close` methods). See src/animations/modalAnimation.js.");
    }
  }
  return true;
}
function verifyTypesNavbar({ items, logo, selected, defaultSelected, onChange, align } = {}) {
  assertArrayOf("Navbar", "items", items, (item, path) => {
    assertPlainObject("Navbar", path, item);
    if (!item) return;
    assertIconLike("Navbar", `${path}.icon`, item.icon);
    assertType("Navbar", `${path}.label`, item.label, "string");
    assertRef("Navbar", `${path}.buttonRef`, item.buttonRef);
  });
  if (logo !== void 0 && logo !== null) {
    assertPlainObject("Navbar", "logo", logo);
    assertRequired("Navbar", "logo.icon", logo.icon);
    assertIconLike("Navbar", "logo.icon", logo.icon);
    assertType("Navbar", "logo.label", logo.label, "string");
    assertType("Navbar", "logo.onClick", logo.onClick, "function");
    assertType("Navbar", "logo.active", logo.active, "boolean");
    assertRef("Navbar", "logo.buttonRef", logo.buttonRef);
  }
  assertType("Navbar", "selected", selected, "number");
  assertType("Navbar", "defaultSelected", defaultSelected, "number");
  assertType("Navbar", "onChange", onChange, "function");
  assertOneOf("Navbar", "align", align, ["top", "center"], "center");
  return true;
}
function verifyTypesDragScroll({ axis, inertia, disabled, fade, fadeSize } = {}) {
  assertOneOf("DragScroll", "axis", axis, ["y", "x", "both"], "y");
  assertType("DragScroll", "inertia", inertia, "boolean");
  assertType("DragScroll", "disabled", disabled, "boolean");
  assertType("DragScroll", "fade", fade, "boolean");
  assertRange("DragScroll", "fadeSize", fadeSize, 0, 200);
  return true;
}
function verifyTypesToast({ variant, open, title, duration, dismissThreshold, onClose, onExited } = {}) {
  assertOneOf("Toast", "variant", variant, TOAST_VARIANTS, "info");
  assertType("Toast", "open", open, "boolean");
  assertNode("Toast", "title", title);
  assertRange("Toast", "duration", duration, 0, 6e5);
  assertType("Toast", "onClose", onClose, "function");
  assertType("Toast", "onExited", onExited, "function");
  if (dismissThreshold !== void 0 && dismissThreshold !== null) {
    assertType("Toast", "dismissThreshold", dismissThreshold, "number");
    if (!(dismissThreshold > 0 && dismissThreshold <= 1)) {
      fail("Toast", `\`dismissThreshold\` must be a number greater than 0 and at most 1, received ${show(dismissThreshold)}.`);
    }
  }
  return true;
}
function verifyTypesShowToast({ variant, title, message, duration } = {}) {
  assertOneOf("useToast", "variant", variant, TOAST_VARIANTS, "info");
  assertNode("useToast", "title", title);
  assertNode("useToast", "message", message);
  assertRange("useToast", "duration", duration, 0, 6e5);
  if (title === void 0 && message === void 0) {
    warn("useToast", "showToast() called without `title` or `message`: the toast will render empty.");
  }
  return true;
}
function verifyTypesToastProvider({ duration, dismissThreshold, max } = {}) {
  assertRange("ToastProvider", "duration", duration, 0, 6e5);
  assertRange("ToastProvider", "max", max, 1, 20);
  if (dismissThreshold !== void 0 && dismissThreshold !== null) {
    assertType("ToastProvider", "dismissThreshold", dismissThreshold, "number");
    if (!(dismissThreshold > 0 && dismissThreshold <= 1)) {
      fail("ToastProvider", `\`dismissThreshold\` must be a number greater than 0 and at most 1, received ${show(dismissThreshold)}.`);
    }
  }
  return true;
}
var THEME_MODES = ["light", "dark", "system"];
var THEME_VARIANTS = ["content", "monochrome", "neutral", "tonalSpot", "vibrant"];
var HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
var isThemeSeed = (value) => typeof value === "string" && HEX_COLOR.test(value);
var isThemeMode = (value) => THEME_MODES.includes(value);
var isThemeVariant = (value) => THEME_VARIANTS.includes(value);
function verifyTypesThemeSeed(component, prop, value) {
  if (isThemeSeed(value)) return true;
  warn(component, `\`${prop}\` must be a hex colour like "#0066ff", received ${show(value)}. Ignoring it.`);
  return false;
}
function verifyTypesThemeMode(component, prop, value) {
  if (isThemeMode(value)) return true;
  warn(component, `invalid \`${prop}\`: ${show(value)}. Valid values: ${THEME_MODES.join(", ")}. Ignoring it.`);
  return false;
}
function verifyTypesThemeVariant(component, prop, value) {
  if (isThemeVariant(value)) return true;
  warn(component, `invalid \`${prop}\`: ${show(value)}. Valid values: ${THEME_VARIANTS.join(", ")}. Ignoring it.`);
  return false;
}
function verifyTypesThemeModal({ open, onClose, triggerRef, title } = {}) {
  assertType("ThemeModal", "open", open, "boolean");
  assertType("ThemeModal", "onClose", onClose, "function");
  assertType("ThemeModal", "title", title, "string");
  assertRef("ThemeModal", "triggerRef", triggerRef);
  return true;
}
function verifyTypesThemeProvider({ defaultSeed, defaultMode, themes } = {}) {
  if (defaultSeed !== void 0 && defaultSeed !== null) {
    verifyTypesThemeSeed("ThemeProvider", "defaultSeed", defaultSeed);
  }
  if (defaultMode !== void 0 && defaultMode !== null) {
    verifyTypesThemeMode("ThemeProvider", "defaultMode", defaultMode);
  }
  assertArrayOf("ThemeProvider", "themes", themes, (item, path) => {
    assertPlainObject("ThemeProvider", path, item);
    if (!item) return;
    assertRequired("ThemeProvider", `${path}.name`, item.name);
    assertType("ThemeProvider", `${path}.name`, item.name, "string");
    verifyTypesThemeSeed("ThemeProvider", `${path}.hex`, item.hex);
    if (item.variant !== void 0 && item.variant !== null) {
      verifyTypesThemeVariant("ThemeProvider", `${path}.variant`, item.variant);
    }
  });
  return true;
}

// src/buttons/button.jsx
import { jsx } from "react/jsx-runtime";
var buttonVariants = cva("mott-btn", {
  variants: {
    shape: {
      rounded: "rounded-[var(--radius-lg)]",
      pill: "rounded-[var(--radius-full)]"
    },
    iconOnly: {
      true: "aspect-square p-[var(--pad-button-icon)]",
      false: "p-[var(--pad-button)]"
    },
    fullWidth: {
      true: "w-[100%]"
    }
  },
  defaultVariants: {
    shape: "rounded",
    iconOnly: false,
    fullWidth: false
  }
});
var Button = forwardRef(function Button2({
  children,
  variant = "default",
  quiet = false,
  shape,
  iconOnly,
  fullWidth,
  className,
  style,
  type = "button",
  onClick,
  ...props
}, ref) {
  verifyTypesButton({ variant, quiet, shape, iconOnly, fullWidth, type });
  const tint = controlTint(variant, quiet) ?? controlTint("default", quiet);
  return /* @__PURE__ */ jsx(
    "button",
    {
      ref,
      type,
      onClick,
      className: twMerge(buttonVariants({ shape, iconOnly, fullWidth }), className),
      style: {
        backgroundColor: tint.surface,
        color: tint.on,
        ...style
      },
      ...props,
      children
    }
  );
});
var button_default = Button;

// src/icon/icon.jsx
import { twMerge as twMerge2 } from "tailwind-merge";
import { jsx as jsx2 } from "react/jsx-runtime";
var SIZE_TOKEN = {
  sm: "var(--sm-icon)",
  md: "var(--md-icon)",
  lg: "var(--lg-icon)",
  xl: "var(--xl-icon)"
};
function Icon({
  name,
  size = "md",
  filled: filled2 = true,
  weight = 500,
  grade = 200,
  opticalSize = 24,
  className,
  style
}) {
  verifyTypesIcon({ name, size, filled: filled2, weight, grade, opticalSize });
  if (!name) return null;
  const iconSize = SIZE_TOKEN[size] ?? size;
  return /* @__PURE__ */ jsx2(
    "span",
    {
      className: twMerge2("material-symbols-rounded select-none", className),
      "aria-hidden": "true",
      style: {
        fontSize: iconSize,
        fontVariationSettings: `'FILL' ${filled2 ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
        ...style
      },
      children: name
    }
  );
}

// src/buttons/fabButton.jsx
import { jsx as jsx3 } from "react/jsx-runtime";
var FAB_SIZE = {
  sm: { box: "var(--control-size-sm)", icon: "var(--lg-icon)" },
  md: { box: "var(--control-size-md)", icon: "var(--lg-icon)" },
  lg: { box: "var(--control-size-lg)", icon: "var(--xl-icon)" }
};
function FabButton({
  variant = "action",
  quiet = false,
  icon,
  size = "md",
  type = "button",
  onClick,
  style,
  ...props
}) {
  verifyTypesIconButton("FabButton", { icon, variant, quiet, size, type });
  const dimensions = FAB_SIZE[size] ?? FAB_SIZE.md;
  const tint = controlTint(variant, quiet) ?? controlTint("action", quiet);
  return /* @__PURE__ */ jsx3(
    "button",
    {
      type,
      onClick,
      className: "mott-btn",
      style: {
        width: dimensions.box,
        height: dimensions.box,
        padding: 0,
        borderRadius: "var(--control-radius)",
        backgroundColor: tint.surface,
        color: tint.on,
        ...style
      },
      ...props,
      children: /* @__PURE__ */ jsx3(Icon, { name: icon, size: dimensions.icon })
    }
  );
}

// src/buttons/buttonGroup.jsx
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap2 from "gsap";
import { twMerge as twMerge3 } from "tailwind-merge";

// src/animations/motion.js
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
gsap.registerPlugin(CustomEase);
var DURATION = {
  instant: 0.12,
  fast: 0.2,
  base: 0.28,
  slow: 0.4,
  modal: 0.55
};
var EASE = {
  standard: CustomEase.create("mottStandard", "0.2, 0, 0, 1"),
  emphasized: CustomEase.create("mottEmphasized", "0.32, 0.72, 0, 1"),
  inOut: CustomEase.create("mottInOut", "0.65, 0, 0.35, 1"),
  exit: CustomEase.create("mottExit", "0.3, 0, 0.8, 0.15")
};
var MORPH = {
  duration: DURATION.base,
  ease: EASE.emphasized,
  overwrite: "auto",
  force3D: true
};
var longForm = (value) => `${value} ${value} ${value} ${value} / ${value} ${value} ${value} ${value}`;
var CIRCLE_RADIUS = longForm("50%");
var squircleRadius = () => longForm(
  typeof document !== "undefined" && getComputedStyle(document.documentElement).getPropertyValue("--control-radius").trim() || "28%"
);
var prefersReducedMotion = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// src/buttons/buttonGroup.jsx
import { jsx as jsx4, jsxs } from "react/jsx-runtime";
function ButtonGroup({ buttons, vertical = true, variant = "support", defaultSelected = null, value, allowDeselect = true, onChange }) {
  verifyTypesButtonGroup({ buttons, vertical, variant, allowDeselect, onChange, value, defaultSelected });
  const [internalSelected, setInternalSelected] = useState(defaultSelected);
  const isControlled = value !== void 0;
  const selectedButton = isControlled ? value : internalSelected;
  const itemRefs = useRef([]);
  const containerRef = useRef(null);
  const prevSelectedRef = useRef(selectedButton);
  const prevCountRef = useRef(null);
  const selected = selectionTint(variant);
  const resting = FAMILIES.neutral;
  useGSAP(() => {
    itemRefs.current.length = buttons.length;
    const squircle = squircleRadius();
    const shapeOf = (i) => i === selectedButton ? { borderRadius: squircle, scale: 1.1 } : { borderRadius: CIRCLE_RADIUS, scale: 1 };
    const settleOnly = prevCountRef.current !== buttons.length;
    prevCountRef.current = buttons.length;
    if (settleOnly) {
      itemRefs.current.forEach((el, i) => {
        if (el) gsap2.set(el, shapeOf(i));
      });
      prevSelectedRef.current = selectedButton;
      return;
    }
    const changed = /* @__PURE__ */ new Set([prevSelectedRef.current, selectedButton]);
    prevSelectedRef.current = selectedButton;
    changed.forEach((i) => {
      const el = itemRefs.current[i];
      if (el) gsap2.to(el, { ...shapeOf(i), ...MORPH });
    });
  }, { dependencies: [selectedButton, buttons.length], scope: containerRef });
  const handleSelect = (i) => {
    const next = allowDeselect && selectedButton === i ? null : i;
    if (!isControlled) setInternalSelected(next);
    onChange == null ? void 0 : onChange(next, next === null ? null : buttons[i]);
  };
  return /* @__PURE__ */ jsx4("div", { ref: containerRef, className: twMerge3("inline-flex gap-[var(--gap-group)]", vertical && "flex-col"), children: buttons.map((btn, i) => {
    const iconOnly = !btn.label;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        ref: (el) => {
          itemRefs.current[i] = el;
          if (typeof btn.buttonRef === "function") btn.buttonRef(el);
          else if (btn.buttonRef) btn.buttonRef.current = el;
        },
        type: "button",
        onClick: () => handleSelect(i),
        "aria-pressed": selectedButton === i,
        "aria-label": btn.ariaLabel,
        title: btn.ariaLabel,
        className: "mott-btn-in-group",
        style: {
          backgroundColor: i === selectedButton ? selected.surface : resting.container,
          color: i === selectedButton ? selected.on : resting.onContainer,
          borderRadius: CIRCLE_RADIUS,
          height: "var(--control-size-md)",
          ...iconOnly ? { width: "var(--control-size-md)", padding: 0 } : { padding: "0 20px" }
        },
        children: [
          btn.icon && (typeof btn.icon === "string" ? /* @__PURE__ */ jsx4(Icon, { name: btn.icon }) : btn.icon),
          btn.label && /* @__PURE__ */ jsx4("span", { children: btn.label })
        ]
      },
      btn.id ?? i
    );
  }) });
}

// src/toast/toast.jsx
import { useEffect, useRef as useRef2, useState as useState2 } from "react";
import { createPortal } from "react-dom";
import { useGSAP as useGSAP2 } from "@gsap/react";
import gsap3 from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";

// src/toast/toastStack.js
var STACK_ATTR = "data-mott-toast-stack";
var STACK_STYLE = {
  position: "fixed",
  top: "1rem",
  right: "1rem",
  width: "min(24rem, calc(100vw - 2rem))",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "var(--gap-section)",
  zIndex: "var(--z-floating)",
  pointerEvents: "none"
};
var stack = null;
function getToastStack() {
  if (typeof document === "undefined") return null;
  if (!(stack == null ? void 0 : stack.isConnected)) {
    stack = document.querySelector(`[${STACK_ATTR}]`) ?? document.createElement("div");
    stack.setAttribute(STACK_ATTR, "");
    if (!stack.isConnected) document.body.appendChild(stack);
  }
  Object.assign(stack.style, STACK_STYLE);
  return stack;
}

// src/toast/toast.jsx
import { jsx as jsx5, jsxs as jsxs2 } from "react/jsx-runtime";
gsap3.registerPlugin(Draggable, Flip);
var VARIANT_ICONS = {
  info: "info",
  success: "check_circle",
  warning: "warning",
  danger: "error"
};
var COUNTER_DRAG = 0.12;
function Toast({
  variant = "info",
  title,
  children,
  open,
  onClose,
  onExited,
  duration = 5e3,
  dismissThreshold = 0.5
}) {
  verifyTypesToast({ variant, open, title, duration, dismissThreshold, onClose, onExited });
  const [rendered, setRendered] = useState2(open);
  const toastRef = useRef2(null);
  const onCloseRef = useRef2(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const onExitedRef = useRef2(onExited);
  useEffect(() => {
    onExitedRef.current = onExited;
  }, [onExited]);
  const finishExit = () => {
    var _a;
    setRendered(false);
    (_a = onExitedRef.current) == null ? void 0 : _a.call(onExitedRef);
  };
  const dismissedRef = useRef2(false);
  const glyph = VARIANT_ICONS[variant] ?? VARIANT_ICONS.info;
  const accent = ACCENTS[variant] ?? ACCENTS.info;
  useEffect(() => {
    if (open) {
      dismissedRef.current = false;
      setRendered(true);
    }
  }, [open]);
  const exitDistance = (el) => {
    const currentX = Number(gsap3.getProperty(el, "x")) || 0;
    return currentX + (window.innerWidth - el.getBoundingClientRect().left) + 16;
  };
  const flyOut = (el, { ease, duration: duration2, onDone }) => {
    const stack3 = el.parentElement;
    const siblings = stack3 ? Array.from(stack3.children).filter((c) => c !== el) : [];
    const state = siblings.length ? Flip.getState(siblings) : null;
    const rect = el.getBoundingClientRect();
    const scaleX = Number(gsap3.getProperty(el, "scaleX")) || 1;
    const top = stack3 ? rect.top - stack3.getBoundingClientRect().top : 0;
    Object.assign(el.style, {
      position: "absolute",
      top: `${top}px`,
      right: "0",
      width: `${rect.width / scaleX}px`
    });
    if (state) Flip.from(state, { duration: duration2, ease: "power3.out" });
    gsap3.to(el, { x: exitDistance(el), duration: duration2, ease, onComplete: onDone });
  };
  const timerRef = useRef2(null);
  const remainingRef = useRef2(duration);
  const startedAtRef = useRef2(0);
  const pauseTimer = () => {
    if (!timerRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
    remainingRef.current -= Date.now() - startedAtRef.current;
  };
  const resumeTimer = () => {
    if (!duration || timerRef.current || remainingRef.current <= 0) return;
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      var _a;
      return (_a = onCloseRef.current) == null ? void 0 : _a.call(onCloseRef);
    }, remainingRef.current);
  };
  useEffect(() => {
    if (!open || !duration) return;
    remainingRef.current = duration;
    resumeTimer();
    return pauseTimer;
  }, [open, duration]);
  useGSAP2(() => {
    if (open && toastRef.current) {
      gsap3.fromTo(
        toastRef.current,
        { opacity: 0, x: 24, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: DURATION.slow, ease: "back.out(1.7)", overwrite: "auto" }
      );
    }
  }, { dependencies: [open, rendered] });
  useEffect(() => {
    if (open || !rendered || !toastRef.current) return;
    if (dismissedRef.current) {
      finishExit();
      return;
    }
    flyOut(toastRef.current, {
      ease: "back.in(1.7)",
      duration: DURATION.slow,
      onDone: finishExit
    });
  }, [open, rendered]);
  useEffect(() => {
    if (!rendered || !toastRef.current) return;
    const el = toastRef.current;
    const width = el.offsetWidth;
    const threshold = width * dismissThreshold;
    const [draggable] = Draggable.create(el, {
      type: "x",
      // the stack sits top-right, so dismissal goes towards the nearest edge; only a small tug
      // is allowed back towards the content
      bounds: { minX: -width * COUNTER_DRAG, maxX: width, minY: 0, maxY: 0 },
      onPressInit: pauseTimer,
      onDrag: function() {
        gsap3.set(el, { opacity: 1 - Math.min(Math.abs(this.x) / threshold, 1) * 0.6 });
      },
      onDragEnd: function() {
        if (this.x >= threshold) {
          dismissedRef.current = true;
          flyOut(el, {
            ease: EASE.exit,
            duration: DURATION.base,
            onDone: () => {
              var _a;
              return (_a = onCloseRef.current) == null ? void 0 : _a.call(onCloseRef);
            }
          });
        } else {
          gsap3.to(el, { x: 0, opacity: 1, duration: DURATION.base, ease: EASE.standard, overwrite: "auto" });
          resumeTimer();
        }
      }
    });
    return () => draggable.kill();
  }, [rendered, dismissThreshold]);
  if (!rendered) return null;
  const stack2 = getToastStack();
  if (!stack2) return null;
  return createPortal(
    /* @__PURE__ */ jsxs2(
      "div",
      {
        ref: toastRef,
        role: "status",
        onMouseEnter: pauseTimer,
        onMouseLeave: resumeTimer,
        className: "inline-flex items-center gap-3 rounded-[var(--radius-lg)] cursor-grab active:cursor-grabbing",
        style: {
          padding: "var(--pad-stat)",
          // same neutral surface for all four variants: the variant shows in the icon, not in
          // the panel. `surface-container-high` is the step Dropdown and the Select panel also
          // use, so everything that floats above the page sits at the same elevation.
          backgroundColor: "var(--md-sys-color-surface-container-high)",
          boxShadow: "var(--shadow-floating)",
          // sized by its text, with no minimum: a short toast has no reason to drag empty space
          // around. The cap comes from the stack, which has a fixed width - that is where the
          // text starts wrapping.
          maxWidth: "100%",
          // the stack sets `pointer-events: none` so it does not block the page; each toast
          // re-enables itself
          pointerEvents: "auto"
        },
        children: [
          /* @__PURE__ */ jsx5(Icon, { name: glyph, size: "xl", className: "shrink-0", style: { color: accent } }),
          /* @__PURE__ */ jsxs2("div", { className: "flex min-w-0 flex-col gap-0.5", children: [
            title && /* @__PURE__ */ jsx5("span", { className: "text-[length:var(--text-sm)] font-[number:var(--font-medium)] text-[var(--md-sys-color-on-surface)]", children: title }),
            /* @__PURE__ */ jsx5("span", { className: "text-[length:var(--text-sm)] text-[var(--md-sys-color-on-surface-variant)]", children })
          ] })
        ]
      }
    ),
    stack2
  );
}

// src/toast/toastContext.jsx
import { createContext, useCallback, useContext, useMemo, useRef as useRef3, useState as useState3 } from "react";
import { jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
var ToastContext = createContext(null);
var DEFAULT_DURATION = 5e3;
var DEFAULT_DISMISS_THRESHOLD = 0.5;
var DEFAULT_MAX = 4;
var normalize = (options) => typeof options === "string" ? { message: options } : options ?? {};
function ToastProvider({
  children,
  duration = DEFAULT_DURATION,
  dismissThreshold = DEFAULT_DISMISS_THRESHOLD,
  max = DEFAULT_MAX
}) {
  verifyTypesToastProvider({ duration, dismissThreshold, max });
  const [toasts, setToasts] = useState3([]);
  const idRef = useRef3(0);
  const showToast = useCallback((options) => {
    const payload = normalize(options);
    verifyTypesShowToast(payload);
    const id = ++idRef.current;
    setToasts((prev) => {
      const next = [...prev, { variant: "info", duration, ...payload, id, open: true }];
      return next.length > max ? next.slice(next.length - max) : next;
    });
    return id;
  }, [duration, max]);
  const closeToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, open: false } : t));
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const closeAll = useCallback(() => {
    setToasts((prev) => prev.map((t) => ({ ...t, open: false })));
  }, []);
  const api = useMemo(() => ({
    showToast,
    closeToast,
    closeAll,
    info: (options) => showToast({ ...normalize(options), variant: "info" }),
    success: (options) => showToast({ ...normalize(options), variant: "success" }),
    warning: (options) => showToast({ ...normalize(options), variant: "warning" }),
    danger: (options) => showToast({ ...normalize(options), variant: "danger" })
  }), [showToast, closeToast, closeAll]);
  return /* @__PURE__ */ jsxs3(ToastContext.Provider, { value: api, children: [
    children,
    toasts.map((toast) => /* @__PURE__ */ jsx6(
      Toast,
      {
        open: toast.open,
        variant: toast.variant,
        title: toast.title,
        duration: toast.duration,
        dismissThreshold,
        onClose: () => closeToast(toast.id),
        onExited: () => removeToast(toast.id),
        children: toast.message
      },
      toast.id
    ))
  ] });
}
function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error(
      "[MOTT-COMPONENTS] useToast() must be used inside a <ToastProvider>. Wrap your app with <ToastProvider> (e.g. in app/layout.jsx) before calling toasts."
    );
  }
  return context;
}

// src/theme/themeContext.jsx
import { createContext as createContext2, useCallback as useCallback2, useContext as useContext2, useEffect as useEffect2, useMemo as useMemo2, useState as useState4 } from "react";

// src/theme/palette.js
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
  SchemeVibrant
} from "@material/material-color-utilities";
var VARIANTS = {
  content: SchemeContent,
  monochrome: SchemeMonochrome,
  neutral: SchemeNeutral,
  tonalSpot: SchemeTonalSpot,
  vibrant: SchemeVibrant
};
var DEFAULT_VARIANT = "content";
var DEFAULT_SEED = "#000000";
var SPEC_VERSION = "2021";
var SUCCESS_SEED = "#16a34a";
var WARNING_SEED = "#d97706";
var ROLES = [
  "primary",
  "onPrimary",
  "primaryContainer",
  "onPrimaryContainer",
  "secondary",
  "onSecondary",
  "secondaryContainer",
  "onSecondaryContainer",
  "tertiary",
  "onTertiary",
  "tertiaryContainer",
  "onTertiaryContainer",
  "error",
  "onError",
  "errorContainer",
  "onErrorContainer",
  "background",
  "onBackground",
  "surface",
  "onSurface",
  "surfaceVariant",
  "onSurfaceVariant",
  "outline",
  "outlineVariant",
  "shadow",
  "scrim",
  "inverseSurface",
  "inverseOnSurface",
  "inversePrimary",
  "surfaceContainerLowest",
  "surfaceContainerLow",
  "surfaceContainer",
  "surfaceContainerHigh",
  "surfaceContainerHighest"
];
var TINTED_ROLES = /* @__PURE__ */ new Set([
  "background",
  "onBackground",
  "surface",
  "onSurface",
  "surfaceVariant",
  "onSurfaceVariant",
  "surfaceContainerLowest",
  "surfaceContainerLow",
  "surfaceContainer",
  "surfaceContainerHigh",
  "surfaceContainerHighest",
  "outline",
  "outlineVariant",
  "inverseSurface",
  "inverseOnSurface"
]);
var DEFAULT_TINT = 16;
var MIN_SEED_CHROMA = 8;
var pushTint = (argb, hue, chroma) => {
  const hct = Hct.fromInt(argb);
  return Hct.from(hue, Math.max(hct.chroma, chroma), hct.tone).toInt();
};
var kebab = (role) => role.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
function buildPalette(seedHex, mode, variant = DEFAULT_VARIANT, tint = DEFAULT_TINT) {
  const argb = argbFromHex(seedHex);
  const seed = Hct.fromInt(argb);
  const Scheme = VARIANTS[variant] ?? VARIANTS[DEFAULT_VARIANT];
  const scheme = new Scheme(seed, mode === "dark", 0, SPEC_VERSION);
  const hasHue = seed.chroma >= MIN_SEED_CHROMA;
  const tintChroma = hasHue ? tint : 0;
  const tokens = {};
  for (const role of ROLES) {
    const value = MaterialDynamicColors[role].getArgb(scheme);
    const tinted = tintChroma && TINTED_ROLES.has(role) ? pushTint(value, seed.hue, tintChroma) : value;
    tokens[`--md-sys-color-${kebab(role)}`] = hexFromArgb(tinted);
  }
  for (const [name, seed2] of [["success", SUCCESS_SEED], ["warning", WARNING_SEED]]) {
    const colors = customColor(argb, { name, value: argbFromHex(seed2), blend: hasHue })[mode];
    tokens[`--md-custom-color-${name}`] = hexFromArgb(colors.color);
    tokens[`--md-custom-color-on-${name}`] = hexFromArgb(colors.onColor);
    tokens[`--md-custom-color-${name}-container`] = hexFromArgb(colors.colorContainer);
    tokens[`--md-custom-color-on-${name}-container`] = hexFromArgb(colors.onColorContainer);
  }
  return tokens;
}

// src/theme/themeContext.jsx
import { jsx as jsx7 } from "react/jsx-runtime";
var ThemeContext = createContext2(null);
var DEFAULT_MODE = "system";
var STORAGE_SEED = "mott-theme-color";
var STORAGE_MODE = "mott-theme-mode";
var STORAGE_VARIANT = "mott-theme-variant";
var THEMES_AVAILABLE = [
  { name: "negro", hex: "#000000", variant: "content" },
  { name: "gris", hex: "#8E8E93", variant: "content" },
  { name: "rosa", hex: "#d97cb9", variant: "content" },
  { name: "azul", hex: "#005eeb", variant: "content" }
];
var readStored = (key, isValid) => {
  try {
    const stored = localStorage.getItem(key);
    return isValid(stored) ? stored : null;
  } catch {
    return null;
  }
};
function ThemeProvider({
  children,
  defaultSeed = DEFAULT_SEED,
  defaultMode = DEFAULT_MODE,
  themes = THEMES_AVAILABLE
}) {
  verifyTypesThemeProvider({ defaultSeed, defaultMode, themes });
  const [colorSeedHex, setSeed] = useState4(() => isThemeSeed(defaultSeed) ? defaultSeed : DEFAULT_SEED);
  const [mode, setModeState] = useState4(() => isThemeMode(defaultMode) ? defaultMode : DEFAULT_MODE);
  const [variant, setVariantState] = useState4(DEFAULT_VARIANT);
  const [systemDark, setSystemDark] = useState4(false);
  const [hydrated, setHydrated] = useState4(false);
  useEffect2(() => {
    const storedSeed = readStored(STORAGE_SEED, isThemeSeed);
    const storedMode = readStored(STORAGE_MODE, isThemeMode);
    const storedVariant = readStored(STORAGE_VARIANT, isThemeVariant);
    if (storedSeed) setSeed(storedSeed);
    if (storedMode) setModeState(storedMode);
    if (storedVariant) setVariantState(storedVariant);
    setHydrated(true);
  }, []);
  useEffect2(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = (event) => setSystemDark(event.matches);
    setSystemDark(query.matches);
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  const resolvedMode = mode === "system" ? systemDark ? "dark" : "light" : mode;
  const tokens = useMemo2(() => buildPalette(colorSeedHex, resolvedMode, variant), [colorSeedHex, resolvedMode, variant]);
  useEffect2(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.setAttribute("data-theme-switching", "");
    for (const [token, hex] of Object.entries(tokens)) {
      root.style.setProperty(token, hex);
    }
    if (mode === "system") root.removeAttribute("data-theme");
    else root.dataset.theme = mode;
    void root.offsetHeight;
    root.removeAttribute("data-theme-switching");
  }, [tokens, mode, hydrated]);
  useEffect2(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_SEED, colorSeedHex);
      localStorage.setItem(STORAGE_MODE, mode);
      localStorage.setItem(STORAGE_VARIANT, variant);
    } catch {
    }
  }, [colorSeedHex, mode, variant, hydrated]);
  const setColorSeedHex = useCallback2((next, nextVariant = DEFAULT_VARIANT) => {
    if (!verifyTypesThemeSeed("useTheme", "setColorSeedHex", next)) return;
    if (!verifyTypesThemeVariant("useTheme", "setColorSeedHex", nextVariant)) return;
    setSeed(next);
    setVariantState(nextVariant);
  }, []);
  const setMode = useCallback2((next) => {
    if (verifyTypesThemeMode("useTheme", "setMode", next)) setModeState(next);
  }, []);
  const value = useMemo2(() => ({
    colorSeedHex,
    setColorSeedHex,
    variant,
    mode,
    setMode,
    // what `system` currently resolves to — the theme actually on screen. Use it to pick the
    // icon on a toggle; `mode` is what the user chose, `resolvedMode` is what they see.
    resolvedMode,
    THEMES_AVAILABLE: themes
  }), [colorSeedHex, setColorSeedHex, variant, mode, setMode, resolvedMode, themes]);
  return /* @__PURE__ */ jsx7(ThemeContext.Provider, { value, children });
}
function useTheme() {
  const context = useContext2(ThemeContext);
  if (!context) {
    throw new Error(
      "[MOTT-COMPONENTS] useTheme() must be used inside a <ThemeProvider>. Wrap your app with <ThemeProvider> (e.g. in app/layout.jsx) before reading the theme."
    );
  }
  return context;
}

// src/themeModal/themeModal.jsx
import { useRef as useRef5 } from "react";
import { useGSAP as useGSAP3 } from "@gsap/react";
import gsap5 from "gsap";

// src/customModal/customModal.jsx
import { useEffect as useEffect3, useRef as useRef4 } from "react";
import { twMerge as twMerge4 } from "tailwind-merge";

// src/animations/modalAnimation.js
import gsap4 from "gsap";
var MORPH_OPEN_DURATION = DURATION.modal;
var MORPH_CLOSE_DURATION = DURATION.modal;
var OPEN_BEATS = {
  morph: { at: 0, span: 1 },
  color: { at: 0, span: 1 },
  overlay: { at: 0, span: 0.6 },
  /*0.7, not 0.55: under the old fast-headed curve the panel was already at 97% of its size by
    0.55, but `inOut` splits the journey evenly and only reaches 59% there - the content would
    fade in while the panel was still growing, clipped in half. At 0.7 the panel is at 89%.*/
  content: { at: 0.7, span: 0.3 }
};
var CLOSE_BEATS = {
  morph: { at: 0, span: 1 },
  color: { at: 0, span: 1 },
  overlay: { at: 0, span: 0.8 },
  content: { at: 0, span: 0.25 }
};
var GHOST_ATTR = "data-mott-morph-ghost";
var RUNNING_MORPH = /* @__PURE__ */ Symbol.for("mott.runningMorph");
function killRunningMorph(panel) {
  var _a;
  (_a = panel[RUNNING_MORPH]) == null ? void 0 : _a.kill();
  panel[RUNNING_MORPH] = null;
}
function resolveRadius(el, rect) {
  const raw = getComputedStyle(el).borderTopLeftRadius.trim();
  const parts = raw.split(/\s+/);
  const toPx = (part, basis) => {
    const value = parseFloat(part) || 0;
    return part.endsWith("%") ? value / 100 * basis : value;
  };
  const radius = Math.min(
    toPx(parts[0], rect.width),
    toPx(parts[1] ?? parts[0], rect.height)
  );
  return Math.min(radius, Math.min(rect.width, rect.height) / 2);
}
function separationProgress(from, to, target) {
  const edge = (fromV, toV, limit, sign) => {
    const delta = toV - fromV;
    if (sign * delta <= 0) return Infinity;
    const p2 = (limit - fromV) / delta;
    return p2 > 0 && p2 <= 1 ? p2 : Infinity;
  };
  const p = Math.min(
    edge(from.top, to.top, target.bottom, 1),
    // cleared downwards
    edge(from.bottom, to.bottom, target.top, -1),
    // cleared upwards
    edge(from.left, to.left, target.right, 1),
    // cleared to the right
    edge(from.right, to.right, target.left, -1)
    // cleared to the left
  );
  return Number.isFinite(p) ? p : 1;
}
var clamp01 = (v) => Math.min(1, Math.max(0, v));
var GHOST_FADE_SPAN = 0.2;
function createTriggerGhost(dialog, trigger, originRect) {
  removeTriggerGhost(dialog);
  const cs = getComputedStyle(trigger);
  const ghost = document.createElement("div");
  ghost.setAttribute(GHOST_ATTR, "");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${originRect.left}px`,
    top: `${originRect.top}px`,
    width: `${originRect.width}px`,
    height: `${originRect.height}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    color: cs.color,
    fontFamily: cs.fontFamily,
    fontSize: cs.fontSize,
    fontWeight: cs.fontWeight,
    lineHeight: cs.lineHeight,
    letterSpacing: cs.letterSpacing
  });
  const inner = document.createElement("div");
  const scale = trigger.offsetWidth ? originRect.width / trigger.offsetWidth : 1;
  Object.assign(inner.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: `scale(${scale})`
  });
  trigger.childNodes.forEach((node) => inner.appendChild(node.cloneNode(true)));
  ghost.appendChild(inner);
  dialog.appendChild(ghost);
  return ghost;
}
function removeTriggerGhost(dialog) {
  var _a;
  (_a = dialog == null ? void 0 : dialog.querySelector(`[${GHOST_ATTR}]`)) == null ? void 0 : _a.remove();
}
var ModalAnimation = class {
  open(ctx) {
  }
  close(ctx, onDone) {
    onDone == null ? void 0 : onDone();
  }
  fadeOverlay(tl, overlay, to, duration, position = 0) {
    if (!overlay) return tl;
    return to === 1 ? tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration, ease: "power1.out" }, position) : tl.to(overlay, { opacity: 0, duration, ease: "power1.in" }, position);
  }
};
var FadeScaleAnimation = class extends ModalAnimation {
  open({ panel, overlay }) {
    if (prefersReducedMotion()) {
      gsap4.set(panel, { opacity: 1, y: 0, scale: 1 });
      if (overlay) gsap4.set(overlay, { opacity: 1 });
      return;
    }
    const tl = gsap4.timeline();
    this.fadeOverlay(tl, overlay, 1, DURATION.fast);
    tl.fromTo(
      panel,
      { opacity: 0, y: 12, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: DURATION.base, ease: EASE.standard },
      0
    );
  }
  close({ panel, overlay }, onDone) {
    if (prefersReducedMotion()) {
      if (overlay) gsap4.set(overlay, { opacity: 0 });
      onDone == null ? void 0 : onDone();
      return;
    }
    const tl = gsap4.timeline({ onComplete: () => onDone == null ? void 0 : onDone() });
    this.fadeOverlay(tl, overlay, 0, DURATION.fast);
    tl.to(panel, { opacity: 0, y: 12, scale: 0.94, duration: DURATION.fast, ease: EASE.exit }, 0);
  }
};
var MorphAnimation = class extends ModalAnimation {
  constructor({
    openDuration = MORPH_OPEN_DURATION,
    closeDuration = MORPH_CLOSE_DURATION,
    openBeats = {},
    closeBeats = {},
    openEase = EASE.inOut,
    closeEase = EASE.inOut,
    closeGhost = true,
    ghostFade = 0.2
  } = {}) {
    super();
    this.openDuration = openDuration;
    this.closeDuration = closeDuration;
    this.openBeats = { ...OPEN_BEATS, ...openBeats };
    this.closeBeats = { ...CLOSE_BEATS, ...closeBeats };
    this.openEase = openEase;
    this.closeEase = closeEase;
    this.closeGhost = closeGhost;
    this.ghostFade = ghostFade;
  }
  // Hooks for subclasses that position the panel before it is measured (see AnchoredAnimation).
  // `placedProps` names the inline props such a subclass sets, so `settle` knows what to clear.
  place() {
  }
  placedProps() {
    return "";
  }
  // Everything the morph needs, measured once against the final layout:
  // `buttonOffset` drops the panel's padding box onto the trigger, `buttonClip` shrinks it to the
  // trigger's exact rect, and `openClip` opens it back up. Live transforms are backed out of
  // `panelRect` so a re-measure mid-flight still reports the panel's resting position.
  measure(panel, trigger) {
    panel.style.borderRadius = "";
    const cs = getComputedStyle(panel);
    const pad = { top: parseFloat(cs.paddingTop) || 0, left: parseFloat(cs.paddingLeft) || 0 };
    const rect = panel.getBoundingClientRect();
    const tx = Number(gsap4.getProperty(panel, "x")) || 0;
    const ty = Number(gsap4.getProperty(panel, "y")) || 0;
    const panelRect = { left: rect.left - tx, top: rect.top - ty, width: rect.width, height: rect.height };
    const originRect = trigger.getBoundingClientRect();
    const panelBox = { ...panelRect, right: panelRect.left + panelRect.width, bottom: panelRect.top + panelRect.height };
    return {
      pad,
      panelRect,
      originRect,
      clearP: separationProgress(originRect, panelBox, originRect),
      openClip: { top: 0, right: 0, bottom: 0, left: 0, radius: resolveRadius(panel, panelRect) },
      buttonClip: {
        top: pad.top,
        right: Math.max(0, panelRect.width - pad.left - originRect.width),
        bottom: Math.max(0, panelRect.height - pad.top - originRect.height),
        left: pad.left,
        radius: resolveRadius(trigger, originRect)
      },
      buttonOffset: {
        x: originRect.left - panelRect.left - pad.left,
        y: originRect.top - panelRect.top - pad.top
      }
    };
  }
  // GSAP cannot interpolate `inset(... round ...)`, so the clip is written and read by hand and
  // driven from a scalar tween (see addClipTween).
  applyClip(panel, clip) {
    panel.style.clipPath = `inset(${clip.top}px ${clip.right}px ${clip.bottom}px ${clip.left}px round ${clip.radius}px)`;
  }
  // recovers the clip an interrupted opening left behind, so a close starts from where it really is
  readClip(panel, fallback) {
    const match = /inset\(([^)]+)\)/.exec(panel.style.clipPath || "");
    if (!match) return fallback;
    const parts = match[1].trim().split(/\s+/);
    const at = (i) => parseFloat(parts[i]);
    return { top: at(0), right: at(1), bottom: at(2), left: at(3), radius: at(5) };
  }
  addClipTween(tl, panel, from, to, duration, ease, position = 0, onProgress) {
    const state = { p: 0 };
    const lerp = (a, b) => a + (b - a) * state.p;
    this.applyClip(panel, from);
    onProgress == null ? void 0 : onProgress(0);
    tl.to(state, {
      p: 1,
      duration,
      ease,
      onUpdate: () => {
        this.applyClip(panel, {
          top: lerp(from.top, to.top),
          right: lerp(from.right, to.right),
          bottom: lerp(from.bottom, to.bottom),
          left: lerp(from.left, to.left),
          radius: lerp(from.radius, to.radius)
        });
        onProgress == null ? void 0 : onProgress(state.p);
      }
    }, position);
  }
  // Two ways to fade the ghost. When the panel separates from the trigger mid-morph (`clearP < 1`)
  // the fade is driven by geometry so it lands on that exact moment - hence a progress callback for
  // the clip tween. Otherwise the trigger stays covered and a plain time-based tween will do.
  addGhostFade(tl, ghost, clearP, morphAt, morphSpan, reverse = false) {
    if (clearP < 1) return this.ghostFader(ghost, clearP, reverse);
    const span = morphSpan * this.ghostFade;
    if (reverse) tl.to(ghost, { opacity: 1, duration: span, ease: "power1.out" }, morphAt + morphSpan - span);
    else tl.to(ghost, { opacity: 0, duration: span, ease: "power1.in" }, morphAt);
    return null;
  }
  ghostFader(ghost, clearP, reverse = false) {
    let from, span;
    if (reverse) {
      const to = 1 - clearP;
      from = Math.max(0, to - GHOST_FADE_SPAN);
      span = to - from;
    } else {
      from = Math.min(clearP, 1 - GHOST_FADE_SPAN);
      span = GHOST_FADE_SPAN;
    }
    return (p) => {
      const t = span > 0 ? clamp01((p - from) / span) : p >= from ? 1 : 0;
      ghost.style.opacity = String(reverse ? t : 1 - t);
    };
  }
  // Wipes every trace of the animation, handing the panel back to plain CSS.
  settle(dialog, panel, content, alsoClear = "") {
    removeTriggerGhost(dialog);
    panel.style.clipPath = "";
    panel[RUNNING_MORPH] = null;
    gsap4.set(panel, { clearProps: `transform,backgroundColor,borderRadius,willChange${alsoClear ? `,${alsoClear}` : ""}` });
    gsap4.set(content, { clearProps: "opacity,visibility" });
  }
  // Panel starts disguised as the trigger, then one timeline runs the lot: it slides into place, its
  // colour crossfades, the clip opens up, the content fades in and the backdrop darkens - each on
  // its own beat.
  open({ dialog, panel, content, overlay, trigger }) {
    if (!trigger) return new FadeScaleAnimation().open({ panel, overlay });
    killRunningMorph(panel);
    this.place(panel, trigger);
    if (prefersReducedMotion()) {
      this.settle(dialog, panel, content);
      if (overlay) gsap4.set(overlay, { opacity: 1 });
      return;
    }
    const { originRect, clearP, openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
    const originColor = getComputedStyle(trigger).backgroundColor;
    const finalColor = getComputedStyle(panel).backgroundColor;
    const ghost = createTriggerGhost(dialog, trigger, originRect);
    gsap4.set(panel, {
      x: buttonOffset.x,
      y: buttonOffset.y,
      backgroundColor: originColor,
      borderRadius: 0,
      willChange: "transform"
    });
    gsap4.set(content, { autoAlpha: 0 });
    const d = this.openDuration;
    const { morph, color, overlay: ov, content: cont } = this.openBeats;
    const morphAt = d * morph.at;
    const morphSpan = d * morph.span;
    const tl = gsap4.timeline({ onComplete: () => this.settle(dialog, panel, content) });
    panel[RUNNING_MORPH] = tl;
    tl.to(panel, { x: 0, y: 0, duration: morphSpan, ease: this.openEase, force3D: true }, morphAt);
    tl.to(panel, {
      backgroundColor: finalColor,
      duration: d * color.span,
      ease: this.openEase
    }, d * color.at);
    this.addClipTween(
      tl,
      panel,
      buttonClip,
      openClip,
      morphSpan,
      this.openEase,
      morphAt,
      this.addGhostFade(tl, ghost, clearP, morphAt, morphSpan)
    );
    tl.to(content, { autoAlpha: 1, duration: d * cont.span, ease: "power1.out" }, d * cont.at);
    this.fadeOverlay(tl, overlay, 1, d * ov.span, d * ov.at);
  }
  /*The inverse, with one difference: the clip starts from wherever an interrupted opening left it.
    The ghost is faded back IN here rather than out. The panel is opaque and comes to rest exactly
    on top of the trigger, so without it the trigger's label stays hidden until the <dialog> closes
    and then pops back - right at the moment the eye is following the panel down onto the button.
    `ghostFader` lands the fade on `p = 1 - clearP`, the frame the panel starts covering it again.*/
  close({ dialog, panel, content, overlay, trigger }, onDone) {
    if (!trigger) return new FadeScaleAnimation().close({ panel, overlay }, onDone);
    killRunningMorph(panel);
    removeTriggerGhost(dialog);
    if (prefersReducedMotion()) {
      if (overlay) gsap4.set(overlay, { opacity: 0 });
      onDone == null ? void 0 : onDone();
      this.settle(dialog, panel, content, this.placedProps());
      return;
    }
    const { originRect, clearP, openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
    const originColor = getComputedStyle(trigger).backgroundColor;
    const ghost = this.closeGhost ? createTriggerGhost(dialog, trigger, originRect) : null;
    if (ghost) ghost.style.opacity = "0";
    gsap4.set(panel, { borderRadius: 0, willChange: "transform" });
    const d = this.closeDuration;
    const { morph, color, overlay: ov, content: cont } = this.closeBeats;
    const morphAt = d * morph.at;
    const morphSpan = d * morph.span;
    const tl = gsap4.timeline({
      onComplete: () => {
        onDone == null ? void 0 : onDone();
        this.settle(dialog, panel, content, this.placedProps());
      }
    });
    panel[RUNNING_MORPH] = tl;
    tl.to(panel, {
      x: buttonOffset.x,
      y: buttonOffset.y,
      duration: morphSpan,
      ease: this.closeEase,
      force3D: true
    }, morphAt);
    tl.to(panel, {
      backgroundColor: originColor,
      duration: d * color.span,
      ease: this.closeEase
    }, d * color.at);
    this.addClipTween(
      tl,
      panel,
      this.readClip(panel, openClip),
      buttonClip,
      morphSpan,
      this.closeEase,
      morphAt,
      ghost ? this.addGhostFade(tl, ghost, clearP, morphAt, morphSpan, true) : void 0
    );
    tl.to(content, { autoAlpha: 0, duration: d * cont.span, ease: "power1.in" }, d * cont.at);
    this.fadeOverlay(tl, overlay, 0, d * ov.span, d * ov.at);
  }
};
var AnchoredAnimation = class extends MorphAnimation {
  constructor({ cover = 6, ...options } = {}) {
    super({
      openDuration: DURATION.slow,
      closeDuration: DURATION.slow,
      openBeats: {
        morph: { at: 0.15, span: 0.85 },
        color: { at: 0.3, span: 0.7 },
        overlay: { at: 0, span: 0.22 },
        // same recalibration as OPEN_BEATS: its morph runs 0.15-1.0, so 0.62 sat at 55%
        // of the morph's own progress and hit the identical half-grown-panel problem
        content: { at: 0.72, span: 0.28 }
      },
      closeBeats: {
        morph: { at: 0, span: 0.75 },
        color: { at: 0.12, span: 0.63 },
        overlay: { at: 0.75, span: 0.25 },
        content: { at: 0, span: 0.2 }
      },
      closeGhost: true,
      ghostFade: 0.3,
      ...options
    });
    this.cover = cover;
  }
  // Sits the panel `cover` px above and left of the trigger so it overlaps it, clamped to the viewport.
  computeAnchoredPosition(triggerRect, panelRect) {
    const margin = 8;
    const fit2 = (value, size, viewport) => Math.max(margin, Math.min(value, viewport - size - margin));
    return {
      left: fit2(triggerRect.left - this.cover, panelRect.width, window.innerWidth),
      top: fit2(triggerRect.top - this.cover, panelRect.height, window.innerHeight)
    };
  }
  place(panel, trigger) {
    gsap4.set(panel, { position: "fixed", margin: 0 });
    const { left, top } = this.computeAnchoredPosition(
      trigger.getBoundingClientRect(),
      panel.getBoundingClientRect()
    );
    gsap4.set(panel, { left, top });
  }
  placedProps() {
    return "position,left,top,margin";
  }
};
var morphAnimation = new MorphAnimation();
var fadeAnimation = new FadeScaleAnimation();
var anchoredAnimation = new AnchoredAnimation();

// src/utils/scrollLock.js
var locks = 0;
var previous = null;
function scrollbarGap() {
  return window.innerWidth - document.documentElement.clientWidth;
}
function lockScroll() {
  if (typeof document === "undefined") return;
  if (++locks > 1) return;
  const { style } = document.body;
  const gap = scrollbarGap();
  previous = { overflow: style.overflow, paddingRight: style.paddingRight };
  style.overflow = "hidden";
  if (gap > 0) {
    const current = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
    style.paddingRight = `${current + gap}px`;
  }
}
function unlockScroll() {
  if (typeof document === "undefined") return;
  if (locks === 0) return;
  if (--locks > 0) return;
  if (previous) {
    document.body.style.overflow = previous.overflow;
    document.body.style.paddingRight = previous.paddingRight;
    previous = null;
  }
}

// src/customModal/customModal.jsx
import { jsx as jsx8, jsxs as jsxs4 } from "react/jsx-runtime";
function CustomModal({ open, onClose, onCloseComplete, children, triggerRef, animation, className, style }) {
  verifyTypesCustomModal({ open, onClose, onCloseComplete, triggerRef, animation });
  const modalRef = useRef4(null);
  const overlayRef = useRef4(null);
  const panelRef = useRef4(null);
  const contentRef = useRef4(null);
  const activeAnimation = animation ?? (triggerRef ? morphAnimation : fadeAnimation);
  const lockedRef = useRef4(false);
  const lock = () => {
    if (!lockedRef.current) {
      lockedRef.current = true;
      lockScroll();
    }
  };
  const unlock = () => {
    if (lockedRef.current) {
      lockedRef.current = false;
      unlockScroll();
    }
  };
  useEffect3(() => unlock, []);
  useEffect3(() => {
    const modal = modalRef.current;
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (!modal || !panel || !overlay) return;
    const ctx = { dialog: modal, panel, content, overlay, trigger: triggerRef == null ? void 0 : triggerRef.current };
    if (open && !modal.open) {
      lock();
      modal.showModal();
      activeAnimation.open(ctx);
    } else if (!open && modal.open) {
      activeAnimation.close(ctx, () => {
        modal.close();
        unlock();
        onCloseComplete == null ? void 0 : onCloseComplete();
      });
    }
  }, [open]);
  const handleCancel = (event) => {
    event.preventDefault();
    onClose == null ? void 0 : onClose();
  };
  const handleOverlayClick = () => onClose == null ? void 0 : onClose();
  return /* @__PURE__ */ jsxs4(
    "dialog",
    {
      ref: modalRef,
      onCancel: handleCancel,
      className: "default-modal",
      children: [
        /* @__PURE__ */ jsx8(
          "div",
          {
            ref: overlayRef,
            onClick: handleOverlayClick,
            className: "absolute inset-0 bg-[color-mix(in_srgb,var(--md-sys-color-scrim)_32%,transparent)]"
          }
        ),
        /* @__PURE__ */ jsx8(
          "div",
          {
            ref: panelRef,
            className: twMerge4("relative m-auto max-w-[92vw] rounded-[var(--radius-modal)] bg-[var(--md-sys-color-surface-container-high)] p-[var(--pad-card)]", className),
            style,
            children: /* @__PURE__ */ jsx8("div", { ref: contentRef, children })
          }
        )
      ]
    }
  );
}

// src/themeModal/themeModal.jsx
import { jsx as jsx9, jsxs as jsxs5 } from "react/jsx-runtime";
var MODES = [
  { value: "light", icon: "light_mode", label: "Claro" },
  { value: "dark", icon: "dark_mode", label: "Oscuro" },
  { value: "system", icon: "brightness_4", label: "Sistema" }
];
var SWATCH = 56;
function Swatch({ theme, selected, onSelect }) {
  const ref = useRef5(null);
  const didMountRef = useRef5(false);
  useGSAP3(() => {
    if (!ref.current) return;
    const shape = {
      borderRadius: selected ? squircleRadius() : CIRCLE_RADIUS,
      scale: selected ? 1.1 : 1
    };
    if (!didMountRef.current) {
      didMountRef.current = true;
      gsap5.set(ref.current, shape);
      return;
    }
    gsap5.to(ref.current, { ...shape, ...MORPH });
  }, { dependencies: [selected] });
  return /* @__PURE__ */ jsx9(
    "button",
    {
      ref,
      type: "button",
      onClick: onSelect,
      "aria-pressed": selected,
      "aria-label": theme.name,
      title: theme.name,
      className: "cursor-pointer border-0 p-0 transition-shadow duration-[var(--duration-base)] ease-[var(--ease-emphasized)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--md-sys-color-primary)]",
      style: {
        width: SWATCH,
        height: SWATCH,
        borderRadius: CIRCLE_RADIUS,
        background: theme.hex,
        boxShadow: selected ? "0 0 0 2px var(--md-sys-color-surface-container-high), 0 0 0 4px var(--md-sys-color-on-surface)" : "none"
      }
    }
  );
}
function ThemeModal({ open, onClose, triggerRef, title = "Apariencia" }) {
  verifyTypesThemeModal({ open, onClose, triggerRef, title });
  const { colorSeedHex, variant, setColorSeedHex, mode, setMode, THEMES_AVAILABLE: THEMES_AVAILABLE2 } = useTheme();
  const isActive = (theme) => theme.hex.toLowerCase() === colorSeedHex.toLowerCase() && (theme.variant ?? variant) === variant;
  const modeIndex = MODES.findIndex((m) => m.value === mode);
  return /* @__PURE__ */ jsx9(CustomModal, { open, onClose, triggerRef, className: "w-[360px]", children: /* @__PURE__ */ jsxs5("div", { className: "flex flex-col gap-[var(--gap-page)]", children: [
    /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-[var(--gap-group)]", children: [
      /* @__PURE__ */ jsx9(Icon, { name: "palette", size: "lg", style: { color: "var(--md-sys-color-primary)" } }),
      /* @__PURE__ */ jsx9(
        "h2",
        {
          className: "font-[number:var(--font-medium)] tracking-[var(--tracking-h3)]",
          style: { fontSize: "var(--text-xl)", color: "var(--md-sys-color-on-surface)" },
          children: title
        }
      )
    ] }),
    /* @__PURE__ */ jsx9("div", { className: "flex flex-wrap gap-[var(--gap-group)]", children: THEMES_AVAILABLE2.map((theme) => /* @__PURE__ */ jsx9(
      Swatch,
      {
        theme,
        selected: isActive(theme),
        onSelect: () => setColorSeedHex(theme.hex, theme.variant)
      },
      theme.name
    )) }),
    /* @__PURE__ */ jsxs5("div", { className: "flex flex-col gap-[var(--gap-section)]", children: [
      /* @__PURE__ */ jsx9(
        "p",
        {
          className: "tracking-[var(--tracking-label)]",
          style: { fontSize: "var(--text-sm)", color: "var(--md-sys-color-on-surface-variant)" },
          children: "Modo"
        }
      ),
      /* @__PURE__ */ jsx9(
        ButtonGroup,
        {
          vertical: false,
          allowDeselect: false,
          value: modeIndex,
          onChange: (index) => setMode(MODES[index].value),
          buttons: MODES.map((m) => ({ id: m.value, icon: m.icon, ariaLabel: m.label }))
        }
      )
    ] })
  ] }) });
}

// src/input/input.jsx
import { useId } from "react";
import { twMerge as twMerge5 } from "tailwind-merge";
import { jsx as jsx10, jsxs as jsxs6 } from "react/jsx-runtime";
function Input({
  label,
  type = "text",
  id,
  className,
  style,
  placeholder,
  value,
  onChange,
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  verifyTypesInput({ label, placeholder, type });
  return /* @__PURE__ */ jsxs6("div", { className: "flex w-full flex-col gap-1", children: [
    label && /* @__PURE__ */ jsx10(
      "label",
      {
        htmlFor: inputId,
        className: "text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface-variant)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsx10(
      "input",
      {
        id: inputId,
        type,
        className: twMerge5(
          "w-full rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container)] text-[length:var(--text-base)] tracking-[var(--tracking-body)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] outline-none transition-colors duration-150 focus:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container))] disabled:opacity-50 disabled:cursor-not-allowed",
          className
        ),
        value,
        onChange: (e) => onChange == null ? void 0 : onChange(e.target.value),
        style: { padding: "var(--pad-input)", ...style },
        placeholder,
        ...props
      }
    )
  ] });
}

// src/textarea/textarea.jsx
import { useId as useId2 } from "react";
import { twMerge as twMerge6 } from "tailwind-merge";
import { jsx as jsx11, jsxs as jsxs7 } from "react/jsx-runtime";
function Textarea({
  label,
  id,
  width = "100%",
  height = "6rem",
  className,
  style,
  placeholder,
  ...props
}) {
  const generatedId = useId2();
  const textareaId = id ?? generatedId;
  verifyTypesTextarea({ label, placeholder, width, height });
  return /* @__PURE__ */ jsxs7("div", { className: "flex flex-col gap-1", style: { width }, children: [
    label && /* @__PURE__ */ jsx11(
      "label",
      {
        htmlFor: textareaId,
        className: "text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface-variant)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsx11(
      "textarea",
      {
        id: textareaId,
        className: twMerge6(
          "w-full rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container)] text-[length:var(--text-base)] tracking-[var(--tracking-body)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] outline-none transition-colors duration-150 focus:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container))] disabled:opacity-50 disabled:cursor-not-allowed",
          className
        ),
        style: {
          padding: "var(--pad-input)",
          height,
          resize: "none",
          overflow: "hidden",
          ...style
        },
        placeholder
      }
    )
  ] });
}

// src/select/select.jsx
import { useEffect as useEffect4, useId as useId3, useRef as useRef6, useState as useState5 } from "react";
import { createPortal as createPortal2 } from "react-dom";
import { useGSAP as useGSAP4 } from "@gsap/react";
import gsap6 from "gsap";
import { jsx as jsx12, jsxs as jsxs8 } from "react/jsx-runtime";
function Select({ options = [], value, onChange, label, placeholder = "Seleccionar", disabled, id }) {
  verifyTypesSelect({ options, onChange, label, placeholder, disabled });
  const [open, setOpen] = useState5(false);
  const [rendered, setRendered] = useState5(false);
  const [anchor, setAnchor] = useState5(null);
  const wrapperRef = useRef6(null);
  const triggerRef = useRef6(null);
  const panelRef = useRef6(null);
  const generatedId = useId3();
  const selectId = id ?? generatedId;
  const selected = options.find((o) => o.value === value);
  useEffect4(() => {
    if (!open) return;
    const syncAnchor = () => {
      var _a;
      const rect = (_a = triggerRef.current) == null ? void 0 : _a.getBoundingClientRect();
      if (rect) setAnchor({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    };
    syncAnchor();
    setRendered(true);
    window.addEventListener("scroll", syncAnchor, true);
    window.addEventListener("resize", syncAnchor);
    return () => {
      window.removeEventListener("scroll", syncAnchor, true);
      window.removeEventListener("resize", syncAnchor);
    };
  }, [open]);
  useGSAP4(() => {
    if (open && panelRef.current) {
      const el = panelRef.current;
      const targetHeight = el.scrollHeight;
      gsap6.fromTo(
        el,
        { height: 0, opacity: 0 },
        {
          height: targetHeight,
          opacity: 1,
          duration: DURATION.base,
          ease: EASE.standard,
          overwrite: "auto",
          onComplete: () => gsap6.set(el, { height: "auto" })
        }
      );
    }
  }, { dependencies: [open, rendered] });
  useEffect4(() => {
    if (!open && rendered && panelRef.current) {
      gsap6.to(panelRef.current, {
        height: 0,
        opacity: 0,
        duration: DURATION.fast,
        ease: EASE.exit,
        overwrite: "auto",
        onComplete: () => setRendered(false)
      });
    }
  }, [open, rendered]);
  useEffect4(() => {
    if (!open) return;
    const handleClick = (e) => {
      var _a, _b;
      if ((_a = wrapperRef.current) == null ? void 0 : _a.contains(e.target)) return;
      if ((_b = panelRef.current) == null ? void 0 : _b.contains(e.target)) return;
      setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);
  const handleSelect = (option) => {
    onChange == null ? void 0 : onChange(option.value, option);
    setOpen(false);
  };
  return /* @__PURE__ */ jsxs8("div", { ref: wrapperRef, className: "flex w-full flex-col gap-1", children: [
    label && /* @__PURE__ */ jsx12(
      "label",
      {
        htmlFor: selectId,
        className: "text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface-variant)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsxs8(
      "button",
      {
        ref: triggerRef,
        id: selectId,
        type: "button",
        disabled,
        onClick: () => setOpen((o) => !o),
        className: "flex w-full items-center justify-between rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container)] text-[length:var(--text-base)] tracking-[var(--tracking-body)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface)] outline-none transition-colors duration-150 focus:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container))] disabled:opacity-50 disabled:cursor-not-allowed",
        style: { padding: "var(--pad-input)" },
        children: [
          /* @__PURE__ */ jsx12("span", { className: selected ? "" : "text-[var(--md-sys-color-on-surface-variant)]", children: selected ? selected.label : placeholder }),
          /* @__PURE__ */ jsx12(Icon, { name: "expand_more", size: "sm", className: `transition-transform duration-200 ${open ? "rotate-180" : ""}` })
        ]
      }
    ),
    rendered && anchor && createPortal2(
      /* @__PURE__ */ jsx12(
        "div",
        {
          ref: panelRef,
          className: "fixed z-[var(--z-floating)] flex flex-col gap-[var(--gap-tight)] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container-high)] p-1 shadow-lg",
          style: { top: anchor.top, left: anchor.left, width: anchor.width },
          children: options.map((option) => {
            const isSelected = option.value === value;
            return /* @__PURE__ */ jsx12(
              "button",
              {
                type: "button",
                onClick: () => handleSelect(option),
                className: "rounded-[var(--radius-sm)] px-3 py-2 text-left text-[length:var(--text-base)] font-[family-name:var(--font-family)] transition-colors duration-150",
                style: {
                  backgroundColor: isSelected ? "var(--md-sys-color-primary-container)" : "transparent",
                  color: isSelected ? "var(--md-sys-color-primary)" : "var(--md-sys-color-on-surface)"
                },
                onMouseEnter: (e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent)";
                },
                onMouseLeave: (e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                },
                children: option.label
              },
              option.value
            );
          })
        }
      ),
      document.body
    )
  ] });
}

// src/search/search.jsx
import { useEffect as useEffect5, useId as useId4, useRef as useRef7, useState as useState6 } from "react";
import { twMerge as twMerge7 } from "tailwind-merge";
import { jsx as jsx13, jsxs as jsxs9 } from "react/jsx-runtime";
function Search({
  label,
  id,
  placeholder = "Buscar...",
  defaultValue = "",
  value: controlledValue,
  onChange,
  onSearch,
  delay = 400,
  className,
  style,
  ...props
}) {
  const [internalValue, setInternalValue] = useState6(defaultValue);
  const isControlled = controlledValue !== void 0;
  const value = isControlled ? controlledValue : internalValue;
  const generatedId = useId4();
  const searchId = id ?? generatedId;
  const timeoutRef = useRef7(null);
  verifyTypesSearch({ label, placeholder, delay, onSearch, onChange, value: controlledValue, defaultValue });
  useEffect5(() => {
    if (!onSearch) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onSearch(value), delay);
    return () => clearTimeout(timeoutRef.current);
  }, [value, delay, onSearch]);
  const handleChange = (event) => {
    const next = event.target.value;
    if (!isControlled) setInternalValue(next);
    onChange == null ? void 0 : onChange(next, event);
  };
  const handleClear = () => {
    if (!isControlled) setInternalValue("");
    onChange == null ? void 0 : onChange("");
    onSearch == null ? void 0 : onSearch("");
  };
  return /* @__PURE__ */ jsxs9("div", { className: "flex w-full flex-col gap-1", children: [
    label && /* @__PURE__ */ jsx13(
      "label",
      {
        htmlFor: searchId,
        className: "text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface-variant)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsxs9(
      "div",
      {
        className: twMerge7(
          "flex w-full items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container)] transition-colors duration-150 focus-within:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container))]",
          className
        ),
        style: { padding: "var(--pad-input)", ...style },
        children: [
          /* @__PURE__ */ jsx13(Icon, { name: "search", size: "sm", className: "shrink-0 text-[var(--md-sys-color-on-surface-variant)]" }),
          /* @__PURE__ */ jsx13(
            "input",
            {
              id: searchId,
              type: "search",
              value,
              onChange: handleChange,
              placeholder,
              className: "w-full bg-transparent text-[length:var(--text-base)] tracking-[var(--tracking-body)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface)] outline-none placeholder:text-[var(--md-sys-color-on-surface-variant)] [&::-webkit-search-cancel-button]:appearance-none",
              ...props
            }
          ),
          value && /* @__PURE__ */ jsx13(
            "button",
            {
              type: "button",
              onClick: handleClear,
              "aria-label": "Limpiar b\xFAsqueda",
              className: "flex shrink-0 items-center justify-center border-0 bg-transparent cursor-pointer",
              children: /* @__PURE__ */ jsx13(Icon, { name: "close", size: "sm", className: "text-[var(--md-sys-color-on-surface-variant)]" })
            }
          )
        ]
      }
    )
  ] });
}

// src/dropdown/dropdown.jsx
import { useEffect as useEffect6, useRef as useRef8, useState as useState7 } from "react";
import { useGSAP as useGSAP5 } from "@gsap/react";
import gsap7 from "gsap";
import { twMerge as twMerge8 } from "tailwind-merge";
import { jsx as jsx14 } from "react/jsx-runtime";
function Dropdown({ open, onClose, children, triggerRef, className, style, ...props }) {
  verifyTypesDropdown({ open, onClose, triggerRef });
  const [rendered, setRendered] = useState7(open);
  const panelRef = useRef8(null);
  useEffect6(() => {
    if (open) setRendered(true);
  }, [open]);
  useGSAP5(() => {
    if (!open || !panelRef.current) return;
    if (prefersReducedMotion()) {
      gsap7.set(panelRef.current, { opacity: 1, y: 0, scale: 1 });
      return;
    }
    gsap7.fromTo(
      panelRef.current,
      { opacity: 0, y: -8, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: DURATION.fast,
        ease: EASE.standard,
        transformOrigin: "top",
        overwrite: "auto"
      }
    );
  }, { dependencies: [open, rendered] });
  useEffect6(() => {
    if (!open && rendered && panelRef.current) {
      if (prefersReducedMotion()) {
        setRendered(false);
        return;
      }
      gsap7.to(panelRef.current, {
        opacity: 0,
        y: -8,
        scale: 0.96,
        duration: DURATION.instant,
        ease: EASE.exit,
        overwrite: "auto",
        onComplete: () => setRendered(false)
      });
    }
  }, [open, rendered]);
  useEffect6(() => {
    if (!open) return;
    const handleClick = (e) => {
      var _a, _b;
      if ((_a = panelRef.current) == null ? void 0 : _a.contains(e.target)) return;
      if ((_b = triggerRef == null ? void 0 : triggerRef.current) == null ? void 0 : _b.contains(e.target)) return;
      onClose == null ? void 0 : onClose();
    };
    const handleKey = (e) => {
      if (e.key === "Escape") onClose == null ? void 0 : onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose, triggerRef]);
  if (!rendered) return null;
  return /* @__PURE__ */ jsx14(
    "div",
    {
      ref: panelRef,
      role: "menu",
      className: twMerge8("z-[var(--z-floating)] rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container-high)] p-1 shadow-lg", className),
      style: { ...style },
      ...props,
      children
    }
  );
}

// src/loading/loading.jsx
import { useRef as useRef9 } from "react";
import { useGSAP as useGSAP6 } from "@gsap/react";
import gsap8 from "gsap";
import { jsx as jsx15 } from "react/jsx-runtime";
var SHAPES = [
  "50% 50% 50% 50% / 50% 50% 50% 50%",
  // circle
  "30% 30% 30% 30% / 30% 30% 30% 30%",
  // squircle
  "22% 22% 22% 22% / 22% 22% 22% 22%",
  // rounded square
  "30% 30% 30% 30% / 30% 30% 30% 30%"
  // squircle (closes the loop)
];
var PENTAGON = "polygon(50% 0%, 97.55% 34.55%, 79.4% 90.45%, 20.6% 90.45%, 2.45% 34.55%)";
function Loading({ size = "sm", color = "primary", className, style, ...props }) {
  verifyTypesLoading({ size, color });
  const shapeRef = useRef9(null);
  const box = `var(--control-size-${size})`;
  const background = ACCENTS[color] ?? color;
  useGSAP6(() => {
    const el = shapeRef.current;
    if (prefersReducedMotion()) {
      gsap8.to(el, { rotate: 360, duration: 12, repeat: -1, ease: "none" });
      return;
    }
    const tl = gsap8.timeline({ repeat: -1 });
    const morph = (shape) => {
      tl.to(el, { borderRadius: shape, scale: 1.12, duration: 0.5, ease: "power2.out" }, "+=0.05").to(el, { scale: 1, duration: 0.45, ease: "power2.in" });
    };
    morph(SHAPES[1]);
    morph(SHAPES[2]);
    morph(SHAPES[3]);
    tl.to(el, { opacity: 0, scale: 0.85, duration: 0.2, ease: "power2.in" }, "+=0.05").set(el, { clipPath: PENTAGON }).to(el, { opacity: 1, scale: 1.12, duration: 0.3, ease: "power2.out" }).to(el, { scale: 1, duration: 0.45, ease: "power2.in" });
    tl.to(el, { opacity: 0, scale: 0.85, duration: 0.2, ease: "power2.in" }, "+=0.3").set(el, { clipPath: "none", borderRadius: SHAPES[0] }).to(el, { opacity: 1, scale: 1.12, duration: 0.3, ease: "power2.out" }).to(el, { scale: 1, duration: 0.45, ease: "power2.in" });
    gsap8.to(el, { rotate: 360, duration: 5, repeat: -1, ease: "none" });
  }, []);
  return /* @__PURE__ */ jsx15(
    "div",
    {
      ref: shapeRef,
      role: "status",
      "aria-label": "Cargando",
      className,
      style: {
        width: box,
        height: box,
        backgroundColor: background,
        borderRadius: SHAPES[0],
        boxShadow: "0 4px 14px rgb(0 0 0 / 0.2)",
        ...style
      },
      ...props
    }
  );
}

// src/loading/progress.jsx
import { useRef as useRef10 } from "react";
import { useGSAP as useGSAP7 } from "@gsap/react";
import gsap9 from "gsap";
import { jsx as jsx16 } from "react/jsx-runtime";
function Progress({ value, color = "primary", className, style, ...props }) {
  verifyTypesProgress({ value, color });
  const fillRef = useRef10(null);
  const trackRef = useRef10(null);
  const resolved = ACCENTS[color] ?? color;
  const indeterminate = value === void 0 || value === null;
  useGSAP7(() => {
    if (indeterminate) {
      gsap9.set(fillRef.current, { xPercent: -100 });
      gsap9.to(fillRef.current, { xPercent: 200, duration: prefersReducedMotion() ? 3 : 1.2, repeat: -1, ease: "none" });
    } else {
      gsap9.killTweensOf(fillRef.current);
      const width = `${Math.min(100, Math.max(0, value))}%`;
      if (prefersReducedMotion()) gsap9.set(fillRef.current, { width });
      else gsap9.to(fillRef.current, { width, duration: DURATION.slow, ease: EASE.standard });
    }
  }, { dependencies: [indeterminate, value] });
  return /* @__PURE__ */ jsx16(
    "div",
    {
      ref: trackRef,
      role: "progressbar",
      "aria-valuenow": indeterminate ? void 0 : value,
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      className,
      style: { width: "100%", height: 8, borderRadius: "var(--radius-full)", backgroundColor: "var(--md-sys-color-surface-container)", overflow: "hidden", position: "relative", ...style },
      ...props,
      children: /* @__PURE__ */ jsx16(
        "div",
        {
          ref: fillRef,
          style: indeterminate ? { position: "absolute", inset: 0, width: "40%", background: `linear-gradient(90deg, transparent, ${resolved}, transparent)` } : { height: "100%", width: 0, borderRadius: "var(--radius-full)", backgroundColor: resolved }
        }
      )
    }
  );
}

// src/navbar/navbar.jsx
import { useRef as useRef11, useState as useState8 } from "react";
import { useGSAP as useGSAP8 } from "@gsap/react";
import gsap10 from "gsap";
import { twMerge as twMerge9 } from "tailwind-merge";
import { Fragment, jsx as jsx17, jsxs as jsxs10 } from "react/jsx-runtime";
var DESKTOP_ALIGN = {
  center: "top-1/2 -translate-y-1/2",
  top: "top-8"
};
var ITEM_BASE = "inline-flex items-center justify-center gap-2 border-0 cursor-pointer p-0 text-[length:var(--text-md)] tracking-[var(--tracking-h4)] font-[number:var(--font-medium)] bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] transition-[background-color,color] duration-[var(--duration-base)] ease-[var(--ease-emphasized)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--md-sys-color-primary)]";
var ITEM_SELECTED = "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]";
var attachRef = (node, store, i, forwarded) => {
  if (i === null) store.current = node;
  else store.current[i] = node;
  if (typeof forwarded === "function") forwarded(node);
  else if (forwarded) forwarded.current = node;
};
function NavItems({ items, selectedItem, onSelect, vertical }) {
  const itemRefs = useRef11([]);
  const containerRef = useRef11(null);
  const prevSelectedRef = useRef11(selectedItem);
  const prevCountRef = useRef11(null);
  useGSAP8(() => {
    itemRefs.current.length = items.length;
    const squircle = squircleRadius();
    const shapeOf = (i) => i === selectedItem ? { borderRadius: squircle, scale: 1.1 } : { borderRadius: CIRCLE_RADIUS, scale: 1 };
    const settleOnly = prevCountRef.current !== items.length;
    prevCountRef.current = items.length;
    if (settleOnly) {
      itemRefs.current.forEach((el, i) => {
        if (el) gsap10.set(el, shapeOf(i));
      });
      prevSelectedRef.current = selectedItem;
      return;
    }
    const changed = /* @__PURE__ */ new Set([prevSelectedRef.current, selectedItem]);
    prevSelectedRef.current = selectedItem;
    changed.forEach((i) => {
      const el = itemRefs.current[i];
      if (el) gsap10.to(el, { ...shapeOf(i), ...MORPH });
    });
  }, { dependencies: [selectedItem, items.length], scope: containerRef });
  return /* @__PURE__ */ jsx17("div", { ref: containerRef, className: twMerge9("inline-flex gap-[var(--gap-group)]", vertical && "flex-col"), children: items.map((item, i) => {
    const iconOnly = !item.label;
    return /* @__PURE__ */ jsxs10(
      "button",
      {
        ref: (el) => attachRef(el, itemRefs, i, item.buttonRef),
        type: "button",
        onClick: () => onSelect(i),
        "aria-pressed": selectedItem === i,
        className: twMerge9(ITEM_BASE, selectedItem === i && ITEM_SELECTED),
        style: {
          borderRadius: CIRCLE_RADIUS,
          height: "var(--control-size-md)",
          ...iconOnly ? { width: "var(--control-size-md)" } : { padding: "0 20px" }
        },
        children: [
          item.icon && (typeof item.icon === "string" ? /* @__PURE__ */ jsx17(Icon, { name: item.icon }) : item.icon),
          item.label && /* @__PURE__ */ jsx17("span", { children: item.label })
        ]
      },
      item.id ?? i
    );
  }) });
}
function LogoButton({ logo }) {
  const ref = useRef11(null);
  const didMountRef = useRef11(false);
  useGSAP8(() => {
    if (!ref.current) return;
    const shape = {
      borderRadius: logo.active ? squircleRadius() : CIRCLE_RADIUS,
      scale: logo.active ? 1.1 : 1
    };
    if (!didMountRef.current) {
      didMountRef.current = true;
      gsap10.set(ref.current, shape);
      return;
    }
    gsap10.to(ref.current, { ...shape, ...MORPH });
  }, { dependencies: [logo.active] });
  return /* @__PURE__ */ jsx17(
    "button",
    {
      ref: (el) => attachRef(el, ref, null, logo.buttonRef),
      type: "button",
      onClick: logo.onClick,
      "aria-pressed": !!logo.active,
      "aria-label": logo.label ?? "Inicio",
      className: twMerge9(ITEM_BASE, logo.active && ITEM_SELECTED),
      style: {
        width: "var(--control-size-md)",
        height: "var(--control-size-md)",
        borderRadius: CIRCLE_RADIUS
      },
      children: typeof logo.icon === "string" ? /* @__PURE__ */ jsx17(Icon, { name: logo.icon }) : logo.icon
    }
  );
}
function Navbar({
  items = [],
  selected,
  defaultSelected = null,
  onChange,
  logo,
  align = "top",
  className,
  style
}) {
  verifyTypesNavbar({ items, logo, selected, defaultSelected, onChange, align });
  const [internalSelected, setInternalSelected] = useState8(defaultSelected);
  const isControlled = selected !== void 0;
  const selectedItem = isControlled ? selected : internalSelected;
  const handleSelect = (i) => {
    if (!isControlled) setInternalSelected(i);
    onChange == null ? void 0 : onChange(i, items[i]);
  };
  return /* @__PURE__ */ jsxs10(Fragment, { children: [
    /* @__PURE__ */ jsxs10(
      "nav",
      {
        className: twMerge9(
          "hidden md:flex fixed left-4 z-[var(--z-nav)] flex-col items-center gap-[var(--gap-group)]",
          DESKTOP_ALIGN[align] ?? DESKTOP_ALIGN.center,
          className
        ),
        style,
        children: [
          logo && /* @__PURE__ */ jsx17(LogoButton, { logo }),
          /* @__PURE__ */ jsx17(NavItems, { items, selectedItem, onSelect: handleSelect, vertical: true })
        ]
      }
    ),
    /* @__PURE__ */ jsx17(
      "nav",
      {
        className: twMerge9(
          "flex md:hidden fixed bottom-4 left-1/2 z-[var(--z-nav)] -translate-x-1/2 items-center gap-3",
          className
        ),
        style,
        children: /* @__PURE__ */ jsx17(
          "div",
          {
            className: "flex items-center gap-1 rounded-[var(--radius-full)] bg-[var(--md-sys-color-surface)] p-1",
            style: { boxShadow: "var(--shadow-floating)" },
            children: /* @__PURE__ */ jsx17(NavItems, { items, selectedItem, onSelect: handleSelect, vertical: false })
          }
        )
      }
    )
  ] });
}

// src/dragScroll/dragScroll.jsx
import { useCallback as useCallback3, useEffect as useEffect7, useLayoutEffect, useRef as useRef12, useState as useState9 } from "react";
import { twMerge as twMerge10 } from "tailwind-merge";
import gsap11 from "gsap";
import { Draggable as Draggable2 } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { jsx as jsx18 } from "react/jsx-runtime";
gsap11.registerPlugin(Draggable2, InertiaPlugin);
var DRAG_TYPE = { y: "scrollTop", x: "scrollLeft", both: "scroll" };
var EDGE_RESISTANCE = 0.85;
function useDragScroll(ref, { axis = "y", inertia = true, disabled = false } = {}) {
  useEffect7(() => {
    if (disabled || !ref.current) return;
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    let draggable = null;
    const overflows = () => axis === "x" ? el.scrollWidth > el.clientWidth : axis === "both" ? el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight : el.scrollHeight > el.clientHeight;
    const sync = () => {
      if (overflows() && !draggable) {
        [draggable] = Draggable2.create(el, {
          type: DRAG_TYPE[axis] ?? DRAG_TYPE.y,
          inertia,
          edgeResistance: EDGE_RESISTANCE,
          minimumMovement: 3,
          dragClickables: true,
          cursor: "grab",
          activeCursor: "grabbing"
        });
      } else if (!overflows() && draggable) {
        draggable.kill();
        draggable = null;
        el.style.cursor = "";
      }
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => {
      observer.disconnect();
      draggable == null ? void 0 : draggable.kill();
      el.style.cursor = "";
    };
  }, [ref, axis, inertia, disabled]);
}
function useEdgeFade(ref, axis, size) {
  const [edges, setEdges] = useState9([0, 0]);
  const measure = useCallback3(() => {
    const el = ref.current;
    if (!el) return;
    const horizontal = axis === "x";
    const pos = horizontal ? el.scrollLeft : el.scrollTop;
    const total = horizontal ? el.scrollWidth : el.scrollHeight;
    const visible = horizontal ? el.clientWidth : el.clientHeight;
    const remaining = total - visible - pos;
    setEdges([Math.min(pos, size), Math.min(Math.max(remaining, 0), size)]);
  }, [ref, axis, size]);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [ref, measure]);
  return edges;
}
function DragScroll({
  children,
  axis = "y",
  inertia = true,
  disabled = false,
  fade = true,
  fadeSize,
  className,
  style,
  ...props
}) {
  verifyTypesDragScroll({ axis, inertia, disabled, fade, fadeSize });
  const scrollRef = useRef12(null);
  useDragScroll(scrollRef, { axis, inertia, disabled });
  const size = fadeSize ?? 32;
  const [fadeStart, fadeEnd] = useEdgeFade(scrollRef, axis, fade ? size : 0);
  const horizontal = axis === "x";
  return /* @__PURE__ */ jsx18(
    "div",
    {
      ref: scrollRef,
      className: twMerge10(fade && (horizontal ? "mott-fade-x" : "mott-fade-y"), className),
      style: {
        overflowX: horizontal || axis === "both" ? "auto" : "hidden",
        overflowY: horizontal ? "hidden" : "auto",
        "--mott-fade-start": `${fadeStart}px`,
        "--mott-fade-end": `${fadeEnd}px`,
        ...style
      },
      ...props,
      children
    }
  );
}

// src/shapes/shapes.jsx
import { forwardRef as forwardRef2, useId as useId5 } from "react";
import { twMerge as twMerge11 } from "tailwind-merge";
import { Fragment as Fragment2, jsx as jsx19, jsxs as jsxs11 } from "react/jsx-runtime";
var SIZE_TOKEN2 = {
  sm: "var(--control-size-sm)",
  md: "var(--control-size-md)",
  lg: "var(--control-size-lg)"
};
var spin = (degrees) => {
  if (!degrees) return "";
  const radians = degrees * Math.PI / 180;
  const inscribe = Math.round(1 / (Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians))) * 1e4) / 1e4;
  return ` translate(50 50) scale(${inscribe}) rotate(${degrees}) translate(-50 -50)`;
};
var Shape = forwardRef2(function Shape2({
  name,
  children,
  size = "lg",
  color = "primary",
  contentColor,
  points,
  rotate = 0,
  label,
  className,
  style,
  ...props
}, ref) {
  verifyTypesShape({ name, size, color, contentColor, points, rotate, label });
  const clipId = `mott-shape-${useId5().replace(/:/g, "")}`;
  if (!SHAPE_PATHS[name]) return null;
  const box = SIZE_TOKEN2[size] ?? size;
  const surface = ACCENTS[color] ?? color;
  const on = contentColor ?? ACCENT_ON[color] ?? "inherit";
  const decorative = !label && children == null;
  return /* @__PURE__ */ jsxs11(Fragment2, { children: [
    /* @__PURE__ */ jsx19(
      "svg",
      {
        "aria-hidden": "true",
        focusable: "false",
        width: "0",
        height: "0",
        style: { position: "absolute", width: 0, height: 0, overflow: "hidden" },
        children: /* @__PURE__ */ jsx19("defs", { children: /* @__PURE__ */ jsx19("clipPath", { id: clipId, clipPathUnits: "objectBoundingBox", children: /* @__PURE__ */ jsx19("path", { d: shapePath(name, { points }), transform: `scale(0.01)${spin(rotate)}` }) }) })
      }
    ),
    /* @__PURE__ */ jsx19(
      "div",
      {
        ref,
        role: label ? "img" : void 0,
        "aria-label": label,
        "aria-hidden": decorative || void 0,
        className: twMerge11("inline-flex shrink-0 items-center justify-center", className),
        style: {
          width: box,
          height: box,
          backgroundColor: surface,
          color: on,
          clipPath: `url(#${clipId})`,
          ...style
        },
        ...props,
        children
      }
    )
  ] });
});
var shapes_default = Shape;

// src/avatars/avatars.jsx
import { useMemo as useMemo3 } from "react";
import { Style, Avatar as Dicebear } from "@dicebear/core";
import critters from "@dicebear/styles/critters.json";
import { jsx as jsx20 } from "react/jsx-runtime";
var SIZE_TOKEN3 = {
  sm: "var(--control-size-sm)",
  md: "var(--control-size-md)",
  lg: "var(--control-size-lg)"
};
var CRITTERS_OPTIONS = {
  backgroundColor: [
    "b6e3f4",
    "c0aede",
    "d1d4f9",
    "ffd5dc",
    "ffdfbf",
    "d9f2d9",
    "0369a1",
    "4338ca",
    "a21caf",
    "be123c",
    "047857"
  ],
  backgroundColorAngle: -324,
  backgroundColorFillStops: 5,
  mouthProbability: 90,
  topProbability: 80,
  eyesVariant: [
    "angry",
    "bigPupils",
    "close",
    "closedLine",
    "dots",
    "happy",
    "inward",
    "mono",
    "monoSleepy",
    "round",
    "sideeye",
    "sleepy",
    "squint",
    "threeRow",
    "trio",
    "uneven",
    "wide",
    "wink"
  ],
  mouthVariant: [
    "blep",
    "catMouth",
    "dot",
    "grin",
    "laugh",
    "line",
    "ooh",
    "open",
    "smile",
    "smirk",
    "teeth",
    "tinySmile",
    "tongue",
    "tooth"
  ],
  // Explicitly off rather than simply unlisted: critters defines an `animation` component with no
  // probability of its own, so leaving it out would hand the decision to whatever DiceBear
  // defaults to. A probability of 0 is the only way to say "never" and have it stay said.
  animationProbability: 0
};
var styles = /* @__PURE__ */ new WeakMap();
var seen = 0;
var styleFor = (definition) => {
  let entry = styles.get(definition);
  if (!entry) {
    const style = new Style(definition);
    entry = { style, id: style.id() ?? `style-${seen += 1}` };
    styles.set(definition, entry);
  }
  return entry;
};
var LIMIT = 200;
var drawn = /* @__PURE__ */ new Map();
function render(definition, options) {
  const { style, id } = styleFor(definition);
  const key = JSON.stringify([id, options]);
  if (drawn.has(key)) return drawn.get(key);
  const uri = new Dicebear(style, options).toDataUri();
  drawn.set(key, uri);
  if (drawn.size > LIMIT) drawn.delete(drawn.keys().next().value);
  return uri;
}
function Avatar({
  seed,
  styleDefinition = critters,
  options,
  size = "md",
  shape,
  alt,
  className,
  style,
  ...props
}) {
  verifyTypesAvatar({ seed, styleDefinition, options, size, shape, alt });
  const uri = useMemo3(() => render(styleDefinition, {
    ...styleDefinition === critters ? CRITTERS_OPTIONS : null,
    ...options,
    seed
  }), [styleDefinition, options, seed]);
  const box = SIZE_TOKEN3[size] ?? size;
  const unselectable = { userSelect: "none", WebkitUserSelect: "none", WebkitUserDrag: "none" };
  const image = /* @__PURE__ */ jsx20(
    "img",
    {
      src: uri,
      alt: alt ?? seed,
      draggable: false,
      className: shape ? void 0 : className,
      style: shape ? { width: "100%", height: "100%", objectFit: "cover", ...unselectable } : { width: box, height: box, display: "block", objectFit: "cover", ...unselectable, ...style },
      ...shape ? null : props
    }
  );
  if (!shape) return image;
  return /* @__PURE__ */ jsx20(shapes_default, { name: shape, size, className, style, ...props, children: image });
}
export {
  AnchoredAnimation,
  Avatar,
  button_default as Button,
  ButtonGroup,
  CIRCLE_RADIUS,
  CustomModal,
  DURATION,
  DragScroll,
  Dropdown,
  EASE,
  FabButton,
  Icon,
  Input,
  Loading,
  MORPH,
  ModalAnimation,
  MorphAnimation,
  Navbar,
  Progress,
  SHAPE_NAMES,
  Search,
  Select,
  shapes_default as Shape,
  Textarea,
  ThemeModal,
  ThemeProvider,
  Toast,
  ToastProvider,
  anchoredAnimation,
  morphAnimation,
  prefersReducedMotion,
  squircleRadius,
  useDragScroll,
  useTheme,
  useToast
};
