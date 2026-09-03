'use client';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import CustomModal from '../customModal/customModal.jsx';
import GeneratorGradientProfile from '../GeneratorGradientProfile/GeneratorGradientProfile.jsx';
import Icon from '../icon/icon.jsx';
import { pressHandlers } from '../animations/motion.js';
import { verifyTypesSettingsModal } from '../utils/verifyTypes.js';

/*Solo "Cuenta" vive aca. Las demas secciones (Agente, etc.) se agregan directamente a este arreglo
  cuando esten listas - a proposito no es un prop: el sidebar de configuracion no es una superficie
  para que quien consuma la libreria inyecte paneles arbitrarios, es contenido de la propia modal.*/
const SECTIONS = [
    { id: 'account', icon: 'person', label: 'cuenta' },
    { id: 'reset_password', icon: 'lock_reset', label: 'cambiar contraseña'}

];

const NAV_ROW =
    'mott-state-layer flex w-full min-w-0 items-center gap-3 rounded-[var(--radius-default)]' +
    ' border-0 bg-transparent px-4 py-2.5 text-left cursor-pointer' +
    ' mott-label-large mott-trim text-[var(--md-sys-color-on-surface-variant)]' +
    ' transition-[background-color,color] duration-[var(--duration-instant)]';

const NAV_ROW_SELECTED =
    'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]';

function AccountPanel({ name, email }) {
    return (
        <div className="flex w-full items-end justify-end">
            <GeneratorGradientProfile name={name} email={email} showControls={false} />
        </div>
    );
}

export default function SettingsModal({
    open,
    onClose,
    triggerRef,
    animation,
    name = 'danel mantilla',
    email = 'mantillapalominodanel@gmail.com',
    className,
    style,
}) {
    verifyTypesSettingsModal({ open, onClose, triggerRef, animation, name, email });

    const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            triggerRef={triggerRef}
            animation={animation}
            className={twMerge('w-[760px]', 'h-[760px]')}
            style={style}
        >
            <div className="flex gap-[var(--gap-block)]">
                <aside
                    className="flex w-44 shrink-0 flex-col gap-[var(--gap-tight)]"
                    role="tablist"
                >
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            type="button"
                            role="tab"
                            aria-selected={activeSection === section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={twMerge(NAV_ROW, activeSection === section.id && NAV_ROW_SELECTED)}
                            {...pressHandlers()}
                        >
                            <Icon name={section.icon} />

                            <span className="min-w-0 truncate"> 
                                {section.label}
                            </span>
                        </button>
                    ))}
                </aside>

                <div className="flex flex-2 items-end justify-end">
                    {activeSection === 'account' && <AccountPanel name={name} email={email} />}
                </div>
            </div>
        </CustomModal>
    );
}
