'use client';
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { controlTint, asCustomProperties } from '../theme/roles.js';
import { verifyTypesButton } from '../utils/verifyTypes.js';

//style for diferents variants for button
const buttonVariants = cva('mott-btn', {
  variants: {
    shape: {
      rounded: 'rounded-[var(--radius-lg)]',
      pill: 'rounded-[var(--radius-full)]',
    },

    iconOnly: {
      true: 'spect-square p-[var(--pad-button-icon)]',
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
    variant = 'primary',
    shape,
    iconOnly,
    fullWidth,
    className,
    style,
    type = 'button',
    onClick,
    ...props
}, ref) {
    verifyTypesButton({ variant, shape, iconOnly, fullWidth, type });

    // falls back rather than throwing, to match what the validator warned about a moment ago
    const tint = controlTint(variant) ?? controlTint('primary');

    return (
        <button
            ref={ref}
            type={type}
            onClick={onClick}
            className={twMerge(buttonVariants({ shape, iconOnly, fullWidth }), className)}
            style={{ ...asCustomProperties(tint), ...style }}
            {...props}
        >
            {children}
        </button>
    )
});

export default Button;
