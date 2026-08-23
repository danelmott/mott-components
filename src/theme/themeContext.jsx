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
const STORAGE_VARIANT = 'mott-theme-variant';

const THEMES_AVAILABLE = [
    { name: 'black',  hex: '#000000', variant: 'content' },
    { name: 'grey',   hex: '#8E8E93', variant: 'content' },
    { name: 'purple', hex: '#a78bfa', variant: 'content' },
    { name: 'rose',   hex: '#d97cb9', variant: 'content' },
    { name: 'pink',   hex: '#ff6482', variant: 'content' },
    { name: 'red',    hex: '#ff5c5c', variant: 'content' },
    { name: 'blue',   hex: '#005eeb', variant: 'content' },
    { name: 'cyan',   hex: '#5ac8fa', variant: 'content' },
    { name: 'green',  hex: '#4CD964', variant: 'content' },
    { name: 'teal',   hex: '#2dd4bf', variant: 'content' },
];


const readStored = (key, isValid) => {
    try {
        const stored = localStorage.getItem(key);
        return isValid(stored) ? stored : null;
    } catch {
        return null;
    }
};

//   mounts this provider.
export function ThemeProvider({
    children,
    defaultSeed = DEFAULT_SEED,
    defaultMode = DEFAULT_MODE,
    themes = THEMES_AVAILABLE,
}) {
    verifyTypesThemeProvider({ defaultSeed, defaultMode, themes });
    const [colorSeedHex, setSeed] = useState(() => (isThemeSeed(defaultSeed) ? defaultSeed : DEFAULT_SEED));
    const [mode, setModeState] = useState(() => (isThemeMode(defaultMode) ? defaultMode : DEFAULT_MODE));
    const [variant, setVariantState] = useState(DEFAULT_VARIANT);
    const [systemDark, setSystemDark] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        const storedSeed = readStored(STORAGE_SEED, isThemeSeed);
        const storedMode = readStored(STORAGE_MODE, isThemeMode);
        const storedVariant = readStored(STORAGE_VARIANT, isThemeVariant);

        if (storedSeed) setSeed(storedSeed);
        if (storedMode) setModeState(storedMode);
        if (storedVariant) setVariantState(storedVariant);
        setHydrated(true);
    }, []);

    useEffect(() => {
        const query = window.matchMedia('(prefers-color-scheme: dark)');
        const sync = (event) => setSystemDark(event.matches);

        setSystemDark(query.matches);
        query.addEventListener('change', sync);
        return () => query.removeEventListener('change', sync);
    }, []);

    // `system` is not a mode the palette knows about — it has to be resolved against the OS first.
    const resolvedMode = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

    const tokens = useMemo(() => buildPalette(colorSeedHex, resolvedMode, variant), [colorSeedHex, resolvedMode, variant]);

    useEffect(() => {
        if (!hydrated) return;

        const root = document.documentElement;
        root.setAttribute('data-theme-switching', '');

        for (const [token, hex] of Object.entries(tokens)) {
            root.style.setProperty(token, hex);
        }

        if (mode === 'system') root.removeAttribute('data-theme');
        else root.dataset.theme = mode;
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
