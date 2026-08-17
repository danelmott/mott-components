'use client';
import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function DefaultModal({ open, onClose, children }) {
    const modalRef = useRef(null);
    const overlayRef = useRef(null);
    const panelRef = useRef(null);
    const tlRef = useRef(null);
    
    useGSAP(() => {
        tlRef.current = gsap.timeline({ paused: true })
            .set(panelRef.current, { opacity: 0, y: 8 })
            .set(overlayRef.current, { opacity: 0 })
            .to(overlayRef.current, { opacity: 1, duration: 0.18, ease: 'power1.out' }, 0)
            .to(panelRef.current, { opacity: 1, y: 0, duration: 0.22, ease: 'power3.out' }, 0);
    });
    
    useEffect(() => {
        const modal = modalRef.current;
        const tl = tlRef.current;
        if (!modal || !tl) return;
        
        if (open && !modal.open) {
            modal.showModal();
            tl.play(0);
        } else if (!open && modal.open) {
            tl.eventCallback('onReverseComplete', () => modal.close());
            tl.reverse();
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
                {children}
        </dialog>
    )
}
