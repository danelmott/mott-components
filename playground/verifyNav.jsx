/*Segundo arnés: el mismo temblor, pero en Navbar y en los swatches de ThemeModal. Valen las mismas
  reglas del de ButtonGroup - rAF y las transiciones CSS están muertas en headless, así que el reloj
  de GSAP se mueve a mano y ningún color en transición se puede leer resuelto.

  Las dos pruebas de fondo son distintas porque las dos curas lo son:
  - Navbar saca la geometría a un pseudo-elemento, así que se comprueba que la caja del glifo sea
    IDÉNTICA en todos los cuadros del morph.
  - El bead del swatch se sigue escalando entero, y lo que se comprueba es la invariante de la
    contra-escala: bead × steady = 1 en todos los cuadros. Es lo mismo por otro camino - el glifo se
    repinta, pero siempre al mismo tamaño.*/
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ThemeProvider } from '../src/theme/themeContext.jsx';
import Navbar from '../src/navbar/navbar.jsx';
import ThemeModal from '../src/themeModal/themeModal.jsx';
import { morphAnimation } from '../src/animations/modalAnimation.js';
import { MORPH_SCALE, CIRCLE_PCT, DURATION } from '../src/animations/motion.js';
import '../src/globals.css';

const ITEMS = [
    { id: 'home', icon: 'home' },
    { id: 'search', icon: 'search' },
    { id: 'fav', icon: 'favorite' },
];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const near = (a, b, tol = 0.05) => Math.abs(a - b) < tol;
const matrixScale = (el) => Number(/matrix\(([-\d.]+)/.exec(getComputedStyle(el).transform)?.[1]) || 1;

async function ready() {
    for (let i = 0; i < 120; i++) {
        const t = getComputedStyle(document.documentElement).getPropertyValue('--control-size-md').trim();
        if (t && document.querySelector('.mott-swatch')) return t;
        await wait(50);
    }
    return '(sin resolver)';
}

function Harness() {
    const [lines, setLines] = useState([]);
    const push = (ok, text) => setLines((l) => [...l, { ok, text }]);

    useEffect(() => {
        (async () => {
            const token = await ready();
            await Promise.race([document.fonts.ready, wait(1500)]);
            push(token === '56px', `--control-size-md = ${token}`);

            // ================= NAVBAR =================
            // El nav se pinta dos veces (rail de desktop + barra mobile) y sólo una se ve: a 1500px
            // la visible es la primera. Por eso se consulta el DOM y no los buttonRef, que los
            // escribirían las dos copias y ganaría la escondida.
            const nav = document.querySelectorAll('nav')[0];
            const items = [...nav.querySelectorAll('button')];      // [0] es el logo
            const el = (i) => items[i];
            const cssVar = (i, name) => parseFloat(el(i).style.getPropertyValue(name));
            const r = (i) => cssVar(i, '--mott-morph-r');
            const sc = (i) => cssVar(i, '--mott-morph-scale');
            const before = (i) => getComputedStyle(el(i), '::before');
            const pill = (i) => 56 * matrixScale(el(i)) * (Number(/matrix\(([-\d.]+)/.exec(before(i).transform)?.[1]) || 1);
            const glyph = (i) => el(i).querySelector('.material-symbols-rounded').getBoundingClientRect();
            const box = (i) => el(i).getBoundingClientRect();
            const tween = (i) => gsap.getTweensOf(el(i)).find((t) => t.duration() > 0);
            const click = async (i) => { el(i).click(); await wait(60); gsap.ticker.sleep(); };

            push(items.length === 4, `nav visible: ${items.length} botones (logo + ${ITEMS.length})`);
            push(getComputedStyle(el(1)).backgroundColor === 'rgba(0, 0, 0, 0)' && before(1).zIndex === '-2'
                && before(1).backgroundColor !== 'rgba(0, 0, 0, 0)',
                `fondo en ::before: botón ${getComputedStyle(el(1)).backgroundColor} · ::before ${before(1).backgroundColor} z${before(1).zIndex}`);
            push([1, 2, 3].every((i) => r(i) === CIRCLE_PCT && sc(i) === 1),
                `items en reposo: r ${[1, 2, 3].map(r).join('/')} · escala ${[1, 2, 3].map(sc).join('/')}`);

            await click(2);
            const t = tween(2);
            push(near(t.duration(), DURATION.morph, 0.001) && near(t.delay(), DURATION.morph * 0.1, 0.001),
                `morph del item: duración ${t.duration()}s, delay ${t.delay().toFixed(3)}s  (espera 0.12 / 0.012)`);

            const FR = 7;
            const G = [], B = [];
            for (let f = 0; f <= FR; f++) {
                t.progress(f / FR);
                const g = glyph(2), b = box(2);
                G.push([g.left, g.top, g.width, g.height]);
                B.push([b.left, b.top, b.width, b.height]);
            }
            const same = (rows) => rows.every((v) => v.every((n, k) => Math.abs(n - rows[0][k]) < 0.001));
            push(same(G), `el glifo del nav NO se mueve en los ${FR + 1} cuadros: ${G[0].map((n) => n.toFixed(2)).join(', ')} → ${G[FR].map((n) => n.toFixed(2)).join(', ')}`);
            push(same(B), `su caja tampoco: ${B[0][2].toFixed(2)}×${B[0][3].toFixed(2)} → ${B[FR][2].toFixed(2)}×${B[FR][3].toFixed(2)}`);
            t.progress(1);
            push(near(pill(2), 62, 0.2) && near(box(2).width, 56, 0.2) && near(r(2), 28),
                `item elegido: pill ${pill(2).toFixed(2)}px sobre caja de ${box(2).width.toFixed(2)}px, r ${r(2)}`);

            /*Lo que la modal mide del trigger, preguntándoselo a la propia MorphAnimation con un
              panel de mentira. Es la parte que la mudanza del nav podía romper: la caja del item ya
              no crece con la selección aunque el pill sí, así que sin inflar, el clip arrancaría 3px
              por lado por dentro de lo que se ve. El radio tiene que salir con él: 28% de 62.*/
            const panel = document.createElement('div');
            Object.assign(panel.style, { position: 'fixed', left: '600px', top: '200px', width: '360px', height: '240px', padding: '24px' });
            document.body.appendChild(panel);
            const m = morphAnimation.measure(panel, el(2));
            panel.remove();
            push(near(m.originRect.width, 62, 0.2) && near(m.originRect.height, 62, 0.2),
                `la modal mide el pill y no la caja: ${m.originRect.width.toFixed(2)}×${m.originRect.height.toFixed(2)}  (la caja son ${box(2).width.toFixed(0)})`);
            push(near(m.buttonClip.radius, 0.28 * 62, 0.2),
                `y su radio sale escalado con él: ${m.buttonClip.radius.toFixed(2)}px  (28% de 62 = ${(0.28 * 62).toFixed(2)})`);

            // el logo comparte mecanismo
            const logoRest = { r: r(0), sc: sc(0) };
            push(logoRest.r === CIRCLE_PCT && logoRest.sc === 1, `logo en reposo: r ${logoRest.r} · escala ${logoRest.sc}`);

            // ================= SWATCH =================
            const beads = [...document.querySelectorAll('.mott-swatch')];
            const bead = (i) => beads[i];
            const steady = (i) => bead(i).querySelector('.mott-morph-steady');
            const mark = (i) => bead(i).querySelector('.material-symbols-rounded').getBoundingClientRect();
            push(beads.length > 1 && !!steady(0), `swatches: ${beads.length}, con capa de contra-escala ${!!steady(0)}`);

            bead(1).click();
            await wait(60); gsap.ticker.sleep();
            const bt = gsap.getTweensOf(bead(1)).find((x) => x.duration() > 0);
            push(!!bt && near(bt.duration(), DURATION.morph, 0.001), `morph del bead: duración ${bt.duration()}s`);

            /*La invariante. El check tiene su propia entrada (escala 0.6→1 mientras aparece), así
              que su caja SÍ cambia durante el tween - lo que no puede cambiar es el producto de las
              dos escalas, que es lo que decide a qué tamaño se rasteriza el glifo.*/
            const prods = [];
            for (let f = 0; f <= FR; f++) {
                bt.progress(f / FR);
                prods.push(Number(gsap.getProperty(bead(1), 'scaleX')) * matrixScale(steady(1)));
            }
            push(prods.every((p) => near(p, 1, 0.0005)),
                `bead × contra-escala = 1 en los ${FR + 1} cuadros: ${prods.map((p) => p.toFixed(4)).join(' ')}`);

            bt.progress(1);
            gsap.globalTimeline.totalTime(gsap.globalTimeline.totalTime() + 0.4);
            await wait(60);
            push(near(Number(gsap.getProperty(bead(1), 'scaleX')), MORPH_SCALE, 0.002)
                && near(matrixScale(steady(1)), 1 / MORPH_SCALE, 0.002),
                `elegido: bead ${Number(gsap.getProperty(bead(1), 'scaleX')).toFixed(4)} · steady ${matrixScale(steady(1)).toFixed(4)}  (espera ${MORPH_SCALE.toFixed(4)} / ${(1 / MORPH_SCALE).toFixed(4)})`);
            push(near(bead(1).getBoundingClientRect().width, 62, 0.2),
                `el bead sí crece: ${bead(1).getBoundingClientRect().width.toFixed(2)}px  (espera 62)`);
            /*Contra el tamaño natural del icono y no contra el del swatch en reposo: ahí el check
              está encogido a 0.6 por su propia entrada, que no es lo que se compara. Lo que prueba
              la contra-escala es que con el bead a 1.1071 el glifo se rasterice a --lg-icon exacto
              en vez de a --lg-icon × 1.1071, que es donde se le iba el hinteado.*/
            const natural = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--lg-icon'));
            const nowMark = mark(1);
            push(near(nowMark.width, natural, 0.05) && near(nowMark.height, natural, 0.05),
                `el check NO crece con él: ${nowMark.width.toFixed(2)}×${nowMark.height.toFixed(2)} con --lg-icon ${natural}px  (sin contra-escala serían ${(natural * MORPH_SCALE).toFixed(2)})`);
        })().catch((err) => push(false, `EXCEPCIÓN: ${err && err.stack ? err.stack.split('\n').slice(0, 3).join(' // ') : err}`));
    }, []);

    return (
        <div style={{ padding: 24, paddingLeft: 120, fontFamily: 'monospace', color: 'var(--md-sys-color-on-surface)' }}>
            <Navbar items={ITEMS} logo={{ icon: 'layers', label: 'Inicio' }} align="top" />
            <ThemeModal open onClose={() => { }} />
            <div style={{ marginTop: 420 }}>
                {lines.map((l, i) => (
                    <div key={i} style={{ fontSize: 15, lineHeight: 1.9, color: l.ok ? '#0a7d3b' : '#c00' }}>
                        {l.ok ? 'PASS  ' : 'FAIL  '}{l.text}
                    </div>
                ))}
                <div style={{ fontSize: 15, marginTop: 12, opacity: 0.6 }}>{lines.length} comprobaciones</div>
            </div>
        </div>
    );
}

createRoot(document.getElementById('root')).render(
    <ThemeProvider defaultMode="light"><Harness /></ThemeProvider>
);
