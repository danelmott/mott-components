'use client';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { verifyTypesText } from '../utils/verifyTypes.js';

/*The fifteen roles of the Material 3 typescale, in scale order. Exported because a consumer building
  their own text component needs the same list, and because it is what the validator checks against -
  one source, so a role can never exist in the stylesheet and not here.*/
export const TYPESCALE_ROLES = [
    'display-large', 'display-medium', 'display-small',
    'headline-large', 'headline-medium', 'headline-small',
    'title-large', 'title-medium', 'title-small',
    'body-large', 'body-medium', 'body-small',
    'label-large', 'label-medium', 'label-small',
];

// Each role is one `mott-*` utility from globals.css, which sets the font shorthand and the tracking
// together. Listed rather than interpolated because Tailwind scans this file for class names as
// literals - a template string would produce classes that never get generated.
const textVariants = cva('', {
    variants: {
        variant: {
            'display-large': 'mott-display-large',
            'display-medium': 'mott-display-medium',
            'display-small': 'mott-display-small',
            'headline-large': 'mott-headline-large',
            'headline-medium': 'mott-headline-medium',
            'headline-small': 'mott-headline-small',
            'title-large': 'mott-title-large',
            'title-medium': 'mott-title-medium',
            'title-small': 'mott-title-small',
            'body-large': 'mott-body-large',
            'body-medium': 'mott-body-medium',
            'body-small': 'mott-body-small',
            'label-large': 'mott-label-large',
            'label-medium': 'mott-label-medium',
            'label-small': 'mott-label-small',
        },
    },

    defaultVariants: {
        variant: 'body-medium',
    },
});

// Two roles, not a colour: `muted` is what M3 calls on-surface-variant - supporting text, captions,
// the label above a field. Anything outside these two is a decision this component should not be
// making, and goes through `style`.
const TONE = {
    default: 'var(--md-sys-color-on-surface)',
    muted: 'var(--md-sys-color-on-surface-variant)',
};

/*Text at a named size.

  `variant` and `as` are deliberately separate. The role is how the text LOOKS, the tag is what it
  IS, and a component that fuses them is how documents end up with an `<h1>` chosen because it was
  the big one - which is fine on screen and useless to a screen reader walking the outline. A
  `headline-small` can be the `h2` of a page or a plain `div` inside a card; only the author knows
  which.*/
export default function Text({
    children,
    variant,
    as: Tag = 'p',
    tone = 'default',
    className,
    style,
    ...props
}) {
    verifyTypesText({ variant, as: Tag, tone });

    // cva only reaches for `defaultVariants` when the value is undefined, so an unknown role would
    // render with no class at all - silently unstyled, right after the validator said it was falling
    // back to body-medium. Dropping it here is what makes that promise true.
    const role = TYPESCALE_ROLES.includes(variant) ? variant : undefined;

    return (
        <Tag
            className={twMerge(textVariants({ variant: role }), className)}
            style={{
                color: TONE[tone] ?? TONE.default,
                ...style,
            }}
            {...props}
        >
            {children}
        </Tag>
    )
}
