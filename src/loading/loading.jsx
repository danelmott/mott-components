'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { verifyTypesLoading } from '../utils/verifyTypes.js';

const COLOR_PRESETS = {
    primary: 'var(--color-action)',
    secondary: 'var(--dark-navy-text)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
};

const SHAPES = [
    '50% 50% 50% 50% / 50% 50% 50% 50%',   // círculo
    '30% 30% 30% 30% / 30% 30% 30% 30%',   // squircle
    '22% 22% 22% 22% / 22% 22% 22% 22%',   // rounded square
    '30% 30% 30% 30% / 30% 30% 30% 30%',   // squircle (cierra el loop)
];

// pentágono regular (5 vértices) — necesita clip-path, border-radius no puede hacer esquinas rectas
const PENTAGON = 'polygon(50% 0%, 97.55% 34.55%, 79.4% 90.45%, 20.6% 90.45%, 2.45% 34.55%)';

//component for loading in mott-design — figuras que cambian de forma en loop, animado con GSAP
export default function Loading({ size = 'sm', color = 'primary', className, style, ...props }) {
    verifyTypesLoading({ size, color });
    const shapeRef = useRef(null);
    const box = `var(--control-size-${size})`;
    const background = COLOR_PRESETS[color] ?? color;

    useGSAP(() => {
        const el = shapeRef.current;
        const tl = gsap.timeline({ repeat: -1 });

        // el elemento arranca en círculo (SHAPES[0], scale 1, opacity 1, sin clip-path) — cada
        // transición hace UN solo pulso, y la última termina exactamente en ese mismo estado inicial,
        // así el loop conecta sin doble-rebote ni salto en la costura
        const morph = (shape) => {
            tl.to(el, { borderRadius: shape, scale: 1.12, duration: 0.5, ease: 'power2.out' }, '+=0.05')
                .to(el, { scale: 1, duration: 0.45, ease: 'power2.in' });
        };

        morph(SHAPES[1]); // squircle
        morph(SHAPES[2]); // rounded square
        morph(SHAPES[3]); // squircle

        // pentágono: border-radius y clip-path no se interpolan entre sí, así que se cruza con un fade corto
        tl.to(el, { opacity: 0, scale: 0.85, duration: 0.2, ease: 'power2.in' }, '+=0.05')
            .set(el, { clipPath: PENTAGON })
            .to(el, { opacity: 1, scale: 1.12, duration: 0.3, ease: 'power2.out' })
            .to(el, { scale: 1, duration: 0.45, ease: 'power2.in' });

        // vuelta a círculo (mismo estado que el arranque) — un solo pulso, sin duplicar el de arriba
        tl.to(el, { opacity: 0, scale: 0.85, duration: 0.2, ease: 'power2.in' }, '+=0.3')
            .set(el, { clipPath: 'none', borderRadius: SHAPES[0] })
            .to(el, { opacity: 1, scale: 1.12, duration: 0.3, ease: 'power2.out' })
            .to(el, { scale: 1, duration: 0.45, ease: 'power2.in' });

        gsap.to(el, { rotate: 360, duration: 5, repeat: -1, ease: 'none' });
    }, []);

    return (
        <div
            ref={shapeRef}
            role="status"
            aria-label="Cargando"
            className={className}
            style={{
                width: box,
                height: box,
                backgroundColor: background,
                borderRadius: SHAPES[0],
                boxShadow: '0 4px 14px rgb(0 0 0 / 0.2)',
                ...style,
            }}
            {...props}
        />
    )
}
