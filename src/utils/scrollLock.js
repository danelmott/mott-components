
let locks = 0;
let previous = null;


function scrollbarGap() {
    return window.innerWidth - document.documentElement.clientWidth;
}

//function for lock scroll when modals opens
export function lockScroll() {
    if (typeof document === 'undefined') return;
    if (++locks > 1) return; // another overlay was already open

    const { style } = document.body;
    const root = document.documentElement.style;
    const gap = scrollbarGap();

    previous = { paddingRight: style.paddingRight, rootOverflow: root.overflow };

    /*El bloqueo va SOLO en el <html>. Que el <body> se quedara fuera no es un olvido, es el
      arreglo: `overflow: hidden` convierte al elemento en un CONTENEDOR DE SCROLL, y
      `position: sticky` se resuelve contra el contenedor de scroll mas cercano. Con el <body>
      escondido, cualquier `sticky` de la pagina dejaba de mirar al viewport y pasaba a mirar a un
      <body> cuyo scroll es 0 por definicion: se soltaba de su sitio y caia a su posicion estatica,
      el principio del documento, que con la pagina desplazada queda muy por encima de lo que se ve.
      Eso era el rail del Navbar esfumandose al abrir cualquier modal y volviendo al cerrarla - y no
      era cosa del Navbar, le pasaria a cualquier cabecera `sticky` de una app que consuma esto.

      En el <html> no pasa, y por una regla que parece un tecnicismo y no lo es: el `overflow` del
      elemento raiz se PROPAGA al viewport, y el propio raiz se queda en `visible`. O sea que el
      <html> no llega a ser contenedor de scroll de nadie; el que deja de poder desplazarse es el
      viewport, que es justo lo que se busca, y conserva su posicion. Los `sticky` siguen
      resolviendose contra el mismo sitio de siempre y no se mueven.

      Y con el <html> basta: por esa misma propagacion, el <body> solo decide el scroll de la pagina
      cuando el raiz es `visible`. Aqui no lo es.*/
    root.overflow = 'hidden';
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
        document.documentElement.style.overflow = previous.rootOverflow;
        document.body.style.paddingRight = previous.paddingRight;
        previous = null;
    }
}
