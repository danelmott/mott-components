'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import CustomModal from '../customModal/customModal.jsx';
import ButtonGroup from '../buttons/buttonGroup.jsx';
import Icon from '../icon/icon.jsx';
import { useTheme } from '../theme/themeContext.jsx';
import { MORPH, CIRCLE_RADIUS, squircleRadius } from '../animations/motion.js';
import { verifyTypesThemeModal } from '../utils/verifyTypes.js';


const MODES = [
    { value: 'light', icon: 'light_mode', label: 'Claro' },
    { value: 'dark', icon: 'dark_mode', label: 'Oscuro' },
    { value: 'system', icon: 'brightness_4', label: 'Sistema' },
];

// The swatches morph on the same shared numbers as ButtonGroup and Navbar, so every selection in
// the library moves alike: a circle resolving into a squircle rather than a box lighting up.
const SWATCH = 56;


function Swatch({ theme, selected, onSelect }) {
    const ref = useRef(null);
    const didMountRef = useRef(false);

    useGSAP(() => {
        if (!ref.current) return;
        const shape = {
            borderRadius: selected ? squircleRadius() : CIRCLE_RADIUS,
            scale: selected ? 1.1 : 1,
        };
        /*Settle rather than play on the first pass: the modal mounts with one swatch already
          selected, and morphing it while the panel is still running its own opening animation is
          most of what made this modal feel stuck.*/
        if (!didMountRef.current) {
            didMountRef.current = true;
            gsap.set(ref.current, shape);
            return;
        }
        gsap.to(ref.current, { ...shape, ...MORPH });
    }, { dependencies: [selected] });

    return (
        <button
            ref={ref}
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            aria-label={theme.name}
            title={theme.name}
            className="cursor-pointer border-0 p-0 transition-shadow duration-[var(--duration-base)] ease-[var(--ease-emphasized)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--md-sys-color-primary)]"
            style={{
                width: SWATCH,
                height: SWATCH,
                borderRadius: CIRCLE_RADIUS,
                background: theme.hex,
                boxShadow: selected
                    ? '0 0 0 2px var(--md-sys-color-surface-container-high), 0 0 0 4px var(--md-sys-color-on-surface)'
                    : 'none',
            }}
        />
    );
}


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
                    <Icon name="palette" size="lg" style={{ color: 'var(--md-sys-color-primary)' }} />
                    <h2
                        className="font-[number:var(--font-medium)] tracking-[var(--tracking-h3)]"
                        style={{ fontSize: 'var(--text-xl)', color: 'var(--md-sys-color-on-surface)' }}
                    >
                        {title}
                    </h2>
                </div>

                {/*CONTAINER FOR THEME ACCENTS*/}
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

                {/*CONTAINER FOR THEME MODES*/}
                <div className="flex flex-col gap-[var(--gap-section)]">
                    <p
                        className="tracking-[var(--tracking-label)]"
                        style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)' }}
                    >
                        Modo
                    </p>
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
