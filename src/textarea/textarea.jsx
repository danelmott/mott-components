'use client';
import { useId } from 'react';
import { twMerge } from 'tailwind-merge';

//component for textarea in mott-design — mismo estilo visual que Input, tamaño fijo (sin resize ni scroll)
export default function Textarea({
    label,
    id,
    width = '100%',
    height = '6rem',
    className,
    style,
    ...props
}) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
        <div className="flex flex-col gap-1" style={{ width }}>
            {label && (
                <label
                    htmlFor={textareaId}
                    className="text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--slate-gray-text)]"
                >
                    {label}
                </label>
            )}
            <textarea
                id={textareaId}
                className={twMerge(
                    'w-full rounded-[var(--radius-lg)] bg-[var(--light-gray-background)] text-[length:var(--text-base)] tracking-[var(--tracking-body)] font-[family-name:var(--font-family)] text-[var(--dark-navy-text)] placeholder:text-[var(--muted-gray-text)] outline-none transition-colors duration-150 focus:bg-[var(--pale-gray-hover)] disabled:opacity-50 disabled:cursor-not-allowed',
                    className
                )}
                style={{
                    padding: 'var(--pad-input)',
                    height,
                    resize: 'none',
                    overflow: 'hidden',
                    ...style,
                }}
                {...props}
            />
        </div>
    )
}
