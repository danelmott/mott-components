'use client';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { twMerge } from 'tailwind-merge';
import Icon from '../icon/icon.jsx';
import { MORPH, CIRCLE_RADIUS, squircleRadius } from '../animations/motion.js';
import { verifyTypesNavbar } from '../utils/verifyTypes.js';

const DESKTOP_ALIGN = {
    center: 'top-1/2 -translate-y-1/2',
    top: 'top-8',
};

/*The navbar is deliberately neutral and has no `color` prop: its palette comes from the M3 surface
  and secondary-container roles, not from the caller. Selection reads as a morph - circle to
  squircle, scaled up - plus one step up the grey ramp, the same in light and dark.
  The split between the two animation systems is deliberate. COLOUR is transitioned by CSS because
  GSAP writes what it animates into the element's inline style: tweening backgroundColor would bake a
  literal hex over the var() and the button would stop following the theme from its first click
  onwards. GEOMETRY (borderRadius + scale) stays in GSAP because those two have to move as one, and
  splitting them across two engines with two different curves is what makes a morph look broken.
  The resting radius feeds the modal too: `resolveRadius` in modalAnimation.js reads the trigger's
  computed radius to build the clip-path the panel morphs out of. It now resolves percentages per
  axis and clamps to half the box, so Tailwind's full-round utility no longer corrupts the morph
  the way it used to - but a percentage is still what makes a control read as a true circle at any
  --control-size, so keep it.*/
const ITEM_BASE =
    'inline-flex items-center justify-center gap-2 border-0 cursor-pointer p-0' +
    ' text-[length:var(--text-md)] tracking-[var(--tracking-h4)] font-[number:var(--font-medium)]' +
    ' bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]' +
    ' transition-[background-color,color] duration-[var(--duration-base)] ease-[var(--ease-emphasized)]' +
    ' focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--md-sys-color-primary)]';

const ITEM_SELECTED = 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]';

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

        const squircle = squircleRadius();
        const shapeOf = (i) => (i === selectedItem
            ? { borderRadius: squircle, scale: 1.1 }
            : { borderRadius: CIRCLE_RADIUS, scale: 1 });

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
            if (el) gsap.to(el, { ...shapeOf(i), ...MORPH });
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
                        style={{
                            borderRadius: CIRCLE_RADIUS,
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
        const shape = {
            borderRadius: logo.active ? squircleRadius() : CIRCLE_RADIUS,
            scale: logo.active ? 1.1 : 1,
        };
        if (!didMountRef.current) {
            didMountRef.current = true;
            gsap.set(ref.current, shape);
            return;
        }
        gsap.to(ref.current, { ...shape, ...MORPH });
    }, { dependencies: [logo.active] });

    return (
        <button
            ref={(el) => attachRef(el, ref, null, logo.buttonRef)}
            type="button"
            onClick={logo.onClick}
            aria-pressed={!!logo.active}
            aria-label={logo.label ?? 'Inicio'}
            className={twMerge(ITEM_BASE, logo.active && ITEM_SELECTED)}
            style={{
                width: 'var(--control-size-md)',
                height: 'var(--control-size-md)',
                borderRadius: CIRCLE_RADIUS,
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
            {/* Desktop: icons floating over the page, with no card and no shadow */}
            <nav
                className={twMerge(
                    'hidden md:flex fixed left-4 z-[var(--z-nav)] flex-col items-center gap-[var(--gap-group)]',
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
