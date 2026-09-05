/* Temporal: seccion "Cambiar contraseña" de la modal de settings. */
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../src/theme/themeContext.jsx';
import SettingsModal from '../src/settingsModal/settingsModal.jsx';
import { fadeAnimation } from '../src/animations/modalAnimation.js';
import '../src/globals.css';

try {
    localStorage.removeItem('mott-theme-color');
    localStorage.removeItem('mott-theme-mode');
    localStorage.removeItem('mott-theme-variant');
} catch {}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function Harness() {
    const ref = useRef(null);
    const [open, setOpen] = useState(false);
    useEffect(() => { setOpen(true); }, []);
    return (
        <>
            <button ref={ref} type="button">trigger</button>
            <SettingsModal
                open={open}
                onClose={() => {}}
                triggerRef={ref}
                animation={fadeAnimation}
                name="Danel Mantilla Palomino"
                email="mantillapalominodanel@gmail.com"
            />
        </>
    );
}

window.addEventListener('error', (e) => {
    fetch('http://127.0.0.1:8741/result', { method: 'POST', body: `ERROR ${e.message}` });
});

(async () => {
    for (let i = 0; i < 200; i++) { if (document.querySelector('dialog [role="tab"]')) break; await wait(50); }
    const tabs = [...document.querySelectorAll('dialog [role="tab"]')];
    tabs[1].click();
    await wait(200);
    await Promise.race([document.fonts.ready, wait(1500)]);
    await wait(400);
    const panel = document.querySelector('dialog').lastElementChild;
    const col = panel.querySelector('div.flex-1 > div');
    const pr = panel.getBoundingClientRect();
    const cr = col ? col.getBoundingClientRect() : null;
    const btn = [...document.querySelectorAll('dialog button')].find((b) => b.textContent.includes('Verificar'));
    const out = [
        `tab activa: ${tabs[1].getAttribute('aria-selected')}`,
        cr ? `columna ${cr.width.toFixed(0)}x${cr.height.toFixed(0)} dentro de panel ${pr.width}x${pr.height}` : 'columna NO encontrada',
        btn ? `boton "${btn.textContent.trim()}" ${btn.getBoundingClientRect().width.toFixed(0)}px de ancho` : 'boton NO encontrado',
        `desbordes: ${cr && (cr.height > pr.height) ? 'SI (columna mas alta que el panel)' : 'no'}`,
    ].join('\n');
    await fetch('http://127.0.0.1:8741/result', { method: 'POST', body: out });
})();

createRoot(document.getElementById('root')).render(
    <ThemeProvider defaultSeed="#6750A4" defaultMode="dark"><Harness /></ThemeProvider>
);
