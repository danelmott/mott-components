'use client';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { twMerge } from 'tailwind-merge';
import Icon from '../icon/icon.jsx';
import { selectionTint, FAMILIES } from '../theme/roles.js';
import { morphSelection, selectionShape, pressHandlers } from '../animations/motion.js';
import { verifyTypesButtonGroup } from '../utils/verifyTypes.js';


/*Selection reads as a morph: a circle resolving into a squircle, scaled up. COLOUR is left to CSS
  (see `mott-morph` in globals.css) because GSAP writes what it animates into the inline style, and
  tweening backgroundColor would bake a literal hex over the role token - the button would stop
  following the theme from its first click onwards. GEOMETRY stays in GSAP because the radius and
  the scale have to move as one. Both halves run on --duration-morph / --ease-morph, so they land
  on the same frame.

  Ni una ni otra tocan el boton: las dos corren sobre ::before, y lo unico que se anima aqui son las
  dos variables que ese pseudo-elemento lee. Esa es la diferencia entre esto y lo que temblaba - el
  icono ya no esta dentro de lo que se escala y se repinta, asi que no hay glifo que rerasterizar a
  un tamano distinto en cada cuadro. El porque completo esta en `mott-morph`.*/


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

        const shapeOf = (i) => selectionShape(i === selectedButton);

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
            if (el) morphSelection(el, i === selectedButton);
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
                        className='mott-btn-in-group mott-state-layer mott-morph'
                        /*El pulsado sigue pasando por GSAP - un `:active { transform }` de CSS no le
                          ganaria al transform inline. Ya no necesita saber donde descansa el control:
                          la seleccion vive en --mott-morph-scale, sobre ::before, asi que el boton
                          descansa siempre en 1 y el encogido se compone con el pill sin pelearse por
                          `scale` con nadie.*/
                        {...pressHandlers()}
                        style={{
                            /*El fondo lo pinta ::before, no el boton: transicionarlo aqui lo repintaba
                              entero - texto incluido - en cada cuadro del morph.*/
                            '--mott-morph-bg': i === selectedButton ? selected.surface : resting.container,
                            color: i === selectedButton ? selected.on : resting.onContainer,
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
