'use client';
import { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import gsap from 'gsap';
import ButtonGroup from '../buttons/buttonGroup.jsx';
import Icon from '../icon/icon.jsx';

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

// mismo tratamiento visual que el ítem seleccionado de ButtonGroup (squircle + escala + color),
// pero con su propio estado `active` controlado por quien use Navbar — no depende de `selected`/rutas
function LogoButton({ logo, color }) {
    const ref = useRef(null);
    const preset = COLOR_PRESETS[logo.color ?? color] ?? COLOR_PRESETS.primary;

    // además de la animación propia, permite exponer el nodo del botón hacia afuera
    // (ej. para usarlo como `triggerRef` de un CustomModal anclado a este botón)
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

//navbar responsive — rail minimalista en desktop (md+, centrado o arriba vía `align`), pill flotante + FAB en mobile.
//`selected` es controlado (ej. derivado de la ruta actual) — el logo tiene su propio estado `active` independiente,
//y el fab queda afuera de cualquier sistema de selección (son acciones, no rutas).
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
    return (
        <>
            {/* Desktop: íconos flotando sobre la página, sin tarjeta ni sombra */}
            <nav
                className={twMerge(
                    'hidden md:flex fixed left-4 z-20 flex-col items-center gap-[var(--gap-group)]',
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

            {/* Mobile: pill flotante con los íconos + FAB aparte, con margen (no pegado a los bordes) — sin logo, no entra en un bottom bar chico */}
            <nav
                className={twMerge(
                    'flex md:hidden fixed bottom-4 left-1/2 z-20 -translate-x-1/2 items-center gap-3',
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
