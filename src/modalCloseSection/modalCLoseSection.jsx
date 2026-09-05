'use client';
import CustomModal from '../customModal/customModal.jsx';
import Button from '../buttons/button.jsx';
import Text from '../text/text.jsx';
import { verifyTypesModalCloseSection } from '../utils/verifyTypes.js';

export default function ModalCloseSection({ open, onClose, triggerRef, animation, onCloseSession }) {
    verifyTypesModalCloseSection({ open, onClose, triggerRef, animation, onCloseSession });

    /*El radio es el mismo que el del menu de opciones a proposito: esta modal aterriza encima de el,
      compartiendo su borde izquierdo (ver `OVER_ROW_ANIMATION` en optionsModal), y dos paneles
      alineados con radios distintos se leen como un descuadre.*/
    return (
        <CustomModal
            open={open}
            onClose={onClose}
            triggerRef={triggerRef}
            animation={animation}
            className="w-[22rem]  rounded-[32px]"
        >
            {/*Dos grupos, no tres elementos sueltos: el titulo y su linea de apoyo son una sola cosa
               y van juntos (`--gap-section`), y las acciones se separan del bloque de texto con el
               salto grande. Con un unico gap para los tres, "Cerrar sesion" quedaba tan cerca de la
               frase que se leia como parte de ella, y es el boton irreversible del panel.*/}
            <div className="flex flex-col gap-[var(--gap-page)]">
                <div className="flex flex-col gap-[var(--gap-section)]">
                    <Text variant="headline-small" as="h2" className="mott-title-emphasis">
                        ¿Quieres cerrar sesión?
                    </Text>
                    <Text variant="body-medium" tone="muted">
                        Esperemos que sea solo un hasta luego.
                    </Text>
                </div>

                <div className="flex justify-end gap-[var(--gap-group)]">
                    <Button variant="ghost" onClick={() => onClose?.()}>
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            onCloseSession?.();
                            onClose?.();
                        }}
                    >
                        Cerrar sesión
                    </Button>
                </div>
            </div>
        </CustomModal>
    );
}
