'use client';
import { pressProps } from '../animations/motion.js';
import Icon from '../icon/icon.jsx';
import { controlTint } from '../theme/roles.js';
import { verifyTypesIconButton } from '../utils/verifyTypes.js';

const FAB_SIZE = {
    sm: { box: 'var(--control-size-sm)', icon: 'var(--lg-icon)' },
    md: { box: 'var(--control-size-md)', icon: 'var(--lg-icon)' },
    lg: { box: 'var(--control-size-lg)', icon: 'var(--xl-icon)' },
};


//component for fabButton in mott-design - native, does not depend on Button
export default function FabButton({
    variant = 'action',
    quiet = false,
    icon,
    size = 'md',
    type = 'button',
    onClick,
    style,
    ...props
}) {
    verifyTypesIconButton('FabButton', { icon, variant, quiet, size, type });

    const dimensions = FAB_SIZE[size] ?? FAB_SIZE.md;
    // a FAB is the one thing the screen is for, hence `action` rather than `default` as the fallback
    const tint = controlTint(variant, quiet) ?? controlTint('action', quiet);

    return (
        <button
            type={type}
            onClick={onClick}
            className="mott-btn"
            style={{
                width: dimensions.box,
                height: dimensions.box,
                padding: 0,
                borderRadius: 'var(--control-radius)',
                backgroundColor: tint.surface,
                color: tint.on,
                ...style,
            }}
            {...props}
            /*El pulsado va por GSAP, como en Button y por el mismo motivo (ver `mott-btn` en
              globals.css). Aqui sin `scale` propio: un FAB es un control de tamano fijo, igual que
              los del Navbar o los del ButtonGroup, asi que le vale el 0.94 que comparten todos.*/
            {...pressProps(props)}
        >
            <Icon name={icon} size={dimensions.icon} />
        </button>
    )
}
