// Throwaway harness for screenshotting the auth modals on their own. Reads ?screen= and ?mode= from
// the URL, renders one modal already open, and nothing else - so a full-page capture is exactly the
// viewport instead of the eight-thousand-pixel playground.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../src/theme/themeContext.jsx';
import LoginModal from '../src/authModals/loginModal.jsx';
import RegisterModal from '../src/authModals/registerModal.jsx';
import OtpModal from '../src/authModals/otpModal.jsx';
import Shape from '../src/shapes/shapes.jsx';
import '../src/globals.css';

const params = new URLSearchParams(location.search);
const screen = params.get('screen') ?? 'login';
const mode = params.get('mode') ?? 'light';
const filled = params.get('filled') === '1';
const error = params.get('error') ?? undefined;

const brand = { brand: 'aguilarIA', logo: <Shape name="flower" size="20px" color="primary" /> };
const noop = () => {};

function Harness() {
    const [email, setEmail] = useState(filled ? 'danel@aguilar.ai' : '');
    const [password, setPassword] = useState(filled ? 'unaClaveLarga' : '');
    const [confirm, setConfirm] = useState(filled ? 'unaClaveLarga' : '');
    const [code, setCode] = useState(filled ? '4071' : '');

    const common = { ...brand, open: true, onClose: noop, error, onGoogle: noop, onSwitch: noop, onSubmit: noop };

    if (screen === 'register') {
        return (
            <RegisterModal
                {...common}
                email={email} onEmailChange={setEmail}
                password={password} onPasswordChange={setPassword}
                confirmPassword={confirm} onConfirmPasswordChange={setConfirm}
            />
        );
    }
    if (screen === 'otp') {
        return <OtpModal {...common} email="danel@aguilar.ai" code={code} onCodeChange={setCode} onResend={noop} />;
    }
    return (
        <LoginModal
            {...common}
            email={email} onEmailChange={setEmail}
            password={password} onPasswordChange={setPassword}
        />
    );
}

createRoot(document.getElementById('root')).render(
    <ThemeProvider defaultMode={mode}>
        <Harness />
    </ThemeProvider>
);
