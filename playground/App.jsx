import { useRef, useState } from 'react';
import Icon from '../src/icon/icon.jsx';
import Button from '../src/buttons/button.jsx';
import FabButton from '../src/buttons/fabButton.jsx';
import ButtonGroup from '../src/buttons/buttonGroup.jsx';
import Input from '../src/input/input.jsx';
import Textarea from '../src/textarea/textarea.jsx';
import Toast from '../src/toast/toast.jsx';
import { useToast } from '../src/toast/toastContext.jsx';
import Select from '../src/select/select.jsx';
import Search from '../src/search/search.jsx';
import Loading from '../src/loading/loading.jsx';
import CustomModal from '../src/customModal/customModal.jsx';
import { anchoredAnimation } from '../src/animations/modalAnimation.js';
import Navbar from '../src/navbar/navbar.jsx';
import Shape from '../src/shapes/shapes.jsx';
import Avatar from '../src/avatars/avatars.jsx';
import Text, { TYPESCALE_ROLES } from '../src/text/text.jsx';
import { SHAPE_NAMES } from '../src/shapes/shapePaths.js';
import DragScroll from '../src/dragScroll/dragScroll.jsx';
import { useTheme } from '../src/theme/themeContext.jsx';
import ThemeModal from '../src/themeModal/themeModal.jsx';
import GeneratorGradientProfile from '../src/GeneratorGradientProfile/GeneratorGradientProfile.jsx';
import LoginModal from '../src/authModals/loginModal.jsx';
import RegisterModal from '../src/authModals/registerModal.jsx';
import OtpModal from '../src/authModals/otpModal.jsx';
import RecoverPasswordModal from '../src/authModals/recoverPasswordModal.jsx';
import OnboardingModal from '../src/onBoardingModal/onboardingModal.jsx';
import OptionsModal, { appearanceItem, feedbackItem, logoutItem } from '../src/optionsModal/optionsModal.jsx';

function Section({ title, wide, children }) {
  return (
    <section
      style={{
        columnSpan: wide ? 'all' : undefined,
        breakInside: 'avoid',
        backgroundColor: 'var(--md-sys-color-surface-container-low)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--pad-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}
    >
      <Text
        variant="label-medium"
        tone="muted"
        style={{ textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)' }}
      >
        {title}
      </Text>
      {children}
    </section>
  );
}

// imperative API demo: the provider owns the queue, so consecutive showToast calls stack up
function ToastApiDemo() {
  const { showToast, info, success, warning, danger, closeToast, closeAll } = useToast();
  const lastIdRef = useRef(null);

  return (
    <>
      <Row>
        <Button variant="default" onClick={() => info({ title: 'Info', message: 'Un dato para tener en cuenta.' })}>
          info()
        </Button>
        <Button variant="default" onClick={() => success('Guardado')}>
          success() con string
        </Button>
        <Button variant="default" onClick={() => warning({ title: 'Atención', message: 'Revisá este dato.' })}>
          warning()
        </Button>
        <Button variant="default" onClick={() => danger({ title: 'Error', message: 'Algo salió mal.' })}>
          danger()
        </Button>
      </Row>
      <Row>
        <Button
          variant="support"
          onClick={() => {
            // four at once: they stack, and closing one makes the rest slide up via Flip
            info({ title: 'Uno', message: 'Primero de la tanda.' });
            success({ title: 'Dos', message: 'Segundo de la tanda.' });
            warning({ title: 'Tres', message: 'Tercero de la tanda.' });
            danger({ title: 'Cuatro', message: 'Cuarto de la tanda.' });
          }}
        >
          Disparar 4 juntos
        </Button>
        <Button
          variant="default"
          onClick={() => {
            lastIdRef.current = showToast({
              variant: 'info',
              title: 'Dura 15s',
              message: 'Este sobrevive a los de 5s. Cerralo con el botón de al lado.',
              duration: 15000,
            });
          }}
        >
          duration: 15000
        </Button>
        <Button variant="default" onClick={() => lastIdRef.current && closeToast(lastIdRef.current)}>
          closeToast(id)
        </Button>
        <Button variant="ghost" onClick={closeAll}>closeAll()</Button>
      </Row>
    </>
  );
}

// Cycles `mode` through system -> dark -> light. The `system` step is the one that matters: it is
// where ThemeProvider drops `data-theme` and hands control back to `prefers-color-scheme`.
const MODE_CYCLE = { system: 'dark', dark: 'light', light: 'system' };

function ThemeToggle() {
  const { mode, setMode, resolvedMode } = useTheme();

  return (
    <Button id="theme-toggle" variant="default" onClick={() => setMode(MODE_CYCLE[mode])}>
      Tema: {mode === 'system' ? `sistema (ahora ${resolvedMode})` : mode}
    </Button>
  );
}

// Reads straight from the generated `--md-sys-color-*` custom properties, so it only shows colour
// if the provider actually wrote them to the root.
function Swatch({ role }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-sm)',
          background: `var(--md-sys-color-${role})`,
          border: '1px solid var(--md-sys-color-outline-variant)',
        }}
      />
      <span style={{ font: 'var(--md-sys-typescale-body-small)', letterSpacing: 'var(--md-sys-typescale-body-small-tracking)', color: 'var(--md-sys-color-on-surface-variant)' }}>{role}</span>
    </div>
  );
}

function ThemeDemo() {
  const { colorSeedHex, variant, mode, resolvedMode } = useTheme();
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Text variant="body-medium" tone="muted">
        El modal es el único sitio desde el que se elige tema. Cada swatch lleva su color y su
        variante: el neutro usa <code>monochrome</code>, que descarta el tono de la semilla y da un
        gris puro; rosa y azul usan <code>content</code>, que respeta el color de origen.
      </Text>

      <Row>
        <Button ref={triggerRef} variant="action" onClick={() => setOpen(true)}>
          Abrir apariencia
        </Button>
        <span style={{ font: 'var(--md-sys-typescale-body-medium)', letterSpacing: 'var(--md-sys-typescale-body-medium-tracking)', color: 'var(--md-sys-color-on-surface-variant)' }}>
          semilla <strong>{colorSeedHex}</strong> · variante <strong>{variant}</strong> · modo{' '}
          <strong>{mode}</strong>{mode === 'system' && ` (${resolvedMode})`}
        </span>
      </Row>

      <Row>
        <Swatch role="primary" />
        <Swatch role="primary-container" />
        <Swatch role="secondary" />
        <Swatch role="tertiary" />
        <Swatch role="error" />
        <Swatch role="surface" />
        <Swatch role="outline" />
      </Row>

      <ThemeModal open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} />
    </>
  );
}

/*El menu de la cuenta. Vive en su propio componente por el mismo motivo que las demas demos con
  estado: el trigger necesita un ref y el abierto/cerrado un useState, y meterlos en App() los mezcla
  con los de las otras veinte secciones.*/
function OptionsDemo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState('(nada elegido todavía)');
  const avatarRef = useRef(null);

  return (
    <>
      <Row>
        {/*El trigger es el boton, no el Avatar: `triggerRef` quiere el nodo del que sale el morph, y
           el panel tiene que apoyarse sobre toda la pastilla, no sobre la imagen.*/}
        <button
          ref={avatarRef}
          type="button"
          onClick={() => setOpen(true)}
          className="mott-state-layer flex cursor-pointer items-center gap-[var(--gap-group)] rounded-[var(--radius-full)] border-0 bg-[var(--md-sys-color-surface-container)] p-1 pr-4"
        >
          <Avatar seed="danel" shape="cookie" size="40px" />
          <span className="mott-label-large" style={{ color: 'var(--md-sys-color-on-surface)' }}>Danel</span>
        </button>

        <Text variant="body-small" tone="muted">{last}</Text>
      </Row>

      <OptionsModal
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={avatarRef}
        items={[
          { icon: 'settings', label: 'Configuración', onClick: () => setLast('Configuración') },
          { icon: 'refresh', label: 'Recargar App', onClick: () => setLast('Recargar App') },
          appearanceItem(),
          feedbackItem({ onClick: () => setLast('Dar Feedback') }),
          { icon: 'favorite', label: 'Buy me a coffee', onClick: () => setLast('Buy me a coffee') },
          logoutItem({ onClick: () => setLast('Cerrar Sesión') }),
        ]}
      />
    </>
  );
}

function ScrollBox({ id, horizontal, dragScrollProps, children }) {
  return (
    <DragScroll
      id={id}
      axis={horizontal ? 'x' : 'y'}
      style={{
        height: horizontal ? 'auto' : 160,
        borderRadius: 'var(--radius-lg)',
        font: 'var(--md-sys-typescale-body-medium)', letterSpacing: 'var(--md-sys-typescale-body-medium-tracking)',
        color: 'var(--md-sys-color-on-surface-variant)',
      }}
      {...dragScrollProps}
    >
      <div style={{ padding: 'var(--gap-block)' }}>{children}</div>
    </DragScroll>
  );
}

// The auth modals. Every field is controlled from here on purpose - that is the API, and this is
// what using it actually looks like: one useState per field, one handler that gets the value.
function AuthDemo() {
  const [screen, setScreen] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  // The recovery flow's own state. `recoverStep` lives out here because the modal does not hold it:
  // in a real app the code would go to the server and this would only move once it came back ok.
  const [recoverStep, setRecoverStep] = useState('code');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');

  const loginRef = useRef(null);
  const registerRef = useRef(null);
  const otpRef = useRef(null);
  const recoverRef = useRef(null);

  const close = () => { setScreen(null); setError(''); };

  // Every way in resets the flow to its first step, so it never reopens halfway through.
  const openRecover = () => {
    setError('');
    setCode('');
    setNewPassword('');
    setConfirmNew('');
    setRecoverStep('code');
    setScreen('recover');
  };

  
  return (
    <>
      <Row>
        <Button ref={loginRef} variant="action" onClick={() => setScreen('login')}>Iniciar sesión</Button>
        <Button ref={registerRef} variant="default" onClick={() => setScreen('register')}>Crear cuenta</Button>
        <Button ref={otpRef} variant="default" onClick={() => setScreen('otp')}>Verificar código</Button>
        <Button ref={recoverRef} variant="default" onClick={openRecover}>Recuperar contraseña</Button>
      </Row>

      <LoginModal
        open={screen === 'login'}
        onClose={close}
        triggerRef={loginRef}
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        error={error}
        onSubmit={() => setError(email && password ? '' : 'Completá los dos campos.')}
        onGoogle={() => setError('')}
        onForgotPassword={openRecover}
        onSwitch={() => { setError(''); setScreen('register'); }}
      />

      <RegisterModal
        open={screen === 'register'}
        onClose={close}
        triggerRef={registerRef}
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        confirmPassword={confirm}
        onConfirmPasswordChange={setConfirm}
        error={error}
        // the rule lives out here, not in the modal: the modal has no idea what this product
        // considers a valid password
        onSubmit={() => setError(password === confirm ? '' : 'Las contraseñas no coinciden.')}
        onGoogle={() => setError('')}
        onSwitch={() => { setError(''); setScreen('login'); }}
      />

      <OtpModal
        open={screen === 'otp'}
        onClose={close}
        triggerRef={otpRef}
        email={email || 'tucorreo@gmail.com'}
        code={code}
        onCodeChange={setCode}
        error={error}
        onSubmit={() => setError(code.length === 6 ? '' : 'El código va completo.')}
        onResend={() => { setCode(''); setError(''); }}
      />

      <RecoverPasswordModal
        open={screen === 'recover'}
        onClose={close}
        triggerRef={recoverRef}
        step={recoverStep}
        email={email || 'tucorreo@gmail.com'}
        code={code}
        onCodeChange={setCode}
        // This is the round trip the modal cannot make on its own: check the code, and only then
        // move the step. Here the check is the length; in an app it is the server.
        onVerifyCode={() => {
          if (code.length !== 6) return setError('El código va completo.');
          setError('');
          setRecoverStep('password');
        }}
        onResend={() => { setCode(''); setError(''); }}
        password={newPassword}
        onPasswordChange={setNewPassword}
        confirmPassword={confirmNew}
        onConfirmPasswordChange={setConfirmNew}
        // Saved: hand the user back to the login modal to enter with what they just set.
        onSubmitPassword={() => {
          if (!newPassword) return setError('Escribí una contraseña.');
          if (newPassword !== confirmNew) return setError('Las contraseñas no coinciden.');
          setError('');
          setPassword('');
          setScreen('login');
        }}
        error={error}
        onSwitch={() => { setError(''); setScreen('login'); }}
      />
    </>
  );
}

function Row({ children }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {children}
    </div>
  );
}


/*El onboarding se lleva su propio estado y su propio trigger: lo unico que hay que cablear desde
  fuera es abrirlo y recoger lo que devuelve al terminar.*/
function OnboardingDemo() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const { success } = useToast();

  return (
    <>
      <Button ref={triggerRef} variant="action" onClick={() => setOpen(true)}>
        Abrir onboarding
      </Button>
      <Text variant="body-small" tone="muted">
        Cuatro pasos, un solo boton. El paso del color se aplica al tema en vivo.
      </Text>
      <OnboardingModal
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        onComplete={({ name, avatarSeed, colorSeedHex }) => {
          success({ title: `Hola, ${name}`, message: `avatar "${avatarSeed}" · acento ${colorSeedHex}` });
        }}
      />
    </>
  );
}

export default function App() {
  const [toasts, setToasts] = useState({ info: false, success: false, warning: false, danger: false });
  const toggleToast = (variant) => setToasts((t) => ({ ...t, [variant]: !t[variant] }));
  const [country, setCountry] = useState(null);
  const [searchLog, setSearchLog] = useState('(nada buscado todavía)');
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [autoModalOpen, setAutoModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const customModalTriggerRef = useRef(null);
  const accountTriggerRef = useRef(null);
  const deleteTriggerRef = useRef(null);
  const [activeRoute, setActiveRoute] = useState(0);
  // The logo opens the anchored popover. It deliberately has no active state: the panel rests on top
  // and covers it, so the button only takes the click - restyling it would not be visible, and the
  // active state's `scale` would make it peek out from behind the panel.
  const [logoPopoverOpen, setLogoPopoverOpen] = useState(false);
  const logoButtonRef = useRef(null);
  // The gear opens the centred modal. That button does stay visible while the modal travels, so it
  // does get the click effect. It lives in its own state, separate from `gearModalOpen`, to switch off
  // only on `onCloseComplete`: the modal then lands on a still-active button and the colour does not jump.
  const [gearModalOpen, setGearModalOpen] = useState(false);
  const [gearActive, setGearActive] = useState(false);
  const gearButtonRef = useRef(null);
  // Navbar renders the same items twice (desktop rail plus mobile bar) and only one is visible: keep
  // the one that actually has a box, because the hidden one measures 0 and the morph would start from
  // an empty rect.
  const setGearTrigger = (node) => {
    if (node && node.offsetWidth > 0) gearButtonRef.current = node;
  };

  return (
    <>
      {/* The flex row is the OUTERMOST element here and carries neither padding nor gap, which is
         the whole reason the rail can sit flush against x=0. Padding on this row - which is where it
         used to be, on a `maxWidth: 1400` wrapper around everything, title included - is exactly
         what pushed the rail off the window edge; it belongs to the content column below instead,
         and a heading left outside that column is a heading that does not respect the rail's zone.
         Navbar is mounted once, live, as a flex-row sibling of the rest of the page - the exact
         pattern the README documents for app/layout.jsx. It deliberately sits OUTSIDE the masonry's
         `columnWidth` container further down: `position: sticky` and CSS multicol are a combination
         browsers do not implement consistently (Navbar's own <nav> is `sticky`, not `fixed`,
         precisely so it reserves flow space instead of floating - see src/navbar/navbar.jsx), so the
         rail needs to sit in a normal flow context, not a fragmented one. */}
      <div className="flex min-h-dvh">
        <Navbar
          selected={gearActive ? 4 : activeRoute}
          onChange={(index) => {
            if (index === 4) {
              setGearActive(true);
              setGearModalOpen(true);
            } else {
              setActiveRoute(index);
              setGearModalOpen(false);
            }
          }}
          logo={{
            buttonRef: logoButtonRef,
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            ),
            onClick: () => setLogoPopoverOpen(true),
          }}
          items={[
            { icon: 'home' },
            { icon: 'search' },
            { icon: 'favorite' },
            { icon: 'person' },
            { icon: 'settings', buttonRef: setGearTrigger },
          ]}
          /*La cuenta, anclada al fondo del rail. Sin `src` cae al avatar sembrado, que es lo que ve
            un usuario que todavía no subió foto. Como trae `options`, el nav monta el menú él mismo
            y lo abre desde esta foto: acá no hay estado ni ref que cablear.*/
          account={{
            seed: 'danel',
            alt: 'Danel',
            options: [
              { icon: 'settings', label: 'Configuración' },
              { icon: 'refresh', label: 'Recargar App' },
              appearanceItem(),
              feedbackItem({}),
              { icon: 'favorite', label: 'Buy me a coffee' },
              logoutItem({}),
            ],
          }}
        />
        {/* `minWidth: 0` so the multicol block below can actually shrink inside the flex item instead
           of forcing the row wider than the viewport - a flex item's default min-width is `auto`,
           which is its content's own natural width, and a wide masonry easily exceeds that. */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* The content column, and the only box with a gutter: the page's padding and its maximum
             width live here and never on the row. Everything inside it - the title included -
             scrolls away with the document while the rail stays put.

             Sin hueco por la izquierda y SIN centrar, las dos cosas por el mismo motivo. El rail ya
             trae 8px de padding por ese lado; sumarle los 32 del padding dejaba 40px de aire, y el
             `margin: 0 auto` anadia encima la mitad de todo lo que sobrara hasta los 1400 - en una
             pantalla de 1860 eso son 185px mas, y el rail acababa leyendose como algo suelto
             flotando lejos del contenido en vez de como la columna de la pagina. Con el tope de
             ancho anclado a la izquierda, la holgura se va entera al lado derecho, que es donde no
             molesta, y los 8px del rail son toda la separacion. */}
          <div style={{ padding: '2rem 2rem 2rem 0', maxWidth: 1400 }}>
            <h1
              style={{
                font: 'var(--md-sys-typescale-display-small)', letterSpacing: 'var(--md-sys-typescale-display-small-tracking)',
                fontWeight: 700,
                color: 'var(--md-sys-color-on-surface)',
                marginBottom: '1.5rem',
              }}
            >
              Mott Design Components — Playground
            </h1>

            <div style={{ marginBottom: '1.5rem' }}>
              <ThemeToggle />
            </div>

            <div
              style={{
                columnWidth: 320,
                columnGap: '1rem',
              }}
            >
              <Section title="ThemeProvider — paleta M3 + modo" wide>
                <ThemeDemo />
              </Section>

              <Section title="GeneratorGradientProfile — degradado desde el acento" wide>
                <Text variant="body-medium" tone="muted">
                  El degradado se genera con el seed del tema: cambia el swatch en «Apariencia» y la
                  tarjeta se recolorea.
                </Text>
                <GeneratorGradientProfile
                  name="Danel Mantilla Palomino"
                  email="mantillapalominodanel@gmail.com"
                />
              </Section>

              <Section title="DragScroll — sin barra, se arrastra" wide>
                <Text variant="body-medium" tone="muted">
                  Las barras de scroll están ocultas en toda la app. Estas cajas se arrastran con el mouse y
                  siguen de largo al soltar (inercia). La rueda y el teclado funcionan igual que siempre. El
                  degradado en el borde avisa que hay más contenido y se apaga al llegar al tope.
                </Text>
                <ScrollBox id="scroll-vertical">
                  <p style={{ fontWeight: 600, color: 'var(--md-sys-color-on-surface)', marginBottom: '0.5rem' }}>Vertical</p>
                  {Array.from({ length: 25 }, (_, i) => (
                    <p key={i} style={{ marginBottom: '0.5rem' }}>{i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.</p>
                  ))}
                </ScrollBox>

                <ScrollBox id="scroll-horizontal" horizontal>
                  <div style={{ display: 'flex', gap: '0.5rem', width: 'max-content', paddingBottom: '0.5rem' }}>
                    {Array.from({ length: 40 }, (_, i) => (
                      <span
                        key={i}
                        style={{
                          padding: 'var(--pad-badge-md)',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--md-sys-color-secondary-container)',
                          color: 'var(--md-sys-color-on-secondary-container)',
                          font: 'var(--md-sys-typescale-body-medium)', letterSpacing: 'var(--md-sys-typescale-body-medium-tracking)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Elemento {i + 1}
                      </span>
                    ))}
                  </div>
                </ScrollBox>

                <ScrollBox id="scroll-no-inertia" dragScrollProps={{ inertia: false, fade: false }}>
                  <p style={{ fontWeight: 600, color: 'var(--md-sys-color-on-surface)', marginBottom: '0.5rem' }}>
                    inertia={'{false}'} fade={'{false}'} — se arrastra pero frena al soltar, y sin degradado
                  </p>
                  {Array.from({ length: 25 }, (_, i) => (
                    <p key={i} style={{ marginBottom: '0.5rem' }}>{i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.</p>
                  ))}
                </ScrollBox>
              </Section>

              <Section title="Typescale — los 15 roles de M3 en DM Sans" wide>
                <Text variant="body-medium" tone="muted">
                  Cada rol dice <em>qué es</em> un texto, no qué tan grande: trae junto su tamaño, interlineado,
                  tracking y peso. La fuente se cambia en un solo lugar — <code>--md-ref-typeface-brand</code> y
                  <code>--md-ref-typeface-plain</code> — y los quince roles la siguen.
                </Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {TYPESCALE_ROLES.map((role) => (
                    <div
                      key={role}
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '1.5rem',
                        borderBottom: '1px solid var(--md-sys-color-surface-container-high)',
                        paddingBottom: '0.5rem',
                      }}
                    >
                      <Text
                        as="span"
                        variant="label-small"
                        tone="muted"
                        style={{ minWidth: '9rem', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {role}
                      </Text>
                      <Text as="span" variant={role}>
                        Cargá el sistema con una sola fuente
                      </Text>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Button — variantes semánticas">
                <Row>
                  <Button>Cancelar</Button>
                  <Button variant="action">Enviar</Button>
                  <Button variant="support">Continuar</Button>
                  <Button variant="danger">Eliminar</Button>
                  <Button variant="success">Aprobar</Button>
                  <Button variant="warning">Archivar</Button>
                  <Button variant="ghost">Omitir</Button>
                  <Button variant="action" disabled>Deshabilitado</Button>
                </Row>
              </Section>

              <Section title="Button — quiet (mismo significado, menos volumen)">
                <Row>
                  <Button variant="action">Enviar</Button>
                  <Button variant="action" quiet>Enviar</Button>
                </Row>
                <Row>
                  <Button variant="danger">Eliminar</Button>
                  <Button variant="danger" quiet>Eliminar</Button>
                </Row>
                <Row>
                  <Button variant="success">Aprobar</Button>
                  <Button variant="success" quiet>Aprobar</Button>
                </Row>
                <Row>
                  <Button variant="warning">Archivar</Button>
                  <Button variant="warning" quiet>Archivar</Button>
                </Row>
              </Section>

              <Section title="Button — ícono, ancho completo, shape">
                <Row>
                  <Button variant="default">
                    <Icon name="favorite" size="sm" />
                    Con ícono
                  </Button>
                  <Button variant="action" shape="pill">Shape pill</Button>
                </Row>
                <Button variant="support" fullWidth>Ancho completo</Button>
              </Section>

              <Section title="Button — iconOnly (sm / md / lg)">
                <Row>
                  <Button variant="ghost" iconOnly aria-label="Editar" >
                    <Icon name="edit" size="sm" />
                  </Button>
                  <Button variant="default" iconOnly aria-label="Editar">
                    <Icon name="edit" size="md" />
                  </Button>
                  <Button variant="action" iconOnly aria-label="Editar">
                    <Icon name="edit" size="lg" />
                  </Button>
                </Row>
              </Section>

              <Section title="FabButton">
                <Row>
                  <FabButton variant="action" icon="add" size="sm" aria-label="Nuevo (sm)" />
                  <FabButton variant="support" icon="edit" size="md" aria-label="Editar (md)" />
                  <FabButton variant="danger" icon="delete" size="lg" aria-label="Eliminar (lg)" />
                  <FabButton variant="success" icon="check" size="md" aria-label="Aprobar" />
                  <FabButton variant="danger" quiet icon="delete" size="md" aria-label="Eliminar (quiet)" />
                </Row>
              </Section>

              <Section title="ButtonGroup">
                <ButtonGroup
                  variant="support"
                  buttons={[
                    { icon: 'bluetooth' },
                    { icon: 'alarm' },
                    { icon: 'radio_button_unchecked' },
                    { icon: 'flashlight_on' },
                    { icon: 'wifi' },
                  ]}
                />
              </Section>


              <Section title="Input">
                <Input label="Correo" type="text" placeholder="Escribe tu correo" />
                <Input label="Contraseña" type="password" placeholder="Escribe tu contraseña" />
                <Input label="Deshabilitado" placeholder="No editable" disabled />
              </Section>

              <Section title="Textarea">
                <Textarea label="Mensaje" placeholder="Escribí tu mensaje" />
              </Section>

              <Section title="Search — debounce, listo para una API">
                <Search
                  label="Buscar"
                  placeholder="Escribí para buscar..."
                  delay={400}
                  onSearch={(query) => setSearchLog(query ? `Llamando a la API con: "${query}"` : '(nada buscado todavía)')}
                />
                <Text variant="body-medium" tone="muted">{searchLog}</Text>
              </Section>

              <Section title="Select">
                <Select
                  label="País"
                  placeholder="Elegí un país"
                  value={country}
                  onChange={setCountry}
                  options={[
                    { value: 'ar', label: 'Argentina' },
                    { value: 'mx', label: 'México' },
                    { value: 'co', label: 'Colombia' },
                    { value: 'cl', label: 'Chile' },
                    { value: 'pe', label: 'Perú' },
                  ]}
                />
              </Section>

              <Section title="Loading — las formas de M3 transformándose">
                <Text variant="body-medium" tone="muted">
                  El ciclo por defecto es <code>LOADER_SHAPES</code>: cookie de 20 puntas, cookie de 6, triángulo
                  y diamante. No hay corte entre forma y forma — cada contorno se mide como radio por ángulo y se
                  interpola, así que una se convierte en la otra de verdad. El giro va aparte, para que no se
                  pare en las pausas.
                </Text>
                <Row>
                  <Loading size="sm" color="primary" />
                  <Loading size="md" color="danger" />
                  <Loading size="lg" color="#7c3aed" />
                  <Loading size="120px" color="success" />
                </Row>
                <Text variant="body-medium" tone="muted">
                  Con <code>shapes</code> el ciclo es otro. Acá solo formas onduladas, que se transforman entre
                  sí de manera mucho más suave.
                </Text>
                <Row>
                  <Loading
                    size="lg"
                    color="secondary"
                    shapes={[{ name: 'flower', points: 5 }, { name: 'flower', points: 8 }, { name: 'cookie', points: 12 }]}
                  />
                </Row>
              </Section>

              <Section title="OptionsModal — el menú de la cuenta">
                <Text variant="body-medium" tone="muted">
                  El panel se despliega <strong>desde</strong> el propio botón y queda apoyado encima.
                  Todo el contenido sale de <code>items</code>, y <strong>Apariencia</strong> no cierra
                  el menú: abre el <code>ThemeModal</code> por encima y anclado a su propia fila, con el
                  menú atenuado debajo. Escape cierra solo la de arriba. Eso es la pila de modales del
                  repo, no cableado de esta demo.
                </Text>
                <OptionsDemo />
              </Section>

              <Section title="OnboardingModal">
                <OnboardingDemo />
              </Section>

              <Section title="CustomModal — anclada al botón">
                <Button ref={customModalTriggerRef} variant="action" onClick={() => setCustomModalOpen(true)}>
                  Abrir CustomModal
                </Button>
                <CustomModal
                  open={customModalOpen}
                  onClose={() => setCustomModalOpen(false)}
                  triggerRef={customModalTriggerRef}
                  animation={anchoredAnimation}
                >
                  {/* el ancho lo pone este div, no la modal: el panel se mide por su contenido */}
                  <div className="w-[23rem]">
                    <h3 style={{ font: 'var(--md-sys-typescale-title-large)', letterSpacing: 'var(--md-sys-typescale-title-large-tracking)', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '0.5rem' }}>
                      Modal personalizado
                    </h3>
                    <p style={{ font: 'var(--md-sys-typescale-body-medium)', letterSpacing: 'var(--md-sys-typescale-body-medium-tracking)', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '1rem' }}>
                      Backdrop constante (igual en todas las modales), ancho puesto por el div de adentro, animación anclada junto al botón (AnchoredAnimation).
                    </p>
                    {Array.from({ length: 2 }, (_, i) => (
                      <p key={i} style={{ font: 'var(--md-sys-typescale-body-medium)', letterSpacing: 'var(--md-sys-typescale-body-medium-tracking)', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '0.75rem' }}>
                        {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
                      </p>
                    ))}
                    <Button variant="default" onClick={() => setCustomModalOpen(false)}>Cerrar</Button>
                  </div>
                </CustomModal>

                <Button id="abrir-auto" variant="default" onClick={() => setAutoModalOpen(true)}>
                  Sin div — se adapta al contenido
                </Button>
                <CustomModal open={autoModalOpen} onClose={() => setAutoModalOpen(false)}>
                  {/* sin div de ancho: el panel mide lo que miden estos hijos y nada más */}
                  <h3 style={{ font: 'var(--md-sys-typescale-title-large)', letterSpacing: 'var(--md-sys-typescale-title-large-tracking)', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '0.75rem' }}>
                    ¿Eliminar el elemento?
                  </h3>
                  <Row>
                    <Button variant="danger" onClick={() => setAutoModalOpen(false)}>Eliminar</Button>
                    <Button variant="ghost" onClick={() => setAutoModalOpen(false)}>Cancelar</Button>
                  </Row>
                </CustomModal>
              </Section>

              <Section title="Modales anidadas — una encima de otra" wide>
                <Text variant="body-medium" tone="muted">
                  La de confirmación se declara DENTRO de la de ajustes y se apila encima. Escape y el clic
                  en el fondo cierran solo la de arriba; el fondo de la página no se oscurece el doble, y el
                  panel de abajo queda atenuado por el velo de la de arriba sin moverse de sitio.
                </Text>

                <Button ref={accountTriggerRef} variant="action" onClick={() => setAccountModalOpen(true)}>
                  Ajustes de la cuenta
                </Button>

                <CustomModal
                  open={accountModalOpen}
                  onClose={() => setAccountModalOpen(false)}
                  triggerRef={accountTriggerRef}
                >
                  <div className="w-[22rem] flex flex-col gap-[var(--gap-section)]">
                    <Text variant="title-large" as="h3">Ajustes de la cuenta</Text>
                    <Text variant="body-medium" tone="muted">
                      Nivel 1. Abrí la confirmación para ver cómo se apila la segunda encima de esta.
                    </Text>
                    <Row>
                      <Button ref={deleteTriggerRef} variant="danger" onClick={() => setConfirmDeleteOpen(true)}>
                        Eliminar cuenta
                      </Button>
                      <Button variant="ghost" onClick={() => setAccountModalOpen(false)}>Cerrar</Button>
                    </Row>

                    <CustomModal
                      open={confirmDeleteOpen}
                      onClose={() => setConfirmDeleteOpen(false)}
                      triggerRef={deleteTriggerRef}
                    >
                      <div className="w-[19rem] flex flex-col gap-[var(--gap-section)]">
                        <Text variant="title-large" as="h3">¿Eliminar la cuenta?</Text>
                        <Text variant="body-medium" tone="muted">
                          Nivel 2. Esto no se puede deshacer.
                        </Text>
                        <Row>
                          <Button variant="danger" onClick={() => { setConfirmDeleteOpen(false); setAccountModalOpen(false); }}>
                            Eliminar
                          </Button>
                          <Button variant="ghost" onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
                        </Row>
                      </div>
                    </CustomModal>
                  </div>
                </CustomModal>
              </Section>

              <Section title="Modales de auth — login, registro y OTP" wide>
                <Text variant="body-medium" tone="muted">
                  Los campos los controla quien usa la modal: un useState por campo y un handler que recibe el valor.
                  El correo y la contraseña se comparten entre login y registro acá a propósito, para que se vea que
                  el valor sobrevive al switch. El botón de Google sale del ícono nuevo, y es lo único de la librería
                  que no sigue el tema.
                </Text>
                <AuthDemo />
              </Section>

              <Section title="Shape — las 5 formas de M3" wide>
                <Text variant="body-medium" tone="muted">
                  El shape es un recorte, no un dibujo: el <code>clip-path</code> corta también a los children,
                  así que lo que va adentro toma la forma en vez de desbordarla. El color acepta un nombre del
                  tema o cualquier color CSS.
                </Text>
                <Row>
                  {SHAPE_NAMES.map((name) => (
                    <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Shape name={name} label={name}>
                        <Icon name="favorite" size="lg" />
                      </Shape>
                      <span style={{ font: 'var(--md-sys-typescale-body-small)', letterSpacing: 'var(--md-sys-typescale-body-small-tracking)', color: 'var(--md-sys-color-on-surface-variant)' }}>{name}</span>
                    </div>
                  ))}
                </Row>
              </Section>

              <Section title="Avatar — seeded, y recortado por cada shape" wide>
                <Text variant="body-medium" tone="muted">
                  El mismo <code>seed</code> dibuja siempre la misma cara, sin guardar nada en ningún lado. Acá está
                  el mismo seed pasado por las cinco formas: el avatar se corta con el contorno en vez de quedar
                  encima de él.
                </Text>
                <Row>
                  {SHAPE_NAMES.map((name) => (
                    <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Avatar seed="danel" shape={name} size="120px" />
                      <span style={{ font: 'var(--md-sys-typescale-body-small)', letterSpacing: 'var(--md-sys-typescale-body-small-tracking)', color: 'var(--md-sys-color-on-surface-variant)' }}>{name}</span>
                    </div>
                  ))}
                </Row>
                <Row>
                  {['ana', 'brenda', 'carlos', 'delfina', 'eze', 'flor'].map((seed) => (
                    <div key={seed} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Avatar seed={seed} shape="cookie" size="120px" />
                      <span style={{ font: 'var(--md-sys-typescale-body-small)', letterSpacing: 'var(--md-sys-typescale-body-small-tracking)', color: 'var(--md-sys-color-on-surface-variant)' }}>{seed}</span>
                    </div>
                  ))}
                </Row>
                <Row>
                  {['ana', 'brenda', 'carlos', 'delfina', 'eze', 'flor'].map((seed) => (
                    <Avatar key={seed} seed={seed} shape="flower" size="120px" />
                  ))}
                </Row>
              </Section>

              <Section title="Avatar — tamaños y sin forma" wide>
                <Text variant="body-medium" tone="muted">
                  Sin <code>shape</code> es una imagen cuadrada. Las fotos no se pueden seleccionar ni arrastrar: las
                  dos cosas dibujan el cuadrado que el recorte está tapando.
                </Text>
                <Row>
                  <Avatar seed="danel" size="sm" />
                  <Avatar seed="danel" size="md" />
                  <Avatar seed="danel" size="lg" />
                  <Avatar seed="danel" size="120px" />
                  <Avatar seed="danel" size="120px" style={{ borderRadius: 'var(--radius-full)' }} />
                </Row>
                <Row>
                  {['ana', 'brenda', 'carlos', 'delfina'].map((seed) => (
                    <Avatar key={seed} seed={seed} shape="diamond" size="120px" />
                  ))}
                </Row>
              </Section>

              <Section title="Shape — color, tamaño, points y rotate" wide>
                <Text variant="body-medium" tone="muted">
                  Los primeros cuatro siguen el tema (cambiá la semilla arriba y se repintan); el del hex crudo
                  no, y por eso su contenido hereda el color en vez de resolver uno legible solo.
                </Text>
                <Row>
                  <Shape name="cookie" color="primary" size="sm" />
                  <Shape name="cookie" color="secondary" size="md" />
                  <Shape name="cookie" color="success" size="lg" />
                  <Shape name="cookie" color="danger" size="120px" />
                  <Shape name="cookie" color="#7c3aed" size="120px" />
                </Row>
                <Row>
                  <Shape name="cookie" points={6} color="warning">
                    <span style={{ fontWeight: 700 }}>6</span>
                  </Shape>
                  <Shape name="cookie" points={20} color="warning">
                    <span style={{ fontWeight: 700 }}>20</span>
                  </Shape>
                  <Shape name="flower" points={5} color="secondary">
                    <span style={{ fontWeight: 700 }}>5</span>
                  </Shape>
                  <Shape name="flower" points={12} color="secondary">
                    <span style={{ fontWeight: 700 }}>12</span>
                  </Shape>
                  {/* la forma gira, el ícono de adentro no */}
                  <Shape name="triangle" rotate={30} color="primary">
                    <Icon name="north" size="lg" />
                  </Shape>
                  <Shape name="arch" rotate={180} color="primary">
                    <Icon name="north" size="lg" />
                  </Shape>
                </Row>
                <Row>
                  {/* la prueba de que el recorte agarra a los children: una imagen rectangular adentro */}
                  <Shape name="diamond" size="120px">
                    <img
                      src="https://picsum.photos/200"
                      alt=""
                      draggable={false}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none' }}
                    />
                  </Shape>
                  <Shape name="flower" size="120px">
                    <img
                      src="https://picsum.photos/201"
                      alt=""
                      draggable={false}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none' }}
                    />
                  </Shape>
                  <Shape name="arch" size="120px" color="secondary">
                    <span style={{ font: 'var(--md-sys-typescale-headline-large)', letterSpacing: 'var(--md-sys-typescale-headline-large-tracking)', fontWeight: 700 }}>DM</span>
                  </Shape>
                </Row>
              </Section>

              <Section title="Toast — API imperativa con useToast()" wide>
                <Text variant="body-medium" tone="muted">
                  La forma recomendada de usar toasts: <code>{'<ToastProvider>'}</code> envuelve la app (acá está en
                  main.jsx) y <code>useToast()</code> devuelve la API. El provider mantiene una cola, así que varios
                  toasts seguidos se apilan; <code>showToast()</code> devuelve un id para cerrarlo a mano.
                </Text>
                <ToastApiDemo />
              </Section>

              <Section title="Toast — uso declarativo (open / onClose)" wide>
                <Text variant="body-medium" tone="muted">
                  Los toasts se renderizan en un stack fijo arriba a la derecha, no donde se los declara. Se
                  cierran solos a los 5s —el contador se pausa si les pasás el mouse por encima o los
                  arrastrás— o arrastrándolos hacia la derecha más de la mitad de su ancho.
                </Text>
                <Row>
                  <Button variant="default" onClick={() => toggleToast('info')}>Toggle info</Button>
                  <Button variant="default" onClick={() => toggleToast('success')}>Toggle success</Button>
                  <Button variant="default" onClick={() => toggleToast('warning')}>Toggle warning</Button>
                  <Button variant="default" onClick={() => toggleToast('danger')}>Toggle danger</Button>
                </Row>
                <Toast variant="info" title="Info" open={toasts.info} onClose={() => toggleToast('info')}>
                  Arrastrame hacia la derecha para descartarme.
                </Toast>
                <Toast variant="success" title="Listo" open={toasts.success} onClose={() => toggleToast('success')}>
                  La operación se completó con éxito.
                </Toast>
                <Toast variant="warning" title="Atención" open={toasts.warning} onClose={() => toggleToast('warning')}>
                  Revisá este dato antes de continuar.
                </Toast>
                <Toast variant="danger" title="Error" open={toasts.danger} onClose={() => toggleToast('danger')}>
                  Algo salió mal, intentá de nuevo.
                </Toast>
              </Section>
            </div>
          </div>
        </div>
      </div>

      {/* centred modal from the gear: it travels to the middle, so the button stays visible and
          does get the click effect */}
      <CustomModal
        open={gearModalOpen}
        onClose={() => setGearModalOpen(false)}
        // the gear stays active for the whole shrink, so the modal lands on the button in the same
        // state it left from, and only then does it return to the default
        onCloseComplete={() => setGearActive(false)}
        triggerRef={gearButtonRef}
      >
        <div className="w-[19rem]">
          <h3 style={{ font: 'var(--md-sys-typescale-title-large)', letterSpacing: 'var(--md-sys-typescale-title-large-tracking)', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '0.5rem' }}>
            Modal centrada desde el nav
          </h3>
          <p style={{ font: 'var(--md-sys-typescale-body-medium)', letterSpacing: 'var(--md-sys-typescale-body-medium-tracking)', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '1rem' }}>
            El botón se transforma en la modal y viaja hasta el centro. Como queda a la vista, se ilumina
            al clickearlo y vuelve al default recién cuando la modal termina de plegarse encima.
          </p>
          <Button variant="default" onClick={() => setGearModalOpen(false)}>
            Cerrar
          </Button>
        </div>
      </CustomModal>

      {/* popover anchored to the logo: the same morph, but resting on top of the button itself
          instead of travelling to the centre of the screen */}
      <CustomModal
        open={logoPopoverOpen}
        onClose={() => setLogoPopoverOpen(false)}
        triggerRef={logoButtonRef}
        animation={anchoredAnimation}
      >
        <div className="w-[15rem]">
          <h3 style={{ font: 'var(--md-sys-typescale-title-large)', letterSpacing: 'var(--md-sys-typescale-title-large-tracking)', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '0.5rem' }}>
            Pop up desde el logo
          </h3>
          <p style={{ font: 'var(--md-sys-typescale-body-medium)', letterSpacing: 'var(--md-sys-typescale-body-medium-tracking)', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '1rem' }}>
            Se apoya encima del logo y lo tapa: el círculo se estira desde su propia esquina hasta
            convertirse en este panel. Por eso el logo no cambia de estilo al clickearlo — no se vería.
          </p>
          <Button variant="default" onClick={() => setLogoPopoverOpen(false)}>Cerrar</Button>
        </div>
      </CustomModal>
    </>
  );
}
