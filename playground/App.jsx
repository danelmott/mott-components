import { useState } from 'react';
import DefaultModal from '../src/modals/defaultModal.jsx';
import Icon from '../src/icon/icon.jsx';
import Button from '../src/buttons/button.jsx';
import FabButton from '../src/buttons/fabButton.jsx';
import ButtonFullRounded from '../src/buttons/buttonFullRounded.jsx';
import ButtonGroup from '../src/buttons/buttonGroup.jsx';

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: '2rem' }}>
      <button className='w-[20px] h-auto bg-amber-50' onClick={() => setOpen(true)}>Abrir modal (test)</button>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
        <Button variant="primary">Iniciar sesión</Button>
        <Button variant="secondary">Continuar</Button>
        <Button variant="outline">Cancelar</Button>
        <Button variant="ghost">Omitir</Button>
        <Button variant="danger">Eliminar</Button>
        <Button variant="primary" disabled>Deshabilitado</Button>
        <Button variant="outline">
          <Icon name="favorite" size="sm" />
          Con ícono
        </Button>
      </div>
      <div style={{ marginTop: '1rem', maxWidth: 320 }}>
        <Button variant="secondary" fullWidth>Ancho completo</Button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
        <Button variant="outline">
          <Icon name="add" size="sm" />
          New task
        </Button>
        <Button variant="primary" shape="pill">Shape pill (viejo)</Button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
        <Button variant="ghost" iconOnly aria-label="Editar">
          <Icon name="edit" size="sm" />
        </Button>
        <Button variant="outline" iconOnly aria-label="Editar">
          <Icon name="edit" size="md" />
        </Button>
        <Button variant="primary" iconOnly aria-label="Editar">
          <Icon name="edit" size="lg" />
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
        <FabButton color="primary" icon="add" size="sm" aria-label="Nuevo (sm)" />
        <FabButton color="secondary" icon="edit" size="md" aria-label="Editar (md)" />
        <FabButton color="danger" icon="delete" size="lg" aria-label="Eliminar (lg)" />
        <FabButton color="#7c3aed" icon="star" size="md" aria-label="Color custom" />
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
        <ButtonFullRounded color="primary" icon="add" size="sm" aria-label="Nuevo" />
        <ButtonFullRounded color="secondary" icon="edit" size="md" aria-label="Editar" />
        <ButtonFullRounded color="danger" icon="delete" size="lg" aria-label="Eliminar" />
        <ButtonFullRounded color="#7c3aed" icon="star" size="md" aria-label="Color custom" />
      </div>

      <div style={{ marginTop: '1rem' }}>
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
      </div>
    </div>
  );
}
