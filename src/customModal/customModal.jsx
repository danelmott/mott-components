'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { twMerge } from 'tailwind-merge';
import { morphAnimation, fadeAnimation } from '../animations/modalAnimation.js';
import { DURATION, EASE, prefersReducedMotion } from '../animations/motion.js';
import { useModalLayer } from '../modalStack/modalStack.js';
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

    // The open/close effect fires on `open` alone - it has to, or a re-render mid-flight would
    // restart the animation. Everything it reads that can change between two openings goes through
    // this ref, so the effect sees the current value instead of the one captured on the first render.
    const latest = useRef(null);
    latest.current = { activeAnimation, triggerRef, onCloseComplete };

    // The seat in the stack (see modalStack.js). `isTop` is the only thing this component needs from
    // it: the browser's top layer already handles the order, Escape and pointer events on its own.
    const { depth, isTop, enter, leave } = useModalLayer();

    /*The dialog is portalled rather than left where it is declared. A nested modal is written inside
      its parent's JSX, which would put its <dialog> inside the parent's `content` element - and
      MorphAnimation tweens that element's `autoAlpha` to 0 on close. `visibility: hidden` DOES reach
      a descendant sitting in the top layer, so the child would vanish along with its parent. Flat in
      the body, nesting is a fact about the JSX and about the stack, never about the DOM.*/
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const lockedRef = useRef(false);
    const lock = () => { if (!lockedRef.current) { lockedRef.current = true; lockScroll(); } };
    const unlock = () => { if (lockedRef.current) { lockedRef.current = false; unlockScroll(); } };

    useEffect(() => () => { unlock(); leave(); }, []);

    //effect for verify click inside modal and manage state for open o close modal
    useEffect(() => {
        const modal = modalRef.current;
        const panel = panelRef.current;
        const overlay = overlayRef.current;
        const content = contentRef.current;
        if (!modal || !panel || !overlay) return;

        const { activeAnimation: current, triggerRef: trigger, onCloseComplete: done } = latest.current;
        const ctx = { dialog: modal, panel, content, overlay, trigger: trigger?.current };

        if (open && !modal.open) {
            // enter() before showModal(), so the registry's order is the top layer's order
            lock();
            enter();
            modal.showModal();
            current.open(ctx);
        }
        else if (!open && modal.open) {
            /*The seat is given up when the close STARTS, not when it finishes. The modal underneath
              restores its veil the moment it is top again, and if that waited for this one to land,
              this one's veil would already be gone - a flash of undimmed page between the two. Given
              up now, the two veils cross-fade instead. The scroll lock is a different question and
              stays until the panel has actually landed.*/
            leave();
            current.close(ctx, () => {
                modal.close();
                unlock();
                done?.();
            });
        }
    }, [open, mounted]);

    /*Only the top modal paints a veil. Everything below switches its own off, because the modal
      above is already painting one over it - two scrims at 32% put the page behind 54% and it goes
      darker with every level. The panel underneath still reads as dimmed: the veil doing the dimming
      simply belongs to the modal on top of it.*/
    const coveredRef = useRef(false);
    useEffect(() => {
        const overlay = overlayRef.current;
        if (!overlay || !open || !modalRef.current?.open) return;
        // Being on top having never been covered is the resting state, and the opening animation is
        // already fading this veil in on its own beat. Touching it here would race that tween.
        if (isTop && !coveredRef.current) return;
        coveredRef.current = !isTop;

        const to = isTop ? 1 : 0;
        if (prefersReducedMotion()) {
            gsap.set(overlay, { opacity: to });
            return;
        }
        gsap.to(overlay, { opacity: to, duration: DURATION.fast, ease: EASE.standard });
    }, [isTop, open]);

    const handleCancel = (event) => {
        event.preventDefault();
        onClose?.();
    };

    const handleOverlayClick = () => onClose?.();

    if (!mounted) return null;

    return createPortal(
        <dialog
            ref={modalRef}
            onCancel={handleCancel}
            data-modal-depth={depth === -1 ? undefined : depth}
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
                {/*`h-full` para que un panel de alto fijo - el onboarding, que ocupa la pantalla
                   entera - pueda repartir ese alto entre sus hijos. En las demas modales el panel
                   es de alto automatico, y un `height: 100%` contra un padre `auto` resuelve a
                   `auto`: no cambia nada.*/}
                <div ref={contentRef} className="h-full">
                    {children}
                </div>
            </div>
        </dialog>,
        document.body
    );
}
