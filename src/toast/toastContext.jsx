'use client';
import { useContext, createContext, useState } from "react";
import Toast from "./toast";

const toastContext = createContext(null);


//context for call toasts
export function ToastProvider({children}) {
    const [toast, setToast] = useState({
        open: false,
        variant: "info",
        title: "",
        message: ""
    });
    
    const DURATION = 5000;
    const dimmisThreshold = 0.5;
    
    const showToast = ({variant = "info", title,message,}) => {
        setToast({
            open: true,
            variant,
            title,
            message,
        });
    }
    
    const closeToast = () => {
        setToast((prev) => ({
            ...prev,
            open: false
        }));
    }
    
    return (
        <toastContext.Provider value={{showToast, closeToast}}>
            {children}
            <Toast
                open={toast.open}
                variant={toast.variant}
                title={toast.title}
                duration={DURATION}
                onClose={closeToast}
                dismissThreshold={dimmisThreshold}
            />
        </toastContext.Provider>
    );
}



export function useToast() {
    const context = useContext(toastContext);
    
    if(!context) {
        throw new Error ('[MOTT-COMPONENTS] the context is not wrapped in its parent provider');
    }
    
    return context;
}