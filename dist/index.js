// src/buttons/button.jsx
import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { jsx } from "react/jsx-runtime";
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 text-[length:var(--text-md)] tracking-[var(--tracking-h4)] font-[number:var(--font-medium)] transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-action)] text-[var(--text-on-action)] hover:bg-[var(--color-action-hover)]",
        secondary: "bg-[var(--dark-navy-text)] text-[var(--white)] hover:bg-[var(--dark-slate-surface)]",
        outline: "bg-[var(--light-gray-background)] text-[var(--dark-navy-text)] hover:bg-[var(--pale-gray-hover)]",
        ghost: "bg-transparent text-[var(--dark-navy-text)] hover:bg-[var(--pale-gray-hover)]",
        danger: "bg-[var(--color-danger)] text-[var(--text-on-danger)] hover:bg-[var(--color-danger-hover)]"
      },
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
      variant: "primary",
      shape: "rounded",
      iconOnly: false,
      fullWidth: false
    }
  }
);
var Button = forwardRef(function Button2({
  children,
  variant,
  shape,
  iconOnly,
  fullWidth,
  className,
  type = "button",
  onClick,
  ...props
}, ref) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      ref,
      type,
      onClick,
      className: twMerge(buttonVariants({ variant, shape, iconOnly, fullWidth }), className),
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
  filled = true,
  weight = 500,
  grade = 200,
  opticalSize = 24,
  className
}) {
  if (!name) return null;
  const iconSize = SIZE_TOKEN[size] ?? size;
  return /* @__PURE__ */ jsx2(
    "span",
    {
      className: twMerge2("material-symbols-rounded select-none", className),
      "aria-hidden": "true",
      style: {
        fontSize: iconSize,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`
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
var COLOR_PRESETS = {
  primary: { bg: "var(--color-action)", fg: "var(--text-on-action)" },
  secondary: { bg: "var(--dark-navy-text)", fg: "var(--white)" },
  outline: { bg: "var(--light-gray-background)", fg: "var(--dark-navy-text)" },
  ghost: { bg: "transparent", fg: "var(--dark-navy-text)" },
  danger: { bg: "var(--color-danger)", fg: "var(--text-on-danger)" }
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
  const dimensions = FAB_SIZE[size] ?? FAB_SIZE.md;
  const preset = COLOR_PRESETS[color];
  const background = preset ? preset.bg : color;
  const foreground = iconColor ?? (preset ? preset.fg : "var(--white)");
  return /* @__PURE__ */ jsx3(
    "button",
    {
      type,
      onClick,
      className: "inline-flex items-center justify-center border-0 cursor-pointer transition-all duration-150 hover:brightness-90 active:brightness-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-action)] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
      style: {
        width: dimensions.box,
        height: dimensions.box,
        padding: 0,
        borderRadius: "var(--control-radius)",
        backgroundColor: background,
        color: foreground,
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
var COLOR_PRESETS2 = {
  primary: { bg: "var(--color-action)", fg: "var(--text-on-action)" },
  secondary: { bg: "var(--dark-navy-text)", fg: "var(--white)" },
  outline: { bg: "var(--light-gray-background)", fg: "var(--dark-navy-text)" },
  ghost: { bg: "transparent", fg: "var(--dark-navy-text)" },
  danger: { bg: "var(--color-danger)", fg: "var(--text-on-danger)" }
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
  const scale = SIZE[size] ?? SIZE.md;
  const preset = COLOR_PRESETS2[color];
  const background = preset ? preset.bg : color;
  const foreground = iconColor ?? (preset ? preset.fg : "var(--white)");
  return /* @__PURE__ */ jsx4(
    "button",
    {
      type,
      onClick,
      className: "inline-flex items-center justify-center border-0 cursor-pointer rounded-[var(--radius-full)] transition-all duration-150 hover:brightness-90 active:brightness-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-action)] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
      style: {
        width: scale.box,
        height: scale.box,
        padding: 0,
        backgroundColor: background,
        color: foreground,
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
var COLOR_PRESETS3 = {
  primary: { bg: "var(--color-action)", fg: "var(--text-on-action)" },
  secondary: { bg: "var(--dark-navy-text)", fg: "var(--white)" },
  outline: { bg: "var(--light-gray-background)", fg: "var(--dark-navy-text)" },
  ghost: { bg: "transparent", fg: "var(--dark-navy-text)" },
  danger: { bg: "var(--color-danger)", fg: "var(--text-on-danger)" }
};
function ButtonGroup({ buttons, vertical = true, color = "primary", defaultSelected = null, value, allowDeselect = true, onChange }) {
  const [internalSelected, setInternalSelected] = useState(defaultSelected);
  const isControlled = value !== void 0;
  const selectedButton = isControlled ? value : internalSelected;
  const itemRefs = useRef([]);
  const containerRef = useRef(null);
  const preset = COLOR_PRESETS3[color] ?? COLOR_PRESETS3.primary;
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
        backgroundColor: resolveColor(isSelected ? preset.bg : "var(--light-gray-background)"),
        color: resolveColor(isSelected ? preset.fg : "var(--dark-navy-text)"),
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
        className: "inline-flex items-center justify-center gap-2 border-0 cursor-pointer text-[length:var(--text-md)] tracking-[var(--tracking-h4)] font-[number:var(--font-medium)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-action)]",
        style: {
          borderRadius: "50%",
          backgroundColor: "var(--light-gray-background)",
          color: "var(--dark-navy-text)",
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
var COLOR_PRESETS4 = {
  neutral: { bg: "var(--light-gray-background)", fg: "var(--dark-navy-text)", solidBg: "var(--dark-navy-text)", solidFg: "var(--white)" },
  info: { bg: "var(--color-action-bg)", fg: "var(--color-action)", solidBg: "var(--color-action)", solidFg: "var(--text-on-action)" },
  success: { bg: "var(--color-success-bg)", fg: "var(--color-success)", solidBg: "var(--color-success)", solidFg: "var(--text-on-success)" },
  warning: { bg: "var(--color-warning-bg)", fg: "var(--color-warning)", solidBg: "var(--color-warning)", solidFg: "var(--text-on-warning)" },
  danger: { bg: "var(--color-danger-bg)", fg: "var(--color-danger)", solidBg: "var(--color-danger)", solidFg: "var(--text-on-danger)" }
};
var SIZE2 = {
  sm: { pad: "var(--pad-badge-sm)", text: "var(--text-xs)", icon: "12px", dot: 5 },
  md: { pad: "var(--pad-badge-md)", text: "var(--text-sm)", icon: "14px", dot: 6 },
  lg: { pad: "var(--pad-badge-lg)", text: "var(--text-base)", icon: "16px", dot: 7 }
};
function Badge({ children, color = "neutral", solid = false, size = "sm", icon, dot = false, style, ...props }) {
  const preset = COLOR_PRESETS4[color];
  const scale = SIZE2[size] ?? SIZE2.sm;
  const background = preset ? solid ? preset.solidBg : preset.bg : color;
  const foreground = preset ? solid ? preset.solidFg : preset.fg : "var(--white)";
  return /* @__PURE__ */ jsxs2(
    "span",
    {
      className: "inline-flex items-center gap-1 rounded-[var(--radius-full)] leading-[var(--leading-tight)] tracking-[var(--tracking-label)] font-[number:var(--font-medium)] whitespace-nowrap",
      style: {
        padding: scale.pad,
        fontSize: scale.text,
        backgroundColor: background,
        color: foreground,
        ...style
      },
      ...props,
      children: [
        dot && /* @__PURE__ */ jsx6("span", { "aria-hidden": "true", style: { width: scale.dot, height: scale.dot, borderRadius: "50%", backgroundColor: foreground, flexShrink: 0 } }),
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
  // `fixed` cumple dos funciones: saca al stack del área scrolleable (de ahí que el arrastre no
  // pueda generar scrollX) y lo vuelve containing block de sus hijos absolutos, que es lo que
  // necesita el despegue del toast saliente (ver `flyOut` en toast.jsx)
  position: "fixed",
  top: "1rem",
  right: "1rem",
  // ancho FIJO, y cumple dos roles: es el tope de ancho de los toasts (que se miden por su texto
  // contra este `max-width: 100%`) y mantiene la geometría estable. Si el stack fuera shrink-to-fit
  // se mediría según su hijo más ancho, y al despegar un toast para la salida se re-mediría al
  // siguiente: el saliente se apretaría contra un padre más angosto y el texto se rompería a mitad
  // de la animación.
  width: "min(24rem, calc(100vw - 2rem))",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "var(--gap-section)",
  zIndex: "var(--z-floating)",
  // la franja vacía alrededor de los toasts no tiene que bloquear clicks en la página; cada toast
  // se re-habilita a sí mismo
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
var VARIANTS = {
  info: { iconClass: "text-[var(--color-action)]", icon: "info" },
  success: { iconClass: "text-[var(--color-success)]", icon: "check_circle" },
  warning: { iconClass: "text-[var(--color-warning)]", icon: "warning" },
  danger: { iconClass: "text-[var(--color-danger)]", icon: "error" }
};
var COUNTER_DRAG = 0.12;
function Toast({
  variant = "info",
  title,
  children,
  open,
  onClose,
  duration = 5e3,
  dismissThreshold = 0.5
}) {
  const [rendered, setRendered] = useState2(open);
  const toastRef = useRef2(null);
  const onCloseRef = useRef2(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const dismissedRef = useRef2(false);
  const preset = VARIANTS[variant] ?? VARIANTS.info;
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
      setRendered(false);
      return;
    }
    flyOut(toastRef.current, {
      ease: "back.in(1.7)",
      duration: 0.45,
      onDone: () => setRendered(false)
    });
  }, [open, rendered]);
  useEffect(() => {
    if (!rendered || !toastRef.current) return;
    const el = toastRef.current;
    const width = el.offsetWidth;
    const threshold = width * dismissThreshold;
    const [draggable] = Draggable.create(el, {
      type: "x",
      // el stack está arriba a la derecha, así que el descarte va hacia el borde más cercano.
      // Hacia el contenido solo se permite un tironcito.
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
          // misma superficie neutra para las cuatro variantes. `--white` y no `--modal-surface`
          // porque es lo que ya usan Dropdown y el panel de Select para superficies flotantes
          backgroundColor: "var(--white)",
          boxShadow: "var(--shadow-floating)",
          // se mide por su texto, sin ancho mínimo: un toast corto no tiene por qué arrastrar
          // espacio en blanco. El tope lo pone el stack, que tiene ancho fijo — ahí es donde el
          // texto empieza a wrapear.
          maxWidth: "100%",
          // el stack tiene `pointer-events: none` para no bloquear la página; cada toast se
          // re-habilita a sí mismo
          pointerEvents: "auto"
        },
        children: [
          /* @__PURE__ */ jsx7(Icon, { name: preset.icon, size: "xl", className: `${preset.iconClass} shrink-0` }),
          /* @__PURE__ */ jsxs3("div", { className: "flex min-w-0 flex-col gap-0.5", children: [
            title && /* @__PURE__ */ jsx7("span", { className: "text-[length:var(--text-sm)] font-[number:var(--font-medium)] text-[var(--dark-navy-text)]", children: title }),
            /* @__PURE__ */ jsx7("span", { className: "text-[length:var(--text-sm)] text-[var(--slate-gray-text)]", children })
          ] })
        ]
      }
    ),
    stack2
  );
}

// src/input/input.jsx
import { useId } from "react";
import { twMerge as twMerge4 } from "tailwind-merge";
import { jsx as jsx8, jsxs as jsxs4 } from "react/jsx-runtime";
function Input({
  label,
  type = "text",
  id,
  className,
  style,
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return /* @__PURE__ */ jsxs4("div", { className: "flex w-full flex-col gap-1", children: [
    label && /* @__PURE__ */ jsx8(
      "label",
      {
        htmlFor: inputId,
        className: "text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--slate-gray-text)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsx8(
      "input",
      {
        id: inputId,
        type,
        className: twMerge4(
          "w-full rounded-[var(--radius-lg)] bg-[var(--light-gray-background)] text-[length:var(--text-base)] tracking-[var(--tracking-body)] font-[family-name:var(--font-family)] text-[var(--dark-navy-text)] placeholder:text-[var(--muted-gray-text)] outline-none transition-colors duration-150 focus:bg-[var(--pale-gray-hover)] disabled:opacity-50 disabled:cursor-not-allowed",
          className
        ),
        style: { padding: "var(--pad-input)", ...style },
        ...props
      }
    )
  ] });
}

// src/textarea/textarea.jsx
import { useId as useId2 } from "react";
import { twMerge as twMerge5 } from "tailwind-merge";
import { jsx as jsx9, jsxs as jsxs5 } from "react/jsx-runtime";
function Textarea({
  label,
  id,
  width = "100%",
  height = "6rem",
  className,
  style,
  ...props
}) {
  const generatedId = useId2();
  const textareaId = id ?? generatedId;
  return /* @__PURE__ */ jsxs5("div", { className: "flex flex-col gap-1", style: { width }, children: [
    label && /* @__PURE__ */ jsx9(
      "label",
      {
        htmlFor: textareaId,
        className: "text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--slate-gray-text)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsx9(
      "textarea",
      {
        id: textareaId,
        className: twMerge5(
          "w-full rounded-[var(--radius-lg)] bg-[var(--light-gray-background)] text-[length:var(--text-base)] tracking-[var(--tracking-body)] font-[family-name:var(--font-family)] text-[var(--dark-navy-text)] placeholder:text-[var(--muted-gray-text)] outline-none transition-colors duration-150 focus:bg-[var(--pale-gray-hover)] disabled:opacity-50 disabled:cursor-not-allowed",
          className
        ),
        style: {
          padding: "var(--pad-input)",
          height,
          resize: "none",
          overflow: "hidden",
          ...style
        },
        ...props
      }
    )
  ] });
}

// src/select/select.jsx
import { useEffect as useEffect2, useId as useId3, useRef as useRef3, useState as useState3 } from "react";
import { createPortal as createPortal2 } from "react-dom";
import { useGSAP as useGSAP3 } from "@gsap/react";
import gsap3 from "gsap";
import { jsx as jsx10, jsxs as jsxs6 } from "react/jsx-runtime";
function Select({ options = [], value, onChange, label, placeholder = "Seleccionar", disabled, id }) {
  const [open, setOpen] = useState3(false);
  const [rendered, setRendered] = useState3(false);
  const [anchor, setAnchor] = useState3(null);
  const wrapperRef = useRef3(null);
  const triggerRef = useRef3(null);
  const panelRef = useRef3(null);
  const generatedId = useId3();
  const selectId = id ?? generatedId;
  const selected = options.find((o) => o.value === value);
  useEffect2(() => {
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
  useGSAP3(() => {
    if (open && panelRef.current) {
      const el = panelRef.current;
      const targetHeight = el.scrollHeight;
      gsap3.fromTo(
        el,
        { height: 0, opacity: 0 },
        {
          height: targetHeight,
          opacity: 1,
          duration: 0.35,
          ease: "power3.out",
          onComplete: () => gsap3.set(el, { height: "auto" })
        }
      );
    }
  }, { dependencies: [open, rendered] });
  useEffect2(() => {
    if (!open && rendered && panelRef.current) {
      gsap3.to(panelRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => setRendered(false)
      });
    }
  }, [open, rendered]);
  useEffect2(() => {
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
  return /* @__PURE__ */ jsxs6("div", { ref: wrapperRef, className: "flex w-full flex-col gap-1", children: [
    label && /* @__PURE__ */ jsx10(
      "label",
      {
        htmlFor: selectId,
        className: "text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--slate-gray-text)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsxs6(
      "button",
      {
        ref: triggerRef,
        id: selectId,
        type: "button",
        disabled,
        onClick: () => setOpen((o) => !o),
        className: "flex w-full items-center justify-between rounded-[var(--radius-lg)] bg-[var(--light-gray-background)] text-[length:var(--text-base)] tracking-[var(--tracking-body)] font-[family-name:var(--font-family)] text-[var(--dark-navy-text)] outline-none transition-colors duration-150 focus:bg-[var(--pale-gray-hover)] disabled:opacity-50 disabled:cursor-not-allowed",
        style: { padding: "var(--pad-input)" },
        children: [
          /* @__PURE__ */ jsx10("span", { className: selected ? "" : "text-[var(--muted-gray-text)]", children: selected ? selected.label : placeholder }),
          /* @__PURE__ */ jsx10(Icon, { name: "expand_more", size: "sm", className: `transition-transform duration-200 ${open ? "rotate-180" : ""}` })
        ]
      }
    ),
    rendered && anchor && createPortal2(
      /* @__PURE__ */ jsx10(
        "div",
        {
          ref: panelRef,
          className: "fixed z-[var(--z-floating)] flex flex-col gap-[var(--gap-tight)] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--white)] p-1 shadow-lg",
          style: { top: anchor.top, left: anchor.left, width: anchor.width },
          children: options.map((option) => {
            const isSelected = option.value === value;
            return /* @__PURE__ */ jsx10(
              "button",
              {
                type: "button",
                onClick: () => handleSelect(option),
                className: "rounded-[var(--radius-sm)] px-3 py-2 text-left text-[length:var(--text-base)] font-[family-name:var(--font-family)] transition-colors duration-150",
                style: {
                  backgroundColor: isSelected ? "var(--color-action-bg)" : "transparent",
                  color: isSelected ? "var(--color-action)" : "var(--dark-navy-text)"
                },
                onMouseEnter: (e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "var(--pale-gray-hover)";
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
import { useEffect as useEffect3, useId as useId4, useRef as useRef4, useState as useState4 } from "react";
import { twMerge as twMerge6 } from "tailwind-merge";
import { jsx as jsx11, jsxs as jsxs7 } from "react/jsx-runtime";
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
  const [internalValue, setInternalValue] = useState4(defaultValue);
  const isControlled = controlledValue !== void 0;
  const value = isControlled ? controlledValue : internalValue;
  const generatedId = useId4();
  const searchId = id ?? generatedId;
  const timeoutRef = useRef4(null);
  useEffect3(() => {
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
  return /* @__PURE__ */ jsxs7("div", { className: "flex w-full flex-col gap-1", children: [
    label && /* @__PURE__ */ jsx11(
      "label",
      {
        htmlFor: searchId,
        className: "text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--slate-gray-text)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsxs7(
      "div",
      {
        className: twMerge6(
          "flex w-full items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--light-gray-background)] transition-colors duration-150 focus-within:bg-[var(--pale-gray-hover)]",
          className
        ),
        style: { padding: "var(--pad-input)", ...style },
        children: [
          /* @__PURE__ */ jsx11(Icon, { name: "search", size: "sm", className: "shrink-0 text-[var(--muted-gray-text)]" }),
          /* @__PURE__ */ jsx11(
            "input",
            {
              id: searchId,
              type: "search",
              value,
              onChange: handleChange,
              placeholder,
              className: "w-full bg-transparent text-[length:var(--text-base)] tracking-[var(--tracking-body)] font-[family-name:var(--font-family)] text-[var(--dark-navy-text)] outline-none placeholder:text-[var(--muted-gray-text)] [&::-webkit-search-cancel-button]:appearance-none",
              ...props
            }
          ),
          value && /* @__PURE__ */ jsx11(
            "button",
            {
              type: "button",
              onClick: handleClear,
              "aria-label": "Limpiar b\xFAsqueda",
              className: "flex shrink-0 items-center justify-center border-0 bg-transparent cursor-pointer",
              children: /* @__PURE__ */ jsx11(Icon, { name: "close", size: "sm", className: "text-[var(--muted-gray-text)]" })
            }
          )
        ]
      }
    )
  ] });
}

// src/dropdown/dropdown.jsx
import { useEffect as useEffect4, useRef as useRef5, useState as useState5 } from "react";
import { useGSAP as useGSAP4 } from "@gsap/react";
import gsap4 from "gsap";
import { twMerge as twMerge7 } from "tailwind-merge";
import { jsx as jsx12 } from "react/jsx-runtime";
function Dropdown({ open, onClose, children, width = "auto", height = "auto", triggerRef, className, style, ...props }) {
  const [rendered, setRendered] = useState5(open);
  const panelRef = useRef5(null);
  useEffect4(() => {
    if (open) setRendered(true);
  }, [open]);
  useGSAP4(() => {
    if (open && panelRef.current) {
      gsap4.fromTo(
        panelRef.current,
        { opacity: 0, y: -8, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "back.out(1.7)", transformOrigin: "top" }
      );
    }
  }, { dependencies: [open, rendered] });
  useEffect4(() => {
    if (!open && rendered && panelRef.current) {
      gsap4.to(panelRef.current, {
        opacity: 0,
        y: -8,
        scale: 0.96,
        duration: 0.18,
        ease: "power2.in",
        onComplete: () => setRendered(false)
      });
    }
  }, [open, rendered]);
  useEffect4(() => {
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
  return /* @__PURE__ */ jsx12(
    "div",
    {
      ref: panelRef,
      role: "menu",
      className: twMerge7("z-[var(--z-floating)] rounded-[var(--radius-lg)] bg-[var(--white)] p-1 shadow-lg", className),
      style: { width, height, ...style },
      ...props,
      children
    }
  );
}

// src/customModal/customModal.jsx
import { useEffect as useEffect5, useRef as useRef6 } from "react";
import { twMerge as twMerge8 } from "tailwind-merge";

// src/animations/modalAnimation.js
import gsap5 from "gsap";
import CustomEase from "gsap/CustomEase";
gsap5.registerPlugin(CustomEase);
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
    // la ventana se va por abajo del botón
    edge(from.bottom, to.bottom, target.top, -1),
    // ...por arriba
    edge(from.left, to.left, target.right, 1),
    // ...por la derecha
    edge(from.right, to.right, target.left, -1)
    // ...por la izquierda
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
  // el backdrop siempre va en la misma timeline que el panel, para que oscurecer la pantalla y
  // mover el panel se lean como un mismo gesto y no como dos eventos separados
  fadeOverlay(tl, overlay, to, duration, position = 0) {
    if (!overlay) return tl;
    return to === 1 ? tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration, ease: "power1.out" }, position) : tl.to(overlay, { opacity: 0, duration, ease: "power1.in" }, position);
  }
};
var FadeScaleAnimation = class extends ModalAnimation {
  open({ panel, overlay }) {
    const tl = gsap5.timeline();
    this.fadeOverlay(tl, overlay, 1, 0.22);
    tl.fromTo(
      panel,
      { opacity: 0, y: 12, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" },
      0
    );
  }
  close({ panel, overlay }, onDone) {
    const tl = gsap5.timeline({ onComplete: () => onDone == null ? void 0 : onDone() });
    this.fadeOverlay(tl, overlay, 0, 0.2);
    tl.to(panel, { opacity: 0, y: 12, scale: 0.94, duration: 0.25, ease: "power2.in" }, 0);
  }
};
var MorphAnimation = class extends ModalAnimation {
  // los defaults reproducen el morph centrado tal cual está aprobado. `AnchoredAnimation` los pisa
  // con valores de pop up (ver más abajo por qué el color necesita retrasarse en ese caso).
  constructor({
    openDuration = MORPH_OPEN_DURATION,
    closeDuration = MORPH_CLOSE_DURATION,
    // `at`/`span` como fracciones de la duración: permiten retener el color del botón mientras el
    // panel todavía lo está tapando, en vez de virar de entrada
    openBeats = {},
    closeBeats = {},
    openEase = LIQUID_EASE,
    closeEase = LIQUID_EASE_IN,
    closeGhost = false,
    // fracción de la duración que tarda el ícono en disolverse. Solo se usa cuando el panel tapa
    // al botón todo el tiempo: ahí no hay relevo que cronometrar y el fade es puramente estético.
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
  // hook: ubica el panel en su lugar de reposo ANTES de medir. El panel centrado ya se ubica solo
  // con su `m-auto`, así que acá no hay nada que hacer — `AnchoredAnimation` sí lo implementa.
  place() {
  }
  // props inline que deja `place()` y que hay que limpiar recién cuando la modal cierra del todo
  // (mientras está abierta el panel tiene que quedarse donde lo pusieron)
  placedProps() {
    return "";
  }
  // geometría de la ventana del clip y del translate que la deja encima del botón
  measure(panel, trigger) {
    const cs = getComputedStyle(panel);
    const pad = { top: parseFloat(cs.paddingTop) || 0, left: parseFloat(cs.paddingLeft) || 0 };
    const rect = panel.getBoundingClientRect();
    const tx = Number(gsap5.getProperty(panel, "x")) || 0;
    const ty = Number(gsap5.getProperty(panel, "y")) || 0;
    const panelRect = { left: rect.left - tx, top: rect.top - ty, width: rect.width, height: rect.height };
    const originRect = trigger.getBoundingClientRect();
    const panelBox = { ...panelRect, right: panelRect.left + panelRect.width, bottom: panelRect.top + panelRect.height };
    return {
      pad,
      panelRect,
      originRect,
      // progreso geométrico en el que el panel deja de tapar al botón: con esto se cronometra el
      // ghost sin números mágicos. 1 = el panel en reposo lo sigue tapando (el ghost se queda).
      clearP: separationProgress(originRect, panelBox, originRect),
      // el panel entero a la vista, con el radio de la modal
      openClip: { top: 0, right: 0, bottom: 0, left: 0, radius: resolveRadius(panel, panelRect) },
      // solo la ventana del tamaño del botón, con el radio del botón. El clamp cubre el caso
      // degenerado de un botón más grande que el panel: la ventana se queda en el borde.
      buttonClip: {
        top: pad.top,
        right: Math.max(0, panelRect.width - pad.left - originRect.width),
        bottom: Math.max(0, panelRect.height - pad.top - originRect.height),
        left: pad.left,
        radius: resolveRadius(trigger, originRect)
      },
      // deja la esquina de la ventana exactamente sobre la esquina del botón
      buttonOffset: {
        x: originRect.left - panelRect.left - pad.left,
        y: originRect.top - panelRect.top - pad.top
      }
    };
  }
  applyClip(panel, clip) {
    panel.style.clipPath = `inset(${clip.top}px ${clip.right}px ${clip.bottom}px ${clip.left}px round ${clip.radius}px)`;
  }
  // lee el estado actual del clip para poder arrancar desde ahí si se interrumpe una animación
  readClip(panel, fallback) {
    const match = /inset\(([^)]+)\)/.exec(panel.style.clipPath || "");
    if (!match) return fallback;
    const parts = match[1].trim().split(/\s+/);
    const at = (i) => parseFloat(parts[i]);
    return { top: at(0), right: at(1), bottom: at(2), left: at(3), radius: at(5) };
  }
  // GSAP no interpola strings `inset(... round ...)` de forma confiable, así que animamos un proxy
  // y componemos el string a mano. Al ir en la misma timeline y con el mismo ease que el translate,
  // los dos quedan sincronizados frame a frame.
  // `onProgress` recibe el progreso geométrico (no el temporal): es lo que permite atar la opacidad
  // del ghost a dónde está realmente la ventana respecto del botón.
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
  // el ghost tiene que estar entero mientras el panel tapa al botón y desvanecerse apenas lo
  // destapa. `clearP` viene de la geometría real, así que esto se acomoda solo a cualquier tamaño
  // de botón, gap, y a que la modal abra para arriba o para abajo.
  // el ícono del botón tiene dos regímenes según si el panel llega a destaparlo o no.
  // Devuelve el `onProgress` para el clip, o `null` si el fade se resolvió con un tween por tiempo.
  // `morphAt`/`morphSpan` son la ventana del morph en segundos, no la del timeline entero: el ícono
  // tiene que resolverse mientras la forma se está transformando, no durante el tramo del backdrop.
  addGhostFade(tl, ghost, clearP, morphAt, morphSpan, reverse = false) {
    if (clearP < 1) return this.ghostFader(ghost, clearP, reverse);
    const span = morphSpan * this.ghostFade;
    if (reverse) tl.to(ghost, { opacity: 1, duration: span, ease: "power1.out" }, morphAt + morphSpan - span);
    else tl.to(ghost, { opacity: 0, duration: span, ease: "power1.in" }, morphAt);
    return null;
  }
  // el ghost aguanta hasta el punto exacto en que el panel destapa al botón y ahí se funde contra el
  // ícono de verdad que queda abajo — al ser una copia idéntica, el cambio no se ve
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
  settle(dialog, panel, content, alsoClear = "") {
    removeTriggerGhost(dialog);
    panel.style.clipPath = "";
    panel[RUNNING_MORPH] = null;
    gsap5.set(panel, { clearProps: `transform,backgroundColor,willChange${alsoClear ? `,${alsoClear}` : ""}` });
    gsap5.set(content, { clearProps: "opacity,visibility" });
  }
  open({ dialog, panel, content, overlay, trigger }) {
    if (!trigger) return new FadeScaleAnimation().open({ panel, overlay });
    killRunningMorph(panel);
    this.place(panel, trigger);
    const { originRect, clearP, openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
    const originColor = getComputedStyle(trigger).backgroundColor;
    const finalColor = getComputedStyle(panel).backgroundColor;
    const ghost = createTriggerGhost(dialog, trigger, originRect);
    gsap5.set(panel, {
      x: buttonOffset.x,
      y: buttonOffset.y,
      backgroundColor: originColor,
      willChange: "transform, clip-path"
    });
    gsap5.set(content, { autoAlpha: 0 });
    const d = this.openDuration;
    const { morph, color, overlay: ov, content: cont } = this.openBeats;
    const morphAt = d * morph.at;
    const morphSpan = d * morph.span;
    const tl = gsap5.timeline({ onComplete: () => this.settle(dialog, panel, content) });
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
  // al cerrar NO hay ghost: el cuadro viaja sin ícono, aterriza sobre el botón y desaparece — recién
  // ahí se ve el ícono del botón real. Lo que hace que eso funcione es el ease-in: el panel acelera
  // hacia el botón y llega justo al final, en vez de plantarse encima tapándolo media animación.
  close({ dialog, panel, content, overlay, trigger }, onDone) {
    if (!trigger) return new FadeScaleAnimation().close({ panel, overlay }, onDone);
    killRunningMorph(panel);
    removeTriggerGhost(dialog);
    const { originRect, clearP, openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
    const originColor = getComputedStyle(trigger).backgroundColor;
    const ghost = this.closeGhost ? createTriggerGhost(dialog, trigger, originRect) : null;
    if (ghost) ghost.style.opacity = "0";
    gsap5.set(panel, { willChange: "transform, clip-path" });
    const d = this.closeDuration;
    const { morph, color, overlay: ov, content: cont } = this.closeBeats;
    const morphAt = d * morph.at;
    const morphSpan = d * morph.span;
    const tl = gsap5.timeline({
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
      // mucho menos recorrido que la modal centrada: tiene que sentirse ágil
      openDuration: 0.45,
      closeDuration: 0.38,
      closeEase: "power1.in",
      // el morph arranca un toque tarde al abrir y termina antes al cerrar: en los dos casos
      // deja un tramo en el que se ve la forma exacta del botón, que es lo que hace legible que
      // la modal sale de él y vuelve a él
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
      // con una curva pareja el panel pasa más tiempo cerca del tamaño del botón, así que sin
      // ghost se vería un círculo azul vacío antes de desaparecer
      closeGhost: true,
      ghostFade: 0.3,
      ...options
    });
    this.cover = cover;
  }
  // el panel se apoya SOBRE el botón: arranca en su misma esquina y crece hacia abajo y a la
  // derecha, así que mientras está abierto lo tapa. Solo se corre lo mínimo para no salirse de la
  // pantalla. Como nunca lo destapa, el translate del morph es apenas el padding del panel: el
  // efecto es casi puro `clip-path` abriéndose desde el botón.
  //
  // el `cover` existe porque el trigger se mide al hacer click, cuando su animación de estado activo
  // recién arranca: un control de 56px que pasa a `scale: 1.1` termina desbordando 2.8px hacia
  // arriba y hacia la izquierda de la caja que medimos, y asomaría por detrás del panel.
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
    gsap5.set(panel, { position: "fixed", margin: 0, left, top });
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
import { jsx as jsx13, jsxs as jsxs8 } from "react/jsx-runtime";
function CustomModal({ open, onClose, onCloseComplete, children, width = "32rem", height = "auto", backdropOpacity = 0.35, triggerRef, animation, className, style }) {
  const modalRef = useRef6(null);
  const overlayRef = useRef6(null);
  const panelRef = useRef6(null);
  const contentRef = useRef6(null);
  const activeAnimation = animation ?? (triggerRef ? morphAnimation : fadeAnimation);
  const lockedRef = useRef6(false);
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
  useEffect5(() => unlock, []);
  useEffect5(() => {
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
  return /* @__PURE__ */ jsxs8(
    "dialog",
    {
      ref: modalRef,
      onCancel: handleCancel,
      className: "default-modal",
      children: [
        /* @__PURE__ */ jsx13(
          "div",
          {
            ref: overlayRef,
            onClick: handleOverlayClick,
            className: "absolute inset-0",
            style: { backgroundColor: `rgb(15 23 42 / ${backdropOpacity})` }
          }
        ),
        /* @__PURE__ */ jsx13(
          "div",
          {
            ref: panelRef,
            className: twMerge8("relative m-auto max-h-[85vh] max-w-[92vw] overflow-y-auto rounded-[var(--radius-lg)] bg-[var(--modal-surface)] p-[var(--pad-card)]", className),
            style: { width, height, ...style },
            children: /* @__PURE__ */ jsx13("div", { ref: contentRef, children })
          }
        )
      ]
    }
  );
}

// src/loading/loading.jsx
import { useRef as useRef7 } from "react";
import { useGSAP as useGSAP5 } from "@gsap/react";
import gsap6 from "gsap";
import { jsx as jsx14 } from "react/jsx-runtime";
var COLOR_PRESETS5 = {
  primary: "var(--color-action)",
  secondary: "var(--dark-navy-text)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)"
};
var SHAPES = [
  "50% 50% 50% 50% / 50% 50% 50% 50%",
  // círculo
  "30% 30% 30% 30% / 30% 30% 30% 30%",
  // squircle
  "22% 22% 22% 22% / 22% 22% 22% 22%",
  // rounded square
  "30% 30% 30% 30% / 30% 30% 30% 30%"
  // squircle (cierra el loop)
];
var PENTAGON = "polygon(50% 0%, 97.55% 34.55%, 79.4% 90.45%, 20.6% 90.45%, 2.45% 34.55%)";
function Loading({ size = "sm", color = "primary", className, style, ...props }) {
  const shapeRef = useRef7(null);
  const box = `var(--control-size-${size})`;
  const background = COLOR_PRESETS5[color] ?? color;
  useGSAP5(() => {
    const el = shapeRef.current;
    const tl = gsap6.timeline({ repeat: -1 });
    const morph = (shape) => {
      tl.to(el, { borderRadius: shape, scale: 1.12, duration: 0.5, ease: "power2.out" }, "+=0.05").to(el, { scale: 1, duration: 0.45, ease: "power2.in" });
    };
    morph(SHAPES[1]);
    morph(SHAPES[2]);
    morph(SHAPES[3]);
    tl.to(el, { opacity: 0, scale: 0.85, duration: 0.2, ease: "power2.in" }, "+=0.05").set(el, { clipPath: PENTAGON }).to(el, { opacity: 1, scale: 1.12, duration: 0.3, ease: "power2.out" }).to(el, { scale: 1, duration: 0.45, ease: "power2.in" });
    tl.to(el, { opacity: 0, scale: 0.85, duration: 0.2, ease: "power2.in" }, "+=0.3").set(el, { clipPath: "none", borderRadius: SHAPES[0] }).to(el, { opacity: 1, scale: 1.12, duration: 0.3, ease: "power2.out" }).to(el, { scale: 1, duration: 0.45, ease: "power2.in" });
    gsap6.to(el, { rotate: 360, duration: 5, repeat: -1, ease: "none" });
  }, []);
  return /* @__PURE__ */ jsx14(
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
import { useRef as useRef8 } from "react";
import { useGSAP as useGSAP6 } from "@gsap/react";
import gsap7 from "gsap";
import { jsx as jsx15 } from "react/jsx-runtime";
var COLOR_PRESETS6 = {
  primary: "var(--color-action)",
  secondary: "var(--dark-navy-text)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)"
};
function Progress({ value, color = "primary", className, style, ...props }) {
  const fillRef = useRef8(null);
  const trackRef = useRef8(null);
  const resolved = COLOR_PRESETS6[color] ?? color;
  const indeterminate = value === void 0 || value === null;
  useGSAP6(() => {
    if (indeterminate) {
      gsap7.set(fillRef.current, { xPercent: -100 });
      gsap7.to(fillRef.current, { xPercent: 200, duration: 1.2, repeat: -1, ease: "none" });
    } else {
      gsap7.killTweensOf(fillRef.current);
      gsap7.to(fillRef.current, { width: `${Math.min(100, Math.max(0, value))}%`, duration: 0.4, ease: "power3.out" });
    }
  }, { dependencies: [indeterminate, value] });
  return /* @__PURE__ */ jsx15(
    "div",
    {
      ref: trackRef,
      role: "progressbar",
      "aria-valuenow": indeterminate ? void 0 : value,
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      className,
      style: { width: "100%", height: 8, borderRadius: "var(--radius-full)", backgroundColor: "var(--light-gray-background)", overflow: "hidden", position: "relative", ...style },
      ...props,
      children: /* @__PURE__ */ jsx15(
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
import { useEffect as useEffect6, useRef as useRef9 } from "react";
import { twMerge as twMerge9 } from "tailwind-merge";
import gsap8 from "gsap";
import { Fragment, jsx as jsx16, jsxs as jsxs9 } from "react/jsx-runtime";
var COLOR_PRESETS7 = {
  primary: { bg: "var(--color-action)", fg: "var(--text-on-action)" },
  secondary: { bg: "var(--dark-navy-text)", fg: "var(--white)" },
  outline: { bg: "var(--light-gray-background)", fg: "var(--dark-navy-text)" },
  ghost: { bg: "transparent", fg: "var(--dark-navy-text)" },
  danger: { bg: "var(--color-danger)", fg: "var(--text-on-danger)" }
};
var DESKTOP_ALIGN = {
  center: "top-1/2 -translate-y-1/2",
  top: "top-8"
};
function LogoButton({ logo, color }) {
  const ref = useRef9(null);
  const preset = COLOR_PRESETS7[logo.color ?? color] ?? COLOR_PRESETS7.primary;
  const setRefs = (node) => {
    ref.current = node;
    if (typeof logo.buttonRef === "function") logo.buttonRef(node);
    else if (logo.buttonRef) logo.buttonRef.current = node;
  };
  const resolveColor = (value) => {
    if (typeof value === "string" && value.startsWith("var(")) {
      const token = value.slice(4, -1).trim();
      return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    }
    return value;
  };
  useEffect6(() => {
    if (!ref.current) return;
    gsap8.to(ref.current, {
      borderRadius: logo.active ? "28%" : "50%",
      scale: logo.active ? 1.1 : 1,
      backgroundColor: resolveColor(logo.active ? preset.bg : "var(--light-gray-background)"),
      color: resolveColor(logo.active ? preset.fg : "var(--dark-navy-text)"),
      duration: 0.4,
      ease: "power3.out"
    });
  }, [logo.active, preset]);
  return /* @__PURE__ */ jsx16(
    "button",
    {
      ref: setRefs,
      type: "button",
      onClick: logo.onClick,
      "aria-pressed": !!logo.active,
      "aria-label": logo.label ?? "Inicio",
      className: "inline-flex items-center justify-center border-0 cursor-pointer p-0",
      style: {
        width: "var(--control-size-md)",
        height: "var(--control-size-md)",
        borderRadius: "50%",
        backgroundColor: "var(--light-gray-background)",
        color: "var(--dark-navy-text)"
      },
      children: typeof logo.icon === "string" ? /* @__PURE__ */ jsx16(Icon, { name: logo.icon }) : logo.icon
    }
  );
}
function Navbar({
  items = [],
  selected,
  defaultSelected = null,
  onChange,
  color = "primary",
  logo,
  align = "top",
  className,
  style
}) {
  return /* @__PURE__ */ jsxs9(Fragment, { children: [
    /* @__PURE__ */ jsxs9(
      "nav",
      {
        className: twMerge9(
          "hidden md:flex fixed left-4 z-[var(--z-nav)] flex-col items-center gap-[var(--gap-group)]",
          DESKTOP_ALIGN[align] ?? DESKTOP_ALIGN.center,
          className
        ),
        style,
        children: [
          logo && /* @__PURE__ */ jsx16(LogoButton, { logo, color }),
          /* @__PURE__ */ jsx16(
            ButtonGroup,
            {
              vertical: true,
              buttons: items,
              value: selected,
              defaultSelected,
              allowDeselect: false,
              onChange,
              color
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx16(
      "nav",
      {
        className: twMerge9(
          "flex md:hidden fixed bottom-4 left-1/2 z-[var(--z-nav)] -translate-x-1/2 items-center gap-3",
          className
        ),
        style,
        children: /* @__PURE__ */ jsx16("div", { className: "flex items-center gap-1 rounded-[var(--radius-full)] bg-[var(--white)] p-1 shadow-md", children: /* @__PURE__ */ jsx16(
          ButtonGroup,
          {
            vertical: false,
            buttons: items,
            value: selected,
            defaultSelected,
            allowDeselect: false,
            onChange,
            color
          }
        ) })
      }
    )
  ] });
}
export {
  AnchoredAnimation,
  Badge,
  button_default as Button,
  ButtonFullRounded,
  ButtonGroup,
  CustomModal,
  Dropdown,
  FabButton,
  FadeScaleAnimation,
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
  Toast,
  anchoredAnimation,
  fadeAnimation,
  morphAnimation
};
