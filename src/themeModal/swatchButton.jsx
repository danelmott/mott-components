'use client';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { MORPH_SCALE, morphTo, pressHandlers, CIRCLE_RADIUS, squircleRadius } from '../animations/motion.js';
import Icon from '../icon/icon.jsx';
import { onColorFor } from '../theme/palette.js';



// El tamaño por defecto, que es el que usa ThemeModal. Es un prop para que el onboarding pueda
// pedir uno mayor sin que aparezca un segundo componente de swatch que haya que mantener a la par.
const SWATCH = 56;
const SWATCH_CLASS = 'mott-shine mott-swatch flex items-center justify-center cursor-pointer border-0 p-0';


export default function SwatchButton({ theme, selected, onSelect, size = SWATCH }) {
    const ref = useRef(null);
    const checkRef = useRef(null);
    const didMountRef = useRef(false);

    useGSAP(() => {
        if (!ref.current) return;
        const shape = {
            borderRadius: selected ? squircleRadius() : CIRCLE_RADIUS,
            scale: selected ? MORPH_SCALE : 1,
            '--mott-morph-scale': selected ? MORPH_SCALE : 1,
        };
        const mark = { autoAlpha: selected ? 1 : 0, scale: selected ? 1 : 0.6 };
        if (!didMountRef.current) {
            didMountRef.current = true;
            gsap.set(ref.current, shape);
            gsap.set(checkRef.current, mark);
            return;
        }
        morphTo(ref.current, shape, { entering: selected });
        morphTo(checkRef.current, mark, { entering: selected });
    }, { dependencies: [selected] });

    return (
        <button
            ref={ref}
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            aria-label={theme.name}
            title={theme.name}
            className={SWATCH_CLASS}
            {...pressHandlers(selected ? MORPH_SCALE : 1)}
            style={{
                /*El alto sale del ancho y no de un segundo numero: asi `size` admite tambien un
                  porcentaje - una rejilla puede darle el ancho de su columna - y el swatch sigue
                  siendo redondo sin que nadie tenga que calcular nada.*/
                width: size,
                height: 'auto',
                aspectRatio: '1 / 1',
                borderRadius: CIRCLE_RADIUS,
                background: `linear-gradient(98deg, rgb(255 255 255 / 0) 22%, rgb(255 255 255 / 0.20) 76%, rgb(255 255 255 / 0.12) 100%), ${theme.hex}`,
                '--mott-swatch-ring': selected ? '0.3' : '0.1',
            }}
        >
            {/*Dos capas y no una: la de fuera deshace la escala del bead, la de dentro es la
                entrada del check y la escribe GSAP. Separadas porque si no, el tween del check
                pisaria el transform de la contra-escala en cuanto empezara a correr.*/}
            <span className="mott-morph-steady flex">
                <span ref={checkRef} className="flex">
                    <Icon
                        name="check"
                        size="lg"
                        weight={700}
                        style={{ color: onColorFor(theme.hex) }}
                    />
                </span>
            </span>
        </button>
    );
}
