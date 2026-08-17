'use client';
import { twMerge } from "tailwind-merge";

const SIZE_TOKEN = {
    sm: 'var(--sm-icon)',
    md: 'var(--md-icon)',
    lg: 'var(--lg-icon)',
    xl: 'var(--xl-icon)',
};


//component for icons in mott-design
export default function Icon({
    name,
    size = 'md',
    filled = true,
    weight = 500,
    grade = 200,
    opticalSize = 24,
    className,
}) {
    if (!name) return null;
    
    const iconSize = SIZE_TOKEN[size] ?? size;
    
    return (
        <span
            className={twMerge('material-symbols-rounded select-none', className)}
            aria-hidden="true"
            style={{
                fontSize: iconSize,
                fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
            }}
        >
            {name}
        </span>
    )
}
