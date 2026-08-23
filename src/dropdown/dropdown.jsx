'use client';
import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { twMerge } from 'tailwind-merge';
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
        if (open && panelRef.current) {
            gsap.fromTo(panelRef.current,
                { opacity: 0, y: -8, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'back.out(1.7)', transformOrigin: 'top' }
            );
        }
    }, { dependencies: [open, rendered] });
    
    //effect for animate close for dropdown
    useEffect(() => {
        if (!open && rendered && panelRef.current) {
            gsap.to(panelRef.current, {
                opacity: 0,
                y: -8,
                scale: 0.96,
                duration: 0.18,
                ease: 'power2.in',
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
