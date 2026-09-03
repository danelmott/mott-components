/* Temporal: dónde queda el botón de cuenta dentro del rail, en el playground de verdad. */
import { createRoot } from 'react-dom/client';
import { ToastProvider } from '../src/toast/toastContext.jsx';
import { ThemeProvider } from '../src/theme/themeContext.jsx';
import App from './App.jsx';
import '../src/globals.css';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    for (let i = 0; i < 200; i++) {
        if (document.querySelector('nav button')) break;
        await wait(50);
    }
    await wait(600);
    const rail = document.querySelectorAll('nav')[0];
    const buttons = [...rail.querySelectorAll('button')];
    const acc = buttons[buttons.length - 1];
    const wrap = acc.parentElement;
    const rr = rail.getBoundingClientRect(), ar = acc.getBoundingClientRect();
    const body = ar.bottom;
    const bodyCs = getComputedStyle(document.body);
    const logo = buttons[0].getBoundingClientRect();
    const arriba = logo.top - rr.top;
    const abajo = rr.bottom - ar.bottom;
    const msg = [
        `${Math.abs(abajo - 12) < 1 ? 'PASS' : 'FAIL'}  hueco bajo la cuenta: ${abajo.toFixed(1)}px (espera 12) · sobre el logo ${arriba.toFixed(1)}px`,
        `${wrap.getBoundingClientRect().height === 56 ? 'PASS' : 'FAIL'}  el contenedor mide el botón exacto: ${wrap.getBoundingClientRect().height}px (antes 62)`,
        `padding del rail: ${getComputedStyle(rail).paddingTop} / ${getComputedStyle(rail).paddingBottom}`,
        `viewport ${window.innerWidth}x${window.innerHeight}`,
        `nav: top ${rr.top} bottom ${rr.bottom} alto ${rr.height} · computed height ${getComputedStyle(rail).height} · padding ${getComputedStyle(rail).padding}`,
        `cuenta: top ${ar.top} bottom ${ar.bottom} · a ${(rr.bottom - ar.bottom).toFixed(1)}px del fondo del nav · a ${(window.innerHeight - body).toFixed(1)}px del fondo de la ventana`,
        `wrapper: margin ${getComputedStyle(wrap).margin} · alto ${wrap.getBoundingClientRect().height}`,
        `último item antes: bottom ${buttons[buttons.length - 2].getBoundingClientRect().bottom}`,
    ].join('\n');
    await fetch('http://127.0.0.1:8741/result', { method: 'POST', body: msg });
})();

createRoot(document.getElementById('root')).render(
    <ThemeProvider><ToastProvider><App /></ToastProvider></ThemeProvider>
);
