import { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';

function aplicarTema(colorSemillaHex, modo = 'dark') {
  const theme = themeFromSourceColor(argbFromHex(colorSemillaHex));
  const scheme = theme.schemes[modo];
  const colors = {};
  for (const [rol, argb] of Object.entries(scheme.toJSON())) {
    const nombreCSS = rol.replace(/([A-Z])/g, '-$1').toLowerCase();
    colors[`--md-sys-color-${nombreCSS}`] = hexFromArgb(argb);
  }
  return colors;
}

// Cambia el color y el modo aquí para probar:
console.log(JSON.stringify(aplicarTema('#F97316', 'dark'), null, 2));