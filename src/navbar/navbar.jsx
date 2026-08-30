'use client';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { twMerge } from 'tailwind-merge';
import Icon from '../icon/icon.jsx';
import { morphSelection, selectionShape, pressHandlers } from '../animations/motion.js';
import { verifyTypesNavbar } from '../utils/verifyTypes.js';

/* Both variants size the rail to the full viewport height and place the icon group inside it with
   flex - not with `top-*` + a transform, which only ever meant something against a `fixed` (viewport-
   relative) box. `sticky` keeps the rail part of the document flow (see the note on the desktop
   <nav> below), so centring has to come from its own box now, not from the viewport it no longer
   has direct coordinates in. */
const DESKTOP_ALIGN = {
    center: 'justify-center',
    // Sin padding propio: el respiro por arriba lo pone ya el `p-[var(--gap-block)]` del <nav>, y
    // sumarle otro dejaria los iconos al doble de distancia del borde que del lado izquierdo.
    top: 'justify-start',
};

/*The navbar is deliberately neutral and has no `color` prop: its palette comes from the M3 surface
  and secondary-container roles, not from the caller. Selection reads as a morph - circle to
  squircle, scaled up - plus one step up the grey ramp, the same in light and dark.
  The split between the two animation systems is deliberate. COLOUR is transitioned by CSS because
  GSAP writes what it animates into the element's inline style: tweening backgroundColor would bake a
  literal hex over the var() and the button would stop following the theme from its first click
  onwards. GEOMETRY (borderRadius + scale) stays in GSAP because those two have to move as one, and
  splitting them across two engines with two different curves is what makes a morph look broken.

  Ninguna de las dos toca el boton: las dos corren sobre las variables de `mott-morph`, que lee un
  ::before sin texto dentro. El icono se queda quieto en el flujo del item mientras el pill crece y
  se redondea, y por eso no hay glifo que rerasterizar a un tamano distinto en cada cuadro - que era
  lo que hacia temblar la seleccion. El porque completo esta en `mott-morph`, en globals.css.

  Esto le importa a la modal: un item del nav se usa como `triggerRef`, y su caja ya no crece con la
  seleccion aunque lo pintado si. `measure()` en modalAnimation.js infla el rect por
  --mott-morph-scale antes de construir el clip, asi que el panel sigue saliendo del pill que se ve.
  El radio sigue siendo un porcentaje a proposito: es lo que hace que el control se lea como un
  circulo de verdad a cualquier --control-size, y `resolveRadius` lo resuelve por eje.*/
// El fondo va a --mott-morph-bg y no a `bg-*`: lo pinta el ::before de `mott-morph`, que es lo que
// se escala. Transicionarlo en el propio boton lo repintaba entero, icono incluido, en cada cuadro.
// El anillo de foco tambien lo pone `mott-morph`, dibujado sobre la forma y no sobre la caja.
const ITEM_BASE =
    'mott-state-layer mott-morph inline-flex items-center justify-center gap-2 border-0 cursor-pointer p-0' +
    ' mott-label-large mott-trim' +
    ' [--mott-morph-bg:var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]' +
    ' transition-[color] duration-[var(--duration-morph)] ease-[var(--ease-morph)]';

const ITEM_SELECTED = '[--mott-morph-bg:var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]';

// besides driving the animation, the ref is exposed outwards (e.g. to use the node as the
// `triggerRef` of a CustomModal anchored to this button)
const attachRef = (node, store, i, forwarded) => {
    if (i === null) store.current = node;
    else store.current[i] = node;
    if (typeof forwarded === 'function') forwarded(node);
    else if (forwarded) forwarded.current = node;
};

function NavItems({ items, selectedItem, onSelect, vertical }) {
    const itemRefs = useRef([]);
    const containerRef = useRef(null);
    const prevSelectedRef = useRef(selectedItem);
    const prevCountRef = useRef(null);

    useGSAP(() => {
        itemRefs.current.length = items.length;

        const shapeOf = (i) => selectionShape(i === selectedItem);

        // mounting, or the set of items itself changed: put the resting state in place, do not play it
        const settleOnly = prevCountRef.current !== items.length;
        prevCountRef.current = items.length;

        if (settleOnly) {
            itemRefs.current.forEach((el, i) => { if (el) gsap.set(el, shapeOf(i)); });
            prevSelectedRef.current = selectedItem;
            return;
        }

        const changed = new Set([prevSelectedRef.current, selectedItem]);
        prevSelectedRef.current = selectedItem;

        changed.forEach((i) => {
            const el = itemRefs.current[i];
            if (el) morphSelection(el, i === selectedItem);
        });
    }, { dependencies: [selectedItem, items.length], scope: containerRef });

    return (
        <div ref={containerRef} className={twMerge('inline-flex gap-[var(--gap-group)]', vertical && 'flex-col')}>
            {items.map((item, i) => {
                const iconOnly = !item.label;
                return (
                    <button
                        key={item.id ?? i}
                        ref={(el) => attachRef(el, itemRefs, i, item.buttonRef)}
                        type="button"
                        onClick={() => onSelect(i)}
                        aria-pressed={selectedItem === i}
                        className={twMerge(ITEM_BASE, selectedItem === i && ITEM_SELECTED)}
                        {...pressHandlers()}
                        style={{
                            height: 'var(--control-size-md)',
                            ...(iconOnly
                                ? { width: 'var(--control-size-md)' }
                                : { padding: '0 20px' }),
                        }}
                    >
                        {item.icon && (typeof item.icon === 'string' ? <Icon name={item.icon} /> : item.icon)}
                        {item.label && <span>{item.label}</span>}
                    </button>
                );
            })}
        </div>
    );
}

function LogoButton({ logo }) {
    const ref = useRef(null);
    const didMountRef = useRef(false);

    useGSAP(() => {
        if (!ref.current) return;
        const shape = selectionShape(!!logo.active);
        if (!didMountRef.current) {
            didMountRef.current = true;
            gsap.set(ref.current, shape);
            return;
        }
        morphSelection(ref.current, !!logo.active);
    }, { dependencies: [logo.active] });

    return (
        <button
            ref={(el) => attachRef(el, ref, null, logo.buttonRef)}
            type="button"
            onClick={logo.onClick}
            aria-pressed={!!logo.active}
            aria-label={logo.label ?? 'Inicio'}
            className={twMerge(ITEM_BASE, logo.active && ITEM_SELECTED)}
            {...pressHandlers()}
            style={{
                width: 'var(--control-size-md)',
                height: 'var(--control-size-md)',
            }}
        >
            {typeof logo.icon === 'string' ? <Icon name={logo.icon} /> : logo.icon}
        </button>
    );
}


export default function Navbar({
    items = [],
    selected,
    defaultSelected = null,
    onChange,
    logo,
    align = 'top',
    className,
    style,
}) {
    verifyTypesNavbar({ items, logo, selected, defaultSelected, onChange, align });
    const [internalSelected, setInternalSelected] = useState(defaultSelected);
    const isControlled = selected !== undefined;
    const selectedItem = isControlled ? selected : internalSelected;

    // no deselect: re-clicking the active route keeps it active, a route is always current
    const handleSelect = (i) => {
        if (!isControlled) setInternalSelected(i);
        onChange?.(i, items[i]);
    };

    return (
        <>
            {/* Desktop: a rail that takes its own column, not an overlay. `sticky` (not `fixed`) is
               what makes that true - a fixed element is pulled out of the document, so by CSS's own
               painting order it sits above ordinary flow content NO MATTER what z-index it is given;
               sticky stays part of the flow, reserving its width like any other box, so there is
               nothing left for a page's content to be covered by. `h-dvh` gives it a full-viewport-
               tall box to stick inside, which is also what makes `top-0` keep it pinned in view while
               the page scrolls past - the same "always visible" feel `fixed` gave it, without the
               overlap. There is no `z-[var(--z-nav)]` here for the same reason: once the rail and
               the page occupy separate boxes instead of the same screen space, there is nothing for
               a z-index to arbitrate.

               Ese `sticky` es tambien lo que hacia que el rail se esfumara al abrir una modal: el
               bloqueo de scroll ponia `overflow: hidden` en el <body>, eso lo convertia en un
               contenedor de scroll, y el rail pasaba a resolverse contra el en vez de contra el
               viewport. Arreglado en su sitio - `lockScroll` usa `overflow: clip`, que no crea
               contenedor de scroll - y explicado entero en src/utils/scrollLock.js. Aqui no hay que
               hacer nada, pero conviene saberlo antes de "arreglarlo" cambiando el sticky.

               La caja es el punto entero, asi que es exacta. Los botones miden 56px, y alrededor hay
               dos anillos que hacen cosas distintas:

               - PADDING de 16px por los cuatro lados - los 88px de ancho de la caja. Es ademas lo
                 que deja pintar a la seleccion, que dibuja un pill escalado a 62px sobre una caja de
                 56 (ver `mott-morph`) y se sale ~3px por lado; antes ese sitio lo daban 4px justos
                 de `px-1` y no sobraba ni un pixel.
               - MARGEN de 16px arriba y abajo y de 12px a cada lado - lo que despega el rail del
                 borde de la ventana por la izquierda y del contenido por la derecha. El de los
                 lados es mas corto que el vertical a proposito: arriba y abajo el hueco se lee
                 contra el vacio y aguanta los 16, pero en horizontal se suma al padding y a los
                 32px resultantes el rail empezaba a leerse como si flotara suelto en vez de ocupar
                 su columna. 12 (`--gap-section`) es el escalon justo por debajo, y sale del mismo
                 juego de tokens - nada de numeros sueltos.

               Los cuatro lados suman lo mismo a cada lado del boton: 28px en horizontal (12 + 16) y
               32 en vertical (16 + 16). Hubo una version con 8px de padding a la derecha, copiada de
               una referencia, con la idea de que el contenido de la pagina ya trae su propio hueco;
               en pantalla se veia lo que era, un rail descentrado dentro de su propia columna. Si
               alguien lo vuelve a intentar: el hueco del contenido es cosa del `<main>`, no de aqui,
               y la caja del rail se mide sola.

               El margen vertical obliga a bajar el alto: `h-dvh` mas 16px de margen arriba y abajo se
               saldria 32px por debajo del borde. De ahi el `calc()` - la caja mide el alto de la
               ventana MENOS sus dos margenes, y entonces su borde de abajo cae justo a 16px del
               fondo, igual que el de arriba. Son las dos unicas cifras que tienen que ir a la par, y
               salen las dos del mismo token.

               Y el `top` del sticky repite ese mismo margen en vez de ser 0. Comprobado, no
               deducido: con `top-0` el navegador pega el borde de la caja al tope del scrollport y
               el hueco de arriba se lo come - el rail estaba a 16px sin desplazar y saltaba a 0 en
               cuanto la pagina se movia. Con `top` igual al margen se queda a 16px en los dos
               estados y no hay salto.

               `w-fit` mantiene la caja honesta cuando el rail NO se monta dentro de una fila flex -
               `display: flex` en un elemento de bloque se estira al 100% de su padre - y `shrink-0`
               impide que el contenido ancho de al lado lo apriete por debajo de sus propios botones.

               This does mean the rail needs a place to push content INTO: mount it as a flex-row
               sibling of your page content (e.g. in app/layout.jsx), not floating on its own -
               `<div className="flex min-h-dvh"><Navbar .../><main className="flex-1 min-w-0 p-8">
               {children}</main></div>`. The page's padding belongs to that <main> and never to the
               row: padding on the row is exactly what pushes the rail off the left edge, and a
               heading left outside the <main> is a heading that does not respect the rail's column.
               Mobile stays the opposite of all this on purpose: a bottom bar is expected to float
               over the last bit of content, which is what its own `fixed` and `z-[var(--z-nav)]`
               below are for. */}
            <nav
                className={twMerge(
                    'hidden md:flex sticky top-[var(--gap-block)] h-[calc(100dvh_-_var(--gap-block)_*_2)] w-fit shrink-0 flex-col items-center'
                    + ' my-[var(--gap-block)] mx-[var(--gap-section)] p-[var(--gap-block)] gap-[var(--gap-group)]',
                    DESKTOP_ALIGN[align] ?? DESKTOP_ALIGN.center,
                    className
                )}
                style={style}
            >
                {logo && <LogoButton logo={logo} />}
                <NavItems items={items} selectedItem={selectedItem} onSelect={handleSelect} vertical />
            </nav>

            {/* Mobile: floating pill with the icons, inset from the edges - no logo, it does not fit a small bottom bar */}
            <nav
                className={twMerge(
                    'flex md:hidden fixed bottom-4 left-1/2 z-[var(--z-nav)] -translate-x-1/2 items-center gap-3',
                    className
                )}
                style={style}
            >
                <div
                    className="flex items-center gap-1 rounded-[var(--radius-full)] bg-[var(--md-sys-color-surface)] p-1"
                    style={{ boxShadow: 'var(--shadow-floating)' }}
                >
                    <NavItems items={items} selectedItem={selectedItem} onSelect={handleSelect} vertical={false} />
                </div>
            </nav>
        </>
    );
}
