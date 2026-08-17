// src/button/button.jsx
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { jsx } from "react/jsx-runtime";
function Button(onClick, onCancel, text) {
  return /* @__PURE__ */ jsx("button", { children: text });
}

// src/buttonGroup/buttonGroup.jsx
function ButtonGroup() {
}

// src/badge/badge.jsx
function Badge() {
}

// src/toast/toast.jsx
import { cva as cva2 } from "class-variance-authority";
import { twMerge as twMerge2 } from "tailwind-merge";
function Toast() {
}

// src/input/input.jsx
import { cva as cva3 } from "class-variance-authority";
import { twMerge as twMerge3 } from "tailwind-merge";
function Input() {
}

// src/textarea/textarea.jsx
import { cva as cva4 } from "class-variance-authority";
import { twMerge as twMerge4 } from "tailwind-merge";
function Textarea() {
}

// src/select/select.jsx
import { cva as cva5 } from "class-variance-authority";
import { twMerge as twMerge5 } from "tailwind-merge";
function Select() {
}

// src/modals/defaultModal.jsx
import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { jsx as jsx2 } from "react/jsx-runtime";
function DefaultModal({ open, onClose, children }) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const tlRef = useRef(null);
  useGSAP(() => {
    tlRef.current = gsap.timeline({ paused: true }).set(panelRef.current, { opacity: 0, y: 8 }).set(overlayRef.current, { opacity: 0 }).to(overlayRef.current, { opacity: 1, duration: 0.18, ease: "power1.out" }, 0).to(panelRef.current, { opacity: 1, y: 0, duration: 0.22, ease: "power3.out" }, 0);
  });
  useEffect(() => {
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
  return /* @__PURE__ */ jsx2(
    "dialog",
    {
      ref: modalRef,
      onCancel: handleCancel,
      className: "default-modal",
      children
    }
  );
}

// src/icon/icon.jsx
import { twMerge as twMerge6 } from "tailwind-merge";
import { jsx as jsx3 } from "react/jsx-runtime";
var SIZE_TOKEN = {
  sm: "var(--sm-icon)",
  md: "var(--md-icon)",
  lg: "var(--lg-icon)"
};
function Icon({
  name,
  size = "md",
  filled = false,
  weight = 500,
  grade = 200,
  opticalSize = 24,
  className,
  style,
  ...props
}) {
  if (!name) return null;
  const fontSize = SIZE_TOKEN[size] ?? size;
  return /* @__PURE__ */ jsx3(
    "span",
    {
      className: twMerge6("material-symbols-rounded select-none", className),
      "aria-hidden": "true",
      style: {
        fontSize,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
        ...style
      },
      ...props,
      children: name
    }
  );
}
export {
  Badge,
  Button,
  ButtonGroup,
  DefaultModal,
  Icon,
  Input,
  Select,
  Textarea,
  Toast
};
