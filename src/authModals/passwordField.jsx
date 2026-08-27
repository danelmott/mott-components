'use client';
import { useState } from 'react';
import Input from '../input/input.jsx';
import Icon from '../icon/icon.jsx';

// Whether the password is showing is state of the widget, not of the form: it is a momentary way of
// looking at a value, and it resets the moment the modal closes. So it lives here rather than being
// hoisted into the props the consumer controls, which are only ever about the value itself.
// `autoComplete` is a prop and not a constant because the same field means two different things to a
// password manager: `current-password` asks it to fill what it already has, `new-password` asks it to
// propose one and offer to save it. Handing a reset form `current-password` gets the old password
// offered back and the new one never stored.
export default function PasswordField({
    label,
    placeholder,
    value,
    onChange,
    disabled,
    autoComplete = 'current-password',
    ...props
}) {
    const [visible, setVisible] = useState(false);

    return (
        <Input
            type={visible ? 'text' : 'password'}
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            autoComplete={autoComplete}
            {...props}
            trailing={
                <button
                    type="button"
                    onClick={() => setVisible((shown) => !shown)}
                    // `tabIndex={-1}` keeps Tab going field -> field -> submit. Someone who wants
                    // the toggle can still click it; someone filling the form is not made to step
                    // over it twice on the way down.
                    tabIndex={-1}
                    aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="flex cursor-pointer items-center border-0 bg-transparent p-0 text-inherit transition-opacity hover:opacity-70"
                >
                    <Icon name={visible ? 'visibility_off' : 'visibility'} size="md" filled={false} />
                </button>
            }
        />
    )
}
