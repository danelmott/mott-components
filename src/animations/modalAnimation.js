import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

// curva estilo "liquid glass" nativo: entrada suave y cola larga — hace que el morph se lea como
// un solo gesto continuo, no como un arranque brusco que después frena
const LIQUID_EASE = CustomEase.create('mottLiquid', '0.32, 0.72, 0, 1');

// espejo exacto de la anterior, para cerrar: el panel se demora al principio y ACELERA hacia el
// botón, aterrizando justo al final. Con la curva de apertura (ease-out) pasaba lo contrario — el
// panel llegaba encima del botón al ~35% y se quedaba plantado tapándolo el resto de la animación.
const LIQUID_EASE_IN = CustomEase.create('mottLiquidIn', '1, 0, 0.68, 0.28');

// el cierre va un poco más rápido que la apertura: entrar tiene que sentirse generoso, salir ágil
const MORPH_OPEN_DURATION = 0.8;
const MORPH_CLOSE_DURATION = 0.7;

const GHOST_ATTR = 'data-mott-morph-ghost';

// la timeline en curso se guarda en el propio nodo del panel, no en la instancia: las animaciones se
// exportan como singletons de módulo y las comparten todos los CustomModal de la app
const RUNNING_MORPH = Symbol.for('mott.runningMorph');

// mata la animación anterior completa (panel, contenido, ghost, backdrop y el proxy del clip-path).
// `killTweensOf(panel)` no alcanzaría: el tween del clip corre sobre un objeto proxy, no sobre el DOM
function killRunningMorph(panel) {
    panel[RUNNING_MORPH]?.kill();
    panel[RUNNING_MORPH] = null;
}

// el border-radius de los controles está en % (--control-radius: 28%, LogoButton en 50%) y el del
// panel en px — GSAP no interpola entre unidades distintas. Lo resolvemos siempre a px contra el
// bounding rect, que además ya incluye cualquier `scale` aplicado al trigger.
// un botón de 56px con 50% da 28px: círculo perfecto en el frame 0, y al crecer la caja ese radio
// fijo se va "des-redondeando" solo, que es justo el efecto de membrana que buscamos.
function resolveRadius(el, rect) {
    const raw = getComputedStyle(el).borderTopLeftRadius;
    const value = parseFloat(raw) || 0;
    return raw.trim().endsWith('%') ? (value / 100) * Math.min(rect.width, rect.height) : value;
}

// stand-in del ícono del botón para el único momento en que hace falta: cuando el panel está encima
// del botón y lo tapa con su color.
//
// va colgado del <dialog> y clavado en coordenadas de viewport sobre el botón — NO adentro del panel.
// Si fuera hijo del panel viajaría con él y el ícono se vería adentro del cuadro, que es justo lo que
// no queremos: el ícono se queda en el botón y el cuadro se va sin él.
// Al ir después del panel en el DOM pinta por encima, y como queda exactamente sobre el botón real,
// sacarlo no se nota: abajo está el ícono de verdad.
//
// se clonan SOLO los hijos del trigger (el ícono), no el botón entero: el fondo ya lo pinta el panel,
// y un clon con su propio background dejaría una costura entre dos radios distintos.
function createTriggerGhost(dialog, trigger, originRect) {
    removeTriggerGhost(dialog); // si se interrumpió una animación, el ghost anterior sigue colgado
    const cs = getComputedStyle(trigger);
    const ghost = document.createElement('div');
    ghost.setAttribute(GHOST_ATTR, '');
    Object.assign(ghost.style, {
        position: 'fixed',
        left: `${originRect.left}px`,
        top: `${originRect.top}px`,
        width: `${originRect.width}px`,
        height: `${originRect.height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        color: cs.color,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
    });
    // el trigger puede tener un `scale` puesto (ver LogoButton cuando está activo): `originRect` ya lo
    // incluye, pero los hijos clonados no, así que sin esto el ícono del ghost sería más chico que el
    // real y pegaría un salto de tamaño justo en el relevo entre panel y botón
    const inner = document.createElement('div');
    const scale = trigger.offsetWidth ? originRect.width / trigger.offsetWidth : 1;
    Object.assign(inner.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${scale})`,
    });
    trigger.childNodes.forEach((node) => inner.appendChild(node.cloneNode(true)));
    ghost.appendChild(inner);
    dialog.appendChild(ghost);
    return ghost;
}

function removeTriggerGhost(dialog) {
    dialog?.querySelector(`[${GHOST_ATTR}]`)?.remove();
}

// interfaz base: cualquier animación de modal opera sobre { panel, content, overlay, trigger }
export class ModalAnimation {
    open(ctx) {}
    close(ctx, onDone) { onDone?.(); }

    // el backdrop siempre va en la misma timeline que el panel, para que oscurecer la pantalla y
    // mover el panel se lean como un mismo gesto y no como dos eventos separados
    fadeOverlay(tl, overlay, to, duration, position = 0) {
        if (!overlay) return tl;
        return to === 1
            ? tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration, ease: 'power1.out' }, position)
            : tl.to(overlay, { opacity: 0, duration, ease: 'power1.in' }, position);
    }
}

// fallback sin trigger — fade + scale + leve desplazamiento vertical del panel completo
export class FadeScaleAnimation extends ModalAnimation {
    open({ panel, overlay }) {
        const tl = gsap.timeline();
        this.fadeOverlay(tl, overlay, 1, 0.22);
        tl.fromTo(panel,
            { opacity: 0, y: 12, scale: 0.94 },
            { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' },
            0
        );
    }

    close({ panel, overlay }, onDone) {
        const tl = gsap.timeline({ onComplete: () => onDone?.() });
        this.fadeOverlay(tl, overlay, 0, 0.2);
        tl.to(panel, { opacity: 0, y: 12, scale: 0.94, duration: 0.25, ease: 'power2.in' }, 0);
    }
}

// shared element transition: no es "una modal que aparece encima del botón", es *el botón* el que se
// transforma en la modal.
//
// la clave para que se vea fluido es que el panel NUNCA cambia de caja: se queda siempre en su
// tamaño y posición finales, y el morph sale de dos propiedades que no disparan layout —
//   · `transform: translate(...)` lo mueve desde la posición del botón: componible por GPU, con
//     precisión sub-píxel real y sin re-rasterizar el contenido en cada frame
//   · `clip-path: inset(... round R)` lo recorta a una ventana del tamaño exacto del botón, que se
//     abre hasta descubrirlo entero mientras el radio interpola
// animar `left/top/width/height` en cambio obliga a rehacer el layout 60 veces por segundo, y el
// layout se redondea a píxeles enteros: de ahí venía el temblor.
//
// como la caja nunca cambia, salen gratis: el contenido no se re-wrapea nunca, no aparecen ni
// desaparecen scrollbars, y no queda nada de `position`/`width`/`height`/`padding` que restaurar.
//
// la ventana se ancla en la esquina de la *padding box* (no del border box) para que el ghost, que
// es hijo absoluto del panel y por lo tanto se posiciona contra esa misma caja, caiga justo adentro
// sin necesidad de offsets negativos que el `overflow` del panel recortaría.
//
// el trigger real NUNCA se toca: el efecto es puramente visual sobre el panel, el botón sigue en su
// lugar (en el frame 0 el panel lo tapa exacto, y al abrirse simplemente queda a la vista debajo)
export class MorphAnimation extends ModalAnimation {
    // geometría de la ventana del clip y del translate que la deja encima del botón
    measure(panel, trigger) {
        const cs = getComputedStyle(panel);
        const pad = { top: parseFloat(cs.paddingTop) || 0, left: parseFloat(cs.paddingLeft) || 0 };

        // rect de layout del panel ignorando el translate que pueda tener puesto una animación en
        // curso — `getBoundingClientRect` lo incluiría, y un cierre que interrumpe a una apertura
        // acumularía el desplazamiento
        const rect = panel.getBoundingClientRect();
        const tx = Number(gsap.getProperty(panel, 'x')) || 0;
        const ty = Number(gsap.getProperty(panel, 'y')) || 0;
        const panelRect = { left: rect.left - tx, top: rect.top - ty, width: rect.width, height: rect.height };

        const originRect = trigger.getBoundingClientRect();

        return {
            pad,
            panelRect,
            originRect,
            // el panel entero a la vista, con el radio de la modal
            openClip: { top: 0, right: 0, bottom: 0, left: 0, radius: resolveRadius(panel, panelRect) },
            // solo la ventana del tamaño del botón, con el radio del botón
            buttonClip: {
                top: pad.top,
                right: panelRect.width - pad.left - originRect.width,
                bottom: panelRect.height - pad.top - originRect.height,
                left: pad.left,
                radius: resolveRadius(trigger, originRect),
            },
            // deja la esquina de la ventana exactamente sobre la esquina del botón
            buttonOffset: {
                x: originRect.left - panelRect.left - pad.left,
                y: originRect.top - panelRect.top - pad.top,
            },
        };
    }

    applyClip(panel, clip) {
        panel.style.clipPath = `inset(${clip.top}px ${clip.right}px ${clip.bottom}px ${clip.left}px round ${clip.radius}px)`;
    }

    // lee el estado actual del clip para poder arrancar desde ahí si se interrumpe una animación
    readClip(panel, fallback) {
        const match = /inset\(([^)]+)\)/.exec(panel.style.clipPath || '');
        if (!match) return fallback;
        const parts = match[1].trim().split(/\s+/);
        const at = (i) => parseFloat(parts[i]);
        return { top: at(0), right: at(1), bottom: at(2), left: at(3), radius: at(5) };
    }

    // GSAP no interpola strings `inset(... round ...)` de forma confiable, así que animamos un proxy
    // y componemos el string a mano. Al ir en la misma timeline y con el mismo ease que el translate,
    // los dos quedan sincronizados frame a frame.
    addClipTween(tl, panel, from, to, duration, ease, position = 0) {
        const state = { p: 0 };
        const lerp = (a, b) => a + (b - a) * state.p;
        this.applyClip(panel, from);
        tl.to(state, {
            p: 1,
            duration,
            ease,
            onUpdate: () => this.applyClip(panel, {
                top: lerp(from.top, to.top),
                right: lerp(from.right, to.right),
                bottom: lerp(from.bottom, to.bottom),
                left: lerp(from.left, to.left),
                radius: lerp(from.radius, to.radius),
            }),
        }, position);
    }

    settle(dialog, panel, content) {
        removeTriggerGhost(dialog);
        panel.style.clipPath = '';
        panel[RUNNING_MORPH] = null;
        gsap.set(panel, { clearProps: 'transform,backgroundColor,willChange' });
        gsap.set(content, { clearProps: 'opacity,visibility' });
    }

    open({ dialog, panel, content, overlay, trigger }) {
        if (!trigger) return new FadeScaleAnimation().open({ panel, overlay });

        killRunningMorph(panel);

        const { originRect, openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
        const originColor = getComputedStyle(trigger).backgroundColor;
        const finalColor = getComputedStyle(panel).backgroundColor;

        const ghost = createTriggerGhost(dialog, trigger, originRect);

        gsap.set(panel, {
            x: buttonOffset.x,
            y: buttonOffset.y,
            backgroundColor: originColor,
            willChange: 'transform, clip-path',
        });
        // `autoAlpha` (opacity + visibility): mientras está invisible el contenido no puede generar
        // scrollbar ni mostrar un wrap intermedio
        gsap.set(content, { autoAlpha: 0 });

        const d = MORPH_OPEN_DURATION;
        const tl = gsap.timeline({ onComplete: () => this.settle(dialog, panel, content) });
        panel[RUNNING_MORPH] = tl;

        tl.to(panel, {
            x: 0,
            y: 0,
            backgroundColor: finalColor,
            duration: d,
            ease: LIQUID_EASE,
            force3D: true,
        }, 0);
        this.addClipTween(tl, panel, buttonClip, openClip, d, LIQUID_EASE, 0);
        // el ghost tapa el hueco del arranque, cuando el panel está justo encima del botón. Se va en
        // el primer tramo, y para entonces el panel ya destapó al botón real — así que el fade cruza
        // contra el ícono verdadero que está abajo y es prácticamente invisible.
        tl.to(ghost, { opacity: 0, duration: d * 0.15, ease: 'power1.in' }, 0);
        // el contenido entra con la animación bien avanzada, cuando la ventana ya está casi abierta,
        // pero solapado con el tramo final del morph — no después
        tl.to(content, { autoAlpha: 1, duration: d * 0.45, ease: 'power1.out' }, d * 0.55);
        this.fadeOverlay(tl, overlay, 1, d * 0.6, 0);
    }

    // al cerrar NO hay ghost: el cuadro viaja sin ícono, aterriza sobre el botón y desaparece — recién
    // ahí se ve el ícono del botón real. Lo que hace que eso funcione es el ease-in: el panel acelera
    // hacia el botón y llega justo al final, en vez de plantarse encima tapándolo media animación.
    close({ dialog, panel, content, overlay, trigger }, onDone) {
        if (!trigger) return new FadeScaleAnimation().close({ panel, overlay }, onDone);

        killRunningMorph(panel);
        removeTriggerGhost(dialog); // por si el cierre interrumpe una apertura

        const { openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
        // el trigger sigue en su estado activo durante todo el cierre (quien use la modal recién lo
        // devuelve al default en `onCloseComplete`), así que el panel aterriza con exactamente su
        // mismo color y el relevo no tiene salto
        const originColor = getComputedStyle(trigger).backgroundColor;

        gsap.set(panel, { willChange: 'transform, clip-path' });

        const d = MORPH_CLOSE_DURATION;
        const tl = gsap.timeline({
            onComplete: () => {
                onDone?.();
                this.settle(dialog, panel, content);
            },
        });
        panel[RUNNING_MORPH] = tl;

        tl.to(panel, {
            x: buttonOffset.x,
            y: buttonOffset.y,
            backgroundColor: originColor,
            duration: d,
            ease: LIQUID_EASE_IN,
            force3D: true,
        }, 0);
        // si el cierre interrumpe una apertura, se arranca desde donde quedó la ventana
        this.addClipTween(tl, panel, this.readClip(panel, openClip), buttonClip, d, LIQUID_EASE_IN, 0);
        // el contenido se va apenas arranca el cierre: con `autoAlpha` queda `visibility: hidden`, así
        // no hay forma de que aparezca una scrollbar ni un wrap raro mientras la ventana se cierra
        tl.to(content, { autoAlpha: 0, duration: d * 0.25, ease: 'power1.in' }, 0);
        this.fadeOverlay(tl, overlay, 0, d * 0.8, 0);
    }
}
// ancla el panel junto al trigger (como un popover, sin viajar al centro de la pantalla) y lo
// anima con scale+opacity desde ese punto — no toca width/height ni border-radius del panel.
export class AnchoredAnimation extends ModalAnimation {
    computeAnchoredPosition(triggerRect, panelRect) {
        const gap = 8;
        const margin = 8;
        const fitsBelow = window.innerHeight - triggerRect.bottom - gap >= panelRect.height;
        const top = fitsBelow
            ? triggerRect.bottom + gap
            : Math.max(margin, triggerRect.top - gap - panelRect.height);
        const origin = fitsBelow ? 'top left' : 'bottom left';

        let left = triggerRect.left;
        const maxLeft = window.innerWidth - panelRect.width - margin;
        left = Math.min(left, Math.max(margin, maxLeft));
        left = Math.max(left, margin);

        return { left, top, origin };
    }

    open({ panel, overlay, trigger }) {
        if (!trigger) return new FadeScaleAnimation().open({ panel, overlay });

        const panelRect = panel.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();
        const { left, top, origin } = this.computeAnchoredPosition(triggerRect, panelRect);

        gsap.set(panel, { position: 'fixed', margin: 0, left, top, transformOrigin: origin });

        const tl = gsap.timeline();
        this.fadeOverlay(tl, overlay, 1, 0.22);
        tl.fromTo(panel,
            { opacity: 0, scale: 0.85 },
            { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.5)' },
            0
        );
    }

    close({ panel, overlay, trigger }, onDone) {
        if (!trigger) return new FadeScaleAnimation().close({ panel, overlay }, onDone);

        const tl = gsap.timeline({
            onComplete: () => {
                onDone?.();
                gsap.set(panel, { clearProps: 'position,left,top,margin,transformOrigin' });
            },
        });
        this.fadeOverlay(tl, overlay, 0, 0.2);
        tl.to(panel, { opacity: 0, scale: 0.85, duration: 0.2, ease: 'power2.in' }, 0);
    }
}

export const morphAnimation = new MorphAnimation();
export const fadeAnimation = new FadeScaleAnimation();
export const anchoredAnimation = new AnchoredAnimation();
