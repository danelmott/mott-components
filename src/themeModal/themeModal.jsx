'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import CustomModal from '../customModal/customModal.jsx';
import ButtonGroup from '../buttons/buttonGroup.jsx';
import Icon from '../icon/icon.jsx';
import { useTheme } from '../theme/themeContext.jsx';
import { onColorFor } from '../theme/palette.js';
import { MORPH_SCALE, morphTo, pressHandlers, CIRCLE_RADIUS, squircleRadius } from '../animations/motion.js';
import { verifyTypesThemeModal } from '../utils/verifyTypes.js';


const MODES = [
    { value: 'light', icon: 'light_mode', label: 'Claro' },
    { value: 'dark', icon: 'dark_mode', label: 'Oscuro' },
    { value: 'system', icon: 'brightness_4', label: 'Sistema' },
];

// The swatches morph on the same shared numbers as ButtonGroup and Navbar, so every selection in
// the library moves alike: a circle resolving into a squircle rather than a box lighting up.
const SWATCH = 56;

// Three signals, all of them inside the bead - nothing draws a border around it. `mott-swatch` is
// the ring and the focus state; `mott-shine` is the hover wake; the shape morph and the check are
// GSAP's, below.
const SWATCH_CLASS = 'mott-shine mott-swatch flex items-center justify-center cursor-pointer border-0 p-0';


function Swatch({ theme, selected, onSelect }) {
    const ref = useRef(null);
    const checkRef = useRef(null);
    const didMountRef = useRef(false);

    useGSAP(() => {
        if (!ref.current) return;
        const shape = {
            borderRadius: selected ? squircleRadius() : CIRCLE_RADIUS,
            scale: selected ? MORPH_SCALE : 1,
        };
        const mark = { autoAlpha: selected ? 1 : 0, scale: selected ? 1 : 0.6 };
        if (!didMountRef.current) {
            didMountRef.current = true;
            gsap.set(ref.current, shape);
            gsap.set(checkRef.current, mark);
            return;
        }
        morphTo(ref.current, shape, { entering: selected });
        morphTo(checkRef.current, mark, { entering: selected });
    }, { dependencies: [selected] });

    return (
        <button
            ref={ref}
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            aria-label={theme.name}
            title={theme.name}
            className={SWATCH_CLASS}
            {...pressHandlers(selected ? MORPH_SCALE : 1)}
            style={{
                width: SWATCH,
                height: SWATCH,
                borderRadius: CIRCLE_RADIUS,
                background: `linear-gradient(98deg, rgb(255 255 255 / 0) 22%, rgb(255 255 255 / 0.20) 76%, rgb(255 255 255 / 0.12) 100%), ${theme.hex}`,
                '--mott-swatch-ring': selected ? '0.3' : '0.1',
            }}
        >
            <span ref={checkRef} className="flex">
                <Icon
                    name="check"
                    size="lg"
                    weight={700}
                    style={{ color: onColorFor(theme.hex) }}
                />
            </span>
        </button>
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
                        className="mott-headline-small"
                        style={{ color: 'var(--md-sys-color-on-surface)' }}
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
                        className="mott-body-medium"
                        style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
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
