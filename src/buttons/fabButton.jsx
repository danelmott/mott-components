'use client';
import Icon from '../icon/icon.jsx';

const FAB_SIZE = {
    sm: { box: 'var(--control-size-sm)', icon: 'var(--lg-icon)' },
    md: { box: 'var(--control-size-md)', icon: 'var(--lg-icon)' },
    lg: { box: 'var(--control-size-lg)', icon: 'var(--xl-icon)' },
};

const COLOR_PRESETS = {
    primary: { bg: 'var(--color-action)', fg: 'var(--text-on-action)' },
    secondary: { bg: 'var(--dark-navy-text)', fg: 'var(--white)' },
    outline: { bg: 'var(--light-gray-background)', fg: 'var(--dark-navy-text)' },
    ghost: { bg: 'transparent', fg: 'var(--dark-navy-text)' },
    danger: { bg: 'var(--color-danger)', fg: 'var(--text-on-danger)' },
};

//component for fabButton in mott-design — nativo, no depende de Button
export default function FabButton({
    color = 'primary',
    iconColor,
    icon,
    size = 'md',
    type = 'button',
    onClick,
    style,
    ...props
}) {
    const dimensions = FAB_SIZE[size] ?? FAB_SIZE.md;
    const preset = COLOR_PRESETS[color];
    
    // si `color` no es una variante predefinida, se usa tal cual como color CSS custom
    const background = preset ? preset.bg : color;
    const foreground = iconColor ?? (preset ? preset.fg : 'var(--white)');
    
    return (
        <button
            type={type}
            onClick={onClick}
            className="inline-flex items-center justify-center border-0 cursor-pointer transition-all duration-150 hover:brightness-90 active:brightness-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-action)] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100"
            style={{
                width: dimensions.box,
                height: dimensions.box,
                padding: 0,
                borderRadius: 'var(--control-radius)',
                backgroundColor: background,
                color: foreground,
                ...style,
            }}
            {...props}
        >
            <Icon name={icon} size={dimensions.icon} />
        </button>
    )
}
