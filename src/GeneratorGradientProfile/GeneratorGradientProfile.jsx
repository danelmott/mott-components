'use client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '../theme/themeContext.jsx';
import { verifyTypesGradientProfile } from '../utils/verifyTypes.js';
import { CARD_H, CARD_W, drawCard } from './gradientCanvas.js';
import { buildGradientStops } from './gradientPalette.js';

// La tarjeta es solo lectura: pinta la identidad que le llega por props. El nombre y el correo son
// datos de la cuenta, no algo que se edite desde aqui, asi que no hay estado local ni formulario.
export default function GeneratorGradientProfile({
    name = '',
    email = '',
    size = 300,
    fill = false,
    className,
}) {
    verifyTypesGradientProfile({ name, email, size, fill });

    const { colorSeedHex, resolvedMode } = useTheme();
    const canvasRef = useRef(null);

    // The whole colour set for the card in one place: rebuilt only when the accent or the mode
    // moves, not on every render.
    const ramp = useMemo(
        () => buildGradientStops(colorSeedHex, resolvedMode),
        [colorSeedHex, resolvedMode]
    );

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const supersample = dpr * 2;
        canvas.width = CARD_W * supersample;
        canvas.height = CARD_H * supersample;

        // `drawCard` sigue trabajando en el sistema de coordenadas 440x600 de siempre: la escala la
        // absorbe la transform, no cada coordenada
        const ctx = canvas.getContext('2d');
        ctx.setTransform(supersample, 0, 0, supersample, 0, 0);
        drawCard(ctx, { name, email, ramp });
    }, [name, email, ramp]);

    useEffect(() => {
        render();
    }, [render]);

    return (
        <div
            className={[
                'flex w-full flex-col items-center justify-center',
                fill && 'h-full',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <div className={fill ? 'h-full w-full' : 'w-full'} style={fill ? undefined : { maxWidth: size }}>
                <canvas
                    ref={canvasRef}
                    aria-label={`Tarjeta de perfil de ${name || 'usuario'}`}
                    className={
                        fill
                            ? 'block h-full w-full rounded-[30px] object-contain'
                            : 'block h-auto w-full rounded-[30px]'
                    }
                />
            </div>
        </div>
    );
}
