// Throwaway harness for screenshotting the auth modals on their own. Reads ?screen= and ?mode= from
// the URL, renders one modal already open, and nothing else - so a full-page capture is exactly the
// viewport instead of the eight-thousand-pixel playground.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../src/theme/themeContext.jsx';
import LoginModal from '../src/authModals/loginModal.jsx';
import RegisterModal from '../src/authModals/registerModal.jsx';
import OtpModal from '../src/authModals/otpModal.jsx';
import RecoverPasswordModal from '../src/authModals/recoverPasswordModal.jsx';
import '../src/globals.css';

const params = new URLSearchParams(location.search);
const screen = params.get('screen') ?? 'login';
const mode = params.get('mode') ?? 'light';
const filled = params.get('filled') === '1';
const error = params.get('error') ?? undefined;

const noop = () => {};

function Harness() {
    const [email, setEmail] = useState(filled ? 'danel@aguilar.ai' : '');
    const [password, setPassword] = useState(filled ? 'unaClaveLarga' : '');
    const [confirm, setConfirm] = useState(filled ? 'unaClaveLarga' : '');
    const [code, setCode] = useState(filled ? '4071' : '');

    // `onSubmit`/`onGoogle` are ignored by the modals that do not take them, so one object covers
    // every screen here.
    const common = { open: true, onClose: noop, error, onGoogle: noop, onSwitch: noop, onSubmit: noop };

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
    // Both steps of the recovery flow are the same component with a different `step`, which is
    // exactly the point: one panel, two contents.
    if (screen === 'recover-code' || screen === 'recover-password') {
        return (
            <RecoverPasswordModal
                {...common}
                step={screen === 'recover-code' ? 'code' : 'password'}
                email="danel@aguilar.ai"
                code={code} onCodeChange={setCode}
                onVerifyCode={noop} onResend={noop}
                password={password} onPasswordChange={setPassword}
                confirmPassword={confirm} onConfirmPasswordChange={setConfirm}
                onSubmitPassword={noop}
            />
        );
    }
    return (
        <LoginModal
            {...common}
            email={email} onEmailChange={setEmail}
            password={password} onPasswordChange={setPassword}
            onForgotPassword={noop}
        />
    );
}

createRoot(document.getElementById('root')).render(
    <ThemeProvider defaultMode={mode}>
        <Harness />
    </ThemeProvider>
);
