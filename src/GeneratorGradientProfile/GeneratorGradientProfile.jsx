'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Input from '../input/input.jsx';
import Text from '../text/text.jsx';
import { useTheme } from '../theme/themeContext.jsx';
import { verifyTypesGradientProfile } from '../utils/verifyTypes.js';
import { CARD_H, CARD_W, drawCard } from './gradientCanvas.js';
import { buildGradientStops } from './gradientPalette.js';

/*Profile card whose artwork is generated from the theme's own accent.

  Requires a `<ThemeProvider>` above it, like `ThemeModal` does: it reads `colorSeedHex` and
  `resolvedMode` and rebuilds the ramp whenever either changes, so switching swatch in the theme
  modal recolours the card with no extra wiring on the consumer's side.

  There is deliberately nothing to choose here beyond the identity text. The wave and the colour
  recipe are both fixed - the accent is the only thing that moves the artwork.*/
export default function GeneratorGradientProfile({
    name = '',
    email = '',
    showControls = true,
    verifiedLabel = 'Correo verificado',
    className,
}) {
    verifyTypesGradientProfile({ name, email, showControls, verifiedLabel });

    const { colorSeedHex, resolvedMode } = useTheme();
    const canvasRef = useRef(null);

    // Controlled by the panel when it is shown; the props are the starting value. A consumer that
    // hides the controls drives the card entirely through `name`/`email`.
    const [nameValue, setNameValue] = useState(name);
    const [emailValue, setEmailValue] = useState(email);

    useEffect(() => setNameValue(name), [name]);
    useEffect(() => setEmailValue(email), [email]);

    // The whole colour set for the card in one place: rebuilt only when the accent or the mode
    // moves, not on every keystroke in the name field.
    const ramp = useMemo(
        () => buildGradientStops(colorSeedHex, resolvedMode),
        [colorSeedHex, resolvedMode]
    );

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // capped at 2: past that the dither grid costs a lot of fill for pixels nobody can resolve
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = CARD_W * dpr;
        canvas.height = CARD_H * dpr;

        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawCard(ctx, { name: nameValue, email: emailValue, ramp, verifiedLabel });
    }, [nameValue, emailValue, ramp, verifiedLabel]);

    useEffect(() => {
        render();
    }, [render]);

    return (
        <div
            className={['flex w-full flex-col items-center gap-[var(--gap-page)] md:flex-row md:items-start md:justify-center', className]
                .filter(Boolean)
                .join(' ')}
        >
            {showControls && (
                <div className="flex w-full max-w-xs flex-col gap-[var(--gap-page)]">
                    <div className="flex flex-col gap-[var(--gap-section)]">
                        <Text variant="title-medium" as="h2">
                            Tarjeta de perfil
                        </Text>
                        <Text variant="body-small" tone="muted">
                            El degradado se genera a partir del acento del tema.
                        </Text>
                    </div>

                    <div className="flex flex-col gap-[var(--gap-group)]">
                        <Input label="Nombre" value={nameValue} onChange={setNameValue} />
                        <Input label="Correo" type="email" value={emailValue} onChange={setEmailValue} />
                    </div>
                </div>
            )}

            <div className="w-full">
                <canvas
                    ref={canvasRef}
                    aria-label={`Tarjeta de perfil de ${nameValue || 'usuario'}`}
                    className="block h-auto w-full rounded-[30px]"
                />
            </div>
        </div>
    );
}
