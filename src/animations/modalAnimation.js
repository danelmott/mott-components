import gsap from 'gsap';
import { DURATION, EASE, prefersReducedMotion } from './motion.js';


/*Opening and closing take the same time and ride the same curve, because they are one gesture
  played in both directions: the button becomes the panel, then the panel becomes the button again.
  `EASE.inOut` starts and ends practically stationary and spreads the journey evenly, so the panel
  is legible the whole way instead of arriving and then settling. An accelerating curve here - the
  Material `exit` this used to close with - lands at 4.25x the average speed, and hitting the
  button at full tilt is exactly what read as a jerk.*/
const MORPH_OPEN_DURATION = DURATION.modal;
const MORPH_CLOSE_DURATION = DURATION.modal;


// Choreography, as fractions of the total duration: `at` is when a part starts, `span` how long it
// runs. Keeping them relative means changing the duration re-times the whole sequence for free.
const OPEN_BEATS = {
    morph: { at: 0, span: 1 },
    color: { at: 0, span: 1 },
    overlay: { at: 0, span: 0.6 },
    /*0.7, not 0.55: under the old fast-headed curve the panel was already at 97% of its size by
      0.55, but `inOut` splits the journey evenly and only reaches 59% there - the content would
      fade in while the panel was still growing, clipped in half. At 0.7 the panel is at 89%.*/
    content: { at: 0.7, span: 0.3 },
};
const CLOSE_BEATS = {
    morph: { at: 0, span: 1 },
    color: { at: 0, span: 1 },
    overlay: { at: 0, span: 0.8 },
    content: { at: 0, span: 0.25 },
};

// The ghost is a throwaway clone of the trigger's contents, pinned over the trigger while the panel
// morphs. The panel covers the real trigger, so without it the label would vanish the instant the
// animation starts.
const GHOST_ATTR = 'data-mott-morph-ghost';


// The running timeline is parked on the panel element itself so an interrupting open/close can kill
// it. `Symbol.for` and not `Symbol` so the key survives a module reload (HMR).
const RUNNING_MORPH = Symbol.for('mott.runningMorph');

function killRunningMorph(panel) {
    panel[RUNNING_MORPH]?.kill();
    panel[RUNNING_MORPH] = null;
}


/*Lo que se VE de un trigger puede sobresalir de su caja. Los controles que morfean por `mott-morph`
  pintan su forma en un pseudo-elemento escalado - el boton mide sus 56px pase lo que pase y el pill
  elegido se sale 3px por lado - asi que getBoundingClientRect devuelve la caja y no lo pintado. El
  clip tiene que arrancar de lo pintado, o el panel empieza por dentro del propio pill.

  Inflar la caja tambien deja `resolveRadius` en su sitio sin tocarlo: el radio es un porcentaje
  medido contra la caja y luego escalado, y el 28% de 62 es exactamente el 28% de 56 por 62/56.*/
function paintedRect(el) {
    const rect = el.getBoundingClientRect();
    const scale = parseFloat(getComputedStyle(el).getPropertyValue('--mott-morph-scale')) || 1;
    if (scale === 1) return rect;
    const dx = (rect.width * (scale - 1)) / 2;
    const dy = (rect.height * (scale - 1)) / 2;
    return {
        left: rect.left - dx, right: rect.right + dx,
        top: rect.top - dy, bottom: rect.bottom + dy,
        width: rect.width + dx * 2, height: rect.height + dy * 2,
    };
}

/*border-radius may be a percentage, which clip-path's `round` cannot take - resolve it to px.
  Two details matter. CSS resolves the two halves of a percentage radius against DIFFERENT axes
  (horizontal against the width, vertical against the height), so a single Math.min() reading turns
  a pill-shaped control into a stadium and the first frame of the morph does not match the trigger.
  And the result is clamped to half the box, because a `rounded-full` trigger computes to 9999px
  (or Tailwind v4's 2147483647px): interpolating from there down to the panel's 24px keeps the
  browser's own clamp pinned for almost the whole tween and then snaps in the last few frames -
  that is the jerk. Clamped, the same trigger simply reads as the circle it already looks like.*/
function resolveRadius(el, rect) {
    const raw = getComputedStyle(el).borderTopLeftRadius.trim();
    const parts = raw.split(/\s+/);
    const toPx = (part, basis) => {
        const value = parseFloat(part) || 0;
        return part.endsWith('%') ? (value / 100) * basis : value;
    };
    const radius = Math.min(
        toPx(parts[0], rect.width),
        toPx(parts[1] ?? parts[0], rect.height),
    );
    return Math.min(radius, Math.min(rect.width, rect.height) / 2);
}

// Progress (0-1) at which the morphing rect stops overlapping `target` - the moment the panel
// uncovers the trigger. Ties the ghost fade to the geometry instead of the clock, so the fake button
// disappears exactly when the real one would come back into view.
// Returns 1 when the two never separate (an anchored panel resting on top of its trigger).
function separationProgress(from, to, target) {
    // earliest progress at which one edge travels past the opposite edge of `target`
    const edge = (fromV, toV, limit, sign) => {
        const delta = toV - fromV;
        if (sign * delta <= 0) return Infinity;
        const p = (limit - fromV) / delta;
        return p > 0 && p <= 1 ? p : Infinity;
    };
    const p = Math.min(
        edge(from.top, to.top, target.bottom, 1),      // cleared downwards
        edge(from.bottom, to.bottom, target.top, -1),  // cleared upwards
        edge(from.left, to.left, target.right, 1),     // cleared to the right
        edge(from.right, to.right, target.left, -1),   // cleared to the left
    );
    return Number.isFinite(p) ? p : 1;
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

// how long the ghost fade lasts, measured in geometric progress rather than in time
const GHOST_FADE_SPAN = 0.2;

/*Clones the trigger's children into a fixed box over the trigger. It hangs off the `dialog` and not
  the panel, so it stays put instead of travelling with the modal. `inner` is scaled because the ghost
  is sized to the measured rect, which need not match the trigger's layout width.

  The LAYOUT is copied from the trigger, not assumed. This box used to centre its contents outright,
  which was invisibly correct for as long as every anchored panel hung off a 56px icon-only control -
  the nav items, the logo - whose content really is centred with no padding. It is wrong the moment
  the trigger is a wide, left-aligned, padded control such as a menu row: the ghost drew the icon and
  the label in the middle of the row while the row itself has them at its left edge, so the closing
  panel handed back a copy that sat somewhere the original never was. Reading `justify-content`,
  `align-items`, `flex-direction`, `gap` and `padding` off the trigger reproduces both cases without
  either one being a special case - the icon-only controls report `center` and no padding, which is
  exactly what was hardcoded here before.*/
function createTriggerGhost(dialog, trigger, originRect) {
    removeTriggerGhost(dialog); 
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
        boxSizing: 'border-box',
        padding: cs.padding,
        /*El radio del trigger viaja con la copia. No es para pintar nada - el ghost no tiene fondo -
          sino porque lo clonado puede heredarlo: la foto de una cuenta se recorta con
          `border-radius: inherit` para seguir al morph del boton, y dentro de un ghost sin radio ese
          `inherit` resolvia a 0 y la copia salia CUADRADA. Un circulo que se vuelve cuadrado al
          pulsarlo es exactamente lo que no puede pasar.*/
        borderRadius: cs.borderRadius,
        pointerEvents: 'none',
        color: cs.color,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
    });

    /*El ghost se dibuja a la escala a la que se dibuja el trigger, que es su propio transform - un
      control a medio pulsar esta encogido y su copia tiene que estarlo igual. No sale de
      originRect/offsetWidth: ese cociente incluye lo que el pill de un control `mott-morph` se sale de
      su caja, y eso es pintura del control, no escala de lo que lleva dentro.

      Y la escala va en la CAJA del ghost, no en su contenido. Puesta en el contenido, un contenido
      alineado a la izquierda se encoge hacia su propio centro y se corre hacia dentro - visible como
      un salto del icono y la etiqueta justo al abrir. El trigger no hace eso: escala su caja entera
      desde el centro y lo de dentro va montado. Aca igual.*/
    const scale = Number(gsap.getProperty(trigger, 'scaleX')) || 1;

    const inner = document.createElement('div');
    Object.assign(inner.style, {
        display: 'flex',
        // `flex: 1` para llenar la caja de contenido del ghost, pero SIN `min-width: 0`: con el, los
        // hijos clonados pueden encogerse por debajo de su tamano natural y la etiqueta se corre
        // hacia el icono, que es exactamente lo que el ghost no puede hacer - el trigger no encoge
        // los suyos, asi que la copia tampoco.
        flex: '1',
        flexDirection: cs.flexDirection,
        alignItems: cs.alignItems,
        justifyContent: cs.justifyContent,
        gap: cs.gap,
        // y tambien aca: `inherit` en un clon resuelve contra ESTE, que es su padre directo
        borderRadius: cs.borderRadius,
    });
    trigger.childNodes.forEach((node) => inner.appendChild(node.cloneNode(true)));
    ghost.appendChild(inner);
    dialog.appendChild(ghost);
    if (scale !== 1) gsap.set(ghost, { scale });
    return ghost;
}

function removeTriggerGhost(dialog) {
    dialog?.querySelector(`[${GHOST_ATTR}]`)?.remove();
}

// Base interface: every modal animation works on { dialog, panel, content, overlay, trigger }.
// `fadeOverlay` is shared so the backdrop always fades inside the panel's own timeline - the
// darkening and the movement then read as one gesture instead of two separate events.
export class ModalAnimation {
    open(ctx) {}
    close(ctx, onDone) { onDone?.(); }
    
    fadeOverlay(tl, overlay, to, duration, position = 0) {
        if (!overlay) return tl;
        return to === 1
            ? tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration, ease: 'power1.out' }, position)
            : tl.to(overlay, { opacity: 0, duration, ease: 'power1.in' }, position);
    }
}

// INTERNAL. Not re-exported from index.js: it exists solely because MorphAnimation cannot run without
// a trigger - `measure()` would call getBoundingClientRect on undefined. A modal opened with no
// `triggerRef` (a session timeout, an error the app raises on its own) lands here instead of crashing.
export class FadeScaleAnimation extends ModalAnimation {
    open({ panel, overlay }) {
        if (prefersReducedMotion()) {
            gsap.set(panel, { opacity: 1, y: 0, scale: 1 });
            if (overlay) gsap.set(overlay, { opacity: 1 });
            return;
        }
        const tl = gsap.timeline();
        this.fadeOverlay(tl, overlay, 1, DURATION.fast);
        tl.fromTo(panel,
            { opacity: 0, y: 12, scale: 0.94 },
            { opacity: 1, y: 0, scale: 1, duration: DURATION.base, ease: EASE.standard },
            0
        );
    }
    
    close({ panel, overlay }, onDone) {
        if (prefersReducedMotion()) {
            if (overlay) gsap.set(overlay, { opacity: 0 });
            onDone?.();
            return;
        }
        const tl = gsap.timeline({ onComplete: () => onDone?.() });
        this.fadeOverlay(tl, overlay, 0, DURATION.fast);
        tl.to(panel, { opacity: 0, y: 12, scale: 0.94, duration: DURATION.fast, ease: EASE.exit }, 0);
    }
}


// Makes the panel look exactly like the trigger - same spot, same colour, clipped down to the
// trigger's rect - and then expands it into itself. Nothing is duplicated: it is the real panel the
// whole way, which is why its content never re-flows mid-flight.
export class MorphAnimation extends ModalAnimation {
    constructor({
        openDuration = MORPH_OPEN_DURATION,
        closeDuration = MORPH_CLOSE_DURATION,
        openBeats = {},
        closeBeats = {},
        openEase = EASE.inOut,
        closeEase = EASE.inOut,
        closeGhost = true,
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
    
    // Hooks for subclasses that position the panel before it is measured (see AnchoredAnimation).
    // `placedProps` names the inline props such a subclass sets, so `settle` knows what to clear.
    place() {}
    placedProps() { return ''; }
    
    // Everything the morph needs, measured once against the final layout:
    // `buttonOffset` drops the panel's padding box onto the trigger, `buttonClip` shrinks it to the
    // trigger's exact rect, and `openClip` opens it back up. Live transforms are backed out of
    // `panelRect` so a re-measure mid-flight still reports the panel's resting position.
    measure(panel, trigger) {
        // open() zeroes the panel's own border-radius for the duration of the flight (see there), so
        // a close that interrupts an open would otherwise resolve `openClip` against a square panel.
        panel.style.borderRadius = '';

        const cs = getComputedStyle(panel);
        const pad = { top: parseFloat(cs.paddingTop) || 0, left: parseFloat(cs.paddingLeft) || 0 };
        
        const rect = panel.getBoundingClientRect();
        const tx = Number(gsap.getProperty(panel, 'x')) || 0;
        const ty = Number(gsap.getProperty(panel, 'y')) || 0;
        const panelRect = { left: rect.left - tx, top: rect.top - ty, width: rect.width, height: rect.height };
        
        const originRect = paintedRect(trigger);
        const panelBox = { ...panelRect, right: panelRect.left + panelRect.width, bottom: panelRect.top + panelRect.height };
        
        return {
            pad,
            panelRect,
            originRect,
            clearP: separationProgress(originRect, panelBox, originRect),
            openClip: { top: 0, right: 0, bottom: 0, left: 0, radius: resolveRadius(panel, panelRect) },
            buttonClip: {
                top: pad.top,
                right: Math.max(0, panelRect.width - pad.left - originRect.width),
                bottom: Math.max(0, panelRect.height - pad.top - originRect.height),
                left: pad.left,
                radius: resolveRadius(trigger, originRect),
            },
            buttonOffset: {
                x: originRect.left - panelRect.left - pad.left,
                y: originRect.top - panelRect.top - pad.top,
            },
        };
    }
    
    // GSAP cannot interpolate `inset(... round ...)`, so the clip is written and read by hand and
    // driven from a scalar tween (see addClipTween).
    applyClip(panel, clip) {
        panel.style.clipPath = `inset(${clip.top}px ${clip.right}px ${clip.bottom}px ${clip.left}px round ${clip.radius}px)`;
    }
    
    // recovers the clip an interrupted opening left behind, so a close starts from where it really is
    readClip(panel, fallback) {
        const match = /inset\(([^)]+)\)/.exec(panel.style.clipPath || '');
        if (!match) return fallback;
        const parts = match[1].trim().split(/\s+/);
        const at = (i) => parseFloat(parts[i]);
        return { top: at(0), right: at(1), bottom: at(2), left: at(3), radius: at(5) };
    }
    
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
    
    // Two ways to fade the ghost. When the panel separates from the trigger mid-morph (`clearP < 1`)
    // the fade is driven by geometry so it lands on that exact moment - hence a progress callback for
    // the clip tween. Otherwise the trigger stays covered and a plain time-based tween will do.
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
    
    // Wipes every trace of the animation, handing the panel back to plain CSS.
    settle(dialog, panel, content, alsoClear = '') {
        removeTriggerGhost(dialog);
        panel.style.clipPath = '';
        panel[RUNNING_MORPH] = null;
        gsap.set(panel, { clearProps: `transform,backgroundColor,borderRadius,willChange${alsoClear ? `,${alsoClear}` : ''}` });
        gsap.set(content, { clearProps: 'opacity,visibility' });
    }
    
    // Panel starts disguised as the trigger, then one timeline runs the lot: it slides into place, its
    // colour crossfades, the clip opens up, the content fades in and the backdrop darkens - each on
    // its own beat.
    open({ dialog, panel, content, overlay, trigger }) {
        if (!trigger) return new FadeScaleAnimation().open({ panel, overlay });
        
        killRunningMorph(panel);
        this.place(panel, trigger);
        
        /*Nothing to morph from if the user asked for less motion: show the finished modal at once.
          settle() is the same teardown the timeline would have run, so anything an interrupted
          flight left behind goes too - but placedProps() is deliberately not passed, because an
          anchored panel still needs the position place() just gave it.*/
        if (prefersReducedMotion()) {
            this.settle(dialog, panel, content);
            if (overlay) gsap.set(overlay, { opacity: 1 });
            return;
        }
        
        const { originRect, clearP, openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
        const originColor = getComputedStyle(trigger).backgroundColor;
        const finalColor = getComputedStyle(panel).backgroundColor;
        
        const ghost = createTriggerGhost(dialog, trigger, originRect);
        
        /*`borderRadius: 0` is what keeps the corners clean. While the panel is in flight its rounding
          comes entirely from the clip-path, which interpolates from the trigger's radius to the
          panel's; leaving the panel's own 24px CSS radius switched on underneath means two different
          rounded corners intersecting every frame, and what you see is the angular notch where they
          cross. settle() hands the radius straight back to CSS at the end.
          will-change asks for `transform` only: clip-path is not compositable, so listing it buys
          nothing and just adds layer churn.*/
        gsap.set(panel, {
            x: buttonOffset.x,
            y: buttonOffset.y,
            backgroundColor: originColor,
            borderRadius: 0,
            willChange: 'transform',
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
    
    /*The inverse, with one difference: the clip starts from wherever an interrupted opening left it.
      The ghost is faded back IN here rather than out. The panel is opaque and comes to rest exactly
      on top of the trigger, so without it the trigger's label stays hidden until the <dialog> closes
      and then pops back - right at the moment the eye is following the panel down onto the button.
      `ghostFader` lands the fade on `p = 1 - clearP`, the frame the panel starts covering it again.*/
    close({ dialog, panel, content, overlay, trigger }, onDone) {
        if (!trigger) return new FadeScaleAnimation().close({ panel, overlay }, onDone);
        
        killRunningMorph(panel);
        removeTriggerGhost(dialog); // in case the close interrupts an opening
        
        if (prefersReducedMotion()) {
            if (overlay) gsap.set(overlay, { opacity: 0 });
            onDone?.();
            this.settle(dialog, panel, content, this.placedProps());
            return;
        }
        
        const { originRect, clearP, openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
        const originColor = getComputedStyle(trigger).backgroundColor;
        
        const ghost = this.closeGhost ? createTriggerGhost(dialog, trigger, originRect) : null;
        if (ghost) ghost.style.opacity = '0';
        
        gsap.set(panel, { borderRadius: 0, willChange: 'transform' });
        
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


// Morph variant for popovers: instead of travelling to the centre of the screen the panel unfolds
// from the trigger and settles on top of it. Quicker beats, and it fades the ghost back in on close
// because the trigger stays hidden underneath the whole time.
export class AnchoredAnimation extends MorphAnimation {
    constructor({ cover = 6, align = 'corner', anchor = 'trigger', ...options } = {}) {
        super({
            openDuration: DURATION.slow,
            closeDuration: DURATION.slow,
            
            openBeats: {
                morph: { at: 0.15, span: 0.85 },
                color: { at: 0.3, span: 0.7 },
                overlay: { at: 0, span: 0.22 },
                // same recalibration as OPEN_BEATS: its morph runs 0.15-1.0, so 0.62 sat at 55%
                // of the morph's own progress and hit the identical half-grown-panel problem
                content: { at: 0.72, span: 0.28 },
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
        this.align = align;
        this.anchor = anchor;
    }
    
    /*Contra que caja se coloca el panel. El morph SIEMPRE sale del trigger - de eso se encarga
      `measure()` - y esto decide solo donde aterriza.
    
      `anchor: 'panel'` lo coloca contra el panel de la modal en la que vive el trigger, no contra el
      trigger. Es lo que necesita una modal que se abre desde una fila de un menu: colocada contra la
      fila, un panel mas ancho que el menu le sobresale por la izquierda y los dos bordes quedan
      descuadrados; contra el panel del menu, comparten borde y se leen como uno encima del otro.
      El `lastElementChild` del <dialog> es ese panel - el primer hijo es el velo (ver customModal.jsx).*/
    anchorRect(trigger) {
        if (this.anchor !== 'panel') return trigger.getBoundingClientRect();
        const host = trigger.closest?.('dialog')?.lastElementChild;
        return (host ?? trigger).getBoundingClientRect();
    }
    
    /*Sits the panel `cover` px above and left of the trigger so it overlaps it, clamped to the viewport.
    
      On the vertical axis it also FLIPS. Clamping alone was enough while every anchored panel hung off
      something near the top of the page, but a trigger at the bottom of the screen - a nav rail's
      account button, say - does not fit downwards, and the clamp would simply shove the panel up until
      its bottom edge hit the margin. The result reads wrong: the panel is no longer attached to
      anything, and the part of it that ends up below the button looks like a mistake rather than the
      deliberate `cover` overlap.
    
      So when the panel does not fit growing down, it is anchored by the OTHER end - its bottom edge
      `cover` px past the trigger's bottom - and grows upwards instead. Mirrored, not improvised: the
      overlap over the trigger is the same in both directions. The clamp stays as the last resort for a
      panel too tall to fit either way.*/
    computeAnchoredPosition(triggerRect, panelRect) {
        const margin = 8;
        const fit = (value, size, viewport) =>
            Math.max(margin, Math.min(value, viewport - size - margin));
        
        /*`align: 'center'` centra el panel SOBRE el trigger en vez de colgarlo de su esquina. Sigue
          siendo una posicion relativa - sale del boton y vuelve a el, con su fantasma y todo - pero
          aterriza tapando lo que rodea al trigger en lugar de dejarlo asomando por un lado. Es lo que
          quiere una modal que se abre desde una fila de un menu: al terminar tapa el menu entero, y no
          hay que elegir entre verlo a medias o mandar el panel al centro de la pantalla, que ya no
          tendria nada que ver con el boton que lo abrio.*/
        if (this.align === 'center') {
            return {
                left: fit(triggerRect.left + (triggerRect.width - panelRect.width) / 2, panelRect.width, window.innerWidth),
                top: fit(triggerRect.top + (triggerRect.height - panelRect.height) / 2, panelRect.height, window.innerHeight),
            };
        }
        
        /*`edge`: misma esquina superior izquierda que la caja de referencia, sin desplazamiento. Los
          dos bordes de arriba y los dos de la izquierda coinciden, y lo que sobre de tamano crece
          hacia abajo y hacia la derecha. Centrado en vertical se veia peor de lo que parece: con dos
          paneles de alto distinto dejaba una franja del de abajo asomando ARRIBA y otra abajo, y esa
          franja superior se lee como un hueco, no como una capa. Compartiendo esquina no hay hueco
          que explicar - se lee como una hoja puesta encima de la otra.*/
        if (this.align === 'edge') {
            return {
                left: fit(triggerRect.left, panelRect.width, window.innerWidth),
                top: fit(triggerRect.top, panelRect.height, window.innerHeight),
            };
        }
        
        const downwards = triggerRect.top - this.cover;
        const fitsDownwards = downwards + panelRect.height <= window.innerHeight - margin;
        const top = fitsDownwards
            ? downwards
            : triggerRect.bottom + this.cover - panelRect.height;
        
        return {
            left: fit(triggerRect.left - this.cover, panelRect.width, window.innerWidth),
            top: fit(top, panelRect.height, window.innerHeight),
        };
    }
    
    place(panel, trigger) {
        /*Switch the panel over BEFORE measuring it. `position: fixed` with no auto margins sizes it
          shrink-to-fit instead of flex-centred, so reading the rect first and switching afterwards
          measured one layout and animated a different one - the panel jumped a frame on open.*/
        gsap.set(panel, { position: 'fixed', margin: 0 });
        const { left, top } = this.computeAnchoredPosition(
            this.anchorRect(trigger),
            panel.getBoundingClientRect(),
        );
        gsap.set(panel, { left, top });
    }
    
    placedProps() { return 'position,left,top,margin'; }
}

// ready-made singletons - these are stateless, so one instance each is enough
export const morphAnimation = new MorphAnimation();
export const fadeAnimation = new FadeScaleAnimation();
export const anchoredAnimation = new AnchoredAnimation();
