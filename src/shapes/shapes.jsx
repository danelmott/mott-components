'use client';
import { forwardRef, useId } from 'react';
import { twMerge } from 'tailwind-merge';
import { ACCENTS, ACCENT_ON } from '../theme/roles.js';
import { SHAPE_PATHS, shapePath } from './shapePaths.js';
import { verifyTypesShape } from '../utils/verifyTypes.js';


const SIZE_TOKEN = {
    sm: 'var(--control-size-sm)',
    md: 'var(--control-size-md)',
    lg: 'var(--control-size-lg)',
};


const spin = (degrees) => {
    if (!degrees) return '';
    const radians = (degrees * Math.PI) / 180;
    const inscribe = Math.round((1 / (Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians)))) * 1e4) / 1e4;
    return ` translate(50 50) scale(${inscribe}) rotate(${degrees}) translate(-50 -50)`;
};


const Shape = forwardRef(function Shape({
    name,
    children,
    size = 'lg',
    color = 'primary',
    contentColor,
    points,
    rotate = 0,
    label,
    className,
    style,
    ...props
}, ref) {
    verifyTypesShape({ name, size, color, contentColor, points, rotate, label });
    const clipId = `mott-shape-${useId().replace(/:/g, '')}`;
    if (!SHAPE_PATHS[name]) return null;

    const box = SIZE_TOKEN[size] ?? size;
    const surface = ACCENTS[color] ?? color;
    const on = contentColor ?? ACCENT_ON[color] ?? 'inherit';

    const decorative = !label && children == null;

    return (
        <>
            <svg
                aria-hidden="true"
                focusable="false"
                width="0"
                height="0"
                style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
            >
                <defs>
                    <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                        <path d={shapePath(name, { points })} transform={`scale(0.01)${spin(rotate)}`} />
                    </clipPath>
                </defs>
            </svg>

            <div
                ref={ref}
                role={label ? 'img' : undefined}
                aria-label={label}
                aria-hidden={decorative || undefined}
                className={twMerge('inline-flex shrink-0 items-center justify-center', className)}
                style={{
                    width: box,
                    height: box,
                    backgroundColor: surface,
                    color: on,
                    clipPath: `url(#${clipId})`,
                    ...style,
                }}
                {...props}
            >
                {children}
            </div>
        </>
    )
});

export default Shape;
