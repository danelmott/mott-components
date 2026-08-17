'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Icon from '../icon/icon.jsx';

//component for select in mott-design — dropdown custom animado con GSAP
export default function Select({ options = [], value, onChange, label, placeholder = 'Seleccionar', disabled, id }) {
    const [open, setOpen] = useState(false);
    const [rendered, setRendered] = useState(false);
    const wrapperRef = useRef(null);
    const panelRef = useRef(null);
    const generatedId = useId();
    const selectId = id ?? generatedId;

    const selected = options.find((o) => o.value === value);

    useEffect(() => {
        if (open) setRendered(true);
    }, [open]);

    useGSAP(() => {
        if (open && panelRef.current) {
            const el = panelRef.current;
            const targetHeight = el.scrollHeight;
            gsap.fromTo(el,
                { height: 0, opacity: 0 },
                {
                    height: targetHeight,
                    opacity: 1,
                    duration: 0.35,
                    ease: 'power3.out',
                    onComplete: () => gsap.set(el, { height: 'auto' }),
                }
            );
        }
    }, { dependencies: [open, rendered] });

    useEffect(() => {
        if (!open && rendered && panelRef.current) {
            gsap.to(panelRef.current, {
                height: 0,
                opacity: 0,
                duration: 0.25,
                ease: 'power2.in',
                onComplete: () => setRendered(false),
            });
        }
    }, [open, rendered]);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        };
        const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [open]);

    const handleSelect = (option) => {
        onChange?.(option.value, option);
        setOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative flex w-full flex-col gap-1">
            {label && (
                <label
                    htmlFor={selectId}
                    className="text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--slate-gray-text)]"
                >
                    {label}
                </label>
            )}
            <button
                id={selectId}
                type="button"
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-[var(--radius-lg)] bg-[var(--light-gray-background)] text-[length:var(--text-base)] tracking-[var(--tracking-body)] font-[family-name:var(--font-family)] text-[var(--dark-navy-text)] outline-none transition-colors duration-150 focus:bg-[var(--pale-gray-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ padding: 'var(--pad-input)' }}
            >
                <span className={selected ? '' : 'text-[var(--muted-gray-text)]'}>
                    {selected ? selected.label : placeholder}
                </span>
                <Icon name="expand_more" size="sm" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {rendered && (
                <div
                    ref={panelRef}
                    className="absolute top-full left-0 right-0 z-10 mt-1 flex flex-col gap-[var(--gap-tight)] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--white)] p-1 shadow-lg"
                >
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className="rounded-[var(--radius-sm)] px-3 py-2 text-left text-[length:var(--text-base)] font-[family-name:var(--font-family)] transition-colors duration-150"
                                style={{
                                    backgroundColor: isSelected ? 'var(--color-action-bg)' : 'transparent',
                                    color: isSelected ? 'var(--color-action)' : 'var(--dark-navy-text)',
                                }}
                                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--pale-gray-hover)'; }}
                                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    )
}
