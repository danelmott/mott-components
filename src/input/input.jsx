'use client';
import { useId } from 'react';
import { twMerge } from 'tailwind-merge';
import { verifyTypesInput } from '../utils/verifyTypes.js';

//component for input in mott-design - small label on top plus the field, Material Expressive styling
export default function Input({
    label,
    type = 'text',
    id,
    trailing,
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

    // The right inset when something sits inside the field: the icon's own width, plus the 18px of
    // `--pad-input` it is aligned to, plus 8px of breathing room before the text. Without it the
    // value would slide underneath whatever is in the slot instead of stopping short of it.
    const room = 'calc(var(--md-icon) + 26px)';

    return (
        <div className="flex w-full flex-col gap-1">
            {label && (
                <label
                    htmlFor={inputId}
                    className="mott-body-small text-[var(--md-sys-color-on-surface-variant)]"
                >
                    {label}
                </label>
            )}
            {/*Wrapper only so `trailing` has something to be absolute against. Without a slot it
               adds no box of its own that the field did not already fill.*/}
            <div className="relative flex w-full items-center">
                <input
                    id={inputId}
                    type={type}
                    className={twMerge(
                        'w-full rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container)] mott-body-large text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] outline-none transition-colors duration-150 focus:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container))] disabled:opacity-50 disabled:cursor-not-allowed',
                        className
                    )}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    style={{
                        padding: 'var(--pad-input)',
                        ...(trailing ? { paddingRight: room } : null),
                        ...style,
                    }}
                    placeholder={placeholder}
                    {...props}
                />
                {trailing && (
                    <span className="absolute right-[18px] flex items-center text-[var(--md-sys-color-on-surface-variant)]">
                        {trailing}
                    </span>
                )}
            </div>
        </div>
    )
}
