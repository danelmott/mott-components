'use client';
import { useRef } from 'react';

const BOX = 'flex-1 min-w-0 aspect-square rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container)] mott-title-large text-center text-[var(--md-sys-color-on-surface)] outline-none transition-colors duration-150 focus:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container))] disabled:opacity-50 disabled:cursor-not-allowed';


const GAP = ' ';

// The boxes on their own, without the panel around them: one string in, one string out. Both the
// plain verification modal and the recovery flow show the same field, and it carries enough keyboard
// behaviour - advance, step back, paste a whole code - that a second copy of it would drift.
export default function OtpFields({
    code = '',
    onCodeChange,
    length = 6,
    email,
    description,
    disabled = false,
    groupLabel,
}) {
    const boxes = useRef([]);

    const charAt = (index) => {
        const char = code[index];
        return char && char !== GAP ? char : '';
    };

    // always exactly `length` cells, whatever shape the string arrived in
    const slots = () => Array.from({ length }, (_, i) => code[i] ?? GAP);

    const commit = (chars) => onCodeChange?.(chars.join('').replace(/ +$/, ''));

    const focus = (index) => boxes.current[Math.min(Math.max(index, 0), length - 1)]?.focus();

    const handleChange = (index) => (event) => {
        const raw = event.target.value;
        const digit = raw.replace(/\D/g, '').slice(-1);
        if (raw && !digit) {
            event.target.value = charAt(index);
            return;
        }

        const chars = slots();
        chars[index] = digit || GAP;
        commit(chars);
        if (digit) focus(index + 1);
    };

    const handleKeyDown = (index) => (event) => {
        if (event.key === 'Backspace') {
            // there is a digit here, and the box's content is selected, so the browser is about to
            // delete it on its own. Only an already-empty box needs the caret walked backwards.
            if (charAt(index)) return;
            event.preventDefault();
            if (index === 0) return;
            const chars = slots();
            chars[index - 1] = GAP;
            commit(chars);
            focus(index - 1);
            return;
        }
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            focus(index - 1);
        }
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            focus(index + 1);
        }
    };

    // A code arrives from the mail app as one string. Without this, pasting into a `maxLength={1}`
    // box would keep the first digit and drop the other five.
    const handlePaste = (index) => (event) => {
        const digits = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '');
        if (!digits) return;
        event.preventDefault();

        const chars = slots();
        let cursor = index;
        for (const digit of digits) {
            if (cursor >= length) break;
            chars[cursor] = digit;
            cursor += 1;
        }
        commit(chars);
        focus(cursor);
    };

    const message = description ?? (email
        ? `Escribe el código de ${length} dígitos que enviamos a ${email}.`
        : `Escribe el código de ${length} dígitos que te enviamos.`);

    return (
        <>
            <p className="mott-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                {message}
            </p>

            <div role="group" aria-label={groupLabel} className="flex w-full gap-[var(--gap-group)]">
                {Array.from({ length }, (_, index) => (
                    <input
                        key={index}
                        ref={(node) => { boxes.current[index] = node; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={index === 0 ? 'one-time-code' : 'off'}
                        maxLength={1}
                        aria-label={`Dígito ${index + 1} de ${length}`}
                        className={BOX}
                        value={charAt(index)}
                        disabled={disabled}
                        // selecting on focus is what makes `maxLength={1}` behave: typing into a
                        // full box replaces what is there instead of being refused for being full
                        onFocus={(event) => event.target.select()}
                        onChange={handleChange(index)}
                        onKeyDown={handleKeyDown(index)}
                        onPaste={handlePaste(index)}
                    />
                ))}
            </div>
        </>
    )
}
