'use client';
import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import CustomModal from '../customModal/customModal.jsx';
import ThemeModal from '../themeModal/themeModal.jsx';
import Icon from '../icon/icon.jsx';
import { AnchoredAnimation, anchoredAnimation } from '../animations/modalAnimation.js';
import { pressHandlers } from '../animations/motion.js';
import { verifyTypesOptionsModal } from '../utils/verifyTypes.js';

/*El menu de la cuenta: el que cuelga del avatar y lleva Configuracion, Apariencia, Feedback y
  Cerrar Sesion. No es un componente nuevo por la lista - una lista de botones la escribe cualquiera -
  sino por la fila de Apariencia, que tiene que abrir el ThemeModal ENCIMA de este menu y anclado a su
  propia fila. Eso es lo que se escribe mal a mano, y aca sale gratis: este panel es un CustomModal, y
  el ThemeModal se declara DENTRO de su JSX, que es exactamente el patron de modales anidadas del
  repo (ver src/modalStack/README.md). El <dialog> nativo pone el orden, el Escape y los clics; la
  pila solo apaga el velo del de abajo para que no se sumen dos scrims.

  Y por eso es una modal y no un panel flotante cualquiera: un div posicionado a mano no tiene portal,
  ni velo, ni asiento en la pila, asi que una modal hija abierta sobre el quedaria pintada por encima
  suyo - el top layer va por delante de cualquier z-index del documento, se le ponga el que se le
  ponga.

  Y no hay filas fijas a proposito. El orden de un menu de cuenta cambia por app, asi que TODO se
  declara en `items`; las tres comunes se ofrecen abajo como factorias listas para meter donde haga
  falta.*/

/*La fila es su propio boton y no el `Button` de la libreria, a proposito: aquel esta hecho para
  acciones sueltas - variantes semanticas, relleno, sombra - y una fila de menu es lo contrario, un
  renglon que solo existe cuando el cursor pasa por encima. Lo unico que comparten es la capa de
  estado y el pulsado.

  Sus medidas son de padding y no de alto: `14px 20px` sobre un texto de 14/500 dan una caja de 48
  que sale sola. Es la diferencia entre una fila con aire y una caja con algo centrado a la fuerza -
  y por eso `mott-label-large`, que es exactamente el rol de 14px y peso 500, en vez de `body-large`.

  El radio es `--radius-default` (24) sobre esos 48 de alto: los extremos se redondean casi del todo
  sin llegar a ovalo, que es como se ve la fila resaltada en la referencia. A 12 quedaban cuatro
  esquinas marcadas y la capa de estado se encendia como un ladrillo debajo del cursor.

  `whitespace-nowrap` porque una etiqueta de menu que se parte en dos lineas deja de ser una fila.*/
const ROW_BASE =
    'mott-state-layer flex w-full items-center gap-[var(--gap-group)] rounded-[var(--radius-default)]' +
    ' border-0 bg-transparent px-5 py-3.5 text-left cursor-pointer whitespace-nowrap' +
    ' mott-label-large mott-trim transition-[color] duration-[var(--duration-instant)]';

const ROW_TONE = {
    default: 'text-[var(--md-sys-color-on-surface)]',
    danger: 'text-[var(--md-sys-color-error)]',
};

/*El icono NO hereda el color del texto, y es a proposito. Heredando, salia en `on-surface` - el
  negro casi puro de la etiqueta - y un glifo macizo a ese contraste pesa mucho mas que las letras que
  acompania: la fila se lee como seis manchas negras en vez de como una lista. `on-surface-variant` es
  el rol que M3 tiene justamente para esto, el contenido de apoyo sobre una superficie, y deja la
  jerarquia donde va: primero la etiqueta, el icono detras.

  El tono `danger` es la excepcion y sigue al texto: ahi el rojo ES la senal, y un icono gris al lado
  de una etiqueta roja la desmiente.
*/
/*La modal de apariencia sale de su fila igual que este menu sale del avatar - mismo morph, mismo
  fantasma - pero aterriza ENCUADRADA con el menu: comparte con el la esquina superior izquierda. Colocada contra la fila, un panel de 360 dentro de un menu de 288 le sobresalia por la izquierda
  y los dos bordes quedaban descuadrados; contra el panel del menu, comparten borde y se leen como un
  paso adentro del mismo menu en vez de como dos paneles peleados por el mismo sitio.*/
const APPEARANCE_ANIMATION = new AnchoredAnimation({ anchor: 'panel', align: 'edge' });

const ICON_TONE = {
    default: 'text-[var(--md-sys-color-on-surface-variant)]',
    danger: 'text-[var(--md-sys-color-error)]',
};

/*Las tres de siempre, como factorias y no como constantes: las tres se llaman igual (`item()`), asi
  que no hay que recordar cual se invoca y cual no. Aceptan overrides para traducir o recolorear sin
  perder el resto del preset.*/
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

// el mismo mecanismo que `attachRef` en navbar.jsx: el nodo se guarda adentro para animarlo o
// anclarle algo, y ademas se pasa al ref que haya dado quien lo usa
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
    className,
    style,
}) {
    verifyTypesOptionsModal({ open, onClose, onCloseComplete, triggerRef, items, title, animation });

    const [appearanceOpen, setAppearanceOpen] = useState(false);
    const rowRefs = useRef({});
    // el trigger de la modal del tema es la fila de Apariencia, no el avatar: la hija se apoya sobre
    // la fila que la abrio
    const appearanceRef = useRef(null);

    const handleSelect = (item, event) => {
        if (item.kind === 'appearance') setAppearanceOpen(true);
        item.onClick?.(event);
        // el onClick corre ANTES de cerrar: quien lo escribio espera que su efecto ya haya salido
        if (item.closeOnSelect !== false && item.kind !== 'appearance') onClose?.();
    };

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            onCloseComplete={onCloseComplete}
            triggerRef={triggerRef}
            animation={animation}
            /*288px: los 240 de la referencia son su ancho MINIMO y con etiquetas de verdad - un
               "Buy me a coffee" o cualquier traduccion larga - la fila queda sin margen a la derecha
               y el menu se lee angosto. El radio de 32 si sale de la referencia, y se pone aca en vez
               de en `--radius-modal` a proposito: ese token lo comparten todas las modales del
               sistema y esto es la forma de ESTA. El padding de 24 ya lo pone CustomModal con
               `--pad-card`.*/
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

            {/*La hija. Declarada aca dentro y no al lado del menu: el <dialog> se portalea al body
               igual (customModal.jsx), asi que el anidamiento es un hecho del JSX y de la pila, nunca
               del DOM. Mientras esta abierta, este menu se queda debajo atenuado por SU velo, no por
               uno propio.*/}
            <ThemeModal
                open={appearanceOpen}
                onClose={() => setAppearanceOpen(false)}
                triggerRef={appearanceRef}
                animation={APPEARANCE_ANIMATION}
            />
        </CustomModal>
    );
}
