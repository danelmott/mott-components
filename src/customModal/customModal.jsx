'use client';
import { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { morphAnimation, fadeAnimation } from '../animations/modalAnimation.js';
import { lockScroll, unlockScroll } from '../utils/scrollLock.js';
import { verifyTypesCustomModal } from '../utils/verifyTypes.js';


//Components for custom modal in mott-design-system
export default function CustomModal({ open, onClose, onCloseComplete, children, triggerRef, animation, className, style }) {
    verifyTypesCustomModal({ open, onClose, onCloseComplete, triggerRef, animation });
    const modalRef = useRef(null);
    const overlayRef = useRef(null);
    const panelRef = useRef(null);
    const contentRef = useRef(null);
    const activeAnimation = animation ?? (triggerRef ? morphAnimation : fadeAnimation);
    
    const lockedRef = useRef(false);
    const lock = () => { if (!lockedRef.current) { lockedRef.current = true; lockScroll(); } };
    const unlock = () => { if (lockedRef.current) { lockedRef.current = false; unlockScroll(); } };
    
    useEffect(() => unlock, []);
    
    //effect for verify click inside modal and manage state for open o close modal
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
                className="absolute inset-0 bg-[color-mix(in_srgb,var(--md-sys-color-scrim)_32%,transparent)]"
            />
            <div
                ref={panelRef}
                className={twMerge('relative m-auto max-w-[92vw] rounded-[var(--radius-modal)] bg-[var(--md-sys-color-surface-container-high)] p-[var(--pad-card)]', className)}
                style={style}
            >
                <div ref={contentRef}>
                    {children}
                </div>
            </div>
        </dialog>
    );
}
