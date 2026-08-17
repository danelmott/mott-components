'use client';
import Icon from '../icon/icon.jsx';

const COLOR_PRESETS = {
    neutral: { bg: 'var(--light-gray-background)', fg: 'var(--dark-navy-text)', solidBg: 'var(--dark-navy-text)', solidFg: 'var(--white)' },
    info: { bg: 'var(--color-action-bg)', fg: 'var(--color-action)', solidBg: 'var(--color-action)', solidFg: 'var(--text-on-action)' },
    success: { bg: 'var(--color-success-bg)', fg: 'var(--color-success)', solidBg: 'var(--color-success)', solidFg: 'var(--text-on-success)' },
    warning: { bg: 'var(--color-warning-bg)', fg: 'var(--color-warning)', solidBg: 'var(--color-warning)', solidFg: 'var(--text-on-warning)' },
    danger: { bg: 'var(--color-danger-bg)', fg: 'var(--color-danger)', solidBg: 'var(--color-danger)', solidFg: 'var(--text-on-danger)' },
};

const SIZE = {
    sm: { pad: 'var(--pad-badge-sm)', text: 'var(--text-xs)', icon: '12px', dot: 5 },
    md: { pad: 'var(--pad-badge-md)', text: 'var(--text-sm)', icon: '14px', dot: 6 },
    lg: { pad: 'var(--pad-badge-lg)', text: 'var(--text-base)', icon: '16px', dot: 7 },
};

//component for badge in mott-design — nativo, sin depender de Button
export default function Badge({ children, color = 'neutral', solid = false, size = 'sm', icon, dot = false, style, ...props }) {
    const preset = COLOR_PRESETS[color];
    const scale = SIZE[size] ?? SIZE.sm;

    // si `color` no es una variante predefinida, se usa tal cual como color CSS custom (sólido)
    const background = preset ? (solid ? preset.solidBg : preset.bg) : color;
    const foreground = preset ? (solid ? preset.solidFg : preset.fg) : 'var(--white)';

    return (
        <span
            className="inline-flex items-center gap-1 rounded-[var(--radius-full)] leading-[var(--leading-tight)] tracking-[var(--tracking-label)] font-[number:var(--font-medium)] whitespace-nowrap"
            style={{
                padding: scale.pad,
                fontSize: scale.text,
                backgroundColor: background,
                color: foreground,
                ...style,
            }}
            {...props}
        >
            {dot && <span aria-hidden="true" style={{ width: scale.dot, height: scale.dot, borderRadius: '50%', backgroundColor: foreground, flexShrink: 0 }} />}
            {icon && <Icon name={icon} size={scale.icon} />}
            {children}
        </span>
    )
}
