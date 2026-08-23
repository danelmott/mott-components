'use client';
import { useMemo } from 'react';
import { Style, Avatar as Dicebear } from '@dicebear/core';
import critters from '@dicebear/styles/critters.json' with { type: 'json' };
import Shape from '../shapes/shapes.jsx';
import { verifyTypesAvatar } from '../utils/verifyTypes.js';

const SIZE_TOKEN = {
    sm: 'var(--control-size-sm)',
    md: 'var(--control-size-md)',
    lg: 'var(--control-size-lg)',
};

/*The look of the default avatar. Every one of these is a real critters option - DiceBear derives the
  option names from the style definition itself (`${component}Variant`, `${component}Probability`,
  `${colour}Color`), and critters defines top, body, pattern, cheeks, eyes, mouth and animation over
  a background colour.

  Listing the variants explicitly rather than letting the style pick from all of them is what keeps
  the set on-brand: these are the friendly ones. The palette is a mix of pastels and saturated tones
  so that two people sitting next to each other in a list are told apart by colour before anyone
  looks at the face.*/
const CRITTERS_OPTIONS = {
    backgroundColor: [
        'b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'd9f2d9',
        '0369a1', '4338ca', 'a21caf', 'be123c', '047857',
    ],
    backgroundColorAngle: -324,
    backgroundColorFillStops: 5,
    mouthProbability: 90,
    topProbability: 80,
    eyesVariant: [
        'angry', 'bigPupils', 'close', 'closedLine', 'dots', 'happy', 'inward', 'mono',
        'monoSleepy', 'round', 'sideeye', 'sleepy', 'squint', 'threeRow', 'trio', 'uneven',
        'wide', 'wink',
    ],
    mouthVariant: [
        'blep', 'catMouth', 'dot', 'grin', 'laugh', 'line', 'ooh', 'open', 'smile', 'smirk',
        'teeth', 'tinySmile', 'tongue', 'tooth',
    ],
    // Explicitly off rather than simply unlisted: critters defines an `animation` component with no
    // probability of its own, so leaving it out would hand the decision to whatever DiceBear
    // defaults to. A probability of 0 is the only way to say "never" and have it stay said.
    animationProbability: 0,
};

/*`new Style()` runs the definition through a JSON Schema validator and deep clones it, so it is far
  too expensive to do per render - and the definitions are big (critters is 56KB of JSON, some styles
  are six times that). One instance per definition, kept for as long as the definition is alive.
  Keyed by the object itself so a consumer's own style is cached on the same terms as ours.*/
const styles = new WeakMap();
let seen = 0;

const styleFor = (definition) => {
    let entry = styles.get(definition);
    if (!entry) {
        const style = new Style(definition);
        // `$id` is what a DiceBear definition calls itself; the counter is the fallback for a
        // hand-written one. Either way the cache below needs to tell two definitions apart - keying
        // them all as "custom" would hand one style's face to another style's seed.
        entry = { style, id: style.id() ?? `style-${seen += 1}` };
        styles.set(definition, entry);
    }
    return entry;
};

/*`new Dicebear()` renders the SVG inside the constructor - building one *is* the work. useMemo
  covers re-renders, but a list of people that scrolls unmounts and remounts the same faces over and
  over, and those would each pay for a fresh render. Hence a cache that outlives the components.

  Bounded, and oldest-first: a Map keeps insertion order, so the first key is the coldest. Without
  the cap, a page that renders an avatar per search result would grow this forever.*/
const LIMIT = 200;
const drawn = new Map();

function render(definition, options) {
    const { style, id } = styleFor(definition);
    const key = JSON.stringify([id, options]);

    if (drawn.has(key)) return drawn.get(key);

    const uri = new Dicebear(style, options).toDataUri();
    drawn.set(key, uri);
    if (drawn.size > LIMIT) drawn.delete(drawn.keys().next().value);
    return uri;
}

/*A seeded avatar: the same seed always draws the same face, on every device and every reload, with
  nothing stored anywhere. That is the whole point of the thing - a user with no picture still gets
  something that is recognisably theirs.

  It renders as an <img> holding a data URI rather than as inline SVG. The markup DiceBear produces
  is trusted (it is generated here, from a definition that was schema-validated) but an <img> keeps
  it out of the page's own DOM entirely: no `dangerouslySetInnerHTML`, no chance of the avatar's
  internal gradient ids colliding with another avatar's, and no style bleed in either direction.

  Note the prop names: `style` is React's inline style here, as in every other component of this
  library, and the DiceBear style definition is `styleDefinition`. DiceBear calls the latter `style`,
  but a component that took `style` to mean anything other than CSS would be a trap.*/
export default function Avatar({
    seed,
    styleDefinition = critters,
    options,
    size = 'md',
    shape,
    alt,
    className,
    style,
    ...props
}) {
    verifyTypesAvatar({ seed, styleDefinition, options, size, shape, alt });

    /*The curated options above describe critters and only critters: another style has different
      components, so `eyesVariant` on a style with no eyes is at best ignored. A consumer who brings
      their own definition gets their own options and nothing of ours.*/
    const uri = useMemo(() => render(styleDefinition, {
        ...(styleDefinition === critters ? CRITTERS_OPTIONS : null),
        ...options,
        seed,
    }), [styleDefinition, options, seed]);

    const box = SIZE_TOKEN[size] ?? size;

    /*Inside a shape the image fills the box and the shape does the clipping, so the avatar is cut to
      the outline instead of sitting in front of it. On its own it is a plain square image - a
      consumer who wants it round asks for `shape="circle"`... which is not in the set, so they reach
      for `borderRadius` in `style`. Worth remembering if a circle ever joins SHAPE_NAMES.*/
    /*`draggable` and the two select rules are what keep the shape from betraying itself. An <img> is
      draggable by default and drags a ghost of the *file*, which is always the full square; a
      selection sweeping across the page highlights it as a rectangle for the same reason. Either one
      shows the square that the clip is there to hide, so both are turned off.*/
    const unselectable = { userSelect: 'none', WebkitUserSelect: 'none', WebkitUserDrag: 'none' };

    const image = (
        <img
            src={uri}
            alt={alt ?? seed}
            draggable={false}
            className={shape ? undefined : className}
            style={shape
                ? { width: '100%', height: '100%', objectFit: 'cover', ...unselectable }
                : { width: box, height: box, display: 'block', objectFit: 'cover', ...unselectable, ...style }}
            {...(shape ? null : props)}
        />
    );

    if (!shape) return image;

    return (
        <Shape name={shape} size={size} className={className} style={style} {...props}>
            {image}
        </Shape>
    );
}
