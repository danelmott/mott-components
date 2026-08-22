'use client';
import Icon from '../icon/icon.jsx';
import { controlTint, customTint, asCustomProperties } from '../theme/roles.js';
import { verifyTypesIconButton } from '../utils/verifyTypes.js';

const FAB_SIZE = {
    sm: { box: 'var(--control-size-sm)', icon: 'var(--lg-icon)' },
    md: { box: 'var(--control-size-md)', icon: 'var(--lg-icon)' },
    lg: { box: 'var(--control-size-lg)', icon: 'var(--xl-icon)' },
};


//component for fabButton in mott-design - native, does not depend on Button
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
    verifyTypesIconButton('FabButton', { icon, color, iconColor, size, type });

    const dimensions = FAB_SIZE[size] ?? FAB_SIZE.md;
    // A name we know resolves to a role pair; anything else is taken as a literal CSS colour the
    // caller chose. That fallback is white and not a role on purpose: the caller's colour does not
    // move with the theme, so a foreground that did would lose its contrast in the other mode.
    const tint = controlTint(color) ?? customTint(color, iconColor ?? '#ffffff');
    // `iconColor` overrides the pair's foreground without disturbing its surface
    const resolved = iconColor ? { ...tint, on: iconColor } : tint;
    
    return (
        <button
            type={type}
            onClick={onClick}
            className="inline-flex items-center justify-center border-0 cursor-pointer transition-all duration-150 bg-[var(--mott-surface)] text-[var(--mott-on)] hover:bg-[var(--mott-hover)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--md-sys-color-primary)] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100"
            style={{
                width: dimensions.box,
                height: dimensions.box,
                padding: 0,
                borderRadius: 'var(--control-radius)',
                ...asCustomProperties(resolved),
                ...style,
            }}
            {...props}
        >
            <Icon name={icon} size={dimensions.icon} />
        </button>
    )
}
