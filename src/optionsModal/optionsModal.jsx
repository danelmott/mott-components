'use client';
import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import CustomModal from '../customModal/customModal.jsx';
import ThemeModal from '../themeModal/themeModal.jsx';
import SettingsModal from '../settingsModal/settingsModal.jsx';
import Icon from '../icon/icon.jsx';
import { AnchoredAnimation, anchoredAnimation, morphAnimation } from '../animations/modalAnimation.js';
import { pressHandlers } from '../animations/motion.js';
import { verifyTypesOptionsModal } from '../utils/verifyTypes.js';
import ModalCloseSection from '../modalCloseSection/modalCLoseSection.jsx';

const ROW_BASE =
    'mott-state-layer flex w-full items-center gap-[var(--gap-group)] rounded-[var(--radius-default)]' +
    ' border-0 bg-transparent px-5 py-3.5 text-left cursor-pointer whitespace-nowrap' +
    ' mott-label-large mott-trim transition-[color] duration-[var(--duration-instant)]';

const ROW_TONE = {
    default: 'text-[var(--md-sys-color-on-surface)]',
    danger: 'text-[var(--md-sys-color-error)]',
};

const APPEARANCE_ANIMATION = new AnchoredAnimation({ anchor: 'panel', align: 'edge' });

const ICON_TONE = {
    default: 'text-[var(--md-sys-color-on-surface-variant)]',
    danger: 'text-[var(--md-sys-color-error)]',
};

export const appearanceItem = (overrides = {}) => ({
    id: 'appearance',
    kind: 'appearance',
    icon: 'palette',
    label: 'Apariencia',
    // no cierra el menu: la modal del tema se apoya ENCIMA de el, que es el punto
    closeOnSelect: false,
    ...overrides,
});

export const feedbackItem = (overrides = {}) => ({
    id: 'feedback',
    icon: 'feedback',
    label: 'Dar Feedback',
    ...overrides,
});

export const logoutItem = (overrides = {}) => ({
    id: 'logout',
    icon: 'logout',
    label: 'Cerrar Sesión',
    tone: 'danger',
    ...overrides,
});

export const settingsItem = (overrides = {}) => ({
    id: 'settings',
    kind: 'settings',
    icon: 'settings',
    label: 'Configuración',
    // mismo trato que 'appearance': la modal de configuracion se apoya encima del menu, no lo cierra
    closeOnSelect: false,
    ...overrides,
});


const attachRef = (node, store, key, forwarded) => {
    if (key !== null) store.current[key] = node;
    if (typeof forwarded === 'function') forwarded(node);
    else if (forwarded) forwarded.current = node;
};

export default function OptionsModal({
    open,
    onClose,
    onCloseComplete,
    triggerRef,
    items = [],
    title = 'Opciones',
    animation = anchoredAnimation,
    name = '',
    email = '',
    className,
    style,
}) {
    verifyTypesOptionsModal({ open, onClose, onCloseComplete, triggerRef, items, title, animation, name, email });

    const [appearanceOpen, setAppearanceOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [logoutOpen, setLogoutOPen] = useState(false);

    const rowRefs = useRef({});
    const appearanceRef = useRef(null);
    const settingsRef = useRef(null);

    const handleSelect = (item, event) => {
        if (item.kind === 'appearance') setAppearanceOpen(true);
        if (item.kind === 'settings') setSettingsOpen(true);
        if (item.kinf === 'logout') setLogoutOPen(true);
        item.onClick?.(event);
        if (item.closeOnSelect !== false && item.kind !== 'appearance' && item.kind !== 'settings') onClose?.();
    };

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            onCloseComplete={onCloseComplete}
            triggerRef={triggerRef}
            animation={animation}
            className={twMerge('w-[18rem] rounded-[32px]', className)}
            style={style}
        >
            <div className="flex flex-col gap-[var(--gap-page)]" role="menu">
                {title && (
                    <h2
                        className="mott-headline-medium mott-title-emphasis px-5"
                        style={{ color: 'var(--md-sys-color-on-surface)' }}
                    >
                        {title}
                    </h2>
                )}

                <div className="flex flex-col gap-[var(--gap-tight)]">
                    {items.map((item, i) => {
                        if (item?.separator) {
                            return (
                                <hr
                                    key={item.id ?? `sep-${i}`}
                                    className="my-[var(--gap-tight)] border-0 h-px bg-[var(--md-sys-color-outline-variant)]"
                                />
                            );
                        }

                        return (
                            <button
                                key={item.id ?? i}
                                ref={(node) => {
                                    attachRef(node, rowRefs, item.id ?? i, item.buttonRef);
                                    if (item.kind === 'appearance') appearanceRef.current = node;
                                    if (item.kind === 'settings') settingsRef.current = node;
                                }}
                                type="button"
                                role="menuitem"
                                onClick={(event) => handleSelect(item, event)}
                                className={twMerge(ROW_BASE, ROW_TONE[item.tone] ?? ROW_TONE.default)}
                                {...pressHandlers()}
                            >
                                {item.icon && (
                                    <span className={twMerge('flex', ICON_TONE[item.tone] ?? ICON_TONE.default)}>
                                        {typeof item.icon === 'string' ? <Icon name={item.icon} /> : item.icon}
                                    </span>
                                )}
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
            

            {/*modals*/}
            <ThemeModal
            open={appearanceOpen}
                onClose={() => setAppearanceOpen(false)}
                triggerRef={appearanceRef}
                animation={APPEARANCE_ANIMATION}
            />

            <SettingsModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                triggerRef={settingsRef}
                animation={morphAnimation}
                name={name}
                email={email}
            />
            <ModalCloseSection
                open={logoutOpen}
                onClose={() => setLogoutOPen(false)}
                animation={anchoredAnimation}
                onCLoseSession={console.log('session cerrada')}

            />
        </CustomModal>
    );
}
