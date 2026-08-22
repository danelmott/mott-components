'use client';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { twMerge } from 'tailwind-merge';
import Icon from '../icon/icon.jsx';
import { controlTint, FAMILIES } from '../theme/roles.js';
import { verifyTypesButtonGroup } from '../utils/verifyTypes.js';


//component for buttonGroup in mott-design - single selection, morph animated with GSAP
export default function ButtonGroup({ buttons, vertical = true, color = 'primary', defaultSelected = null, value, allowDeselect = true, onChange }) {
    verifyTypesButtonGroup({ buttons, vertical, color, allowDeselect, onChange, value, defaultSelected });
    const [internalSelected, setInternalSelected] = useState(defaultSelected);
    const isControlled = value !== undefined;
    const selectedButton = isControlled ? value : internalSelected;
    const itemRefs = useRef([]);
    const containerRef = useRef(null);
    const tint = controlTint(color) ?? controlTint('primary');
    // the resting state of every item: the neutral family's quiet step
    const resting = FAMILIES.neutral;

    // GSAP cannot interpolate "var(--token)" as a colour - resolve it to its real value before animating
    const resolveColor = (value) => {
        if (typeof value === 'string' && value.startsWith('var(')) {
            const token = value.slice(4, -1).trim();
            return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
        }
        return value;
    };

    useGSAP(() => {
        itemRefs.current.forEach((el, i) => {
            if (!el) return;
            const isSelected = i === selectedButton;
            gsap.to(el, {
                borderRadius: isSelected ? '28%' : '50%',
                scale: isSelected ? 1.1 : 1,
                backgroundColor: resolveColor(isSelected ? tint.surface : resting.container),
                color: resolveColor(isSelected ? tint.on : resting.onContainer),
                duration: 0.4,
                ease: 'power3.out',
            });
        });
    }, { dependencies: [selectedButton, color], scope: containerRef });

    const handleSelect = (i) => {
        const next = (allowDeselect && selectedButton === i) ? null : i;
        if (!isControlled) setInternalSelected(next);
        onChange?.(next, next === null ? null : buttons[i]);
    };

    return (
        <div ref={containerRef} className={twMerge('inline-flex gap-[var(--gap-group)]', vertical && 'flex-col')}>
            {buttons.map((btn, i) => {
                const iconOnly = !btn.label;
                // An icon-only item announces nothing on its own, because Icon is `aria-hidden`.
                // Without `ariaLabel` such a button reaches a screen reader as an anonymous control,
                // so it is passed straight through below (and doubles as the hover tooltip).
                return (
                    <button
                        key={btn.id ?? i}
                        ref={(el) => {
                            itemRefs.current[i] = el;
                            // besides driving its own animation, this exposes the node outwards (e.g.
                            // to anchor a CustomModal to it), just like `logo.buttonRef` in Navbar
                            if (typeof btn.buttonRef === 'function') btn.buttonRef(el);
                            else if (btn.buttonRef) btn.buttonRef.current = el;
                        }}
                        type="button"
                        onClick={() => handleSelect(i)}
                        aria-pressed={selectedButton === i}
                        aria-label={btn.ariaLabel}
                        title={btn.ariaLabel}
                        className="inline-flex items-center justify-center gap-2 border-0 cursor-pointer text-[length:var(--text-md)] tracking-[var(--tracking-h4)] font-[number:var(--font-medium)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--md-sys-color-primary)]"
                        style={{
                            borderRadius: '50%',
                            backgroundColor: resting.container,
                            color: resting.onContainer,
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
