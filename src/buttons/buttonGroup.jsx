'use client';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { twMerge } from 'tailwind-merge';
import Icon from '../icon/icon.jsx';

const COLOR_PRESETS = {
    primary: { bg: 'var(--color-action)', fg: 'var(--text-on-action)' },
    secondary: { bg: 'var(--dark-navy-text)', fg: 'var(--white)' },
    outline: { bg: 'var(--light-gray-background)', fg: 'var(--dark-navy-text)' },
    ghost: { bg: 'transparent', fg: 'var(--dark-navy-text)' },
    danger: { bg: 'var(--color-danger)', fg: 'var(--text-on-danger)' },
};

//component for buttonGroup in mott-design — selección única, morph animado con GSAP
export default function ButtonGroup({ buttons, vertical = true, color = 'primary', defaultSelected = null, value, allowDeselect = true, onChange }) {
    const [internalSelected, setInternalSelected] = useState(defaultSelected);
    const isControlled = value !== undefined;
    const selectedButton = isControlled ? value : internalSelected;
    const itemRefs = useRef([]);
    const containerRef = useRef(null);
    const preset = COLOR_PRESETS[color] ?? COLOR_PRESETS.primary;

    // GSAP no puede interpolar "var(--token)" como color — hay que resolverlo al valor real antes de animar
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
                backgroundColor: resolveColor(isSelected ? preset.bg : 'var(--light-gray-background)'),
                color: resolveColor(isSelected ? preset.fg : 'var(--dark-navy-text)'),
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
                return (
                    <button
                        key={btn.id ?? i}
                        ref={(el) => (itemRefs.current[i] = el)}
                        type="button"
                        onClick={() => handleSelect(i)}
                        aria-pressed={selectedButton === i}
                        className="inline-flex items-center justify-center gap-2 border-0 cursor-pointer text-[length:var(--text-md)] tracking-[var(--tracking-h4)] font-[number:var(--font-medium)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-action)]"
                        style={{
                            borderRadius: '50%',
                            backgroundColor: 'var(--light-gray-background)',
                            color: 'var(--dark-navy-text)',
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
