import { shapePath } from '../shapes/shapePaths.js';

/*Morfear una forma de M3 en otra.

  El problema: las formas de `shapePaths.js` son paths con distinto numero de segmentos y hechos de
  arcos, asi que no se pueden interpolar comando a comando - y MorphSVG, el plugin de GSAP que sabe
  hacerlo, es de pago. La salida es describir cada forma como RADIO POR ANGULO: N radios medidos en
  N angulos equiespaciados. Con eso, morfear de A a B es interpolar N numeros, y el resultado se
  dibuja como un poligono cerrado de N puntos.

  Esto solo funciona si las formas son estrelladas respecto a su centro - si una recta que sale de
  (50,50) corta el contorno una sola vez. No es una suposicion: `advances()` en shapePaths.js
  rechaza cualquier outline que se de la vuelta alrededor de su propio centro (es el filtro que
  distingue una muesca de un agujero), asi que todo lo que sale de `scallop()` cumple exactamente
  esta condicion. Los poligonos redondeados son convexos, con lo que tambien.

  Es ademas como lo hace M3: los dos contornos se emparejan por correspondencia de puntos, no por
  comandos de path.*/

const TAU = Math.PI * 2;
const CENTRE = 50;

// Cuantos radios describen una forma. A los tamanos de un loader (24-80px) cada tramo del poligono
// mide una fraccion de pixel, asi que no hace falta suavizarlo a curvas: 120 rectas y una curva de
// verdad son el mismo dibujo.
export const SAMPLES = 120;

// Muestreo del path original, por longitud de arco. Generoso porque es de donde sale la precision
// de todo lo demas, y se paga una sola vez por forma en toda la vida de la pagina.
const WALK = 720;

/*El indice 0 apunta arriba, igual que `scallop()` empieza sus bumps en -90 grados. No es cosmetico:
  es lo que hace que el bump de un cookie, el vertice de un diamante y la punta de un triangulo
  caigan en el mismo indice, y por tanto que uno se convierta en el otro en vez de retorcerse hasta
  encontrarlo.*/
const START = -Math.PI / 2;

const round = (n) => Math.round(n * 100) / 100;

const SVG_NS = 'http://www.w3.org/2000/svg';

/*Recorre el path con la API nativa de geometria de SVG. Sirve para cualquier `d` - arcos incluidos -
  sin escribir un parser, que es justo lo que no quiero mantener aqui.

  El <svg> se monta en el documento y se quita despues: Firefox no garantiza `getTotalLength()`
  sobre un nodo suelto, y el fallo seria un cero silencioso, no una excepcion.*/
function walk(d) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
    document.body.appendChild(svg);

    const total = path.getTotalLength();
    const points = [];
    for (let i = 0; i < WALK; i += 1) {
        const { x, y } = path.getPointAtLength((total * i) / WALK);
        points.push([Math.atan2(y - CENTRE, x - CENTRE), Math.hypot(x - CENTRE, y - CENTRE)]);
    }

    svg.remove();
    return points;
}

/*De "puntos en el orden en que se dibujan" a "radios en angulos fijos".

  Dos cosas hay que arreglar por el camino. Una, `atan2` salta de +pi a -pi una vez por vuelta, asi
  que los angulos se desenrollan sumando vueltas antes de poder buscar en ellos. Dos, un path puede
  recorrerse en sentido horario o antihorario segun como se construyera, y los dos tienen que quedar
  indexados igual o el morph sale retorcido - de ahi el `reverse()`.*/
function radiiFrom(points) {
    const unwrapped = [];
    let previous = points[0][0];

    for (const [angle, radius] of points) {
        let a = angle;
        while (a - previous > Math.PI) a -= TAU;
        while (previous - a > Math.PI) a += TAU;
        unwrapped.push([a, radius]);
        previous = a;
    }

    if (unwrapped[unwrapped.length - 1][0] < unwrapped[0][0]) unwrapped.reverse();

    // El recorrido cubre exactamente una vuelta desde su propio origen, asi que cada angulo que se
    // busque hay que traerlo a ESE tramo antes de comparar.
    const first = unwrapped[0][0];
    const inside = (angle) => {
        let a = angle;
        while (a < first) a += TAU;
        while (a >= first + TAU) a -= TAU;
        return a;
    };

    const radii = new Float64Array(SAMPLES);
    for (let i = 0; i < SAMPLES; i += 1) {
        const target = inside(START + (TAU * i) / SAMPLES);

        // busqueda binaria: el array esta ordenado por angulo despues de desenrollarlo
        let lo = 0;
        let hi = unwrapped.length - 1;
        while (hi - lo > 1) {
            const mid = (lo + hi) >> 1;
            if (unwrapped[mid][0] <= target) lo = mid; else hi = mid;
        }

        const [a0, r0] = unwrapped[lo];
        const [a1, r1] = unwrapped[hi];
        const span = a1 - a0;
        radii[i] = span === 0 ? r0 : r0 + ((r1 - r0) * (target - a0)) / span;
    }

    return radii;
}

/*Cacheado a nivel de modulo, como `avatars.jsx` cachea los SVG de DiceBear y por el mismo motivo:
  la forma es deterministica, medirla cuesta 720 llamadas a la API de geometria, y una pagina con
  veinte loaders no tiene por que pagarlas veinte veces. Sin limite de tamano a proposito - el
  numero de formas distintas que puede pedir una app es el numero de entradas que un humano escribio
  en un preset, no algo que crezca con el uso.*/
const measured = new Map();

// Devuelve null sin DOM (SSR) y el componente se queda con la forma estatica hasta montar.
export function radiiOf({ name, points } = {}) {
    if (typeof document === 'undefined') return null;

    const key = `${name}|${points ?? ''}`;
    if (measured.has(key)) return measured.get(key);

    const d = shapePath(name, { points });
    if (!d) return null;

    const radii = radiiFrom(walk(d));
    measured.set(key, radii);
    return radii;
}

// El path a mitad de camino entre dos formas. `t` de 0 a 1.
export function morphPath(from, to, t) {
    if (!from || !to) return null;

    const points = new Array(SAMPLES);
    for (let i = 0; i < SAMPLES; i += 1) {
        const radius = from[i] + (to[i] - from[i]) * t;
        const angle = START + (TAU * i) / SAMPLES;
        points[i] = `${round(CENTRE + Math.cos(angle) * radius)} ${round(CENTRE + Math.sin(angle) * radius)}`;
    }

    return `M ${points[0]} L ${points.slice(1).join(' L ')} Z`;
}
