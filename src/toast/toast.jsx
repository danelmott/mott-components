'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { Flip } from 'gsap/Flip';
import Icon from '../icon/icon.jsx';
import { getToastStack } from './toastStack.js';

gsap.registerPlugin(Draggable, Flip);

// la superficie es la misma para todas las variantes: lo único que las diferencia es el ícono. Los
// fondos pasteles teñían toda la pieza y le sacaban sobriedad.
const VARIANTS = {
    info: { iconClass: 'text-[var(--color-action)]', icon: 'info' },
    success: { iconClass: 'text-[var(--color-success)]', icon: 'check_circle' },
    warning: { iconClass: 'text-[var(--color-warning)]', icon: 'warning' },
    danger: { iconClass: 'text-[var(--color-danger)]', icon: 'error' },
};

// cuánto se puede arrastrar hacia el lado contrario al descarte, como fracción del ancho: apenas lo
// suficiente para que el gesto se sienta vivo, sin poder meterlo en el contenido
const COUNTER_DRAG = 0.12;

//component for toast in mott-design — semántico, animado con GSAP, arrastrable para descartar.
//se renderiza en un stack fijo arriba a la derecha (ver toastStack.js), no donde se lo declare.
export default function Toast({
    variant = 'info',
    title,
    children,
    open,
    onClose,
    duration = 5000,
    dismissThreshold = 0.5,
}) {
    const [rendered, setRendered] = useState(open);
    const toastRef = useRef(null);

    // `onClose` suele venir como lambda inline, así que cambia de identidad en cada render. Guardarlo
    // en un ref evita que los efectos que lo usan se re-ejecuten: sin esto el Draggable se destruía y
    // se recreaba en cada render, y si eso pasaba a mitad de un arrastre, cortaba el gesto.
    const onCloseRef = useRef(onClose);
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

    // marca que el toast ya se fue por arrastre: sin esto, cuando el consumidor reacciona al
    // `onClose` poniendo `open` en false, la animación de salida se dispararía sobre un toast que ya
    // está fuera de pantalla y su impulso lo traería de vuelta al borde por un instante
    const dismissedRef = useRef(false);

    const preset = VARIANTS[variant] ?? VARIANTS.info;

    useEffect(() => {
        if (open) {
            dismissedRef.current = false;
            setRendered(true);
        }
    }, [open]);

    // distancia para que el toast salga entero por el borde derecho, sea cual sea su ancho y desde
    // dónde arranque (puede estar a mitad de un arrastre)
    const exitDistance = (el) => {
        const currentX = Number(gsap.getProperty(el, 'x')) || 0;
        return currentX + (window.innerWidth - el.getBoundingClientRect().left) + 16;
    };

    // saca al toast por el borde derecho y, EN PARALELO, reacomoda a los que quedan.
    //
    // La clave del solapamiento es despegar al saliente apenas arranca: pasarlo a `position: absolute`
    // pinneado donde ya estaba reproduce exactamente su misma caja (no se ve ningún salto), pero lo
    // saca del flex, así que los de abajo reflowean de inmediato en vez de esperar a que termine de
    // irse. Flip los anima desde donde estaban con transforms, así que no dispara layout por frame.
    const flyOut = (el, { ease, duration, onDone }) => {
        const stack = el.parentElement;
        const siblings = stack ? Array.from(stack.children).filter((c) => c !== el) : [];
        // el state se captura ANTES del despegue, y sin el saliente: si estuviera incluido, Flip le
        // pondría transforms propios que pelearían con el tween de salida
        const state = siblings.length ? Flip.getState(siblings) : null;

        // todo se mide con rects, que son FRACCIONARIOS. `offsetWidth`/`offsetTop` redondean a entero:
        // si el ancho real cae en algo como 285.4px, pinnearlo como 285 achica al toast medio píxel, y
        // un texto que estaba justo en el límite de línea wrapea — con eso le cambia el alto y se ve
        // deformarse a mitad del cierre. Por eso pasaba en un solo toast y no en todos: depende de
        // dónde caiga su parte decimal.
        // Se divide por el scale porque el rect viene escalado si el cierre interrumpe a la animación
        // de entrada, que anima `scale`.
        const rect = el.getBoundingClientRect();
        const scaleX = Number(gsap.getProperty(el, 'scaleX')) || 1;
        const top = stack ? rect.top - stack.getBoundingClientRect().top : 0;
        Object.assign(el.style, {
            position: 'absolute',
            top: `${top}px`,
            right: '0',
            width: `${rect.width / scaleX}px`,
        });

        if (state) Flip.from(state, { duration, ease: 'power3.out' });
        gsap.to(el, { x: exitDistance(el), duration, ease, onComplete: onDone });
    };

    // --- vida útil ---------------------------------------------------------------------------
    // se lleva el tiempo RESTANTE en vez de un setTimeout a secas, porque el contador tiene que poder
    // pausarse: si se cierra bajo el cursor justo cuando lo estás leyendo o por clickearlo, es peor
    // que no tener auto-cierre
    const timerRef = useRef(null);
    const remainingRef = useRef(duration);
    const startedAtRef = useRef(0);

    const pauseTimer = () => {
        if (!timerRef.current) return;
        clearTimeout(timerRef.current);
        timerRef.current = null;
        remainingRef.current -= Date.now() - startedAtRef.current;
    };

    const resumeTimer = () => {
        if (!duration || timerRef.current || remainingRef.current <= 0) return;
        startedAtRef.current = Date.now();
        timerRef.current = setTimeout(() => onCloseRef.current?.(), remainingRef.current);
    };

    useEffect(() => {
        if (!open || !duration) return;
        remainingRef.current = duration;
        resumeTimer();
        return pauseTimer;
    }, [open, duration]);

    // --- animaciones de entrada / salida -----------------------------------------------------
    useGSAP(() => {
        if (open && toastRef.current) {
            gsap.fromTo(toastRef.current,
                { opacity: 0, x: 24, scale: 0.95 },
                { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
            );
        }
    }, { dependencies: [open, rendered] });

    useEffect(() => {
        if (open || !rendered || !toastRef.current) return;
        // si ya salió arrastrado, no hay nada que animar: solo desmontar
        if (dismissedRef.current) { setRendered(false); return; }

        // se va por el mismo borde por el que entró, sin fade. `back.in` es el espejo exacto del
        // `back.out` de la entrada: retrocede un poco hacia adentro para tomar impulso y recién ahí
        // se dispara fuera del viewport
        flyOut(toastRef.current, {
            ease: 'back.in(1.7)',
            duration: 0.45,
            onDone: () => setRendered(false),
        });
    }, [open, rendered]);

    // --- arrastre para descartar -------------------------------------------------------------
    useEffect(() => {
        if (!rendered || !toastRef.current) return;
        const el = toastRef.current;
        const width = el.offsetWidth;
        // el umbral es relativo al ancho real del toast, no un número fijo: así se adapta a un toast
        // de una línea o a uno largo sin recalibrar nada
        const threshold = width * dismissThreshold;

        const [draggable] = Draggable.create(el, {
            type: 'x',
            // el stack está arriba a la derecha, así que el descarte va hacia el borde más cercano.
            // Hacia el contenido solo se permite un tironcito.
            bounds: { minX: -width * COUNTER_DRAG, maxX: width, minY: 0, maxY: 0 },
            onPressInit: pauseTimer,
            onDrag: function () {
                // la opacidad se ata al umbral, no a una constante suelta: así comunica cuánto falta
                // para que se descarte
                gsap.set(el, { opacity: 1 - Math.min(Math.abs(this.x) / threshold, 1) * 0.6 });
            },
            onDragEnd: function () {
                if (this.x >= threshold) {
                    // acá no va impulso: el gesto del usuario ya lo dio, retroceder ahora pelearía
                    // contra él. Solo continúa hacia afuera. Con el stack fijo, salir de pantalla no
                    // genera overflow.
                    dismissedRef.current = true;
                    flyOut(el, {
                        ease: 'power2.in',
                        duration: 0.3,
                        onDone: () => onCloseRef.current?.(),
                    });
                } else {
                    gsap.to(el, { x: 0, opacity: 1, duration: 0.3, ease: 'power3.out' });
                    resumeTimer();
                }
            },
        });
        return () => draggable.kill();
    }, [rendered, dismissThreshold]);

    if (!rendered) return null;

    const stack = getToastStack();
    if (!stack) return null;

    return createPortal(
        <div
            ref={toastRef}
            role="status"
            onMouseEnter={pauseTimer}
            onMouseLeave={resumeTimer}
            className="inline-flex items-center gap-3 rounded-[var(--radius-lg)] cursor-grab active:cursor-grabbing"
            style={{
                padding: 'var(--pad-stat)',
                // misma superficie neutra para las cuatro variantes. `--white` y no `--modal-surface`
                // porque es lo que ya usan Dropdown y el panel de Select para superficies flotantes
                backgroundColor: 'var(--white)',
                boxShadow: 'var(--shadow-floating)',
                // se mide por su texto, sin ancho mínimo: un toast corto no tiene por qué arrastrar
                // espacio en blanco. El tope lo pone el stack, que tiene ancho fijo — ahí es donde el
                // texto empieza a wrapear.
                maxWidth: '100%',
                // el stack tiene `pointer-events: none` para no bloquear la página; cada toast se
                // re-habilita a sí mismo
                pointerEvents: 'auto',
            }}
        >
            <Icon name={preset.icon} size="xl" className={`${preset.iconClass} shrink-0`} />
            {/* `min-w-0`: sin esto un flex item no baja de su min-content, y una palabra larga
                desbordaría el tope en vez de wrapear */}
            <div className="flex min-w-0 flex-col gap-0.5">
                {title && (
                    <span className="text-[length:var(--text-sm)] font-[number:var(--font-medium)] text-[var(--dark-navy-text)]">
                        {title}
                    </span>
                )}
                <span className="text-[length:var(--text-sm)] text-[var(--slate-gray-text)]">
                    {children}
                </span>
            </div>
        </div>,
        stack,
    )
}
