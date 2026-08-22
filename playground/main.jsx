import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ToastProvider } from '../src/toast/toastContext.jsx';
import { ThemeProvider } from '../src/theme/themeContext.jsx';
import '../src/globals.css';

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </ThemeProvider>
);
