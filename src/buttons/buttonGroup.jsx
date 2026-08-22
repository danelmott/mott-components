'use client';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { twMerge } from 'tailwind-merge';
import Icon from '../icon/icon.jsx';
import { selectionTint, FAMILIES } from '../theme/roles.js';
import { verifyTypesButtonGroup } from '../utils/verifyTypes.js';



const CIRCLE = '50%';
const SQUIRCLE = '28%';


export default function ButtonGroup({ buttons, vertical = true, color = 'secondary', defaultSelected = null, value, allowDeselect = true, onChange }) {
    verifyTypesButtonGroup({ buttons, vertical, color, allowDeselect, onChange, value, defaultSelected });
    const [internalSelected, setInternalSelected] = useState(defaultSelected);
    const isControlled = value !== undefined;
    const selectedButton = isControlled ? value : internalSelected;
    const itemRefs = useRef([]);
    const containerRef = useRef(null);
    const selected = selectionTint(color);
    const resting = FAMILIES.neutral;

    useGSAP(() => {
        itemRefs.current.forEach((el, i) => {
            if (!el) return;
            gsap.to(el, {
                borderRadius: i === selectedButton ? SQUIRCLE : CIRCLE,
                scale: i === selectedButton ? 1.1 : 1,
                duration: 0.4,
                ease: 'power3.out',
            });
        });
    }, { dependencies: [selectedButton], scope: containerRef });

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
                        className='mott-btn-in-group'
                        style={{
                            '--mott-surface': i === selectedButton ? selected.surface : resting.container,
                            '--mott-on': i === selectedButton ? selected.on : resting.onContainer,
                            borderRadius: CIRCLE,
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
