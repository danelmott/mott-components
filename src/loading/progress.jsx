'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ACCENTS } from '../theme/roles.js';
import { verifyTypesProgress } from '../utils/verifyTypes.js';


//component for progress in mott-design - determinate (value) or indeterminate (travelling sheen), animated with GSAP
export default function Progress({ value, color = 'primary', className, style, ...props }) {
    verifyTypesProgress({ value, color });
    const fillRef = useRef(null);
    const trackRef = useRef(null);
    const resolved = ACCENTS[color] ?? color;
    const indeterminate = value === undefined || value === null;

    useGSAP(() => {
        if (indeterminate) {
            gsap.set(fillRef.current, { xPercent: -100 });
            gsap.to(fillRef.current, { xPercent: 200, duration: 1.2, repeat: -1, ease: 'none' });
        } 
        else {
            gsap.killTweensOf(fillRef.current);
            gsap.to(fillRef.current, { width: `${Math.min(100, Math.max(0, value))}%`, duration: 0.4, ease: 'power3.out' });
        }
    }, { dependencies: [indeterminate, value] });

    return (
        <div
            ref={trackRef}
            role="progressbar"
            aria-valuenow={indeterminate ? undefined : value}
            aria-valuemin={0}
            aria-valuemax={100}
            className={className}
            style={{ width: '100%', height: 8, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--md-sys-color-surface-container)', overflow: 'hidden', position: 'relative', ...style }}
            {...props}
        >
            <div
                ref={fillRef}
                style={
                    indeterminate
                        ? { position: 'absolute', inset: 0, width: '40%', background: `linear-gradient(90deg, transparent, ${resolved}, transparent)` }
                        : { height: '100%', width: 0, borderRadius: 'var(--radius-full)', backgroundColor: resolved }
                }
            />
        </div>
    )
}
