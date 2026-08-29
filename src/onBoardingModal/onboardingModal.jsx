'use client';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DURATION, EASE, dur, prefersReducedMotion, pressHandlers } from '../animations/motion.js';
import Avatar from '../avatars/avatars.jsx';
import Button from '../buttons/button.jsx';
import CustomModal from '../customModal/customModal.jsx';
import Icon from '../icon/icon.jsx';
import Input from '../input/input.jsx';
import SwatchButton from '../themeModal/swatchButton.jsx';
import { useTheme } from '../theme/themeContext.jsx';
import { verifyTypesOnboardingModal } from '../utils/verifyTypes.js';
import { transitionStep } from './stepTransition.js';


/*El onboarding: cuatro pasos, un solo boton.

  El estado vive aqui dentro a proposito. Un onboarding se recorre entero o no se recorre, asi que
  pedirle al consumidor que cablee cinco `useState` para ver algo seria cobrarle por adelantado algo
  que solo le importa al final: `onComplete` le entrega los tres datos de una vez y ya.

  La excepcion es el color, que SI se aplica en vivo sobre el tema mientras se elige. Es la unica
  forma de que la eleccion signifique algo en el momento de hacerla - la modal entera se repinta
  con el acento nuevo - y es tambien lo que ya hace ThemeModal, de quien salen los swatches.*/


const STEPS = ['welcome', 'profile', 'color', 'done'];

/*Dos tamanos, y la diferencia no es un capricho: es cuanto tiene que compartir la imagen su paso.

  En el del nombre convive con el campo, asi que se queda en 144. En el de bienvenida y en el final
  no hay nada mas que el titulo y ella, y con el alto fijo del panel a 144 se quedaban nadando en un
  hueco vacio - a 184 la imagen ocupa el sitio que le corresponde y el paso deja de parecer a medio
  hacer.*/
const MEDIA = '144px';
const MEDIA_HERO = '184px';

/*El alto que ocupan los pasos, fijo. Medidos, los cuatro dan 212 / 298 / 206 / 212 px: el del nombre
  es el mas alto porque carga con la cara y con el campo, y sin este suelo el panel encogia 92px de
  golpe al pasar de el al de los colores. Con el suelo puesto, los botones de abajo se quedan
  clavados en el mismo sitio durante todo el recorrido, que es lo que hace que se lea como una
  pantalla que cambia de contenido y no como cuatro modales distintas.

  `min-height` y no `height`: si alguien cambia los textos por unos que ocupen dos lineas, el paso
  crece en vez de quedar cortado. Se pierde el alto constante para ese caso concreto, que es mucho
  menos malo que perder contenido.*/
const STEPS_MIN_HEIGHT = 300;

/*Lo que se espera desde la ultima tecla hasta redibujar la cara. Es una pausa larga para un
  debounce, y es el punto: no se busca que reaccione rapido, se busca que cambie UNA vez.*/
const SETTLE = 500;

// Cuanto se separa el glifo del boton al cruzarse de la flecha al check.
const GLYPH_OUT = { autoAlpha: 0, scale: 0.6 };
const GLYPH_IN = { autoAlpha: 1, scale: 1 };


export default function OnboardingModal({
    open,
    onClose,
    triggerRef,
    icon,
    welcomeTitle = 'Te damos la bienvenida',
    profileTitle = '¿Cómo te llamas?',
    nameLabel = 'Nombre',
    namePlaceholder = 'Escribe tu nombre',
    colorTitle = 'Píntalo a tu manera',
    doneTitle = 'Todo listo',
    onComplete,
}) {
    verifyTypesOnboardingModal({ open, onClose, triggerRef, icon, onComplete });

    const { colorSeedHex, variant, setColorSeedHex, THEMES_AVAILABLE } = useTheme();

    const [step, setStep] = useState(0);
    const [previous, setPrevious] = useState(null);
    const [name, setName] = useState('');
    /*La semilla va por detras del campo a proposito. Enganchada directamente al valor, la cara se
      redibujaba entera en cada pulsacion: escribir un nombre de seis letras era un parpadeo de seis
      imagenes distintas en menos de un segundo, que es justo el tipo de destello que hay que evitar
      por fotosensibilidad. Asi cambia una sola vez, cuando se para de escribir.*/
    const [seedName, setSeedName] = useState('');

    const viewportRef = useRef(null);
    /*Un nodo por paso, indexado por id. Con el boton de volver un paso SI se vuelve a montar, y aun
      asi ninguno hereda estilos rancios: el nodo que regresa se monta nuevo (el anterior se
      desmonto al terminar su cruce), y si se pulsa volver con un cruce a medias, `transitionStep`
      reescribe `position`/`x`/`autoAlpha` del entrante antes de animarlo y hace `clearProps` al
      acabar. Un nodo reciclado en pleno vuelo se sanea solo.*/
    const nodes = useRef({});

    const trimmed = name.trim();

    // La misma semilla dibuja siempre la misma cara, en cualquier dispositivo y sin guardar nada.
    const avatarSeed = seedName || 'mott';

    useEffect(() => {
        const id = setTimeout(() => setSeedName(trimmed), SETTLE);
        return () => clearTimeout(id);
    }, [trimmed]);

    const isLast = step === STEPS.length - 1;
    // el nombre es obligatorio: es el unico dato del onboarding que no se puede inventar por el usuario
    const canAdvance = step !== 1 || trimmed !== '';

    // Desde el paso siguiente al del nombre en adelante. Del nombre no se vuelve a la bienvenida:
    // esa pantalla no pregunta nada, asi que no hay nada que ir a revisar.
    const canGoBack = step >= 2;

    const advance = () => {
        if (!canAdvance) return;
        if (isLast) {
            onComplete?.({ name: trimmed, avatarSeed, colorSeedHex });
            onClose?.();
            return;
        }
        setPrevious(step);
        setStep(step + 1);
    };

    /*Volver no deshace nada. El nombre, la cara y el color viven en el estado de este componente, asi
      que un paso al que se regresa se encuentra tal como se dejo - y el acento, que ademas ya esta
      aplicado al tema, se queda aplicado: lo que se eligio, elegido esta.*/
    const goBack = () => {
        if (!canGoBack) return;
        setPrevious(step);
        setStep(step - 1);
    };

    /*El cruce corre en layout, antes de que el navegador pinte: si esperara a un efecto normal se
      veria un cuadro con el paso nuevo ya en su sitio y a pantalla completa, y el tween arrancaria
      desde ahi con un parpadeo.*/
    useLayoutEffect(() => {
        if (previous === null) return;
        const leaving = previous;

        transitionStep({
            viewport: viewportRef.current,
            outgoing: nodes.current[STEPS[leaving]],
            incoming: nodes.current[STEPS[step]],
            // Sale de comparar el par que se esta cruzando ahora mismo, no de un estado aparte que
            // pudiera quedarse desincronizado de el.
            direction: step > leaving ? 1 : -1,
            onDone: () => {
                // Si mientras corria empezo otro cruce, el saliente ya no es este: desmontarlo aqui
                // le cortaria la animacion al que esta a medias.
                setPrevious((current) => (current === leaving ? null : current));
                nodes.current[STEPS[step]]?.focus();
            },
        });
    }, [step, previous]);

    /*El glifo del boton se cruza en vez de cambiar de golpe, que es la diferencia entre un boton que
      cambia de estado y uno que responde. Mismo patron que el check de SwatchButton: se apaga, se
      cambia el nombre del icono y se vuelve a encender.*/
    const [glyph, setGlyph] = useState('arrow_forward');
    const glyphRef = useRef(null);
    const didMountRef = useRef(false);

    useEffect(() => {
        const next = isLast ? 'check' : 'arrow_forward';
        if (!didMountRef.current) {
            didMountRef.current = true;
            setGlyph(next);
            return;
        }
        if (next === glyph || !glyphRef.current) return;

        gsap.to(glyphRef.current, {
            ...GLYPH_OUT,
            duration: dur(DURATION.instant),
            ease: EASE.exit,
            overwrite: 'auto',
            onComplete: () => {
                setGlyph(next);
                gsap.to(glyphRef.current, {
                    ...GLYPH_IN,
                    duration: dur(DURATION.fast),
                    ease: EASE.emphasized,
                });
            },
        });
    }, [isLast, glyph]);

    /*El boton de volver se queda SIEMPRE montado y solo se enciende y se apaga. Montarlo y
      desmontarlo obligaria a coordinar su tween con el ciclo de vida de React justo mientras corre
      el cruce de pasos; asi esa carrera no existe, y `disabled` ya lo saca del orden de tabulacion
      mientras esta invisible.*/
    const backRef = useRef(null);
    const backSlotRef = useRef(null);
    useEffect(() => {
        const el = backRef.current;
        const slot = backSlotRef.current;
        if (!el || !slot) return;

        const shown = { autoAlpha: canGoBack ? 1 : 0, scale: canGoBack ? 1 : 0.6 };
        // Medido, no escrito a mano: el boton y su hueco salen de --control-size-md y --gap-block, y
        // preguntarselos al layout es lo que impide que este numero se quede viejo si cambian.
        const full = el.offsetWidth + parseFloat(getComputedStyle(el).marginRight || 0);
        const width = canGoBack ? full : 0;

        if (prefersReducedMotion()) {
            gsap.set(el, shown);
            gsap.set(slot, { width });
            return;
        }
        gsap.to(el, { ...shown, duration: DURATION.fast, ease: EASE.emphasized, overwrite: 'auto' });
        gsap.to(slot, { width, duration: DURATION.fast, ease: EASE.emphasized, overwrite: 'auto' });
    }, [canGoBack]);

    /*Se reinicia cuando la modal ha TERMINADO de cerrarse, no al cerrarla: hacerlo antes dejaria ver
      el primer paso durante toda la animacion de salida.*/
    const reset = useCallback(() => {
        setStep(0);
        setPrevious(null);
        setName('');
        setSeedName('');
    }, []);

    // un tema es el par, no el color: dos entradas pueden compartir hex y leerse distinto
    const isActive = (theme) =>
        theme.hex.toLowerCase() === colorSeedHex.toLowerCase() && (theme.variant ?? variant) === variant;

    /*Un callback ref nuevo por render haria que React lo desmontara y volviera a montar en cada
      pasada; cacheados por id, el nodo se registra una vez y se queda.*/
    const registrars = useRef({});
    const register = (id) => (registrars.current[id] ??= (node) => { nodes.current[id] = node; });

    const content = useMemo(() => ({
        welcome: {
            title: welcomeTitle,
            body: (
                <Media>
                    <div
                        className="flex items-center justify-center"
                        style={{
                            width: MEDIA_HERO,
                            height: MEDIA_HERO,
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--md-sys-color-primary-container)',
                            color: 'var(--md-sys-color-on-primary-container)',
                        }}
                    >
                        {/*El icono del centro es un ReactNode, no un nombre: aqui es donde va el logo de
                           quien monte la libreria, que casi nunca es un Material Symbol.*/}
                        {icon ?? <Icon name="waving_hand" size="64px" />}
                    </div>
                </Media>
            ),
        },
        profile: {
            title: profileTitle,
            body: (
              <>
                <Media>
                    {/*`key` en la semilla para que cada cara sea un elemento nuevo y entre con su
                       propio fundido. Sin el, React reusaria el <img> y la imagen se cambiaria de
                       golpe debajo de una animacion que ya habria terminado.*/}
                    <Face key={avatarSeed}>
                        {/*Sin `shape`: el Avatar suelto es una imagen cuadrada y el circulo se pide con
                           borderRadius, que es lo que dice su propio comentario.*/}
                        <Avatar
                            seed={avatarSeed}
                            size={MEDIA}
                            alt={trimmed || 'Tu avatar'}
                            style={{ borderRadius: 'var(--radius-full)' }}
                        />
                    </Face>
                </Media>
                <div className="w-full">
                    <Input
                        label={nameLabel}
                        placeholder={namePlaceholder}
                        value={name}
                        onChange={setName}
                        autoComplete="name"
                    />
                </div>
              </>
            ),
        },
        color: {
            title: colorTitle,
            /*Cinco columnas que ocupan el ancho entero, y cada swatch tan grande como su columna.
              Envolviendo con un tamano fijo la rejilla medía 312px dentro de un panel de 376:
              sobraban 64px a la derecha que dejaban el bloque de colores sin alinear con el titulo,
              y ese hueco muerto era lo unico que se miraba en un paso que no tiene nada mas.
              Estirados, la rejilla es un bloque de la modal.*/
            body: (
                <div className="grid w-full grid-cols-5 gap-[var(--gap-group)]">
                    {THEMES_AVAILABLE.map((theme) => (
                        <SwatchButton
                            key={theme.name}
                            theme={theme}
                            size="100%"
                            selected={isActive(theme)}
                            onSelect={() => setColorSeedHex(theme.hex, theme.variant)}
                        />
                    ))}
                </div>
            ),
        },
        done: {
            title: trimmed ? `${doneTitle}, ${trimmed}` : doneTitle,
            body: (
                <Media>
                    <Face key={avatarSeed}>
                        <Avatar
                            seed={avatarSeed}
                            size={MEDIA_HERO}
                            alt={trimmed || 'Tu avatar'}
                            style={{ borderRadius: 'var(--radius-full)' }}
                        />
                    </Face>
                </Media>
            ),
        },
    }), [
        icon, welcomeTitle, profileTitle, nameLabel, namePlaceholder,
        colorTitle, doneTitle, avatarSeed, trimmed, name,
        THEMES_AVAILABLE, colorSeedHex, variant, setColorSeedHex,
    ]);

    // El saliente primero, para que el DOM cuente la misma historia que la animacion.
    const visible = previous === null ? [step] : [previous, step];

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            onCloseComplete={reset}
            triggerRef={triggerRef}
            className="w-[440px] p-[var(--gap-page)]"
        >
            <Button
                variant="ghost"
                iconOnly
                shape="pill"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-[12px] right-[12px]"
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            >
                <Icon name="close" size="lg" />
            </Button>

            {/*`relative` porque los pasos se flotan uno encima de otro durante el cruce.

               El recorte NO esta aqui: lo pone y lo quita `transitionStep`, que es el unico momento
               en que hace falta. Permanente se comia lo que sobresale de la caja de un hijo, y el
               swatch elegido sobresale 3px por lado - los de la primera columna llegaban al borde
               del viewport y se veian cortados de un lado.*/}
            <div
                ref={viewportRef}
                className="relative w-full"
                data-onboarding-viewport=""
            >
                {visible.map((index) => {
                    const id = STEPS[index];
                    return (
                        <div
                            key={id}
                            ref={register(id)}
                            role="group"
                            tabIndex={-1}
                            aria-label={id}
                            className="flex w-full flex-col items-start outline-none"
                            style={{ minHeight: STEPS_MIN_HEIGHT }}
                        >
                            <Title>{content[id].title}</Title>
                            {/*El titulo se queda clavado arriba y el cuerpo se centra en el hueco que
                               sobra. Con el alto fijo, el paso mas corto - el de los colores - dejaba
                               94px muertos entre los swatches y los botones, y todo el paso se leia
                               descolgado hacia arriba. Centrado, el hueco se reparte y ningun paso
                               parece a medio hacer.*/}
                            <div className="flex w-full flex-1 flex-col items-start justify-center gap-[var(--gap-block)]">
                                {content[id].body}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/*Los dos botones centrados como pareja. Lo que evita el salto lateral no es sacar uno del
               flujo, es que el hueco del de volver CREZCA con el: el <span> que lo contiene va de
               ancho 0 a su ancho natural en el mismo tween que lo enciende, asi que el de avanzar se
               desplaza a su nuevo centro acompanando la animacion en vez de brincar de un cuadro a
               otro.*/}
            <div className="mt-[var(--gap-page)] flex w-full items-center justify-center">
                <span ref={backSlotRef} className="flex overflow-hidden" style={{ width: 0 }}>
                    <Button
                        ref={backRef}
                        variant="default"
                        iconOnly
                        shape="pill"
                        onClick={goBack}
                        disabled={!canGoBack}
                        aria-label="Volver"
                        style={{
                            width: 'var(--control-size-md)',
                            height: 'var(--control-size-md)',
                            padding: 0,
                            marginRight: 'var(--gap-block)',
                            opacity: 0,
                            visibility: 'hidden',
                        }}
                        {...pressHandlers()}
                    >
                        <Icon name="arrow_back" size="lg" />
                    </Button>
                </span>

                <Button
                    variant="action"
                    iconOnly
                    shape="pill"
                    onClick={advance}
                    disabled={!canAdvance}
                    aria-label={isLast ? 'Terminar' : 'Continuar'}
                    style={{ width: 'var(--control-size-md)', height: 'var(--control-size-md)', padding: 0 }}
                    {...pressHandlers()}
                >
                    {/*Un span propio para el glifo: FabButton pintaria su Icon por dentro y no
                       dejaria cruzarlo, y el cruce es justo lo que hay que animar aqui.*/}
                    <span ref={glyphRef} className="flex">
                        <Icon name={glyph} size="lg" />
                    </span>
                </Button>
            </div>
        </CustomModal>
    );
}


function Title({ children }) {
    return (
        <h2
            className="mott-headline-large mott-title-emphasis"
            /*El hueco de la derecha es el de la X, que ahora comparte linea con el titulo: sin el,
              un titulo largo se metería por debajo del boton de cerrar.*/
            style={{ color: 'var(--md-sys-color-on-surface)', margin: 0, paddingRight: 'var(--control-size-sm)' }}
        >
            {children}
        </h2>
    );
}


/*Todo lo que es "la imagen del paso" se centra, y con el mismo hueco por debajo. Es la unica cosa de
  la modal que no se alinea a la izquierda con el resto, porque es la que se mira primero.*/
/*Una cara que llega. No hay corte: la nueva entra desde medio transparente y un pelo mas pequena,
  que a este tamano se lee como un enfoque y no como un cambio de imagen. Junto con la espera de
  SETTLE, el paso del nombre pasa de encadenar destellos a hacer un solo movimiento suave.*/
function Face({ children }) {
    const ref = useRef(null);

    useGSAP(() => {
        if (!ref.current) return;
        const landed = { autoAlpha: 1, scale: 1 };
        if (prefersReducedMotion()) {
            gsap.set(ref.current, landed);
            return;
        }
        gsap.fromTo(ref.current, { autoAlpha: 0.25, scale: 0.94 }, {
            ...landed,
            duration: DURATION.slow,
            ease: EASE.standard,
        });
    }, { scope: ref });

    return <div ref={ref} className="flex">{children}</div>;
}

function Media({ children }) {
    return <div className="flex w-full justify-center py-[var(--gap-group)]">{children}</div>;
}
