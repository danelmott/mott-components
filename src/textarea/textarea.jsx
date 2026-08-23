'use client';
import { useId } from 'react';
import { twMerge } from 'tailwind-merge';
import { verifyTypesTextarea } from '../utils/verifyTypes.js';

//component for textarea in mott-design - same look as Input, fixed size (no resize, no scroll)
export default function Textarea({
    label,
    id,
    width = '100%',
    height = '6rem',
    className,
    style,
    placeholder,
    ...props
}) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    verifyTypesTextarea({ label, placeholder, width, height });
    
    
    return (
        <div className="flex flex-col gap-1" style={{ width }}>
            {label && (
                <label
                    htmlFor={textareaId}
                    className="mott-body-small text-[var(--md-sys-color-on-surface-variant)]"
                >
                    {label}
                </label>
            )}
            <textarea
                id={textareaId}
                className={twMerge(
                    'w-full rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container)] mott-body-large text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] outline-none transition-colors duration-150 focus:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container))] disabled:opacity-50 disabled:cursor-not-allowed',
                    className
                )}
                style={{
                    padding: 'var(--pad-input)',
                    height,
                    resize: 'none',
                    overflow: 'hidden',
                    ...style,
                }}
                placeholder={placeholder}
            />
        </div>
    )
}
