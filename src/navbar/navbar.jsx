'use client';
import { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import gsap from 'gsap';
import ButtonGroup from '../buttons/buttonGroup.jsx';
import Icon from '../icon/icon.jsx';
import { verifyTypesNavbar } from '../utils/verifyTypes.js';

const COLOR_PRESETS = {
    primary: { bg: 'var(--color-action)', fg: 'var(--text-on-action)' },
    secondary: { bg: 'var(--dark-navy-text)', fg: 'var(--white)' },
    outline: { bg: 'var(--light-gray-background)', fg: 'var(--dark-navy-text)' },
    ghost: { bg: 'transparent', fg: 'var(--dark-navy-text)' },
    danger: { bg: 'var(--color-danger)', fg: 'var(--text-on-danger)' },
};

const DESKTOP_ALIGN = {
    center: 'top-1/2 -translate-y-1/2',
    top: 'top-8',
};

function LogoButton({ logo, color }) {
    const ref = useRef(null);
    const preset = COLOR_PRESETS[logo.color ?? color] ?? COLOR_PRESETS.primary;
    
    // besides driving its own animation, this exposes the button node outwards (e.g. to use it as the
    // `triggerRef` of a CustomModal anchored to this button)
    const setRefs = (node) => {
        ref.current = node;
        if (typeof logo.buttonRef === 'function') logo.buttonRef(node);
        else if (logo.buttonRef) logo.buttonRef.current = node;
    };
    
    const resolveColor = (value) => {
        if (typeof value === 'string' && value.startsWith('var(')) {
            const token = value.slice(4, -1).trim();
            return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
        }
        return value;
    };
    
    useEffect(() => {
        if (!ref.current) return;
        gsap.to(ref.current, {
            borderRadius: logo.active ? '28%' : '50%',
            scale: logo.active ? 1.1 : 1,
            backgroundColor: resolveColor(logo.active ? preset.bg : 'var(--light-gray-background)'),
            color: resolveColor(logo.active ? preset.fg : 'var(--dark-navy-text)'),
            duration: 0.4,
            ease: 'power3.out',
        });
    }, [logo.active, preset]);
    
    return (
        <button
            ref={setRefs}
            type="button"
            onClick={logo.onClick}
            aria-pressed={!!logo.active}
            aria-label={logo.label ?? 'Inicio'}
            className="inline-flex items-center justify-center border-0 cursor-pointer p-0"
            style={{
                width: 'var(--control-size-md)',
                height: 'var(--control-size-md)',
                borderRadius: '50%',
                backgroundColor: 'var(--light-gray-background)',
                color: 'var(--dark-navy-text)',
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
    color = 'primary',
    logo,
    align = 'top',
    className,
    style,
}) {
    verifyTypesNavbar({ items, logo, selected, defaultSelected, onChange, color, align });

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
                {logo && <LogoButton logo={logo} color={color} />}
                <ButtonGroup
                    vertical
                    buttons={items}
                    value={selected}
                    defaultSelected={defaultSelected}
                    allowDeselect={false}
                    onChange={onChange}
                    color={color}
                />
            </nav>
            
            {/* Mobile: floating pill with the icons, inset from the edges - no logo, it does not fit a small bottom bar */}
            <nav
                className={twMerge(
                    'flex md:hidden fixed bottom-4 left-1/2 z-[var(--z-nav)] -translate-x-1/2 items-center gap-3',
                    className
                )}
                style={style}
            >
                <div className="flex items-center gap-1 rounded-[var(--radius-full)] bg-[var(--white)] p-1 shadow-md">
                    <ButtonGroup
                        vertical={false}
                        buttons={items}
                        value={selected}
                        defaultSelected={defaultSelected}
                        allowDeselect={false}
                        onChange={onChange}
                        color={color}
                    />
                </div>
            </nav>
        </>
    )
}
