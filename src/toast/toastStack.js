
const STACK_ATTR = 'data-mott-toast-stack';

let stack = null;

/*El unico nodo al que se portalean todos los toasts, se cree cuando se cree el primero.
  Aqui solo se crea y se marca: TODO el estilo - donde se pone, como se apila y como cambia con el
  ancho de la pantalla - vive en `[data-mott-toast-stack]` dentro de globals.css. Escribirlo aqui
  sobre `stack.style` significaba estilo inline, y el inline ni entiende de media queries ni deja
  que una hoja lo corrija: la pila se quedaba fija arriba a la derecha con la medida que hubiera
  cuando se creo.*/
export function getToastStack() {
    if (typeof document === 'undefined') return null;

    if (!stack?.isConnected) {
        stack = document.querySelector(`[${STACK_ATTR}]`) ?? document.createElement('div');
        stack.setAttribute(STACK_ATTR, '');
        if (!stack.isConnected) document.body.appendChild(stack);
    }

    return stack;
}
