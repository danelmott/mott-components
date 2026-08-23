import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

/*The library's whole motion vocabulary lives here, mirrored one-for-one by the --duration-* and
  --ease-* custom properties in globals.css. Whatever is animated in JS reads these constants,
  whatever is animated in CSS reads the tokens, and both sides carry the same numbers - so a
  control whose colour is transitioned by CSS while its shape is tweened by GSAP still lands on
  the same frame instead of the two halves drifting apart.*/

export const DURATION = {
    instant: 0.12,
    fast: 0.2,
    base: 0.28,
    slow: 0.4,
    modal: 0.55,
};

/*`emphasized` is a fast head that settles slowly - right for a control answering a click, where
  leaving at speed IS the response. `exit` is the mirror, for anything actually leaving the screen:
  it lands at 4.25x the average speed, so never point it at something that has to come to rest.
  `inOut` is the one the modal morph rides: it starts and ends practically stationary (0.02x both
  ends) and spreads the journey evenly - half the distance at half the time, peaking at only 2.84x.
  That even split is what lets you watch a button stretch into a panel instead of just seeing it
  arrive.*/
export const EASE = {
    standard: CustomEase.create('mottStandard', '0.2, 0, 0, 1'),
    emphasized: CustomEase.create('mottEmphasized', '0.32, 0.72, 0, 1'),
    inOut: CustomEase.create('mottInOut', '0.65, 0, 0.35, 1'),
    exit: CustomEase.create('mottExit', '0.3, 0, 0.8, 0.15'),
};

/*Shared by every selection morph in the library - ButtonGroup, Navbar, the ThemeModal swatches.
  `overwrite: 'auto'` is the one that matters: useGSAP does not revert its context when the
  dependencies change, so without it a second click stacks a fresh tween on top of the one still
  running and the two write `transform` on the same frame from different start values. That fight
  is what made the controls tremble.*/
export const MORPH = {
    duration: DURATION.base,
    ease: EASE.emphasized,
    overwrite: 'auto',
    force3D: true,
};

/*GSAP interpolates border-radius as a complex string, and the start value it reads back from
  getComputedStyle is the full eight-value form. Handing it the one-value form ('28%') makes the
  two arities disagree, which is what turns a corner morph into a wobble - so always tween the
  long form. src/loading/loading.jsx already does this.*/
const longForm = (value) => `${value} ${value} ${value} ${value} / ${value} ${value} ${value} ${value}`;

export const CIRCLE_RADIUS = longForm('50%');

// Safe to read on demand: --control-radius is static, it does not change with the theme, so a
// one-shot read can never go stale the way a resolved colour would.
export const squircleRadius = () => longForm(
    (typeof document !== 'undefined'
        && getComputedStyle(document.documentElement).getPropertyValue('--control-radius').trim())
    || '28%'
);

/*Guarded because this module is evaluated on the server too: the components are 'use client' and
  only tween inside effects, but the import itself still runs during SSR.*/
export const prefersReducedMotion = () =>
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Collapses a duration to nothing when the user asked for less motion. The tween still runs, so
// onComplete/onDone fire exactly as before - the element just arrives on the first frame.
export const dur = (seconds) => (prefersReducedMotion() ? 0 : seconds);
