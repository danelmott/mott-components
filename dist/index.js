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
import { useGSAP as useGSAP3 } from "@gsap/react";
import gsap3 from "gsap";
import { jsx as jsx10, jsxs as jsxs6 } from "react/jsx-runtime";
function Select({ options = [], value, onChange, label, placeholder = "Seleccionar", disabled, id }) {
  const [open, setOpen] = useState3(false);
  const [rendered, setRendered] = useState3(false);
  const wrapperRef = useRef3(null);
  const panelRef = useRef3(null);
  const generatedId = useId3();
  const selectId = id ?? generatedId;
  const selected = options.find((o) => o.value === value);
  useEffect2(() => {
    if (open) setRendered(true);
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
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
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
  return /* @__PURE__ */ jsxs6("div", { ref: wrapperRef, className: "relative flex w-full flex-col gap-1", children: [
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
    rendered && /* @__PURE__ */ jsx10(
      "div",
      {
        ref: panelRef,
        className: "absolute top-full left-0 right-0 z-10 mt-1 flex flex-col gap-[var(--gap-tight)] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--white)] p-1 shadow-lg",
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
      className: twMerge7("rounded-[var(--radius-lg)] bg-[var(--white)] p-1 shadow-lg", className),
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
  // geometría de la ventana del clip y del translate que la deja encima del botón
  measure(panel, trigger) {
    const cs = getComputedStyle(panel);
    const pad = { top: parseFloat(cs.paddingTop) || 0, left: parseFloat(cs.paddingLeft) || 0 };
    const rect = panel.getBoundingClientRect();
    const tx = Number(gsap5.getProperty(panel, "x")) || 0;
    const ty = Number(gsap5.getProperty(panel, "y")) || 0;
    const panelRect = { left: rect.left - tx, top: rect.top - ty, width: rect.width, height: rect.height };
    const originRect = trigger.getBoundingClientRect();
    return {
      pad,
      panelRect,
      originRect,
      // el panel entero a la vista, con el radio de la modal
      openClip: { top: 0, right: 0, bottom: 0, left: 0, radius: resolveRadius(panel, panelRect) },
      // solo la ventana del tamaño del botón, con el radio del botón
      buttonClip: {
        top: pad.top,
        right: panelRect.width - pad.left - originRect.width,
        bottom: panelRect.height - pad.top - originRect.height,
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
  addClipTween(tl, panel, from, to, duration, ease, position = 0) {
    const state = { p: 0 };
    const lerp = (a, b) => a + (b - a) * state.p;
    this.applyClip(panel, from);
    tl.to(state, {
      p: 1,
      duration,
      ease,
      onUpdate: () => this.applyClip(panel, {
        top: lerp(from.top, to.top),
        right: lerp(from.right, to.right),
        bottom: lerp(from.bottom, to.bottom),
        left: lerp(from.left, to.left),
        radius: lerp(from.radius, to.radius)
      })
    }, position);
  }
  settle(dialog, panel, content) {
    removeTriggerGhost(dialog);
    panel.style.clipPath = "";
    panel[RUNNING_MORPH] = null;
    gsap5.set(panel, { clearProps: "transform,backgroundColor,willChange" });
    gsap5.set(content, { clearProps: "opacity,visibility" });
  }
  open({ dialog, panel, content, overlay, trigger }) {
    if (!trigger) return new FadeScaleAnimation().open({ panel, overlay });
    killRunningMorph(panel);
    const { originRect, openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
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
    const d = MORPH_OPEN_DURATION;
    const tl = gsap5.timeline({ onComplete: () => this.settle(dialog, panel, content) });
    panel[RUNNING_MORPH] = tl;
    tl.to(panel, {
      x: 0,
      y: 0,
      backgroundColor: finalColor,
      duration: d,
      ease: LIQUID_EASE,
      force3D: true
    }, 0);
    this.addClipTween(tl, panel, buttonClip, openClip, d, LIQUID_EASE, 0);
    tl.to(ghost, { opacity: 0, duration: d * 0.15, ease: "power1.in" }, 0);
    tl.to(content, { autoAlpha: 1, duration: d * 0.45, ease: "power1.out" }, d * 0.55);
    this.fadeOverlay(tl, overlay, 1, d * 0.6, 0);
  }
  // al cerrar NO hay ghost: el cuadro viaja sin ícono, aterriza sobre el botón y desaparece — recién
  // ahí se ve el ícono del botón real. Lo que hace que eso funcione es el ease-in: el panel acelera
  // hacia el botón y llega justo al final, en vez de plantarse encima tapándolo media animación.
  close({ dialog, panel, content, overlay, trigger }, onDone) {
    if (!trigger) return new FadeScaleAnimation().close({ panel, overlay }, onDone);
    killRunningMorph(panel);
    removeTriggerGhost(dialog);
    const { openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
    const originColor = getComputedStyle(trigger).backgroundColor;
    gsap5.set(panel, { willChange: "transform, clip-path" });
    const d = MORPH_CLOSE_DURATION;
    const tl = gsap5.timeline({
      onComplete: () => {
        onDone == null ? void 0 : onDone();
        this.settle(dialog, panel, content);
      }
    });
    panel[RUNNING_MORPH] = tl;
    tl.to(panel, {
      x: buttonOffset.x,
      y: buttonOffset.y,
      backgroundColor: originColor,
      duration: d,
      ease: LIQUID_EASE_IN,
      force3D: true
    }, 0);
    this.addClipTween(tl, panel, this.readClip(panel, openClip), buttonClip, d, LIQUID_EASE_IN, 0);
    tl.to(content, { autoAlpha: 0, duration: d * 0.25, ease: "power1.in" }, 0);
    this.fadeOverlay(tl, overlay, 0, d * 0.8, 0);
  }
};
var AnchoredAnimation = class extends ModalAnimation {
  computeAnchoredPosition(triggerRect, panelRect) {
    const gap = 8;
    const margin = 8;
    const fitsBelow = window.innerHeight - triggerRect.bottom - gap >= panelRect.height;
    const top = fitsBelow ? triggerRect.bottom + gap : Math.max(margin, triggerRect.top - gap - panelRect.height);
    const origin = fitsBelow ? "top left" : "bottom left";
    let left = triggerRect.left;
    const maxLeft = window.innerWidth - panelRect.width - margin;
    left = Math.min(left, Math.max(margin, maxLeft));
    left = Math.max(left, margin);
    return { left, top, origin };
  }
  open({ panel, overlay, trigger }) {
    if (!trigger) return new FadeScaleAnimation().open({ panel, overlay });
    const panelRect = panel.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const { left, top, origin } = this.computeAnchoredPosition(triggerRect, panelRect);
    gsap5.set(panel, { position: "fixed", margin: 0, left, top, transformOrigin: origin });
    const tl = gsap5.timeline();
    this.fadeOverlay(tl, overlay, 1, 0.22);
    tl.fromTo(
      panel,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.5)" },
      0
    );
  }
  close({ panel, overlay, trigger }, onDone) {
    if (!trigger) return new FadeScaleAnimation().close({ panel, overlay }, onDone);
    const tl = gsap5.timeline({
      onComplete: () => {
        onDone == null ? void 0 : onDone();
        gsap5.set(panel, { clearProps: "position,left,top,margin,transformOrigin" });
      }
    });
    this.fadeOverlay(tl, overlay, 0, 0.2);
    tl.to(panel, { opacity: 0, scale: 0.85, duration: 0.2, ease: "power2.in" }, 0);
  }
};
var morphAnimation = new MorphAnimation();
var fadeAnimation = new FadeScaleAnimation();
var anchoredAnimation = new AnchoredAnimation();

// src/customModal/customModal.jsx
import { jsx as jsx13, jsxs as jsxs8 } from "react/jsx-runtime";
function CustomModal({ open, onClose, onCloseComplete, children, width = "32rem", height = "auto", backdropOpacity = 0.35, triggerRef, animation, className, style }) {
  const modalRef = useRef6(null);
  const overlayRef = useRef6(null);
  const panelRef = useRef6(null);
  const contentRef = useRef6(null);
  const activeAnimation = animation ?? (triggerRef ? morphAnimation : fadeAnimation);
  useEffect5(() => {
    const modal = modalRef.current;
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (!modal || !panel || !overlay) return;
    const ctx = { dialog: modal, panel, content, overlay, trigger: triggerRef == null ? void 0 : triggerRef.current };
    if (open && !modal.open) {
      modal.showModal();
      activeAnimation.open(ctx);
    } else if (!open && modal.open) {
      activeAnimation.close(ctx, () => {
        modal.close();
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
          "hidden md:flex fixed left-4 z-20 flex-col items-center gap-[var(--gap-group)]",
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
          "flex md:hidden fixed bottom-4 left-1/2 z-20 -translate-x-1/2 items-center gap-3",
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
