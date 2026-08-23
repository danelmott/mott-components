'use client';
import { useState } from 'react';
import Input from '../input/input.jsx';
import Icon from '../icon/icon.jsx';

// Whether the password is showing is state of the widget, not of the form: it is a momentary way of
// looking at a value, and it resets the moment the modal closes. So it lives here rather than being
// hoisted into the props the consumer controls, which are only ever about the value itself.
export default function PasswordField({ label, placeholder, value, onChange, disabled }) {
    const [visible, setVisible] = useState(false);

    return (
        <Input
            type={visible ? 'text' : 'password'}
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            autoComplete="current-password"
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
