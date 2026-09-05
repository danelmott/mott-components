import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../src/theme/themeContext.jsx';
import GeneratorGradientProfile from '../src/GeneratorGradientProfile/GeneratorGradientProfile.jsx';
import '../src/globals.css';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function Harness() {
    const [tick, setTick] = useState(0);
    useEffect(() => {
        if (tick < 6) { const id = setTimeout(() => setTick((t) => t + 1), 150); return () => clearTimeout(id); }
    }, [tick]);
    return (
        <div style={{ width: 488, height: 712 }}>
            <GeneratorGradientProfile name="Ana Ruiz" email="ana@mott.dev" fill />
        </div>
    );
}

(async () => {
    for (let i = 0; i < 200; i++) { if (document.querySelector('canvas')) break; await wait(50); }
    await wait(1800);
    const c = document.querySelector('canvas');
    const cs = getComputedStyle(c);
    const r = c.getBoundingClientRect();
    const out = [
        `attr style: ${c.getAttribute('style')}`,
        `computed: w ${cs.width} h ${cs.height} transform ${cs.transform} maxW ${cs.maxWidth} maxH ${cs.maxHeight} objectFit ${cs.objectFit} aspect ${cs.aspectRatio}`,
        `rect: ${r.width.toFixed(1)}x${r.height.toFixed(1)} · backing ${c.width}x${c.height}`,
        `dpr: ${window.devicePixelRatio}`,
        `parent rect: ${JSON.stringify(c.parentElement.getBoundingClientRect().toJSON())}`,
        `flex del canvas: grow ${cs.flexGrow} shrink ${cs.flexShrink} basis ${cs.flexBasis} · minW ${cs.minWidth} minH ${cs.minHeight}`,
        (() => { c.style.flex = 'none'; const rr = c.getBoundingClientRect(); return `con flex:none -> ${rr.width.toFixed(1)}x${rr.height.toFixed(1)}`; })(),
        (() => { c.style.flex = ''; c.parentElement.style.display = 'block'; const rr = c.getBoundingClientRect(); return `con padre display:block -> ${rr.width.toFixed(1)}x${rr.height.toFixed(1)}`; })(),
        (() => {
            const hits = [];
            for (const sheet of document.styleSheets) {
                let rules; try { rules = sheet.cssRules; } catch { continue; }
                for (const rule of rules) {
                    const t = rule.cssText || '';
                    if (/canvas|\*\s*,|^\*/.test(rule.selectorText || '')) hits.push(t.slice(0, 200));
                }
            }
            return `reglas que tocan canvas/*:\n  ${hits.slice(0, 12).join('\n  ')}`;
        })(),
        (() => {
            for (const sheet of document.styleSheets) sheet.disabled = true;
            const rr = c.getBoundingClientRect();
            for (const sheet of document.styleSheets) sheet.disabled = false;
            return `sin hojas de estilo -> ${rr.width.toFixed(1)}x${rr.height.toFixed(1)}`;
        })(),
    ].join('\n');
    await fetch('http://127.0.0.1:8741/result', { method: 'POST', body: out });
})();

createRoot(document.getElementById('root')).render(<ThemeProvider><Harness /></ThemeProvider>);
