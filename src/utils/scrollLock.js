// bloqueo del scroll de la página para overlays modales.
//
// Va con CONTADOR de referencias y no con un booleano porque puede haber dos overlays solapados (uno
// cerrándose mientras otro abre): si el primero en terminar liberara el lock, la página volvería a
// scrollear con el otro todavía abierto. Por eso el estado es de módulo y no de componente.
let locks = 0;
let previous = null;

// `overflow: hidden` en el body hace desaparecer la scrollbar y la página salta ~15px. Acá eso no es
// solo feo: `MorphAnimation` mide el rect del trigger al abrir, así que un layout que se corre después
// hace que la modal nazca de un lugar equivocado. Compensamos el hueco con padding.
function scrollbarGap() {
    return window.innerWidth - document.documentElement.clientWidth;
}

export function lockScroll() {
    if (typeof document === 'undefined') return;
    if (++locks > 1) return; // ya había otro overlay abierto

    const { style } = document.body;
    const gap = scrollbarGap();
    // se guardan los valores INLINE (no los computados) para restaurar exactamente lo que había y no
    // pisar lo que el consumidor tenga definido en su CSS
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
    if (--locks > 0) return; // todavía queda algún overlay abierto

    if (previous) {
        document.body.style.overflow = previous.overflow;
        document.body.style.paddingRight = previous.paddingRight;
        previous = null;
    }
}
