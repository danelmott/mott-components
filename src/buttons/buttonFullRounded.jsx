'use client';
import Icon from '../icon/icon.jsx';
import { verifyTypesIconButton } from '../utils/verifyTypes.js';

const SIZE = {
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

//component for buttonFullRounded in mott-design - circular, icon only, native (does not depend on Button)
export default function ButtonFullRounded({
    icon,
    color = 'primary',
    iconColor,
    size = 'md',
    type = 'button',
    onClick,
    style,
    ...props
}) {
    verifyTypesIconButton('ButtonFullRounded', { icon, color, iconColor, size, type });

    const scale = SIZE[size] ?? SIZE.md;
    const preset = COLOR_PRESETS[color];
    
    // when `color` is not a preset variant it is used as-is, as a custom CSS colour
    const background = preset ? preset.bg : color;
    const foreground = iconColor ?? (preset ? preset.fg : 'var(--white)');
    
    return (
        <button
            type={type}
            onClick={onClick}
            className="inline-flex items-center justify-center border-0 cursor-pointer rounded-[var(--radius-full)] transition-all duration-150 hover:brightness-90 active:brightness-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-action)] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100"
            style={{
                width: scale.box,
                height: scale.box,
                padding: 0,
                backgroundColor: background,
                color: foreground,
                ...style,
            }}
            {...props}
        >
            <Icon name={icon} size={scale.icon} />
        </button>
    )
}

