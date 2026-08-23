# @danelmott/mott-design-components

[![version](https://img.shields.io/badge/version-1.0.1-1f6feb)](./package.json)
[![license](https://img.shields.io/badge/license-ISC-6e7681)](./package.json)
[![react](https://img.shields.io/badge/react-18%20%7C%7C%2019-149eca)](https://react.dev)
[![material design 3](https://img.shields.io/badge/Material%20Design-3-6750a4)](https://m3.material.io/styles/color/system/overview)
[![tailwind](https://img.shields.io/badge/tailwind-v4-38bdf8)](https://tailwindcss.com)

Librería de componentes React donde **todo el color sale de un solo color semilla**. Elegís un hex y
obtenés una paleta completa de Material Design 3 — claro y oscuro, acentos, superficies, colores
semánticos — y cada componente la sigue sin saber qué color está pintando.

📖 *[Read this in English](./README.md)*

---

## Qué es

Todo el sistema se apoya en una sola idea: **los componentes piden roles, nunca colores.**

`buildPalette()` ([`src/theme/palette.js`](./src/theme/palette.js)) pasa la semilla por
`@material/material-color-utilities` y produce unas 90 custom properties de CSS —
`--md-sys-color-*` para los roles de Material y `--md-custom-color-*` para los semánticos.
`ThemeProvider` las escribe inline en el `<html>`, y ese es el único lugar donde existe un hex en
tiempo de ejecución. Un botón dice `var(--md-sys-color-primary)`; cuando cambia la semilla, el botón
cambia con ella, y nadie tuvo que avisarle.

El stack detrás:

- **Tailwind v4** — las utilidades y los bloques `@utility` que guardan la estructura de cada componente
- **class-variance-authority** + **tailwind-merge** — composición de variantes que el consumidor todavía puede pisar
- **GSAP** — animación, estrictamente geometría (transforms, radios). El color va siempre por CSS, nunca por un tween.

---

## Requisitos

| | |
|---|---|
| React | 18 o 19 (peer dependency, no viene empaquetado) |
| Tailwind | **v4 — obligatorio.** El `globals.css` que se distribuye empieza con `@import "tailwindcss"` |
| Framework | Cualquier app React. Next.js App Router si querés el paso de postinstall de abajo |

---

## Instalación

El paquete se publica en **GitHub Packages**, no en el registro público de npm, así que hay que
decirle a npm dónde buscar y cómo autenticarse.

**1 — Creá un `.npmrc` en la raíz de tu proyecto:**

```ini
@danelmott:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=TU_TOKEN_DE_GITHUB
```

Usá un personal access token de GitHub con el scope `read:packages`. Agregá `.npmrc` a tu
`.gitignore` — un token versionado es un token que vas a tener que revocar.

**2 — Instalá:**

```bash
npm install @danelmott/mott-design-components
```

**3 — Importá los tokens y montá el provider:**

```jsx
// app/layout.jsx
import '@danelmott/mott-design-components/globals.css';
import { ThemeProvider } from '@danelmott/mott-design-components';

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

---

## ⚠️ El postinstall sobrescribe `app/globals.css`

Este paquete corre [`scripts/uploadCss.js`](./scripts/uploadCss.js) en el `postinstall`. Cuando
detecta que está instalado como dependencia, copia su propio `dist/globals.css` encima de
**`<tu-proyecto>/app/globals.css`**, creando la carpeta si no existe.

No fusiona, no pregunta y no hace backup. **Lo que hubiera en ese archivo se pierde**, y vuelve a
pasar en cada `npm install`.

Si tenés estilos propios ahí, instalá con:

```bash
npm install @danelmott/mott-design-components --ignore-scripts
```

…e importá la hoja de estilos vos mismo, como se muestra arriba.

Cuando corrés `npm install` dentro de este repo durante el desarrollo, el script chequea su propia
ruta, ve que no está dentro de `node_modules/@danelmott/mott-design-components` y sale sin tocar
nada. Eso es a propósito.

---

## Temas

### Los cuatro temas incluidos

| tema | semilla | variante de esquema |
|---|---|---|
| negro | `#000000` | `content` |
| gris | `#8E8E93` | `content` |
| rosa | `#d97cb9` | `content` |
| azul | `#005eeb` | `content` |

Los cuatro usan `content` a propósito. Un gris no tiene tono — con chroma 0 el valor que devuelve HCT
es arbitrario — y los esquemas `neutral` y `tonalSpot` le fuerzan un chroma a cualquier tono que
reciban, que es como se termina con un gris verdoso o un negro vino tinto. `content` conserva el
chroma de origen, así que el cero sigue siendo cero y ningún tono inventado puede aparecer.

Los demás esquemas están disponibles por el argumento `variant`: `content`, `monochrome`, `neutral`,
`tonalSpot`, `vibrant`.

### Modos

`light`, `dark` y `system`. Con `system` el provider **quita** el atributo `data-theme` en vez de
fijarlo en el valor resuelto — eso es lo que le devuelve el control a la media query
`prefers-color-scheme` que ya está en la hoja de estilos, así que la app sigue al sistema operativo
en vez de congelarse en lo que dijo una vez.

### Los colores semánticos siguen al acento

`success` y `warning` parten de un verde y un naranja fijos, y después se **armonizan** hacia el tono
de la semilla (Material limita la rotación a 15°, así que el verde sigue siendo inequívocamente
verde):

| semilla | `success` | `warning` |
|---|---|---|
| negro `#000000` | `#006e2d` | `#904d00` |
| gris `#8E8E93` | `#006e2d` | `#904d00` |
| rosa `#d97cb9` | `#336b00` | `#a14002` |
| azul `#005eeb` | `#006c4b` | `#a14002` |

Las semillas en escala de grises quedan tal como fueron definidas — armonizar hacia un tono que no
existe arrastraría el verde a un lugar que nadie eligió.

### `useTheme()`

```jsx
import { useTheme } from '@danelmott/mott-design-components';

function ThemeSwitch() {
  const { mode, setMode, resolvedMode, colorSeedHex, setColorSeedHex, THEMES_AVAILABLE } = useTheme();

  return (
    <>
      <button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
        Modo: {mode} (ahora {resolvedMode})
      </button>

      {THEMES_AVAILABLE.map((theme) => (
        <button key={theme.name} onClick={() => setColorSeedHex(theme.hex, theme.variant)}>
          {theme.name}
        </button>
      ))}
    </>
  );
}
```

| valor | qué es |
|---|---|
| `colorSeedHex` | la semilla que está manejando la paleta |
| `setColorSeedHex(hex, variant)` | cambia la semilla; la variante viaja con ella porque son una sola decisión |
| `variant` | la variante de esquema activa |
| `mode` | lo que eligió el usuario: `light` \| `dark` \| `system` |
| `setMode(mode)` | cambiarlo |
| `resolvedMode` | lo que se ve en pantalla — usalo para elegir el ícono de un toggle |
| `THEMES_AVAILABLE` | la lista de arriba, o la que le hayas pasado a `ThemeProvider` |

La semilla, el modo y la variante se guardan en `localStorage` y se adoptan al montar, así que una
recarga respeta lo que eligió el usuario. `ThemeModal` te da el selector entero ya armado.

---

## Botones

`variant` dice **qué significa el botón**, nunca cómo se pinta. Cada valor apunta a una familia de la
paleta, así que un cambio de semilla los repinta a todos y ninguno se puede salir del sistema.

| variant | para qué | fondo / texto |
|---|---|---|
| `default` | no carga peso propio — Cancelar, Volver | `surface-container` / `on-surface` |
| `action` | lo único para lo que existe la pantalla — Guardar, Enviar | `primary` / `on-primary` |
| `support` | ayuda sin competir | `secondary` / `on-secondary` |
| `danger` | destructivo — Eliminar, Revocar | `error` / `on-error` |
| `success` | confirma algo que salió bien — Aprobar | `custom-success` / `on-success` |
| `warning` | precaución que no destruye — Archivar | `custom-warning` / `on-warning` |
| `ghost` | sin superficie, solo la etiqueta | — / `primary` |

### `quiet`

Cada familia de Material te da dos pares, no un color: el fuerte y el suave. `quiet` cambia de par
sin cambiar de familia — mismo significado, menos volumen.

```jsx
<Button variant="danger">Eliminar</Button>         {/* #ba1a1a con texto blanco */}
<Button variant="danger" quiet>Eliminar</Button>   {/* #ffdad6 con texto #93000a */}
```

Los dos son inequívocamente el botón de eliminar. El quiet simplemente no domina la pantalla, que es
lo que querés cuando la acción destructiva está en un menú o en una fila de tabla. Ojo que el par
cambia **los dos colores a la vez** y se invierte en modo oscuro, así que el contraste está
garantizado en ambos casos.

`quiet` aplica a `action`, `support`, `danger`, `success` y `warning`. `default` ya es el escalón
suave de la familia neutra y `ghost` no tiene superficie que suavizar, así que ahí no hace nada.

```jsx
<Button variant="action" shape="pill">Enviar</Button>
<Button variant="ghost" iconOnly aria-label="Editar"><Icon name="edit" /></Button>
<Button variant="support" fullWidth>Continuar</Button>
```

---

## Componentes

| export | qué hace |
|---|---|
| `Button` | siete variantes semánticas más `quiet`, `shape`, `iconOnly`, `fullWidth` |
| `FabButton` | botón circular de ícono, mismo vocabulario de variantes, tamaños `sm`/`md`/`lg` |
| `ButtonGroup` | grupo de selección única; el activo hace un morph de círculo a squircle |
| `Toast` | notificación arrastrable, se descarta con un swipe, cuatro variantes |
| `ToastProvider` / `useToast` | cola imperativa: `showToast`, `info`, `success`, `warning`, `danger`, `closeToast`, `closeAll` |
| `ThemeProvider` / `useTheme` | el motor de la paleta y su hook |
| `ThemeModal` | selector de apariencia listo: swatches más el grupo claro/oscuro/sistema |
| `Input` | campo con label, tipos `text`/`number`/`password` |
| `Textarea` | campo multilínea con label |
| `Select` | dropdown propio sobre un array de `options` |
| `Search` | campo de búsqueda con debounce y `onSearch` |
| `Dropdown` | panel anclado, sin backdrop; cierra con Escape o un clic afuera |
| `CustomModal` | `<dialog>` nativo con animaciones de apertura y cierre intercambiables |
| `Icon` | Material Symbols Rounded con `fill`, `weight`, `grade`, `opticalSize` |
| `Loading` | spinner, tamaños `sm`/`md`/`lg` |
| `Progress` | barra determinada, o indeterminada si omitís `value` |
| `Navbar` | rail con items, logo opcional, alineación `top` o `center` |
| `DragScroll` / `useDragScroll` | scroll arrastrable con inercia y degradado en los bordes; el hook para tu propio elemento |
| `Shape` | las cinco formas de Material 3 como contenedor que recorta: `triangle`, `diamond`, `arch`, `flower`, `cookie` |
| `Avatar` | avatar de DiceBear a partir de un `seed`; `shape` lo recorta con cualquier forma de M3 |
| `Text` | los quince roles de la escala tipográfica de M3, como componente |
| `ModalAnimation`, `MorphAnimation`, `AnchoredAnimation` | las clases de animación, más las instancias ya armadas `morphAnimation` y `anchoredAnimation` |

**Para las props exactas, los valores permitidos y los defaults, leé
[`src/utils/verifyTypes.js`](./src/utils/verifyTypes.js).** Cada componente valida sus props ahí en
tiempo de ejecución, así que ese archivo *es* la especificación — y una prop mal puesta te lo dice en
la consola en vez de fallar en silencio.

### Shapes

`Shape` es un **recorte**, no un dibujo: la forma se aplica al elemento mismo, así que lo que le
pongas adentro también la toma — una imagen cortada en rombo, no un rombo con una imagen rectangular
encima.

```jsx
import { Shape, Icon } from '@danelmott/mott-design-components';

<Shape name="cookie" color="secondary">
  <Icon name="favorite" size="lg" />
</Shape>

// cualquier color CSS, un tamaño propio, y la forma girada sin inclinar el contenido
<Shape name="diamond" color="#7c3aed" size="120px" rotate={15}>
  <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
</Shape>

// `flower` y `cookie` aceptan cantidad de puntas
<Shape name="flower" points={12} color="warning" />
```

`color` sigue la misma regla que `Loading` y `Progress`: un nombre de acento (`primary`, `info`,
`secondary`, `success`, `warning`, `danger`) sigue al tema, y cualquier color CSS pasa tal cual.
Cuando el nombre viene de la paleta, el contenido se pinta con el color `on-*` que Material ya
verificó que se lee encima — `contentColor` lo sobreescribe.

### Avatars

`Avatar` dibuja un avatar de [DiceBear](https://www.dicebear.com) a partir de un `seed`. El mismo
seed da siempre la misma cara, en cualquier dispositivo y en cualquier recarga, sin guardar nada en
ningún lado — un usuario sin foto igual tiene algo que es suyo.

```jsx
import { Avatar } from '@danelmott/mott-design-components';

<Avatar seed="danel" />
<Avatar seed="danel" shape="cookie" size="120px" />   // recortado por la forma, no apoyado encima
```

Viene con un solo estilo (`critters`) para no arrastrar todos los de DiceBear a tu bundle: las
definiciones son grandes y se importan estáticas. Cualquier otro estilo es un import, y pasarlo
descarta las opciones de critters, porque otro estilo tiene otras piezas:

```jsx
import lorelei from '@dicebear/styles/lorelei.json' with { type: 'json' };

<Avatar seed="danel" styleDefinition={lorelei} shape="diamond" />
<Avatar seed="ana" options={{ mouthProbability: 100 }} />   // cualquier opción que defina el estilo
```

Se llama `styleDefinition` y no `style` a propósito: acá `style` es el style inline de React, como en
todos los demás componentes. El render se cachea y es determinista, así que una lista que scrollea no
vuelve a dibujar las mismas caras.

### Tipografía

El texto usa la **escala tipográfica de Material 3**: quince roles — `display`, `headline`, `title`,
`body` y `label`, cada uno en `large` / `medium` / `small`. Un rol dice *qué es* un texto, y trae
junto su tamaño, interlineado, tracking y peso, así que el label de un botón es `label-large` en
todos lados y no puede desviarse de un componente a otro.

```jsx
import { Text } from '@danelmott/mott-design-components';

<Text variant="headline-small" as="h2">Título</Text>
<Text variant="body-medium" tone="muted">Texto de apoyo</Text>

<span className="mott-label-large">o la clase utility</span>
```

`variant` es cómo se ve y `as` es qué es — separados, porque si no terminás eligiendo `h1` porque
era el grande.

**La fuente se nombra en un solo lugar.** Los quince roles apuntan a dos tokens de referencia, así
que mudar el sistema a otra fuente son dos líneas:

```css
--md-ref-typeface-brand: 'DM Sans', sans-serif;   /* display, headline, title-large */
--md-ref-typeface-plain: 'DM Sans', sans-serif;   /* body, label, title */
```

Los tamaños, interlineados y pesos salen del archivo de tokens de `@material/web`. **El tracking es
lo único que se aparta de M3** — y se aparta, sobre todo, quitándose del medio.

Los números de tracking de M3 están medidos sobre Roboto, una fuente sin eje óptico, donde el
letter-spacing es la única palanca que hay para compensar el tamaño. DM Sans trae esa palanca adentro
del archivo: un eje `opsz` de 9 a 40 que dibujó el propio diseñador y que, al mismo tamaño nominal,
renderiza un titular de 45px **9.5% más angosto** y el texto de 11px **0.6% más abierto** que la
misma fuente clavada en su default de 14px. Es la misma corrección que persigue el tracking, pero
redibujando las letras en vez de separarlas a la fuerza.

Así que la hace el eje. `display`, `headline`, `title` y `body-large` quedan en `0` de tracking; solo
los roles chicos conservan un valor positivo suave, donde el texto de interfaz pide más aire del que
da el eje por sí solo. Lo que queda va en `em` y no en el `rem` de M3, para que escale con el tamaño
al que el texto se renderiza de verdad.

**El eje solo llega si la URL de la fuente lo pide.** Ojo con el `opsz,wght@9..40` del import:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,100..1000&display=swap');
```

Una URL `wght@400;500;700` pelada devuelve un archivo de 37 KB con el eje ya instanciado: todos los
tamaños se dibujan desde el diseño de 14px y el ajuste de arriba, sencillamente, no pasa. El archivo
variable pesa 63 KB y cubre todos los pesos, así que es una sola petición igual.
`font-optical-sizing: auto` en `body` prende el eje; las clases `mott-*` lo tienen sí o sí, porque el
shorthand `font` que usan resetea esa propiedad a `auto`.

Una advertencia si usás los tokens a mano: el compuesto `--md-sys-typescale-<rol>` es un shorthand
`font`, y esa propiedad no tiene lugar para el letter-spacing, así que hay que aplicar
`--md-sys-typescale-<rol>-tracking` al lado. Las clases `mott-*` y `<Text>` ya lo hacen.

Los controles con texto centrado (`mott-btn`, y lo que lleve `mott-trim`) además recortan el
medio-interlineado con `text-box`, así el label queda ópticamente centrado en vez de apoyado abajo.
Está detrás de un `@supports` — Firefox todavía no lo soporta — y el padding está puesto para
funcionar en los dos casos.

### Toasts

```jsx
import { ToastProvider, useToast } from '@danelmott/mott-design-components';

function SaveButton() {
  const { success, danger } = useToast();

  return (
    <Button
      variant="action"
      onClick={async () => {
        try {
          await save();
          success('Guardado');
        } catch (error) {
          danger({ title: 'Error', message: error.message });
        }
      }}
    >
      Guardar
    </Button>
  );
}

// se monta una sola vez, por encima de todo lo que llame a useToast()
<ToastProvider max={3} duration={4000}>
  <App />
</ToastProvider>
```

---

## Tokens de diseño

[`src/globals.css`](./src/globals.css) es la única fuente de verdad. Además de los roles de color,
define:

| grupo | tokens |
|---|---|
| Tipografía | `--md-ref-typeface-brand/plain`, `--md-ref-typeface-weight-*`, `--md-sys-typescale-<rol>-{font,size,line-height,tracking,weight}` para los quince roles, `--font-family`, `--tracking-caps` |
| Radios | `--radius-sm`, `--radius-lg`, `--radius-default`, `--radius-full`, `--radius-modal`, `--control-radius` |
| Espaciado | `--pad-button`, `--pad-input`, `--pad-card`, `--pad-badge-*`, `--gap-tight` → `--gap-page` |
| Tamaños | `--sm-icon` → `--xl-icon`, `--control-size-sm/md/lg` |
| Movimiento y profundidad | `--ease-morph`, `--shadow-floating`, `--z-nav`, `--z-floating`, `--fade-edge` |

El modo oscuro vive en dos lugares que hay que mantener sincronizados: un bloque explícito
`[data-theme="dark"]` y una media query `prefers-color-scheme: dark` protegida por
`:root:not([data-theme="light"])`. **Cuando agregues un token, agregalo en los tres bloques** —
`:root`, el atributo y la media query.

---

## Desarrollo

```bash
npm install     # acá el postinstall es un no-op, a propósito
npm run dev     # playground de Vite con todos los componentes en una página
npm run build   # tsup -> dist/index.js (ESM) y copia globals.css -> dist/
npm run theme   # regenera el bloque de tokens estáticos de src/globals.css desde la semilla por defecto
```

Todavía no hay script de lint, test ni typecheck.

Una nota sobre `typescript`: es una devDependency obligatoria aunque el proyecto no tenga un solo
archivo `.ts`. tsup hace un `require('typescript')` incondicional por dentro, así que sacarla rompe
el build.

### Estructura del proyecto

```
index.js              re-exporta todo — un componente no existe para el consumidor hasta que está acá
src/
  <componente>/       una carpeta por componente
  theme/              palette.js (el motor M3) · roles.js (familias e intenciones) · themeContext.jsx · themeModal.jsx
  animations/         modalAnimation.js — las transiciones morph y anclada
  utils/              verifyTypes.js (la spec de props) · scrollLock.js
  globals.css         todos los tokens de diseño
playground/           la app de desarrollo con Vite
scripts/              generateTheme.js · uploadCss.js (el postinstall)
```

**Para agregar un componente:** creá `src/<nombre>/<nombre>.jsx`, arrancalo con `'use client'`, sacá
el color de [`src/theme/roles.js`](./src/theme/roles.js) en vez de escribir un hex, agregá un
validador en `verifyTypes.js` y re-exportalo desde `index.js`. Nada es visible para un consumidor
hasta ese último paso.

---

## Licencia

ISC © [@danelmott](https://github.com/danelmott)
