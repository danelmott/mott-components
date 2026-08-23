
const STACK_ATTR = 'data-mott-toast-stack';

const STACK_STYLE = {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    width: 'min(24rem, calc(100vw - 2rem))',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 'var(--gap-section)',
    zIndex: 'var(--z-floating)',
    pointerEvents: 'none',
};

let stack = null;

export function getToastStack() {
    if (typeof document === 'undefined') return null;

    if (!stack?.isConnected) {
        stack = document.querySelector(`[${STACK_ATTR}]`) ?? document.createElement('div');
        stack.setAttribute(STACK_ATTR, '');
        if (!stack.isConnected) document.body.appendChild(stack);
    }

    Object.assign(stack.style, STACK_STYLE);
    return stack;
}
