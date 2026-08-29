# @danelmott/mott-design-components

[![version](https://img.shields.io/badge/version-1.0.1-1f6feb)](./package.json)
[![license](https://img.shields.io/badge/license-ISC-6e7681)](./package.json)
[![react](https://img.shields.io/badge/react-18%20%7C%7C%2019-149eca)](https://react.dev)
[![material design 3](https://img.shields.io/badge/Material%20Design-3-6750a4)](https://m3.material.io/styles/color/system/overview)
[![tailwind](https://img.shields.io/badge/tailwind-v4-38bdf8)](https://tailwindcss.com)

A React component library where **every colour comes from a single seed**. Pick one hex, get a
complete Material Design 3 palette — light and dark, accents, surfaces, semantic colours — and every
component follows it without knowing what colour it is painting.

📖 *[Léeme en español](./README.es.md)*

---

## What it is

The whole system rests on one idea: **components ask for roles, never for colours.**

`buildPalette()` ([`src/theme/palette.js`](./src/theme/palette.js)) runs the seed through
`@material/material-color-utilities` and produces around 90 CSS custom properties —
`--md-sys-color-*` for the Material roles and `--md-custom-color-*` for the semantic ones.
`ThemeProvider` writes them inline on `<html>`, and that is the only place a hex value exists at
runtime. A button says `var(--md-sys-color-primary)`; when the seed changes, the button changes with
it, and nothing in the component had to be told.

The stack behind it:

- **Tailwind v4** — utility classes and the `@utility` blocks that hold component structure
- **class-variance-authority** + **tailwind-merge** — variant composition that a consumer can still override
- **GSAP** — animation, strictly geometry (transforms, radii). Colour is always CSS, never a tween.

---

## Requirements

| | |
|---|---|
| React | 18 or 19 (peer dependency, not bundled) |
| Tailwind | **v4 — required.** The shipped `globals.css` starts with `@import "tailwindcss"` |
| Framework | Anything React. Next.js App Router if you want the postinstall step below |

---

## Installation

The package is published to **GitHub Packages**, not the public npm registry, so npm needs to be
told where to look and how to authenticate.

**1 — Create a `.npmrc` in your project root:**

```ini
@danelmott:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Use a GitHub personal access token with the `read:packages` scope. Add `.npmrc` to your `.gitignore`
— a token in version control is a token you have to revoke.

**2 — Install:**

```bash
npm install @danelmott/mott-design-components
```

**3 — Import the tokens and mount the provider:**

```jsx
// app/layout.jsx
import '@danelmott/mott-design-components/globals.css';
import { ThemeProvider } from '@danelmott/mott-design-components';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

---

## ⚠️ The postinstall step overwrites `app/globals.css`

This package runs [`scripts/uploadCss.js`](./scripts/uploadCss.js) on `postinstall`. When it detects
it is installed as a dependency, it copies its own `dist/globals.css` over
**`<your-project>/app/globals.css`**, creating the folder if it does not exist.

It does not merge, ask, or back anything up. **Whatever was in that file is gone**, and it happens
again on every `npm install`.

If you keep your own styles there, install with:

```bash
npm install @danelmott/mott-design-components --ignore-scripts
```

…and import the stylesheet yourself, as shown above.

When you run `npm install` inside this repository during development, the script checks its own path,
sees it is not inside `node_modules/@danelmott/mott-design-components`, and exits without touching
anything. That is by design.

---

## Theming

### The four built-in themes

| theme | seed | scheme variant |
|---|---|---|
| negro | `#000000` | `content` |
| gris | `#8E8E93` | `content` |
| rosa | `#d97cb9` | `content` |
| azul | `#005eeb` | `content` |

All four use `content` on purpose. A grey has no hue — at chroma 0 the value HCT reports back is
arbitrary — and the `neutral` and `tonalSpot` schemes force a chroma onto whatever hue they are
handed, which is how you end up with a greenish grey or a wine-red black. `content` keeps the source
chroma, so zero stays zero and no invented hue can surface.

The other schemes are available through the `variant` argument: `content`, `monochrome`, `neutral`,
`tonalSpot`, `vibrant`.

### Modes

`light`, `dark`, and `system`. Under `system` the provider **removes** the `data-theme` attribute
rather than pinning it to the resolved value — that is what hands control back to the
`prefers-color-scheme` media query already in the stylesheet, so the app keeps following the OS
instead of freezing on whatever it said once.

### Semantic colours follow the accent

`success` and `warning` are seeded from fixed green and orange, then **harmonised** toward the seed's
hue (Material caps the rotation at 15°, so green stays unmistakably green):

| seed | `success` | `warning` |
|---|---|---|
| negro `#000000` | `#006e2d` | `#904d00` |
| gris `#8E8E93` | `#006e2d` | `#904d00` |
| rosa `#d97cb9` | `#336b00` | `#a14002` |
| azul `#005eeb` | `#006c4b` | `#a14002` |

Greyscale seeds are left exactly as authored — harmonising toward a hue that does not exist would
drag the green somewhere nobody chose.

### `useTheme()`

```jsx
import { useTheme } from '@danelmott/mott-design-components';

function ThemeSwitch() {
  const { mode, setMode, resolvedMode, colorSeedHex, setColorSeedHex, THEMES_AVAILABLE } = useTheme();

  return (
    <>
      <button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
        Mode: {mode} (currently {resolvedMode})
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

| value | what it is |
|---|---|
| `colorSeedHex` | the seed currently driving the palette |
| `setColorSeedHex(hex, variant)` | change the seed; the variant rides along because the two are one choice |
| `variant` | the active scheme variant |
| `mode` | what the user chose: `light` \| `dark` \| `system` |
| `setMode(mode)` | change it |
| `resolvedMode` | what is actually on screen — use it to pick a toggle's icon |
| `THEMES_AVAILABLE` | the list above, or whatever you passed to `ThemeProvider` |

The seed, mode, and variant are persisted to `localStorage` and adopted on mount, so a reload keeps
the user's choice. `ThemeModal` gives you the whole picker prebuilt.

---

## Buttons

`variant` names **what the button means**, never how it is painted. Every value maps to a family of
the palette, so a change of seed repaints all of them and none can drift out of the system.

| variant | for | background / text |
|---|---|---|
| `default` | carries no weight of its own — Cancel, Back | `surface-container` / `on-surface` |
| `action` | the one thing the screen is for — Save, Send | `primary` / `on-primary` |
| `support` | helps without competing | `secondary` / `on-secondary` |
| `danger` | destructive — Delete, Revoke | `error` / `on-error` |
| `success` | confirms something that went right — Approve | `custom-success` / `on-success` |
| `warning` | caution that does not destroy — Archive | `custom-warning` / `on-warning` |
| `ghost` | no surface at all, just a label | — / `primary` |

### `quiet`

Every Material family gives you two pairs, not one colour: the loud one and the soft one. `quiet`
swaps the pair without changing the family — same meaning, lower volume.

```jsx
<Button variant="danger">Delete</Button>         {/* #ba1a1a on white  */}
<Button variant="danger" quiet>Delete</Button>   {/* #ffdad6 with #93000a text */}
```

Both are unmistakably the delete button. The quiet one just does not dominate the screen, which is
what you want when a destructive action sits in a menu or a table row. Note that the pair swaps
*both* colours at once and inverts in dark mode, so contrast is guaranteed either way.

`quiet` applies to `action`, `support`, `danger`, `success`, and `warning`. `default` is already the
soft step of the neutral family and `ghost` has no surface to soften, so on those it does nothing.

```jsx
<Button variant="action" shape="pill">Send</Button>
<Button variant="ghost" iconOnly aria-label="Edit"><Icon name="edit" /></Button>
<Button variant="support" fullWidth>Continue</Button>
```

---

## Components

| export | what it does |
|---|---|
| `Button` | seven semantic variants plus `quiet`, `shape`, `iconOnly`, `fullWidth` |
| `FabButton` | circular icon button, same variant vocabulary, sizes `sm`/`md`/`lg` |
| `ButtonGroup` | single-selection group; the active item morphs from circle to squircle |
| `Toast` | draggable notification, swipe to dismiss, four variants |
| `ToastProvider` / `useToast` | imperative queue: `showToast`, `info`, `success`, `warning`, `danger`, `closeToast`, `closeAll` |
| `ThemeProvider` / `useTheme` | the palette engine and its hook |
| `ThemeModal` | ready-made appearance picker: swatches plus a light/dark/system group |
| `Input` | labelled field, types `text`/`number`/`password` |
| `Textarea` | labelled multiline field |
| `Select` | custom dropdown over an `options` array |
| `Search` | debounced search field with `onSearch` |
| `Dropdown` | anchored panel, no backdrop; closes on Escape or an outside click |
| `CustomModal` | native `<dialog>` with pluggable open/close animations |
| `LoginModal` / `RegisterModal` / `OtpModal` | ready-made auth modals: controlled fields, Google button, close button and switch line |
| `RecoverPasswordModal` | password recovery in two steps — the code, then the new password — in one panel |
| `Icon` | Material Symbols Rounded with `fill`, `weight`, `grade`, `opticalSize` |
| `GoogleIcon` | the Google mark in its own four brand colours — the one thing here that does not follow the theme |
| `Loading` | indeterminate spinner: the M3 shapes morphing into one another while it turns. `size` takes a token or any CSS length; `shapes` replaces the cycle (`LOADER_SHAPES` is the default) |
| `Progress` | determinate bar, or indeterminate when `value` is omitted |
| `Navbar` | rail with items, optional logo, `top` or `center` alignment |
| `DragScroll` / `useDragScroll` | drag-to-scroll with inertia and edge fade; hook form for your own element |
| `Shape` | the five Material 3 shapes as a clipping container: `triangle`, `diamond`, `arch`, `flower`, `cookie` |
| `Avatar` | seeded DiceBear avatar; `shape` clips it to any Material 3 shape |
| `Text` | the fifteen Material 3 typescale roles, as a component |
| `ModalAnimation`, `MorphAnimation`, `AnchoredAnimation` | the animation classes, plus the ready-made `morphAnimation` and `anchoredAnimation` instances |

**For exact props, allowed values, and defaults, read
[`src/utils/verifyTypes.js`](./src/utils/verifyTypes.js).** Every component validates its props
through it at runtime, so that file *is* the specification — and a wrong prop tells you so in the
console rather than failing silently.

### Shapes

`Shape` is a **clip**, not a drawing: the outline is applied to the element itself, so whatever you
put inside takes the shape too — an image cut to a diamond instead of a rectangle sitting on top of
one.

```jsx
import { Shape, Icon } from '@danelmott/mott-design-components';

<Shape name="cookie" color="secondary">
  <Icon name="favorite" size="lg" />
</Shape>

// any CSS colour, a custom size, and a shape rotated without tilting its content
<Shape name="diamond" color="#7c3aed" size="120px" rotate={15}>
  <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
</Shape>

// `flower` and `cookie` take a point count
<Shape name="flower" points={12} color="warning" />
```

`color` follows the same rule as `Loading` and `Progress`: an accent name (`primary`, `info`,
`secondary`, `success`, `warning`, `danger`) keeps following the theme, while any CSS colour is
passed straight through. When the name comes from the palette, the content inside is painted with
the `on-*` colour Material already contrast-checked against it — pass `contentColor` to override.

### Avatars

`Avatar` draws a [DiceBear](https://www.dicebear.com) avatar from a `seed`. The same seed always
produces the same face, on every device and every reload, with nothing stored anywhere — a user with
no picture still gets something recognisably theirs.

```jsx
import { Avatar } from '@danelmott/mott-design-components';

<Avatar seed="danel" />
<Avatar seed="danel" shape="cookie" size="120px" />   // clipped to the shape, not sitting on it
```

It ships with one style (`critters`) so the package does not drag every DiceBear style into your
bundle — the definitions are large and imported statically. Any other style is one import away, and
passing one drops the built-in critters options, since another style has different pieces:

```jsx
import lorelei from '@dicebear/styles/lorelei.json' with { type: 'json' };

<Avatar seed="danel" styleDefinition={lorelei} shape="diamond" />
<Avatar seed="ana" options={{ mouthProbability: 100 }} />   // any option the style defines
```

`styleDefinition` rather than `style` is deliberate: `style` means React's inline style here, as in
every other component. Rendering is cached and deterministic, so a list that scrolls does not redraw
the same faces.

### Typography

Text uses the **Material 3 typescale**: fifteen roles — `display`, `headline`, `title`, `body` and
`label`, each in `large` / `medium` / `small`. A role says what a piece of text *is*, and carries its
size, line-height, tracking and weight together, so a button label is `label-large` everywhere and
cannot drift from one component to the next.

```jsx
import { Text } from '@danelmott/mott-design-components';

<Text variant="headline-small" as="h2">Title</Text>
<Text variant="body-medium" tone="muted">Supporting copy</Text>

<span className="mott-label-large">or the utility class</span>
```

`variant` is how it looks and `as` is what it is — keep them separate, or you end up choosing `h1`
because it was the big one.

**The typeface is named in one place.** Every role points at two reference tokens, so moving the
system to another font is two lines:

```css
--md-ref-typeface-brand: 'DM Sans', sans-serif;   /* display, headline, title-large */
--md-ref-typeface-plain: 'DM Sans', sans-serif;   /* body, label, title */
```

Sizes, line-heights and weights come from `@material/web`'s own token file. **Tracking is the one
place this departs from M3** — and it departs mostly by getting out of the way.

M3's tracking numbers were measured on Roboto, a face with no optical-size axis, where letter-spacing
is the only lever available for compensating size. DM Sans has that lever built into the font: an
`opsz` axis running 9–40 that the type designer drew, which at the same nominal size renders a 45px
headline **9.5% narrower** and 11px text **0.6% wider** than the font pinned at its 14px default.
That is the same correction tracking is reaching for, done by redrawing the letterforms instead of
prying them apart.

So the axis does it. `headline`, `title` and `body-large` sit at `0` tracking, and the small roles
keep a light positive value where UI micro-copy wants more air than the axis alone gives.

The two `display` roles are the exception, because **the axis stops at 40 and they are past it**:
45px sits five points outside its reach and 57px sits seventeen, so both would be drawn identically
despite the 12px between them. They carry a small negative value in proportion — `-0.003em` and
`-0.010em`. Small on purpose: continuing the axis's own slope past its last master lands at
`-0.05em`, and at that width the letters collide. `opsz 40` is the display drawing the designer
meant for everything above 40, not a curve that was cut short.

What remains is in `em` rather than M3's `rem`, so it scales with the size the text is actually
rendered at.

**The axis only arrives if the font URL asks for it.** Note the `opsz,wght@9..40` in the import:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,100..1000&display=swap');
```

A plain `wght@400;500;700` URL gets a 37 KB file with the axis instanced away — every size renders
from the 14px drawing, and the tuning above silently does not happen. The variable file is 63 KB and
covers every weight, so it is one request either way. `font-optical-sizing: auto` on `body` turns
the axis on; the `mott-*` classes get it regardless, since the `font` shorthand they use resets that
property to `auto`.

One caveat if you use the tokens by hand: the composite `--md-sys-typescale-<role>` is a `font`
shorthand, and that property has no slot for letter-spacing, so apply
`--md-sys-typescale-<role>-tracking` alongside it. The `mott-*` utilities and `<Text>` already do.

Controls with centred text (`mott-btn`, and anything given `mott-trim`) also trim the half-leading
above and below the glyphs via `text-box`, so the label is optically centred rather than sitting
low. It is behind `@supports` — Firefox has not shipped it — and the padding is set to work either
way.

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
          success('Saved');
        } catch (error) {
          danger({ title: 'Error', message: error.message });
        }
      }}
    >
      Save
    </Button>
  );
}

// mount once, above everything that calls useToast()
<ToastProvider max={3} duration={4000}>
  <App />
</ToastProvider>
```

---

### Auth modals

`LoginModal`, `RegisterModal`, `OtpModal` and `RecoverPasswordModal` are the same panel with different
contents: brand line, title, fields, primary button, Google button, and a switch line at the bottom.
They compose the components already in this library, so they inherit the typescale and the colour
roles rather than restating them.

**Every field is controlled by you.** The modal renders what it is given and reports what was typed;
it never holds the value. That is what lets you validate as the user types, keep what was entered
across a failed submit, or prefill from somewhere else. As everywhere in this library, the change
handler receives the **value**, not the event.

```jsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');

<LoginModal
  open={open}
  onClose={() => setOpen(false)}
  triggerRef={buttonRef}
  brand="Your brand"
  logo={<Shape name="flower" size="20px" />}
  email={email} onEmailChange={setEmail}
  password={password} onPasswordChange={setPassword}
  error={error}
  onSubmit={() => signIn(email, password).catch((e) => setError(e.message))}
  onGoogle={signInWithGoogle}
  onSwitch={() => setScreen('register')}
/>
```

No authentication happens in here. The modal calls `onSubmit` and `onGoogle` and has no idea what
comes after — checking the email, calling an API, storing a token, and deciding what makes a password
valid all stay with whoever knows the answer. Handing it an `error` string is how the result gets
back on screen.

`loading` disables the buttons and the fields while a request is in flight. `triggerRef` is passed
straight through to `CustomModal`, so the panel morphs out of the button that opened it.

`OtpModal` renders one string as six boxes: typing advances, Backspace in an empty box steps back and
clears the previous one, arrows move, and pasting a whole code fills it from the box you are on.
Non-digits are dropped, and a code longer than the field is truncated rather than spilling.

#### Recovering a password

`RecoverPasswordModal` is that same code field and then a pair of password fields, in one panel that
never closes in between. **Which step is showing is a prop, not internal state**: moving on means the
code was accepted, and only you can ask the server that. `onVerifyCode` runs on the first step,
`onSubmitPassword` on the second, and you move `step` when the answer comes back.

```jsx
const [step, setStep] = useState('code');   // 'code' | 'password'

<RecoverPasswordModal
  open={open}
  onClose={() => setOpen(false)}
  triggerRef={buttonRef}
  step={step}
  email={email}
  code={code} onCodeChange={setCode}
  onVerifyCode={() => verifyCode(code).then(() => setStep('password'), (e) => setError(e.message))}
  onResend={() => sendCode(email)}
  password={password} onPasswordChange={setPassword}
  confirmPassword={confirm} onConfirmPasswordChange={setConfirm}
  onSubmitPassword={() => resetPassword(password).then(() => setScreen('login'))}
  error={error}
  onSwitch={() => setScreen('login')}
/>
```

Saving is the end of it — there is no success step. `onSubmitPassword` runs and you hand the user
back to the login modal to come in with what they just set; the switch line on that step points there
too, for someone who remembered their password halfway through. Nothing in here compares the two
password fields: as everywhere else, the rule belongs to whoever knows it, and the verdict comes back
as `error`.

The way in is `onForgotPassword` on `LoginModal` — an optional callback that renders a link under the
password field. Leave it out and no link appears.

**The Google mark keeps its own colours.** `GoogleIcon` is four fixed brand hexes and does not follow
the seed — it is somebody else's logo, and repainting it would make it a different logo. It is
exported on its own if you want to build the button yourself.

---

### Navbar

Icons on a vertical rail on desktop, a floating pill bar on mobile — `Navbar` renders both and lets
CSS pick one with a `md:` breakpoint. `items` is the array of buttons, `logo` is an optional one that
opens separately (a menu, a home link), and `align` (`'center'` | `'top'`) only affects the desktop
rail — the mobile bar is always at the bottom.

**The desktop rail reserves its own column; it does not float over your page.** It is `position:
sticky`, not `fixed` — a `fixed` element paints above ordinary flow content no matter what z-index you
give it, because that is how CSS's painting order works, so a rail that has to sit *beside* your
content rather than *over* it has to stay part of the document flow instead. That means it needs a
place to push content into — mount it as a flex-row sibling of your page content, typically once near
the root of your app:

```jsx
// app/layout.jsx
<div className="flex min-h-dvh">
  <Navbar items={items} logo={logo} onChange={setRoute} selected={route} />
  <main className="flex-1 min-w-0 p-8">{children}</main>
</div>
```

**The rail is exactly its own buttons wide — 64px — and carries no margin of its own**, so it sits
flush against the left edge and everything else starts where it ends. That is the 56px of
`--control-size-md` plus 4px per side, and those 4px are not breathing room: a selected item paints a
pill scaled to 62px over its 56px box, so it overhangs ~3px each way and the window edge would shave
that off. Because of it, **the page's padding belongs to the `<main>`, never to the row** — padding on
the flex row is exactly what pushes the rail off the edge, and a heading left outside the `<main>` is
a heading that does not respect the rail's column. `min-w-0` is there so wide content inside the
`<main>` shrinks instead of forcing the row wider than the viewport.

It still stays pinned in view while the page scrolls — `sticky` plus a full-viewport-tall box gives it
the same "always visible" feel `fixed` had, just without sitting on top of anything. The mobile bar is
the opposite on purpose: a bottom bar is expected to float over the last bit of content, so it keeps
its own `fixed` position and an elevated z-index.

---

## Design tokens

[`src/globals.css`](./src/globals.css) is the single source of truth. Beyond the colour roles it
defines:

| group | tokens |
|---|---|
| Typography | `--md-ref-typeface-brand/plain`, `--md-ref-typeface-weight-*`, `--md-sys-typescale-<role>-{font,size,line-height,tracking,weight}` for the fifteen roles, `--font-family`, `--tracking-caps` |
| Title emphasis | `--md-sys-title-emphasis-{weight,tracking,opsz}`, applied by the `.mott-title-emphasis` class — not tied to modals, layer it **on top of** any typescale role to make a title read heavier and tighter |
| Radii | `--radius-sm`, `--radius-lg`, `--radius-default`, `--radius-full`, `--radius-modal`, `--control-radius` |
| Spacing | `--pad-button`, `--pad-input`, `--pad-card`, `--pad-badge-*`, `--gap-tight` → `--gap-page` |
| Sizing | `--sm-icon` → `--xl-icon`, `--control-size-sm/md/lg` |
| Motion & depth | `--ease-morph`, `--shadow-floating`, `--z-nav`, `--z-floating`, `--fade-edge` |

Dark mode is handled in two places that must stay in sync: an explicit `[data-theme="dark"]` block,
and a `prefers-color-scheme: dark` media query guarded by `:root:not([data-theme="light"])`. **When
you add a token, add it to all three blocks** — `:root`, the attribute, and the media query.

---

## Development

```bash
npm install     # postinstall is a no-op here, by design
npm run dev     # Vite playground with every component on one page
npm run build   # tsup -> dist/index.js (ESM), then copies globals.css -> dist/
npm run theme   # regenerate the static token block in src/globals.css from the default seed
```

There is no lint, test, or typecheck script yet.

A note on `typescript`: it is a required devDependency even though the project has no `.ts` files at
all. tsup does an unconditional `require('typescript')` internally, so removing it breaks the build.

### Project layout

```
index.js              re-exports everything — a component does not exist for consumers until it is listed here
src/
  <component>/        one folder per component
  theme/              palette.js (the M3 engine) · roles.js (families and intents) · themeContext.jsx · themeModal.jsx
  animations/         modalAnimation.js — the morph and anchored transitions
  utils/              verifyTypes.js (the prop spec) · scrollLock.js
  globals.css         every design token
playground/           the Vite dev app
scripts/              generateTheme.js · uploadCss.js (the postinstall)
```

**Adding a component:** create `src/<name>/<name>.jsx`, start it with `'use client'`, take colour
from [`src/theme/roles.js`](./src/theme/roles.js) rather than writing a hex, add a validator to
`verifyTypes.js`, and re-export it from `index.js`. Nothing is visible to a consumer until that last
step.

---

## License

ISC © [@danelmott](https://github.com/danelmott)
