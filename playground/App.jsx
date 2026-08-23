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
import Progress from '../src/loading/progress.jsx';
import Dropdown from '../src/dropdown/dropdown.jsx';
import CustomModal from '../src/customModal/customModal.jsx';
import { anchoredAnimation } from '../src/animations/modalAnimation.js';
import Navbar from '../src/navbar/navbar.jsx';
import DragScroll from '../src/dragScroll/dragScroll.jsx';
import { useTheme } from '../src/theme/themeContext.jsx';
import ThemeModal from '../src/themeModal/themeModal.jsx';

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
      <p
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          color: 'var(--md-sys-color-on-surface-variant)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-caps)',
        }}
      >
        {title}
      </p>
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
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--md-sys-color-on-surface-variant)' }}>{role}</span>
    </div>
  );
}

function ThemeDemo() {
  const { colorSeedHex, variant, mode, resolvedMode } = useTheme();
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)' }}>
        El modal es el único sitio desde el que se elige tema. Cada swatch lleva su color y su
        variante: el neutro usa <code>monochrome</code>, que descarta el tono de la semilla y da un
        gris puro; rosa y azul usan <code>content</code>, que respeta el color de origen.
      </p>

      <Row>
        <Button ref={triggerRef} variant="action" onClick={() => setOpen(true)}>
          Abrir apariencia
        </Button>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)' }}>
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

function ScrollBox({ id, horizontal, dragScrollProps, children }) {
  return (
    <DragScroll
      id={id}
      axis={horizontal ? 'x' : 'y'}
      style={{
        height: horizontal ? 'auto' : 160,
        borderRadius: 'var(--radius-lg)',
        fontSize: 'var(--text-sm)',
        color: 'var(--md-sys-color-on-surface-variant)',
      }}
      {...dragScrollProps}
    >
      <div style={{ padding: 'var(--gap-block)' }}>{children}</div>
    </DragScroll>
  );
}

function Row({ children }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {children}
    </div>
  );
}

export default function App() {
  const [toasts, setToasts] = useState({ info: false, success: false, warning: false, danger: false });
  const toggleToast = (variant) => setToasts((t) => ({ ...t, [variant]: !t[variant] }));
  const [country, setCountry] = useState(null);
  const [progressValue, setProgressValue] = useState(30);
  const [searchLog, setSearchLog] = useState('(nada buscado todavía)');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [autoModalOpen, setAutoModalOpen] = useState(false);
  const dropdownTriggerRef = useRef(null);
  const customModalTriggerRef = useRef(null);
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
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      <h1
        style={{
          fontSize: 'var(--text-3xl)',
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

        <Section title="DragScroll — sin barra, se arrastra" wide>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Las barras de scroll están ocultas en toda la app. Estas cajas se arrastran con el mouse y
            siguen de largo al soltar (inercia). La rueda y el teclado funcionan igual que siempre. El
            degradado en el borde avisa que hay más contenido y se apaga al llegar al tope.
          </p>
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
                    fontSize: 'var(--text-sm)',
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
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)' }}>{searchLog}</p>
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

        <Section title="Loading">
          <Row>
            <Loading size="sm" color="primary" />
            <Loading size="md" color="danger" />
            <Loading size="lg" color="#7c3aed" />
          </Row>
        </Section>

        <Section title="Progress">
          <div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '0.5rem' }}>Indeterminado</p>
            <Progress color="primary" />
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '0.5rem' }}>Determinado ({progressValue}%)</p>
            <Progress color="success" value={progressValue} />
            <Row>
              <Button variant="default" onClick={() => setProgressValue((v) => Math.max(0, v - 10))}>-10</Button>
              <Button variant="default" onClick={() => setProgressValue((v) => Math.min(100, v + 10))}>+10</Button>
            </Row>
          </div>
        </Section>

        <Section title="Dropdown — sin backdrop">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Button ref={dropdownTriggerRef} variant="default" onClick={() => setDropdownOpen((o) => !o)}>
              Abrir dropdown
            </Button>
            <Dropdown
              open={dropdownOpen}
              onClose={() => setDropdownOpen(false)}
              triggerRef={dropdownTriggerRef}
              className="absolute top-full left-0 mt-1 w-[220px]"
            >
              <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface)', padding: '0.5rem' }}>Opción 1</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface)', padding: '0.5rem' }}>Opción 2</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface)', padding: '0.5rem' }}>Opción 3</span>
              </div>
            </Dropdown>
          </div>
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
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '0.5rem' }}>
                Modal personalizado
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '1rem' }}>
                Backdrop constante (igual en todas las modales), ancho puesto por el div de adentro, animación anclada junto al botón (AnchoredAnimation).
              </p>
              {Array.from({ length: 2 }, (_, i) => (
                <p key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '0.75rem' }}>
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
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '0.75rem' }}>
              ¿Eliminar el elemento?
            </h3>
            <Row>
              <Button variant="danger" onClick={() => setAutoModalOpen(false)}>Eliminar</Button>
              <Button variant="ghost" onClick={() => setAutoModalOpen(false)}>Cancelar</Button>
            </Row>
          </CustomModal>
        </Section>

        <Section title="Navbar — rail en desktop, barra inferior en mobile" wide>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Achicá la ventana por debajo de ~768px para ver el cambio de rail a barra inferior. El activo está
            controlado (simula la ruta actual) — reclickear el mismo ítem no lo deselecciona. Los dos triggers
            muestran las dos variantes del morph: el <strong>logo</strong> abre un pop up que se apoya encima y lo
            tapa (por eso no cambia de estilo: no se vería), y el <strong>engranaje</strong> abre una modal centrada
            que viaja hasta el medio de la pantalla (por eso sí se ilumina: ese botón queda a la vista).
          </p>
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
          />
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
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '0.5rem' }}>
                Modal centrada desde el nav
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '1rem' }}>
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
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '0.5rem' }}>
                Pop up desde el logo
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '1rem' }}>
                Se apoya encima del logo y lo tapa: el círculo se estira desde su propia esquina hasta
                convertirse en este panel. Por eso el logo no cambia de estilo al clickearlo — no se vería.
              </p>
              <Button variant="default" onClick={() => setLogoPopoverOpen(false)}>Cerrar</Button>
            </div>
          </CustomModal>
        </Section>

        <Section title="Toast — API imperativa con useToast()" wide>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)' }}>
            La forma recomendada de usar toasts: <code>{'<ToastProvider>'}</code> envuelve la app (acá está en
            main.jsx) y <code>useToast()</code> devuelve la API. El provider mantiene una cola, así que varios
            toasts seguidos se apilan; <code>showToast()</code> devuelve un id para cerrarlo a mano.
          </p>
          <ToastApiDemo />
        </Section>

        <Section title="Toast — uso declarativo (open / onClose)" wide>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Los toasts se renderizan en un stack fijo arriba a la derecha, no donde se los declara. Se
            cierran solos a los 5s —el contador se pausa si les pasás el mouse por encima o los
            arrastrás— o arrastrándolos hacia la derecha más de la mitad de su ancho.
          </p>
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
  );
}
