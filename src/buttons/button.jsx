'use client';
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { pressProps } from '../animations/motion.js';
import { controlTint } from '../theme/roles.js';
import { verifyTypesButton } from '../utils/verifyTypes.js';

/*Cuanto encoge al pulsarlo. Mas suave que el 0.94 que comparten los controles de tamano fijo
  (Navbar, ButtonGroup, los swatches) porque este boton no tiene un tamano: en uno de 56px, 0.94 son
  3.4px y se leen; en uno de ancho completo esa misma fraccion son veinte pixeles, y eso ya no es un
  pulsado, es un rebote. 0.97 es lo que tenia cuando el encogido lo hacia CSS - el gesto no cambia,
  solo quien lo dibuja.*/
const PRESS = 0.97;

//style for diferents variants for button
const buttonVariants = cva('mott-btn', {
  variants: {
    shape: {
      rounded: 'rounded-[var(--radius-lg)]',
      pill: 'rounded-[var(--radius-full)]',
    },

    iconOnly: {
      true: 'aspect-square p-[var(--pad-button-icon)]',
      false: 'p-[var(--pad-button)]',
    },

    fullWidth: {
      true: 'w-[100%]',
    },
  },

  defaultVariants: {
    shape: 'rounded',
    iconOnly: false,
    fullWidth: false,
  },
});

//component for button in mott-design
const Button = forwardRef(function Button({
    children,
    variant = 'default',
    quiet = false,
    shape,
    iconOnly,
    fullWidth,
    className,
    style,
    type = 'button',
    onClick,
    ...props
}, ref) {
    verifyTypesButton({ variant, quiet, shape, iconOnly, fullWidth, type });

    // falls back rather than throwing, to match what the validator warned about a moment ago
    const tint = controlTint(variant, quiet) ?? controlTint('default', quiet);

    // Both are `var(--md-sys-color-*)` / `var(--md-custom-color-*)` strings rather than resolved
    // values, so the button keeps following the theme and the accent without this component ever
    // knowing what colour it is painting. There is deliberately no way to hand it one from outside.
    return (
        <button
            ref={ref}
            type={type}
            onClick={onClick}
            className={twMerge(buttonVariants({ shape, iconOnly, fullWidth }), className)}
            style={{
                backgroundColor: tint.surface,
                color: tint.on,
                ...style,
            }}
            {...props}
            /*El pulsado va por GSAP y no por un `:active` de CSS. El motivo esta escrito entero en
              `mott-btn`, en globals.css; en corto: hecho con CSS no habia forma de fijar la escala
              de rasterizado del glifo sin promover el boton estando quieto, y la version acotada a
              `:active` cambiaba la capa en el mismo cuadro en que arrancaba el movimiento - que era
              el tironcito del contenido al encoger.

              `pressProps` y no `pressHandlers` porque aqui hay un `...props` de por medio: compone
              con el `onPointerDown` que traiga el consumidor en vez de pisarlo. Va DESPUES del
              spread a proposito, que es lo que le deja hacer esa composicion.*/
            {...pressProps(props, { scale: PRESS })}
        >
            {children}
        </button>
    )
});

export default Button;
