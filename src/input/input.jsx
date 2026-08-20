'use client';
import { useId } from 'react';
import { twMerge } from 'tailwind-merge';
import { verifyTypesInput } from '../utils/verifyTypes.js';

//component for input in mott-design — label chico arriba + input, estética Material Expressive
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
    verifyTypesInput(label, placeholder, type);
    
    return (
        <div className="flex w-full flex-col gap-1">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--slate-gray-text)]"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                type={type}
                className={twMerge(
                    'w-full rounded-[var(--radius-lg)] bg-[var(--light-gray-background)] text-[length:var(--text-base)] tracking-[var(--tracking-body)] font-[family-name:var(--font-family)] text-[var(--dark-navy-text)] placeholder:text-[var(--muted-gray-text)] outline-none transition-colors duration-150 focus:bg-[var(--pale-gray-hover)] disabled:opacity-50 disabled:cursor-not-allowed',
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
