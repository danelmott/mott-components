'use client';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import CustomModal from '../customModal/customModal.jsx';
import GeneratorGradientProfile from '../GeneratorGradientProfile/GeneratorGradientProfile.jsx';
import Icon from '../icon/icon.jsx';
import Text from '../text/text.jsx';
import Button from '../buttons/button.jsx';
import { pressHandlers } from '../animations/motion.js';
import { verifyTypesSettingsModal } from '../utils/verifyTypes.js';


const SECTIONS = [
    { id: 'account', icon: 'person', label: 'Cuenta' },
    { id: 'reset_password', icon: 'lock_reset', label: 'Cambiar contraseña' },
];

// `min-w-0` en la fila y en el texto es lo que deja que `truncate` recorte en vez de desbordar: sin
// eso el span mide su contenido completo (min-width:auto) y el flex nunca lo encoge por debajo.
const NAV_ROW =
    'mott-state-layer flex w-full min-w-0 items-center gap-3 rounded-[var(--radius-default)]' +
    ' border-0 bg-transparent px-4 py-3 text-left cursor-pointer' +
    ' mott-label-large mott-trim text-[var(--md-sys-color-on-surface-variant)]' +
    ' transition-[background-color,color] duration-[var(--duration-instant)]';

const NAV_ROW_SELECTED =
    'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]';


const NAV_ICON_TONE = {
    default: '',
    selected: 'text-[var(--md-sys-color-on-secondary-container)]',
};

function AccountPanel({ name, email }) {
    return (
        <div className="h-full w-full">
            <GeneratorGradientProfile name={name} email={email} fill />
        </div>
    );
}


function ResetPassword({ email }) {
    return (
        // `max-w-sm` y no el ancho del panel: una columna de texto que cruza los 500px del area deja
        // de leerse de corrido. El centrado lo pone el contenedor de la derecha, aqui solo la caja.
        <div className="flex h-full w-full max-w-sm flex-col items-center justify-center gap-[var(--gap-page)] text-center">
            <div className="flex flex-col items-center gap-[var(--gap-block)]">
                <span
                    className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-full)]
                               bg-[var(--md-sys-color-secondary-container)]
                               text-[var(--md-sys-color-on-secondary-container)]"
                    aria-hidden="true"
                >
                    <Icon name="lock_reset" size="lg" />
                </span>

                <div className="flex flex-col gap-[var(--gap-group)]">
                    <Text variant="headline-small" as="h3">
                        Cambia tu contraseña
                    </Text>
                </div>
            </div>

            {/*El destino del codigo, dicho entero. `truncate` con `min-w-0` recorta el correo largo
               en vez de estirar la fila (misma razon que en la navegacion de la izquierda).*/}
            <div className="flex w-full min-w-0 items-center gap-[var(--gap-section)] rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container-high)] px-4 py-3 text-left">
                <Icon
                    name="mail"
                    className="shrink-0 text-[var(--md-sys-color-on-surface-variant)]"
                />
                <div className="flex min-w-0 flex-col">
                    <Text variant="label-small" tone="muted">
                        Enviaremos el código a
                    </Text>
                    <Text variant="body-medium" className="truncate">
                        {email}
                    </Text>
                </div>
            </div>

            <div className="flex w-full flex-col items-center gap-[var(--gap-section)]">
                <Button variant="action" shape="pill" fullWidth>
                    Verificar cuenta
                </Button>
            </div>
        </div>
    );
}

export default function SettingsModal({
    open,
    onClose,
    triggerRef,
    animation,
    name = '',
    email = '',
    className,
    style,
}) {
    verifyTypesSettingsModal({ open, onClose, triggerRef, animation, name, email });

    const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

    // Datos de prueba: la cadena vacia tambien cae aca, no solo `undefined`. Navbar -> OptionsModal
    // pasa `name`/`email` como '' porque todavia no los recoge de su prop `account`, asi que un
    // default de parametro nunca llegaria a aplicarse y la tarjeta se pintaba sin nombre ni correo.
    const displayName = name || 'Usuario Test';
    const displayEmail = email || 'test@mottdesign.com';

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            triggerRef={triggerRef}
            animation={animation}
            // alto fijo a proposito: el panel no puede cambiar de forma solo porque una seccion
            // (como "Cambiar contraseña", todavia sin contenido propio) tenga menos que mostrar que
            // otra - las dos viven dentro de la misma caja de 760x760.
            // `p-0` gana sobre el `p-[var(--pad-card)]` que CustomModal trae por defecto (twMerge
            // resuelve el conflicto): el sidebar necesita llegar pintado a los cuatro bordes, asi
            // que el padding lo pone cada mitad por su cuenta, no el panel.
            className={twMerge('w-[760px] h-[760px] p-0', className)}
            style={style}
        >
            <div className="flex h-full">
                <aside
                    className="flex z-10 w-56 shrink-0 flex-col gap-[var(--gap-tight)] rounded-l-[var(--radius-modal)] bg-[var(--md-sys-color-surface-container-low)] p-[var(--gap-section)]"
                    role="tablist"
                >
                    {SECTIONS.map((section) => {
                        const selected = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                type="button"
                                role="tab"
                                aria-selected={selected}
                                onClick={() => setActiveSection(section.id)}
                                className={twMerge(NAV_ROW, selected && NAV_ROW_SELECTED)}
                                {...pressHandlers()}
                            >
                                <Icon
                                    name={section.icon}
                                    className={twMerge('shrink-0', selected ? NAV_ICON_TONE.selected : NAV_ICON_TONE.default)}
                                />
                                <span className="min-w-0 flex-1 truncate">{section.label}</span>
                            </button>
                        );
                    })}
                </aside>

                <div className="flex h-full flex-1 items-center justify-center p-[var(--pad-card)]">
                    {activeSection === 'account' && <AccountPanel name={displayName} email={displayEmail} />}
                    {activeSection == 'reset_password' && <ResetPassword email={displayEmail} />}
                </div>
            </div>
        </CustomModal>
    );
}
