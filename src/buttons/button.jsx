'use client';
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

//styles for variants buttons
const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2.5 text-[length:var(--text-md)] tracking-[var(--tracking-h4)] font-[number:var(--font-medium)] transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
    {
        variants: {
            variant: {
                primary: 'bg-[var(--color-action)] text-[var(--text-on-action)] hover:bg-[var(--color-action-hover)]',
                secondary: 'bg-[var(--dark-navy-text)] text-[var(--white)] hover:bg-[var(--dark-slate-surface)]',
                outline: 'bg-[var(--light-gray-background)] text-[var(--dark-navy-text)] hover:bg-[var(--pale-gray-hover)]',
                ghost: 'bg-transparent text-[var(--dark-navy-text)] hover:bg-[var(--pale-gray-hover)]',
                danger: 'bg-[var(--color-danger)] text-[var(--text-on-danger)] hover:bg-[var(--color-danger-hover)]',
            },
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
            variant: 'primary',
            shape: 'rounded',
            iconOnly: false,
            fullWidth: false,
        },
    }
);

//component for button in mott-design
const Button = forwardRef(function Button({
    children,
    variant,
    shape,
    iconOnly,
    fullWidth,
    className,
    type = 'button',
    onClick,
    ...props,
}, ref) {
    return (
        <button
            ref={ref}
            type={type}
            onClick={onClick}
            className={twMerge(buttonVariants({ variant, shape, iconOnly, fullWidth }), className)}
            {...props}
        >
            {children}
        </button>
    )
});

export default Button;
