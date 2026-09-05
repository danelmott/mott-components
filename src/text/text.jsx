'use client';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { verifyTypesText } from '../utils/verifyTypes.js';


export const TYPESCALE_ROLES = [
    'display-large', 'display-medium', 'display-small',
    'headline-large', 'headline-medium', 'headline-small',
    'title-large', 'title-medium', 'title-small',
    'body-large', 'body-medium', 'body-small',
    'label-large', 'label-medium', 'label-small',
];


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

const TONE = {
    default: 'var(--md-sys-color-on-surface)',
    muted: 'var(--md-sys-color-on-surface-variant)',
};

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
