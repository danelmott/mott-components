// Page scroll lock for modal overlays.
//
// It is REFERENCE COUNTED rather than a boolean because two overlays can overlap (one closing while
// another opens): if the first to finish released the lock, the page would scroll again with the
// other still open. That is why the state lives on the module, not on a component.
let locks = 0;
let previous = null;

// `overflow: hidden` on the body removes the scrollbar and the page jumps by ~15px. Here that is not
// merely ugly: `MorphAnimation` measures the trigger's rect on open, so a layout that shifts afterwards
// makes the modal grow out of the wrong place. The gap is compensated with padding.
function scrollbarGap() {
    return window.innerWidth - document.documentElement.clientWidth;
}

export function lockScroll() {
    if (typeof document === 'undefined') return;
    if (++locks > 1) return; // another overlay was already open

    const { style } = document.body;
    const gap = scrollbarGap();
    // the INLINE values are saved (not the computed ones) so the exact previous state is restored and
    // whatever the consumer defines in their own CSS is left alone
    previous = { overflow: style.overflow, paddingRight: style.paddingRight };

    style.overflow = 'hidden';
    if (gap > 0) {
        const current = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
        style.paddingRight = `${current + gap}px`;
    }
}

export function unlockScroll() {
    if (typeof document === 'undefined') return;
    if (locks === 0) return;
    if (--locks > 0) return; // some overlay is still open

    if (previous) {
        document.body.style.overflow = previous.overflow;
        document.body.style.paddingRight = previous.paddingRight;
        previous = null;
    }
}
