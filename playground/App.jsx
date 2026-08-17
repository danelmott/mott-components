import { useState } from 'react';
import DefaultModal from '../src/modals/defaultModal.jsx';
import Icon from '../src/icon/icon.jsx';

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: '2rem' }}>
      <button className='w-[20px] h-auto' onClick={() => setOpen(true)}>Abrir modal (test)</button>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
        <Icon name="home" size="sm" />
        <Icon name="home" size="md" />
        <Icon name="home" size="lg" />
        <Icon name="favorite" size="lg" filled />
        <Icon name="settings" size="lg" />
        <Icon name="close" size="lg" weight={700} grade={-25} />
      </div>
    </div>
  );
}
