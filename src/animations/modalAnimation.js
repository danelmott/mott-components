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

// tiempos de cada capa, en fracciones de la duración. Tenerlos separados permite SECUENCIAR en vez de
// correr todo encima: por ejemplo que el morph termine antes que el timeline, dejando un tramo en el
// que el panel ya tiene la forma exacta del botón mientras el backdrop se levanta.
const OPEN_BEATS = {
    morph: { at: 0, span: 1 },
    color: { at: 0, span: 1 },
    overlay: { at: 0, span: 0.6 },
    content: { at: 0.55, span: 0.45 },
};
const CLOSE_BEATS = {
    morph: { at: 0, span: 1 },
    color: { at: 0, span: 1 },
    overlay: { at: 0, span: 0.8 },
    content: { at: 0, span: 0.25 },
};

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

// progreso (0..1) en el que un rect que interpola `from → to` deja de solaparse con `target`.
// Devuelve 1 si nunca se separa (o sea: el panel en reposo sigue tapando al botón).
//
// Sirve para cronometrar el ghost por GEOMETRÍA en vez de con fracciones fijas de la línea de tiempo.
// El ícono tiene que estar puesto exactamente mientras el panel tapa al botón, ni más ni menos — y ese
// cruce depende del alto del botón, del gap y de si la modal abre para arriba o para abajo. Con
// números mágicos el caso anclado se rompe: el panel queda encima del botón hasta el ~87% del
// progreso, así que un fade "en el primer 15%" deja un hueco largo con el botón sin label.
function separationProgress(from, to, target) {
    // cada borde se mueve monótonamente, así que alcanza con resolver la primera separación por eje
    const edge = (fromV, toV, limit, sign) => {
        const delta = toV - fromV;
        if (sign * delta <= 0) return Infinity; // ese borde no se aleja del target
        const p = (limit - fromV) / delta;
        return p > 0 && p <= 1 ? p : Infinity;
    };
    const p = Math.min(
        edge(from.top, to.top, target.bottom, 1),      // la ventana se va por abajo del botón
        edge(from.bottom, to.bottom, target.top, -1),  // ...por arriba
        edge(from.left, to.left, target.right, 1),     // ...por la derecha
        edge(from.right, to.right, target.left, -1),   // ...por la izquierda
    );
    return Number.isFinite(p) ? p : 1;
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

// cuánto dura el fade del ghost, en espacio de progreso geométrico (no de tiempo)
const GHOST_FADE_SPAN = 0.2;

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


export class MorphAnimation extends ModalAnimation {
    constructor({
        openDuration = MORPH_OPEN_DURATION,
        closeDuration = MORPH_CLOSE_DURATION,
        // `at`/`span` como fracciones de la duración: permiten retener el color del botón mientras el
        // panel todavía lo está tapando, en vez de virar de entrada
        openBeats = {},
        closeBeats = {},
        openEase = LIQUID_EASE,
        closeEase = LIQUID_EASE_IN,
        closeGhost = false,
        // fracción de la duración que tarda el ícono en disolverse. Solo se usa cuando el panel tapa
        // al botón todo el tiempo: ahí no hay relevo que cronometrar y el fade es puramente estético.
        ghostFade = 0.2,
    } = {}) {
        super();
        this.openDuration = openDuration;
        this.closeDuration = closeDuration;
        this.openBeats = { ...OPEN_BEATS, ...openBeats };
        this.closeBeats = { ...CLOSE_BEATS, ...closeBeats };
        this.openEase = openEase;
        this.closeEase = closeEase;
        this.closeGhost = closeGhost;
        this.ghostFade = ghostFade;
    }
    
    // hook: ubica el panel en su lugar de reposo ANTES de medir. El panel centrado ya se ubica solo
    // con su `m-auto`, así que acá no hay nada que hacer — `AnchoredAnimation` sí lo implementa.
    place() {}
    
    // props inline que deja `place()` y que hay que limpiar recién cuando la modal cierra del todo
    // (mientras está abierta el panel tiene que quedarse donde lo pusieron)
    placedProps() { return ''; }
    
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
        
        // combinando el translate con el clip, la ventana visible termina siendo exactamente
        // `lerp(originRect, panelRect, p)` — de ahí que alcance con estos dos rects para saber cuándo
        // el panel destapa al botón
        const panelBox = { ...panelRect, right: panelRect.left + panelRect.width, bottom: panelRect.top + panelRect.height };
        
        return {
            pad,
            panelRect,
            originRect,
            // progreso geométrico en el que el panel deja de tapar al botón: con esto se cronometra el
            // ghost sin números mágicos. 1 = el panel en reposo lo sigue tapando (el ghost se queda).
            clearP: separationProgress(originRect, panelBox, originRect),
            // el panel entero a la vista, con el radio de la modal
            openClip: { top: 0, right: 0, bottom: 0, left: 0, radius: resolveRadius(panel, panelRect) },
            // solo la ventana del tamaño del botón, con el radio del botón. El clamp cubre el caso
            // degenerado de un botón más grande que el panel: la ventana se queda en el borde.
            buttonClip: {
                top: pad.top,
                right: Math.max(0, panelRect.width - pad.left - originRect.width),
                bottom: Math.max(0, panelRect.height - pad.top - originRect.height),
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
    // `onProgress` recibe el progreso geométrico (no el temporal): es lo que permite atar la opacidad
    // del ghost a dónde está realmente la ventana respecto del botón.
    addClipTween(tl, panel, from, to, duration, ease, position = 0, onProgress) {
        const state = { p: 0 };
        const lerp = (a, b) => a + (b - a) * state.p;
        this.applyClip(panel, from);
        onProgress?.(0);
        tl.to(state, {
            p: 1,
            duration,
            ease,
            onUpdate: () => {
                this.applyClip(panel, {
                    top: lerp(from.top, to.top),
                    right: lerp(from.right, to.right),
                    bottom: lerp(from.bottom, to.bottom),
                    left: lerp(from.left, to.left),
                    radius: lerp(from.radius, to.radius),
                });
                onProgress?.(state.p);
            },
        }, position);
    }
    
    addGhostFade(tl, ghost, clearP, morphAt, morphSpan, reverse = false) {
        if (clearP < 1) return this.ghostFader(ghost, clearP, reverse);
        
        const span = morphSpan * this.ghostFade;
        if (reverse) tl.to(ghost, { opacity: 1, duration: span, ease: 'power1.out' }, morphAt + morphSpan - span);
        else tl.to(ghost, { opacity: 0, duration: span, ease: 'power1.in' }, morphAt);
        return null;
    }
    
    ghostFader(ghost, clearP, reverse = false) {
        let from, span;
        if (reverse) {
            // al cerrar tiene que estar ENTERO justo cuando el panel vuelve a tapar al botón
            const to = 1 - clearP;
            from = Math.max(0, to - GHOST_FADE_SPAN);
            span = to - from;
        } 
        else {
            from = Math.min(clearP, 1 - GHOST_FADE_SPAN);
            span = GHOST_FADE_SPAN;
        }
        return (p) => {
            const t = span > 0 ? clamp01((p - from) / span) : (p >= from ? 1 : 0);
            ghost.style.opacity = String(reverse ? t : 1 - t);
        };
    }
    
    settle(dialog, panel, content, alsoClear = '') {
        removeTriggerGhost(dialog);
        panel.style.clipPath = '';
        panel[RUNNING_MORPH] = null;
        gsap.set(panel, { clearProps: `transform,backgroundColor,willChange${alsoClear ? `,${alsoClear}` : ''}` });
        gsap.set(content, { clearProps: 'opacity,visibility' });
    }
    
    open({ dialog, panel, content, overlay, trigger }) {
        if (!trigger) return new FadeScaleAnimation().open({ panel, overlay });
        
        killRunningMorph(panel);
        this.place(panel, trigger);
        
        const { originRect, clearP, openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
        const originColor = getComputedStyle(trigger).backgroundColor;
        const finalColor = getComputedStyle(panel).backgroundColor;
        
        const ghost = createTriggerGhost(dialog, trigger, originRect);
        
        gsap.set(panel, {
            x: buttonOffset.x,
            y: buttonOffset.y,
            backgroundColor: originColor,
            willChange: 'transform, clip-path',
        });

        gsap.set(content, { autoAlpha: 0 });
        
        const d = this.openDuration;
        const { morph, color, overlay: ov, content: cont } = this.openBeats;
        const morphAt = d * morph.at;
        const morphSpan = d * morph.span;
        const tl = gsap.timeline({ onComplete: () => this.settle(dialog, panel, content) });
        panel[RUNNING_MORPH] = tl;
        
        tl.to(panel, { x: 0, y: 0, duration: morphSpan, ease: this.openEase, force3D: true }, morphAt);
        
        tl.to(panel, {
            backgroundColor: finalColor,
            duration: d * color.span,
            ease: this.openEase,
        }, d * color.at);
        this.addClipTween(
            tl, panel, buttonClip, openClip, morphSpan, this.openEase, morphAt,
            this.addGhostFade(tl, ghost, clearP, morphAt, morphSpan),
        );
        tl.to(content, { autoAlpha: 1, duration: d * cont.span, ease: 'power1.out' }, d * cont.at);
        this.fadeOverlay(tl, overlay, 1, d * ov.span, d * ov.at);
    }
    
    close({ dialog, panel, content, overlay, trigger }, onDone) {
        if (!trigger) return new FadeScaleAnimation().close({ panel, overlay }, onDone);
        
        killRunningMorph(panel);
        removeTriggerGhost(dialog); // por si el cierre interrumpe una apertura
        
        const { originRect, clearP, openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
        const originColor = getComputedStyle(trigger).backgroundColor;
        
        const ghost = this.closeGhost ? createTriggerGhost(dialog, trigger, originRect) : null;
        if (ghost) ghost.style.opacity = '0';
        
        gsap.set(panel, { willChange: 'transform, clip-path' });
        
        const d = this.closeDuration;
        const { morph, color, overlay: ov, content: cont } = this.closeBeats;
        const morphAt = d * morph.at;
        const morphSpan = d * morph.span;
        const tl = gsap.timeline({
            onComplete: () => {
                onDone?.();
                this.settle(dialog, panel, content, this.placedProps());
            },
        });
        panel[RUNNING_MORPH] = tl;
        
        tl.to(panel, {
            x: buttonOffset.x,
            y: buttonOffset.y,
            duration: morphSpan,
            ease: this.closeEase,
            force3D: true,
        }, morphAt);
        
        tl.to(panel, {
            backgroundColor: originColor,
            duration: d * color.span,
            ease: this.closeEase,
        }, d * color.at);
        
        this.addClipTween(
            tl, panel, this.readClip(panel, openClip), buttonClip, morphSpan, this.closeEase, morphAt,
            ghost ? this.addGhostFade(tl, ghost, clearP, morphAt, morphSpan, true) : undefined,
        );
        
        tl.to(content, { autoAlpha: 0, duration: d * cont.span, ease: 'power1.in' }, d * cont.at);
        this.fadeOverlay(tl, overlay, 0, d * ov.span, d * ov.at);
    }
}


export class AnchoredAnimation extends MorphAnimation {
    constructor({ cover = 6, ...options } = {}) {
        super({
            openDuration: 0.45,
            closeDuration: 0.38,
            closeEase: 'power1.in',
            
            openBeats: {
                morph: { at: 0.15, span: 0.85 },
                color: { at: 0.3, span: 0.7 },
                overlay: { at: 0, span: 0.22 },
                content: { at: 0.62, span: 0.38 },
            },
            closeBeats: {
                morph: { at: 0, span: 0.75 },
                color: { at: 0.12, span: 0.63 },
                overlay: { at: 0.75, span: 0.25 },
                content: { at: 0, span: 0.2 },
            },

            closeGhost: true,
            ghostFade: 0.3,
            ...options,
        });
        this.cover = cover;
    }
    
    computeAnchoredPosition(triggerRect, panelRect) {
        const margin = 8;
        const fit = (value, size, viewport) =>
            Math.max(margin, Math.min(value, viewport - size - margin));
        
        return {
            left: fit(triggerRect.left - this.cover, panelRect.width, window.innerWidth),
            top: fit(triggerRect.top - this.cover, panelRect.height, window.innerHeight),
        };
    }
    
    place(panel, trigger) {
        const { left, top } = this.computeAnchoredPosition(
            trigger.getBoundingClientRect(),
            panel.getBoundingClientRect(),
        );
        gsap.set(panel, { position: 'fixed', margin: 0, left, top });
    }
    
    placedProps() { return 'position,left,top,margin'; }
}

export const morphAnimation = new MorphAnimation();
export const fadeAnimation = new FadeScaleAnimation();
export const anchoredAnimation = new AnchoredAnimation();
