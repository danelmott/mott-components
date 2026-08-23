'use client';
import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { twMerge } from 'tailwind-merge';
import { DURATION, EASE, prefersReducedMotion } from '../animations/motion.js';
import { verifyTypesDropdown } from '../utils/verifyTypes.js';

//component for dropdown in mott-design - no backdrop, closes on Escape or an outside click
export default function Dropdown({ open, onClose, children, triggerRef, className, style, ...props }) {
    verifyTypesDropdown({ open, onClose, triggerRef });
    const [rendered, setRendered] = useState(open);
    const panelRef = useRef(null);
    
    useEffect(() => {
        if (open) setRendered(true);
    }, [open]);
    
    
    //hook for animate open for dropdown
    useGSAP(() => {
        if (!open || !panelRef.current) return;
        if (prefersReducedMotion()) {
            gsap.set(panelRef.current, { opacity: 1, y: 0, scale: 1 });
            return;
        }
        // no overshoot: a menu that springs past its resting size reads as imprecise, and this one
        // is a hit target the pointer is already travelling towards
        gsap.fromTo(panelRef.current,
            { opacity: 0, y: -8, scale: 0.96 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: DURATION.fast,
                ease: EASE.standard,
                transformOrigin: 'top',
                overwrite: 'auto',
            }
        );
    }, { dependencies: [open, rendered] });
    
    //effect for animate close for dropdown
    useEffect(() => {
        if (!open && rendered && panelRef.current) {
            if (prefersReducedMotion()) { setRendered(false); return; }
            gsap.to(panelRef.current, {
                opacity: 0,
                y: -8,
                scale: 0.96,
                duration: DURATION.instant,
                ease: EASE.exit,
                overwrite: 'auto',
                onComplete: () => setRendered(false),
            });
        }
    }, [open, rendered]);
    
    //effect for close on click back to dropdown or when user clicks espace
    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (panelRef.current?.contains(e.target)) return;
            if (triggerRef?.current?.contains(e.target)) return;
            onClose?.();
        };
        const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [open, onClose, triggerRef]);
    
    if (!rendered) return null;
    
    return (
        <div
            ref={panelRef}
            role="menu"
            className={twMerge('z-[var(--z-floating)] rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container-high)] p-1 shadow-lg', className)}
            style={{...style }}
            {...props}
        >
            {children}
        </div>
    )
}
