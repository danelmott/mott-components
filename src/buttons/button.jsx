'use client';
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { controlTint } from '../theme/roles.js';
import { verifyTypesButton } from '../utils/verifyTypes.js';

//style for diferents variants for button
const buttonVariants = cva('mott-btn', {
  variants: {
    shape: {
      rounded: 'rounded-[var(--radius-lg)]',
      pill: 'rounded-[var(--radius-full)]',
    },

    iconOnly: {
      true: 'aspect-square p-[var(--pad-button-icon)]',
      false: 'p-[var(--pad-button)]',
    },

    fullWidth: {
      true: 'w-[100%]',
    },
  },

  defaultVariants: {
    shape: 'rounded',
    iconOnly: false,
    fullWidth: false,
  },
});

//component for button in mott-design
const Button = forwardRef(function Button({
    children,
    variant = 'default',
    quiet = false,
    shape,
    iconOnly,
    fullWidth,
    className,
    style,
    type = 'button',
    onClick,
    ...props
}, ref) {
    verifyTypesButton({ variant, quiet, shape, iconOnly, fullWidth, type });

    // falls back rather than throwing, to match what the validator warned about a moment ago
    const tint = controlTint(variant, quiet) ?? controlTint('default', quiet);

    // Both are `var(--md-sys-color-*)` / `var(--md-custom-color-*)` strings rather than resolved
    // values, so the button keeps following the theme and the accent without this component ever
    // knowing what colour it is painting. There is deliberately no way to hand it one from outside.
    return (
        <button
            ref={ref}
            type={type}
            onClick={onClick}
            className={twMerge(buttonVariants({ shape, iconOnly, fullWidth }), className)}
            style={{
                backgroundColor: tint.surface,
                color: tint.on,
                ...style,
            }}
            {...props}
        >
            {children}
        </button>
    )
});

export default Button;
