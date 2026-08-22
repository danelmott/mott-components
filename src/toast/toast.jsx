'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { Flip } from 'gsap/Flip';
import Icon from '../icon/icon.jsx';
import { getToastStack } from './toastStack.js';
import { ACCENTS } from '../theme/roles.js';
import { verifyTypesToast } from '../utils/verifyTypes.js';

gsap.registerPlugin(Draggable, Flip);

// One surface for all four variants - only the icon differs, in glyph and in tint. Pastel
// backgrounds tinted the whole piece and cost it its sobriety. The colour is not here: it comes from
// ACCENTS, so this map is down to the one thing the palette cannot supply.
const VARIANT_ICONS = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    danger: 'error',
};

// how far the toast can be dragged away from the dismiss edge, as a fraction of its width: just
// enough for the gesture to feel alive, never enough to push it into the page content
const COUNTER_DRAG = 0.12;

//component for toast in mott-design - semantic, animated with GSAP, drag to dismiss.
//It renders into a fixed stack in the top-right corner (see toastStack.js), not where it is declared.
export default function Toast({
    variant = 'info',
    title,
    children,
    open,
    onClose,
    onExited,
    duration = 5000,
    dismissThreshold = 0.5,
}) {
    verifyTypesToast({ variant, open, title, duration, dismissThreshold, onClose, onExited });

    const [rendered, setRendered] = useState(open);
    const toastRef = useRef(null);

    // `onClose` usually arrives as an inline lambda, so its identity changes on every render. Keeping
    // it in a ref stops the effects that use it from re-running: without this the Draggable was torn
    // down and rebuilt each render, and when that happened mid-drag it cut the gesture short.
    const onCloseRef = useRef(onClose);
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

    // Same treatment for `onExited`, which reports that the toast is fully gone. A queue owner (see
    // ToastProvider) needs it to drop the entry - without it there is no way to tell "closing" from
    // "already left", and entries pile up forever.
    const onExitedRef = useRef(onExited);
    useEffect(() => { onExitedRef.current = onExited; }, [onExited]);

    // single unmount point: both exit paths (drag and animation) go through here
    const finishExit = () => {
        setRendered(false);
        onExitedRef.current?.();
    };

    // Marks that the toast already left by drag. Without it, once the consumer reacts to `onClose` by
    // setting `open` to false, the exit animation would fire on a toast that is already off-screen and
    // its wind-up would drag it back into view for an instant.
    const dismissedRef = useRef(false);

    const glyph = VARIANT_ICONS[variant] ?? VARIANT_ICONS.info;
    // the icon is the only thing the variant tints, so it takes the family fill directly rather
    // than through a class - one fewer static string to keep in step with the palette
    const accent = ACCENTS[variant] ?? ACCENTS.info;

    useEffect(() => {
        if (open) {
            dismissedRef.current = false;
            setRendered(true);
        }
    }, [open]);

    // distance needed to clear the right edge entirely, whatever the toast's width and wherever it
    // starts from (it may already be mid-drag)
    const exitDistance = (el) => {
        const currentX = Number(gsap.getProperty(el, 'x')) || 0;
        return currentX + (window.innerWidth - el.getBoundingClientRect().left) + 16;
    };

    // Flies the toast out through the right edge and, IN PARALLEL, reflows the ones left behind.
    //
    // The overlap works by detaching the leaving toast the moment it starts: pinning it to
    // `position: absolute` where it already sat reproduces its exact box (no visible jump) but takes it
    // out of the flex flow, so the ones below reflow immediately instead of waiting for it to finish
    // leaving. Flip animates them from their old spot with transforms, so no layout runs per frame.
    const flyOut = (el, { ease, duration, onDone }) => {
        const stack = el.parentElement;
        const siblings = stack ? Array.from(stack.children).filter((c) => c !== el) : [];
        // state is captured BEFORE the detach and without the leaving toast: were it included, Flip
        // would give it transforms of its own that fight the exit tween
        const state = siblings.length ? Flip.getState(siblings) : null;

        // Measured with rects, which are FRACTIONAL. `offsetWidth`/`offsetTop` round to integers: if
        // the real width lands on something like 285.4px, pinning it at 285 shrinks the toast by half a
        // pixel, and text sitting right on the line boundary wraps - which changes its height and makes
        // it visibly deform mid-close. That is why it hit one toast and not the others: it depends on
        // where its fractional part falls.
        // Divided by the scale because the rect comes back scaled when the close interrupts the entry
        // animation, which tweens `scale`.
        const rect = el.getBoundingClientRect();
        const scaleX = Number(gsap.getProperty(el, 'scaleX')) || 1;
        const top = stack ? rect.top - stack.getBoundingClientRect().top : 0;
        Object.assign(el.style, {
            position: 'absolute',
            top: `${top}px`,
            right: '0',
            width: `${rect.width / scaleX}px`,
        });

        if (state) Flip.from(state, { duration, ease: 'power3.out' });
        gsap.to(el, { x: exitDistance(el), duration, ease, onComplete: onDone });
    };

    // --- lifetime -----------------------------------------------------------------------------
    // Tracks the REMAINING time rather than using a plain setTimeout, because the countdown has to be
    // pausable: a toast that closes under the cursor while you are reading it is worse than one that
    // never auto-closes at all.
    const timerRef = useRef(null);
    const remainingRef = useRef(duration);
    const startedAtRef = useRef(0);

    const pauseTimer = () => {
        if (!timerRef.current) return;
        clearTimeout(timerRef.current);
        timerRef.current = null;
        remainingRef.current -= Date.now() - startedAtRef.current;
    };

    const resumeTimer = () => {
        if (!duration || timerRef.current || remainingRef.current <= 0) return;
        startedAtRef.current = Date.now();
        timerRef.current = setTimeout(() => onCloseRef.current?.(), remainingRef.current);
    };

    useEffect(() => {
        if (!open || !duration) return;
        remainingRef.current = duration;
        resumeTimer();
        return pauseTimer;
    }, [open, duration]);

    // --- enter / exit animations --------------------------------------------------------------
    useGSAP(() => {
        if (open && toastRef.current) {
            gsap.fromTo(toastRef.current,
                { opacity: 0, x: 24, scale: 0.95 },
                { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
            );
        }
    }, { dependencies: [open, rendered] });

    useEffect(() => {
        if (open || !rendered || !toastRef.current) return;
        // already dragged out: nothing left to animate, just unmount
        if (dismissedRef.current) { finishExit(); return; }

        // Leaves through the same edge it entered by, with no fade. `back.in` mirrors the entry's
        // `back.out` exactly: it pulls back inwards to wind up, then fires out of the viewport.
        flyOut(toastRef.current, {
            ease: 'back.in(1.7)',
            duration: 0.45,
            onDone: finishExit,
        });
    }, [open, rendered]);

    // --- drag to dismiss ----------------------------------------------------------------------
    useEffect(() => {
        if (!rendered || !toastRef.current) return;
        const el = toastRef.current;
        const width = el.offsetWidth;
        // threshold is relative to the toast's real width, not a fixed number, so it adapts to a
        // one-line toast or a long one without recalibrating anything
        const threshold = width * dismissThreshold;

        const [draggable] = Draggable.create(el, {
            type: 'x',
            // the stack sits top-right, so dismissal goes towards the nearest edge; only a small tug
            // is allowed back towards the content
            bounds: { minX: -width * COUNTER_DRAG, maxX: width, minY: 0, maxY: 0 },
            onPressInit: pauseTimer,
            onDrag: function () {
                // opacity is tied to the threshold rather than a loose constant, so it communicates
                // how much further the toast has to go before it is dismissed
                gsap.set(el, { opacity: 1 - Math.min(Math.abs(this.x) / threshold, 1) * 0.6 });
            },
            onDragEnd: function () {
                if (this.x >= threshold) {
                    // no wind-up here: the user's gesture already supplied it, and pulling back now
                    // would fight them. It just carries on outwards. With the stack fixed, leaving the
                    // screen creates no overflow.
                    dismissedRef.current = true;
                    flyOut(el, {
                        ease: 'power2.in',
                        duration: 0.3,
                        onDone: () => onCloseRef.current?.(),
                    });
                } else {
                    gsap.to(el, { x: 0, opacity: 1, duration: 0.3, ease: 'power3.out' });
                    resumeTimer();
                }
            },
        });
        return () => draggable.kill();
    }, [rendered, dismissThreshold]);

    if (!rendered) return null;

    const stack = getToastStack();
    if (!stack) return null;

    return createPortal(
        <div
            ref={toastRef}
            role="status"
            onMouseEnter={pauseTimer}
            onMouseLeave={resumeTimer}
            className="inline-flex items-center gap-3 rounded-[var(--radius-lg)] cursor-grab active:cursor-grabbing"
            style={{
                padding: 'var(--pad-stat)',
                // same neutral surface for all four variants: the variant shows in the icon, not in
                // the panel. `surface-container-high` is the step Dropdown and the Select panel also
                // use, so everything that floats above the page sits at the same elevation.
                backgroundColor: 'var(--md-sys-color-surface-container-high)',
                boxShadow: 'var(--shadow-floating)',
                // sized by its text, with no minimum: a short toast has no reason to drag empty space
                // around. The cap comes from the stack, which has a fixed width - that is where the
                // text starts wrapping.
                maxWidth: '100%',
                // the stack sets `pointer-events: none` so it does not block the page; each toast
                // re-enables itself
                pointerEvents: 'auto',
            }}
        >
            <Icon name={glyph} size="xl" className="shrink-0" style={{ color: accent }} />
            {/* `min-w-0`: without it a flex item never shrinks below its min-content, and a long word
                would overflow the cap instead of wrapping */}
            <div className="flex min-w-0 flex-col gap-0.5">
                {title && (
                    <span className="text-[length:var(--text-sm)] font-[number:var(--font-medium)] text-[var(--md-sys-color-on-surface)]">
                        {title}
                    </span>
                )}
                <span className="text-[length:var(--text-sm)] text-[var(--md-sys-color-on-surface-variant)]">
                    {children}
                </span>
            </div>
        </div>,
        stack,
    )
}
