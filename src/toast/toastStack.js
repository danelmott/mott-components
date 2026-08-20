// contenedor compartido de los toasts: uno solo para toda la app, creado de forma perezosa la primera
// vez que se abre un toast y cacheado a nivel de módulo.
const STACK_ATTR = 'data-mott-toast-stack';

const STACK_STYLE = {
    // `fixed` cumple dos funciones: saca al stack del área scrolleable (de ahí que el arrastre no
    // pueda generar scrollX) y lo vuelve containing block de sus hijos absolutos, que es lo que
    // necesita el despegue del toast saliente (ver `flyOut` en toast.jsx)
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    // ancho FIJO, y cumple dos roles: es el tope de ancho de los toasts (que se miden por su texto
    // contra este `max-width: 100%`) y mantiene la geometría estable. Si el stack fuera shrink-to-fit
    // se mediría según su hijo más ancho, y al despegar un toast para la salida se re-mediría al
    // siguiente: el saliente se apretaría contra un padre más angosto y el texto se rompería a mitad
    // de la animación.
    width: 'min(24rem, calc(100vw - 2rem))',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 'var(--gap-section)',
    zIndex: 'var(--z-floating)',
    // la franja vacía alrededor de los toasts no tiene que bloquear clicks en la página; cada toast
    // se re-habilita a sí mismo
    pointerEvents: 'none',
};

let stack = null;

export function getToastStack() {
    if (typeof document === 'undefined') return null;

    if (!stack?.isConnected) {
        // el nodo puede sobrevivir a un reload del módulo (HMR) aunque la variable se haya reseteado
        stack = document.querySelector(`[${STACK_ATTR}]`) ?? document.createElement('div');
        stack.setAttribute(STACK_ATTR, '');
        if (!stack.isConnected) document.body.appendChild(stack);
    }

    // los estilos se aplican SIEMPRE, también sobre un nodo encontrado. Si solo se aplicaran al
    // crearlo, un stack sobreviviente de una versión anterior del módulo quedaría con estilos viejos
    // conviviendo con toasts nuevos — que es justo cómo aparece un toast apretado a mitad del cierre.
    Object.assign(stack.style, STACK_STYLE);
    return stack;
}
