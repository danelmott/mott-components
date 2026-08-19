import { useRef, useState } from 'react';
import Icon from '../src/icon/icon.jsx';
import Button from '../src/buttons/button.jsx';
import FabButton from '../src/buttons/fabButton.jsx';
import ButtonFullRounded from '../src/buttons/buttonFullRounded.jsx';
import ButtonGroup from '../src/buttons/buttonGroup.jsx';
import Badge from '../src/badge/badge.jsx';
import Input from '../src/input/input.jsx';
import Textarea from '../src/textarea/textarea.jsx';
import Toast from '../src/toast/toast.jsx';
import Select from '../src/select/select.jsx';
import Search from '../src/search/search.jsx';
import Loading from '../src/loading/loading.jsx';
import Progress from '../src/loading/progress.jsx';
import Dropdown from '../src/dropdown/dropdown.jsx';
import CustomModal from '../src/customModal/customModal.jsx';
import { anchoredAnimation } from '../src/animations/modalAnimation.js';
import Navbar from '../src/navbar/navbar.jsx';

function Section({ title, wide, children }) {
  return (
    <section
      style={{
        columnSpan: wide ? 'all' : undefined,
        breakInside: 'avoid',
        backgroundColor: 'var(--off-white-background)',
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
          color: 'var(--muted-gray-text)',
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
  const dropdownTriggerRef = useRef(null);
  const customModalTriggerRef = useRef(null);
  const [activeRoute, setActiveRoute] = useState(0);
  const [logoActive, setLogoActive] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const logoButtonRef = useRef(null);

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      <h1
        style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 700,
          color: 'var(--dark-navy-text)',
          marginBottom: '1.5rem',
        }}
      >
        Mott Design Components — Playground
      </h1>

      <div
        style={{
          columnWidth: 320,
          columnGap: '1rem',
        }}
      >
        <Section title="Button — colores">
          <Row>
            <Button variant="primary">Iniciar sesión</Button>
            <Button variant="secondary">Continuar</Button>
            <Button variant="outline">Cancelar</Button>
            <Button variant="ghost">Omitir</Button>
            <Button variant="danger">Eliminar</Button>
            <Button variant="primary" disabled>Deshabilitado</Button>
          </Row>
        </Section>

        <Section title="Button — ícono, ancho completo, shape">
          <Row>
            <Button variant="outline">
              <Icon name="favorite" size="sm" />
              Con ícono
            </Button>
            <Button variant="primary" shape="pill">Shape pill</Button>
          </Row>
          <Button variant="secondary" fullWidth>Ancho completo</Button>
        </Section>

        <Section title="Button — iconOnly (sm / md / lg)">
          <Row>
            <Button variant="ghost" iconOnly aria-label="Editar">
              <Icon name="edit" size="sm" />
            </Button>
            <Button variant="outline" iconOnly aria-label="Editar">
              <Icon name="edit" size="md" />
            </Button>
            <Button variant="primary" iconOnly aria-label="Editar">
              <Icon name="edit" size="lg" />
            </Button>
          </Row>
        </Section>

        <Section title="FabButton">
          <Row>
            <FabButton color="primary" icon="add" size="sm" aria-label="Nuevo (sm)" />
            <FabButton color="secondary" icon="edit" size="md" aria-label="Editar (md)" />
            <FabButton color="danger" icon="delete" size="lg" aria-label="Eliminar (lg)" />
            <FabButton color="#7c3aed" icon="star" size="md" aria-label="Color custom" />
          </Row>
        </Section>

        <Section title="ButtonFullRounded">
          <Row>
            <ButtonFullRounded color="primary" icon="add" size="sm" aria-label="Nuevo" />
            <ButtonFullRounded color="secondary" icon="edit" size="md" aria-label="Editar" />
            <ButtonFullRounded color="danger" icon="delete" size="lg" aria-label="Eliminar" />
            <ButtonFullRounded color="#7c3aed" icon="star" size="md" aria-label="Color custom" />
          </Row>
        </Section>

        <Section title="ButtonGroup">
          <ButtonGroup
            color="secondary"
            buttons={[
              { icon: 'bluetooth' },
              { icon: 'alarm' },
              { icon: 'radio_button_unchecked' },
              { icon: 'flashlight_on' },
              { icon: 'wifi' },
            ]}
          />
        </Section>

        <Section title="Badge" wide>
          <Row>
            <Badge color="neutral">Neutral</Badge>
            <Badge color="info">Info</Badge>
            <Badge color="success">Success</Badge>
            <Badge color="warning">Warning</Badge>
            <Badge color="danger">Danger</Badge>
            <Badge color="neutral" solid>Neutral</Badge>
            <Badge color="info" solid>Info</Badge>
            <Badge color="success" solid>Success</Badge>
            <Badge color="warning" solid>Warning</Badge>
            <Badge color="danger" solid>Danger</Badge>
            <Badge color="success" dot>Activo</Badge>
            <Badge color="warning" icon="warning">Atención</Badge>
            <Badge color="#7c3aed">Color custom</Badge>
            <Badge color="info" size="sm">Small</Badge>
            <Badge color="info" size="md">Medium</Badge>
            <Badge color="info" size="lg">Large</Badge>
          </Row>
        </Section>

        <Section title="Input">
          <Input label="Correo" type="email" placeholder="Escribe tu correo" />
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
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--slate-gray-text)' }}>{searchLog}</p>
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
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--slate-gray-text)', marginBottom: '0.5rem' }}>Indeterminado</p>
            <Progress color="primary" />
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--slate-gray-text)', marginBottom: '0.5rem' }}>Determinado ({progressValue}%)</p>
            <Progress color="success" value={progressValue} />
            <Row>
              <Button variant="outline" onClick={() => setProgressValue((v) => Math.max(0, v - 10))}>-10</Button>
              <Button variant="outline" onClick={() => setProgressValue((v) => Math.min(100, v + 10))}>+10</Button>
            </Row>
          </div>
        </Section>

        <Section title="Dropdown — sin backdrop">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Button ref={dropdownTriggerRef} variant="outline" onClick={() => setDropdownOpen((o) => !o)}>
              Abrir dropdown
            </Button>
            <Dropdown
              open={dropdownOpen}
              onClose={() => setDropdownOpen(false)}
              triggerRef={dropdownTriggerRef}
              width="220px"
              className="absolute top-full left-0 mt-1"
            >
              <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dark-navy-text)', padding: '0.5rem' }}>Opción 1</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dark-navy-text)', padding: '0.5rem' }}>Opción 2</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dark-navy-text)', padding: '0.5rem' }}>Opción 3</span>
              </div>
            </Dropdown>
          </div>
        </Section>

        <Section title="CustomModal — anclada al botón">
          <Button ref={customModalTriggerRef} variant="primary" onClick={() => setCustomModalOpen(true)}>
            Abrir CustomModal
          </Button>
          <CustomModal
            open={customModalOpen}
            onClose={() => setCustomModalOpen(false)}
            triggerRef={customModalTriggerRef}
            animation={anchoredAnimation}
            width="26rem"
          >
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--dark-navy-text)', marginBottom: '0.5rem' }}>
              Modal personalizado
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--slate-gray-text)', marginBottom: '1rem' }}>
              Backdrop más claro, ancho fijo vía prop, animación anclada junto al botón (AnchoredAnimation).
            </p>
            <Button variant="outline" onClick={() => setCustomModalOpen(false)}>Cerrar</Button>
          </CustomModal>
        </Section>

        <Section title="Navbar — rail en desktop, barra inferior en mobile" wide>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--slate-gray-text)' }}>
            Achicá la ventana por debajo de ~768px para ver el cambio de rail a barra inferior. El activo está controlado
            (simula la ruta actual) — reclickear el mismo ítem no lo deselecciona. El logo tiene su propio estado
            `active`: togglea al clickearlo, y se apaga solo cuando elegís una ruta.
          </p>
          <Navbar
            color="primary"
            selected={activeRoute}
            onChange={(index) => {
              setActiveRoute(index);
              setLogoActive(false);
            }}
            logo={{
              active: logoActive,
              buttonRef: logoButtonRef,
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              ),
              onClick: () => {
                setLogoActive((a) => !a);
                setLogoModalOpen(true);
              },
            }}
            items={[
              { icon: 'home' },
              { icon: 'search' },
              { icon: 'favorite' },
              { icon: 'person' },
            ]}
          />
          <CustomModal
            open={logoModalOpen}
            onClose={() => setLogoModalOpen(false)}
            // el logo se mantiene activo durante todo el achique — así la modal aterriza sobre el
            // botón en el mismo estado del que salió, y recién ahí vuelve al default
            onCloseComplete={() => setLogoActive(false)}
            triggerRef={logoButtonRef}
            width="22rem"
          >
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--dark-navy-text)', marginBottom: '0.5rem' }}>
              Modal abierto desde el logo
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--slate-gray-text)', marginBottom: '1rem' }}>
              El `onClick` del logo puede hacer lo que quieras — acá togglea `active` y abre este modal, anclado a la posición real del botón.
            </p>
            <Button variant="outline" onClick={() => setLogoModalOpen(false)}>
              Cerrar
            </Button>
          </CustomModal>
        </Section>

        <Section title="Toast — semántico, arrastrable" wide>
          <Row>
            <Button variant="outline" onClick={() => toggleToast('info')}>Toggle info</Button>
            <Button variant="outline" onClick={() => toggleToast('success')}>Toggle success</Button>
            <Button variant="outline" onClick={() => toggleToast('warning')}>Toggle warning</Button>
            <Button variant="outline" onClick={() => toggleToast('danger')}>Toggle danger</Button>
          </Row>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 360 }}>
            <Toast variant="info" title="Info" open={toasts.info} onClose={() => toggleToast('info')}>
              Arrastrame o cerrame para probar la animación de salida.
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
          </div>
        </Section>
      </div>
    </div>
  );
}
