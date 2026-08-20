import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);


// Shared bezier for every morph: a fast head that settles slowly, so the panel reads as one liquid
// gesture rather than a box being moved. `_IN` is its mirror, used on close.
const LIQUID_EASE = CustomEase.create('mottLiquid', '0.32, 0.72, 0, 1');
const LIQUID_EASE_IN = CustomEase.create('mottLiquidIn', '1, 0, 0.68, 0.28');

const MORPH_OPEN_DURATION = 0.8;
const MORPH_CLOSE_DURATION = 0.7;


// Choreography, as fractions of the total duration: `at` is when a part starts, `span` how long it
// runs. Keeping them relative means changing the duration re-times the whole sequence for free.
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


// border-radius may be a percentage, which clip-path's `round` cannot take - resolve it to px.
function resolveRadius(el, rect) {
    const raw = getComputedStyle(el).borderTopLeftRadius;
    const value = parseFloat(raw) || 0;
    return raw.trim().endsWith('%') ? (value / 100) * Math.min(rect.width, rect.height) : value;
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

// Clones the trigger's children into a fixed box over the trigger. It hangs off the `dialog` and not
// the panel, so it stays put instead of travelling with the modal. `inner` is scaled because the ghost
// is sized to the measured rect, which need not match the trigger's layout width.
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


// Makes the panel look exactly like the trigger - same spot, same colour, clipped down to the
// trigger's rect - and then expands it into itself. Nothing is duplicated: it is the real panel the
// whole way, which is why its content never re-flows mid-flight.
export class MorphAnimation extends ModalAnimation {
    constructor({
        openDuration = MORPH_OPEN_DURATION,
        closeDuration = MORPH_CLOSE_DURATION,
        openBeats = {},
        closeBeats = {},
        openEase = LIQUID_EASE,
        closeEase = LIQUID_EASE_IN,
        closeGhost = false,
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
        const cs = getComputedStyle(panel);
        const pad = { top: parseFloat(cs.paddingTop) || 0, left: parseFloat(cs.paddingLeft) || 0 };
        
        const rect = panel.getBoundingClientRect();
        const tx = Number(gsap.getProperty(panel, 'x')) || 0;
        const ty = Number(gsap.getProperty(panel, 'y')) || 0;
        const panelRect = { left: rect.left - tx, top: rect.top - ty, width: rect.width, height: rect.height };
        
        const originRect = trigger.getBoundingClientRect();
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
        gsap.set(panel, { clearProps: `transform,backgroundColor,willChange${alsoClear ? `,${alsoClear}` : ''}` });
        gsap.set(content, { clearProps: 'opacity,visibility' });
    }
    
    // Panel starts disguised as the trigger, then one timeline runs the lot: it slides into place, its
    // colour crossfades, the clip opens up, the content fades in and the backdrop darkens - each on
    // its own beat.
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
    
    // The inverse, with two differences: the clip starts from wherever an interrupted opening left it,
    // and the ghost is optional - only subclasses that leave the trigger hidden want it faded back in.
    close({ dialog, panel, content, overlay, trigger }, onDone) {
        if (!trigger) return new FadeScaleAnimation().close({ panel, overlay }, onDone);
        
        killRunningMorph(panel);
        removeTriggerGhost(dialog); // in case the close interrupts an opening
        
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


// Morph variant for popovers: instead of travelling to the centre of the screen the panel unfolds
// from the trigger and settles on top of it. Quicker beats, and it fades the ghost back in on close
// because the trigger stays hidden underneath the whole time.
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
    
    // Sits the panel `cover` px above and left of the trigger so it overlaps it, clamped to the viewport.
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

// ready-made singletons - these are stateless, so one instance each is enough
export const morphAnimation = new MorphAnimation();
export const fadeAnimation = new FadeScaleAnimation();
export const anchoredAnimation = new AnchoredAnimation();
