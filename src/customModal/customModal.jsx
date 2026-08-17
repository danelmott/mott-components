'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { twMerge } from 'tailwind-merge';

//component for customModal in mott-design — width/height configurables, backdrop claro,
//animación "genio" (nace desde triggerRef y crece hasta el centro) cuando se pasa el ref del botón
export default function CustomModal({ open, onClose, children, width = '32rem', height = 'auto', backdropOpacity = 0.35, triggerRef, className, style }) {
    const modalRef = useRef(null);
    const overlayRef = useRef(null);
    const panelRef = useRef(null);

    useEffect(() => {
        const modal = modalRef.current;
        const panel = panelRef.current;
        const overlay = overlayRef.current;
        if (!modal || !panel || !overlay) return;

        const getOrigin = () => {
            if (!triggerRef?.current) return null;
            const t = triggerRef.current.getBoundingClientRect();
            const p = panel.getBoundingClientRect();
            return {
                x: t.left + t.width / 2 - (p.left + p.width / 2),
                y: t.top + t.height / 2 - (p.top + p.height / 2),
            };
        };

        if (open && !modal.open) {
            modal.showModal();
            const origin = getOrigin();

            gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'power1.out' });
            gsap.fromTo(panel,
                origin ? { x: origin.x, y: origin.y, scale: 0.15, opacity: 0 } : { opacity: 0, y: 12, scale: 0.94 },
                { x: 0, y: 0, scale: 1, opacity: 1, duration: origin ? 0.5 : 0.35, ease: 'power3.out' }
            );
        } else if (!open && modal.open) {
            const origin = getOrigin();

            gsap.to(overlay, { opacity: 0, duration: 0.2, ease: 'power1.in' });
            gsap.to(panel, {
                ...(origin ? { x: origin.x, y: origin.y, scale: 0.15 } : { y: 12, scale: 0.94 }),
                opacity: 0,
                duration: origin ? 0.35 : 0.25,
                ease: 'power2.in',
                onComplete: () => {
                    modal.close();
                    // sin esto, la próxima apertura mide getBoundingClientRect() con este transform
                    // todavía pegado encima, y el cálculo del origen sale mal (se ve como fade)
                    gsap.set(panel, { x: 0, y: 0, scale: 1 });
                },
            });
        }
    }, [open]);

    const handleCancel = (event) => {
        event.preventDefault();
        onClose?.();
    };

    const handleOverlayClick = () => onClose?.();

    return (
        <dialog
            ref={modalRef}
            onCancel={handleCancel}
            className="default-modal"
        >
            <div
                ref={overlayRef}
                onClick={handleOverlayClick}
                className="absolute inset-0"
                style={{ backgroundColor: `rgb(15 23 42 / ${backdropOpacity})` }}
            />
            <div
                ref={panelRef}
                className={twMerge('relative m-auto max-h-[85vh] max-w-[92vw] overflow-y-auto rounded-[var(--radius-lg)] bg-[var(--modal-surface)] p-[var(--pad-card)]', className)}
                style={{ width, height, ...style }}
            >
                {children}
            </div>
        </dialog>
    )
}
