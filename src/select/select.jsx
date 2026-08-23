'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Icon from '../icon/icon.jsx';
import { DURATION, EASE } from '../animations/motion.js';
import { verifyTypesSelect } from '../utils/verifyTypes.js';

//component for select in mott-design - custom dropdown animated with GSAP.
//The panel renders through a portal into `document.body` and is positioned `fixed` against the
//trigger's rect, NOT `absolute` inside the component, so it does not depend on its ancestors' layout.
//An `overflow: hidden`, a `transform`, a multi-column container or any stacking context in between
//used to clip it or leave it pushing the content around instead of overlapping it.
export default function Select({ options = [], value, onChange, label, placeholder = 'Seleccionar', disabled, id }) {
    verifyTypesSelect({ options, onChange, label, placeholder, disabled });
    const [open, setOpen] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [anchor, setAnchor] = useState(null);
    const wrapperRef = useRef(null);
    const triggerRef = useRef(null);
    const panelRef = useRef(null);
    const generatedId = useId();
    const selectId = id ?? generatedId;

    const selected = options.find((o) => o.value === value);

    useEffect(() => {
        if (!open) return;

        const syncAnchor = () => {
            const rect = triggerRef.current?.getBoundingClientRect();
            if (rect) setAnchor({ top: rect.bottom + 4, left: rect.left, width: rect.width });
        };

        syncAnchor();
        setRendered(true);

        // being `fixed`, the panel does not follow the scroll and has to be re-anchored. The `true`
        // is capture, so scrolling of any intermediate container is picked up too
        window.addEventListener('scroll', syncAnchor, true);
        window.addEventListener('resize', syncAnchor);
        return () => {
            window.removeEventListener('scroll', syncAnchor, true);
            window.removeEventListener('resize', syncAnchor);
        };
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
                    duration: DURATION.base,
                    ease: EASE.standard,
                    overwrite: 'auto',
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
                duration: DURATION.fast,
                ease: EASE.exit,
                overwrite: 'auto',
                onComplete: () => setRendered(false),
            });
        }
    }, [open, rendered]);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            // the panel no longer lives inside the wrapper, so both have to be checked
            if (wrapperRef.current?.contains(e.target)) return;
            if (panelRef.current?.contains(e.target)) return;
            setOpen(false);
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
        <div ref={wrapperRef} className="flex w-full flex-col gap-1">
            {label && (
                <label
                    htmlFor={selectId}
                    className="text-[length:var(--text-sm)] leading-[var(--leading-tight)] tracking-[var(--tracking-body)] font-[number:var(--font-medium)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface-variant)]"
                >
                    {label}
                </label>
            )}
            <button
                ref={triggerRef}
                id={selectId}
                type="button"
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container)] text-[length:var(--text-base)] tracking-[var(--tracking-body)] font-[family-name:var(--font-family)] text-[var(--md-sys-color-on-surface)] outline-none transition-colors duration-150 focus:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container))] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ padding: 'var(--pad-input)' }}
            >
                <span className={selected ? '' : 'text-[var(--md-sys-color-on-surface-variant)]'}>
                    {selected ? selected.label : placeholder}
                </span>
                <Icon name="expand_more" size="sm" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {rendered && anchor && createPortal(
                <div
                    ref={panelRef}
                    className="fixed z-[var(--z-floating)] flex flex-col gap-[var(--gap-tight)] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container-high)] p-1 shadow-lg"
                    style={{ top: anchor.top, left: anchor.left, width: anchor.width }}
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
                                    backgroundColor: isSelected ? 'var(--md-sys-color-primary-container)' : 'transparent',
                                    color: isSelected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)',
                                }}
                                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent)'; }}
                                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>,
                document.body,
            )}
        </div>
    )
}
