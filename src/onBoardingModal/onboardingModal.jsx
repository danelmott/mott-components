'use client';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { twMerge } from 'tailwind-merge';
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

/*El alto minimo de un paso. Medidos, los cuatro dan 212 / 298 / 206 / 212 px: el del nombre es el
  mas alto porque carga con la cara y con el campo. A pantalla completa el pie ya esta clavado abajo,
  asi que este suelo no es lo que sujeta los botones - es lo que impide que el TITULO brinque de
  sitio de un paso a otro, porque el bloque va centrado en el hueco y sin suelo cada paso se
  centraria a su propia altura.

  `min-height` y no `height`: si alguien cambia los textos por unos que ocupen dos lineas, el paso
  crece en vez de quedar cortado. Se pierde el alto constante para ese caso concreto, que es mucho
  menos malo que perder contenido.*/
const STEPS_MIN_HEIGHT = 300;

/*Lo que se espera desde la ultima tecla hasta redibujar la cara. Es una pausa larga para un
  debounce, y es el punto: no se busca que reaccione rapido, se busca que cambie UNA vez.*/
const SETTLE = 500;

/*Tope del nombre. No es una regla de negocio - es tipografia: el paso final saluda con el nombre
  dentro del titulo, y a partir de aqui deja de caber en las dos lineas que se le permiten. El
  recorte con puntos suspensivos sigue estando por si el nombre son 24 caracteres anchos, pero con
  el tope se vuelve el caso raro en vez de lo normal.*/
const NAME_MAX = 24;

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
        /*`auto` y no un numero. El ancho al que se abre el hueco sale de --control-size-md y
          --gap-block, y medirlo a mano aqui no vale: dentro de un hueco de ancho 0 el boton no mide
          lo que ocupa sino lo que le dejan, y si el CSS todavia no ha llegado tampoco mide nada -
          las dos cosas dan 0, y el hueco se abre hasta quedarse cerrado con el boton dentro.
          GSAP resuelve `auto` midiendo el layout de verdad cuando el tween pinta su primer frame,
          que es despues de que el navegador haya hecho las cuentas.*/
        const width = canGoBack ? 'auto' : 0;

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
                        maxLength={NAME_MAX}
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
        /*Sin `onClose`. Es lo que cierra de golpe las dos salidas que CustomModal trae de serie:
          Escape y el clic en el velo son los dos `onClose?.()` de customModal.jsx, asi que sin la
          prop no hacen nada, y el `onCancel` del <dialog> ya trae su propio preventDefault para que
          el navegador no lo cierre por su cuenta. El onboarding se recorre entero o no se recorre -
          abandonarlo a la mitad deja la app sin nombre, sin cara y sin acento, porque `onComplete`
          solo se dispara al final. La unica salida es `advance()` en el ultimo paso.*/
        <CustomModal
            open={open}
            onCloseComplete={reset}
            triggerRef={triggerRef}
            /*`h-full` y no `h-dvh`. El alto de verdad lo pone ahora el <dialog>, que mide `100dvh`
              (ver `.default-modal` en globals.css); el panel solo tiene que copiarlo. Ponerle aqui
              su propio `dvh` era peor que no ponerle nada: el <dialog> seguia midiendo el viewport
              grande, el panel el pequeno, y el panel quedaba centrado dentro de una caja mas larga
              con velo sobrante por arriba y por abajo - justo el trozo al que se llegaba
              arrastrando. `overflow-hidden` cierra la puerta a cualquier scroll dentro del panel.

              Y el hueco de abajo sube los botones sobre el borde: 32px, mas lo que el sistema diga
              que ocupan su barra de gestos o su notch, que en un movil sin ese margen quedan justo
              debajo del dedo del sistema.*/
            className="h-full w-full max-w-none overflow-hidden rounded-none p-[var(--gap-block)] pb-[calc(var(--gap-page)+env(safe-area-inset-bottom))] md:p-[var(--gap-page)] md:pb-[calc(var(--gap-page)+env(safe-area-inset-bottom))]"
        >
            {/*La pantalla es completa; la columna no. Estirar el contenido a lo ancho de un monitor
               le daria al titulo una medida de linea imposible de leer y dejaria los dos botones a
               un metro de distancia del texto, asi que el contenido se queda en los 440px que ya
               tenia la modal y se centra. El padding del panel baja en mobile porque 32px por lado
               en una pantalla de 360 se comen el ancho util.*/}
            <div className="mx-auto flex h-full w-full max-w-[480px] flex-col">
                {/*Los pasos en el centro vertical y el pie abajo del todo: es lo que hace que se lea
                   como un onboarding de app nativa y no como una modal estirada, y de paso deja el
                   boton de avanzar donde llega el pulgar.

                   El scroll es la red para pantallas bajas - un movil en horizontal, o el teclado
                   abierto sobre el paso del nombre, que no encoge un <dialog> `fixed`. Sin el, un
                   paso con su suelo de 300px se saldria y `.default-modal` (overflow: hidden) lo
                   cortaria sin dejar forma de llegar al boton.

                   Y el padding con margen negativo que lo acompana existe porque `overflow-y: auto`
                   obliga al eje X a recortar tambien: el swatch elegido se sale 3px por lado, que es
                   justo el corte que ya sufrieron una vez los de las esquinas.*/}
                <div className="-mx-[6px] flex min-h-0 flex-1 items-center overflow-y-auto px-[6px]">
                    {/*`relative` porque los pasos se flotan uno encima de otro durante el cruce.

                       El recorte del cruce NO esta aqui: lo pone y lo quita `transitionStep`, que es
                       el unico momento en que hace falta.*/}
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
                                    className="flex w-full flex-col items-center outline-none"
                                    style={{ minHeight: STEPS_MIN_HEIGHT }}
                                >
                                    <Title clamp={id === 'done'}>{content[id].title}</Title>
                                    {/*El titulo se queda clavado arriba y el cuerpo se centra en el
                                       hueco que sobra. Con el alto fijo, el paso mas corto - el de
                                       los colores - dejaba 94px muertos debajo y se leia descolgado
                                       hacia arriba. Centrado, el hueco se reparte y ningun paso
                                       parece a medio hacer.*/}
                                    <div className="flex w-full flex-1 flex-col items-center justify-center gap-[var(--gap-block)]">
                                        {content[id].body}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/*Los dos botones centrados como pareja. Lo que evita el salto lateral no es sacar
                   uno del flujo, es que el hueco del de volver CREZCA con el: el <span> que lo
                   contiene va de ancho 0 a su ancho natural en el mismo tween que lo enciende, asi
                   que el de avanzar se desplaza a su nuevo centro acompanando la animacion en vez de
                   brincar de un cuadro a otro.*/}
                <div className="mt-[var(--gap-page)] flex w-full shrink-0 items-center justify-center">
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
                                /*Sin esto el boton NUNCA se ve: su hueco arranca con `width: 0` y
                                  como hijo flex de ese hueco se encoge hasta 0, asi que el
                                  `offsetWidth` con el que se mide el ancho al que abrirlo tambien
                                  vale 0 y el hueco se queda cerrado sobre si mismo.*/
                                flexShrink: 0,
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
            </div>
        </CustomModal>
    );
}


/*El titulo crece con la pantalla: 36px en movil y 45px de escritorio. Con el panel a pantalla
  completa el tamano anterior se quedaba pequeno en medio de tanto aire - y como cada paso no tiene
  mas texto que este, el titulo es la pieza que puede permitirse ser grande sin ensuciar nada.

  `clamp` es para el paso final, el unico titulo que lleva dentro algo escrito por el usuario: se
  corta en dos lineas con puntos suspensivos, y `anywhere` parte tambien un nombre de una sola
  palabra kilometrica en vez de dejar que se salga por el lado.*/
function Title({ children, clamp }) {
    return (
        <h2
            className={twMerge(
                'mott-display-small md:mott-display-medium mott-title-emphasis w-full text-center',
                clamp && 'line-clamp-2 [overflow-wrap:anywhere]',
            )}
            style={{ color: 'var(--md-sys-color-on-surface)', margin: 0 }}
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
