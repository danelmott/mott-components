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
    top: 'justify-start pt-8',
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

               That box is the whole point, so it is exact: the full height, and a width that is its
               own buttons and nothing else - `--control-size-md` (56px) plus the 4px per side of
               `px-1`, 64px in total. Those 4px are not breathing room, they are the morph: a selected
               item paints a pill scaled to 62px over a 56px box (see `mott-morph`), so it overhangs
               ~3px each way, and with the rail flush against x=0 the window edge would shave that
               overhang off. `w-fit` keeps the box honest when the rail is NOT mounted inside a flex
               row - `display: flex` on a block-level element stretches to 100% of its parent - and
               `shrink-0` stops wide content beside it from squeezing it below its own buttons.

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
                    'hidden md:flex sticky top-0 h-dvh w-fit shrink-0 flex-col items-center px-1 gap-[var(--gap-group)]',
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
