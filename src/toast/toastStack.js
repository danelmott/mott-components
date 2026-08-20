// Shared toast container: one for the whole app, created lazily the first time a toast opens and
// cached at module level.
const STACK_ATTR = 'data-mott-toast-stack';

const STACK_STYLE = {
    // `fixed` does two jobs: it lifts the stack out of the scrollable area (which is why dragging
    // cannot produce scrollX) and makes it the containing block for its absolute children, which is
    // what the leaving toast's detach needs (see `flyOut` in toast.jsx)
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    // FIXED width, with two roles: it caps the toasts (which size themselves by their text against
    // this `max-width: 100%`) and it keeps the geometry stable. Were the stack shrink-to-fit it would
    // size to its widest child, and detaching a toast for its exit would re-measure it to the next
    // one: the leaving toast would be squeezed against a narrower parent and its text would re-wrap
    // mid-animation.
    width: 'min(24rem, calc(100vw - 2rem))',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 'var(--gap-section)',
    zIndex: 'var(--z-floating)',
    // the empty band around the toasts must not swallow clicks on the page; each toast re-enables
    // itself
    pointerEvents: 'none',
};

let stack = null;

export function getToastStack() {
    if (typeof document === 'undefined') return null;

    if (!stack?.isConnected) {
        // the node can outlive a module reload (HMR) even though the variable was reset
        stack = document.querySelector(`[${STACK_ATTR}]`) ?? document.createElement('div');
        stack.setAttribute(STACK_ATTR, '');
        if (!stack.isConnected) document.body.appendChild(stack);
    }

    // Styles are applied ALWAYS, including to a node that was found rather than created. Applying
    // them only on creation would leave a stack surviving from an older version of the module running
    // stale styles alongside new toasts - exactly how a toast ends up squeezed mid-close.
    Object.assign(stack.style, STACK_STYLE);
    return stack;
}
