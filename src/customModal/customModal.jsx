'use client';
import { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { morphAnimation, fadeAnimation } from '../animations/modalAnimation.js';
import { lockScroll, unlockScroll } from '../utils/scrollLock.js';

//component for customModal in mott-design — width/height configurables, backdrop claro,
//la animación de apertura/cierre del panel se delega a una `ModalAnimation` (ver src/animations/modalAnimation.js):
//por defecto usa MorphAnimation (nace desde la forma/posición de `triggerRef`) si hay trigger, o FadeScaleAnimation si no
export default function CustomModal({ open, onClose, onCloseComplete, children, width = '32rem', height = 'auto', backdropOpacity = 0.35, triggerRef, animation, className, style }) {
    const modalRef = useRef(null);
    const overlayRef = useRef(null);
    const panelRef = useRef(null);
    const contentRef = useRef(null);
    const activeAnimation = animation ?? (triggerRef ? morphAnimation : fadeAnimation);
    
    // el lock es global y con contador, así que esta instancia tiene que aportar exactamente uno:
    // si se desmonta a mitad del cierre, el cleanup libera y el callback de la timeline podría
    // intentar liberar de nuevo, dejando el contador corrido y desbloqueando otra modal abierta
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
        
        // el backdrop viaja en el `ctx`: cada animación lo funde dentro de su propia timeline, así el
        // oscurecimiento y el movimiento del panel se leen como un mismo gesto y no como dos eventos
        // el `dialog` va en el ctx porque el "ghost" del ícono se cuelga de ahí (y no del panel): así
        // se queda clavado sobre el botón en vez de viajar con la modal
        const ctx = { dialog: modal, panel, content, overlay, trigger: triggerRef?.current };
        
        if (open && !modal.open) {
            // antes de `showModal()` a propósito: la animación mide el rect del trigger, así que el
            // layout ya tiene que estar en su estado final cuando eso pasa
            lock();
            modal.showModal();
            activeAnimation.open(ctx);
        }
        else if (!open && modal.open) {
            // `onCloseComplete` corre recién con la modal ya cerrada — es el momento en que quien la
            // usa puede devolver su trigger al estado default sin romper la ilusión del morph
            activeAnimation.close(ctx, () => {
                modal.close();
                // recién acá: si se liberara al arrancar el cierre, la página podría scrollear
                // mientras la modal se pliega y aterrizaría fuera del botón
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
                className={twMerge('relative m-auto max-h-[85vh] max-w-[92vw] overflow-y-auto rounded-[var(--radius-lg)] bg-[var(--modal-surface)] p-[var(--pad-card)]', className)}
                style={{ width, height, ...style }}
            >
                <div ref={contentRef}>
                    {children}
                </div>
            </div>
        </dialog>
    )
}
