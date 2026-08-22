'use client';
import { useId } from 'react';
import { twMerge } from 'tailwind-merge';
import { verifyTypesInput } from '../utils/verifyTypes.js';

//component for input in mott-design - small label on top plus the field, Material Expressive styling
export default function Input({
    label,
    type = 'text',
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
    
    return (
        <div className="flex w-full flex-col gap-1">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface-variant)]"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                type={type}
                className={twMerge(
                    'w-full rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container)] text-[length:var(--text-base)] tracking-[var(--tracking-body)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] outline-none transition-colors duration-150 focus:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container))] disabled:opacity-50 disabled:cursor-not-allowed',
                    className
                )}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                style={{ padding: 'var(--pad-input)', ...style }}
                placeholder={placeholder}
                {...props}
            />
        </div>
    )
}
