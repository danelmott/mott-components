'use client';
import { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { morphAnimation, fadeAnimation } from '../animations/modalAnimation.js';
import { lockScroll, unlockScroll } from '../utils/scrollLock.js';
import { verifyTypesCustomModal } from '../utils/verifyTypes.js';


export default function CustomModal({ open, onClose, onCloseComplete, children, backdropOpacity = 0.35, triggerRef, animation, className, style }) {
    verifyTypesCustomModal({ open, onClose, onCloseComplete, backdropOpacity, triggerRef, animation });
    const modalRef = useRef(null);
    const overlayRef = useRef(null);
    const panelRef = useRef(null);
    const contentRef = useRef(null);
    const activeAnimation = animation ?? (triggerRef ? morphAnimation : fadeAnimation);
    
    const lockedRef = useRef(false);
    const lock = () => { if (!lockedRef.current) { lockedRef.current = true; lockScroll(); } };
    const unlock = () => { if (lockedRef.current) { lockedRef.current = false; unlockScroll(); } };
    
    useEffect(() => unlock, []);
    
    useEffect(() => {
        const modal = modalRef.current;
        const panel = panelRef.current;
        const overlay = overlayRef.current;
        const content = contentRef.current;
        if (!modal || !panel || !overlay) return;
        
        const ctx = { dialog: modal, panel, content, overlay, trigger: triggerRef?.current };
        
        if (open && !modal.open) {
            lock();
            modal.showModal();
            activeAnimation.open(ctx);
        }
        else if (!open && modal.open) {
            activeAnimation.close(ctx, () => {
                modal.close();
                unlock();
                onCloseComplete?.();
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
                className={twMerge('relative m-auto max-w-[92vw] rounded-[var(--radius-modal)] bg-[var(--modal-surface)] p-[var(--pad-card)]', className)}
                style={style}
            >
                <div ref={contentRef}>
                    {children}
                </div>
            </div>
        </dialog>
    )
}
