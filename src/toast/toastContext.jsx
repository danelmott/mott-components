'use client';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Toast from './toast.jsx';
import { verifyTypesShowToast, verifyTypesToastProvider } from '../utils/verifyTypes.js';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 5000;
const DEFAULT_DISMISS_THRESHOLD = 0.5;
// tope de la pila: más que esto y los de abajo se salen de la pantalla en un viewport chico
const DEFAULT_MAX = 4;

// permite `success('Guardado')` además de `success({ title, message })`
const normalize = (options) => (typeof options === 'string' ? { message: options } : (options ?? {}));

//provider de la API imperativa de toasts — se monta una vez, arriba de todo (ej. app/layout.jsx),
//y expone `useToast()` para dispararlos desde cualquier componente cliente.
//
//Guarda una COLA, no un toast: cada entrada tiene su id y su propia instancia de Toast (`key={id}`),
//que es lo que hace que se apilen de verdad. El stack fijo y el reflow con Flip ya están del lado del
//componente (ver toastStack.js y `flyOut` en toast.jsx) — acá solo se administra quién está vivo.
export function ToastProvider({
    children,
    duration = DEFAULT_DURATION,
    dismissThreshold = DEFAULT_DISMISS_THRESHOLD,
    max = DEFAULT_MAX,
}) {
    verifyTypesToastProvider({ duration, dismissThreshold, max });

    const [toasts, setToasts] = useState([]);
    // contador en un ref y no en el state: el id tiene que ser único aunque se disparen dos toasts en
    // el mismo tick, y `toasts.length` se repite apenas se cierra uno
    const idRef = useRef(0);

    const showToast = useCallback((options) => {
        const payload = normalize(options);
        verifyTypesShowToast(payload);

        const id = ++idRef.current;
        setToasts((prev) => {
            const next = [...prev, { variant: 'info', duration, ...payload, id, open: true }];
            // al pasarse del tope se descartan los más viejos. Se cortan de una (no `open: false`)
            // a propósito: son los que ya se leyeron, y animarles la salida mientras entra uno nuevo
            // deja la pila saltando
            return next.length > max ? next.slice(next.length - max) : next;
        });
        return id;
    }, [duration, max]);

    // marca el cierre pero NO saca la entrada: Toast tiene que seguir montado para animar la salida.
    // El desmontaje real llega con `onExited`.
    const closeToast = useCallback((id) => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, open: false } : t)));
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const closeAll = useCallback(() => {
        setToasts((prev) => prev.map((t) => ({ ...t, open: false })));
    }, []);

    const api = useMemo(() => ({
        showToast,
        closeToast,
        closeAll,
        info: (options) => showToast({ ...normalize(options), variant: 'info' }),
        success: (options) => showToast({ ...normalize(options), variant: 'success' }),
        warning: (options) => showToast({ ...normalize(options), variant: 'warning' }),
        danger: (options) => showToast({ ...normalize(options), variant: 'danger' }),
    }), [showToast, closeToast, closeAll]);

    return (
        <ToastContext.Provider value={api}>
            {children}
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    open={toast.open}
                    variant={toast.variant}
                    title={toast.title}
                    duration={toast.duration}
                    dismissThreshold={dismissThreshold}
                    onClose={() => closeToast(toast.id)}
                    onExited={() => removeToast(toast.id)}
                >
                    {toast.message}
                </Toast>
            ))}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error(
            '[MOTT-COMPONENTS] useToast() debe usarse dentro de <ToastProvider>. ' +
            'Envolvé tu app con <ToastProvider> (ej. en app/layout.jsx) antes de llamar a los toasts.'
        );
    }

    return context;
}
