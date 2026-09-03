'use client';
import CustomModal from "../customModal/customModal";
import { twMerge } from "tailwind-merge";
import Icon from "../icon/icon";
import { pressHandlers } from "../animations/motion";


export default function ModalCloseSection(open, onClose, animation, triggerRef, onCLoseSession) {
    return (
        <CustomModal
         open={open}
         onClose={onClose}
         triggerRef={triggerRef}
         className={twMerge('w-[360px]','h-[300px]')}
        >
            <div className="flex  flex-col gap-[var(--gap-block)]">
                <div className="f">
                    <h2>
                        ¿Quieres cerrar session?, esperemos solo sea un hasta luego.
                    </h2>
                </div>

                {/*container buttons*/}
                <div className="flex w-[full]">
                  <button
                  type="button"
                   onClick={() => onClose()}
                    {...pressHandlers()}
                  >
                    Cancelar
                  </button>
                  
                  <button
                    {...pressHandlers()}
                  >
                    Cerrar session
                  </button>
                </div>
            </div>
        </CustomModal>
    )
}