'use client';
import { useMemo, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { EASE, prefersReducedMotion } from '../animations/motion.js';
import { shapePath } from '../shapes/shapePaths.js';
import { ACCENTS } from '../theme/roles.js';
import { verifyTypesLoading } from '../utils/verifyTypes.js';
import { morphPath, radiiOf } from './shapeMorph.js';


const SIZE_TOKEN = {
    sm: 'var(--control-size-sm)',
    md: 'var(--control-size-md)',
    lg: 'var(--control-size-lg)',
};

/*El ciclo por defecto, exportado para que un consumidor pueda partir de el en vez de reinventarlo.

  Mezcla ondas y poligonos a proposito: dos formas blandas seguidas se transforman una en otra sin
  que se note gran cosa, y es el paso de una onda a una esquina lo que hace que el morph de M3 se
  lea vivo.

  Aqui NO va el cookie de 6. Con tan pocos bumps sobre un radio interior tan alto la onda deja de
  leerse como una onda: sale un poligono irregular de lobulos gordos que a tamano de loader parece
  un error de dibujo mas que una forma. Sigue existiendo - es `cookie` con `points: 6`, y cualquiera
  puede pedirlo por `shapes` - simplemente no es una forma que aguante estar en bucle.*/
export const LOADER_SHAPES = [
    { name: 'cookie', points: 20 },
    { name: 'triangle' },
    { name: 'diamond' },
];

/*Un morph mas largo que cualquier respuesta a un clic, porque no responde a nada: es un viaje que
  se mira. La pausa en cada forma es lo que deja leerla antes de que se deshaga - sin ella el loader
  no ensena ninguna de sus formas, solo la transicion perpetua entre ellas.*/
const MORPH = 0.6;
const HOLD = 0.25;

// Una vuelta completa. Deliberadamente incomensurable con el ciclo de formas (3 x 0.85 = 2.55s): asi
// la forma no vuelve nunca al mismo angulo y el bucle no se delata.
const SPIN = 6;
// Con prefers-reduced-motion no queda morph, asi que el giro es lo unico que dice "sigo trabajando".
// Tan lento que no pulsa, pero se mueve.
const SPIN_STILL = 12;


/*Loader indeterminado: las formas de M3 transformandose una en otra, girando sin parar.

  Dibuja un <path> y no un <div> con `clip-path` como hacia antes, porque lo que se anima es la
  geometria en si: reescribir el `d` es una linea, y a traves de un clip-path habria que reescribir
  el <clipPath> del <defs> para conseguir exactamente lo mismo.*/
export default function Loading({
    size = 'sm',
    color = 'primary',
    shapes = LOADER_SHAPES,
    label = 'Cargando',
    className,
    style,
    ...props
}) {
    verifyTypesLoading({ size, color, shapes, label });

    const svgRef = useRef(null);
    const pathRef = useRef(null);

    const box = SIZE_TOKEN[size] ?? size;
    const fill = ACCENTS[color] ?? color;

    // Identidad del ciclo, no del array: `shapes` casi siempre llega escrito en el JSX, o sea nuevo
    // en cada render, y sin esto el timeline se reconstruiria en cada pasada.
    const cycle = useMemo(
        () => shapes.map((shape) => `${shape.name}|${shape.points ?? ''}`).join(','),
        [shapes]
    );

    // Primer pintado: el path REAL de la primera forma, con sus arcos, no el poligono muestreado.
    // Es lo que se ve en SSR y antes de que corra el efecto, y es exacto.
    const initial = shapePath(shapes[0]?.name, { points: shapes[0]?.points }) ?? '';

    useGSAP(() => {
        const svg = svgRef.current;
        const path = pathRef.current;
        if (!svg || !path) return;

        const still = prefersReducedMotion();

        gsap.to(svg, {
            rotate: 360,
            duration: still ? SPIN_STILL : SPIN,
            repeat: -1,
            ease: 'none',
        });

        if (still) return;

        const radii = shapes.map(radiiOf);
        // Sin DOM que medir no hay morph posible; el loader se queda en su forma estatica girando,
        // que sigue siendo un loader.
        if (radii.some((entry) => !entry)) return;

        const timeline = gsap.timeline({ repeat: -1 });

        radii.forEach((from, index) => {
            const to = radii[(index + 1) % radii.length];
            const state = { t: 0 };

            timeline.to(state, {
                t: 1,
                duration: MORPH,
                /*`EASE.inOut` es la unica del vocabulario que arranca y acaba practicamente parada y
                  reparte el viaje por igual - la que motion.js describe para mirar algo
                  transformarse. Una curva de cabeza rapida dejaria el morph hecho en el primer
                  cuarto y dos tercios del tiempo sin ensenar nada.*/
                ease: EASE.inOut,
                onUpdate: () => path.setAttribute('d', morphPath(from, to, state.t)),
            }, `+=${HOLD}`);
        });
    }, { dependencies: [cycle] });

    return (
        <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            role="status"
            aria-label={label}
            className={className}
            style={{
                width: box,
                height: box,
                display: 'block',
                // El color va por `currentColor` para que el consumidor pueda pisarlo desde CSS sin
                // tener que saber que dentro hay un <path>.
                color: fill,
                ...style,
            }}
            {...props}
        >
            <path ref={pathRef} d={initial} fill="currentColor" />
        </svg>
    )
}
