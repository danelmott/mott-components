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
    '50% 50% 50% 50% / 50% 50% 50% 50%',   // circle
    '30% 30% 30% 30% / 30% 30% 30% 30%',   // squircle
    '22% 22% 22% 22% / 22% 22% 22% 22%',   // rounded square
    '30% 30% 30% 30% / 30% 30% 30% 30%',   // squircle (closes the loop)
];

// regular pentagon (5 vertices) - needs clip-path; border-radius cannot make straight corners
const PENTAGON = 'polygon(50% 0%, 97.55% 34.55%, 79.4% 90.45%, 20.6% 90.45%, 2.45% 34.55%)';

//component for loading in mott-design - shapes morphing in a loop, animated with GSAP
export default function Loading({ size = 'sm', color = 'primary', className, style, ...props }) {
    verifyTypesLoading({ size, color });
    const shapeRef = useRef(null);
    const box = `var(--control-size-${size})`;
    const background = COLOR_PRESETS[color] ?? color;

    useGSAP(() => {
        const el = shapeRef.current;
        const tl = gsap.timeline({ repeat: -1 });

        // The element starts as a circle (SHAPES[0], scale 1, opacity 1, no clip-path). Each
        // transition is ONE single pulse, and the last one ends in exactly that same initial state, so
        // the loop joins without a double bounce or a jump at the seam.
        const morph = (shape) => {
            tl.to(el, { borderRadius: shape, scale: 1.12, duration: 0.5, ease: 'power2.out' }, '+=0.05')
                .to(el, { scale: 1, duration: 0.45, ease: 'power2.in' });
        };

        morph(SHAPES[1]); // squircle
        morph(SHAPES[2]); // rounded square
        morph(SHAPES[3]); // squircle back

        // pentagon: border-radius and clip-path do not interpolate into each other, so it crosses over
        // with a short fade
        tl.to(el, { opacity: 0, scale: 0.85, duration: 0.2, ease: 'power2.in' }, '+=0.05')
            .set(el, { clipPath: PENTAGON })
            .to(el, { opacity: 1, scale: 1.12, duration: 0.3, ease: 'power2.out' })
            .to(el, { scale: 1, duration: 0.45, ease: 'power2.in' });

        // back to the circle (the same state it started from) - a single pulse, not a repeat of the above
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
