'use client';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Toast from './toast.jsx';
import { verifyTypesShowToast, verifyTypesToastProvider } from '../utils/verifyTypes.js';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 5000;
const DEFAULT_DISMISS_THRESHOLD = 0.5;
const DEFAULT_MAX = 4;

// allows `success('Saved')` on top of `success({ title, message })`
const normalize = (options) => (typeof options === 'string' ? { message: options } : (options ?? {}));

//provider for the imperative toast API — mount it once at the top of the app (e.g. app/layout.jsx)
//and call the toasts from any client component through `useToast()`.
//
//It holds a QUEUE, not a single toast: every entry gets its own id and its own Toast instance
//(`key={id}`), which is what makes them stack. The fixed stack and the Flip reflow already live in
//the component (see toastStack.js and `flyOut` in toast.jsx) — this only tracks what is alive.
export function ToastProvider({
    children,
    duration = DEFAULT_DURATION,
    dismissThreshold = DEFAULT_DISMISS_THRESHOLD,
    max = DEFAULT_MAX,
}) {
    verifyTypesToastProvider({ duration, dismissThreshold, max });

    const [toasts, setToasts] = useState([]);
    // ref, not state: ids must stay unique even for two toasts fired in the same tick, and
    // `toasts.length` repeats as soon as one closes
    const idRef = useRef(0);

    const showToast = useCallback((options) => {
        const payload = normalize(options);
        verifyTypesShowToast(payload);

        const id = ++idRef.current;
        setToasts((prev) => {
            const next = [...prev, { variant: 'info', duration, ...payload, id, open: true }];
            // over the cap the oldest are dropped outright (not `open: false`): they have been read
            // already, and animating them out while a new one enters leaves the stack jumping
            return next.length > max ? next.slice(next.length - max) : next;
        });
        return id;
    }, [duration, max]);

    // flags the close but keeps the entry: Toast must stay mounted to animate its exit.
    // `onExited` is what actually unmounts it.
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
            '[MOTT-COMPONENTS] useToast() must be used inside a <ToastProvider>. ' +
            'Wrap your app with <ToastProvider> (e.g. in app/layout.jsx) before calling toasts.'
        );
    }

    return context;
}
