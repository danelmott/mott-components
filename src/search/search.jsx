'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Icon from '../icon/icon.jsx';
import { verifyTypesSearch } from '../utils/verifyTypes.js';

//component for search in mott-design — mismo estilo que Input, con debounce incorporado (onSearch)
export default function Search({
    label,
    id,
    placeholder = 'Buscar...',
    defaultValue = '',
    value: controlledValue,
    onChange,
    onSearch,
    delay = 400,
    className,
    style,
    ...props
}) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;
    const generatedId = useId();
    const searchId = id ?? generatedId;
    const timeoutRef = useRef(null);
    
    
    verifyTypesSearch({ label, placeholder, delay, onSearch, onChange, value: controlledValue, defaultValue });
    
    // dispara onSearch recién cuando el usuario deja de tipear por `delay` ms — listo para pegarle a una API sin lógica extra del lado del consumidor
    useEffect(() => {
        if (!onSearch) return;
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => onSearch(value), delay);
        return () => clearTimeout(timeoutRef.current);
    }, [value, delay, onSearch]);
    
    const handleChange = (event) => {
        const next = event.target.value;
        if (!isControlled) setInternalValue(next);
        onChange?.(next, event);
    };
    
    const handleClear = () => {
        if (!isControlled) setInternalValue('');
        onChange?.('');
        onSearch?.('');
    };
    
    return (
        <div className="flex w-full flex-col gap-1">
            {label && (
                <label
                    htmlFor={searchId}
                    className="text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--slate-gray-text)]"
                >
                    {label}
                </label>
            )}
            <div
                className={twMerge(
                    'flex w-full items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--light-gray-background)] transition-colors duration-150 focus-within:bg-[var(--pale-gray-hover)]',
                    className
                )}
                style={{ padding: 'var(--pad-input)', ...style }}
            >
                <Icon name="search" size="sm" className="shrink-0 text-[var(--muted-gray-text)]" />
                <input
                    id={searchId}
                    type="search"
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-[length:var(--text-base)] tracking-[var(--tracking-body)] font-[family-name:var(--font-family)] text-[var(--dark-navy-text)] outline-none placeholder:text-[var(--muted-gray-text)] [&::-webkit-search-cancel-button]:appearance-none"
                    {...props}
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Limpiar búsqueda"
                        className="flex shrink-0 items-center justify-center border-0 bg-transparent cursor-pointer"
                    >
                        <Icon name="close" size="sm" className="text-[var(--muted-gray-text)]" />
                    </button>
                )}
            </div>
        </div>
    )
}
