'use client';
import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import Icon from '../icon/icon.jsx';

gsap.registerPlugin(Draggable);

const VARIANTS = {
    info: { bg: 'var(--color-action-bg)', iconClass: 'text-[var(--color-action)]', icon: 'info' },
    success: { bg: 'var(--color-success-bg)', iconClass: 'text-[var(--color-success)]', icon: 'check_circle' },
    warning: { bg: 'var(--color-warning-bg)', iconClass: 'text-[var(--color-warning)]', icon: 'warning' },
    danger: { bg: 'var(--color-danger-bg)', iconClass: 'text-[var(--color-danger)]', icon: 'error' },
};

//component for toast in mott-design — semántico, animado con GSAP, arrastrable
export default function Toast({ variant = 'info', title, children, open, onClose }) {
    const [rendered, setRendered] = useState(open);
    const toastRef = useRef(null);
    const preset = VARIANTS[variant] ?? VARIANTS.info;

    useEffect(() => {
        if (open) setRendered(true);
    }, [open]);

    useGSAP(() => {
        if (open && toastRef.current) {
            gsap.fromTo(toastRef.current,
                { opacity: 0, y: 24, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
            );
        }
    }, { dependencies: [open, rendered] });

    useEffect(() => {
        if (!open && rendered && toastRef.current) {
            gsap.to(toastRef.current, {
                opacity: 0,
                y: 16,
                scale: 0.95,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => setRendered(false),
            });
        }
    }, [open, rendered]);

    useEffect(() => {
        if (!rendered || !toastRef.current) return;
        const [draggable] = Draggable.create(toastRef.current, {
            type: 'x',
            onDrag: function () {
                gsap.set(toastRef.current, { opacity: 1 - Math.min(Math.abs(this.x) / 200, 0.8) });
            },
            onDragEnd: function () {
                if (Math.abs(this.x) > 120) {
                    gsap.to(toastRef.current, {
                        x: this.x > 0 ? 400 : -400,
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => onClose?.(),
                    });
                } else {
                    gsap.to(toastRef.current, { x: 0, opacity: 1, duration: 0.3, ease: 'power3.out' });
                }
            },
        });
        return () => draggable.kill();
    }, [rendered, onClose]);

    if (!rendered) return null;

    return (
        <div
            ref={toastRef}
            role="status"
            className="inline-flex items-start gap-3 rounded-[var(--radius-lg)] shadow-lg cursor-grab active:cursor-grabbing"
            style={{ padding: 'var(--pad-stat)', backgroundColor: preset.bg }}
        >
            <Icon name={preset.icon} className={preset.iconClass} />
            <div className="flex flex-col gap-0.5">
                {title && (
                    <span className="text-[length:var(--text-sm)] font-[number:var(--font-medium)] text-[var(--dark-navy-text)]">
                        {title}
                    </span>
                )}
                <span className="text-[length:var(--text-sm)] text-[var(--slate-gray-text)]">
                    {children}
                </span>
            </div>
        </div>
    )
}
