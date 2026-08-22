'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import CustomModal from '../customModal/customModal.jsx';
import ButtonGroup from '../buttons/buttonGroup.jsx';
import Icon from '../icon/icon.jsx';
import { useTheme } from './themeContext.jsx';
import { verifyTypesThemeModal } from '../utils/verifyTypes.js';


const MODES = [
    { value: 'light', icon: 'light_mode', label: 'Claro' },
    { value: 'dark', icon: 'dark_mode', label: 'Oscuro' },
    { value: 'system', icon: 'brightness_4', label: 'Sistema' },
];

// Same numbers ButtonGroup animates with, so the two selections in the library move alike: a circle
// resolving into a squircle rather than a box lighting up.
const MORPH = { duration: 0.4, ease: 'power3.out' };
const CIRCLE = '50%';
const SWATCH = 56;


const squircleRadius = () =>
    getComputedStyle(document.documentElement).getPropertyValue('--control-radius').trim() || '28%';


function Swatch({ theme, selected, onSelect }) {
    const ref = useRef(null);

    useGSAP(() => {
        gsap.to(ref.current, {
            borderRadius: selected ? squircleRadius() : CIRCLE,
            scale: selected ? 1.1 : 1,
            ...MORPH,
        });
    }, { dependencies: [selected] });

    return (
        <button
            ref={ref}
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            aria-label={theme.name}
            title={theme.name}
            className="cursor-pointer border-0 p-0 transition-shadow duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--md-sys-color-primary)]"
            style={{
                width: SWATCH,
                height: SWATCH,
                borderRadius: CIRCLE,
                background: theme.hex,
                // offset ring rather than a border: it never eats into the colour, and it is the one
                // marker that stays visible on a swatch as dark as the neutral one
                boxShadow: selected
                    ? '0 0 0 2px var(--md-sys-color-surface-container-high), 0 0 0 4px var(--md-sys-color-primary)'
                    : 'none',
            }}
        />
    );
}

//component for the appearance modal in mott-design — the seed colour and the light/dark mode, which
//are the two halves of what ThemeProvider holds.
export default function ThemeModal({ open, onClose, triggerRef, title = 'Apariencia' }) {
    verifyTypesThemeModal({ open, onClose, triggerRef, title });

    const { colorSeedHex, variant, setColorSeedHex, mode, setMode, THEMES_AVAILABLE } = useTheme();

    // a theme is the pair, not the colour: two entries could share a hex and differ in how it reads
    const isActive = (theme) =>
        theme.hex.toLowerCase() === colorSeedHex.toLowerCase() && (theme.variant ?? variant) === variant;

    const modeIndex = MODES.findIndex((m) => m.value === mode);

    return (
        <CustomModal open={open} onClose={onClose} triggerRef={triggerRef} className="w-[360px]">
            <div className="flex flex-col gap-[var(--gap-page)]">
                <div className="flex items-center gap-[var(--gap-group)]">
                    <Icon name="palette" size="lg" />
                    <h2
                        className="font-[number:var(--font-medium)] tracking-[var(--tracking-h3)]"
                        style={{ fontSize: 'var(--text-xl)', color: 'var(--md-sys-color-on-surface)' }}
                    >
                        {title}
                    </h2>
                </div>

                {/* Flex and not a grid: a grid with `1fr` columns stretches each cell to fill the
                    panel, which pushed the swatches far apart no matter how small the gap was. Flex
                    lets them keep their own width and sit at the gap ButtonGroup uses, so the two
                    rows of controls in this modal are spaced alike. `flex-wrap` keeps what the grid
                    was good for: more themes drop to a second line on their own. */}
                <div className="flex flex-wrap gap-[var(--gap-group)]">
                    {THEMES_AVAILABLE.map((theme) => (
                        <Swatch
                            key={theme.name}
                            theme={theme}
                            selected={isActive(theme)}
                            onSelect={() => setColorSeedHex(theme.hex, theme.variant)}
                        />
                    ))}
                </div>

                <div className="flex flex-col gap-[var(--gap-section)]">
                    <p
                        className="tracking-[var(--tracking-label)]"
                        style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)' }}
                    >
                        Modo
                    </p>
                    {/* allowDeselect is off: there is no such thing as "no mode" — clicking the
                        active one again would otherwise leave the theme with nothing selected */}
                    <ButtonGroup
                        vertical={false}
                        allowDeselect={false}
                        value={modeIndex}
                        onChange={(index) => setMode(MODES[index].value)}
                        buttons={MODES.map((m) => ({ id: m.value, icon: m.icon, ariaLabel: m.label }))}
                    />
                </div>
            </div>
        </CustomModal>
    );
}
