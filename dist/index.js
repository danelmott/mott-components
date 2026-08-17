// src/buttons/button.jsx
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
function Button({
  children,
  variant,
  shape,
  iconOnly,
  fullWidth,
  className,
  type = "button",
  onClick,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type,
      onClick,
      className: twMerge(buttonVariants({ variant, shape, iconOnly, fullWidth }), className),
      ...props,
      children
    }
  );
}

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
function ButtonGroup({ buttons, vertical = true, color = "primary", defaultSelected = null, onChange }) {
  const [selectedButton, setSelectedButton] = useState(defaultSelected);
  const itemRefs = useRef([]);
  const containerRef = useRef(null);
  const preset = COLOR_PRESETS3[color] ?? COLOR_PRESETS3.primary;
  const resolveColor = (value) => {
    if (typeof value === "string" && value.startsWith("var(")) {
      const token = value.slice(4, -1).trim();
      return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    }
    return value;
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
    const next = selectedButton === i ? null : i;
    setSelectedButton(next);
    onChange == null ? void 0 : onChange(next, next === null ? null : buttons[i]);
  };
  return /* @__PURE__ */ jsx5("div", { ref: containerRef, className: twMerge3("inline-flex gap-[var(--gap-group)]", vertical && "flex-col"), children: buttons.map((btn, i) => {
    const iconOnly = !btn.label;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        ref: (el) => itemRefs.current[i] = el,
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
          btn.icon && /* @__PURE__ */ jsx5(Icon, { name: btn.icon }),
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
import { useGSAP as useGSAP2 } from "@gsap/react";
import gsap2 from "gsap";
import { Draggable } from "gsap/Draggable";
import { jsx as jsx7, jsxs as jsxs3 } from "react/jsx-runtime";
gsap2.registerPlugin(Draggable);
var VARIANTS = {
  info: { bg: "var(--color-action-bg)", iconClass: "text-[var(--color-action)]", icon: "info" },
  success: { bg: "var(--color-success-bg)", iconClass: "text-[var(--color-success)]", icon: "check_circle" },
  warning: { bg: "var(--color-warning-bg)", iconClass: "text-[var(--color-warning)]", icon: "warning" },
  danger: { bg: "var(--color-danger-bg)", iconClass: "text-[var(--color-danger)]", icon: "error" }
};
function Toast({ variant = "info", title, children, open, onClose }) {
  const [rendered, setRendered] = useState2(open);
  const toastRef = useRef2(null);
  const preset = VARIANTS[variant] ?? VARIANTS.info;
  useEffect(() => {
    if (open) setRendered(true);
  }, [open]);
  useGSAP2(() => {
    if (open && toastRef.current) {
      gsap2.fromTo(
        toastRef.current,
        { opacity: 0, y: 24, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, { dependencies: [open, rendered] });
  useEffect(() => {
    if (!open && rendered && toastRef.current) {
      gsap2.to(toastRef.current, {
        opacity: 0,
        y: 16,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => setRendered(false)
      });
    }
  }, [open, rendered]);
  useEffect(() => {
    if (!rendered || !toastRef.current) return;
    const [draggable] = Draggable.create(toastRef.current, {
      type: "x",
      onDrag: function() {
        gsap2.set(toastRef.current, { opacity: 1 - Math.min(Math.abs(this.x) / 200, 0.8) });
      },
      onDragEnd: function() {
        if (Math.abs(this.x) > 120) {
          gsap2.to(toastRef.current, {
            x: this.x > 0 ? 400 : -400,
            opacity: 0,
            duration: 0.3,
            onComplete: () => onClose == null ? void 0 : onClose()
          });
        } else {
          gsap2.to(toastRef.current, { x: 0, opacity: 1, duration: 0.3, ease: "power3.out" });
        }
      }
    });
    return () => draggable.kill();
  }, [rendered, onClose]);
  if (!rendered) return null;
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      ref: toastRef,
      role: "status",
      className: "inline-flex items-start gap-3 rounded-[var(--radius-lg)] shadow-lg cursor-grab active:cursor-grabbing",
      style: { padding: "var(--pad-stat)", backgroundColor: preset.bg },
      children: [
        /* @__PURE__ */ jsx7(Icon, { name: preset.icon, className: preset.iconClass }),
        /* @__PURE__ */ jsxs3("div", { className: "flex flex-col gap-0.5", children: [
          title && /* @__PURE__ */ jsx7("span", { className: "text-[length:var(--text-sm)] font-[number:var(--font-medium)] text-[var(--dark-navy-text)]", children: title }),
          /* @__PURE__ */ jsx7("span", { className: "text-[length:var(--text-sm)] text-[var(--slate-gray-text)]", children })
        ] })
      ]
    }
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
import { cva as cva2 } from "class-variance-authority";
import { twMerge as twMerge5 } from "tailwind-merge";
function Textarea() {
}

// src/select/select.jsx
import { cva as cva3 } from "class-variance-authority";
import { twMerge as twMerge6 } from "tailwind-merge";
function Select() {
}

// src/modals/defaultModal.jsx
import { useEffect as useEffect2, useRef as useRef3 } from "react";
import { useGSAP as useGSAP3 } from "@gsap/react";
import gsap3 from "gsap";
import { jsx as jsx9 } from "react/jsx-runtime";
function DefaultModal({ open, onClose, children }) {
  const modalRef = useRef3(null);
  const overlayRef = useRef3(null);
  const panelRef = useRef3(null);
  const tlRef = useRef3(null);
  useGSAP3(() => {
    tlRef.current = gsap3.timeline({ paused: true }).set(panelRef.current, { opacity: 0, y: 8 }).set(overlayRef.current, { opacity: 0 }).to(overlayRef.current, { opacity: 1, duration: 0.18, ease: "power1.out" }, 0).to(panelRef.current, { opacity: 1, y: 0, duration: 0.22, ease: "power3.out" }, 0);
  });
  useEffect2(() => {
    const modal = modalRef.current;
    const tl = tlRef.current;
    if (!modal || !tl) return;
    if (open && !modal.open) {
      modal.showModal();
      tl.play(0);
    } else if (!open && modal.open) {
      tl.eventCallback("onReverseComplete", () => modal.close());
      tl.reverse();
    }
  }, [open]);
  const handleCancel = (event) => {
    event.preventDefault();
    onClose == null ? void 0 : onClose();
  };
  const handleOverlayClick = () => onClose == null ? void 0 : onClose();
  return /* @__PURE__ */ jsx9(
    "dialog",
    {
      ref: modalRef,
      onCancel: handleCancel,
      className: "default-modal",
      children
    }
  );
}
export {
  Badge,
  Button,
  ButtonFullRounded,
  ButtonGroup,
  DefaultModal,
  FabButton,
  Icon,
  Input,
  Select,
  Textarea,
  Toast
};
