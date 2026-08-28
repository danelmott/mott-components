'use client';
import { useCallback, useRef, useSyncExternalStore } from 'react';

/*Which modals are open, and in what order.

  The state lives on the MODULE and not in a provider, for the same reason `scrollLock.js` gives:
  two modals that need to know about each other can be declared in components that share nothing but
  the document. A provider would work only if every consumer remembered to mount it, and forgetting
  it would fail silently - the second modal would simply paint a second veil.

  The browser already does the hard part. A `<dialog>` opened with `showModal()` goes into the top
  layer, which stacks by call order, so the newest modal paints over the older ones, Escape only
  reaches the topmost one, and the older ones cannot be clicked. What the browser does NOT know is
  that each of our modals paints its own scrim: two open at once means the page is seen through two
  of them and goes visibly darker with every level. This registry exists to answer one question -
  "am I the top one?" - so everything below the top can switch its scrim off.*/

let seq = 0;
let layers = [];
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

export const nextLayerId = () => ++seq;

// Called right before `showModal()`, so the registry's order is the top layer's order and not
// React's render order, which for two modals opening in the same tick need not match.
export function pushLayer(id) {
    if (layers.includes(id)) return;
    layers = [...layers, id];
    emit();
}

export function popLayer(id) {
    if (!layers.includes(id)) return;
    layers = layers.filter((layer) => layer !== id);
    emit();
}

export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/*`useSyncExternalStore` compares snapshots by identity and re-renders until two agree, so this has
  to hand back the SAME array until something actually changes - building a fresh one per call is an
  infinite render loop, not a slow one.*/
export function getSnapshot() {
    return layers;
}

// Frozen and shared: on the server there is no modal open, and React demands a snapshot that is
// stable across calls or it throws during hydration.
const EMPTY = Object.freeze([]);
export function getServerSnapshot() {
    return EMPTY;
}

/*One modal's seat in the stack. `enter` / `leave` are called by CustomModal at the same two moments
  it locks and unlocks the page scroll, which is what keeps the registry honest.

  A modal that is not in the stack reports `isTop: true`. Closed, it is about to open on top of
  everything; that resting value is also what makes the hook safe for a lone modal that never nests.*/
export function useModalLayer() {
    const idRef = useRef(null);
    if (idRef.current === null) idRef.current = nextLayerId();
    const id = idRef.current;

    const stack = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const depth = stack.indexOf(id);
    const isTop = depth === -1 || depth === stack.length - 1;

    const enter = useCallback(() => pushLayer(id), [id]);
    const leave = useCallback(() => popLayer(id), [id]);

    return { id, depth, isTop, enter, leave };
}
