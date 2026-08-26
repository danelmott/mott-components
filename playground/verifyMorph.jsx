// Arnés desechable: monta el ButtonGroup real y se mide a sí mismo, para leer el resultado en una
// captura headless. Firefox headless no alimenta rAF a ritmo real, así que el reloj de GSAP se
// maneja a mano - con setTimeout los tweens se quedan en el cuadro 0 y todo falla por el arnés.
// La curva se muestrea sobre el propio tween con progress(), que es exacto y no depende del reloj.
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ThemeProvider } from '../src/theme/themeContext.jsx';
import ButtonGroup from '../src/buttons/buttonGroup.jsx';
import { MORPH_SCALE, PRESS_SCALE, pressHandlers, DURATION } from '../src/animations/motion.js';
import '../src/globals.css';

const ICONS = ['bluetooth', 'alarm', 'radio_button_unchecked', 'flashlight_on', 'wifi'];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const near = (a, b, tol = 0.05) => Math.abs(a - b) < tol;
const adv = (s) => gsap.globalTimeline.totalTime(gsap.globalTimeline.totalTime() + s);

// cubic-bezier(0.3,0,0.2,1) resuelto a mano, para comparar contra lo que de verdad pinta GSAP
const bez = (x1, y1, x2, y2) => {
    const X = (t) => 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t * t * x2 + t ** 3;
    const Y = (t) => 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t * t * y2 + t ** 3;
    return (x) => {
        let lo = 0, hi = 1, m = 0;
        for (let i = 0; i < 60; i++) { m = (lo + hi) / 2; if (X(m) < x) lo = m; else hi = m; }
        return Y((lo + hi) / 2);
    };
};
const easeMorph = bez(0.35, 0, 0.45, 1);

async function ready() {
    for (let i = 0; i < 100; i++) {
        const t = getComputedStyle(document.documentElement).getPropertyValue('--control-size-md').trim();
        if (t) return t;
        await wait(50);
    }
    return '(sin resolver)';
}

function Harness() {
    const refs = useRef([]);
    const [lines, setLines] = useState([]);

    useEffect(() => {
        const el = (i) => refs.current[i];
        const wc = (i) => getComputedStyle(el(i)).willChange;
        const w = (i) => el(i).getBoundingClientRect().width;
        const sc = (i) => Number(gsap.getProperty(el(i), 'scaleX'));
        const all = (fn) => ICONS.map((_, i) => fn(i));
        const push = (ok, text) => setLines((l) => [...l, { ok, text }]);
        const tween = (i) => gsap.getTweensOf(el(i)).find((t) => t.duration() > 0);
        // React no vacía el update de forma síncrona cuando el click() sale de una continuación
        // async; el ticker se duerme DESPUÉS, porque crear un tween lo despierta.
        const click = async (i) => { el(i).click(); await wait(60); gsap.ticker.sleep(); };
        const fire = (i, type) => el(i).dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true }));

        (async () => {
            const token = await ready();
            await Promise.race([document.fonts.ready, wait(1500)]);
            push(token === '56px', `--control-size-md = ${token}`);
            // La capa de estado es CSS, así que la prueba real es el DOM: que la utility haya
            // aterrizado en el botón y que su ::after exista con el fondo en currentColor.
            const box = getComputedStyle(el(0));
            const layer = getComputedStyle(el(0), '::after');
            push(box.position === 'relative' && box.isolation === 'isolate',
                `mott-state-layer aplicada: position ${box.position}, isolation ${box.isolation}`);
            push(layer.position === 'absolute' && layer.backgroundColor === box.color,
                `::after: position ${layer.position}, bg ${layer.backgroundColor} vs color ${box.color}  (currentColor)`);
            push(all(w).every((x) => near(x, 56)), `reposo: ${all(w).map((x) => x.toFixed(2)).join(' | ')}px  ·  will-change ${all(wc).join('/')}`);

            // ---- 1. parámetros del traspaso ----
            await click(1);
            const enter = tween(1);
            push(near(enter.duration(), DURATION.morph, 0.001) && near(enter.delay(), 0.03, 0.001),
                `entrante: duración ${enter.duration()}s, delay ${enter.delay()}s  (espera 0.3 / 0.03)`);

            // ---- 2. la curva, muestreada sobre el propio tween ----
            let worst = 0; const got = [];
            for (let p = 1; p <= 9; p++) {
                enter.progress(p / 10);
                const expected = 1 + (MORPH_SCALE - 1) * easeMorph(p / 10);
                got.push(sc(1));
                worst = Math.max(worst, Math.abs(sc(1) - expected));
            }
            push(worst < 0.002, `curva vs cubic-bezier(0.35,0,0.45,1): desvío máx ${(worst * 1000).toFixed(3)}‰  (espera < 2‰)`);
            push(true, `escala en p=0.1…0.9: ${got.map((v) => v.toFixed(3)).join(' ')}`);
            // con la curva vieja, p=0.25 daría ~0.078 de escala en vez de ~0.036
            enter.progress(0.25);
            push(true, `a un cuarto del tiempo va por ${((sc(1) - 1) / (MORPH_SCALE - 1) * 100).toFixed(1)}% del recorrido  (la vieja emphasized: 77.9%)`);
            /*Traza cuadro a cuadro: 18 muestras son los cuadros reales de un tween de 300ms a
              60fps. Interesa si el radio avanza parejo o a saltos - un escalonado en el arco es
              exactamente lo que se ve como temblor.*/
            const R = [], S = [];
            for (let f = 0; f <= 17; f++) {
                enter.progress(f / 17);
                R.push(parseFloat(el(1).style.borderRadius) * 0.56);   // % sobre 56px -> px
                S.push(Number(gsap.getProperty(el(1), 'scaleX')));
            }
            const steps = R.slice(1).map((v, i) => v - R[i]);
            const mono = steps.every((d) => d <= 0.00001);
            const plateaus = steps.filter((d) => Math.abs(d) < 0.001).length;
            push(mono, `radio monótono: ${mono}  ·  ${R[0].toFixed(2)}px -> ${R[17].toFixed(2)}px`);
            push(plateaus === 0, `cuadros sin avance de radio: ${plateaus} de 17`);
            push(true, `paso por cuadro (px): min ${Math.min(...steps.map(Math.abs)).toFixed(3)}  max ${Math.max(...steps.map(Math.abs)).toFixed(3)}`);
            push(true, `radio: ${R.filter((_, i) => i % 3 === 0).map((v) => v.toFixed(2)).join(' ')}`);
            const sSteps = S.slice(1).map((v, i) => (v - S[i]) * 56);
            push(true, `escala en px por cuadro: min ${Math.min(...sSteps).toFixed(3)}  max ${Math.max(...sSteps).toFixed(3)}  (negativo = retrocede)`);
            enter.progress(1);
            await click(3);

            // ---- 3. el traspaso: el saliente termina antes que el entrante ----
            const out = tween(1), ent = tween(3);
            push(near(out.duration(), DURATION.morph * 0.8, 0.001) && near(out.delay(), 0, 0.001),
                `saliente: duración ${out.duration().toFixed(3)}s, delay ${out.delay()}s  (espera 0.24 / 0)`);
            /*Nada de reloj de pared aquí: adv() mide contra el timeline global, y en headless el
              ticker da saltos al despertarse. Lo que define el traspaso son las llegadas, y esas
              se leen exactas del propio tween.*/
            const landsOut = out.delay() + out.duration();
            const landsIn = ent.delay() + ent.duration();
            push(near(landsOut, 0.24, 0.001) && near(landsIn, 0.33, 0.001),
                `aterrizajes: saliente ${(landsOut * 1000).toFixed(0)}ms, entrante ${(landsIn * 1000).toFixed(0)}ms  (${((landsIn - landsOut) * 1000).toFixed(0)}ms de traspaso)`);
            // y el comportamiento, poniendo cada tween en el mismo instante de pared
            out.time(0.25); ent.time(0.25 - ent.delay());
            push(out.progress() === 1 && ent.progress() < 1,
                `a 250ms de pared: saliente ${(out.progress() * 100).toFixed(0)}%, entrante ${(ent.progress() * 100).toFixed(0)}%  (el saliente ya soltó, el entrante sigue)`);
            adv(0.3);
            push(wc(1) === 'auto' && wc(3) === 'auto' && near(w(3), 62), `tras asentar: ${w(3).toFixed(2)}px, will-change ${wc(1)}/${wc(3)}`);

            // ---- 4. pulsado ----
            const base = MORPH_SCALE;           // el 3 está seleccionado
            fire(3, 'pointerdown'); await wait(40); gsap.ticker.sleep(); adv(0.15);
            push(near(sc(3), base * PRESS_SCALE, 0.002), `pulsado: escala ${sc(3).toFixed(4)}  (espera ${(base * PRESS_SCALE).toFixed(4)})`);
            fire(3, 'pointerup'); await wait(40); gsap.ticker.sleep(); adv(0.25);
            push(near(sc(3), base, 0.002), `soltado: escala ${sc(3).toFixed(4)}  (espera ${base.toFixed(4)})`);

            // ---- 5. la guarda del WeakSet: salir con el ratón SIN haber pulsado, con morph en curso ----
            await click(0);
            const running = tween(0);
            running.progress(0.4);
            const before = sc(0);
            pressHandlers(1).onPointerLeave({ currentTarget: el(0) });
            // near() y no ===: progress(0.4) se relee como 0.39999999999999997, porque GSAP lo
            // recalcula como _time/duration y 0.152/0.38 no es exacto en coma flotante.
            push(near(sc(0), before, 0.0001) && near(running.progress(), 0.4, 1e-9),
                `pointerleave sin pulsar a mitad de morph: escala ${sc(0).toFixed(4)} (era ${before.toFixed(4)}), tween al ${(running.progress() * 100).toFixed(0)}%`);
            adv(0.5);

            // ---- 6. clics encadenados: ninguna capa colgada ----
            await click(2); adv(0.05);
            await click(4); adv(0.05);
            await click(1); adv(0.6);
            push(all(wc).every((v) => v === 'auto'), `4 clics encadenados: will-change ${all(wc).join(' | ')}`);
            push(all(w).every((x, i) => near(x, i === 1 ? 62 : 56)), `anchos finales: ${all(w).map((x) => x.toFixed(2)).join(' | ')}  (espera 56|62|56|56|56)`);
        })().catch((err) => push(false, `EXCEPCIÓN: ${err && err.stack ? err.stack.split('\n').slice(0, 3).join(' // ') : err}`));
    }, []);

    return (
        <div style={{ padding: 24, fontFamily: 'monospace', color: 'var(--md-sys-color-on-surface)' }}>
            <div style={{ padding: 20, marginBottom: 20, background: 'var(--md-sys-color-surface-container)', width: 'fit-content' }}>
                <ButtonGroup
                    vertical={false}
                    variant="support"
                    buttons={ICONS.map((icon, i) => ({ id: icon, icon, buttonRef: (node) => { refs.current[i] = node; } }))}
                />
            </div>
            {lines.map((l, i) => (
                <div key={i} style={{ fontSize: 15, lineHeight: 1.9, color: l.ok ? '#0a7d3b' : '#c00' }}>
                    {l.ok ? 'PASS  ' : 'FAIL  '}{l.text}
                </div>
            ))}
            <div style={{ fontSize: 15, marginTop: 12, opacity: 0.6 }}>{lines.length} comprobaciones</div>
        </div>
    );
}

createRoot(document.getElementById('root')).render(
    <ThemeProvider defaultMode="light"><Harness /></ThemeProvider>
);
