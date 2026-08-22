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
  // Neutral is a family like the others once you see what its high-emphasis fill is: inverting the
  // page IS how a neutral thing shouts. Its container step is the ordinary raised surface.
  neutral: family(
    "--md-sys-color-inverse-surface",
    "--md-sys-color-inverse-on-surface",
    "--md-sys-color-surface-container",
    "--md-sys-color-on-surface"
  )
};
var TRANSPARENT = "transparent";
var HOVER_OPACITY = 8;
var stateLayer = (on, over, opacity = HOVER_OPACITY) => `color-mix(in srgb, ${on} ${opacity}%, ${over})`;
var filled = (name) => {
  const { fill, on } = FAMILIES[name];
  return { surface: fill, on, hover: stateLayer(on, fill) };
};
var tonal = (name) => {
  const { container, onContainer } = FAMILIES[name];
  return { surface: container, on: onContainer, hover: stateLayer(onContainer, container) };
};
var text = (name) => {
  const { fill } = FAMILIES[name];
  return { surface: TRANSPARENT, on: fill, hover: stateLayer(fill, TRANSPARENT) };
};
var CONTROL_VARIANTS = {
  primary: filled("primary"),
  secondary: filled("secondary"),
  danger: filled("danger"),
  // Keeps the name for the sake of the prop, but it is a tonal button now: a soft neutral fill
  // rather than a frame. A frame around every quiet control was what made a screen full of them
  // look busy.
  outline: tonal("neutral"),
  ghost: text("primary")
};
var CONTROL_NAMES = Object.keys(CONTROL_VARIANTS);
var controlTint = (name) => CONTROL_VARIANTS[name] ?? null;
var customTint = (surface, on) => ({
  surface,
  on,
  hover: stateLayer(on, surface)
});
var asCustomProperties = (tint) => ({
  "--mott-surface": tint.surface,
  "--mott-on": tint.on,
  "--mott-hover": tint.hover
});
var BADGE_FAMILY = {
  neutral: "neutral",
  info: "primary",
  success: "success",
  warning: "warning",
  danger: "danger"
};
var BADGE_NAMES = Object.keys(BADGE_FAMILY);
function badgeTint(name, solid) {
  const key = BADGE_FAMILY[name];
  if (!key) return null;
  const { fill, on, container, onContainer } = FAMILIES[key];
  return solid ? { surface: fill, on } : { surface: container, on: onContainer };
}
var ACCENTS = {
  primary: FAMILIES.primary.fill,
  info: FAMILIES.primary.fill,
  secondary: FAMILIES.secondary.fill,
  success: FAMILIES.success.fill,
  warning: FAMILIES.warning.fill,
  danger: FAMILIES.danger.fill
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
function verifyTypesButton({ variant, shape, iconOnly, fullWidth, type } = {}) {
  assertOneOf("Button", "variant", variant, CONTROL_NAMES, "primary");
  assertOneOf("Button", "shape", shape, ["rounded", "pill"], "rounded");
  assertOneOf("Button", "type", type, BUTTON_TYPES, "button");
  assertType("Button", "iconOnly", iconOnly, "boolean");
  assertType("Button", "fullWidth", fullWidth, "boolean");
  return true;
}
function verifyTypesIconButton(component, { icon, color, iconColor, size, type } = {}) {
  assertRequired(component, "icon", icon);
  assertType(component, "icon", icon, "string");
  assertType(component, "color", color, "string");
  assertType(component, "iconColor", iconColor, "string");
  assertOneOf(component, "size", size, CONTROL_SIZES, "md");
  assertOneOf(component, "type", type, BUTTON_TYPES, "button");
  return true;
}
function verifyTypesButtonGroup({ buttons, vertical, color, allowDeselect, onChange, value, defaultSelected } = {}) {
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
  assertType("ButtonGroup", "color", color, "string");
  assertType("ButtonGroup", "onChange", onChange, "function");
  assertType("ButtonGroup", "value", value, "number");
  assertType("ButtonGroup", "defaultSelected", defaultSelected, "number");
  return true;
}
function verifyTypesBadge({ color, solid, size, icon, dot } = {}) {
  assertType("Badge", "color", color, "string");
  assertType("Badge", "icon", icon, "string");
  assertType("Badge", "solid", solid, "boolean");
  assertType("Badge", "dot", dot, "boolean");
  assertOneOf("Badge", "size", size, CONTROL_SIZES, "sm");
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
function verifyTypesDropdown({ open, onClose, width, height, triggerRef } = {}) {
  assertType("Dropdown", "open", open, "boolean");
  assertType("Dropdown", "onClose", onClose, "function");
  assertType("Dropdown", "width", width, "string");
  assertType("Dropdown", "height", height, "string");
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
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 bg-[var(--mott-surface)] text-[var(--mott-on)] hover:bg-[var(--mott-hover)] text-[length:var(--text-md)] tracking-[var(--tracking-h4)] font-[number:var(--font-medium)] transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
  {
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
        true: "w-full"
      }
    },
    defaultVariants: {
      shape: "rounded",
      iconOnly: false,
      fullWidth: false
    }
  }
);
var Button = forwardRef(function Button2({
  children,
  variant = "primary",
  shape,
  iconOnly,
  fullWidth,
  className,
  style,
  type = "button",
  onClick,
  ...props
}, ref) {
  verifyTypesButton({ variant, shape, iconOnly, fullWidth, type });
  const tint = controlTint(variant) ?? controlTint("primary");
  return /* @__PURE__ */ jsx(
    "button",
    {
      ref,
      type,
      onClick,
      className: twMerge(buttonVariants({ shape, iconOnly, fullWidth }), className),
      style: { ...asCustomProperties(tint), ...style },
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
        // spread last so a caller can tint or resize the glyph without losing the variation
        // settings above, which are what make the font render at the right weight
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
  color = "primary",
  iconColor,
  icon,
  size = "md",
  type = "button",
  onClick,
  style,
  ...props
}) {
  verifyTypesIconButton("FabButton", { icon, color, iconColor, size, type });
  const dimensions = FAB_SIZE[size] ?? FAB_SIZE.md;
  const tint = controlTint(color) ?? customTint(color, iconColor ?? "#ffffff");
  const resolved = iconColor ? { ...tint, on: iconColor } : tint;
  return /* @__PURE__ */ jsx3(
    "button",
    {
      type,
      onClick,
      className: "inline-flex items-center justify-center border-0 cursor-pointer transition-all duration-150 bg-[var(--mott-surface)] text-[var(--mott-on)] hover:bg-[var(--mott-hover)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--md-sys-color-primary)] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
      style: {
        width: dimensions.box,
        height: dimensions.box,
        padding: 0,
        borderRadius: "var(--control-radius)",
        ...asCustomProperties(resolved),
        ...style
      },
      ...props,
      children: /* @__PURE__ */ jsx3(Icon, { name: icon, size: dimensions.icon })
    }
  );
}

// src/buttons/buttonFullRounded.jsx
import { jsx as jsx4 } from "react/jsx-runtime";
var SIZE = {
  sm: { box: "var(--control-size-sm)", icon: "var(--lg-icon)" },
  md: { box: "var(--control-size-md)", icon: "var(--lg-icon)" },
  lg: { box: "var(--control-size-lg)", icon: "var(--xl-icon)" }
};
function ButtonFullRounded({
  icon,
  color = "primary",
  iconColor,
  size = "md",
  type = "button",
  onClick,
  style,
  ...props
}) {
  verifyTypesIconButton("ButtonFullRounded", { icon, color, iconColor, size, type });
  const scale = SIZE[size] ?? SIZE.md;
  const tint = controlTint(color) ?? customTint(color, iconColor ?? "#ffffff");
  const resolved = iconColor ? { ...tint, on: iconColor } : tint;
  return /* @__PURE__ */ jsx4(
    "button",
    {
      type,
      onClick,
      className: "inline-flex items-center justify-center border-0 cursor-pointer rounded-[var(--radius-full)] transition-all duration-150 bg-[var(--mott-surface)] text-[var(--mott-on)] hover:bg-[var(--mott-hover)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--md-sys-color-primary)] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
      style: {
        width: scale.box,
        height: scale.box,
        padding: 0,
        ...asCustomProperties(resolved),
        ...style
      },
      ...props,
      children: /* @__PURE__ */ jsx4(Icon, { name: icon, size: scale.icon })
    }
  );
}

// src/buttons/buttonGroup.jsx
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { twMerge as twMerge3 } from "tailwind-merge";
import { jsx as jsx5, jsxs } from "react/jsx-runtime";
function ButtonGroup({ buttons, vertical = true, color = "primary", defaultSelected = null, value, allowDeselect = true, onChange }) {
  verifyTypesButtonGroup({ buttons, vertical, color, allowDeselect, onChange, value, defaultSelected });
  const [internalSelected, setInternalSelected] = useState(defaultSelected);
  const isControlled = value !== void 0;
  const selectedButton = isControlled ? value : internalSelected;
  const itemRefs = useRef([]);
  const containerRef = useRef(null);
  const tint = controlTint(color) ?? controlTint("primary");
  const resting = FAMILIES.neutral;
  const resolveColor = (value2) => {
    if (typeof value2 === "string" && value2.startsWith("var(")) {
      const token = value2.slice(4, -1).trim();
      return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    }
    return value2;
  };
  useGSAP(() => {
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const isSelected = i === selectedButton;
      gsap.to(el, {
        borderRadius: isSelected ? "28%" : "50%",
        scale: isSelected ? 1.1 : 1,
        backgroundColor: resolveColor(isSelected ? tint.surface : resting.container),
        color: resolveColor(isSelected ? tint.on : resting.onContainer),
        duration: 0.4,
        ease: "power3.out"
      });
    });
  }, { dependencies: [selectedButton, color], scope: containerRef });
  const handleSelect = (i) => {
    const next = allowDeselect && selectedButton === i ? null : i;
    if (!isControlled) setInternalSelected(next);
    onChange == null ? void 0 : onChange(next, next === null ? null : buttons[i]);
  };
  return /* @__PURE__ */ jsx5("div", { ref: containerRef, className: twMerge3("inline-flex gap-[var(--gap-group)]", vertical && "flex-col"), children: buttons.map((btn, i) => {
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
        className: "inline-flex items-center justify-center gap-2 border-0 cursor-pointer text-[length:var(--text-md)] tracking-[var(--tracking-h4)] font-[number:var(--font-medium)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--md-sys-color-primary)]",
        style: {
          borderRadius: "50%",
          backgroundColor: resting.container,
          color: resting.onContainer,
          height: "var(--control-size-md)",
          ...iconOnly ? { width: "var(--control-size-md)", padding: 0 } : { padding: "0 20px" }
        },
        children: [
          btn.icon && (typeof btn.icon === "string" ? /* @__PURE__ */ jsx5(Icon, { name: btn.icon }) : btn.icon),
          btn.label && /* @__PURE__ */ jsx5("span", { children: btn.label })
        ]
      },
      btn.id ?? i
    );
  }) });
}

// src/badge/badge.jsx
import { jsx as jsx6, jsxs as jsxs2 } from "react/jsx-runtime";
var SIZE2 = {
  sm: { pad: "var(--pad-badge-sm)", text: "var(--text-xs)", icon: "12px", dot: 5 },
  md: { pad: "var(--pad-badge-md)", text: "var(--text-sm)", icon: "14px", dot: 6 },
  lg: { pad: "var(--pad-badge-lg)", text: "var(--text-base)", icon: "16px", dot: 7 }
};
function Badge({ children, color = "neutral", solid = false, size = "sm", icon, dot = false, style, ...props }) {
  verifyTypesBadge({ color, solid, size, icon, dot });
  const scale = SIZE2[size] ?? SIZE2.sm;
  const tint = badgeTint(color, solid) ?? customTint(color, "#ffffff");
  return /* @__PURE__ */ jsxs2(
    "span",
    {
      className: "inline-flex items-center gap-1 rounded-[var(--radius-full)] leading-[var(--leading-tight)] tracking-[var(--tracking-label)] font-[number:var(--font-medium)] whitespace-nowrap",
      style: {
        padding: scale.pad,
        fontSize: scale.text,
        backgroundColor: tint.surface,
        color: tint.on,
        ...style
      },
      ...props,
      children: [
        dot && /* @__PURE__ */ jsx6("span", { "aria-hidden": "true", style: { width: scale.dot, height: scale.dot, borderRadius: "50%", backgroundColor: tint.on, flexShrink: 0 } }),
        icon && /* @__PURE__ */ jsx6(Icon, { name: icon, size: scale.icon }),
        children
      ]
    }
  );
}

// src/toast/toast.jsx
import { useEffect, useRef as useRef2, useState as useState2 } from "react";
import { createPortal } from "react-dom";
import { useGSAP as useGSAP2 } from "@gsap/react";
import gsap2 from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";

// src/toast/toastStack.js
var STACK_ATTR = "data-mott-toast-stack";
var STACK_STYLE = {
  // `fixed` does two jobs: it lifts the stack out of the scrollable area (which is why dragging
  // cannot produce scrollX) and makes it the containing block for its absolute children, which is
  // what the leaving toast's detach needs (see `flyOut` in toast.jsx)
  position: "fixed",
  top: "1rem",
  right: "1rem",
  // FIXED width, with two roles: it caps the toasts (which size themselves by their text against
  // this `max-width: 100%`) and it keeps the geometry stable. Were the stack shrink-to-fit it would
  // size to its widest child, and detaching a toast for its exit would re-measure it to the next
  // one: the leaving toast would be squeezed against a narrower parent and its text would re-wrap
  // mid-animation.
  width: "min(24rem, calc(100vw - 2rem))",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "var(--gap-section)",
  zIndex: "var(--z-floating)",
  // the empty band around the toasts must not swallow clicks on the page; each toast re-enables
  // itself
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
import { jsx as jsx7, jsxs as jsxs3 } from "react/jsx-runtime";
gsap2.registerPlugin(Draggable, Flip);
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
    const currentX = Number(gsap2.getProperty(el, "x")) || 0;
    return currentX + (window.innerWidth - el.getBoundingClientRect().left) + 16;
  };
  const flyOut = (el, { ease, duration: duration2, onDone }) => {
    const stack3 = el.parentElement;
    const siblings = stack3 ? Array.from(stack3.children).filter((c) => c !== el) : [];
    const state = siblings.length ? Flip.getState(siblings) : null;
    const rect = el.getBoundingClientRect();
    const scaleX = Number(gsap2.getProperty(el, "scaleX")) || 1;
    const top = stack3 ? rect.top - stack3.getBoundingClientRect().top : 0;
    Object.assign(el.style, {
      position: "absolute",
      top: `${top}px`,
      right: "0",
      width: `${rect.width / scaleX}px`
    });
    if (state) Flip.from(state, { duration: duration2, ease: "power3.out" });
    gsap2.to(el, { x: exitDistance(el), duration: duration2, ease, onComplete: onDone });
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
      gsap2.fromTo(
        toastRef.current,
        { opacity: 0, x: 24, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
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
      duration: 0.45,
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
        gsap2.set(el, { opacity: 1 - Math.min(Math.abs(this.x) / threshold, 1) * 0.6 });
      },
      onDragEnd: function() {
        if (this.x >= threshold) {
          dismissedRef.current = true;
          flyOut(el, {
            ease: "power2.in",
            duration: 0.3,
            onDone: () => {
              var _a;
              return (_a = onCloseRef.current) == null ? void 0 : _a.call(onCloseRef);
            }
          });
        } else {
          gsap2.to(el, { x: 0, opacity: 1, duration: 0.3, ease: "power3.out" });
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
    /* @__PURE__ */ jsxs3(
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
          /* @__PURE__ */ jsx7(Icon, { name: glyph, size: "xl", className: "shrink-0", style: { color: accent } }),
          /* @__PURE__ */ jsxs3("div", { className: "flex min-w-0 flex-col gap-0.5", children: [
            title && /* @__PURE__ */ jsx7("span", { className: "text-[length:var(--text-sm)] font-[number:var(--font-medium)] text-[var(--md-sys-color-on-surface)]", children: title }),
            /* @__PURE__ */ jsx7("span", { className: "text-[length:var(--text-sm)] text-[var(--md-sys-color-on-surface-variant)]", children })
          ] })
        ]
      }
    ),
    stack2
  );
}

// src/toast/toastContext.jsx
import { createContext, useCallback, useContext, useMemo, useRef as useRef3, useState as useState3 } from "react";
import { jsx as jsx8, jsxs as jsxs4 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs4(ToastContext.Provider, { value: api, children: [
    children,
    toasts.map((toast) => /* @__PURE__ */ jsx8(
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
  vibrant: SchemeVibrant
};
var DEFAULT_VARIANT = "content";
var DEFAULT_SEED = "#005eeb";
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
var kebab = (role) => role.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
function buildPalette(seedHex, mode, variant = DEFAULT_VARIANT) {
  const argb = argbFromHex(seedHex);
  const Scheme = VARIANTS[variant] ?? VARIANTS[DEFAULT_VARIANT];
  const scheme = new Scheme(Hct.fromInt(argb), mode === "dark", 0, SPEC_VERSION);
  const tokens = {};
  for (const role of ROLES) {
    tokens[`--md-sys-color-${kebab(role)}`] = hexFromArgb(MaterialDynamicColors[role].getArgb(scheme));
  }
  for (const [name, seed] of [["success", SUCCESS_SEED], ["warning", WARNING_SEED]]) {
    const colors = customColor(argb, { name, value: argbFromHex(seed), blend: false })[mode];
    tokens[`--md-custom-color-${name}`] = hexFromArgb(colors.color);
    tokens[`--md-custom-color-on-${name}`] = hexFromArgb(colors.onColor);
    tokens[`--md-custom-color-${name}-container`] = hexFromArgb(colors.colorContainer);
    tokens[`--md-custom-color-on-${name}-container`] = hexFromArgb(colors.onColorContainer);
  }
  return tokens;
}

// src/theme/themeContext.jsx
import { jsx as jsx9 } from "react/jsx-runtime";
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
    for (const [token, hex] of Object.entries(tokens)) {
      root.style.setProperty(token, hex);
    }
    if (mode === "system") root.removeAttribute("data-theme");
    else root.dataset.theme = mode;
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
  return /* @__PURE__ */ jsx9(ThemeContext.Provider, { value, children });
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

// src/theme/themeModal.jsx
import { useRef as useRef5 } from "react";
import { useGSAP as useGSAP3 } from "@gsap/react";
import gsap4 from "gsap";

// src/customModal/customModal.jsx
import { useEffect as useEffect3, useRef as useRef4 } from "react";
import { twMerge as twMerge4 } from "tailwind-merge";

// src/animations/modalAnimation.js
import gsap3 from "gsap";
import CustomEase from "gsap/CustomEase";
gsap3.registerPlugin(CustomEase);
var LIQUID_EASE = CustomEase.create("mottLiquid", "0.32, 0.72, 0, 1");
var LIQUID_EASE_IN = CustomEase.create("mottLiquidIn", "1, 0, 0.68, 0.28");
var MORPH_OPEN_DURATION = 0.8;
var MORPH_CLOSE_DURATION = 0.7;
var OPEN_BEATS = {
  morph: { at: 0, span: 1 },
  color: { at: 0, span: 1 },
  overlay: { at: 0, span: 0.6 },
  content: { at: 0.55, span: 0.45 }
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
  const raw = getComputedStyle(el).borderTopLeftRadius;
  const value = parseFloat(raw) || 0;
  return raw.trim().endsWith("%") ? value / 100 * Math.min(rect.width, rect.height) : value;
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
    const tl = gsap3.timeline();
    this.fadeOverlay(tl, overlay, 1, 0.22);
    tl.fromTo(
      panel,
      { opacity: 0, y: 12, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" },
      0
    );
  }
  close({ panel, overlay }, onDone) {
    const tl = gsap3.timeline({ onComplete: () => onDone == null ? void 0 : onDone() });
    this.fadeOverlay(tl, overlay, 0, 0.2);
    tl.to(panel, { opacity: 0, y: 12, scale: 0.94, duration: 0.25, ease: "power2.in" }, 0);
  }
};
var MorphAnimation = class extends ModalAnimation {
  constructor({
    openDuration = MORPH_OPEN_DURATION,
    closeDuration = MORPH_CLOSE_DURATION,
    openBeats = {},
    closeBeats = {},
    openEase = LIQUID_EASE,
    closeEase = LIQUID_EASE_IN,
    closeGhost = false,
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
    const cs = getComputedStyle(panel);
    const pad = { top: parseFloat(cs.paddingTop) || 0, left: parseFloat(cs.paddingLeft) || 0 };
    const rect = panel.getBoundingClientRect();
    const tx = Number(gsap3.getProperty(panel, "x")) || 0;
    const ty = Number(gsap3.getProperty(panel, "y")) || 0;
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
    gsap3.set(panel, { clearProps: `transform,backgroundColor,willChange${alsoClear ? `,${alsoClear}` : ""}` });
    gsap3.set(content, { clearProps: "opacity,visibility" });
  }
  // Panel starts disguised as the trigger, then one timeline runs the lot: it slides into place, its
  // colour crossfades, the clip opens up, the content fades in and the backdrop darkens - each on
  // its own beat.
  open({ dialog, panel, content, overlay, trigger }) {
    if (!trigger) return new FadeScaleAnimation().open({ panel, overlay });
    killRunningMorph(panel);
    this.place(panel, trigger);
    const { originRect, clearP, openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
    const originColor = getComputedStyle(trigger).backgroundColor;
    const finalColor = getComputedStyle(panel).backgroundColor;
    const ghost = createTriggerGhost(dialog, trigger, originRect);
    gsap3.set(panel, {
      x: buttonOffset.x,
      y: buttonOffset.y,
      backgroundColor: originColor,
      willChange: "transform, clip-path"
    });
    gsap3.set(content, { autoAlpha: 0 });
    const d = this.openDuration;
    const { morph, color, overlay: ov, content: cont } = this.openBeats;
    const morphAt = d * morph.at;
    const morphSpan = d * morph.span;
    const tl = gsap3.timeline({ onComplete: () => this.settle(dialog, panel, content) });
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
  // The inverse, with two differences: the clip starts from wherever an interrupted opening left it,
  // and the ghost is optional - only subclasses that leave the trigger hidden want it faded back in.
  close({ dialog, panel, content, overlay, trigger }, onDone) {
    if (!trigger) return new FadeScaleAnimation().close({ panel, overlay }, onDone);
    killRunningMorph(panel);
    removeTriggerGhost(dialog);
    const { originRect, clearP, openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
    const originColor = getComputedStyle(trigger).backgroundColor;
    const ghost = this.closeGhost ? createTriggerGhost(dialog, trigger, originRect) : null;
    if (ghost) ghost.style.opacity = "0";
    gsap3.set(panel, { willChange: "transform, clip-path" });
    const d = this.closeDuration;
    const { morph, color, overlay: ov, content: cont } = this.closeBeats;
    const morphAt = d * morph.at;
    const morphSpan = d * morph.span;
    const tl = gsap3.timeline({
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
      openDuration: 0.45,
      closeDuration: 0.38,
      closeEase: "power1.in",
      openBeats: {
        morph: { at: 0.15, span: 0.85 },
        color: { at: 0.3, span: 0.7 },
        overlay: { at: 0, span: 0.22 },
        content: { at: 0.62, span: 0.38 }
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
    const fit = (value, size, viewport) => Math.max(margin, Math.min(value, viewport - size - margin));
    return {
      left: fit(triggerRect.left - this.cover, panelRect.width, window.innerWidth),
      top: fit(triggerRect.top - this.cover, panelRect.height, window.innerHeight)
    };
  }
  place(panel, trigger) {
    const { left, top } = this.computeAnchoredPosition(
      trigger.getBoundingClientRect(),
      panel.getBoundingClientRect()
    );
    gsap3.set(panel, { position: "fixed", margin: 0, left, top });
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
import { jsx as jsx10, jsxs as jsxs5 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs5(
    "dialog",
    {
      ref: modalRef,
      onCancel: handleCancel,
      className: "default-modal",
      children: [
        /* @__PURE__ */ jsx10(
          "div",
          {
            ref: overlayRef,
            onClick: handleOverlayClick,
            className: "absolute inset-0 bg-[color-mix(in_srgb,var(--md-sys-color-scrim)_32%,transparent)]"
          }
        ),
        /* @__PURE__ */ jsx10(
          "div",
          {
            ref: panelRef,
            className: twMerge4("relative m-auto max-w-[92vw] rounded-[var(--radius-modal)] bg-[var(--md-sys-color-surface-container-high)] p-[var(--pad-card)]", className),
            style,
            children: /* @__PURE__ */ jsx10("div", { ref: contentRef, children })
          }
        )
      ]
    }
  );
}

// src/theme/themeModal.jsx
import { jsx as jsx11, jsxs as jsxs6 } from "react/jsx-runtime";
var MODES = [
  { value: "light", icon: "light_mode", label: "Claro" },
  { value: "dark", icon: "dark_mode", label: "Oscuro" },
  { value: "system", icon: "brightness_4", label: "Sistema" }
];
var MORPH = { duration: 0.4, ease: "power3.out" };
var CIRCLE = "50%";
var SWATCH = 56;
var squircleRadius = () => getComputedStyle(document.documentElement).getPropertyValue("--control-radius").trim() || "28%";
function Swatch({ theme, selected, onSelect }) {
  const ref = useRef5(null);
  useGSAP3(() => {
    gsap4.to(ref.current, {
      borderRadius: selected ? squircleRadius() : CIRCLE,
      scale: selected ? 1.1 : 1,
      ...MORPH
    });
  }, { dependencies: [selected] });
  return /* @__PURE__ */ jsx11(
    "button",
    {
      ref,
      type: "button",
      onClick: onSelect,
      "aria-pressed": selected,
      "aria-label": theme.name,
      title: theme.name,
      className: "cursor-pointer border-0 p-0 transition-shadow duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--md-sys-color-primary)]",
      style: {
        width: SWATCH,
        height: SWATCH,
        borderRadius: CIRCLE,
        background: theme.hex,
        // offset ring rather than a border: it never eats into the colour, and it is the one
        // marker that stays visible on a swatch as dark as the neutral one
        boxShadow: selected ? "0 0 0 2px var(--md-sys-color-surface-container-high), 0 0 0 4px var(--md-sys-color-primary)" : "none"
      }
    }
  );
}
function ThemeModal({ open, onClose, triggerRef, title = "Apariencia" }) {
  verifyTypesThemeModal({ open, onClose, triggerRef, title });
  const { colorSeedHex, variant, setColorSeedHex, mode, setMode, THEMES_AVAILABLE: THEMES_AVAILABLE2 } = useTheme();
  const isActive = (theme) => theme.hex.toLowerCase() === colorSeedHex.toLowerCase() && (theme.variant ?? variant) === variant;
  const modeIndex = MODES.findIndex((m) => m.value === mode);
  return /* @__PURE__ */ jsx11(CustomModal, { open, onClose, triggerRef, className: "w-[360px]", children: /* @__PURE__ */ jsxs6("div", { className: "flex flex-col gap-[var(--gap-page)]", children: [
    /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-[var(--gap-group)]", children: [
      /* @__PURE__ */ jsx11(Icon, { name: "palette", size: "lg" }),
      /* @__PURE__ */ jsx11(
        "h2",
        {
          className: "font-[number:var(--font-medium)] tracking-[var(--tracking-h3)]",
          style: { fontSize: "var(--text-xl)", color: "var(--md-sys-color-on-surface)" },
          children: title
        }
      )
    ] }),
    /* @__PURE__ */ jsx11("div", { className: "flex flex-wrap gap-[var(--gap-group)]", children: THEMES_AVAILABLE2.map((theme) => /* @__PURE__ */ jsx11(
      Swatch,
      {
        theme,
        selected: isActive(theme),
        onSelect: () => setColorSeedHex(theme.hex, theme.variant)
      },
      theme.name
    )) }),
    /* @__PURE__ */ jsxs6("div", { className: "flex flex-col gap-[var(--gap-section)]", children: [
      /* @__PURE__ */ jsx11(
        "p",
        {
          className: "tracking-[var(--tracking-label)]",
          style: { fontSize: "var(--text-sm)", color: "var(--md-sys-color-on-surface-variant)" },
          children: "Modo"
        }
      ),
      /* @__PURE__ */ jsx11(
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
import { jsx as jsx12, jsxs as jsxs7 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs7("div", { className: "flex w-full flex-col gap-1", children: [
    label && /* @__PURE__ */ jsx12(
      "label",
      {
        htmlFor: inputId,
        className: "text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface-variant)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsx12(
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
import { jsx as jsx13, jsxs as jsxs8 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs8("div", { className: "flex flex-col gap-1", style: { width }, children: [
    label && /* @__PURE__ */ jsx13(
      "label",
      {
        htmlFor: textareaId,
        className: "text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface-variant)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsx13(
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
import gsap5 from "gsap";
import { jsx as jsx14, jsxs as jsxs9 } from "react/jsx-runtime";
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
      gsap5.fromTo(
        el,
        { height: 0, opacity: 0 },
        {
          height: targetHeight,
          opacity: 1,
          duration: 0.35,
          ease: "power3.out",
          onComplete: () => gsap5.set(el, { height: "auto" })
        }
      );
    }
  }, { dependencies: [open, rendered] });
  useEffect4(() => {
    if (!open && rendered && panelRef.current) {
      gsap5.to(panelRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
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
  return /* @__PURE__ */ jsxs9("div", { ref: wrapperRef, className: "flex w-full flex-col gap-1", children: [
    label && /* @__PURE__ */ jsx14(
      "label",
      {
        htmlFor: selectId,
        className: "text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface-variant)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsxs9(
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
          /* @__PURE__ */ jsx14("span", { className: selected ? "" : "text-[var(--md-sys-color-on-surface-variant)]", children: selected ? selected.label : placeholder }),
          /* @__PURE__ */ jsx14(Icon, { name: "expand_more", size: "sm", className: `transition-transform duration-200 ${open ? "rotate-180" : ""}` })
        ]
      }
    ),
    rendered && anchor && createPortal2(
      /* @__PURE__ */ jsx14(
        "div",
        {
          ref: panelRef,
          className: "fixed z-[var(--z-floating)] flex flex-col gap-[var(--gap-tight)] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container-high)] p-1 shadow-lg",
          style: { top: anchor.top, left: anchor.left, width: anchor.width },
          children: options.map((option) => {
            const isSelected = option.value === value;
            return /* @__PURE__ */ jsx14(
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
import { jsx as jsx15, jsxs as jsxs10 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs10("div", { className: "flex w-full flex-col gap-1", children: [
    label && /* @__PURE__ */ jsx15(
      "label",
      {
        htmlFor: searchId,
        className: "text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface-variant)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsxs10(
      "div",
      {
        className: twMerge7(
          "flex w-full items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container)] transition-colors duration-150 focus-within:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container))]",
          className
        ),
        style: { padding: "var(--pad-input)", ...style },
        children: [
          /* @__PURE__ */ jsx15(Icon, { name: "search", size: "sm", className: "shrink-0 text-[var(--md-sys-color-on-surface-variant)]" }),
          /* @__PURE__ */ jsx15(
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
          value && /* @__PURE__ */ jsx15(
            "button",
            {
              type: "button",
              onClick: handleClear,
              "aria-label": "Limpiar b\xFAsqueda",
              className: "flex shrink-0 items-center justify-center border-0 bg-transparent cursor-pointer",
              children: /* @__PURE__ */ jsx15(Icon, { name: "close", size: "sm", className: "text-[var(--md-sys-color-on-surface-variant)]" })
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
import gsap6 from "gsap";
import { twMerge as twMerge8 } from "tailwind-merge";
import { jsx as jsx16 } from "react/jsx-runtime";
function Dropdown({ open, onClose, children, width = "auto", height = "auto", triggerRef, className, style, ...props }) {
  verifyTypesDropdown({ open, onClose, width, height, triggerRef });
  const [rendered, setRendered] = useState7(open);
  const panelRef = useRef8(null);
  useEffect6(() => {
    if (open) setRendered(true);
  }, [open]);
  useGSAP5(() => {
    if (open && panelRef.current) {
      gsap6.fromTo(
        panelRef.current,
        { opacity: 0, y: -8, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "back.out(1.7)", transformOrigin: "top" }
      );
    }
  }, { dependencies: [open, rendered] });
  useEffect6(() => {
    if (!open && rendered && panelRef.current) {
      gsap6.to(panelRef.current, {
        opacity: 0,
        y: -8,
        scale: 0.96,
        duration: 0.18,
        ease: "power2.in",
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
  return /* @__PURE__ */ jsx16(
    "div",
    {
      ref: panelRef,
      role: "menu",
      className: twMerge8("z-[var(--z-floating)] rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container-high)] p-1 shadow-lg", className),
      style: { width, height, ...style },
      ...props,
      children
    }
  );
}

// src/loading/loading.jsx
import { useRef as useRef9 } from "react";
import { useGSAP as useGSAP6 } from "@gsap/react";
import gsap7 from "gsap";
import { jsx as jsx17 } from "react/jsx-runtime";
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
    const tl = gsap7.timeline({ repeat: -1 });
    const morph = (shape) => {
      tl.to(el, { borderRadius: shape, scale: 1.12, duration: 0.5, ease: "power2.out" }, "+=0.05").to(el, { scale: 1, duration: 0.45, ease: "power2.in" });
    };
    morph(SHAPES[1]);
    morph(SHAPES[2]);
    morph(SHAPES[3]);
    tl.to(el, { opacity: 0, scale: 0.85, duration: 0.2, ease: "power2.in" }, "+=0.05").set(el, { clipPath: PENTAGON }).to(el, { opacity: 1, scale: 1.12, duration: 0.3, ease: "power2.out" }).to(el, { scale: 1, duration: 0.45, ease: "power2.in" });
    tl.to(el, { opacity: 0, scale: 0.85, duration: 0.2, ease: "power2.in" }, "+=0.3").set(el, { clipPath: "none", borderRadius: SHAPES[0] }).to(el, { opacity: 1, scale: 1.12, duration: 0.3, ease: "power2.out" }).to(el, { scale: 1, duration: 0.45, ease: "power2.in" });
    gsap7.to(el, { rotate: 360, duration: 5, repeat: -1, ease: "none" });
  }, []);
  return /* @__PURE__ */ jsx17(
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
import gsap8 from "gsap";
import { jsx as jsx18 } from "react/jsx-runtime";
function Progress({ value, color = "primary", className, style, ...props }) {
  verifyTypesProgress({ value, color });
  const fillRef = useRef10(null);
  const trackRef = useRef10(null);
  const resolved = ACCENTS[color] ?? color;
  const indeterminate = value === void 0 || value === null;
  useGSAP7(() => {
    if (indeterminate) {
      gsap8.set(fillRef.current, { xPercent: -100 });
      gsap8.to(fillRef.current, { xPercent: 200, duration: 1.2, repeat: -1, ease: "none" });
    } else {
      gsap8.killTweensOf(fillRef.current);
      gsap8.to(fillRef.current, { width: `${Math.min(100, Math.max(0, value))}%`, duration: 0.4, ease: "power3.out" });
    }
  }, { dependencies: [indeterminate, value] });
  return /* @__PURE__ */ jsx18(
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
      children: /* @__PURE__ */ jsx18(
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
import gsap9 from "gsap";
import { twMerge as twMerge9 } from "tailwind-merge";
import { Fragment, jsx as jsx19, jsxs as jsxs11 } from "react/jsx-runtime";
var DESKTOP_ALIGN = {
  center: "top-1/2 -translate-y-1/2",
  top: "top-8"
};
var ITEM_BASE = "inline-flex items-center justify-center gap-2 border-0 cursor-pointer p-0 text-[length:var(--text-md)] tracking-[var(--tracking-h4)] font-[number:var(--font-medium)] bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] transition-[background-color,color] duration-400 ease-[var(--ease-morph)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--md-sys-color-primary)]";
var ITEM_SELECTED = "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]";
var MORPH2 = { duration: 0.4, ease: "power3.out" };
var CIRCLE2 = "50%";
var squircleRadius2 = () => getComputedStyle(document.documentElement).getPropertyValue("--control-radius").trim() || "28%";
var attachRef = (node, store, i, forwarded) => {
  if (i === null) store.current = node;
  else store.current[i] = node;
  if (typeof forwarded === "function") forwarded(node);
  else if (forwarded) forwarded.current = node;
};
function NavItems({ items, selectedItem, onSelect, vertical }) {
  const itemRefs = useRef11([]);
  const containerRef = useRef11(null);
  useGSAP8(() => {
    const squircle = squircleRadius2();
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const isSelected = i === selectedItem;
      gsap9.to(el, {
        borderRadius: isSelected ? squircle : CIRCLE2,
        scale: isSelected ? 1.1 : 1,
        ...MORPH2
      });
    });
  }, { dependencies: [selectedItem, items.length], scope: containerRef });
  return /* @__PURE__ */ jsx19("div", { ref: containerRef, className: twMerge9("inline-flex gap-[var(--gap-group)]", vertical && "flex-col"), children: items.map((item, i) => {
    const iconOnly = !item.label;
    return /* @__PURE__ */ jsxs11(
      "button",
      {
        ref: (el) => attachRef(el, itemRefs, i, item.buttonRef),
        type: "button",
        onClick: () => onSelect(i),
        "aria-pressed": selectedItem === i,
        className: twMerge9(ITEM_BASE, selectedItem === i && ITEM_SELECTED),
        style: {
          borderRadius: CIRCLE2,
          height: "var(--control-size-md)",
          ...iconOnly ? { width: "var(--control-size-md)" } : { padding: "0 20px" }
        },
        children: [
          item.icon && (typeof item.icon === "string" ? /* @__PURE__ */ jsx19(Icon, { name: item.icon }) : item.icon),
          item.label && /* @__PURE__ */ jsx19("span", { children: item.label })
        ]
      },
      item.id ?? i
    );
  }) });
}
function LogoButton({ logo }) {
  const ref = useRef11(null);
  useGSAP8(() => {
    if (!ref.current) return;
    gsap9.to(ref.current, {
      borderRadius: logo.active ? squircleRadius2() : CIRCLE2,
      scale: logo.active ? 1.1 : 1,
      ...MORPH2
    });
  }, { dependencies: [logo.active] });
  return /* @__PURE__ */ jsx19(
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
        borderRadius: CIRCLE2
      },
      children: typeof logo.icon === "string" ? /* @__PURE__ */ jsx19(Icon, { name: logo.icon }) : logo.icon
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
  return /* @__PURE__ */ jsxs11(Fragment, { children: [
    /* @__PURE__ */ jsxs11(
      "nav",
      {
        className: twMerge9(
          "hidden md:flex fixed left-4 z-[var(--z-nav)] flex-col items-center gap-[var(--gap-group)]",
          DESKTOP_ALIGN[align] ?? DESKTOP_ALIGN.center,
          className
        ),
        style,
        children: [
          logo && /* @__PURE__ */ jsx19(LogoButton, { logo }),
          /* @__PURE__ */ jsx19(NavItems, { items, selectedItem, onSelect: handleSelect, vertical: true })
        ]
      }
    ),
    /* @__PURE__ */ jsx19(
      "nav",
      {
        className: twMerge9(
          "flex md:hidden fixed bottom-4 left-1/2 z-[var(--z-nav)] -translate-x-1/2 items-center gap-3",
          className
        ),
        style,
        children: /* @__PURE__ */ jsx19(
          "div",
          {
            className: "flex items-center gap-1 rounded-[var(--radius-full)] bg-[var(--md-sys-color-surface)] p-1",
            style: { boxShadow: "var(--shadow-floating)" },
            children: /* @__PURE__ */ jsx19(NavItems, { items, selectedItem, onSelect: handleSelect, vertical: false })
          }
        )
      }
    )
  ] });
}

// src/dragScroll/dragScroll.jsx
import { useCallback as useCallback3, useEffect as useEffect7, useLayoutEffect, useRef as useRef12, useState as useState9 } from "react";
import { twMerge as twMerge10 } from "tailwind-merge";
import gsap10 from "gsap";
import { Draggable as Draggable2 } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { jsx as jsx20 } from "react/jsx-runtime";
gsap10.registerPlugin(Draggable2, InertiaPlugin);
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
  return /* @__PURE__ */ jsx20(
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
export {
  AnchoredAnimation,
  Badge,
  button_default as Button,
  ButtonFullRounded,
  ButtonGroup,
  CustomModal,
  DragScroll,
  Dropdown,
  FabButton,
  Icon,
  Input,
  Loading,
  ModalAnimation,
  MorphAnimation,
  Navbar,
  Progress,
  Search,
  Select,
  Textarea,
  ThemeModal,
  ThemeProvider,
  Toast,
  ToastProvider,
  anchoredAnimation,
  morphAnimation,
  useDragScroll,
  useTheme,
  useToast
};
