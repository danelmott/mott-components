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





/*`animation` es un pasamanos hacia CustomModal, y existe por OptionsModal: abierta desde una fila
  de menu, esta modal tiene que apoyarse SOBRE la fila (`anchoredAnimation`) en vez de viajar al
  centro. Sin la prop se comporta igual que siempre - CustomModal elige `morphAnimation` cuando hay
  `triggerRef` - asi que no cambia nada para quien ya la usaba.*/
export default function ThemeModal({ open, onClose, triggerRef, title = 'Apariencia', animation }) {
    verifyTypesThemeModal({ open, onClose, triggerRef, title, animation });

    const { colorSeedHex, variant, setColorSeedHex, mode, setMode, THEMES_AVAILABLE } = useTheme();

    // a theme is the pair, not the colour: two entries could share a hex and differ in how it reads
    const isActive = (theme) =>
        theme.hex.toLowerCase() === colorSeedHex.toLowerCase() && (theme.variant ?? variant) === variant;

    const modeIndex = MODES.findIndex((m) => m.value === mode);

    return (
        <CustomModal open={open} onClose={onClose} triggerRef={triggerRef} animation={animation} className="w-[360px]">
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

                {/*Los acentos. Rejilla de cinco columnas y cada swatch tan ancho como la suya - el
                   mismo bloque, letra por letra, que el paso del color del onboarding
                   (onBoardingModal.jsx), y conviene que se reconozca como el mismo patron.

                   Rejilla y no `flex-wrap`, que es lo que habia: con diez swatches de 56px fijos en
                   un panel de 360 caben cinco por fila en desktop, pero en un movil el panel se
                   recorta a `92vw` y pasan a caber cuatro - el bloque se reordenaba a 4/4/2 y la
                   modal cambiaba de forma segun el telefono. Con las columnas fijadas a cinco, lo
                   que cede es el tamano del swatch: 56px en desktop y en un movil de 390 (o sea, ni
                   un pixel de cambio en la practica), y 43 en uno de 320, que es el ancho mas
                   estrecho que queda en circulacion. Medido, no estimado. Esos 43 se quedan por
                   debajo del objetivo tactil de 48 que recomienda Material, y es un precio asumido:
                   la alternativa era reordenar el bloque, que es justo lo que se venia a quitar.
                   Siguen muy por encima del minimo de 24px de la WCAG y llevan 8px de separacion
                   entre ellos, asi que no hay dos objetivos pegados.

                   `SwatchButton` esta escrito para esto: saca su alto del ancho por `aspectRatio`,
                   asi que `size="100%"` le da el ancho de la columna y sigue siendo redondo sin que
                   nadie calcule nada.*/}
                <div className="grid w-full grid-cols-5 gap-[var(--gap-group)]">
                    {THEMES_AVAILABLE.map((theme) => (
                        <SwatchButton
                            key={theme.name}
                            theme={theme}
                            size="100%"
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
