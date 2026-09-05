/* Temporal: la tarjeta con varias identidades, en la caja que le da la modal (488x712). */
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../src/theme/themeContext.jsx';
import GeneratorGradientProfile from '../src/GeneratorGradientProfile/GeneratorGradientProfile.jsx';
import '../src/globals.css';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const PEOPLE = [
    { name: 'Ana Ruiz', email: 'ana@mott.dev' },
    { name: 'Danel Mantilla Palomino', email: 'mantillapalominodanel@gmail.com' },
    { name: 'Wolfgang Schmidt-Hernández', email: 'wolfgang.schmidt.hernandez@empresa-muy-larga.com' },
];

try {
    localStorage.removeItem('mott-theme-color');
    localStorage.removeItem('mott-theme-mode');
    localStorage.removeItem('mott-theme-variant');
} catch {}

/* El ResizeObserver no dispara en este headless (rAF muerto) y el CSS de vite llega tarde: unos
   renders forzados vuelven a correr el layout effect que mide. En un navegador de verdad de esto se
   encarga el observer. */
function Harness() {
    const [tick, setTick] = useState(0);
    useEffect(() => {
        if (tick < 6) {
            const id = setTimeout(() => setTick((t) => t + 1), 150);
            return () => clearTimeout(id);
        }
    }, [tick]);

    return (
        <div style={{ display: 'flex', gap: 16, padding: 16 }}>
            {PEOPLE.map((p) => (
                <div key={p.email} style={{ width: 488, height: 712, flexShrink: 0 }}>
                    <GeneratorGradientProfile name={p.name} email={p.email} fill />
                </div>
            ))}
        </div>
    );
}

window.addEventListener('error', (e) => {
    fetch('http://127.0.0.1:8741/result', { method: 'POST', body: `ERROR ${e.message}` });
});

(async () => {
    for (let i = 0; i < 200; i++) { if (document.querySelector('canvas')) break; await wait(50); }
    await wait(1200);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const t0 = performance.now();
    const lines = [...document.querySelectorAll('canvas')].map((c, i) => {
        const r = c.getBoundingClientRect();
        const muestrasPorPixel = c.width / (r.width * dpr);
        return `${muestrasPorPixel >= 1.9 ? 'PASS' : 'FAIL'}  tarjeta ${i}: css ${r.width.toFixed(1)}x${r.height.toFixed(1)} · backing ${c.width}x${c.height} · ${muestrasPorPixel.toFixed(2)} muestras por pixel de pantalla`;
    });
    const ctx = document.createElement('canvas').getContext('2d');
    const before = ctx.measureText('mm').width;
    ctx.letterSpacing = '0.5em';
    lines.push(`${ctx.measureText('mm').width > before ? 'PASS' : 'FAIL'}  letterSpacing soportado en este motor`);
    lines.push(`dpr ${window.devicePixelRatio} · lectura de rects en ${(performance.now() - t0).toFixed(1)}ms`);
    await fetch('http://127.0.0.1:8741/result', { method: 'POST', body: lines.join('\n') });
})();

createRoot(document.getElementById('root')).render(<ThemeProvider defaultSeed="#6750A4" defaultMode="dark"><Harness /></ThemeProvider>);
