// Arnés desechable: monta el ButtonGroup real y se mide a sí mismo, para leer el resultado en una
// captura headless. Firefox headless no alimenta rAF a ritmo real, así que el reloj de GSAP se
// maneja a mano - con setTimeout los tweens se quedan en el cuadro 0 y todo falla por el arnés.
// La curva se muestrea sobre el propio tween con progress(), que es exacto y no depende del reloj.
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ThemeProvider } from '../src/theme/themeContext.jsx';
import ButtonGroup from '../src/buttons/buttonGroup.jsx';
import { MORPH_SCALE, PRESS_SCALE, CIRCLE_PCT, pressHandlers, DURATION } from '../src/animations/motion.js';
import '../src/globals.css';

const ICONS = ['bluetooth', 'alarm', 'radio_button_unchecked', 'flashlight_on', 'wifi'];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const near = (a, b, tol = 0.05) => Math.abs(a - b) < tol;
const adv = (s) => gsap.globalTimeline.totalTime(gsap.globalTimeline.totalTime() + s);

// cubic-bezier(0.35,0,0.45,1) resuelto a mano, para comparar contra lo que de verdad pinta GSAP
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
        // lo que GSAP escribe de verdad, no lo que creemos que escribe
        const cssVar = (i, name) => parseFloat(el(i).style.getPropertyValue(name));
        const r = (i) => cssVar(i, '--mott-morph-r');
        const sc = (i) => cssVar(i, '--mott-morph-scale');
        const shape = (i) => getComputedStyle(el(i), '::before');
        // ancho REAL de lo pintado: la caja del botón ya no crece, el pill sí
        const pill = (i) => 56 * (Number(/matrix\(([\d.]+)/.exec(shape(i).transform)?.[1]) || 1);
        const box = (i) => el(i).getBoundingClientRect();
        const glyph = (i) => el(i).querySelector('.material-symbols-rounded').getBoundingClientRect();
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

            // ---- 0. el reparto de capas: el fondo en ::before, la tinta en ::after, el texto suelto ----
            const own = getComputedStyle(el(0));
            const layer = getComputedStyle(el(0), '::after');
            push(own.backgroundColor === 'rgba(0, 0, 0, 0)' && shape(0).backgroundColor !== 'rgba(0, 0, 0, 0)',
                `fondo: botón ${own.backgroundColor} (transparente) · ::before ${shape(0).backgroundColor}`);
            push(shape(0).zIndex === '-2' && layer.zIndex === '-1' && own.isolation === 'isolate',
                `orden: ::before z${shape(0).zIndex} · ::after z${layer.zIndex} · isolation ${own.isolation}`);
            push(layer.backgroundColor === own.color, `::after tinta en currentColor: ${layer.backgroundColor} vs ${own.color}`);
            push(all((i) => r(i) === CIRCLE_PCT).every(Boolean) && all((i) => sc(i) === 1).every(Boolean),
                `reposo: r ${all(r).join('/')} · escala ${all(sc).join('/')}`);
            push(all((i) => near(box(i).width, 56)).every(Boolean), `cajas en reposo: ${all((i) => box(i).width.toFixed(2)).join(' | ')}px`);

            // ---- 1. parámetros del traspaso ----
            await click(1);
            const enter = tween(1);
            push(near(enter.duration(), DURATION.morph, 0.001) && near(enter.delay(), DURATION.morph * 0.1, 0.001),
                `entrante: duración ${enter.duration()}s, delay ${enter.delay().toFixed(3)}s  (espera 0.12 / 0.012)`);

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

            /*Traza cuadro a cuadro: 7 muestras son los cuadros reales de un tween de 120ms a 60fps.
              Interesa (a) que el radio avance parejo - un escalonado en el arco se ve como temblor -
              y (b) que el glifo NO se mueva ni un milipíxel, que es la prueba de fondo: si su caja
              es idéntica en los 14 cuadros no hay nada que rerasterizar y no hay de dónde temblar.*/
            const FR = 7;
            const R = [], S = [], G = [], B = [];
            for (let f = 0; f <= FR; f++) {
                enter.progress(f / FR);
                R.push(r(1) * 0.56);            // % sobre 56px -> px
                S.push(sc(1));
                const g = glyph(1), b = box(1);
                G.push([g.left, g.top, g.width, g.height]);
                B.push([b.left, b.top, b.width, b.height]);
            }
            const same = (rows) => rows.every((v) => v.every((n, k) => Math.abs(n - rows[0][k]) < 0.001));
            push(same(G), `el glifo NO se mueve en los ${FR + 1} cuadros: ${G[0].map((n) => n.toFixed(2)).join(', ')} → ${G[FR].map((n) => n.toFixed(2)).join(', ')}`);
            push(same(B), `la caja del botón tampoco: ${B[0][2].toFixed(2)}×${B[0][3].toFixed(2)} → ${B[FR][2].toFixed(2)}×${B[FR][3].toFixed(2)}  (crece lo pintado, no el layout)`);
            const steps = R.slice(1).map((v, i) => v - R[i]);
            const mono = steps.every((d) => d <= 0.00001);
            const plateaus = steps.filter((d) => Math.abs(d) < 0.001).length;
            push(mono && plateaus === 0, `radio monótono ${mono}, cuadros sin avance ${plateaus}/${FR}: ${R[0].toFixed(2)}px → ${R[FR].toFixed(2)}px`);
            push(true, `paso por cuadro (px de radio): min ${Math.min(...steps.map(Math.abs)).toFixed(3)}  max ${Math.max(...steps.map(Math.abs)).toFixed(3)}`);
            enter.progress(1);
            push(near(pill(1), 62, 0.2) && near(box(1).width, 56, 0.2),
                `al terminar: pill ${pill(1).toFixed(2)}px sobre una caja de ${box(1).width.toFixed(2)}px  (espera 62 / 56)`);
            await click(3);

            // ---- 3. el traspaso: el saliente termina antes que el entrante ----
            const out = tween(1), ent = tween(3);
            push(near(out.duration(), DURATION.morph * 0.8, 0.001) && near(out.delay(), 0, 0.001),
                `saliente: duración ${out.duration().toFixed(3)}s, delay ${out.delay()}s  (espera 0.096 / 0)`);
            const landsOut = out.delay() + out.duration();
            const landsIn = ent.delay() + ent.duration();
            push(near(landsOut, 0.096, 0.001) && near(landsIn, 0.132, 0.001),
                `aterrizajes: saliente ${(landsOut * 1000).toFixed(0)}ms, entrante ${(landsIn * 1000).toFixed(0)}ms  (${((landsIn - landsOut) * 1000).toFixed(0)}ms de traspaso, al empezar el día eran 330ms en total)`);
            out.time(0.11); ent.time(0.11 - ent.delay());
            push(out.progress() === 1 && ent.progress() < 1,
                `a 110ms de pared: saliente ${(out.progress() * 100).toFixed(0)}%, entrante ${(ent.progress() * 100).toFixed(0)}%  (el saliente ya soltó, el entrante sigue)`);
            adv(0.3);
            push(near(pill(3), 62, 0.2) && all((i) => i === 3 || near(pill(i), 56, 0.2)).every(Boolean),
                `tras asentar: pills ${all((i) => pill(i).toFixed(1)).join(' | ')}  (espera 56|56|56|62|56)`);

            // ---- 4. pulsado: ahora es el único que escribe transform en el botón ----
            fire(3, 'pointerdown'); await wait(40); gsap.ticker.sleep(); adv(0.15);
            const pressed = Number(gsap.getProperty(el(3), 'scaleX'));
            push(near(pressed, PRESS_SCALE, 0.002) && near(sc(3), MORPH_SCALE, 0.002),
                `pulsado: botón ${pressed.toFixed(4)} (espera ${PRESS_SCALE}) sin tocar la selección (${sc(3).toFixed(4)})`);
            fire(3, 'pointerup'); await wait(40); gsap.ticker.sleep(); adv(0.25);
            push(near(Number(gsap.getProperty(el(3), 'scaleX')), 1, 0.002), `soltado: botón ${Number(gsap.getProperty(el(3), 'scaleX')).toFixed(4)}  (espera 1)`);

            // ---- 5. la guarda del WeakSet: salir con el ratón SIN haber pulsado, con morph en curso ----
            await click(0);
            const running = tween(0);
            running.progress(0.4);
            const before = sc(0);
            pressHandlers().onPointerLeave({ currentTarget: el(0) });
            push(near(sc(0), before, 0.0001) && near(running.progress(), 0.4, 1e-9),
                `pointerleave sin pulsar a mitad de morph: escala ${sc(0).toFixed(4)} (era ${before.toFixed(4)}), tween al ${(running.progress() * 100).toFixed(0)}%`);
            adv(0.5);

            // ---- 6. clics encadenados: ningún tween colgado peleándose por la variable ----
            await click(2); adv(0.04);
            await click(4); adv(0.04);
            await click(1); adv(0.5);
            push(all((i) => gsap.getTweensOf(el(i)).length === 0).every(Boolean),
                `4 clics encadenados: tweens vivos ${all((i) => gsap.getTweensOf(el(i)).length).join('')}`);
            push(all((i) => near(pill(i), i === 1 ? 62 : 56, 0.2)).every(Boolean) && near(r(1), 28) && near(r(0), CIRCLE_PCT),
                `estado final: pills ${all((i) => pill(i).toFixed(1)).join(' | ')}  ·  radios ${all(r).join(' | ')}`);
            /*Que el rol llegue hasta ::before, comparándolo con el token resuelto en un elemento
              suelto. Ni sirve comparar los dos estados entre sí - con la semilla por defecto
              secondary-container y surface-container resuelven al mismo gris - ni pintar un color
              inventado y releerlo: la transición de ::before se quedaría en el cuadro 0, porque en
              headless el refresh driver está tan muerto como rAF.*/
            const resolve = (token) => {
                const probe = document.createElement('div');
                probe.style.backgroundColor = `var(${token})`;
                document.body.appendChild(probe);
                const v = getComputedStyle(probe).backgroundColor;
                probe.remove();
                return v;
            };
            const bgVar = (i) => getComputedStyle(el(i)).getPropertyValue('--mott-morph-bg').trim();
            const role = (t) => getComputedStyle(document.documentElement).getPropertyValue(t).trim();
            push(bgVar(1) === role('--md-sys-color-secondary-container') && bgVar(0) === role('--md-sys-color-surface-container'),
                `roles: elegido ${bgVar(1)} · reposo ${bgVar(0)}`);
            /*Y que ::before lo pinte. Solo se comprueba el de reposo: el del elegido está a mitad de
              su transición y en headless el refresh driver no la avanza nunca, así que su computed
              se queda en el color de partida. Lo que importa aquí es que ::before pinte el rol y no
              su fallback transparente.*/
            push(shape(0).backgroundColor === resolve('--md-sys-color-surface-container'),
                `::before pinta el rol: ${shape(0).backgroundColor} (surface-container ${resolve('--md-sys-color-surface-container')}, secondary-container ${resolve('--md-sys-color-secondary-container')})`);
            push(shape(0).transitionProperty === 'background-color' && shape(0).transitionDuration === '0.12s',
                `::before transiciona ${shape(0).transitionProperty} en ${shape(0).transitionDuration} ${shape(0).transitionTimingFunction}`);
        })().catch((err) => push(false, `EXCEPCIÓN: ${err && err.stack ? err.stack.split('\n').slice(0, 3).join(' // ') : err}`));
    }, []);

    return (
        <div style={{ padding: 24, fontFamily: 'monospace', color: 'var(--md-sys-color-on-surface)' }}>
            <div style={{ padding: 20, marginBottom: 20, background: 'var(--md-sys-color-surface)', width: 'fit-content' }}>
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
