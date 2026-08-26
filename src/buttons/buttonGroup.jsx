'use client';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { twMerge } from 'tailwind-merge';
import Icon from '../icon/icon.jsx';
import { selectionTint, FAMILIES } from '../theme/roles.js';
import { MORPH_SCALE, morphTo, pressHandlers, CIRCLE_RADIUS, squircleRadius } from '../animations/motion.js';
import { verifyTypesButtonGroup } from '../utils/verifyTypes.js';


/*Selection reads as a morph: a circle resolving into a squircle, scaled up. COLOUR is left to CSS
  (see `mott-btn-in-group` in globals.css) because GSAP writes what it animates into the inline
  style, and tweening backgroundColor would bake a literal hex over the role token - the button
  would stop following the theme from its first click onwards. GEOMETRY stays in GSAP because the
  radius and the scale have to move as one. Both halves run on --duration-base / --ease-emphasized,
  so they still land on the same frame. `morphTo` is what runs the geometry: it promotes the button
  to its own layer for the length of the tween, without which the browser re-rasterises the icon at
  a new size on every frame and the glyph visibly shivers - see the note on it in motion.js.*/


export default function ButtonGroup({ buttons, vertical = true, variant = 'support', defaultSelected = null, value, allowDeselect = true, onChange }) {
    verifyTypesButtonGroup({ buttons, vertical, variant, allowDeselect, onChange, value, defaultSelected });
    const [internalSelected, setInternalSelected] = useState(defaultSelected);
    const isControlled = value !== undefined;
    const selectedButton = isControlled ? value : internalSelected;
    const itemRefs = useRef([]);
    const containerRef = useRef(null);
    const prevSelectedRef = useRef(selectedButton);
    const prevCountRef = useRef(null);
    const selected = selectionTint(variant);
    const resting = FAMILIES.neutral;

    useGSAP(() => {
        // buttons can shrink; without this the array keeps handing back detached nodes to tween
        itemRefs.current.length = buttons.length;

        const squircle = squircleRadius();
        const shapeOf = (i) => (i === selectedButton
            ? { borderRadius: squircle, scale: MORPH_SCALE }
            : { borderRadius: CIRCLE_RADIUS, scale: 1 });

        /*The first pass - and any pass where the set of buttons itself changed - only puts the
          resting state in place. Animating it means a group that mounts already selected (the mode
          switch inside ThemeModal, for one) runs its morph on top of the modal's own opening
          animation, and the two together read as a stutter.*/
        const settleOnly = prevCountRef.current !== buttons.length;
        prevCountRef.current = buttons.length;

        if (settleOnly) {
            itemRefs.current.forEach((el, i) => { if (el) gsap.set(el, shapeOf(i)); });
            prevSelectedRef.current = selectedButton;
            return;
        }

        /*Only the two buttons whose state actually changed. Tweening all of them repainted every
          corner in the group on every click to arrive at the value they already had.*/
        const changed = new Set([prevSelectedRef.current, selectedButton]);
        prevSelectedRef.current = selectedButton;

        changed.forEach((i) => {
            const el = itemRefs.current[i];
            if (el) morphTo(el, shapeOf(i), { entering: i === selectedButton });
        });
    }, { dependencies: [selectedButton, buttons.length], scope: containerRef });

    const handleSelect = (i) => {
        const next = (allowDeselect && selectedButton === i) ? null : i;
        if (!isControlled) setInternalSelected(next);
        onChange?.(next, next === null ? null : buttons[i]);
    };

    return (
        <div ref={containerRef} className={twMerge('inline-flex gap-[var(--gap-group)]', vertical && 'flex-col')}>
            {buttons.map((btn, i) => {
                const iconOnly = !btn.label;
                return (
                    <button
                        key={btn.id ?? i}
                        ref={(el) => {
                            itemRefs.current[i] = el;
                            if (typeof btn.buttonRef === 'function') btn.buttonRef(el);
                            else if (btn.buttonRef) btn.buttonRef.current = el;
                        }}
                        type="button"
                        onClick={() => handleSelect(i)}
                        aria-pressed={selectedButton === i}
                        aria-label={btn.ariaLabel}
                        title={btn.ariaLabel}
                        className='mott-btn-in-group mott-state-layer'
                        /*The press has to travel through GSAP - it owns `transform` on this button, so a
                          CSS :active scale could never win. `base` is where the control rests, so the
                          press composes with the selection instead of fighting it.*/
                        {...pressHandlers(i === selectedButton ? MORPH_SCALE : 1)}
                        style={{
                            backgroundColor: i === selectedButton ? selected.surface : resting.container,
                            color: i === selectedButton ? selected.on : resting.onContainer,
                            borderRadius: CIRCLE_RADIUS,
                            height: 'var(--control-size-md)',
                            ...(iconOnly
                                ? { width: 'var(--control-size-md)', padding: 0 }
                                : { padding: '0 20px' }),
                        }}
                    >
                        {btn.icon && (typeof btn.icon === 'string' ? <Icon name={btn.icon} /> : btn.icon)}
                        {btn.label && <span>{btn.label}</span>}
                    </button>
                );
            })}
        </div>
    )
}
