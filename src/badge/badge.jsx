'use client';
import Icon from '../icon/icon.jsx';
import { badgeTint, customTint } from '../theme/roles.js';
import { verifyTypesBadge } from '../utils/verifyTypes.js';


const SIZE = {
    sm: { pad: 'var(--pad-badge-sm)', text: 'var(--text-xs)', icon: '12px', dot: 5 },
    md: { pad: 'var(--pad-badge-md)', text: 'var(--text-sm)', icon: '14px', dot: 6 },
    lg: { pad: 'var(--pad-badge-lg)', text: 'var(--text-base)', icon: '16px', dot: 7 },
};

//component for badge in mott-design - native, does not depend on Button
export default function Badge({ children, color = 'neutral', solid = false, size = 'sm', icon, dot = false, style, ...props }) {
    verifyTypesBadge({ color, solid, size, icon, dot });
    const scale = SIZE[size] ?? SIZE.sm;

    // A status name resolves to a role pair - `solid` fills with the family, plain uses its quieter
    // container step. Anything else is taken as a literal CSS colour the caller chose; that fallback
    // foreground is white and not a role on purpose, since the caller's colour does not move with
    // the theme and a foreground that did would lose its contrast in the other mode.
    const tint = badgeTint(color, solid) ?? customTint(color, '#ffffff');

    return (
        <span
            className="inline-flex items-center gap-1 rounded-[var(--radius-full)] leading-[var(--leading-tight)] tracking-[var(--tracking-label)] font-[number:var(--font-medium)] whitespace-nowrap"
            style={{
                padding: scale.pad,
                fontSize: scale.text,
                backgroundColor: tint.surface,
                color: tint.on,
                ...style,
            }}
            {...props}
        >
            {dot && <span aria-hidden="true" style={{ width: scale.dot, height: scale.dot, borderRadius: '50%', backgroundColor: tint.on, flexShrink: 0 }} />}
            {icon && <Icon name={icon} size={scale.icon} />}
            {children}
        </span>
    )
}
