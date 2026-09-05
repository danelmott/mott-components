/* Temporal: la modal de configuracion de verdad - sidebar a alto completo + tarjeta nitida. */
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
    for (let i = 0; i < 200; i++) { if (document.querySelector('dialog canvas')) break; await wait(50); }
    await wait(900);
    const dialog = document.querySelector('dialog');
    const panel = dialog.lastElementChild;
    const aside = dialog.querySelector('aside');
    const canvas = dialog.querySelector('canvas');
    const pr = panel.getBoundingClientRect();
    const ar = aside.getBoundingClientRect();
    const cr = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // con object-contain el arte ocupa el eje que limita: la caja es mas alta que ancha, asi que manda el ancho
    const arte = Math.min(cr.width, (cr.height * 440) / 600);
    const muestras = canvas.width / (arte * dpr);
    const out = [
        `${Math.abs(ar.top - pr.top) < 0.5 && Math.abs(ar.bottom - pr.bottom) < 0.5 ? 'PASS' : 'FAIL'}  sidebar a alto completo: panel ${pr.top}..${pr.bottom} · aside ${ar.top}..${ar.bottom}`,
        `${Math.abs(ar.left - pr.left) < 0.5 ? 'PASS' : 'FAIL'}  sidebar pegado al borde izquierdo: ${(ar.left - pr.left).toFixed(1)}px`,
        `${muestras > 1.5 ? 'PASS' : 'FAIL'}  tarjeta sobremuestreada: ${muestras.toFixed(2)} muestras por pixel de pantalla (backing ${canvas.width}x${canvas.height}, arte ${arte.toFixed(1)}px, dpr ${dpr})`,
        `caja de la tarjeta ${cr.width.toFixed(1)}x${cr.height.toFixed(1)} · panel ${pr.width}x${pr.height}`,
    ].join('\n');
    await fetch('http://127.0.0.1:8741/result', { method: 'POST', body: out });
})();

createRoot(document.getElementById('root')).render(
    <ThemeProvider defaultSeed="#6750A4" defaultMode="dark"><Harness /></ThemeProvider>
);
