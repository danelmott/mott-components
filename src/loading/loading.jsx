'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ACCENTS } from '../theme/roles.js';
import { prefersReducedMotion } from '../animations/motion.js';
import { verifyTypesLoading } from '../utils/verifyTypes.js';


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
    const background = ACCENTS[color] ?? color;

    useGSAP(() => {
        const el = shapeRef.current;

        /*The shape loop is decoration; the spin is the part that actually says "still working".
          Under reduced motion the morphing stops and only a slow rotation stays, so the component
          still reads as a spinner without the pulsing.*/
        if (prefersReducedMotion()) {
            gsap.to(el, { rotate: 360, duration: 12, repeat: -1, ease: 'none' });
            return;
        }

        const tl = gsap.timeline({ repeat: -1 });

        const morph = (shape) => {
            tl.to(el, { borderRadius: shape, scale: 1.12, duration: 0.5, ease: 'power2.out' }, '+=0.05')
                .to(el, { scale: 1, duration: 0.45, ease: 'power2.in' });
        };

        morph(SHAPES[1]); // squircle
        morph(SHAPES[2]); // rounded square
        morph(SHAPES[3]); // squircle back

        tl.to(el, { opacity: 0, scale: 0.85, duration: 0.2, ease: 'power2.in' }, '+=0.05')
            .set(el, { clipPath: PENTAGON })
            .to(el, { opacity: 1, scale: 1.12, duration: 0.3, ease: 'power2.out' })
            .to(el, { scale: 1, duration: 0.45, ease: 'power2.in' });

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
