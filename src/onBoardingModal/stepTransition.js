import gsap from 'gsap';
import { DURATION, EASE, dur } from '../animations/motion.js';

/*El cruce de un paso al siguiente dentro del onboarding.

  Vive fuera del componente por lo mismo que `gradientCanvas.js` vive fuera del generador de
  gradientes: aqui no hay estado de React ni props, solo dos nodos y un viewport, y separarlo deja
  la modal contando la historia de los pasos en vez de la de los tweens.

  Lo que hace que esto se lea como una app nativa no es el desplazamiento lateral, es que el panel
  CREZCA hasta el alto del paso que entra en vez de saltar. Por eso el alto se anima aqui y no se
  deja al layout.*/

// La linea que se recorre. 24px es suficiente para que se lea como "viene de la derecha" sin que el
// contenido llegue a salirse del panel a mitad de camino.
const TRAVEL = 24;

// El saliente suelta en cuatro quintos del tiempo y el entrante llega un pelin tarde: mismo
// recorrido, distinta llegada, que es el mismo reparto que usa la seleccion de ButtonGroup (ver
// HANDOFF en motion.js). Sin el desfase se leen como dos cosas cambiando a la vez, no como una
// pasando por encima de la otra.
const HANDOFF = { out: 0.8, lead: 0.1 };

/*El timeline en curso se aparca en el propio viewport, igual que `modalAnimation.js` aparca el suyo
  en el panel. `Symbol.for` y no `Symbol` para que la clave sobreviva a un reload del modulo (HMR).*/
const RUNNING = Symbol.for('mott.runningStep');

// Saca un paso del flujo sin sacarlo del DOM: sigue midiendo, pero deja de sumar alto al viewport.
const FLOAT = { position: 'absolute', top: 0, left: 0, width: '100%' };

/*`direction`: 1 al avanzar, -1 al volver. Es lo unico que separa un paso adelante de uno atras, y
  no es un detalle cosmetico - con el sentido cableado, volver se veria exactamente igual que
  avanzar, y un boton de volver cuya animacion dice "adelante" deja de leerse como una pila de
  pantallas y pasa a ser una lista de pasos sueltos.*/
export function transitionStep({ viewport, outgoing, incoming, direction = 1, onDone }) {
    if (!viewport || !incoming) {
        onDone?.();
        return null;
    }

    // Un segundo clic mientras el anterior corre: sin esto quedan dos tweens escribiendo `height`
    // en el mismo cuadro desde origenes distintos, y el panel se queda a media altura.
    viewport[RUNNING]?.kill();

    /*El orden de estas cuatro lineas es todo. Primero se flota SOLO el entrante, asi que el viewport
      todavia mide lo que mide el paso que se va - ese es el alto de partida. Despues se mide el
      entrante, que flotando ya no arrastra al viewport consigo. Y solo entonces se flota tambien el
      saliente. Medir con los dos en el flujo daria la suma de ambos, que es exactamente el salto que
      se intenta evitar.*/
    gsap.set(incoming, { ...FLOAT, autoAlpha: 0 });
    const from = viewport.offsetHeight;
    const to = incoming.offsetHeight;
    if (outgoing) gsap.set(outgoing, FLOAT);

    const total = dur(DURATION.base);

    /*El recorte vive solo mientras dura el cruce. Es obligatorio aqui - sin el, el paso que entra se
      veria entero desbordando el panel mientras este todavia crece - y es un estorbo el resto del
      tiempo, porque se come lo que cualquier hijo pinte fuera de su caja (el swatch elegido de la
      primera columna crece 3px hacia la izquierda y se veia cortado).*/
    gsap.set(viewport, { overflow: 'hidden' });

    const timeline = gsap.timeline({
        onComplete: () => {
            viewport[RUNNING] = null;
            /*El alto vuelve a `auto`. Dejarlo fijo es una bomba de relojeria: una fuente que carga
              tarde, un error que aparece bajo un campo o un cambio de ancho dejarian el paso
              cortado por un alto que se midio en otro momento.*/
            gsap.set(viewport, { clearProps: 'height,overflow' });
            gsap.set(incoming, { clearProps: 'position,top,left,width,transform,opacity,visibility' });
            onDone?.();
        },
    });

    timeline.fromTo(
        viewport,
        { height: from },
        { height: to, duration: total, ease: EASE.inOut },
        0
    );

    if (outgoing) {
        timeline.to(
            outgoing,
            { x: -TRAVEL * direction, autoAlpha: 0, duration: total * HANDOFF.out, ease: EASE.exit },
            0
        );
    }

    timeline.fromTo(
        incoming,
        { x: TRAVEL * direction, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: total, ease: EASE.emphasized },
        total * HANDOFF.lead
    );

    viewport[RUNNING] = timeline;
    return timeline;
}
