'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { buildPalette, DEFAULT_SEED, DEFAULT_VARIANT } from './palette.js';
import {
    isThemeSeed,
    isThemeMode,
    isThemeVariant,
    verifyTypesThemeVariant,
    verifyTypesThemeProvider,
    verifyTypesThemeSeed,
    verifyTypesThemeMode,
} from '../utils/verifyTypes.js';

const ThemeContext = createContext(null);

const DEFAULT_MODE = 'system';

const STORAGE_SEED = 'mott-theme-color';
const STORAGE_MODE = 'mott-theme-mode';
// The variant has to survive a reload alongside the seed. On its own a seed says nothing about what
// was meant by it: `#000000` is a wine red under `content` and pure greyscale under `monochrome`.
const STORAGE_VARIANT = 'mott-theme-variant';

// Every theme is built by the same recipe; the seed is the only thing that differs. `content` is
// what makes that possible for the neutral two, and the reason is worth writing down, because the
// obvious alternatives are the ones that failed.
//
// A grey has no hue: at chroma 0 the value HCT reports back is arbitrary. `neutral` and `tonalSpot`
// force a chroma onto whatever hue they are handed, so on a grey seed they take that arbitrary hue
// and make it visible — which is where the greenish grey and the wine-red black came from. `content`
// keeps the source chroma instead, so zero stays zero and no invented hue can surface. `#000000`
// therefore comes out as an actual black, tertiary included.
//
// The grey is the one seed that carries a deliberate hue: chroma 5 at 266°, a cool cast just short
// of perceptible. It is a chosen tint rather than an accident, which is the whole difference from
// the warm grey that preceded it — that one sat at 65° and pushed its tertiary into open green.
const THEMES_AVAILABLE = [
    { name: 'negro', hex: '#000000', variant: 'content' },
    { name: 'gris', hex: '#8E8E93', variant: 'content' },
    { name: 'rosa', hex: '#d97cb9', variant: 'content' },
    { name: 'azul', hex: '#005eeb', variant: 'content' },
];

// Reading storage is wrapped because it is not only about the value being absent: Safari in private
// mode, and any browser with site data blocked, throw on the access itself.
const readStored = (key, isValid) => {
    try {
        const stored = localStorage.getItem(key);
        return isValid(stored) ? stored : null;
    } catch {
        return null;
    }
};

//provider for the theme — mount it once at the top of the app (e.g. app/layout.jsx) and read it
//from any client component through `useTheme()`.
//
//It drives two things from the root element:
// - the palette, as `--md-sys-color-*` / `--md-custom-color-*` custom properties written inline.
//   These are the only colour tokens the library has, so changing the seed re-colours every
//   component; globals.css carries the same set as the no-JS default.
// - `data-theme`, which is what the stylesheet's own light/dark blocks key off for anyone who never
//   mounts this provider.
export function ThemeProvider({
    children,
    defaultSeed = DEFAULT_SEED,
    defaultMode = DEFAULT_MODE,
    themes = THEMES_AVAILABLE,
}) {
    verifyTypesThemeProvider({ defaultSeed, defaultMode, themes });

    // State starts from the props, never from localStorage. This module is `'use client'`, but Next
    // still renders it on the server to produce the initial HTML, and `localStorage` does not exist
    // there — reading it during render is a hard crash. What was stored is adopted on mount instead.
    const [colorSeedHex, setSeed] = useState(() => (isThemeSeed(defaultSeed) ? defaultSeed : DEFAULT_SEED));
    const [mode, setModeState] = useState(() => (isThemeMode(defaultMode) ? defaultMode : DEFAULT_MODE));
    const [variant, setVariantState] = useState(DEFAULT_VARIANT);
    const [systemDark, setSystemDark] = useState(false);
    // gate for the two effects below: until storage has been read, applying or persisting would
    // write the defaults over whatever the user had chosen on a previous visit
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        // the silent predicates, not the warning validators: a stale value left by an older build
        // is the provider's problem to drop, not something to scold the consumer about
        const storedSeed = readStored(STORAGE_SEED, isThemeSeed);
        const storedMode = readStored(STORAGE_MODE, isThemeMode);
        const storedVariant = readStored(STORAGE_VARIANT, isThemeVariant);

        if (storedSeed) setSeed(storedSeed);
        if (storedMode) setModeState(storedMode);
        if (storedVariant) setVariantState(storedVariant);
        setHydrated(true);
    }, []);

    // `system` follows the OS, so it has to keep following it: a media query read once goes stale
    // the moment the user flips their system theme with the app still open.
    useEffect(() => {
        const query = window.matchMedia('(prefers-color-scheme: dark)');
        const sync = (event) => setSystemDark(event.matches);

        setSystemDark(query.matches);
        query.addEventListener('change', sync);
        return () => query.removeEventListener('change', sync);
    }, []);

    // `system` is not a mode the palette knows about — it has to be resolved against the OS first.
    const resolvedMode = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

    // The exact same builder that baked the defaults into globals.css, so what the provider writes
    // at runtime is the same token set the stylesheet already declares — never a subset that leaves
    // stale values behind from the previous seed.
    const tokens = useMemo(() => buildPalette(colorSeedHex, resolvedMode, variant), [colorSeedHex, resolvedMode, variant]);

    useEffect(() => {
        if (!hydrated) return;

        const root = document.documentElement;

        // A theme change is a state change, not an animation. Every colour token sits behind some
        // component's `transition` (the button group crossfades background and colour for 400ms), so
        // writing a new palette would start that fade on every element at once and the new accent
        // would arrive late instead of being simply true. The attribute switches those transitions
        // off for exactly one frame; see the rule in globals.css.
        root.setAttribute('data-theme-switching', '');

        for (const [token, hex] of Object.entries(tokens)) {
            root.style.setProperty(token, hex);
        }

        // `mode` here, not `resolvedMode`: removing the attribute is precisely what hands control
        // back to the `prefers-color-scheme` media query already in globals.css. Pinning it to the
        // resolved value would silence that query and freeze the app on whatever the OS said once.
        if (mode === 'system') root.removeAttribute('data-theme');
        else root.dataset.theme = mode;

        // Forces the recalculation while the transitions are still off. Deferring this to a rAF
        // would NOT work: the two style changes would coalesce into one and the fade would run.
        void root.offsetHeight;
        root.removeAttribute('data-theme-switching');
    }, [tokens, mode, hydrated]);

    useEffect(() => {
        if (!hydrated) return;

        try {
            localStorage.setItem(STORAGE_SEED, colorSeedHex);
            localStorage.setItem(STORAGE_MODE, mode);
            localStorage.setItem(STORAGE_VARIANT, variant);
        } catch {
            // quota exceeded, or storage blocked: the theme still applies, it just will not survive
            // a reload. Not worth taking the app down for.
        }
    }, [colorSeedHex, mode, variant, hydrated]);

    // validated at the door because `argbFromHex` does not throw on a malformed string — it quietly
    // returns the wrong colour, so an unchecked value surfaces as a palette nobody can explain.
    // The variant rides along with the seed because the two are one choice, not two: picking a
    // swatch means "this colour, read this way". Left out, it falls back to the default rather than
    // keeping whatever the previous swatch used, which would reinterpret the new colour.
    const setColorSeedHex = useCallback((next, nextVariant = DEFAULT_VARIANT) => {
        if (!verifyTypesThemeSeed('useTheme', 'setColorSeedHex', next)) return;
        if (!verifyTypesThemeVariant('useTheme', 'setColorSeedHex', nextVariant)) return;

        setSeed(next);
        setVariantState(nextVariant);
    }, []);

    const setMode = useCallback((next) => {
        if (verifyTypesThemeMode('useTheme', 'setMode', next)) setModeState(next);
    }, []);

    const value = useMemo(() => ({
        colorSeedHex,
        setColorSeedHex,
        variant,
        mode,
        setMode,
        // what `system` currently resolves to — the theme actually on screen. Use it to pick the
        // icon on a toggle; `mode` is what the user chose, `resolvedMode` is what they see.
        resolvedMode,
        THEMES_AVAILABLE: themes,
    }), [colorSeedHex, setColorSeedHex, variant, mode, setMode, resolvedMode, themes]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            '[MOTT-COMPONENTS] useTheme() must be used inside a <ThemeProvider>. ' +
            'Wrap your app with <ThemeProvider> (e.g. in app/layout.jsx) before reading the theme.'
        );
    }

    return context;
}
