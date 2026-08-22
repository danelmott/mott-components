'use client';
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { controlTint, asCustomProperties } from '../theme/roles.js';
import { verifyTypesButton } from '../utils/verifyTypes.js';

//Shape and metrics only. The COLOUR is deliberately absent: it arrives as the three `--mott-*` custom
//properties that `controlTint` hands over, which is what lets one static class list serve all five
//variants instead of five near-identical strings. Tailwind scans source text for literal class
//names, so a class assembled by interpolation would never make it into the stylesheet - the values
//move, the class list does not.
//
//No variant draws a frame of any kind. What separates a button from the page is how much colour it
//carries - solid for the loud ones, a soft neutral fill for the quiet one, nothing at all for
//`ghost` - never an edge around it. A screen with several quiet controls on it reads calm this way
//and looked busy when each of them was boxed in.
const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2.5 ' +
    'bg-[var(--mott-surface)] text-[var(--mott-on)] hover:bg-[var(--mott-hover)] ' +
    'text-[length:var(--text-md)] tracking-[var(--tracking-h4)] font-[number:var(--font-medium)] ' +
    'transition-all duration-150 active:scale-[0.97] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] focus-visible:ring-offset-2 ' +
    'disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
    {
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
                true: 'w-full',
            },
        },
        defaultVariants: {
            shape: 'rounded',
            iconOnly: false,
            fullWidth: false,
        },
    }
);

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
