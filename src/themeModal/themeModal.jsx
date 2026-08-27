'use client';
import CustomModal from '../customModal/customModal.jsx';
import ButtonGroup from '../buttons/buttonGroup.jsx';
import Icon from '../icon/icon.jsx';
import { useTheme } from '../theme/themeContext.jsx';
import { verifyTypesThemeModal } from '../utils/verifyTypes.js';
import SwatchButton from './swatchButton.jsx';



const MODES = [
    { value: 'light', icon: 'light_mode', label: 'Claro' },
    { value: 'dark', icon: 'dark_mode', label: 'Oscuro' },
    { value: 'system', icon: 'brightness_4', label: 'Sistema' },
];





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
                        className="mott-headline-small mott-title-emphasis"
                        style={{ color: 'var(--md-sys-color-on-surface)' }}
                    >
                        {title}
                    </h2>
                </div>

                {/*CONTAINER FOR THEME ACCENTS*/}
                <div className="flex flex-wrap gap-[var(--gap-group)]">
                    {THEMES_AVAILABLE.map((theme) => (
                        <SwatchButton
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
