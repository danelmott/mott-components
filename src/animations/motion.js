import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

/*The library's whole motion vocabulary lives here, mirrored one-for-one by the --duration-* and
  --ease-* custom properties in globals.css. Whatever is animated in JS reads these constants,
  whatever is animated in CSS reads the tokens, and both sides carry the same numbers - so a
  control whose colour is transitioned by CSS while its shape is tweened by GSAP still lands on
  the same frame instead of the two halves drifting apart.*/

export const DURATION = {
    instant: 0.12,
    fast: 0.2,
    base: 0.28,
    slow: 0.4,
    modal: 0.55,
    /*El morph de seleccion pide la suya. Con --duration-base y la curva vieja el 78% del
      recorrido cabia en los primeros 70ms y los 210 restantes no ensenaban nada: se leia como un
      salto, no como un movimiento. Repartida la curva, este numero ES el tiempo que se ve - por eso
      es mas corto de lo que parece que deberia.

      Bajo de 300 a 220 y de ahi a 120 al mover la geometria fuera del boton (ver `mott-morph` en
      globals.css). Lo que ataba el numero por abajo no era la lectura, era el temblor: cuanto mas
      corta la curva, mas px avanza el glifo entre cuadro y cuadro y mas se notaba el rehinteado.
      Sin glifos que reescalar ese suelo desaparece. A 120ms - siete cuadros a 60fps - la seleccion
      ya no acompana al clic, contesta; queda a la par de --duration-instant, que es lo que dura el
      pulsado, asi que encoger y morfear se leen como una sola respuesta.*/
    morph: 0.12,
    // The odd one out: every value above answers a click, so it is measured in how fast a control
    // can respond. This one is the length of a journey across a surface - a highlight sweeping a
    // control - and a travel that reads as light has to take its time.
    sweep: 0.9,
};

/*`emphasized` is a fast head that settles slowly - right for a control answering a click, where
  leaving at speed IS the response. `exit` is the mirror, for anything actually leaving the screen:
  it lands at 4.25x the average speed, so never point it at something that has to come to rest.
  `inOut` is the one the modal morph rides: it starts and ends practically stationary (0.02x both
  ends) and spreads the journey evenly - half the distance at half the time, peaking at only 2.84x.
  That even split is what lets you watch a button stretch into a panel instead of just seeing it
  arrive.

  `morph` es la de la seleccion, y existe porque `emphasized` no sirve para lo que parecia servir:
  completa el 78% del recorrido en el primer 25% del tiempo. Sobre un control que solo crece 6px eso
  no es enfasis, es un salto seguido de nada. Esta reparte - 19% al cuarto del tiempo, 63% a la
  mitad - asi que a mitad de animacion todavia queda mas de un tercio del camino por delante.

  Lo que decide los numeros no es solo como arranca, es como ATERRIZA. Una cola larga es cara aqui:
  el border-radius no se compone, se repinta, y mientras el arco avanza centesimas de pixel por
  cuadro se repinta sin moverse - y ahi el antialiasing del borde parpadea. Esta curva gasta 60ms en
  el ultimo 5% del recorrido en vez de 84, y su paso por cuadro va de 0.04 a 1.26px (29x) en vez de
  0.02 a 1.73 (84x): mucho mas parejo, que es lo que se ve como limpio. Sigue muy por encima de la
  arrancada parada de `inOut` (7% al cuarto), que en algo que responde a un clic seria retardo.*/
export const EASE = {
    standard: CustomEase.create('mottStandard', '0.2, 0, 0, 1'),
    emphasized: CustomEase.create('mottEmphasized', '0.32, 0.72, 0, 1'),
    inOut: CustomEase.create('mottInOut', '0.65, 0, 0.35, 1'),
    exit: CustomEase.create('mottExit', '0.3, 0, 0.8, 0.15'),
    morph: CustomEase.create('mottMorph', '0.35, 0, 0.45, 1'),
};

/*Shared by the morphs that still tween the control itself - Navbar and the ThemeModal swatches.
  ButtonGroup ya no pasa por aqui: su geometria corre sobre las variables de `mott-morph`, ver
  `morphSelection` mas abajo.
  `overwrite: 'auto'` is the one that matters: useGSAP does not revert its context when the
  dependencies change, so without it a second click stacks a fresh tween on top of the one still
  running and the two write `transform` on the same frame from different start values. That fight
  is what made the controls tremble.*/
export const MORPH = {
    duration: DURATION.morph,
    ease: EASE.morph,
    overwrite: 'auto',
    force3D: true,
};

/*A hair under the 1.1 it replaces, and on purpose: against the 56px of --control-size-md, 1.1 leaves
  the control at 61.6px - it grows 5.6px, so 2.8px a side, and both vertical edges land on a half
  pixel permanently, which is a filed-down grey line rather than an edge. 62/56 grows 6px exactly,
  3px a side, so the resting state - the one actually looked at 99% of the time - keeps a hard edge.
  The difference in size against 1.1 is 0.4px: nobody sees it. It only pays off while the control's
  own box starts on a whole pixel, and where it does not it costs nothing either.*/
export const MORPH_SCALE = 62 / 56;

/*Every morph above pairs a transform with a paint property, and that pairing is what made the
  controls shiver: `borderRadius` repaints the control on every frame, so the browser re-rasterises
  its layer - and with nothing pinning that layer's raster scale it re-rasterises at a slightly
  different size on each step of the scale, re-hinting and re-antialiasing the glyph inside every
  time. Material Symbols is a variable font, whose glyph cache is keyed by instance AND size, so it
  pays that cost in full rather than hitting the cache.

  The hint is set BEFORE the tween rather than inside it: this runs synchronously in a layout effect
  while the tween's first frame does not land until the next rAF, so the browser gets a whole pass
  to promote the layer. Declared inside the tween it would arrive on the frame it was needed and buy
  nothing. It is cleared again on completion - a permanently promoted control renders its text
  through a layer even at rest, which is a different look, not a free one.

  Nothing to clean up when a click lands on top of another: `overwrite: 'auto'` kills the running
  tween without firing its onComplete, but the tween replacing it sets the hint again and does clear
  it, so no layer is ever left behind. On unmount useGSAP reverts the context and takes the inline
  style with it. Same pattern as modalAnimation.js, which promotes the panel for its own morph.*/
/*El que sale suelta en cuatro quintos del tiempo y el que entra llega un pelo tarde. Ese desfase
  ES el traspaso: mismo recorrido, distinta llegada, que es lo que hace que la seleccion se lea como
  un movimiento pasando de un control a otro en vez de dos controles cambiando de estado a la vez.
  Antes los dos arrancaban en el mismo tick con vars identicas - imagenes especulares, y por eso
  nada viajaba. A 120ms el retardo del entrante son 12ms, o sea menos de un cuadro: en la practica
  el traspaso lo hace la diferencia de duraciones (96ms contra 120), y el `lead` solo garantiza que
  el entrante no arranque nunca antes que el saliente. Subirlo para "que se note" seria peor: sobre
  un recorrido tan corto, dos cuadros de retardo ya son un cuarto de la animacion y se leen como
  lentitud.*/
// `lead` es una fraccion de la duracion, no milisegundos sueltos: si se toca el numero de arriba
// el traspaso se reajusta solo en vez de quedarse desproporcionado.
const HANDOFF = { out: 0.8, lead: 0.1 };

export const morphTo = (el, shape, { entering = false } = {}) => {
    gsap.set(el, { willChange: 'transform' });
    return gsap.to(el, {
        ...shape,
        ...MORPH,
        // dur() lo colapsa a 0 con prefers-reduced-motion; onComplete sigue disparando, asi que el
        // will-change se limpia igual y el control simplemente llega en el primer cuadro.
        duration: dur(entering ? DURATION.morph : DURATION.morph * HANDOFF.out),
        delay: entering ? dur(DURATION.morph * HANDOFF.lead) : 0,
        onComplete: () => gsap.set(el, { clearProps: 'willChange' }),
    });
};

/*Encoger al pulsar tiene que pasar por GSAP: un `:active { transform }` en CSS no le puede ganar al
  transform inline que GSAP ya escribe en estos controles - perderia siempre. 0.94 sobre 56px son
  3.4px de encogido, que se ven.

  `base` es la escala a la que el control descansa (MORPH_SCALE si esta elegido, 1 si no), asi que
  el pulsado se compone con la seleccion en lugar de pelearse con ella: una sola cosa manda sobre
  `scale` y siempre sabe a donde volver.*/
export const PRESS_SCALE = 0.94;

/*Sin esto, onPointerLeave dispararia tambien al pasar por encima sin pulsar, y su tween mataria la
  escala de un morph en curso - o sea que sacar el raton de un boton lo romperia a mitad de
  animacion. WeakSet y no un flag en el nodo para no ensuciar el DOM, y para que el elemento se
  pueda recolectar aunque quede marcado.*/
const pressing = new WeakSet();

const release = (base) => (event) => {
    if (!pressing.delete(event.currentTarget)) return;
    gsap.to(event.currentTarget, {
        scale: base,
        duration: dur(DURATION.fast),
        ease: EASE.standard,
        overwrite: 'auto',
    });
};

/*`base` solo lo sigue necesitando quien tenga la seleccion metida en su propio `transform` (el bead
  de ThemeModal). Los controles que morfean por `mott-morph` descansan siempre en 1 - su seleccion
  vive en --mott-morph-scale, sobre ::before - asi que el pulsado se compone solo y no hay dos
  tweens peleandose por `scale`.*/
export const pressHandlers = (base = 1) => ({
    onPointerDown: (event) => {
        pressing.add(event.currentTarget);
        gsap.to(event.currentTarget, {
            scale: base * PRESS_SCALE,
            duration: dur(DURATION.instant),
            ease: EASE.standard,
            overwrite: 'auto',
        });
    },
    onPointerUp: release(base),
    onPointerLeave: release(base),
    onPointerCancel: release(base),
});

/*GSAP interpolates border-radius as a complex string, and the start value it reads back from
  getComputedStyle is the full eight-value form. Handing it the one-value form ('28%') makes the
  two arities disagree, which is what turns a corner morph into a wobble - so always tween the
  long form. src/loading/loading.jsx already does this.*/
const longForm = (value) => `${value} ${value} ${value} ${value} / ${value} ${value} ${value} ${value}`;

export const CIRCLE_RADIUS = longForm('50%');

// Safe to read on demand: --control-radius is static, it does not change with the theme, so a
// one-shot read can never go stale the way a resolved colour would.
export const squircleRadius = () => longForm(
    (typeof document !== 'undefined'
        && getComputedStyle(document.documentElement).getPropertyValue('--control-radius').trim())
    || '28%'
);

/*La seleccion de ButtonGroup no se anima sobre el boton: se anima sobre estas dos variables, que
  ::before y ::after leen (ver `mott-morph` en globals.css). El porque esta alli - resumido, animar
  `border-radius` repinta, repintar rerasteriza el icono, y rerasterizarlo mientras la escala se
  mueve lo hace a un tamano distinto cada cuadro: eso era el temblor. Movida la geometria a un
  pseudo-elemento sin texto, el glifo se queda quieto y no hay nada que rerasterizar.

  Numeros pelados, sin unidad, a proposito: GSAP interpola un custom property numerico directamente,
  sin releer de getComputedStyle el border-radius resuelto - la forma larga de ocho valores cuya
  aridad, cuando no cuadraba con la del destino, era el otro bamboleo que habia que evitar. El % lo
  pone el calc() del CSS.*/
export const CIRCLE_PCT = 50;

// --control-radius es estatico (no cambia con el tema), asi que leerlo bajo demanda no se queda
// viejo como se quedaria un color resuelto.
export const squirclePct = () => (typeof document !== 'undefined'
    && parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--control-radius')))
    || 28;

export const selectionShape = (selected) => ({
    '--mott-morph-r': selected ? squirclePct() : CIRCLE_PCT,
    '--mott-morph-scale': selected ? MORPH_SCALE : 1,
});

/*El saliente suelta en cuatro quintos del tiempo y el entrante llega un pelo tarde: mismo recorrido,
  distinta llegada, que es lo que hace que la seleccion se lea como algo que pasa de un control a
  otro y no como dos controles cambiando de estado a la vez. Ver HANDOFF.*/
export const morphSelection = (el, selected) => gsap.to(el, {
    ...selectionShape(selected),
    duration: dur(selected ? DURATION.morph : DURATION.morph * HANDOFF.out),
    delay: selected ? dur(DURATION.morph * HANDOFF.lead) : 0,
    ease: EASE.morph,
    // sin esto, un segundo clic apila un tween nuevo sobre el que sigue corriendo y los dos
    // escriben la misma variable en el mismo cuadro desde origenes distintos
    overwrite: 'auto',
});


/*Guarded because this module is evaluated on the server too: the components are 'use client' and
  only tween inside effects, but the import itself still runs during SSR.*/
export const prefersReducedMotion = () =>
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Collapses a duration to nothing when the user asked for less motion. The tween still runs, so
// onComplete/onDone fire exactly as before - the element just arrives on the first frame.
export const dur = (seconds) => (prefersReducedMotion() ? 0 : seconds);
