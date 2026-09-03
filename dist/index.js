// src/buttons/button.jsx
import { forwardRef } from "react";
import { cva as cva2 } from "class-variance-authority";
import { twMerge as twMerge2 } from "tailwind-merge";

// src/animations/motion.js
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
gsap.registerPlugin(CustomEase);
var DURATION = {
  instant: 0.12,
  fast: 0.2,
  base: 0.28,
  slow: 0.4,
  modal: 0.55,
  /*El morph de seleccion pide la suya. Con --duration-base y la curva vieja el 78% del
        recorrido cabia en los primeros 70ms y los 210 restantes no ensenaban nada: se leia como un
        salto, no como un movimiento. Repartida la curva, este numero ES el tiempo que se ve - por eso
        es mas corto de lo que parece que deberia.
  
        Bajo de 300 a 220 y de ahi a 120 al mover la geometria fuera del boton (ver `mott-morph` en
        globals.css). Lo que ataba el numero por abajo no era la lectura, era el temblor: cuanto mas
        corta la curva, mas px avanza el glifo entre cuadro y cuadro y mas se notaba el rehinteado.
        Sin glifos que reescalar ese suelo desaparece. A 120ms - siete cuadros a 60fps - la seleccion
        ya no acompana al clic, contesta; queda a la par de --duration-instant, que es lo que dura el
        pulsado, asi que encoger y morfear se leen como una sola respuesta.*/
  morph: 0.12,
  // The odd one out: every value above answers a click, so it is measured in how fast a control
  // can respond. This one is the length of a journey across a surface - a highlight sweeping a
  // control - and a travel that reads as light has to take its time.
  sweep: 0.9
};
var EASE = {
  standard: CustomEase.create("mottStandard", "0.2, 0, 0, 1"),
  emphasized: CustomEase.create("mottEmphasized", "0.32, 0.72, 0, 1"),
  inOut: CustomEase.create("mottInOut", "0.65, 0, 0.35, 1"),
  exit: CustomEase.create("mottExit", "0.3, 0, 0.8, 0.15"),
  morph: CustomEase.create("mottMorph", "0.35, 0, 0.45, 1")
};
var MORPH = {
  duration: DURATION.morph,
  ease: EASE.morph,
  overwrite: "auto",
  force3D: true
};
var MORPH_SCALE = 62 / 56;
var HANDOFF = { out: 0.8, lead: 0.1 };
var morphTo = (el, shape, { entering = false } = {}) => {
  gsap.set(el, { willChange: "transform" });
  return gsap.to(el, {
    ...shape,
    ...MORPH,
    // dur() lo colapsa a 0 con prefers-reduced-motion; onComplete sigue disparando, asi que el
    // will-change se limpia igual y el control simplemente llega en el primer cuadro.
    duration: dur(entering ? DURATION.morph : DURATION.morph * HANDOFF.out),
    delay: entering ? dur(DURATION.morph * HANDOFF.lead) : 0,
    onComplete: () => gsap.set(el, { clearProps: "willChange" })
  });
};
var PRESS_SCALE = 0.94;
var pressing = /* @__PURE__ */ new WeakSet();
var release = (base) => (event) => {
  const el = event.currentTarget;
  if (!pressing.delete(el)) return;
  gsap.to(el, {
    scale: base,
    duration: dur(DURATION.fast),
    ease: EASE.standard,
    overwrite: "auto",
    force3D: false,
    // El will-change se suelta cuando el control ha vuelto a su sitio, no antes: si se quitara
    // al soltar el dedo, la capa se destruiria justo al empezar el camino de vuelta y el
    // temblor volveria en la mitad de la animacion que mas se mira.
    onComplete: () => gsap.set(el, { clearProps: "willChange" })
  });
};
var pressHandlers = (base = 1, scale = PRESS_SCALE) => ({
  onPointerDown: (event) => {
    const el = event.currentTarget;
    pressing.add(el);
    gsap.set(el, { willChange: "transform" });
    gsap.to(el, {
      scale: base * scale,
      duration: dur(DURATION.instant),
      ease: EASE.standard,
      overwrite: "auto",
      /*`force3D: false` en los dos tweens, y es la otra mitad del arreglo del temblor - la que
                    explica el SALTO, no el rehintado.
      
                    Por defecto GSAP va en `force3D: 'auto'`: escribe una matriz 3D mientras el tween corre
                    y vuelve a la 2D al acabar. Ese cambio de tipo de matriz no es neutro - una 3D se
                    compone en su propia capa y redondea a pixel distinto que una 2D - asi que el contenido
                    del boton pega un tironcito en el cuadro en que arranca el tween y otro en el que
                    termina. Justo lo que se ve: el salto es del contenido, y ocurre cuando el boton empieza
                    a encoger.
      
                    Aqui la capa no hace falta pedirla por esa via: el `will-change` de arriba ya la ha
                    pedido, y encima con un cuadro de adelanto. Fijada la matriz en 2D no hay ningun cambio
                    de tipo a mitad del gesto - una sola promocion, puesta antes de empezar y soltada al
                    aterrizar.*/
      force3D: false
    });
  },
  onPointerUp: release(base),
  onPointerLeave: release(base),
  onPointerCancel: release(base)
});
var pressProps = (props, { base = 1, scale = PRESS_SCALE } = {}) => {
  const press = pressHandlers(base, scale);
  const merged = {};
  for (const key of Object.keys(press)) {
    const own = props == null ? void 0 : props[key];
    merged[key] = own ? (event) => {
      press[key](event);
      own(event);
    } : press[key];
  }
  return merged;
};
var longForm = (value) => `${value} ${value} ${value} ${value} / ${value} ${value} ${value} ${value}`;
var CIRCLE_RADIUS = longForm("50%");
var squircleRadius = () => longForm(
  typeof document !== "undefined" && getComputedStyle(document.documentElement).getPropertyValue("--control-radius").trim() || "28%"
);
var CIRCLE_PCT = 50;
var squirclePct = () => typeof document !== "undefined" && parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--control-radius")) || 28;
var selectionShape = (selected) => ({
  "--mott-morph-r": selected ? squirclePct() : CIRCLE_PCT,
  "--mott-morph-scale": selected ? MORPH_SCALE : 1
});
var morphSelection = (el, selected) => gsap.to(el, {
  ...selectionShape(selected),
  duration: dur(selected ? DURATION.morph : DURATION.morph * HANDOFF.out),
  delay: selected ? dur(DURATION.morph * HANDOFF.lead) : 0,
  ease: EASE.morph,
  // sin esto, un segundo clic apila un tween nuevo sobre el que sigue corriendo y los dos
  // escriben la misma variable en el mismo cuadro desde origenes distintos
  overwrite: "auto"
});
var prefersReducedMotion = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var dur = (seconds) => prefersReducedMotion() ? 0 : seconds;

// src/theme/roles.js
var family = (fill, on, container, onContainer) => ({
  fill: `var(${fill})`,
  on: `var(${on})`,
  container: `var(${container})`,
  onContainer: `var(${onContainer})`
});
var FAMILIES = {
  primary: family(
    "--md-sys-color-primary",
    "--md-sys-color-on-primary",
    "--md-sys-color-primary-container",
    "--md-sys-color-on-primary-container"
  ),
  secondary: family(
    "--md-sys-color-secondary",
    "--md-sys-color-on-secondary",
    "--md-sys-color-secondary-container",
    "--md-sys-color-on-secondary-container"
  ),
  tertiary: family(
    "--md-sys-color-tertiary",
    "--md-sys-color-on-tertiary",
    "--md-sys-color-tertiary-container",
    "--md-sys-color-on-tertiary-container"
  ),
  danger: family(
    "--md-sys-color-error",
    "--md-sys-color-on-error",
    "--md-sys-color-error-container",
    "--md-sys-color-on-error-container"
  ),
  success: family(
    "--md-custom-color-success",
    "--md-custom-color-on-success",
    "--md-custom-color-success-container",
    "--md-custom-color-on-success-container"
  ),
  warning: family(
    "--md-custom-color-warning",
    "--md-custom-color-on-warning",
    "--md-custom-color-warning-container",
    "--md-custom-color-on-warning-container"
  ),
  neutral: family(
    "--md-sys-color-inverse-surface",
    "--md-sys-color-inverse-on-surface",
    "--md-sys-color-surface-container",
    "--md-sys-color-on-surface"
  )
};
var TRANSPARENT = "transparent";
var filled = (name) => {
  const { fill, on } = FAMILIES[name];
  return { surface: fill, on };
};
var tonal = (name) => {
  const { container, onContainer } = FAMILIES[name];
  return { surface: container, on: onContainer };
};
var text = (name) => {
  const { fill } = FAMILIES[name];
  return { surface: TRANSPARENT, on: fill };
};
var CONTROL_FAMILY = {
  default: "neutral",
  // carries no weight of its own - Cancel, Back
  action: "primary",
  // the one thing the screen is for - Save, Send
  support: "secondary",
  // helps the main action without competing with it
  danger: "danger",
  // destructive - Delete, Revoke
  success: "success",
  // confirms something that went right - Approve
  warning: "warning"
  // caution that does not destroy - Archive, Suspend
};
var CONTROL_NAMES = [...Object.keys(CONTROL_FAMILY), "ghost"];
var controlTint = (name, quiet = false) => {
  if (name === "ghost") return text("primary");
  const key = CONTROL_FAMILY[name];
  if (!key) return null;
  if (key === "neutral") return tonal("neutral");
  return quiet ? tonal(key) : filled(key);
};
var SELECTION_FAMILY = {
  default: "secondary",
  action: "primary",
  support: "secondary",
  danger: "danger",
  success: "success",
  warning: "warning",
  ghost: "secondary"
};
var selectionTint = (name) => tonal(SELECTION_FAMILY[name] ?? "secondary");
var ACCENTS = {
  primary: FAMILIES.primary.fill,
  info: FAMILIES.primary.fill,
  secondary: FAMILIES.secondary.fill,
  success: FAMILIES.success.fill,
  warning: FAMILIES.warning.fill,
  danger: FAMILIES.danger.fill
};
var ACCENT_ON = {
  primary: FAMILIES.primary.on,
  info: FAMILIES.primary.on,
  secondary: FAMILIES.secondary.on,
  success: FAMILIES.success.on,
  warning: FAMILIES.warning.on,
  danger: FAMILIES.danger.on
};

// src/shapes/shapePaths.js
var TAU = Math.PI * 2;
var BOX = 100;
var GAP = 0.92;
var round = (n) => Math.round(n * 100) / 100;
var distance = ([ax, ay], [bx, by]) => Math.hypot(bx - ax, by - ay);
var along = ([fx, fy], [tx, ty], length) => {
  const span = distance([fx, fy], [tx, ty]) || 1;
  return [fx + (tx - fx) / span * length, fy + (ty - fy) / span * length];
};
var polar = (angle, radius, [cx, cy] = [50, 50]) => [
  cx + Math.cos(angle) * radius,
  cy + Math.sin(angle) * radius
];
var lineTo = (to) => ({ type: "L", to });
var arcTo = (to, radius, center, sweep) => ({ type: "A", to, radius, center, sweep });
function turned(segment, from) {
  const { center, sweep } = segment;
  const start = Math.atan2(from[1] - center[1], from[0] - center[0]);
  const end = Math.atan2(segment.to[1] - center[1], segment.to[0] - center[0]);
  let delta = end - start;
  if (sweep === 1 && delta < 0) delta += TAU;
  if (sweep === 0 && delta > 0) delta -= TAU;
  return { start, delta };
}
var STEPS = 12;
function samples(segment, from) {
  if (segment.type === "L") return [segment.to];
  const { start, delta } = turned(segment, from);
  const points = [];
  for (let i = 1; i <= STEPS; i += 1) {
    points.push(polar(start + delta * i / STEPS, segment.radius, segment.center));
  }
  return points;
}
function advances(start, segments) {
  let cursor = start;
  let previous2 = Math.atan2(start[1] - 50, start[0] - 50);
  for (const segment of segments) {
    for (const point of samples(segment, cursor)) {
      const angle = Math.atan2(point[1] - 50, point[0] - 50);
      let step = angle - previous2;
      while (step > Math.PI) step -= TAU;
      while (step < -Math.PI) step += TAU;
      if (step < -1e-9) return false;
      previous2 = angle;
    }
    cursor = segment.to;
  }
  return true;
}
function fit(start, segments) {
  let cursor = start;
  const points = [start];
  for (const segment of segments) {
    points.push(...samples(segment, cursor));
    cursor = segment.to;
  }
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const scaleX = BOX / (Math.max(...xs) - minX);
  const scaleY = BOX / (Math.max(...ys) - minY);
  const move = ([x, y]) => [(x - minX) * scaleX, (y - minY) * scaleY];
  return [
    move(start),
    segments.map((segment) => segment.type === "L" ? lineTo(move(segment.to)) : {
      ...segment,
      to: move(segment.to),
      // the two radii part company here - that is the ellipse the stretch creates
      radius: [segment.radius * scaleX, segment.radius * scaleY]
    })
  ];
}
function serialize(start, segments) {
  const xy = ([x, y]) => `${round(x)} ${round(y)}`;
  const body = segments.map((segment) => {
    if (segment.type === "L") return `L ${xy(segment.to)}`;
    const [rx, ry] = segment.radius;
    return `A ${round(Math.abs(rx))} ${round(Math.abs(ry))} 0 ${segment.large} ${segment.sweep} ${xy(segment.to)}`;
  });
  return `M ${xy(start)} ${body.join(" ")} Z`;
}
function build(start, segments) {
  let cursor = start;
  const flagged = segments.map((segment) => {
    if (segment.type === "L") {
      cursor = segment.to;
      return segment;
    }
    const { delta } = turned(segment, cursor);
    cursor = segment.to;
    return { ...segment, large: Math.abs(delta) > Math.PI ? 1 : 0 };
  });
  return serialize(...fit(start, flagged));
}
function roundedPolygon(vertices, radius) {
  const total = vertices.length;
  const corners = vertices.map((vertex, index) => {
    const previous2 = vertices[(index - 1 + total) % total];
    const next = vertices[(index + 1) % total];
    const incoming = Math.atan2(vertex[1] - previous2[1], vertex[0] - previous2[0]);
    const outgoing = Math.atan2(next[1] - vertex[1], next[0] - vertex[0]);
    let turn = outgoing - incoming;
    while (turn <= -Math.PI) turn += TAU;
    while (turn > Math.PI) turn -= TAU;
    const half = (Math.PI - Math.abs(turn)) / 2;
    const limit = Math.min(distance(previous2, vertex), distance(vertex, next)) / 2;
    const cut = Math.min(radius / Math.tan(half), limit);
    const start = along(vertex, previous2, cut);
    const end = along(vertex, next, cut);
    const bisector = Math.atan2(
      (start[1] + end[1]) / 2 - vertex[1],
      (start[0] + end[0]) / 2 - vertex[0]
    );
    return {
      start,
      end,
      // the corner circle sits on the bisector, one hypotenuse away from the vertex
      center: polar(bisector, cut / Math.cos(half), vertex),
      radius: cut * Math.tan(half),
      sweep: turn > 0 ? 1 : 0
    };
  });
  const segments = [];
  corners.forEach((corner, index) => {
    if (index > 0) segments.push(lineTo(corner.start));
    segments.push(arcTo(corner.end, corner.radius, corner.center, corner.sweep));
  });
  return build(corners[0].start, segments);
}
function scallop(points, { innerRadius, bumpRadius }) {
  const step = TAU / points;
  const start = -Math.PI / 2;
  const k = Math.cos(Math.PI / points);
  const clearance = Math.sin(Math.PI / points);
  const widest = Math.min(bumpRadius, GAP * (50 * clearance) / (1 + clearance));
  const filleted = (bump, inner) => {
    const centre = 50 - bump;
    const valley = (bump * bump - centre * centre - inner * inner + 2 * centre * k * inner) / (2 * (inner - centre * k - bump));
    if (valley < 0.5) return null;
    const bumpCentre = (i) => polar(start + step * i, centre);
    const valleyCentre = (i) => polar(start + step * (i + 0.5), inner + valley);
    const touch = (i, j) => along(bumpCentre(i), valleyCentre(j), bump);
    const segments = [];
    for (let i = 0; i < points; i += 1) {
      segments.push(arcTo(touch(i, i), bump, bumpCentre(i), 1));
      segments.push(arcTo(touch(i + 1, i), valley, valleyCentre(i), 0));
    }
    return { first: touch(0, -1), segments };
  };
  const onCore = (bump, inner) => {
    const centre = 50 - bump;
    const cosine = (inner * inner + centre * centre - bump * bump) / (2 * inner * centre);
    if (cosine < -1 || cosine > 1) return null;
    const reach = Math.acos(cosine);
    if (reach >= step / 2) return null;
    const segments = [];
    for (let i = 0; i < points; i += 1) {
      const angle = start + step * i;
      segments.push(arcTo(polar(angle + reach, inner), bump, polar(angle, centre), 1));
      segments.push(arcTo(polar(angle + step - reach, inner), inner, [50, 50], 1));
    }
    return { first: polar(start - reach, inner), segments };
  };
  for (let bump = widest; bump > 1; bump *= 0.9) {
    for (let inner = innerRadius; inner < 50; inner += 1) {
      for (const attempt of [filleted(bump, inner), onCore(bump, inner)]) {
        if (attempt && advances(attempt.first, attempt.segments)) {
          return build(attempt.first, attempt.segments);
        }
      }
    }
  }
  return "M 50 0 A 50 50 0 1 1 49.99 0 Z";
}
var ARCH = "M 0 50 A 50 50 0 0 1 100 50 L 100 84 A 16 16 0 0 1 84 100 L 16 100 A 16 16 0 0 1 0 84 Z";
var SHAPE_PATHS = {
  triangle: roundedPolygon([[50, 0], [100, 100], [0, 100]], 17),
  diamond: roundedPolygon([[50, 0], [100, 50], [50, 100], [0, 50]], 26),
  arch: ARCH,
  // deep valleys and a fat bump: each petal swings well past a half circle, so it comes out an
  // oval joined to its neighbours by a narrow notch
  flower: ({ points = 8 } = {}) => scallop(points, { innerRadius: 34, bumpRadius: 12.5 }),
  // shallow valleys and a small bump: the wave barely dips, which is what a scalloped biscuit is
  cookie: ({ points = 20 } = {}) => scallop(points, { innerRadius: 46, bumpRadius: 11 })
};
var SHAPE_NAMES = Object.keys(SHAPE_PATHS);
var SCALLOPED_SHAPES = ["flower", "cookie"];
var shapePath = (name, options) => {
  const shape = SHAPE_PATHS[name];
  return typeof shape === "function" ? shape(options) : shape;
};

// src/text/text.jsx
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { jsx } from "react/jsx-runtime";
var TYPESCALE_ROLES = [
  "display-large",
  "display-medium",
  "display-small",
  "headline-large",
  "headline-medium",
  "headline-small",
  "title-large",
  "title-medium",
  "title-small",
  "body-large",
  "body-medium",
  "body-small",
  "label-large",
  "label-medium",
  "label-small"
];
var textVariants = cva("", {
  variants: {
    variant: {
      "display-large": "mott-display-large",
      "display-medium": "mott-display-medium",
      "display-small": "mott-display-small",
      "headline-large": "mott-headline-large",
      "headline-medium": "mott-headline-medium",
      "headline-small": "mott-headline-small",
      "title-large": "mott-title-large",
      "title-medium": "mott-title-medium",
      "title-small": "mott-title-small",
      "body-large": "mott-body-large",
      "body-medium": "mott-body-medium",
      "body-small": "mott-body-small",
      "label-large": "mott-label-large",
      "label-medium": "mott-label-medium",
      "label-small": "mott-label-small"
    }
  },
  defaultVariants: {
    variant: "body-medium"
  }
});
var TONE = {
  default: "var(--md-sys-color-on-surface)",
  muted: "var(--md-sys-color-on-surface-variant)"
};
function Text({
  children,
  variant,
  as: Tag = "p",
  tone = "default",
  className,
  style,
  ...props
}) {
  verifyTypesText({ variant, as: Tag, tone });
  const role = TYPESCALE_ROLES.includes(variant) ? variant : void 0;
  return /* @__PURE__ */ jsx(
    Tag,
    {
      className: twMerge(textVariants({ variant: role }), className),
      style: {
        color: TONE[tone] ?? TONE.default,
        ...style
      },
      ...props,
      children
    }
  );
}

// src/utils/verifyTypes.js
var prefixLog = "[MOTT-COMPONENTS]";
var show = (value) => typeof value === "string" ? `"${value}"` : String(value);
var fail = (component, message) => {
  throw new TypeError(`${prefixLog} <${component}>: ${message}`);
};
var warn = (component, message) => {
  console.error(`${prefixLog} <${component}>: ${message}`);
};
function assertType(component, prop, value, expected) {
  if (value === void 0 || value === null) return;
  if (typeof value !== expected) {
    fail(component, `\`${prop}\` must be a ${expected}, received ${typeof value} (${show(value)}).`);
  }
}
function assertRequired(component, prop, value) {
  if (value === void 0 || value === null) {
    fail(component, `missing required prop \`${prop}\`.`);
  }
}
function assertRange(component, prop, value, min, max) {
  if (value === void 0 || value === null) return;
  assertType(component, prop, value, "number");
  if (Number.isNaN(value) || value < min || value > max) {
    fail(component, `\`${prop}\` must be a number between ${min} and ${max}, received ${show(value)}.`);
  }
}
function assertOneOf(component, prop, value, allowed, fallback) {
  if (value === void 0 || value === null) return;
  if (!allowed.includes(value)) {
    warn(
      component,
      `invalid \`${prop}\`: ${show(value)}. Valid values: ${allowed.join(", ")}.` + (fallback !== void 0 ? ` Falling back to ${show(fallback)}.` : "")
    );
  }
}
function assertArrayOf(component, prop, value, validateItem) {
  if (value === void 0 || value === null) return;
  if (!Array.isArray(value)) {
    fail(component, `\`${prop}\` must be an array, received ${typeof value}.`);
  }
  value.forEach((item, i) => validateItem(item, `${prop}[${i}]`));
}
function assertRef(component, prop, value) {
  if (value === void 0 || value === null) return;
  if (typeof value === "function") return;
  if (typeof value !== "object" || !("current" in value)) {
    fail(component, `\`${prop}\` must be a ref (useRef or callback), received ${show(value)}.`);
  }
}
function assertIconLike(component, prop, value) {
  if (value === void 0 || value === null) return;
  if (typeof value === "string" || typeof value === "object") return;
  fail(component, `\`${prop}\` must be an icon name (string) or a React node, received ${typeof value}.`);
}
function assertNode(component, prop, value) {
  if (value === void 0 || value === null) return;
  if (typeof value === "string" || typeof value === "number" || typeof value === "object") return;
  fail(component, `\`${prop}\` must be text or a React node, received ${typeof value}.`);
}
function assertAnimation(component, prop, value) {
  if (value === void 0 || value === null) return;
  if (typeof (value == null ? void 0 : value.open) !== "function" || typeof (value == null ? void 0 : value.close) !== "function") {
    fail(component, `\`${prop}\` must be a ModalAnimation (with \`open\` and \`close\` methods). See src/animations/modalAnimation.js.`);
  }
}
function assertPlainObject(component, prop, value) {
  if (value === void 0 || value === null) return;
  if (typeof value !== "object" || Array.isArray(value)) {
    fail(component, `\`${prop}\` must be an object, received ${Array.isArray(value) ? "array" : typeof value}.`);
  }
}
var CONTROL_SIZES = ["sm", "md", "lg"];
var BUTTON_TYPES = ["button", "submit", "reset"];
var TOAST_VARIANTS = ["info", "success", "warning", "danger"];
var OPTION_TONES = ["default", "danger"];
var INPUT_TYPES = ["text", "number", "password"];
function verifyTypesInput({ label, placeholder, type } = {}) {
  assertType("Input", "label", label, "string");
  assertType("Input", "placeholder", placeholder, "string");
  assertOneOf("Input", "type", type, INPUT_TYPES, "text");
  return true;
}
function verifyTypesTextarea({ label, placeholder, width, height } = {}) {
  assertType("Textarea", "label", label, "string");
  assertType("Textarea", "placeholder", placeholder, "string");
  assertType("Textarea", "width", width, "string");
  assertType("Textarea", "height", height, "string");
  return true;
}
function verifyTypesSearch({ label, placeholder, delay, onSearch, onChange, value, defaultValue } = {}) {
  assertType("Search", "label", label, "string");
  assertType("Search", "placeholder", placeholder, "string");
  assertType("Search", "value", value, "string");
  assertType("Search", "defaultValue", defaultValue, "string");
  assertType("Search", "onSearch", onSearch, "function");
  assertType("Search", "onChange", onChange, "function");
  assertRange("Search", "delay", delay, 0, 6e4);
  return true;
}
function verifyTypesButton({ variant, quiet, shape, iconOnly, fullWidth, type } = {}) {
  assertOneOf("Button", "variant", variant, CONTROL_NAMES, "default");
  assertOneOf("Button", "shape", shape, ["rounded", "pill"], "rounded");
  assertOneOf("Button", "type", type, BUTTON_TYPES, "button");
  assertType("Button", "quiet", quiet, "boolean");
  assertType("Button", "iconOnly", iconOnly, "boolean");
  assertType("Button", "fullWidth", fullWidth, "boolean");
  return true;
}
function verifyTypesIconButton(component, { icon, variant, quiet, size, type } = {}) {
  assertRequired(component, "icon", icon);
  assertType(component, "icon", icon, "string");
  assertOneOf(component, "variant", variant, CONTROL_NAMES, "action");
  assertOneOf(component, "size", size, CONTROL_SIZES, "md");
  assertOneOf(component, "type", type, BUTTON_TYPES, "button");
  assertType(component, "quiet", quiet, "boolean");
  return true;
}
function verifyTypesButtonGroup({ buttons, vertical, variant, allowDeselect, onChange, value, defaultSelected } = {}) {
  assertRequired("ButtonGroup", "buttons", buttons);
  assertArrayOf("ButtonGroup", "buttons", buttons, (item, path) => {
    assertPlainObject("ButtonGroup", path, item);
    if (!item) return;
    assertIconLike("ButtonGroup", `${path}.icon`, item.icon);
    assertType("ButtonGroup", `${path}.label`, item.label, "string");
    assertType("ButtonGroup", `${path}.ariaLabel`, item.ariaLabel, "string");
    assertRef("ButtonGroup", `${path}.buttonRef`, item.buttonRef);
    if (item.icon === void 0 && item.label === void 0) {
      warn("ButtonGroup", `${path} has no \`icon\` or \`label\`: it will render empty.`);
    }
  });
  assertType("ButtonGroup", "vertical", vertical, "boolean");
  assertType("ButtonGroup", "allowDeselect", allowDeselect, "boolean");
  assertOneOf("ButtonGroup", "variant", variant, CONTROL_NAMES, "support");
  assertType("ButtonGroup", "onChange", onChange, "function");
  assertType("ButtonGroup", "value", value, "number");
  assertType("ButtonGroup", "defaultSelected", defaultSelected, "number");
  return true;
}
function verifyTypesIcon({ name, size, filled: filled2, weight, grade, opticalSize } = {}) {
  assertType("Icon", "name", name, "string");
  assertType("Icon", "size", size, "string");
  assertType("Icon", "filled", filled2, "boolean");
  assertRange("Icon", "weight", weight, 100, 700);
  assertRange("Icon", "grade", grade, -50, 200);
  assertRange("Icon", "opticalSize", opticalSize, 20, 48);
  return true;
}
function verifyTypesShape({ name, size, color, contentColor, points, rotate, label } = {}) {
  assertRequired("Shape", "name", name);
  assertOneOf("Shape", "name", name, SHAPE_NAMES);
  assertType("Shape", "size", size, "string");
  assertType("Shape", "color", color, "string");
  assertType("Shape", "contentColor", contentColor, "string");
  assertType("Shape", "label", label, "string");
  assertRange("Shape", "points", points, 3, 24);
  assertRange("Shape", "rotate", rotate, -360, 360);
  if (typeof color === "string" && !ACCENTS[color] && CONTROL_NAMES.includes(color)) {
    warn("Shape", `\`color\` takes an accent (${Object.keys(ACCENTS).join(", ")}) or any CSS colour, not the button intent ${show(color)}.`);
  }
  if (points !== void 0 && points !== null && !SCALLOPED_SHAPES.includes(name)) {
    warn("Shape", `\`points\` only applies to ${SCALLOPED_SHAPES.join(" and ")}: it does nothing on ${show(name)}.`);
  }
  return true;
}
function verifyTypesAvatar({ seed, styleDefinition, options, size, shape, alt } = {}) {
  assertRequired("Avatar", "seed", seed);
  assertType("Avatar", "seed", seed, "string");
  assertType("Avatar", "size", size, "string");
  assertType("Avatar", "alt", alt, "string");
  assertOneOf("Avatar", "shape", shape, SHAPE_NAMES);
  assertPlainObject("Avatar", "styleDefinition", styleDefinition);
  assertPlainObject("Avatar", "options", options);
  return true;
}
function verifyTypesText({ variant, as, tone } = {}) {
  assertOneOf("Text", "variant", variant, TYPESCALE_ROLES, "body-medium");
  assertOneOf("Text", "tone", tone, ["default", "muted"], "default");
  if (as !== void 0 && as !== null && typeof as !== "string" && typeof as !== "function" && typeof as !== "object") {
    fail("Text", `\`as\` must be a tag name or a component, received ${typeof as}.`);
  }
  return true;
}
function verifyTypesSelect({ options, onChange, label, placeholder, disabled } = {}) {
  assertArrayOf("Select", "options", options, (item, path) => {
    assertPlainObject("Select", path, item);
    if (!item) return;
    assertRequired("Select", `${path}.value`, item.value);
    assertNode("Select", `${path}.label`, item.label);
  });
  assertType("Select", "onChange", onChange, "function");
  assertType("Select", "label", label, "string");
  assertType("Select", "placeholder", placeholder, "string");
  assertType("Select", "disabled", disabled, "boolean");
  return true;
}
function verifyTypesLoading({ size, color, shapes, label } = {}) {
  assertType("Loading", "size", size, "string");
  assertType("Loading", "color", color, "string");
  assertType("Loading", "label", label, "string");
  assertArrayOf("Loading", "shapes", shapes, (item, prop) => {
    assertPlainObject("Loading", prop, item);
    assertRequired("Loading", `${prop}.name`, item == null ? void 0 : item.name);
    assertOneOf("Loading", `${prop}.name`, item == null ? void 0 : item.name, SHAPE_NAMES);
    if ((item == null ? void 0 : item.points) !== void 0 && !SCALLOPED_SHAPES.includes(item == null ? void 0 : item.name)) {
      warn("Loading", `\`${prop}.points\` does nothing on \`${item.name}\`. Only ${SCALLOPED_SHAPES.join(" and ")} count bumps.`);
    }
    assertRange("Loading", `${prop}.points`, item == null ? void 0 : item.points, 3, 60);
  });
  return true;
}
function verifyTypesCustomModal({ open, onClose, onCloseComplete, triggerRef, animation } = {}) {
  assertType("CustomModal", "open", open, "boolean");
  assertType("CustomModal", "onClose", onClose, "function");
  assertType("CustomModal", "onCloseComplete", onCloseComplete, "function");
  assertRef("CustomModal", "triggerRef", triggerRef);
  assertAnimation("CustomModal", "animation", animation);
  return true;
}
function verifyTypesAuthShell({
  open,
  onClose,
  triggerRef,
  logo,
  brand,
  title,
  submitLabel,
  onSubmit,
  onGoogle,
  googleLabel,
  switchText,
  switchAction,
  onSwitch,
  error,
  loading
} = {}) {
  assertType("AuthShell", "open", open, "boolean");
  assertType("AuthShell", "onClose", onClose, "function");
  assertRef("AuthShell", "triggerRef", triggerRef);
  assertNode("AuthShell", "logo", logo);
  assertType("AuthShell", "brand", brand, "string");
  assertType("AuthShell", "title", title, "string");
  assertType("AuthShell", "submitLabel", submitLabel, "string");
  assertType("AuthShell", "onSubmit", onSubmit, "function");
  assertType("AuthShell", "onGoogle", onGoogle, "function");
  assertType("AuthShell", "googleLabel", googleLabel, "string");
  assertType("AuthShell", "switchText", switchText, "string");
  assertType("AuthShell", "switchAction", switchAction, "string");
  assertType("AuthShell", "onSwitch", onSwitch, "function");
  assertType("AuthShell", "error", error, "string");
  assertType("AuthShell", "loading", loading, "boolean");
  return true;
}
function verifyTypesLoginModal({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onForgotPassword
} = {}) {
  assertType("LoginModal", "email", email, "string");
  assertType("LoginModal", "password", password, "string");
  assertType("LoginModal", "onEmailChange", onEmailChange, "function");
  assertType("LoginModal", "onPasswordChange", onPasswordChange, "function");
  assertType("LoginModal", "onSubmit", onSubmit, "function");
  assertType("LoginModal", "onForgotPassword", onForgotPassword, "function");
  return true;
}
function verifyTypesRegisterModal({
  email,
  password,
  confirmPassword,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit
} = {}) {
  assertType("RegisterModal", "email", email, "string");
  assertType("RegisterModal", "password", password, "string");
  assertType("RegisterModal", "confirmPassword", confirmPassword, "string");
  assertType("RegisterModal", "onEmailChange", onEmailChange, "function");
  assertType("RegisterModal", "onPasswordChange", onPasswordChange, "function");
  assertType("RegisterModal", "onConfirmPasswordChange", onConfirmPasswordChange, "function");
  assertType("RegisterModal", "onSubmit", onSubmit, "function");
  return true;
}
function verifyTypesOtpModal({ code, onCodeChange, length, onSubmit, email, onResend } = {}) {
  assertType("OtpModal", "code", code, "string");
  assertType("OtpModal", "onCodeChange", onCodeChange, "function");
  assertRange("OtpModal", "length", length, 2, 8);
  assertType("OtpModal", "onSubmit", onSubmit, "function");
  assertType("OtpModal", "email", email, "string");
  assertType("OtpModal", "onResend", onResend, "function");
  return true;
}
function verifyTypesRecoverPasswordModal({
  step,
  email,
  code,
  onCodeChange,
  length,
  onVerifyCode,
  onResend,
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmitPassword
} = {}) {
  assertOneOf("RecoverPasswordModal", "step", step, ["code", "password"], "code");
  assertType("RecoverPasswordModal", "email", email, "string");
  assertType("RecoverPasswordModal", "code", code, "string");
  assertType("RecoverPasswordModal", "onCodeChange", onCodeChange, "function");
  assertRange("RecoverPasswordModal", "length", length, 2, 8);
  assertType("RecoverPasswordModal", "onVerifyCode", onVerifyCode, "function");
  assertType("RecoverPasswordModal", "onResend", onResend, "function");
  assertType("RecoverPasswordModal", "password", password, "string");
  assertType("RecoverPasswordModal", "confirmPassword", confirmPassword, "string");
  assertType("RecoverPasswordModal", "onPasswordChange", onPasswordChange, "function");
  assertType("RecoverPasswordModal", "onConfirmPasswordChange", onConfirmPasswordChange, "function");
  assertType("RecoverPasswordModal", "onSubmitPassword", onSubmitPassword, "function");
  return true;
}
function verifyTypesNavbar({ items, logo, account, selected, defaultSelected, onChange, align } = {}) {
  assertArrayOf("Navbar", "items", items, (item, path) => {
    assertPlainObject("Navbar", path, item);
    if (!item) return;
    assertIconLike("Navbar", `${path}.icon`, item.icon);
    assertType("Navbar", `${path}.label`, item.label, "string");
    assertRef("Navbar", `${path}.buttonRef`, item.buttonRef);
  });
  if (logo !== void 0 && logo !== null) {
    assertPlainObject("Navbar", "logo", logo);
    assertRequired("Navbar", "logo.icon", logo.icon);
    assertIconLike("Navbar", "logo.icon", logo.icon);
    assertType("Navbar", "logo.label", logo.label, "string");
    assertType("Navbar", "logo.onClick", logo.onClick, "function");
    assertType("Navbar", "logo.active", logo.active, "boolean");
    assertRef("Navbar", "logo.buttonRef", logo.buttonRef);
  }
  if (account !== void 0 && account !== null) {
    assertPlainObject("Navbar", "account", account);
    assertType("Navbar", "account.src", account.src, "string");
    assertType("Navbar", "account.seed", account.seed, "string");
    assertType("Navbar", "account.alt", account.alt, "string");
    assertType("Navbar", "account.onClick", account.onClick, "function");
    assertType("Navbar", "account.active", account.active, "boolean");
    assertType("Navbar", "account.optionsTitle", account.optionsTitle, "string");
    assertRef("Navbar", "account.buttonRef", account.buttonRef);
    verifyTypesOptionsModal({ items: account.options, title: account.optionsTitle });
  }
  assertType("Navbar", "selected", selected, "number");
  assertType("Navbar", "defaultSelected", defaultSelected, "number");
  assertType("Navbar", "onChange", onChange, "function");
  assertOneOf("Navbar", "align", align, ["top", "center"], "center");
  return true;
}
function verifyTypesDragScroll({ axis, inertia, disabled, fade, fadeSize } = {}) {
  assertOneOf("DragScroll", "axis", axis, ["y", "x", "both"], "y");
  assertType("DragScroll", "inertia", inertia, "boolean");
  assertType("DragScroll", "disabled", disabled, "boolean");
  assertType("DragScroll", "fade", fade, "boolean");
  assertRange("DragScroll", "fadeSize", fadeSize, 0, 200);
  return true;
}
function verifyTypesToast({ variant, open, title, duration, dismissThreshold, onClose, onExited } = {}) {
  assertOneOf("Toast", "variant", variant, TOAST_VARIANTS, "info");
  assertType("Toast", "open", open, "boolean");
  assertNode("Toast", "title", title);
  assertRange("Toast", "duration", duration, 0, 6e5);
  assertType("Toast", "onClose", onClose, "function");
  assertType("Toast", "onExited", onExited, "function");
  if (dismissThreshold !== void 0 && dismissThreshold !== null) {
    assertType("Toast", "dismissThreshold", dismissThreshold, "number");
    if (!(dismissThreshold > 0 && dismissThreshold <= 1)) {
      fail("Toast", `\`dismissThreshold\` must be a number greater than 0 and at most 1, received ${show(dismissThreshold)}.`);
    }
  }
  return true;
}
function verifyTypesShowToast({ variant, title, message, duration } = {}) {
  assertOneOf("useToast", "variant", variant, TOAST_VARIANTS, "info");
  assertNode("useToast", "title", title);
  assertNode("useToast", "message", message);
  assertRange("useToast", "duration", duration, 0, 6e5);
  if (title === void 0 && message === void 0) {
    warn("useToast", "showToast() called without `title` or `message`: the toast will render empty.");
  }
  return true;
}
function verifyTypesToastProvider({ duration, dismissThreshold, max } = {}) {
  assertRange("ToastProvider", "duration", duration, 0, 6e5);
  assertRange("ToastProvider", "max", max, 1, 20);
  if (dismissThreshold !== void 0 && dismissThreshold !== null) {
    assertType("ToastProvider", "dismissThreshold", dismissThreshold, "number");
    if (!(dismissThreshold > 0 && dismissThreshold <= 1)) {
      fail("ToastProvider", `\`dismissThreshold\` must be a number greater than 0 and at most 1, received ${show(dismissThreshold)}.`);
    }
  }
  return true;
}
var THEME_MODES = ["light", "dark", "system"];
var THEME_VARIANTS = ["content", "monochrome", "neutral", "tonalSpot", "vibrant"];
var HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
var isThemeSeed = (value) => typeof value === "string" && HEX_COLOR.test(value);
var isThemeMode = (value) => THEME_MODES.includes(value);
var isThemeVariant = (value) => THEME_VARIANTS.includes(value);
function verifyTypesThemeSeed(component, prop, value) {
  if (isThemeSeed(value)) return true;
  warn(component, `\`${prop}\` must be a hex colour like "#0066ff", received ${show(value)}. Ignoring it.`);
  return false;
}
function verifyTypesThemeMode(component, prop, value) {
  if (isThemeMode(value)) return true;
  warn(component, `invalid \`${prop}\`: ${show(value)}. Valid values: ${THEME_MODES.join(", ")}. Ignoring it.`);
  return false;
}
function verifyTypesThemeVariant(component, prop, value) {
  if (isThemeVariant(value)) return true;
  warn(component, `invalid \`${prop}\`: ${show(value)}. Valid values: ${THEME_VARIANTS.join(", ")}. Ignoring it.`);
  return false;
}
function verifyTypesThemeModal({ open, onClose, triggerRef, title, animation } = {}) {
  assertType("ThemeModal", "open", open, "boolean");
  assertType("ThemeModal", "onClose", onClose, "function");
  assertType("ThemeModal", "title", title, "string");
  assertRef("ThemeModal", "triggerRef", triggerRef);
  assertAnimation("ThemeModal", "animation", animation);
  return true;
}
function verifyTypesOptionsModal({ open, onClose, onCloseComplete, triggerRef, items, title, animation } = {}) {
  assertType("OptionsModal", "open", open, "boolean");
  assertType("OptionsModal", "onClose", onClose, "function");
  assertType("OptionsModal", "onCloseComplete", onCloseComplete, "function");
  assertRef("OptionsModal", "triggerRef", triggerRef);
  assertType("OptionsModal", "title", title, "string");
  assertAnimation("OptionsModal", "animation", animation);
  if (Array.isArray(items) && items.length === 0) {
    warn("OptionsModal", "`items` is empty: the menu renders with no rows.");
  }
  assertArrayOf("OptionsModal", "items", items, (item, path) => {
    assertPlainObject("OptionsModal", path, item);
    if (!item) return;
    if (item.separator) {
      assertType("OptionsModal", `${path}.separator`, item.separator, "boolean");
      return;
    }
    assertIconLike("OptionsModal", `${path}.icon`, item.icon);
    assertType("OptionsModal", `${path}.label`, item.label, "string");
    assertType("OptionsModal", `${path}.onClick`, item.onClick, "function");
    assertType("OptionsModal", `${path}.closeOnSelect`, item.closeOnSelect, "boolean");
    assertOneOf("OptionsModal", `${path}.tone`, item.tone, OPTION_TONES, "default");
    assertRef("OptionsModal", `${path}.buttonRef`, item.buttonRef);
  });
  return true;
}
function verifyTypesThemeProvider({ defaultSeed, defaultMode, themes } = {}) {
  if (defaultSeed !== void 0 && defaultSeed !== null) {
    verifyTypesThemeSeed("ThemeProvider", "defaultSeed", defaultSeed);
  }
  if (defaultMode !== void 0 && defaultMode !== null) {
    verifyTypesThemeMode("ThemeProvider", "defaultMode", defaultMode);
  }
  assertArrayOf("ThemeProvider", "themes", themes, (item, path) => {
    assertPlainObject("ThemeProvider", path, item);
    if (!item) return;
    assertRequired("ThemeProvider", `${path}.name`, item.name);
    assertType("ThemeProvider", `${path}.name`, item.name, "string");
    verifyTypesThemeSeed("ThemeProvider", `${path}.hex`, item.hex);
    if (item.variant !== void 0 && item.variant !== null) {
      verifyTypesThemeVariant("ThemeProvider", `${path}.variant`, item.variant);
    }
  });
  return true;
}
function verifyTypesGradientProfile({ name, email, showControls, verifiedLabel } = {}) {
  assertType("GeneratorGradientProfile", "name", name, "string");
  assertType("GeneratorGradientProfile", "email", email, "string");
  assertType("GeneratorGradientProfile", "showControls", showControls, "boolean");
  assertType("GeneratorGradientProfile", "verifiedLabel", verifiedLabel, "string");
  return true;
}
function verifyTypesOnboardingModal({ open, onClose, triggerRef, icon, onComplete } = {}) {
  assertType("OnboardingModal", "open", open, "boolean");
  assertType("OnboardingModal", "onClose", onClose, "function");
  assertRef("OnboardingModal", "triggerRef", triggerRef);
  assertNode("OnboardingModal", "icon", icon);
  assertType("OnboardingModal", "onComplete", onComplete, "function");
  return true;
}

// src/buttons/button.jsx
import { jsx as jsx2 } from "react/jsx-runtime";
var PRESS = 0.97;
var buttonVariants = cva2("mott-btn", {
  variants: {
    shape: {
      rounded: "rounded-[var(--radius-lg)]",
      pill: "rounded-[var(--radius-full)]"
    },
    iconOnly: {
      true: "aspect-square p-[var(--pad-button-icon)]",
      false: "p-[var(--pad-button)]"
    },
    fullWidth: {
      true: "w-[100%]"
    }
  },
  defaultVariants: {
    shape: "rounded",
    iconOnly: false,
    fullWidth: false
  }
});
var Button = forwardRef(function Button2({
  children,
  variant = "default",
  quiet = false,
  shape,
  iconOnly,
  fullWidth,
  className,
  style,
  type = "button",
  onClick,
  ...props
}, ref) {
  verifyTypesButton({ variant, quiet, shape, iconOnly, fullWidth, type });
  const tint = controlTint(variant, quiet) ?? controlTint("default", quiet);
  return /* @__PURE__ */ jsx2(
    "button",
    {
      ref,
      type,
      onClick,
      className: twMerge2(buttonVariants({ shape, iconOnly, fullWidth }), className),
      style: {
        backgroundColor: tint.surface,
        color: tint.on,
        ...style
      },
      ...props,
      ...pressProps(props, { scale: PRESS }),
      children
    }
  );
});
var button_default = Button;

// src/icon/icon.jsx
import { twMerge as twMerge3 } from "tailwind-merge";
import { jsx as jsx3 } from "react/jsx-runtime";
var SIZE_TOKEN = {
  sm: "var(--sm-icon)",
  md: "var(--md-icon)",
  lg: "var(--lg-icon)",
  xl: "var(--xl-icon)"
};
function Icon({
  name,
  size = "md",
  filled: filled2 = true,
  weight = 500,
  grade = 200,
  opticalSize = 24,
  className,
  style
}) {
  verifyTypesIcon({ name, size, filled: filled2, weight, grade, opticalSize });
  if (!name) return null;
  const iconSize = SIZE_TOKEN[size] ?? size;
  return /* @__PURE__ */ jsx3(
    "span",
    {
      className: twMerge3("material-symbols-rounded select-none", className),
      "aria-hidden": "true",
      style: {
        fontSize: iconSize,
        fontVariationSettings: `'FILL' ${filled2 ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
        ...style
      },
      children: name
    }
  );
}

// src/buttons/fabButton.jsx
import { jsx as jsx4 } from "react/jsx-runtime";
var FAB_SIZE = {
  sm: { box: "var(--control-size-sm)", icon: "var(--lg-icon)" },
  md: { box: "var(--control-size-md)", icon: "var(--lg-icon)" },
  lg: { box: "var(--control-size-lg)", icon: "var(--xl-icon)" }
};
function FabButton({
  variant = "action",
  quiet = false,
  icon,
  size = "md",
  type = "button",
  onClick,
  style,
  ...props
}) {
  verifyTypesIconButton("FabButton", { icon, variant, quiet, size, type });
  const dimensions = FAB_SIZE[size] ?? FAB_SIZE.md;
  const tint = controlTint(variant, quiet) ?? controlTint("action", quiet);
  return /* @__PURE__ */ jsx4(
    "button",
    {
      type,
      onClick,
      className: "mott-btn",
      style: {
        width: dimensions.box,
        height: dimensions.box,
        padding: 0,
        borderRadius: "var(--control-radius)",
        backgroundColor: tint.surface,
        color: tint.on,
        ...style
      },
      ...props,
      ...pressProps(props),
      children: /* @__PURE__ */ jsx4(Icon, { name: icon, size: dimensions.icon })
    }
  );
}

// src/buttons/buttonGroup.jsx
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap2 from "gsap";
import { twMerge as twMerge4 } from "tailwind-merge";
import { jsx as jsx5, jsxs } from "react/jsx-runtime";
function ButtonGroup({ buttons, vertical = true, variant = "support", defaultSelected = null, value, allowDeselect = true, onChange }) {
  verifyTypesButtonGroup({ buttons, vertical, variant, allowDeselect, onChange, value, defaultSelected });
  const [internalSelected, setInternalSelected] = useState(defaultSelected);
  const isControlled = value !== void 0;
  const selectedButton = isControlled ? value : internalSelected;
  const itemRefs = useRef([]);
  const containerRef = useRef(null);
  const prevSelectedRef = useRef(selectedButton);
  const prevCountRef = useRef(null);
  const selected = selectionTint(variant);
  const resting = FAMILIES.neutral;
  useGSAP(() => {
    itemRefs.current.length = buttons.length;
    const shapeOf = (i) => selectionShape(i === selectedButton);
    const settleOnly = prevCountRef.current !== buttons.length;
    prevCountRef.current = buttons.length;
    if (settleOnly) {
      itemRefs.current.forEach((el, i) => {
        if (el) gsap2.set(el, shapeOf(i));
      });
      prevSelectedRef.current = selectedButton;
      return;
    }
    const changed = /* @__PURE__ */ new Set([prevSelectedRef.current, selectedButton]);
    prevSelectedRef.current = selectedButton;
    changed.forEach((i) => {
      const el = itemRefs.current[i];
      if (el) morphSelection(el, i === selectedButton);
    });
  }, { dependencies: [selectedButton, buttons.length], scope: containerRef });
  const handleSelect = (i) => {
    const next = allowDeselect && selectedButton === i ? null : i;
    if (!isControlled) setInternalSelected(next);
    onChange == null ? void 0 : onChange(next, next === null ? null : buttons[i]);
  };
  return /* @__PURE__ */ jsx5("div", { ref: containerRef, className: twMerge4("inline-flex gap-[var(--gap-group)]", vertical && "flex-col"), children: buttons.map((btn, i) => {
    const iconOnly = !btn.label;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        ref: (el) => {
          itemRefs.current[i] = el;
          if (typeof btn.buttonRef === "function") btn.buttonRef(el);
          else if (btn.buttonRef) btn.buttonRef.current = el;
        },
        type: "button",
        onClick: () => handleSelect(i),
        "aria-pressed": selectedButton === i,
        "aria-label": btn.ariaLabel,
        title: btn.ariaLabel,
        className: "mott-btn-in-group mott-state-layer mott-morph",
        ...pressHandlers(),
        style: {
          /*El fondo lo pinta ::before, no el boton: transicionarlo aqui lo repintaba
            entero - texto incluido - en cada cuadro del morph.*/
          "--mott-morph-bg": i === selectedButton ? selected.surface : resting.container,
          color: i === selectedButton ? selected.on : resting.onContainer,
          height: "var(--control-size-md)",
          ...iconOnly ? { width: "var(--control-size-md)", padding: 0 } : { padding: "0 20px" }
        },
        children: [
          btn.icon && (typeof btn.icon === "string" ? /* @__PURE__ */ jsx5(Icon, { name: btn.icon }) : btn.icon),
          btn.label && /* @__PURE__ */ jsx5("span", { children: btn.label })
        ]
      },
      btn.id ?? i
    );
  }) });
}

// src/toast/toast.jsx
import { useEffect, useRef as useRef2, useState as useState2 } from "react";
import { createPortal } from "react-dom";
import { useGSAP as useGSAP2 } from "@gsap/react";
import gsap3 from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";

// src/toast/toastStack.js
var STACK_ATTR = "data-mott-toast-stack";
var stack = null;
function getToastStack() {
  if (typeof document === "undefined") return null;
  if (!(stack == null ? void 0 : stack.isConnected)) {
    stack = document.querySelector(`[${STACK_ATTR}]`) ?? document.createElement("div");
    stack.setAttribute(STACK_ATTR, "");
    if (!stack.isConnected) document.body.appendChild(stack);
  }
  return stack;
}

// src/toast/toast.jsx
import { jsx as jsx6, jsxs as jsxs2 } from "react/jsx-runtime";
gsap3.registerPlugin(Draggable, Flip);
var VARIANT_ICONS = {
  info: "info",
  success: "check_circle",
  warning: "warning",
  danger: "error"
};
var COUNTER_DRAG = 0.12;
function Toast({
  variant = "info",
  title,
  children,
  open,
  onClose,
  onExited,
  duration = 5e3,
  dismissThreshold = 0.5
}) {
  verifyTypesToast({ variant, open, title, duration, dismissThreshold, onClose, onExited });
  const [rendered, setRendered] = useState2(open);
  const toastRef = useRef2(null);
  const onCloseRef = useRef2(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const onExitedRef = useRef2(onExited);
  useEffect(() => {
    onExitedRef.current = onExited;
  }, [onExited]);
  const finishExit = () => {
    var _a;
    setRendered(false);
    (_a = onExitedRef.current) == null ? void 0 : _a.call(onExitedRef);
  };
  const dismissedRef = useRef2(false);
  const glyph = VARIANT_ICONS[variant] ?? VARIANT_ICONS.info;
  const accent = ACCENTS[variant] ?? ACCENTS.info;
  useEffect(() => {
    if (open) {
      dismissedRef.current = false;
      setRendered(true);
    }
  }, [open]);
  const exitDistance = (el) => {
    const currentX = Number(gsap3.getProperty(el, "x")) || 0;
    return currentX + (window.innerWidth - el.getBoundingClientRect().left) + 16;
  };
  const flyOut = (el, { ease, duration: duration2, onDone }) => {
    const stack3 = el.parentElement;
    const siblings = stack3 ? Array.from(stack3.children).filter((c) => c !== el) : [];
    const state = siblings.length ? Flip.getState(siblings) : null;
    const rect = el.getBoundingClientRect();
    const scaleX = Number(gsap3.getProperty(el, "scaleX")) || 1;
    const top = stack3 ? rect.top - stack3.getBoundingClientRect().top : 0;
    Object.assign(el.style, {
      position: "absolute",
      top: `${top}px`,
      right: "0",
      width: `${rect.width / scaleX}px`
    });
    if (state) Flip.from(state, { duration: duration2, ease: "power3.out" });
    gsap3.to(el, { x: exitDistance(el), duration: duration2, ease, onComplete: onDone });
  };
  const timerRef = useRef2(null);
  const remainingRef = useRef2(duration);
  const startedAtRef = useRef2(0);
  const pauseTimer = () => {
    if (!timerRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
    remainingRef.current -= Date.now() - startedAtRef.current;
  };
  const resumeTimer = () => {
    if (!duration || timerRef.current || remainingRef.current <= 0) return;
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      var _a;
      return (_a = onCloseRef.current) == null ? void 0 : _a.call(onCloseRef);
    }, remainingRef.current);
  };
  useEffect(() => {
    if (!open || !duration) return;
    remainingRef.current = duration;
    resumeTimer();
    return pauseTimer;
  }, [open, duration]);
  useGSAP2(() => {
    if (open && toastRef.current) {
      gsap3.fromTo(
        toastRef.current,
        { opacity: 0, x: 24, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: DURATION.slow, ease: "back.out(1.7)", overwrite: "auto" }
      );
    }
  }, { dependencies: [open, rendered] });
  useEffect(() => {
    if (open || !rendered || !toastRef.current) return;
    if (dismissedRef.current) {
      finishExit();
      return;
    }
    flyOut(toastRef.current, {
      ease: "back.in(1.7)",
      duration: DURATION.slow,
      onDone: finishExit
    });
  }, [open, rendered]);
  useEffect(() => {
    if (!rendered || !toastRef.current) return;
    const el = toastRef.current;
    const width = el.offsetWidth;
    const threshold = width * dismissThreshold;
    const [draggable] = Draggable.create(el, {
      type: "x",
      // the stack sits top-right, so dismissal goes towards the nearest edge; only a small tug
      // is allowed back towards the content
      bounds: { minX: -width * COUNTER_DRAG, maxX: width, minY: 0, maxY: 0 },
      onPressInit: pauseTimer,
      onDrag: function() {
        gsap3.set(el, { opacity: 1 - Math.min(Math.abs(this.x) / threshold, 1) * 0.6 });
      },
      onDragEnd: function() {
        if (this.x >= threshold) {
          dismissedRef.current = true;
          flyOut(el, {
            ease: EASE.exit,
            duration: DURATION.base,
            onDone: () => {
              var _a;
              return (_a = onCloseRef.current) == null ? void 0 : _a.call(onCloseRef);
            }
          });
        } else {
          gsap3.to(el, { x: 0, opacity: 1, duration: DURATION.base, ease: EASE.standard, overwrite: "auto" });
          resumeTimer();
        }
      }
    });
    return () => draggable.kill();
  }, [rendered, dismissThreshold]);
  if (!rendered) return null;
  const stack2 = getToastStack();
  if (!stack2) return null;
  return createPortal(
    /* @__PURE__ */ jsxs2(
      "div",
      {
        ref: toastRef,
        role: "status",
        onMouseEnter: pauseTimer,
        onMouseLeave: resumeTimer,
        className: "inline-flex items-center gap-3 rounded-[var(--radius-lg)] cursor-grab active:cursor-grabbing",
        style: {
          padding: "var(--pad-stat)",
          // same neutral surface for all four variants: the variant shows in the icon, not in
          // the panel. `surface-container-high` is the step the Select panel and the modals also
          // use, so everything that floats above the page sits at the same elevation.
          backgroundColor: "var(--md-sys-color-surface-container-high)",
          boxShadow: "var(--shadow-floating)",
          // El toast mide lo que mide su texto, sin minimo: un aviso corto no tiene por que
          // arrastrar espacio vacio. Esta linea es solo donde deja de crecer, y es la que
          // sustituye a la media query que habia aqui antes: en una pantalla ancha gana
          // `--toast-width` (24rem) y ahi empieza a partir lineas; en una de 390px gana el
          // 100% y el tope es el ancho que deje la pila. Un solo tope para las dos, en vez de
          // dos comportamientos distintos segun el breakpoint.
          maxWidth: "min(var(--toast-width), 100%)",
          // the stack sets `pointer-events: none` so it does not block the page; each toast
          // re-enables itself
          pointerEvents: "auto"
        },
        children: [
          /* @__PURE__ */ jsx6(Icon, { name: glyph, size: "xl", className: "shrink-0", style: { color: accent } }),
          /* @__PURE__ */ jsxs2("div", { className: "flex min-w-0 flex-col gap-0.5", children: [
            title && /* @__PURE__ */ jsx6("span", { className: "mott-title-small text-[var(--md-sys-color-on-surface)]", children: title }),
            /* @__PURE__ */ jsx6("span", { className: "mott-body-medium text-[var(--md-sys-color-on-surface-variant)]", children })
          ] })
        ]
      }
    ),
    stack2
  );
}

// src/toast/toastContext.jsx
import { createContext, useCallback, useContext, useMemo, useRef as useRef3, useState as useState3 } from "react";
import { jsx as jsx7, jsxs as jsxs3 } from "react/jsx-runtime";
var ToastContext = createContext(null);
var DEFAULT_DURATION = 5e3;
var DEFAULT_DISMISS_THRESHOLD = 0.5;
var DEFAULT_MAX = 4;
var normalize = (options) => typeof options === "string" ? { message: options } : options ?? {};
function ToastProvider({
  children,
  duration = DEFAULT_DURATION,
  dismissThreshold = DEFAULT_DISMISS_THRESHOLD,
  max = DEFAULT_MAX
}) {
  verifyTypesToastProvider({ duration, dismissThreshold, max });
  const [toasts, setToasts] = useState3([]);
  const idRef = useRef3(0);
  const showToast = useCallback((options) => {
    const payload = normalize(options);
    verifyTypesShowToast(payload);
    const id = ++idRef.current;
    setToasts((prev) => {
      const next = [...prev, { variant: "info", duration, ...payload, id, open: true }];
      return next.length > max ? next.slice(next.length - max) : next;
    });
    return id;
  }, [duration, max]);
  const closeToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, open: false } : t));
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const closeAll = useCallback(() => {
    setToasts((prev) => prev.map((t) => ({ ...t, open: false })));
  }, []);
  const api = useMemo(() => ({
    showToast,
    closeToast,
    closeAll,
    info: (options) => showToast({ ...normalize(options), variant: "info" }),
    success: (options) => showToast({ ...normalize(options), variant: "success" }),
    warning: (options) => showToast({ ...normalize(options), variant: "warning" }),
    danger: (options) => showToast({ ...normalize(options), variant: "danger" })
  }), [showToast, closeToast, closeAll]);
  return /* @__PURE__ */ jsxs3(ToastContext.Provider, { value: api, children: [
    children,
    toasts.map((toast) => /* @__PURE__ */ jsx7(
      Toast,
      {
        open: toast.open,
        variant: toast.variant,
        title: toast.title,
        duration: toast.duration,
        dismissThreshold,
        onClose: () => closeToast(toast.id),
        onExited: () => removeToast(toast.id),
        children: toast.message
      },
      toast.id
    ))
  ] });
}
function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error(
      "[MOTT-COMPONENTS] useToast() must be used inside a <ToastProvider>. Wrap your app with <ToastProvider> (e.g. in app/layout.jsx) before calling toasts."
    );
  }
  return context;
}

// src/theme/themeContext.jsx
import { createContext as createContext2, useCallback as useCallback2, useContext as useContext2, useEffect as useEffect2, useMemo as useMemo2, useState as useState4 } from "react";

// src/theme/palette.js
import {
  Contrast,
  Hct,
  argbFromHex,
  hexFromArgb,
  customColor,
  MaterialDynamicColors,
  SchemeContent,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeTonalSpot,
  SchemeVibrant
} from "@material/material-color-utilities";
var VARIANTS = {
  content: SchemeContent,
  monochrome: SchemeMonochrome,
  neutral: SchemeNeutral,
  tonalSpot: SchemeTonalSpot,
  vibrant: SchemeVibrant
};
var DEFAULT_VARIANT = "content";
var DEFAULT_SEED = "#000000";
function onColorFor(hex) {
  const argb = argbFromHex(hex);
  const tone = Hct.fromInt(argb).tone;
  const mark = Hct.fromInt(argb);
  mark.tone = Contrast.ratioOfTones(tone, 10) >= Contrast.ratioOfTones(tone, 100) ? 10 : 100;
  return hexFromArgb(mark.toInt());
}
var SPEC_VERSION = "2021";
var SUCCESS_SEED = "#16a34a";
var WARNING_SEED = "#d97706";
var ROLES = [
  "primary",
  "onPrimary",
  "primaryContainer",
  "onPrimaryContainer",
  "secondary",
  "onSecondary",
  "secondaryContainer",
  "onSecondaryContainer",
  "tertiary",
  "onTertiary",
  "tertiaryContainer",
  "onTertiaryContainer",
  "error",
  "onError",
  "errorContainer",
  "onErrorContainer",
  "background",
  "onBackground",
  "surface",
  "onSurface",
  "surfaceVariant",
  "onSurfaceVariant",
  "outline",
  "outlineVariant",
  "shadow",
  "scrim",
  "inverseSurface",
  "inverseOnSurface",
  "inversePrimary",
  "surfaceContainerLowest",
  "surfaceContainerLow",
  "surfaceContainer",
  "surfaceContainerHigh",
  "surfaceContainerHighest"
];
var TINTED_ROLES = /* @__PURE__ */ new Set([
  "background",
  "onBackground",
  "surface",
  "onSurface",
  "surfaceVariant",
  "onSurfaceVariant",
  "surfaceContainerLowest",
  "surfaceContainerLow",
  "surfaceContainer",
  "surfaceContainerHigh",
  "surfaceContainerHighest",
  "outline",
  "outlineVariant",
  "inverseSurface",
  "inverseOnSurface"
]);
var DEFAULT_TINT = 16;
var MIN_SEED_CHROMA = 8;
var pushTint = (argb, hue, chroma) => {
  const hct = Hct.fromInt(argb);
  return Hct.from(hue, Math.max(hct.chroma, chroma), hct.tone).toInt();
};
var kebab = (role) => role.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
function buildPalette(seedHex, mode, variant = DEFAULT_VARIANT, tint = DEFAULT_TINT) {
  const argb = argbFromHex(seedHex);
  const seed = Hct.fromInt(argb);
  const Scheme = VARIANTS[variant] ?? VARIANTS[DEFAULT_VARIANT];
  const scheme = new Scheme(seed, mode === "dark", 0, SPEC_VERSION);
  const hasHue = seed.chroma >= MIN_SEED_CHROMA;
  const tintChroma = hasHue ? tint : 0;
  const tokens = {};
  for (const role of ROLES) {
    const value = MaterialDynamicColors[role].getArgb(scheme);
    const tinted = tintChroma && TINTED_ROLES.has(role) ? pushTint(value, seed.hue, tintChroma) : value;
    tokens[`--md-sys-color-${kebab(role)}`] = hexFromArgb(tinted);
  }
  for (const [name, seed2] of [["success", SUCCESS_SEED], ["warning", WARNING_SEED]]) {
    const colors = customColor(argb, { name, value: argbFromHex(seed2), blend: hasHue })[mode];
    tokens[`--md-custom-color-${name}`] = hexFromArgb(colors.color);
    tokens[`--md-custom-color-on-${name}`] = hexFromArgb(colors.onColor);
    tokens[`--md-custom-color-${name}-container`] = hexFromArgb(colors.colorContainer);
    tokens[`--md-custom-color-on-${name}-container`] = hexFromArgb(colors.onColorContainer);
  }
  return tokens;
}

// src/theme/themeContext.jsx
import { jsx as jsx8 } from "react/jsx-runtime";
var ThemeContext = createContext2(null);
var DEFAULT_MODE = "system";
var STORAGE_SEED = "mott-theme-color";
var STORAGE_MODE = "mott-theme-mode";
var STORAGE_VARIANT = "mott-theme-variant";
var THEMES_AVAILABLE = [
  { name: "black", hex: "#000000", variant: "content" },
  { name: "grey", hex: "#8E8E93", variant: "content" },
  { name: "purple", hex: "#a78bfa", variant: "content" },
  { name: "rose", hex: "#d97cb9", variant: "content" },
  { name: "pink", hex: "#ff6482", variant: "content" },
  { name: "red", hex: "#ff5c5c", variant: "content" },
  { name: "blue", hex: "#005eeb", variant: "content" },
  { name: "cyan", hex: "#5ac8fa", variant: "content" },
  { name: "green", hex: "#4CD964", variant: "content" },
  { name: "teal", hex: "#2dd4bf", variant: "content" }
];
var readStored = (key, isValid) => {
  try {
    const stored = localStorage.getItem(key);
    return isValid(stored) ? stored : null;
  } catch {
    return null;
  }
};
function ThemeProvider({
  children,
  defaultSeed = DEFAULT_SEED,
  defaultMode = DEFAULT_MODE,
  themes = THEMES_AVAILABLE
}) {
  verifyTypesThemeProvider({ defaultSeed, defaultMode, themes });
  const [colorSeedHex, setSeed] = useState4(() => isThemeSeed(defaultSeed) ? defaultSeed : DEFAULT_SEED);
  const [mode, setModeState] = useState4(() => isThemeMode(defaultMode) ? defaultMode : DEFAULT_MODE);
  const [variant, setVariantState] = useState4(DEFAULT_VARIANT);
  const [systemDark, setSystemDark] = useState4(false);
  const [hydrated, setHydrated] = useState4(false);
  useEffect2(() => {
    const storedSeed = readStored(STORAGE_SEED, isThemeSeed);
    const storedMode = readStored(STORAGE_MODE, isThemeMode);
    const storedVariant = readStored(STORAGE_VARIANT, isThemeVariant);
    if (storedSeed) setSeed(storedSeed);
    if (storedMode) setModeState(storedMode);
    if (storedVariant) setVariantState(storedVariant);
    setHydrated(true);
  }, []);
  useEffect2(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = (event) => setSystemDark(event.matches);
    setSystemDark(query.matches);
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  const resolvedMode = mode === "system" ? systemDark ? "dark" : "light" : mode;
  const tokens = useMemo2(() => buildPalette(colorSeedHex, resolvedMode, variant), [colorSeedHex, resolvedMode, variant]);
  useEffect2(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.setAttribute("data-theme-switching", "");
    for (const [token, hex] of Object.entries(tokens)) {
      root.style.setProperty(token, hex);
    }
    if (mode === "system") root.removeAttribute("data-theme");
    else root.dataset.theme = mode;
    void root.offsetHeight;
    root.removeAttribute("data-theme-switching");
  }, [tokens, mode, hydrated]);
  useEffect2(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_SEED, colorSeedHex);
      localStorage.setItem(STORAGE_MODE, mode);
      localStorage.setItem(STORAGE_VARIANT, variant);
    } catch {
    }
  }, [colorSeedHex, mode, variant, hydrated]);
  const setColorSeedHex = useCallback2((next, nextVariant = DEFAULT_VARIANT) => {
    if (!verifyTypesThemeSeed("useTheme", "setColorSeedHex", next)) return;
    if (!verifyTypesThemeVariant("useTheme", "setColorSeedHex", nextVariant)) return;
    setSeed(next);
    setVariantState(nextVariant);
  }, []);
  const setMode = useCallback2((next) => {
    if (verifyTypesThemeMode("useTheme", "setMode", next)) setModeState(next);
  }, []);
  const value = useMemo2(() => ({
    colorSeedHex,
    setColorSeedHex,
    variant,
    mode,
    setMode,
    resolvedMode,
    THEMES_AVAILABLE: themes
  }), [colorSeedHex, setColorSeedHex, variant, mode, setMode, resolvedMode, themes]);
  return /* @__PURE__ */ jsx8(ThemeContext.Provider, { value, children });
}
function useTheme() {
  const context = useContext2(ThemeContext);
  if (!context) {
    throw new Error(
      "[MOTT-COMPONENTS] useTheme() must be used inside a <ThemeProvider>. Wrap your app with <ThemeProvider> (e.g. in app/layout.jsx) before reading the theme."
    );
  }
  return context;
}

// src/customModal/customModal.jsx
import { useEffect as useEffect3, useRef as useRef5, useState as useState5 } from "react";
import { createPortal as createPortal2 } from "react-dom";
import gsap5 from "gsap";
import { twMerge as twMerge5 } from "tailwind-merge";

// src/animations/modalAnimation.js
import gsap4 from "gsap";
var MORPH_OPEN_DURATION = DURATION.modal;
var MORPH_CLOSE_DURATION = DURATION.modal;
var OPEN_BEATS = {
  morph: { at: 0, span: 1 },
  color: { at: 0, span: 1 },
  overlay: { at: 0, span: 0.6 },
  /*0.7, not 0.55: under the old fast-headed curve the panel was already at 97% of its size by
    0.55, but `inOut` splits the journey evenly and only reaches 59% there - the content would
    fade in while the panel was still growing, clipped in half. At 0.7 the panel is at 89%.*/
  content: { at: 0.7, span: 0.3 }
};
var CLOSE_BEATS = {
  morph: { at: 0, span: 1 },
  color: { at: 0, span: 1 },
  overlay: { at: 0, span: 0.8 },
  content: { at: 0, span: 0.25 }
};
var GHOST_ATTR = "data-mott-morph-ghost";
var RUNNING_MORPH = /* @__PURE__ */ Symbol.for("mott.runningMorph");
function killRunningMorph(panel) {
  var _a;
  (_a = panel[RUNNING_MORPH]) == null ? void 0 : _a.kill();
  panel[RUNNING_MORPH] = null;
}
function paintedRect(el) {
  const rect = el.getBoundingClientRect();
  const scale = parseFloat(getComputedStyle(el).getPropertyValue("--mott-morph-scale")) || 1;
  if (scale === 1) return rect;
  const dx = rect.width * (scale - 1) / 2;
  const dy = rect.height * (scale - 1) / 2;
  return {
    left: rect.left - dx,
    right: rect.right + dx,
    top: rect.top - dy,
    bottom: rect.bottom + dy,
    width: rect.width + dx * 2,
    height: rect.height + dy * 2
  };
}
function resolveRadius(el, rect) {
  const raw = getComputedStyle(el).borderTopLeftRadius.trim();
  const parts = raw.split(/\s+/);
  const toPx = (part, basis) => {
    const value = parseFloat(part) || 0;
    return part.endsWith("%") ? value / 100 * basis : value;
  };
  const radius = Math.min(
    toPx(parts[0], rect.width),
    toPx(parts[1] ?? parts[0], rect.height)
  );
  return Math.min(radius, Math.min(rect.width, rect.height) / 2);
}
function separationProgress(from, to, target) {
  const edge = (fromV, toV, limit, sign) => {
    const delta = toV - fromV;
    if (sign * delta <= 0) return Infinity;
    const p2 = (limit - fromV) / delta;
    return p2 > 0 && p2 <= 1 ? p2 : Infinity;
  };
  const p = Math.min(
    edge(from.top, to.top, target.bottom, 1),
    // cleared downwards
    edge(from.bottom, to.bottom, target.top, -1),
    // cleared upwards
    edge(from.left, to.left, target.right, 1),
    // cleared to the right
    edge(from.right, to.right, target.left, -1)
    // cleared to the left
  );
  return Number.isFinite(p) ? p : 1;
}
var clamp01 = (v) => Math.min(1, Math.max(0, v));
var GHOST_FADE_SPAN = 0.2;
function createTriggerGhost(dialog, trigger, originRect) {
  removeTriggerGhost(dialog);
  const cs = getComputedStyle(trigger);
  const ghost = document.createElement("div");
  ghost.setAttribute(GHOST_ATTR, "");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${originRect.left}px`,
    top: `${originRect.top}px`,
    width: `${originRect.width}px`,
    height: `${originRect.height}px`,
    display: "flex",
    boxSizing: "border-box",
    padding: cs.padding,
    /*El radio del trigger viaja con la copia. No es para pintar nada - el ghost no tiene fondo -
      sino porque lo clonado puede heredarlo: la foto de una cuenta se recorta con
      `border-radius: inherit` para seguir al morph del boton, y dentro de un ghost sin radio ese
      `inherit` resolvia a 0 y la copia salia CUADRADA. Un circulo que se vuelve cuadrado al
      pulsarlo es exactamente lo que no puede pasar.*/
    borderRadius: cs.borderRadius,
    pointerEvents: "none",
    color: cs.color,
    fontFamily: cs.fontFamily,
    fontSize: cs.fontSize,
    fontWeight: cs.fontWeight,
    lineHeight: cs.lineHeight,
    letterSpacing: cs.letterSpacing
  });
  const scale = Number(gsap4.getProperty(trigger, "scaleX")) || 1;
  const inner = document.createElement("div");
  Object.assign(inner.style, {
    display: "flex",
    // `flex: 1` para llenar la caja de contenido del ghost, pero SIN `min-width: 0`: con el, los
    // hijos clonados pueden encogerse por debajo de su tamano natural y la etiqueta se corre
    // hacia el icono, que es exactamente lo que el ghost no puede hacer - el trigger no encoge
    // los suyos, asi que la copia tampoco.
    flex: "1",
    flexDirection: cs.flexDirection,
    alignItems: cs.alignItems,
    justifyContent: cs.justifyContent,
    gap: cs.gap,
    // y tambien aca: `inherit` en un clon resuelve contra ESTE, que es su padre directo
    borderRadius: cs.borderRadius
  });
  trigger.childNodes.forEach((node) => inner.appendChild(node.cloneNode(true)));
  ghost.appendChild(inner);
  dialog.appendChild(ghost);
  if (scale !== 1) gsap4.set(ghost, { scale });
  return ghost;
}
function removeTriggerGhost(dialog) {
  var _a;
  (_a = dialog == null ? void 0 : dialog.querySelector(`[${GHOST_ATTR}]`)) == null ? void 0 : _a.remove();
}
var ModalAnimation = class {
  open(ctx) {
  }
  close(ctx, onDone) {
    onDone == null ? void 0 : onDone();
  }
  fadeOverlay(tl, overlay, to, duration, position = 0) {
    if (!overlay) return tl;
    return to === 1 ? tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration, ease: "power1.out" }, position) : tl.to(overlay, { opacity: 0, duration, ease: "power1.in" }, position);
  }
};
var FadeScaleAnimation = class extends ModalAnimation {
  open({ panel, overlay }) {
    if (prefersReducedMotion()) {
      gsap4.set(panel, { opacity: 1, y: 0, scale: 1 });
      if (overlay) gsap4.set(overlay, { opacity: 1 });
      return;
    }
    const tl = gsap4.timeline();
    this.fadeOverlay(tl, overlay, 1, DURATION.fast);
    tl.fromTo(
      panel,
      { opacity: 0, y: 12, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: DURATION.base, ease: EASE.standard },
      0
    );
  }
  close({ panel, overlay }, onDone) {
    if (prefersReducedMotion()) {
      if (overlay) gsap4.set(overlay, { opacity: 0 });
      onDone == null ? void 0 : onDone();
      return;
    }
    const tl = gsap4.timeline({ onComplete: () => onDone == null ? void 0 : onDone() });
    this.fadeOverlay(tl, overlay, 0, DURATION.fast);
    tl.to(panel, { opacity: 0, y: 12, scale: 0.94, duration: DURATION.fast, ease: EASE.exit }, 0);
  }
};
var MorphAnimation = class extends ModalAnimation {
  constructor({
    openDuration = MORPH_OPEN_DURATION,
    closeDuration = MORPH_CLOSE_DURATION,
    openBeats = {},
    closeBeats = {},
    openEase = EASE.inOut,
    closeEase = EASE.inOut,
    closeGhost = true,
    ghostFade = 0.2
  } = {}) {
    super();
    this.openDuration = openDuration;
    this.closeDuration = closeDuration;
    this.openBeats = { ...OPEN_BEATS, ...openBeats };
    this.closeBeats = { ...CLOSE_BEATS, ...closeBeats };
    this.openEase = openEase;
    this.closeEase = closeEase;
    this.closeGhost = closeGhost;
    this.ghostFade = ghostFade;
  }
  // Hooks for subclasses that position the panel before it is measured (see AnchoredAnimation).
  // `placedProps` names the inline props such a subclass sets, so `settle` knows what to clear.
  place() {
  }
  placedProps() {
    return "";
  }
  // Everything the morph needs, measured once against the final layout:
  // `buttonOffset` drops the panel's padding box onto the trigger, `buttonClip` shrinks it to the
  // trigger's exact rect, and `openClip` opens it back up. Live transforms are backed out of
  // `panelRect` so a re-measure mid-flight still reports the panel's resting position.
  measure(panel, trigger) {
    panel.style.borderRadius = "";
    const cs = getComputedStyle(panel);
    const pad = { top: parseFloat(cs.paddingTop) || 0, left: parseFloat(cs.paddingLeft) || 0 };
    const rect = panel.getBoundingClientRect();
    const tx = Number(gsap4.getProperty(panel, "x")) || 0;
    const ty = Number(gsap4.getProperty(panel, "y")) || 0;
    const panelRect = { left: rect.left - tx, top: rect.top - ty, width: rect.width, height: rect.height };
    const originRect = paintedRect(trigger);
    const panelBox = { ...panelRect, right: panelRect.left + panelRect.width, bottom: panelRect.top + panelRect.height };
    return {
      pad,
      panelRect,
      originRect,
      clearP: separationProgress(originRect, panelBox, originRect),
      openClip: { top: 0, right: 0, bottom: 0, left: 0, radius: resolveRadius(panel, panelRect) },
      buttonClip: {
        top: pad.top,
        right: Math.max(0, panelRect.width - pad.left - originRect.width),
        bottom: Math.max(0, panelRect.height - pad.top - originRect.height),
        left: pad.left,
        radius: resolveRadius(trigger, originRect)
      },
      buttonOffset: {
        x: originRect.left - panelRect.left - pad.left,
        y: originRect.top - panelRect.top - pad.top
      }
    };
  }
  // GSAP cannot interpolate `inset(... round ...)`, so the clip is written and read by hand and
  // driven from a scalar tween (see addClipTween).
  applyClip(panel, clip) {
    panel.style.clipPath = `inset(${clip.top}px ${clip.right}px ${clip.bottom}px ${clip.left}px round ${clip.radius}px)`;
  }
  // recovers the clip an interrupted opening left behind, so a close starts from where it really is
  readClip(panel, fallback) {
    const match = /inset\(([^)]+)\)/.exec(panel.style.clipPath || "");
    if (!match) return fallback;
    const parts = match[1].trim().split(/\s+/);
    const at = (i) => parseFloat(parts[i]);
    return { top: at(0), right: at(1), bottom: at(2), left: at(3), radius: at(5) };
  }
  addClipTween(tl, panel, from, to, duration, ease, position = 0, onProgress) {
    const state = { p: 0 };
    const lerp = (a, b) => a + (b - a) * state.p;
    this.applyClip(panel, from);
    onProgress == null ? void 0 : onProgress(0);
    tl.to(state, {
      p: 1,
      duration,
      ease,
      onUpdate: () => {
        this.applyClip(panel, {
          top: lerp(from.top, to.top),
          right: lerp(from.right, to.right),
          bottom: lerp(from.bottom, to.bottom),
          left: lerp(from.left, to.left),
          radius: lerp(from.radius, to.radius)
        });
        onProgress == null ? void 0 : onProgress(state.p);
      }
    }, position);
  }
  // Two ways to fade the ghost. When the panel separates from the trigger mid-morph (`clearP < 1`)
  // the fade is driven by geometry so it lands on that exact moment - hence a progress callback for
  // the clip tween. Otherwise the trigger stays covered and a plain time-based tween will do.
  addGhostFade(tl, ghost, clearP, morphAt, morphSpan, reverse = false) {
    if (clearP < 1) return this.ghostFader(ghost, clearP, reverse);
    const span = morphSpan * this.ghostFade;
    if (reverse) tl.to(ghost, { opacity: 1, duration: span, ease: "power1.out" }, morphAt + morphSpan - span);
    else tl.to(ghost, { opacity: 0, duration: span, ease: "power1.in" }, morphAt);
    return null;
  }
  ghostFader(ghost, clearP, reverse = false) {
    let from, span;
    if (reverse) {
      const to = 1 - clearP;
      from = Math.max(0, to - GHOST_FADE_SPAN);
      span = to - from;
    } else {
      from = Math.min(clearP, 1 - GHOST_FADE_SPAN);
      span = GHOST_FADE_SPAN;
    }
    return (p) => {
      const t = span > 0 ? clamp01((p - from) / span) : p >= from ? 1 : 0;
      ghost.style.opacity = String(reverse ? t : 1 - t);
    };
  }
  // Wipes every trace of the animation, handing the panel back to plain CSS.
  settle(dialog, panel, content, alsoClear = "") {
    removeTriggerGhost(dialog);
    panel.style.clipPath = "";
    panel[RUNNING_MORPH] = null;
    gsap4.set(panel, { clearProps: `transform,backgroundColor,borderRadius,willChange${alsoClear ? `,${alsoClear}` : ""}` });
    gsap4.set(content, { clearProps: "opacity,visibility" });
  }
  // Panel starts disguised as the trigger, then one timeline runs the lot: it slides into place, its
  // colour crossfades, the clip opens up, the content fades in and the backdrop darkens - each on
  // its own beat.
  open({ dialog, panel, content, overlay, trigger }) {
    if (!trigger) return new FadeScaleAnimation().open({ panel, overlay });
    killRunningMorph(panel);
    this.place(panel, trigger);
    if (prefersReducedMotion()) {
      this.settle(dialog, panel, content);
      if (overlay) gsap4.set(overlay, { opacity: 1 });
      return;
    }
    const { originRect, clearP, openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
    const originColor = getComputedStyle(trigger).backgroundColor;
    const finalColor = getComputedStyle(panel).backgroundColor;
    const ghost = createTriggerGhost(dialog, trigger, originRect);
    gsap4.set(panel, {
      x: buttonOffset.x,
      y: buttonOffset.y,
      backgroundColor: originColor,
      borderRadius: 0,
      willChange: "transform"
    });
    gsap4.set(content, { autoAlpha: 0 });
    const d = this.openDuration;
    const { morph, color, overlay: ov, content: cont } = this.openBeats;
    const morphAt = d * morph.at;
    const morphSpan = d * morph.span;
    const tl = gsap4.timeline({ onComplete: () => this.settle(dialog, panel, content) });
    panel[RUNNING_MORPH] = tl;
    tl.to(panel, { x: 0, y: 0, duration: morphSpan, ease: this.openEase, force3D: true }, morphAt);
    tl.to(panel, {
      backgroundColor: finalColor,
      duration: d * color.span,
      ease: this.openEase
    }, d * color.at);
    this.addClipTween(
      tl,
      panel,
      buttonClip,
      openClip,
      morphSpan,
      this.openEase,
      morphAt,
      this.addGhostFade(tl, ghost, clearP, morphAt, morphSpan)
    );
    tl.to(content, { autoAlpha: 1, duration: d * cont.span, ease: "power1.out" }, d * cont.at);
    this.fadeOverlay(tl, overlay, 1, d * ov.span, d * ov.at);
  }
  /*The inverse, with one difference: the clip starts from wherever an interrupted opening left it.
    The ghost is faded back IN here rather than out. The panel is opaque and comes to rest exactly
    on top of the trigger, so without it the trigger's label stays hidden until the <dialog> closes
    and then pops back - right at the moment the eye is following the panel down onto the button.
    `ghostFader` lands the fade on `p = 1 - clearP`, the frame the panel starts covering it again.*/
  close({ dialog, panel, content, overlay, trigger }, onDone) {
    if (!trigger) return new FadeScaleAnimation().close({ panel, overlay }, onDone);
    killRunningMorph(panel);
    removeTriggerGhost(dialog);
    if (prefersReducedMotion()) {
      if (overlay) gsap4.set(overlay, { opacity: 0 });
      onDone == null ? void 0 : onDone();
      this.settle(dialog, panel, content, this.placedProps());
      return;
    }
    const { originRect, clearP, openClip, buttonClip, buttonOffset } = this.measure(panel, trigger);
    const originColor = getComputedStyle(trigger).backgroundColor;
    const ghost = this.closeGhost ? createTriggerGhost(dialog, trigger, originRect) : null;
    if (ghost) ghost.style.opacity = "0";
    gsap4.set(panel, { borderRadius: 0, willChange: "transform" });
    const d = this.closeDuration;
    const { morph, color, overlay: ov, content: cont } = this.closeBeats;
    const morphAt = d * morph.at;
    const morphSpan = d * morph.span;
    const tl = gsap4.timeline({
      onComplete: () => {
        onDone == null ? void 0 : onDone();
        this.settle(dialog, panel, content, this.placedProps());
      }
    });
    panel[RUNNING_MORPH] = tl;
    tl.to(panel, {
      x: buttonOffset.x,
      y: buttonOffset.y,
      duration: morphSpan,
      ease: this.closeEase,
      force3D: true
    }, morphAt);
    tl.to(panel, {
      backgroundColor: originColor,
      duration: d * color.span,
      ease: this.closeEase
    }, d * color.at);
    this.addClipTween(
      tl,
      panel,
      this.readClip(panel, openClip),
      buttonClip,
      morphSpan,
      this.closeEase,
      morphAt,
      ghost ? this.addGhostFade(tl, ghost, clearP, morphAt, morphSpan, true) : void 0
    );
    tl.to(content, { autoAlpha: 0, duration: d * cont.span, ease: "power1.in" }, d * cont.at);
    this.fadeOverlay(tl, overlay, 0, d * ov.span, d * ov.at);
  }
};
var AnchoredAnimation = class extends MorphAnimation {
  constructor({ cover = 6, align = "corner", anchor = "trigger", ...options } = {}) {
    super({
      openDuration: DURATION.slow,
      closeDuration: DURATION.slow,
      openBeats: {
        morph: { at: 0.15, span: 0.85 },
        color: { at: 0.3, span: 0.7 },
        overlay: { at: 0, span: 0.22 },
        // same recalibration as OPEN_BEATS: its morph runs 0.15-1.0, so 0.62 sat at 55%
        // of the morph's own progress and hit the identical half-grown-panel problem
        content: { at: 0.72, span: 0.28 }
      },
      closeBeats: {
        morph: { at: 0, span: 0.75 },
        color: { at: 0.12, span: 0.63 },
        overlay: { at: 0.75, span: 0.25 },
        content: { at: 0, span: 0.2 }
      },
      closeGhost: true,
      ghostFade: 0.3,
      ...options
    });
    this.cover = cover;
    this.align = align;
    this.anchor = anchor;
  }
  /*Contra que caja se coloca el panel. El morph SIEMPRE sale del trigger - de eso se encarga
    `measure()` - y esto decide solo donde aterriza.
  
    `anchor: 'panel'` lo coloca contra el panel de la modal en la que vive el trigger, no contra el
    trigger. Es lo que necesita una modal que se abre desde una fila de un menu: colocada contra la
    fila, un panel mas ancho que el menu le sobresale por la izquierda y los dos bordes quedan
    descuadrados; contra el panel del menu, comparten borde y se leen como uno encima del otro.
    El `lastElementChild` del <dialog> es ese panel - el primer hijo es el velo (ver customModal.jsx).*/
  anchorRect(trigger) {
    var _a, _b;
    if (this.anchor !== "panel") return trigger.getBoundingClientRect();
    const host = (_b = (_a = trigger.closest) == null ? void 0 : _a.call(trigger, "dialog")) == null ? void 0 : _b.lastElementChild;
    return (host ?? trigger).getBoundingClientRect();
  }
  /*Sits the panel `cover` px above and left of the trigger so it overlaps it, clamped to the viewport.
  
    On the vertical axis it also FLIPS. Clamping alone was enough while every anchored panel hung off
    something near the top of the page, but a trigger at the bottom of the screen - a nav rail's
    account button, say - does not fit downwards, and the clamp would simply shove the panel up until
    its bottom edge hit the margin. The result reads wrong: the panel is no longer attached to
    anything, and the part of it that ends up below the button looks like a mistake rather than the
    deliberate `cover` overlap.
  
    So when the panel does not fit growing down, it is anchored by the OTHER end - its bottom edge
    `cover` px past the trigger's bottom - and grows upwards instead. Mirrored, not improvised: the
    overlap over the trigger is the same in both directions. The clamp stays as the last resort for a
    panel too tall to fit either way.*/
  computeAnchoredPosition(triggerRect, panelRect) {
    const margin = 8;
    const fit2 = (value, size, viewport) => Math.max(margin, Math.min(value, viewport - size - margin));
    if (this.align === "center") {
      return {
        left: fit2(triggerRect.left + (triggerRect.width - panelRect.width) / 2, panelRect.width, window.innerWidth),
        top: fit2(triggerRect.top + (triggerRect.height - panelRect.height) / 2, panelRect.height, window.innerHeight)
      };
    }
    if (this.align === "edge") {
      return {
        left: fit2(triggerRect.left, panelRect.width, window.innerWidth),
        top: fit2(triggerRect.top, panelRect.height, window.innerHeight)
      };
    }
    const downwards = triggerRect.top - this.cover;
    const fitsDownwards = downwards + panelRect.height <= window.innerHeight - margin;
    const top = fitsDownwards ? downwards : triggerRect.bottom + this.cover - panelRect.height;
    return {
      left: fit2(triggerRect.left - this.cover, panelRect.width, window.innerWidth),
      top: fit2(top, panelRect.height, window.innerHeight)
    };
  }
  place(panel, trigger) {
    gsap4.set(panel, { position: "fixed", margin: 0 });
    const { left, top } = this.computeAnchoredPosition(
      this.anchorRect(trigger),
      panel.getBoundingClientRect()
    );
    gsap4.set(panel, { left, top });
  }
  placedProps() {
    return "position,left,top,margin";
  }
};
var morphAnimation = new MorphAnimation();
var fadeAnimation = new FadeScaleAnimation();
var anchoredAnimation = new AnchoredAnimation();

// src/modalStack/modalStack.js
import { useCallback as useCallback3, useRef as useRef4, useSyncExternalStore } from "react";
var seq = 0;
var layers = [];
var listeners = /* @__PURE__ */ new Set();
var emit = () => listeners.forEach((listener) => listener());
var nextLayerId = () => ++seq;
function pushLayer(id) {
  if (layers.includes(id)) return;
  layers = [...layers, id];
  emit();
}
function popLayer(id) {
  if (!layers.includes(id)) return;
  layers = layers.filter((layer) => layer !== id);
  emit();
}
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function getSnapshot() {
  return layers;
}
var EMPTY = Object.freeze([]);
function getServerSnapshot() {
  return EMPTY;
}
function useModalLayer() {
  const idRef = useRef4(null);
  if (idRef.current === null) idRef.current = nextLayerId();
  const id = idRef.current;
  const stack2 = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const depth = stack2.indexOf(id);
  const isTop = depth === -1 || depth === stack2.length - 1;
  const enter = useCallback3(() => pushLayer(id), [id]);
  const leave = useCallback3(() => popLayer(id), [id]);
  return { id, depth, isTop, enter, leave };
}

// src/utils/scrollLock.js
var locks = 0;
var previous = null;
function scrollbarGap() {
  return window.innerWidth - document.documentElement.clientWidth;
}
function lockScroll() {
  if (typeof document === "undefined") return;
  if (++locks > 1) return;
  const { style } = document.body;
  const root = document.documentElement.style;
  const gap = scrollbarGap();
  previous = { paddingRight: style.paddingRight, rootOverflow: root.overflow };
  root.overflow = "hidden";
  if (gap > 0) {
    const current = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
    style.paddingRight = `${current + gap}px`;
  }
}
function unlockScroll() {
  if (typeof document === "undefined") return;
  if (locks === 0) return;
  if (--locks > 0) return;
  if (previous) {
    document.documentElement.style.overflow = previous.rootOverflow;
    document.body.style.paddingRight = previous.paddingRight;
    previous = null;
  }
}

// src/customModal/customModal.jsx
import { jsx as jsx9, jsxs as jsxs4 } from "react/jsx-runtime";
function CustomModal({ open, onClose, onCloseComplete, children, triggerRef, animation, className, style }) {
  verifyTypesCustomModal({ open, onClose, onCloseComplete, triggerRef, animation });
  const modalRef = useRef5(null);
  const overlayRef = useRef5(null);
  const panelRef = useRef5(null);
  const contentRef = useRef5(null);
  const activeAnimation = animation ?? (triggerRef ? morphAnimation : fadeAnimation);
  const latest = useRef5(null);
  latest.current = { activeAnimation, triggerRef, onCloseComplete };
  const { depth, isTop, enter, leave } = useModalLayer();
  const [mounted, setMounted] = useState5(false);
  useEffect3(() => setMounted(true), []);
  const lockedRef = useRef5(false);
  const lock = () => {
    if (!lockedRef.current) {
      lockedRef.current = true;
      lockScroll();
    }
  };
  const unlock = () => {
    if (lockedRef.current) {
      lockedRef.current = false;
      unlockScroll();
    }
  };
  useEffect3(() => () => {
    unlock();
    leave();
  }, []);
  useEffect3(() => {
    const modal = modalRef.current;
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (!modal || !panel || !overlay) return;
    const { activeAnimation: current, triggerRef: trigger, onCloseComplete: done } = latest.current;
    const ctx = { dialog: modal, panel, content, overlay, trigger: trigger == null ? void 0 : trigger.current };
    if (open && !modal.open) {
      lock();
      enter();
      modal.showModal();
      current.open(ctx);
    } else if (!open && modal.open) {
      leave();
      current.close(ctx, () => {
        modal.close();
        unlock();
        done == null ? void 0 : done();
      });
    }
  }, [open, mounted]);
  const coveredRef = useRef5(false);
  useEffect3(() => {
    var _a;
    const overlay = overlayRef.current;
    if (!overlay || !open || !((_a = modalRef.current) == null ? void 0 : _a.open)) return;
    if (isTop && !coveredRef.current) return;
    coveredRef.current = !isTop;
    const to = isTop ? 1 : 0;
    if (prefersReducedMotion()) {
      gsap5.set(overlay, { opacity: to });
      return;
    }
    gsap5.to(overlay, { opacity: to, duration: DURATION.fast, ease: EASE.standard });
  }, [isTop, open]);
  const handleCancel = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClose == null ? void 0 : onClose();
  };
  const handleOverlayClick = () => onClose == null ? void 0 : onClose();
  if (!mounted) return null;
  return createPortal2(
    /* @__PURE__ */ jsxs4(
      "dialog",
      {
        ref: modalRef,
        onCancel: handleCancel,
        "data-modal-depth": depth === -1 ? void 0 : depth,
        className: "default-modal",
        children: [
          /* @__PURE__ */ jsx9(
            "div",
            {
              ref: overlayRef,
              onClick: handleOverlayClick,
              className: "absolute inset-0 bg-[color-mix(in_srgb,var(--md-sys-color-scrim)_32%,transparent)]"
            }
          ),
          /* @__PURE__ */ jsx9(
            "div",
            {
              ref: panelRef,
              className: twMerge5("relative m-auto max-w-[92vw] rounded-[var(--radius-modal)] bg-[var(--md-sys-color-surface-container-high)] p-[var(--pad-card)]", className),
              style,
              children: /* @__PURE__ */ jsx9("div", { ref: contentRef, className: "h-full", children })
            }
          )
        ]
      }
    ),
    document.body
  );
}

// src/themeModal/swatchButton.jsx
import { useGSAP as useGSAP3 } from "@gsap/react";
import gsap6 from "gsap";
import { useRef as useRef6 } from "react";
import { jsx as jsx10 } from "react/jsx-runtime";
var SWATCH = 56;
var SWATCH_CLASS = "mott-shine mott-swatch flex items-center justify-center cursor-pointer border-0 p-0";
function SwatchButton({ theme, selected, onSelect, size = SWATCH }) {
  const ref = useRef6(null);
  const checkRef = useRef6(null);
  const didMountRef = useRef6(false);
  useGSAP3(() => {
    if (!ref.current) return;
    const shape = {
      borderRadius: selected ? squircleRadius() : CIRCLE_RADIUS,
      scale: selected ? MORPH_SCALE : 1,
      "--mott-morph-scale": selected ? MORPH_SCALE : 1
    };
    const mark = { autoAlpha: selected ? 1 : 0, scale: selected ? 1 : 0.6 };
    if (!didMountRef.current) {
      didMountRef.current = true;
      gsap6.set(ref.current, shape);
      gsap6.set(checkRef.current, mark);
      return;
    }
    morphTo(ref.current, shape, { entering: selected });
    morphTo(checkRef.current, mark, { entering: selected });
  }, { dependencies: [selected] });
  return /* @__PURE__ */ jsx10(
    "button",
    {
      ref,
      type: "button",
      onClick: onSelect,
      "aria-pressed": selected,
      "aria-label": theme.name,
      title: theme.name,
      className: SWATCH_CLASS,
      ...pressHandlers(selected ? MORPH_SCALE : 1),
      style: {
        /*El alto sale del ancho y no de un segundo numero: asi `size` admite tambien un
          porcentaje - una rejilla puede darle el ancho de su columna - y el swatch sigue
          siendo redondo sin que nadie tenga que calcular nada.*/
        width: size,
        height: "auto",
        aspectRatio: "1 / 1",
        borderRadius: CIRCLE_RADIUS,
        background: `linear-gradient(98deg, rgb(255 255 255 / 0) 22%, rgb(255 255 255 / 0.20) 76%, rgb(255 255 255 / 0.12) 100%), ${theme.hex}`,
        "--mott-swatch-ring": selected ? "0.3" : "0.1"
      },
      children: /* @__PURE__ */ jsx10("span", { className: "mott-morph-steady flex", children: /* @__PURE__ */ jsx10("span", { ref: checkRef, className: "flex", children: /* @__PURE__ */ jsx10(
        Icon,
        {
          name: "check",
          size: "lg",
          weight: 700,
          style: { color: onColorFor(theme.hex) }
        }
      ) }) })
    }
  );
}

// src/themeModal/themeModal.jsx
import { jsx as jsx11, jsxs as jsxs5 } from "react/jsx-runtime";
var MODES = [
  { value: "light", icon: "light_mode", label: "Claro" },
  { value: "dark", icon: "dark_mode", label: "Oscuro" },
  { value: "system", icon: "brightness_4", label: "Sistema" }
];
function ThemeModal({ open, onClose, triggerRef, title = "Apariencia", animation }) {
  verifyTypesThemeModal({ open, onClose, triggerRef, title, animation });
  const { colorSeedHex, variant, setColorSeedHex, mode, setMode, THEMES_AVAILABLE: THEMES_AVAILABLE2 } = useTheme();
  const isActive = (theme) => theme.hex.toLowerCase() === colorSeedHex.toLowerCase() && (theme.variant ?? variant) === variant;
  const modeIndex = MODES.findIndex((m) => m.value === mode);
  return /* @__PURE__ */ jsx11(CustomModal, { open, onClose, triggerRef, animation, className: "w-[360px]", children: /* @__PURE__ */ jsxs5("div", { className: "flex flex-col gap-[var(--gap-page)]", children: [
    /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-[var(--gap-group)]", children: [
      /* @__PURE__ */ jsx11(Icon, { name: "palette", size: "lg", style: { color: "var(--md-sys-color-primary)" } }),
      /* @__PURE__ */ jsx11(
        "h2",
        {
          className: "mott-headline-small mott-title-emphasis",
          style: { color: "var(--md-sys-color-on-surface)" },
          children: title
        }
      )
    ] }),
    /* @__PURE__ */ jsx11("div", { className: "grid w-full grid-cols-5 gap-[var(--gap-group)]", children: THEMES_AVAILABLE2.map((theme) => /* @__PURE__ */ jsx11(
      SwatchButton,
      {
        theme,
        size: "100%",
        selected: isActive(theme),
        onSelect: () => setColorSeedHex(theme.hex, theme.variant)
      },
      theme.name
    )) }),
    /* @__PURE__ */ jsxs5("div", { className: "flex flex-col gap-[var(--gap-section)]", children: [
      /* @__PURE__ */ jsx11(
        "p",
        {
          className: "mott-body-medium",
          style: { color: "var(--md-sys-color-on-surface-variant)" },
          children: "Modo"
        }
      ),
      /* @__PURE__ */ jsx11(
        ButtonGroup,
        {
          vertical: false,
          allowDeselect: false,
          value: modeIndex,
          onChange: (index) => setMode(MODES[index].value),
          buttons: MODES.map((m) => ({ id: m.value, icon: m.icon, ariaLabel: m.label }))
        }
      )
    ] })
  ] }) });
}

// src/input/input.jsx
import { useId } from "react";
import { twMerge as twMerge6 } from "tailwind-merge";
import { jsx as jsx12, jsxs as jsxs6 } from "react/jsx-runtime";
function Input({
  label,
  type = "text",
  id,
  trailing,
  className,
  style,
  placeholder,
  value,
  onChange,
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  verifyTypesInput({ label, placeholder, type });
  const room = "calc(var(--md-icon) + 26px)";
  return /* @__PURE__ */ jsxs6("div", { className: "flex w-full flex-col gap-1", children: [
    label && /* @__PURE__ */ jsx12(
      "label",
      {
        htmlFor: inputId,
        className: "mott-body-small text-[var(--md-sys-color-on-surface-variant)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsxs6("div", { className: "relative flex w-full items-center", children: [
      /* @__PURE__ */ jsx12(
        "input",
        {
          id: inputId,
          type,
          className: twMerge6(
            "w-full rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container)] mott-body-large text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] outline-none transition-colors duration-150 focus:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container))] disabled:opacity-50 disabled:cursor-not-allowed",
            className
          ),
          value,
          onChange: (e) => onChange == null ? void 0 : onChange(e.target.value),
          style: {
            padding: "var(--pad-input)",
            ...trailing ? { paddingRight: room } : null,
            ...style
          },
          placeholder,
          ...props
        }
      ),
      trailing && /* @__PURE__ */ jsx12("span", { className: "absolute right-[18px] flex items-center text-[var(--md-sys-color-on-surface-variant)]", children: trailing })
    ] })
  ] });
}

// src/textarea/textarea.jsx
import { useId as useId2 } from "react";
import { twMerge as twMerge7 } from "tailwind-merge";
import { jsx as jsx13, jsxs as jsxs7 } from "react/jsx-runtime";
function Textarea({
  label,
  id,
  width = "100%",
  height = "6rem",
  className,
  style,
  placeholder,
  ...props
}) {
  const generatedId = useId2();
  const textareaId = id ?? generatedId;
  verifyTypesTextarea({ label, placeholder, width, height });
  return /* @__PURE__ */ jsxs7("div", { className: "flex flex-col gap-1", style: { width }, children: [
    label && /* @__PURE__ */ jsx13(
      "label",
      {
        htmlFor: textareaId,
        className: "mott-body-small text-[var(--md-sys-color-on-surface-variant)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsx13(
      "textarea",
      {
        id: textareaId,
        className: twMerge7(
          "w-full rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container)] mott-body-large text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] outline-none transition-colors duration-150 focus:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container))] disabled:opacity-50 disabled:cursor-not-allowed",
          className
        ),
        style: {
          padding: "var(--pad-input)",
          height,
          resize: "none",
          overflow: "hidden",
          ...style
        },
        placeholder
      }
    )
  ] });
}

// src/select/select.jsx
import { useEffect as useEffect4, useId as useId3, useRef as useRef7, useState as useState6 } from "react";
import { createPortal as createPortal3 } from "react-dom";
import { useGSAP as useGSAP4 } from "@gsap/react";
import gsap7 from "gsap";
import { jsx as jsx14, jsxs as jsxs8 } from "react/jsx-runtime";
function Select({ options = [], value, onChange, label, placeholder = "Seleccionar", disabled, id }) {
  verifyTypesSelect({ options, onChange, label, placeholder, disabled });
  const [open, setOpen] = useState6(false);
  const [rendered, setRendered] = useState6(false);
  const [anchor, setAnchor] = useState6(null);
  const wrapperRef = useRef7(null);
  const triggerRef = useRef7(null);
  const panelRef = useRef7(null);
  const generatedId = useId3();
  const selectId = id ?? generatedId;
  const selected = options.find((o) => o.value === value);
  useEffect4(() => {
    if (!open) return;
    const syncAnchor = () => {
      var _a;
      const rect = (_a = triggerRef.current) == null ? void 0 : _a.getBoundingClientRect();
      if (rect) setAnchor({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    };
    syncAnchor();
    setRendered(true);
    window.addEventListener("scroll", syncAnchor, true);
    window.addEventListener("resize", syncAnchor);
    return () => {
      window.removeEventListener("scroll", syncAnchor, true);
      window.removeEventListener("resize", syncAnchor);
    };
  }, [open]);
  useGSAP4(() => {
    if (open && panelRef.current) {
      const el = panelRef.current;
      const targetHeight = el.scrollHeight;
      gsap7.fromTo(
        el,
        { height: 0, opacity: 0 },
        {
          height: targetHeight,
          opacity: 1,
          duration: DURATION.base,
          ease: EASE.standard,
          overwrite: "auto",
          onComplete: () => gsap7.set(el, { height: "auto" })
        }
      );
    }
  }, { dependencies: [open, rendered] });
  useEffect4(() => {
    if (!open && rendered && panelRef.current) {
      gsap7.to(panelRef.current, {
        height: 0,
        opacity: 0,
        duration: DURATION.fast,
        ease: EASE.exit,
        overwrite: "auto",
        onComplete: () => setRendered(false)
      });
    }
  }, [open, rendered]);
  useEffect4(() => {
    if (!open) return;
    const handleClick = (e) => {
      var _a, _b;
      if ((_a = wrapperRef.current) == null ? void 0 : _a.contains(e.target)) return;
      if ((_b = panelRef.current) == null ? void 0 : _b.contains(e.target)) return;
      setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);
  const handleSelect = (option) => {
    onChange == null ? void 0 : onChange(option.value, option);
    setOpen(false);
  };
  return /* @__PURE__ */ jsxs8("div", { ref: wrapperRef, className: "flex w-full flex-col gap-1", children: [
    label && /* @__PURE__ */ jsx14(
      "label",
      {
        htmlFor: selectId,
        className: "mott-body-small text-[var(--md-sys-color-on-surface-variant)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsxs8(
      "button",
      {
        ref: triggerRef,
        id: selectId,
        type: "button",
        disabled,
        onClick: () => setOpen((o) => !o),
        className: "flex w-full items-center justify-between rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container)] mott-body-large text-[var(--md-sys-color-on-surface)] outline-none transition-colors duration-150 focus:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container))] disabled:opacity-50 disabled:cursor-not-allowed",
        style: { padding: "var(--pad-input)" },
        children: [
          /* @__PURE__ */ jsx14("span", { className: selected ? "" : "text-[var(--md-sys-color-on-surface-variant)]", children: selected ? selected.label : placeholder }),
          /* @__PURE__ */ jsx14(Icon, { name: "expand_more", size: "sm", className: `transition-transform duration-200 ${open ? "rotate-180" : ""}` })
        ]
      }
    ),
    rendered && anchor && createPortal3(
      /* @__PURE__ */ jsx14(
        "div",
        {
          ref: panelRef,
          className: "fixed z-[var(--z-floating)] flex flex-col gap-[var(--gap-tight)] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container-high)] p-1 shadow-lg",
          style: { top: anchor.top, left: anchor.left, width: anchor.width },
          children: options.map((option) => {
            const isSelected = option.value === value;
            return /* @__PURE__ */ jsx14(
              "button",
              {
                type: "button",
                onClick: () => handleSelect(option),
                className: "rounded-[var(--radius-sm)] px-3 py-2 text-left mott-body-large transition-colors duration-150",
                style: {
                  backgroundColor: isSelected ? "var(--md-sys-color-primary-container)" : "transparent",
                  color: isSelected ? "var(--md-sys-color-primary)" : "var(--md-sys-color-on-surface)"
                },
                onMouseEnter: (e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent)";
                },
                onMouseLeave: (e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                },
                children: option.label
              },
              option.value
            );
          })
        }
      ),
      document.body
    )
  ] });
}

// src/search/search.jsx
import { useEffect as useEffect5, useId as useId4, useRef as useRef8, useState as useState7 } from "react";
import { twMerge as twMerge8 } from "tailwind-merge";
import { jsx as jsx15, jsxs as jsxs9 } from "react/jsx-runtime";
function Search({
  label,
  id,
  placeholder = "Buscar...",
  defaultValue = "",
  value: controlledValue,
  onChange,
  onSearch,
  delay = 400,
  className,
  style,
  ...props
}) {
  const [internalValue, setInternalValue] = useState7(defaultValue);
  const isControlled = controlledValue !== void 0;
  const value = isControlled ? controlledValue : internalValue;
  const generatedId = useId4();
  const searchId = id ?? generatedId;
  const timeoutRef = useRef8(null);
  verifyTypesSearch({ label, placeholder, delay, onSearch, onChange, value: controlledValue, defaultValue });
  useEffect5(() => {
    if (!onSearch) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onSearch(value), delay);
    return () => clearTimeout(timeoutRef.current);
  }, [value, delay, onSearch]);
  const handleChange = (event) => {
    const next = event.target.value;
    if (!isControlled) setInternalValue(next);
    onChange == null ? void 0 : onChange(next, event);
  };
  const handleClear = () => {
    if (!isControlled) setInternalValue("");
    onChange == null ? void 0 : onChange("");
    onSearch == null ? void 0 : onSearch("");
  };
  return /* @__PURE__ */ jsxs9("div", { className: "flex w-full flex-col gap-1", children: [
    label && /* @__PURE__ */ jsx15(
      "label",
      {
        htmlFor: searchId,
        className: "mott-body-small text-[var(--md-sys-color-on-surface-variant)]",
        children: label
      }
    ),
    /* @__PURE__ */ jsxs9(
      "div",
      {
        className: twMerge8(
          "flex w-full items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container)] transition-colors duration-150 focus-within:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container))]",
          className
        ),
        style: { padding: "var(--pad-input)", ...style },
        children: [
          /* @__PURE__ */ jsx15(Icon, { name: "search", size: "sm", className: "shrink-0 text-[var(--md-sys-color-on-surface-variant)]" }),
          /* @__PURE__ */ jsx15(
            "input",
            {
              id: searchId,
              type: "search",
              value,
              onChange: handleChange,
              placeholder,
              className: "w-full bg-transparent mott-body-large text-[var(--md-sys-color-on-surface)] outline-none placeholder:text-[var(--md-sys-color-on-surface-variant)] [&::-webkit-search-cancel-button]:appearance-none",
              ...props
            }
          ),
          value && /* @__PURE__ */ jsx15(
            "button",
            {
              type: "button",
              onClick: handleClear,
              "aria-label": "Limpiar b\xFAsqueda",
              className: "flex shrink-0 items-center justify-center border-0 bg-transparent cursor-pointer",
              children: /* @__PURE__ */ jsx15(Icon, { name: "close", size: "sm", className: "text-[var(--md-sys-color-on-surface-variant)]" })
            }
          )
        ]
      }
    )
  ] });
}

// src/icon/googleIcon.jsx
import { twMerge as twMerge9 } from "tailwind-merge";
import { jsx as jsx16, jsxs as jsxs10 } from "react/jsx-runtime";
var BLUE = "#4285F4";
var GREEN = "#34A853";
var YELLOW = "#FBBC05";
var RED = "#EA4335";
function GoogleIcon({
  size = "var(--md-icon)",
  className,
  style,
  ...props
}) {
  return /* @__PURE__ */ jsxs10(
    "svg",
    {
      viewBox: "0 0 48 48",
      width: size,
      height: size,
      "aria-hidden": "true",
      focusable: "false",
      className: twMerge9("shrink-0 select-none", className),
      style: { display: "block", ...style },
      ...props,
      children: [
        /* @__PURE__ */ jsx16(
          "path",
          {
            fill: RED,
            d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          }
        ),
        /* @__PURE__ */ jsx16(
          "path",
          {
            fill: BLUE,
            d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          }
        ),
        /* @__PURE__ */ jsx16(
          "path",
          {
            fill: YELLOW,
            d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          }
        ),
        /* @__PURE__ */ jsx16(
          "path",
          {
            fill: GREEN,
            d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          }
        )
      ]
    }
  );
}

// src/authModals/authShell.jsx
import { jsx as jsx17, jsxs as jsxs11 } from "react/jsx-runtime";
function SwitchLink({ children, onClick, disabled }) {
  return /* @__PURE__ */ jsx17(
    "button",
    {
      type: "button",
      onClick,
      disabled,
      className: "cursor-pointer border-0 bg-transparent p-0 underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      style: {
        font: "inherit",
        letterSpacing: "var(--md-sys-typescale-body-medium-tracking)",
        fontWeight: "var(--md-ref-typeface-weight-medium)",
        color: "var(--md-sys-color-primary)"
      },
      children
    }
  );
}
function AuthShell({
  open,
  onClose,
  triggerRef,
  logo,
  brand,
  title,
  children,
  submitLabel,
  onSubmit,
  onGoogle,
  googleLabel = "Continuar con Google",
  switchText,
  switchAction,
  onSwitch,
  error,
  loading = false
}) {
  verifyTypesAuthShell({
    open,
    onClose,
    triggerRef,
    logo,
    brand,
    title,
    submitLabel,
    onSubmit,
    onGoogle,
    googleLabel,
    switchText,
    switchAction,
    onSwitch,
    error,
    loading
  });
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit == null ? void 0 : onSubmit();
  };
  return /* @__PURE__ */ jsxs11(
    CustomModal,
    {
      open,
      onClose,
      triggerRef,
      className: "w-[400px] px-[var(--pad-card)] py-[var(--gap-page)]",
      children: [
        /* @__PURE__ */ jsx17(
          button_default,
          {
            variant: "ghost",
            iconOnly: true,
            shape: "pill",
            onClick: onClose,
            "aria-label": "Cerrar",
            className: "absolute top-[12px] right-[12px]",
            style: { color: "var(--md-sys-color-on-surface-variant)" },
            children: /* @__PURE__ */ jsx17(Icon, { name: "close", size: "lg" })
          }
        ),
        /* @__PURE__ */ jsxs11("div", { className: "flex flex-col items-start text-left", children: [
          (logo || brand) && /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-[var(--gap-group)]", children: [
            logo,
            brand && /* @__PURE__ */ jsx17(
              "span",
              {
                className: "mott-label-large",
                style: { color: "var(--md-sys-color-on-surface-variant)" },
                children: brand
              }
            )
          ] }),
          /* @__PURE__ */ jsx17(
            "h2",
            {
              className: "mott-headline-large mott-title-emphasis",
              style: {
                color: "var(--md-sys-color-on-surface)",
                marginTop: logo || brand ? "var(--gap-group)" : 0
              },
              children: title
            }
          ),
          /* @__PURE__ */ jsxs11(
            "form",
            {
              onSubmit: handleSubmit,
              noValidate: true,
              className: "mt-[var(--gap-page)] flex w-full flex-col gap-[var(--gap-block)]",
              children: [
                children,
                error && /* @__PURE__ */ jsx17("p", { className: "mott-body-small", style: { color: "var(--md-sys-color-error)" }, role: "alert", children: error }),
                /* @__PURE__ */ jsx17(button_default, { type: "submit", variant: "action", fullWidth: true, disabled: loading, children: submitLabel }),
                onGoogle && /* @__PURE__ */ jsxs11(button_default, { variant: "default", fullWidth: true, onClick: onGoogle, disabled: loading, children: [
                  /* @__PURE__ */ jsx17(GoogleIcon, {}),
                  googleLabel
                ] })
              ]
            }
          ),
          switchText && /*`w-full` first: the column is `items-start`, so without it the <p> shrinks to
            its text and `text-center` has nothing wider than itself to centre against.*/
          /* @__PURE__ */ jsxs11(
            "p",
            {
              className: "mott-body-medium mt-[var(--gap-block)] w-full text-center",
              style: { color: "var(--md-sys-color-on-surface-variant)" },
              children: [
                switchText,
                " ",
                /* @__PURE__ */ jsx17(SwitchLink, { onClick: onSwitch, disabled: loading, children: switchAction })
              ]
            }
          )
        ] })
      ]
    }
  );
}

// src/authModals/passwordField.jsx
import { useState as useState8 } from "react";
import { jsx as jsx18 } from "react/jsx-runtime";
function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  disabled,
  autoComplete = "current-password",
  ...props
}) {
  const [visible, setVisible] = useState8(false);
  return /* @__PURE__ */ jsx18(
    Input,
    {
      type: visible ? "text" : "password",
      label,
      placeholder,
      value,
      onChange,
      disabled,
      autoComplete,
      ...props,
      trailing: /* @__PURE__ */ jsx18(
        "button",
        {
          type: "button",
          onClick: () => setVisible((shown) => !shown),
          tabIndex: -1,
          "aria-label": visible ? "Ocultar contrase\xF1a" : "Mostrar contrase\xF1a",
          className: "flex cursor-pointer items-center border-0 bg-transparent p-0 text-inherit transition-opacity hover:opacity-70",
          children: /* @__PURE__ */ jsx18(Icon, { name: visible ? "visibility_off" : "visibility", size: "md", filled: false })
        }
      )
    }
  );
}

// src/authModals/loginModal.jsx
import { jsx as jsx19, jsxs as jsxs12 } from "react/jsx-runtime";
function LoginModal({
  open,
  onClose,
  triggerRef,
  logo,
  brand,
  title = "Iniciar sesi\xF3n",
  email,
  onEmailChange,
  password,
  onPasswordChange,
  emailLabel = "Correo",
  emailPlaceholder = "Escribe tu correo",
  passwordLabel = "Contrase\xF1a",
  passwordPlaceholder = "Escribe tu contrase\xF1a",
  submitLabel = "Iniciar sesi\xF3n",
  onSubmit,
  onForgotPassword,
  forgotPasswordText = "\xBFOlvidaste tu contrase\xF1a?",
  onGoogle,
  googleLabel,
  switchText = "\xBFNo tienes cuenta?",
  switchAction = "Reg\xEDstrate",
  onSwitch,
  error,
  loading = false
}) {
  verifyTypesLoginModal({ email, password, onEmailChange, onPasswordChange, onSubmit, onForgotPassword });
  return /* @__PURE__ */ jsxs12(
    AuthShell,
    {
      open,
      onClose,
      triggerRef,
      logo,
      brand,
      title,
      submitLabel,
      onSubmit,
      onGoogle,
      googleLabel,
      switchText,
      switchAction,
      onSwitch,
      error,
      loading,
      children: [
        /* @__PURE__ */ jsx19(
          Input,
          {
            type: "text",
            inputMode: "email",
            autoComplete: "email",
            label: emailLabel,
            placeholder: emailPlaceholder,
            value: email,
            onChange: onEmailChange,
            disabled: loading
          }
        ),
        /* @__PURE__ */ jsx19(
          PasswordField,
          {
            label: passwordLabel,
            placeholder: passwordPlaceholder,
            value: password,
            onChange: onPasswordChange,
            disabled: loading
          }
        ),
        onForgotPassword && /* @__PURE__ */ jsx19("div", { className: "mott-body-medium", children: /* @__PURE__ */ jsx19(SwitchLink, { onClick: onForgotPassword, disabled: loading, children: forgotPasswordText }) })
      ]
    }
  );
}

// src/authModals/registerModal.jsx
import { jsx as jsx20, jsxs as jsxs13 } from "react/jsx-runtime";
function RegisterModal({
  open,
  onClose,
  triggerRef,
  logo,
  brand,
  title = "Crear cuenta",
  email,
  onEmailChange,
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  emailLabel = "Correo",
  emailPlaceholder = "Escribe tu correo",
  passwordLabel = "Contrase\xF1a",
  passwordPlaceholder = "Crea una contrase\xF1a",
  confirmLabel = "Confirma tu contrase\xF1a",
  confirmPlaceholder = "Escr\xEDbela de nuevo",
  submitLabel = "Crear cuenta",
  onSubmit,
  onGoogle,
  googleLabel,
  switchText = "\xBFYa tienes cuenta?",
  switchAction = "Inicia sesi\xF3n",
  onSwitch,
  error,
  loading = false
}) {
  verifyTypesRegisterModal({
    email,
    password,
    confirmPassword,
    onEmailChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onSubmit
  });
  return /* @__PURE__ */ jsxs13(
    AuthShell,
    {
      open,
      onClose,
      triggerRef,
      logo,
      brand,
      title,
      submitLabel,
      onSubmit,
      onGoogle,
      googleLabel,
      switchText,
      switchAction,
      onSwitch,
      error,
      loading,
      children: [
        /* @__PURE__ */ jsx20(
          Input,
          {
            type: "text",
            inputMode: "email",
            autoComplete: "email",
            label: emailLabel,
            placeholder: emailPlaceholder,
            value: email,
            onChange: onEmailChange,
            disabled: loading
          }
        ),
        /* @__PURE__ */ jsx20(
          PasswordField,
          {
            autoComplete: "new-password",
            label: passwordLabel,
            placeholder: passwordPlaceholder,
            value: password,
            onChange: onPasswordChange,
            disabled: loading
          }
        ),
        /* @__PURE__ */ jsx20(
          PasswordField,
          {
            autoComplete: "new-password",
            label: confirmLabel,
            placeholder: confirmPlaceholder,
            value: confirmPassword,
            onChange: onConfirmPasswordChange,
            disabled: loading
          }
        )
      ]
    }
  );
}

// src/authModals/otpFields.jsx
import { useRef as useRef9 } from "react";
import { Fragment, jsx as jsx21, jsxs as jsxs14 } from "react/jsx-runtime";
var BOX2 = "flex-1 min-w-0 aspect-square rounded-[var(--radius-lg)] bg-[var(--md-sys-color-surface-container)] mott-title-large text-center text-[var(--md-sys-color-on-surface)] outline-none transition-colors duration-150 focus:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container))] disabled:opacity-50 disabled:cursor-not-allowed";
var GAP2 = " ";
function OtpFields({
  code = "",
  onCodeChange,
  length = 6,
  email,
  description,
  disabled = false,
  groupLabel
}) {
  const boxes = useRef9([]);
  const charAt = (index) => {
    const char = code[index];
    return char && char !== GAP2 ? char : "";
  };
  const slots = () => Array.from({ length }, (_, i) => code[i] ?? GAP2);
  const commit = (chars) => onCodeChange == null ? void 0 : onCodeChange(chars.join("").replace(/ +$/, ""));
  const focus = (index) => {
    var _a;
    return (_a = boxes.current[Math.min(Math.max(index, 0), length - 1)]) == null ? void 0 : _a.focus();
  };
  const handleChange = (index) => (event) => {
    const raw = event.target.value;
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (raw && !digit) {
      event.target.value = charAt(index);
      return;
    }
    const chars = slots();
    chars[index] = digit || GAP2;
    commit(chars);
    if (digit) focus(index + 1);
  };
  const handleKeyDown = (index) => (event) => {
    if (event.key === "Backspace") {
      if (charAt(index)) return;
      event.preventDefault();
      if (index === 0) return;
      const chars = slots();
      chars[index - 1] = GAP2;
      commit(chars);
      focus(index - 1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focus(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focus(index + 1);
    }
  };
  const handlePaste = (index) => (event) => {
    var _a;
    const digits = (((_a = event.clipboardData) == null ? void 0 : _a.getData("text")) ?? "").replace(/\D/g, "");
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
  const message = description ?? (email ? `Escribe el c\xF3digo de ${length} d\xEDgitos que enviamos a ${email}.` : `Escribe el c\xF3digo de ${length} d\xEDgitos que te enviamos.`);
  return /* @__PURE__ */ jsxs14(Fragment, { children: [
    /* @__PURE__ */ jsx21("p", { className: "mott-body-medium", style: { color: "var(--md-sys-color-on-surface-variant)" }, children: message }),
    /* @__PURE__ */ jsx21("div", { role: "group", "aria-label": groupLabel, className: "flex w-full gap-[var(--gap-group)]", children: Array.from({ length }, (_, index) => /* @__PURE__ */ jsx21(
      "input",
      {
        ref: (node) => {
          boxes.current[index] = node;
        },
        type: "text",
        inputMode: "numeric",
        autoComplete: index === 0 ? "one-time-code" : "off",
        maxLength: 1,
        "aria-label": `D\xEDgito ${index + 1} de ${length}`,
        className: BOX2,
        value: charAt(index),
        disabled,
        onFocus: (event) => event.target.select(),
        onChange: handleChange(index),
        onKeyDown: handleKeyDown(index),
        onPaste: handlePaste(index)
      },
      index
    )) })
  ] });
}

// src/authModals/otpModal.jsx
import { jsx as jsx22 } from "react/jsx-runtime";
function OtpModal({
  open,
  onClose,
  triggerRef,
  logo,
  brand,
  title = "Verifica tu correo",
  email,
  description,
  code = "",
  onCodeChange,
  length = 6,
  submitLabel = "Verificar",
  onSubmit,
  switchText = "\xBFNo te lleg\xF3 el c\xF3digo?",
  switchAction = "Reenviar",
  onResend,
  error,
  loading = false
}) {
  verifyTypesOtpModal({ code, onCodeChange, length, onSubmit, email, onResend });
  return /* @__PURE__ */ jsx22(
    AuthShell,
    {
      open,
      onClose,
      triggerRef,
      logo,
      brand,
      title,
      submitLabel,
      onSubmit,
      switchText,
      switchAction,
      onSwitch: onResend,
      error,
      loading,
      children: /* @__PURE__ */ jsx22(
        OtpFields,
        {
          code,
          onCodeChange,
          length,
          email,
          description,
          disabled: loading,
          groupLabel: title
        }
      )
    }
  );
}

// src/authModals/recoverPasswordModal.jsx
import { Fragment as Fragment2, jsx as jsx23, jsxs as jsxs15 } from "react/jsx-runtime";
function RecoverPasswordModal({
  open,
  onClose,
  triggerRef,
  logo,
  brand,
  step = "code",
  // step 'code'
  email,
  code = "",
  onCodeChange,
  length = 6,
  description,
  onVerifyCode,
  onResend,
  codeTitle = "Recupera tu contrase\xF1a",
  codeSubmitLabel = "Verificar",
  resendText = "\xBFNo te lleg\xF3 el c\xF3digo?",
  resendAction = "Reenviar",
  // step 'password'
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  onSubmitPassword,
  passwordTitle = "Crea una contrase\xF1a nueva",
  passwordLabel = "Nueva contrase\xF1a",
  passwordPlaceholder = "Escribe tu contrase\xF1a nueva",
  confirmLabel = "Confirma tu contrase\xF1a",
  confirmPlaceholder = "Escr\xEDbela de nuevo",
  passwordSubmitLabel = "Guardar contrase\xF1a",
  // back to the login modal
  onSwitch,
  switchText = "\xBFYa la recordaste?",
  switchAction = "Inicia sesi\xF3n",
  error,
  loading = false
}) {
  verifyTypesRecoverPasswordModal({
    step,
    email,
    code,
    onCodeChange,
    length,
    onVerifyCode,
    onResend,
    password,
    confirmPassword,
    onPasswordChange,
    onConfirmPasswordChange,
    onSubmitPassword
  });
  const isCode = step === "code";
  return /* @__PURE__ */ jsx23(
    AuthShell,
    {
      open,
      onClose,
      triggerRef,
      logo,
      brand,
      title: isCode ? codeTitle : passwordTitle,
      submitLabel: isCode ? codeSubmitLabel : passwordSubmitLabel,
      onSubmit: isCode ? onVerifyCode : onSubmitPassword,
      switchText: isCode ? resendText : switchText,
      switchAction: isCode ? resendAction : switchAction,
      onSwitch: isCode ? onResend : onSwitch,
      error,
      loading,
      children: isCode ? /* @__PURE__ */ jsx23(
        OtpFields,
        {
          code,
          onCodeChange,
          length,
          email,
          description,
          disabled: loading,
          groupLabel: codeTitle
        }
      ) : /* @__PURE__ */ jsxs15(Fragment2, { children: [
        /* @__PURE__ */ jsx23(
          PasswordField,
          {
            autoFocus: true,
            autoComplete: "new-password",
            label: passwordLabel,
            placeholder: passwordPlaceholder,
            value: password,
            onChange: onPasswordChange,
            disabled: loading
          }
        ),
        /* @__PURE__ */ jsx23(
          PasswordField,
          {
            autoComplete: "new-password",
            label: confirmLabel,
            placeholder: confirmPlaceholder,
            value: confirmPassword,
            onChange: onConfirmPasswordChange,
            disabled: loading
          }
        )
      ] })
    }
  );
}

// src/onBoardingModal/onboardingModal.jsx
import { useCallback as useCallback4, useEffect as useEffect6, useLayoutEffect, useMemo as useMemo4, useRef as useRef10, useState as useState9 } from "react";
import { useGSAP as useGSAP5 } from "@gsap/react";
import { twMerge as twMerge11 } from "tailwind-merge";
import gsap9 from "gsap";

// src/avatars/avatars.jsx
import { useMemo as useMemo3 } from "react";
import { Style, Avatar as Dicebear } from "@dicebear/core";
import critters from "@dicebear/styles/critters.json";

// src/shapes/shapes.jsx
import { forwardRef as forwardRef2, useId as useId5 } from "react";
import { twMerge as twMerge10 } from "tailwind-merge";
import { Fragment as Fragment3, jsx as jsx24, jsxs as jsxs16 } from "react/jsx-runtime";
var SIZE_TOKEN2 = {
  sm: "var(--control-size-sm)",
  md: "var(--control-size-md)",
  lg: "var(--control-size-lg)"
};
var spin = (degrees) => {
  if (!degrees) return "";
  const radians = degrees * Math.PI / 180;
  const inscribe = Math.round(1 / (Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians))) * 1e4) / 1e4;
  return ` translate(50 50) scale(${inscribe}) rotate(${degrees}) translate(-50 -50)`;
};
var Shape = forwardRef2(function Shape2({
  name,
  children,
  size = "lg",
  color = "primary",
  contentColor,
  points,
  rotate = 0,
  label,
  className,
  style,
  ...props
}, ref) {
  verifyTypesShape({ name, size, color, contentColor, points, rotate, label });
  const clipId = `mott-shape-${useId5().replace(/:/g, "")}`;
  if (!SHAPE_PATHS[name]) return null;
  const box = SIZE_TOKEN2[size] ?? size;
  const surface = ACCENTS[color] ?? color;
  const on = contentColor ?? ACCENT_ON[color] ?? "inherit";
  const decorative = !label && children == null;
  return /* @__PURE__ */ jsxs16(Fragment3, { children: [
    /* @__PURE__ */ jsx24(
      "svg",
      {
        "aria-hidden": "true",
        focusable: "false",
        width: "0",
        height: "0",
        style: { position: "absolute", width: 0, height: 0, overflow: "hidden" },
        children: /* @__PURE__ */ jsx24("defs", { children: /* @__PURE__ */ jsx24("clipPath", { id: clipId, clipPathUnits: "objectBoundingBox", children: /* @__PURE__ */ jsx24("path", { d: shapePath(name, { points }), transform: `scale(0.01)${spin(rotate)}` }) }) })
      }
    ),
    /* @__PURE__ */ jsx24(
      "div",
      {
        ref,
        role: label ? "img" : void 0,
        "aria-label": label,
        "aria-hidden": decorative || void 0,
        className: twMerge10("inline-flex shrink-0 items-center justify-center", className),
        style: {
          width: box,
          height: box,
          backgroundColor: surface,
          color: on,
          clipPath: `url(#${clipId})`,
          ...style
        },
        ...props,
        children
      }
    )
  ] });
});
var shapes_default = Shape;

// src/avatars/avatars.jsx
import { jsx as jsx25 } from "react/jsx-runtime";
var SIZE_TOKEN3 = {
  sm: "var(--control-size-sm)",
  md: "var(--control-size-md)",
  lg: "var(--control-size-lg)"
};
var CRITTERS_OPTIONS = {
  backgroundColor: [
    "b6e3f4",
    "c0aede",
    "d1d4f9",
    "ffd5dc",
    "ffdfbf",
    "d9f2d9",
    "0369a1",
    "4338ca",
    "a21caf",
    "be123c",
    "047857"
  ],
  backgroundColorAngle: -324,
  backgroundColorFillStops: 5,
  mouthProbability: 90,
  topProbability: 80,
  eyesVariant: [
    "angry",
    "bigPupils",
    "close",
    "closedLine",
    "dots",
    "happy",
    "inward",
    "mono",
    "monoSleepy",
    "round",
    "sideeye",
    "sleepy",
    "squint",
    "threeRow",
    "trio",
    "uneven",
    "wide",
    "wink"
  ],
  mouthVariant: [
    "blep",
    "catMouth",
    "dot",
    "grin",
    "laugh",
    "line",
    "ooh",
    "open",
    "smile",
    "smirk",
    "teeth",
    "tinySmile",
    "tongue",
    "tooth"
  ],
  // Explicitly off rather than simply unlisted: critters defines an `animation` component with no
  // probability of its own, so leaving it out would hand the decision to whatever DiceBear
  // defaults to. A probability of 0 is the only way to say "never" and have it stay said.
  animationProbability: 0
};
var styles = /* @__PURE__ */ new WeakMap();
var seen = 0;
var styleFor = (definition) => {
  let entry = styles.get(definition);
  if (!entry) {
    const style = new Style(definition);
    entry = { style, id: style.id() ?? `style-${seen += 1}` };
    styles.set(definition, entry);
  }
  return entry;
};
var LIMIT = 200;
var drawn = /* @__PURE__ */ new Map();
function render(definition, options) {
  const { style, id } = styleFor(definition);
  const key = JSON.stringify([id, options]);
  if (drawn.has(key)) return drawn.get(key);
  const uri = new Dicebear(style, options).toDataUri();
  drawn.set(key, uri);
  if (drawn.size > LIMIT) drawn.delete(drawn.keys().next().value);
  return uri;
}
function Avatar({
  seed,
  styleDefinition = critters,
  options,
  size = "md",
  shape,
  alt,
  className,
  style,
  ...props
}) {
  verifyTypesAvatar({ seed, styleDefinition, options, size, shape, alt });
  const uri = useMemo3(() => render(styleDefinition, {
    ...styleDefinition === critters ? CRITTERS_OPTIONS : null,
    ...options,
    seed
  }), [styleDefinition, options, seed]);
  const box = SIZE_TOKEN3[size] ?? size;
  const unselectable = { userSelect: "none", WebkitUserSelect: "none", WebkitUserDrag: "none" };
  const image = /* @__PURE__ */ jsx25(
    "img",
    {
      src: uri,
      alt: alt ?? seed,
      draggable: false,
      className: shape ? void 0 : className,
      style: shape ? { width: "100%", height: "100%", objectFit: "cover", ...unselectable } : { width: box, height: box, display: "block", objectFit: "cover", ...unselectable, ...style },
      ...shape ? null : props
    }
  );
  if (!shape) return image;
  return /* @__PURE__ */ jsx25(shapes_default, { name: shape, size, className, style, ...props, children: image });
}

// src/onBoardingModal/stepTransition.js
import gsap8 from "gsap";
var TRAVEL = 24;
var HANDOFF2 = { out: 0.8, lead: 0.1 };
var RUNNING = /* @__PURE__ */ Symbol.for("mott.runningStep");
var FLOAT = { position: "absolute", top: 0, left: 0, width: "100%" };
function transitionStep({ viewport, outgoing, incoming, direction = 1, onDone }) {
  var _a;
  if (!viewport || !incoming) {
    onDone == null ? void 0 : onDone();
    return null;
  }
  (_a = viewport[RUNNING]) == null ? void 0 : _a.kill();
  gsap8.set(incoming, { ...FLOAT, autoAlpha: 0 });
  const from = viewport.offsetHeight;
  const to = incoming.offsetHeight;
  if (outgoing) gsap8.set(outgoing, FLOAT);
  const total = dur(DURATION.base);
  gsap8.set(viewport, { overflow: "hidden" });
  const timeline = gsap8.timeline({
    onComplete: () => {
      viewport[RUNNING] = null;
      gsap8.set(viewport, { clearProps: "height,overflow" });
      gsap8.set(incoming, { clearProps: "position,top,left,width,transform,opacity,visibility" });
      onDone == null ? void 0 : onDone();
    }
  });
  timeline.fromTo(
    viewport,
    { height: from },
    { height: to, duration: total, ease: EASE.inOut },
    0
  );
  if (outgoing) {
    timeline.to(
      outgoing,
      { x: -TRAVEL * direction, autoAlpha: 0, duration: total * HANDOFF2.out, ease: EASE.exit },
      0
    );
  }
  timeline.fromTo(
    incoming,
    { x: TRAVEL * direction, autoAlpha: 0 },
    { x: 0, autoAlpha: 1, duration: total, ease: EASE.emphasized },
    total * HANDOFF2.lead
  );
  viewport[RUNNING] = timeline;
  return timeline;
}

// src/onBoardingModal/onboardingModal.jsx
import { Fragment as Fragment4, jsx as jsx26, jsxs as jsxs17 } from "react/jsx-runtime";
var STEPS2 = ["welcome", "profile", "color", "done"];
var MEDIA = "144px";
var MEDIA_HERO = "184px";
var STEPS_MIN_HEIGHT = 300;
var SETTLE = 500;
var NAME_MAX = 24;
var GLYPH_OUT = { autoAlpha: 0, scale: 0.6 };
var GLYPH_IN = { autoAlpha: 1, scale: 1 };
function OnboardingModal({
  open,
  onClose,
  triggerRef,
  icon,
  welcomeTitle = "Te damos la bienvenida",
  profileTitle = "\xBFC\xF3mo te llamas?",
  nameLabel = "Nombre",
  namePlaceholder = "Escribe tu nombre",
  colorTitle = "P\xEDntalo a tu manera",
  doneTitle = "Todo listo",
  onComplete
}) {
  verifyTypesOnboardingModal({ open, onClose, triggerRef, icon, onComplete });
  const { colorSeedHex, variant, setColorSeedHex, THEMES_AVAILABLE: THEMES_AVAILABLE2 } = useTheme();
  const [step, setStep] = useState9(0);
  const [previous2, setPrevious] = useState9(null);
  const [name, setName] = useState9("");
  const [seedName, setSeedName] = useState9("");
  const viewportRef = useRef10(null);
  const nodes = useRef10({});
  const trimmed = name.trim();
  const avatarSeed = seedName || "mott";
  useEffect6(() => {
    const id = setTimeout(() => setSeedName(trimmed), SETTLE);
    return () => clearTimeout(id);
  }, [trimmed]);
  const isLast = step === STEPS2.length - 1;
  const canAdvance = step !== 1 || trimmed !== "";
  const canGoBack = step >= 2;
  const advance = () => {
    if (!canAdvance) return;
    if (isLast) {
      onComplete == null ? void 0 : onComplete({ name: trimmed, avatarSeed, colorSeedHex });
      onClose == null ? void 0 : onClose();
      return;
    }
    setPrevious(step);
    setStep(step + 1);
  };
  const goBack = () => {
    if (!canGoBack) return;
    setPrevious(step);
    setStep(step - 1);
  };
  useLayoutEffect(() => {
    if (previous2 === null) return;
    const leaving = previous2;
    transitionStep({
      viewport: viewportRef.current,
      outgoing: nodes.current[STEPS2[leaving]],
      incoming: nodes.current[STEPS2[step]],
      // Sale de comparar el par que se esta cruzando ahora mismo, no de un estado aparte que
      // pudiera quedarse desincronizado de el.
      direction: step > leaving ? 1 : -1,
      onDone: () => {
        var _a;
        setPrevious((current) => current === leaving ? null : current);
        (_a = nodes.current[STEPS2[step]]) == null ? void 0 : _a.focus();
      }
    });
  }, [step, previous2]);
  const [glyph, setGlyph] = useState9("arrow_forward");
  const glyphRef = useRef10(null);
  const didMountRef = useRef10(false);
  useEffect6(() => {
    const next = isLast ? "check" : "arrow_forward";
    if (!didMountRef.current) {
      didMountRef.current = true;
      setGlyph(next);
      return;
    }
    if (next === glyph || !glyphRef.current) return;
    gsap9.to(glyphRef.current, {
      ...GLYPH_OUT,
      duration: dur(DURATION.instant),
      ease: EASE.exit,
      overwrite: "auto",
      onComplete: () => {
        setGlyph(next);
        gsap9.to(glyphRef.current, {
          ...GLYPH_IN,
          duration: dur(DURATION.fast),
          ease: EASE.emphasized
        });
      }
    });
  }, [isLast, glyph]);
  const backRef = useRef10(null);
  const backSlotRef = useRef10(null);
  useEffect6(() => {
    const el = backRef.current;
    const slot = backSlotRef.current;
    if (!el || !slot) return;
    const shown = { autoAlpha: canGoBack ? 1 : 0, scale: canGoBack ? 1 : 0.6 };
    const width = canGoBack ? "auto" : 0;
    if (prefersReducedMotion()) {
      gsap9.set(el, shown);
      gsap9.set(slot, { width });
      return;
    }
    gsap9.to(el, { ...shown, duration: DURATION.fast, ease: EASE.emphasized, overwrite: "auto" });
    gsap9.to(slot, { width, duration: DURATION.fast, ease: EASE.emphasized, overwrite: "auto" });
  }, [canGoBack]);
  const reset = useCallback4(() => {
    setStep(0);
    setPrevious(null);
    setName("");
    setSeedName("");
  }, []);
  const isActive = (theme) => theme.hex.toLowerCase() === colorSeedHex.toLowerCase() && (theme.variant ?? variant) === variant;
  const registrars = useRef10({});
  const register = (id) => registrars.current[id] ??= (node) => {
    nodes.current[id] = node;
  };
  const content = useMemo4(() => ({
    welcome: {
      title: welcomeTitle,
      body: /* @__PURE__ */ jsx26(Media, { children: /* @__PURE__ */ jsx26(
        "div",
        {
          className: "flex items-center justify-center",
          style: {
            width: MEDIA_HERO,
            height: MEDIA_HERO,
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--md-sys-color-primary-container)",
            color: "var(--md-sys-color-on-primary-container)"
          },
          children: icon ?? /* @__PURE__ */ jsx26(Icon, { name: "waving_hand", size: "64px" })
        }
      ) })
    },
    profile: {
      title: profileTitle,
      body: /* @__PURE__ */ jsxs17(Fragment4, { children: [
        /* @__PURE__ */ jsx26(Media, { children: /* @__PURE__ */ jsx26(Face, { children: /* @__PURE__ */ jsx26(
          Avatar,
          {
            seed: avatarSeed,
            size: MEDIA,
            alt: trimmed || "Tu avatar",
            style: { borderRadius: "var(--radius-full)" }
          }
        ) }, avatarSeed) }),
        /* @__PURE__ */ jsx26("div", { className: "w-full", children: /* @__PURE__ */ jsx26(
          Input,
          {
            label: nameLabel,
            placeholder: namePlaceholder,
            value: name,
            onChange: setName,
            maxLength: NAME_MAX,
            autoComplete: "name"
          }
        ) })
      ] })
    },
    color: {
      title: colorTitle,
      /*Cinco columnas que ocupan el ancho entero, y cada swatch tan grande como su columna.
        Envolviendo con un tamano fijo la rejilla medía 312px dentro de un panel de 376:
        sobraban 64px a la derecha que dejaban el bloque de colores sin alinear con el titulo,
        y ese hueco muerto era lo unico que se miraba en un paso que no tiene nada mas.
        Estirados, la rejilla es un bloque de la modal.*/
      body: /* @__PURE__ */ jsx26("div", { className: "grid w-full grid-cols-5 gap-[var(--gap-group)]", children: THEMES_AVAILABLE2.map((theme) => /* @__PURE__ */ jsx26(
        SwatchButton,
        {
          theme,
          size: "100%",
          selected: isActive(theme),
          onSelect: () => setColorSeedHex(theme.hex, theme.variant)
        },
        theme.name
      )) })
    },
    done: {
      title: trimmed ? `${doneTitle}, ${trimmed}` : doneTitle,
      body: /* @__PURE__ */ jsx26(Media, { children: /* @__PURE__ */ jsx26(Face, { children: /* @__PURE__ */ jsx26(
        Avatar,
        {
          seed: avatarSeed,
          size: MEDIA_HERO,
          alt: trimmed || "Tu avatar",
          style: { borderRadius: "var(--radius-full)" }
        }
      ) }, avatarSeed) })
    }
  }), [
    icon,
    welcomeTitle,
    profileTitle,
    nameLabel,
    namePlaceholder,
    colorTitle,
    doneTitle,
    avatarSeed,
    trimmed,
    name,
    THEMES_AVAILABLE2,
    colorSeedHex,
    variant,
    setColorSeedHex
  ]);
  const visible = previous2 === null ? [step] : [previous2, step];
  return (
    /*Sin `onClose`. Es lo que cierra de golpe las dos salidas que CustomModal trae de serie:
      Escape y el clic en el velo son los dos `onClose?.()` de customModal.jsx, asi que sin la
      prop no hacen nada, y el `onCancel` del <dialog> ya trae su propio preventDefault para que
      el navegador no lo cierre por su cuenta. El onboarding se recorre entero o no se recorre -
      abandonarlo a la mitad deja la app sin nombre, sin cara y sin acento, porque `onComplete`
      solo se dispara al final. La unica salida es `advance()` en el ultimo paso.*/
    /* @__PURE__ */ jsx26(
      CustomModal,
      {
        open,
        onCloseComplete: reset,
        triggerRef,
        className: "h-full w-full max-w-none overflow-hidden rounded-none p-[var(--gap-block)] pb-[calc(var(--gap-page)+env(safe-area-inset-bottom))] md:p-[var(--gap-page)] md:pb-[calc(var(--gap-page)+env(safe-area-inset-bottom))]",
        children: /* @__PURE__ */ jsxs17("div", { className: "mx-auto flex h-full w-full max-w-[480px] flex-col", children: [
          /* @__PURE__ */ jsx26("div", { className: "-mx-[6px] flex min-h-0 flex-1 items-center overflow-y-auto px-[6px]", children: /* @__PURE__ */ jsx26(
            "div",
            {
              ref: viewportRef,
              className: "relative w-full",
              "data-onboarding-viewport": "",
              children: visible.map((index) => {
                const id = STEPS2[index];
                return /* @__PURE__ */ jsxs17(
                  "div",
                  {
                    ref: register(id),
                    role: "group",
                    tabIndex: -1,
                    "aria-label": id,
                    className: "flex w-full flex-col items-center outline-none",
                    style: { minHeight: STEPS_MIN_HEIGHT },
                    children: [
                      /* @__PURE__ */ jsx26(Title, { clamp: id === "done", children: content[id].title }),
                      /* @__PURE__ */ jsx26("div", { className: "flex w-full flex-1 flex-col items-center justify-center gap-[var(--gap-block)]", children: content[id].body })
                    ]
                  },
                  id
                );
              })
            }
          ) }),
          /* @__PURE__ */ jsxs17("div", { className: "mt-[var(--gap-page)] flex w-full shrink-0 items-center justify-center", children: [
            /* @__PURE__ */ jsx26("span", { ref: backSlotRef, className: "flex overflow-hidden", style: { width: 0 }, children: /* @__PURE__ */ jsx26(
              button_default,
              {
                ref: backRef,
                variant: "default",
                iconOnly: true,
                shape: "pill",
                onClick: goBack,
                disabled: !canGoBack,
                "aria-label": "Volver",
                style: {
                  width: "var(--control-size-md)",
                  height: "var(--control-size-md)",
                  padding: 0,
                  marginRight: "var(--gap-block)",
                  /*Sin esto el boton NUNCA se ve: su hueco arranca con `width: 0` y
                    como hijo flex de ese hueco se encoge hasta 0, asi que el
                    `offsetWidth` con el que se mide el ancho al que abrirlo tambien
                    vale 0 y el hueco se queda cerrado sobre si mismo.*/
                  flexShrink: 0,
                  opacity: 0,
                  visibility: "hidden"
                },
                ...pressHandlers(),
                children: /* @__PURE__ */ jsx26(Icon, { name: "arrow_back", size: "lg" })
              }
            ) }),
            /* @__PURE__ */ jsx26(
              button_default,
              {
                variant: "action",
                iconOnly: true,
                shape: "pill",
                onClick: advance,
                disabled: !canAdvance,
                "aria-label": isLast ? "Terminar" : "Continuar",
                style: { width: "var(--control-size-md)", height: "var(--control-size-md)", padding: 0 },
                ...pressHandlers(),
                children: /* @__PURE__ */ jsx26("span", { ref: glyphRef, className: "flex", children: /* @__PURE__ */ jsx26(Icon, { name: glyph, size: "lg" }) })
              }
            )
          ] })
        ] })
      }
    )
  );
}
function Title({ children, clamp }) {
  return /* @__PURE__ */ jsx26(
    "h2",
    {
      className: twMerge11(
        "mott-display-small md:mott-display-medium mott-title-emphasis w-full text-center",
        clamp && "line-clamp-2 [overflow-wrap:anywhere]"
      ),
      style: { color: "var(--md-sys-color-on-surface)", margin: 0 },
      children
    }
  );
}
function Face({ children }) {
  const ref = useRef10(null);
  useGSAP5(() => {
    if (!ref.current) return;
    const landed = { autoAlpha: 1, scale: 1 };
    if (prefersReducedMotion()) {
      gsap9.set(ref.current, landed);
      return;
    }
    gsap9.fromTo(ref.current, { autoAlpha: 0.25, scale: 0.94 }, {
      ...landed,
      duration: DURATION.slow,
      ease: EASE.standard
    });
  }, { scope: ref });
  return /* @__PURE__ */ jsx26("div", { ref, className: "flex", children });
}
function Media({ children }) {
  return /* @__PURE__ */ jsx26("div", { className: "flex w-full justify-center py-[var(--gap-group)]", children });
}

// src/optionsModal/optionsModal.jsx
import { useRef as useRef11, useState as useState10 } from "react";
import { twMerge as twMerge12 } from "tailwind-merge";
import { jsx as jsx27, jsxs as jsxs18 } from "react/jsx-runtime";
var ROW_BASE = "mott-state-layer flex w-full items-center gap-[var(--gap-group)] rounded-[var(--radius-default)] border-0 bg-transparent px-5 py-3.5 text-left cursor-pointer whitespace-nowrap mott-label-large mott-trim transition-[color] duration-[var(--duration-instant)]";
var ROW_TONE = {
  default: "text-[var(--md-sys-color-on-surface)]",
  danger: "text-[var(--md-sys-color-error)]"
};
var APPEARANCE_ANIMATION = new AnchoredAnimation({ anchor: "panel", align: "edge" });
var ICON_TONE = {
  default: "text-[var(--md-sys-color-on-surface-variant)]",
  danger: "text-[var(--md-sys-color-error)]"
};
var appearanceItem = (overrides = {}) => ({
  id: "appearance",
  kind: "appearance",
  icon: "palette",
  label: "Apariencia",
  // no cierra el menu: la modal del tema se apoya ENCIMA de el, que es el punto
  closeOnSelect: false,
  ...overrides
});
var feedbackItem = (overrides = {}) => ({
  id: "feedback",
  icon: "feedback",
  label: "Dar Feedback",
  ...overrides
});
var logoutItem = (overrides = {}) => ({
  id: "logout",
  icon: "logout",
  label: "Cerrar Sesi\xF3n",
  tone: "danger",
  ...overrides
});
var attachRef = (node, store, key, forwarded) => {
  if (key !== null) store.current[key] = node;
  if (typeof forwarded === "function") forwarded(node);
  else if (forwarded) forwarded.current = node;
};
function OptionsModal({
  open,
  onClose,
  onCloseComplete,
  triggerRef,
  items = [],
  title = "Opciones",
  animation = anchoredAnimation,
  className,
  style
}) {
  verifyTypesOptionsModal({ open, onClose, onCloseComplete, triggerRef, items, title, animation });
  const [appearanceOpen, setAppearanceOpen] = useState10(false);
  const rowRefs = useRef11({});
  const appearanceRef = useRef11(null);
  const handleSelect = (item, event) => {
    var _a;
    if (item.kind === "appearance") setAppearanceOpen(true);
    (_a = item.onClick) == null ? void 0 : _a.call(item, event);
    if (item.closeOnSelect !== false && item.kind !== "appearance") onClose == null ? void 0 : onClose();
  };
  return /* @__PURE__ */ jsxs18(
    CustomModal,
    {
      open,
      onClose,
      onCloseComplete,
      triggerRef,
      animation,
      className: twMerge12("w-[18rem] rounded-[32px]", className),
      style,
      children: [
        /* @__PURE__ */ jsxs18("div", { className: "flex flex-col gap-[var(--gap-page)]", role: "menu", children: [
          title && /* @__PURE__ */ jsx27(
            "h2",
            {
              className: "mott-headline-medium mott-title-emphasis px-5",
              style: { color: "var(--md-sys-color-on-surface)" },
              children: title
            }
          ),
          /* @__PURE__ */ jsx27("div", { className: "flex flex-col gap-[var(--gap-tight)]", children: items.map((item, i) => {
            if (item == null ? void 0 : item.separator) {
              return /* @__PURE__ */ jsx27(
                "hr",
                {
                  className: "my-[var(--gap-tight)] border-0 h-px bg-[var(--md-sys-color-outline-variant)]"
                },
                item.id ?? `sep-${i}`
              );
            }
            return /* @__PURE__ */ jsxs18(
              "button",
              {
                ref: (node) => {
                  attachRef(node, rowRefs, item.id ?? i, item.buttonRef);
                  if (item.kind === "appearance") appearanceRef.current = node;
                },
                type: "button",
                role: "menuitem",
                onClick: (event) => handleSelect(item, event),
                className: twMerge12(ROW_BASE, ROW_TONE[item.tone] ?? ROW_TONE.default),
                ...pressHandlers(),
                children: [
                  item.icon && /* @__PURE__ */ jsx27("span", { className: twMerge12("flex", ICON_TONE[item.tone] ?? ICON_TONE.default), children: typeof item.icon === "string" ? /* @__PURE__ */ jsx27(Icon, { name: item.icon }) : item.icon }),
                  /* @__PURE__ */ jsx27("span", { children: item.label })
                ]
              },
              item.id ?? i
            );
          }) })
        ] }),
        /* @__PURE__ */ jsx27(
          ThemeModal,
          {
            open: appearanceOpen,
            onClose: () => setAppearanceOpen(false),
            triggerRef: appearanceRef,
            animation: APPEARANCE_ANIMATION
          }
        )
      ]
    }
  );
}

// src/loading/loading.jsx
import { useMemo as useMemo5, useRef as useRef12 } from "react";
import { useGSAP as useGSAP6 } from "@gsap/react";
import gsap10 from "gsap";

// src/loading/shapeMorph.js
var TAU2 = Math.PI * 2;
var CENTRE = 50;
var SAMPLES = 120;
var WALK = 720;
var START = -Math.PI / 2;
var round2 = (n) => Math.round(n * 100) / 100;
var SVG_NS = "http://www.w3.org/2000/svg";
function walk(d) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", d);
  svg.appendChild(path);
  document.body.appendChild(svg);
  const total = path.getTotalLength();
  const points = [];
  for (let i = 0; i < WALK; i += 1) {
    const { x, y } = path.getPointAtLength(total * i / WALK);
    points.push([Math.atan2(y - CENTRE, x - CENTRE), Math.hypot(x - CENTRE, y - CENTRE)]);
  }
  svg.remove();
  return points;
}
function radiiFrom(points) {
  const unwrapped = [];
  let previous2 = points[0][0];
  for (const [angle, radius] of points) {
    let a = angle;
    while (a - previous2 > Math.PI) a -= TAU2;
    while (previous2 - a > Math.PI) a += TAU2;
    unwrapped.push([a, radius]);
    previous2 = a;
  }
  if (unwrapped[unwrapped.length - 1][0] < unwrapped[0][0]) unwrapped.reverse();
  const first = unwrapped[0][0];
  const inside = (angle) => {
    let a = angle;
    while (a < first) a += TAU2;
    while (a >= first + TAU2) a -= TAU2;
    return a;
  };
  const radii = new Float64Array(SAMPLES);
  for (let i = 0; i < SAMPLES; i += 1) {
    const target = inside(START + TAU2 * i / SAMPLES);
    let lo = 0;
    let hi = unwrapped.length - 1;
    while (hi - lo > 1) {
      const mid = lo + hi >> 1;
      if (unwrapped[mid][0] <= target) lo = mid;
      else hi = mid;
    }
    const [a0, r0] = unwrapped[lo];
    const [a1, r1] = unwrapped[hi];
    const span = a1 - a0;
    radii[i] = span === 0 ? r0 : r0 + (r1 - r0) * (target - a0) / span;
  }
  return radii;
}
var measured = /* @__PURE__ */ new Map();
function radiiOf({ name, points } = {}) {
  if (typeof document === "undefined") return null;
  const key = `${name}|${points ?? ""}`;
  if (measured.has(key)) return measured.get(key);
  const d = shapePath(name, { points });
  if (!d) return null;
  const radii = radiiFrom(walk(d));
  measured.set(key, radii);
  return radii;
}
function morphPath(from, to, t) {
  if (!from || !to) return null;
  const points = new Array(SAMPLES);
  for (let i = 0; i < SAMPLES; i += 1) {
    const radius = from[i] + (to[i] - from[i]) * t;
    const angle = START + TAU2 * i / SAMPLES;
    points[i] = `${round2(CENTRE + Math.cos(angle) * radius)} ${round2(CENTRE + Math.sin(angle) * radius)}`;
  }
  return `M ${points[0]} L ${points.slice(1).join(" L ")} Z`;
}

// src/loading/loading.jsx
import { jsx as jsx28 } from "react/jsx-runtime";
var SIZE_TOKEN4 = {
  sm: "var(--control-size-sm)",
  md: "var(--control-size-md)",
  lg: "var(--control-size-lg)"
};
var LOADER_SHAPES = [
  { name: "cookie", points: 20 },
  { name: "triangle" },
  { name: "diamond" }
];
var MORPH2 = 0.6;
var HOLD = 0.25;
var SPIN = 6;
var SPIN_STILL = 12;
function Loading({
  size = "sm",
  color = "primary",
  shapes = LOADER_SHAPES,
  label = "Cargando",
  className,
  style,
  ...props
}) {
  var _a, _b;
  verifyTypesLoading({ size, color, shapes, label });
  const svgRef = useRef12(null);
  const pathRef = useRef12(null);
  const box = SIZE_TOKEN4[size] ?? size;
  const fill = ACCENTS[color] ?? color;
  const cycle = useMemo5(
    () => shapes.map((shape) => `${shape.name}|${shape.points ?? ""}`).join(","),
    [shapes]
  );
  const initial = shapePath((_a = shapes[0]) == null ? void 0 : _a.name, { points: (_b = shapes[0]) == null ? void 0 : _b.points }) ?? "";
  useGSAP6(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path) return;
    const still = prefersReducedMotion();
    gsap10.to(svg, {
      rotate: 360,
      duration: still ? SPIN_STILL : SPIN,
      repeat: -1,
      ease: "none"
    });
    if (still) return;
    const radii = shapes.map(radiiOf);
    if (radii.some((entry) => !entry)) return;
    const timeline = gsap10.timeline({ repeat: -1 });
    radii.forEach((from, index) => {
      const to = radii[(index + 1) % radii.length];
      const state = { t: 0 };
      timeline.to(state, {
        t: 1,
        duration: MORPH2,
        /*`EASE.inOut` es la unica del vocabulario que arranca y acaba practicamente parada y
          reparte el viaje por igual - la que motion.js describe para mirar algo
          transformarse. Una curva de cabeza rapida dejaria el morph hecho en el primer
          cuarto y dos tercios del tiempo sin ensenar nada.*/
        ease: EASE.inOut,
        onUpdate: () => path.setAttribute("d", morphPath(from, to, state.t))
      }, `+=${HOLD}`);
    });
  }, { dependencies: [cycle] });
  return /* @__PURE__ */ jsx28(
    "svg",
    {
      ref: svgRef,
      viewBox: "0 0 100 100",
      role: "status",
      "aria-label": label,
      className,
      style: {
        width: box,
        height: box,
        display: "block",
        // El color va por `currentColor` para que el consumidor pueda pisarlo desde CSS sin
        // tener que saber que dentro hay un <path>.
        color: fill,
        ...style
      },
      ...props,
      children: /* @__PURE__ */ jsx28("path", { ref: pathRef, d: initial, fill: "currentColor" })
    }
  );
}

// src/navbar/navbar.jsx
import { useRef as useRef13, useState as useState11 } from "react";
import { useGSAP as useGSAP7 } from "@gsap/react";
import gsap11 from "gsap";
import { twMerge as twMerge13 } from "tailwind-merge";
import { Fragment as Fragment5, jsx as jsx29, jsxs as jsxs19 } from "react/jsx-runtime";
var DESKTOP_ALIGN = {
  center: "justify-center",
  // Sin padding propio: el respiro por arriba lo pone ya el `p-[var(--gap-block)]` del <nav>, y
  // sumarle otro dejaria los iconos al doble de distancia del borde que del lado izquierdo.
  top: "justify-start"
};
var ITEM_BASE = "mott-state-layer mott-morph inline-flex items-center justify-center gap-2 border-0 cursor-pointer p-0 mott-label-large mott-trim [--mott-morph-bg:var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] transition-[color] duration-[var(--duration-morph)] ease-[var(--ease-morph)]";
var ITEM_SELECTED = "[--mott-morph-bg:var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]";
var attachRef2 = (node, store, i, forwarded) => {
  if (i === null) store.current = node;
  else store.current[i] = node;
  if (typeof forwarded === "function") forwarded(node);
  else if (forwarded) forwarded.current = node;
};
function NavItems({ items, selectedItem, onSelect, vertical }) {
  const itemRefs = useRef13([]);
  const containerRef = useRef13(null);
  const prevSelectedRef = useRef13(selectedItem);
  const prevCountRef = useRef13(null);
  useGSAP7(() => {
    itemRefs.current.length = items.length;
    const shapeOf = (i) => selectionShape(i === selectedItem);
    const settleOnly = prevCountRef.current !== items.length;
    prevCountRef.current = items.length;
    if (settleOnly) {
      itemRefs.current.forEach((el, i) => {
        if (el) gsap11.set(el, shapeOf(i));
      });
      prevSelectedRef.current = selectedItem;
      return;
    }
    const changed = /* @__PURE__ */ new Set([prevSelectedRef.current, selectedItem]);
    prevSelectedRef.current = selectedItem;
    changed.forEach((i) => {
      const el = itemRefs.current[i];
      if (el) morphSelection(el, i === selectedItem);
    });
  }, { dependencies: [selectedItem, items.length], scope: containerRef });
  return /* @__PURE__ */ jsx29("div", { ref: containerRef, className: twMerge13("inline-flex gap-[var(--gap-group)]", vertical && "flex-col"), children: items.map((item, i) => {
    const iconOnly = !item.label;
    return /* @__PURE__ */ jsxs19(
      "button",
      {
        ref: (el) => attachRef2(el, itemRefs, i, item.buttonRef),
        type: "button",
        onClick: () => onSelect(i),
        "aria-pressed": selectedItem === i,
        className: twMerge13(ITEM_BASE, selectedItem === i && ITEM_SELECTED),
        ...pressHandlers(),
        style: {
          height: "var(--control-size-md)",
          ...iconOnly ? { width: "var(--control-size-md)" } : { padding: "0 20px" }
        },
        children: [
          item.icon && (typeof item.icon === "string" ? /* @__PURE__ */ jsx29(Icon, { name: item.icon }) : item.icon),
          item.label && /* @__PURE__ */ jsx29("span", { children: item.label })
        ]
      },
      item.id ?? i
    );
  }) });
}
function LogoButton({ logo }) {
  const ref = useRef13(null);
  const didMountRef = useRef13(false);
  useGSAP7(() => {
    if (!ref.current) return;
    const shape = selectionShape(!!logo.active);
    if (!didMountRef.current) {
      didMountRef.current = true;
      gsap11.set(ref.current, shape);
      return;
    }
    morphSelection(ref.current, !!logo.active);
  }, { dependencies: [logo.active] });
  return /* @__PURE__ */ jsx29(
    "button",
    {
      ref: (el) => attachRef2(el, ref, null, logo.buttonRef),
      type: "button",
      onClick: logo.onClick,
      "aria-pressed": !!logo.active,
      "aria-label": logo.label ?? "Inicio",
      className: twMerge13(ITEM_BASE, logo.active && ITEM_SELECTED),
      ...pressHandlers(),
      style: {
        width: "var(--control-size-md)",
        height: "var(--control-size-md)"
      },
      children: typeof logo.icon === "string" ? /* @__PURE__ */ jsx29(Icon, { name: logo.icon }) : logo.icon
    }
  );
}
function AccountButton({ account, buttonRef }) {
  const ref = useRef13(null);
  const didMountRef = useRef13(false);
  const [broken, setBroken] = useState11(false);
  useGSAP7(() => {
    if (!ref.current) return;
    const shape = selectionShape(!!account.active);
    if (!didMountRef.current) {
      didMountRef.current = true;
      gsap11.set(ref.current, shape);
      return;
    }
    morphSelection(ref.current, !!account.active);
  }, { dependencies: [account.active] });
  const photo = { width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit", userSelect: "none" };
  return /* @__PURE__ */ jsx29(
    "button",
    {
      ref: (el) => attachRef2(el, ref, null, buttonRef),
      type: "button",
      onClick: account.onClick,
      "aria-pressed": !!account.active,
      "aria-label": account.alt ?? "Tu cuenta",
      className: twMerge13(ITEM_BASE, account.active && ITEM_SELECTED),
      ...pressHandlers(),
      style: { width: "var(--control-size-md)", height: "var(--control-size-md)" },
      children: account.src && !broken ? /* @__PURE__ */ jsx29(
        "img",
        {
          src: account.src,
          alt: "",
          draggable: false,
          onError: () => setBroken(true),
          style: photo
        }
      ) : /* @__PURE__ */ jsx29(
        Avatar,
        {
          seed: account.seed ?? account.alt ?? "usuario",
          size: "100%",
          alt: "",
          style: photo
        }
      )
    }
  );
}
function Navbar({
  items = [],
  selected,
  defaultSelected = null,
  onChange,
  logo,
  account,
  align = "top",
  className,
  style
}) {
  verifyTypesNavbar({ items, logo, account, selected, defaultSelected, onChange, align });
  const [internalSelected, setInternalSelected] = useState11(defaultSelected);
  const isControlled = selected !== void 0;
  const selectedItem = isControlled ? selected : internalSelected;
  const handleSelect = (i) => {
    if (!isControlled) setInternalSelected(i);
    onChange == null ? void 0 : onChange(i, items[i]);
  };
  const [accountOpen, setAccountOpen] = useState11(false);
  const accountRef = useRef13(null);
  const captureAccount = (node) => {
    if (node && node.offsetWidth > 0) accountRef.current = node;
  };
  const accountProps = account && {
    ...account,
    onClick: () => {
      var _a;
      if (account.options) setAccountOpen(true);
      (_a = account.onClick) == null ? void 0 : _a.call(account);
    }
  };
  return /* @__PURE__ */ jsxs19(Fragment5, { children: [
    /* @__PURE__ */ jsxs19(
      "nav",
      {
        className: twMerge13(
          "hidden md:flex sticky top-[var(--gap-block)] h-[calc(100dvh_-_var(--gap-block)_*_2)] w-fit shrink-0 flex-col items-center my-[var(--gap-block)] mx-[var(--gap-section)] p-[var(--gap-block)] gap-[var(--gap-group)]",
          DESKTOP_ALIGN[align] ?? DESKTOP_ALIGN.center,
          className
        ),
        style,
        children: [
          logo && /* @__PURE__ */ jsx29(LogoButton, { logo }),
          /* @__PURE__ */ jsx29(NavItems, { items, selectedItem, onSelect: handleSelect, vertical: true }),
          accountProps && /* @__PURE__ */ jsx29("div", { className: "mt-auto mb-4", children: /* @__PURE__ */ jsx29(AccountButton, { account: accountProps, buttonRef: captureAccount }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx29(
      "nav",
      {
        className: twMerge13(
          "flex md:hidden fixed bottom-4 left-1/2 z-[var(--z-nav)] -translate-x-1/2 items-center gap-3",
          className
        ),
        style,
        children: /* @__PURE__ */ jsxs19(
          "div",
          {
            className: "flex items-center gap-1 rounded-[var(--radius-full)] bg-[var(--md-sys-color-surface)] p-1",
            style: { boxShadow: "var(--shadow-floating)" },
            children: [
              /* @__PURE__ */ jsx29(NavItems, { items, selectedItem, onSelect: handleSelect, vertical: false }),
              accountProps && /* @__PURE__ */ jsx29(AccountButton, { account: accountProps, buttonRef: captureAccount })
            ]
          }
        )
      }
    ),
    (account == null ? void 0 : account.options) && /* @__PURE__ */ jsx29(
      OptionsModal,
      {
        open: accountOpen,
        onClose: () => setAccountOpen(false),
        triggerRef: accountRef,
        items: account.options,
        title: account.optionsTitle
      }
    )
  ] });
}

// src/dragScroll/dragScroll.jsx
import { useCallback as useCallback5, useEffect as useEffect7, useLayoutEffect as useLayoutEffect2, useRef as useRef14, useState as useState12 } from "react";
import { twMerge as twMerge14 } from "tailwind-merge";
import gsap12 from "gsap";
import { Draggable as Draggable2 } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { jsx as jsx30 } from "react/jsx-runtime";
gsap12.registerPlugin(Draggable2, InertiaPlugin);
var DRAG_TYPE = { y: "scrollTop", x: "scrollLeft", both: "scroll" };
var EDGE_RESISTANCE = 0.85;
function useDragScroll(ref, { axis = "y", inertia = true, disabled = false } = {}) {
  useEffect7(() => {
    if (disabled || !ref.current) return;
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    let draggable = null;
    const overflows = () => axis === "x" ? el.scrollWidth > el.clientWidth : axis === "both" ? el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight : el.scrollHeight > el.clientHeight;
    const sync = () => {
      if (overflows() && !draggable) {
        [draggable] = Draggable2.create(el, {
          type: DRAG_TYPE[axis] ?? DRAG_TYPE.y,
          inertia,
          edgeResistance: EDGE_RESISTANCE,
          minimumMovement: 3,
          dragClickables: true,
          cursor: "grab",
          activeCursor: "grabbing"
        });
      } else if (!overflows() && draggable) {
        draggable.kill();
        draggable = null;
        el.style.cursor = "";
      }
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => {
      observer.disconnect();
      draggable == null ? void 0 : draggable.kill();
      el.style.cursor = "";
    };
  }, [ref, axis, inertia, disabled]);
}
function useEdgeFade(ref, axis, size) {
  const [edges, setEdges] = useState12([0, 0]);
  const measure = useCallback5(() => {
    const el = ref.current;
    if (!el) return;
    const horizontal = axis === "x";
    const pos = horizontal ? el.scrollLeft : el.scrollTop;
    const total = horizontal ? el.scrollWidth : el.scrollHeight;
    const visible = horizontal ? el.clientWidth : el.clientHeight;
    const remaining = total - visible - pos;
    setEdges([Math.min(pos, size), Math.min(Math.max(remaining, 0), size)]);
  }, [ref, axis, size]);
  useLayoutEffect2(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [ref, measure]);
  return edges;
}
function DragScroll({
  children,
  axis = "y",
  inertia = true,
  disabled = false,
  fade = true,
  fadeSize,
  className,
  style,
  ...props
}) {
  verifyTypesDragScroll({ axis, inertia, disabled, fade, fadeSize });
  const scrollRef = useRef14(null);
  useDragScroll(scrollRef, { axis, inertia, disabled });
  const size = fadeSize ?? 32;
  const [fadeStart, fadeEnd] = useEdgeFade(scrollRef, axis, fade ? size : 0);
  const horizontal = axis === "x";
  return /* @__PURE__ */ jsx30(
    "div",
    {
      ref: scrollRef,
      className: twMerge14(fade && (horizontal ? "mott-fade-x" : "mott-fade-y"), className),
      style: {
        overflowX: horizontal || axis === "both" ? "auto" : "hidden",
        overflowY: horizontal ? "hidden" : "auto",
        "--mott-fade-start": `${fadeStart}px`,
        "--mott-fade-end": `${fadeEnd}px`,
        ...style
      },
      ...props,
      children
    }
  );
}

// src/GeneratorGradientProfile/GeneratorGradientProfile.jsx
import { useCallback as useCallback6, useEffect as useEffect8, useMemo as useMemo6, useRef as useRef15, useState as useState13 } from "react";

// src/GeneratorGradientProfile/gradientCanvas.js
var CARD_W = 440;
var CARD_H = 600;
var BAYER8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
];
var PIXEL = 5;
var LEVELS = 5;
var RADIUS = 30;
function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
function waveT(u, v) {
  let t = u * 0.52 + v * 0.78;
  t += Math.sin((u * 3.2 + 1.2) * Math.PI) * 0.13 + Math.sin((v * 5 - u * 2.4 + 2.7) * Math.PI) * 0.075;
  return t / 1.3;
}
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}
function colorAt(u, v, ramp) {
  const t = Math.min(1, Math.max(0, waveT(u, v)));
  const stops = ramp.stops;
  let i = 0;
  while (i < stops.length - 2 && t > stops[i + 1].t) i++;
  const s0 = stops[i];
  const s1 = stops[i + 1];
  const span = s1.t - s0.t || 1;
  const lt = smoothstep(Math.min(1, Math.max(0, (t - s0.t) / span)));
  let r = s0.color[0] + (s1.color[0] - s0.color[0]) * lt;
  let g = s0.color[1] + (s1.color[1] - s0.color[1]) * lt;
  let b = s0.color[2] + (s1.color[2] - s0.color[2]) * lt;
  const a = ramp.accent;
  if (a) {
    const d = Math.hypot(u - a.cx, v - a.cy) / a.r;
    const w = Math.max(0, 1 - d);
    const w2 = w * w * 0.75;
    r += (a.color[0] - r) * w2;
    g += (a.color[1] - g) * w2;
    b += (a.color[2] - b) * w2;
  }
  return [r, g, b];
}
function drawDither(ctx, w, h, ramp) {
  const cols = Math.ceil(w / PIXEL);
  const rows = Math.ceil(h / PIXEL);
  const step = 255 / (LEVELS - 1);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const u = i / (cols - 1);
      const v = j / (rows - 1);
      const c = colorAt(u, v, ramp);
      const thr = (BAYER8[j & 7][i & 7] + 0.5) / 64 - 0.5;
      const out = [0, 0, 0];
      for (let k = 0; k < 3; k++) {
        const q = Math.round(c[k] / step + thr * 0.9) * step;
        out[k] = Math.min(255, Math.max(0, q));
      }
      ctx.fillStyle = `rgb(${out[0] | 0},${out[1] | 0},${out[2] | 0})`;
      ctx.fillRect(i * PIXEL, j * PIXEL, PIXEL, PIXEL);
    }
  }
}
function ellipsize(ctx, text2, maxWidth) {
  if (ctx.measureText(text2).width <= maxWidth) return text2;
  let cut = text2;
  while (cut.length > 0 && ctx.measureText(cut.trimEnd() + "\u2026").width > maxWidth) {
    cut = cut.slice(0, -1);
  }
  return cut.trimEnd() + "\u2026";
}
function drawCard(ctx, { name, email, ramp, verifiedLabel }) {
  const W = CARD_W;
  const H = CARD_H;
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  roundRectPath(ctx, 0, 0, W, H, RADIUS);
  ctx.clip();
  drawDither(ctx, W, H, ramp);
  const scrim = ctx.createLinearGradient(0, H * 0.5, 0, H);
  scrim.addColorStop(0, "rgba(8,9,7,0)");
  scrim.addColorStop(1, "rgba(8,9,7,0.72)");
  ctx.fillStyle = scrim;
  ctx.fillRect(0, H * 0.5, W, H * 0.5);
  const textX = 28;
  let ty = H - 168;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "600 14px system-ui, sans-serif";
  ctx.fillText("Correo", textX, ty);
  ty += 32;
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 26px system-ui, sans-serif";
  const maxWidth = W - textX - 32;
  ctx.fillText(ellipsize(ctx, email || " ", maxWidth), textX, ty);
  ty += 32;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "600 14px system-ui, sans-serif";
  ctx.fillText("Nombre", textX, ty);
  ty += 32;
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 26px system-ui, sans-serif";
  ctx.fillText(ellipsize(ctx, name || " ", maxWidth), textX, ty);
  const footerY = H - 34;
  ctx.beginPath();
  ctx.arc(textX + 11, footerY, 12, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#12140f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(textX + 5, footerY);
  ctx.lineTo(textX + 9, footerY + 4);
  ctx.lineTo(textX + 17, footerY - 5);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "700 14px system-ui, sans-serif";
  ctx.fillText(verifiedLabel, textX + 30, footerY + 5);
  ctx.restore();
}

// src/GeneratorGradientProfile/gradientPalette.js
import { Hct as Hct2, argbFromHex as argbFromHex2 } from "@material/material-color-utilities";
var MIN_SEED_CHROMA2 = 8;
var CHROMA_FLOOR = 40;
var T = [0, 0.26, 0.5, 0.6, 0.68, 0.86, 1];
var GRADIENT_RECIPE = {
  id: "medianoche",
  label: "Medianoche",
  hueOffset: [-6, 6, 22, 30, 56, 84, 118],
  chromaScale: [0.8, 1.1, 1.2, 0.12, 0.9, 1.1, 0.95],
  tone: {
    light: [14, 30, 52, 96, 76, 60, 72],
    dark: [8, 22, 44, 92, 66, 50, 62]
  },
  blob: { cx: 0.88, cy: 0.42, r: 0.38, hueOffset: 96, chromaScale: 1, tone: 62 }
};
var rgbFromArgb = (argb) => [argb >> 16 & 255, argb >> 8 & 255, argb & 255];
var hctRgb = (hue, chroma, tone) => rgbFromArgb(Hct2.from(hue, chroma, tone).toInt());
function buildGradientStops(seedHex, mode, recipe = GRADIENT_RECIPE) {
  const seed = Hct2.fromInt(argbFromHex2(seedHex));
  const hasHue = seed.chroma >= MIN_SEED_CHROMA2;
  const baseChroma = hasHue ? Math.max(seed.chroma, CHROMA_FLOOR) : 0;
  const hueAt = (offset) => hasHue ? (seed.hue + offset + 360) % 360 : 0;
  const tones = recipe.tone[mode] ?? recipe.tone.light;
  const stops = T.map((t, i) => ({
    t,
    color: hctRgb(hueAt(recipe.hueOffset[i]), baseChroma * recipe.chromaScale[i], tones[i])
  }));
  const blob = recipe.blob;
  const accent = {
    cx: blob.cx,
    cy: blob.cy,
    r: blob.r,
    color: hctRgb(hueAt(blob.hueOffset), baseChroma * blob.chromaScale, blob.tone)
  };
  return { stops, accent };
}

// src/GeneratorGradientProfile/GeneratorGradientProfile.jsx
import { jsx as jsx31, jsxs as jsxs20 } from "react/jsx-runtime";
function GeneratorGradientProfile({
  name = "",
  email = "",
  showControls = true,
  verifiedLabel = "Correo verificado",
  className
}) {
  verifyTypesGradientProfile({ name, email, showControls, verifiedLabel });
  const { colorSeedHex, resolvedMode } = useTheme();
  const canvasRef = useRef15(null);
  const [nameValue, setNameValue] = useState13(name);
  const [emailValue, setEmailValue] = useState13(email);
  useEffect8(() => setNameValue(name), [name]);
  useEffect8(() => setEmailValue(email), [email]);
  const ramp = useMemo6(
    () => buildGradientStops(colorSeedHex, resolvedMode),
    [colorSeedHex, resolvedMode]
  );
  const render2 = useCallback6(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CARD_W * dpr;
    canvas.height = CARD_H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawCard(ctx, { name: nameValue, email: emailValue, ramp, verifiedLabel });
  }, [nameValue, emailValue, ramp, verifiedLabel]);
  useEffect8(() => {
    render2();
  }, [render2]);
  return /* @__PURE__ */ jsxs20(
    "div",
    {
      className: ["flex w-full flex-col items-center gap-[var(--gap-page)] md:flex-row md:items-start md:justify-center", className].filter(Boolean).join(" "),
      children: [
        showControls && /* @__PURE__ */ jsxs20("div", { className: "flex w-full max-w-xs flex-col gap-[var(--gap-page)]", children: [
          /* @__PURE__ */ jsxs20("div", { className: "flex flex-col gap-[var(--gap-section)]", children: [
            /* @__PURE__ */ jsx31(Text, { variant: "title-medium", as: "h2", children: "Tarjeta de perfil" }),
            /* @__PURE__ */ jsx31(Text, { variant: "body-small", tone: "muted", children: "El degradado se genera a partir del acento del tema." })
          ] }),
          /* @__PURE__ */ jsxs20("div", { className: "flex flex-col gap-[var(--gap-group)]", children: [
            /* @__PURE__ */ jsx31(Input, { label: "Nombre", value: nameValue, onChange: setNameValue }),
            /* @__PURE__ */ jsx31(Input, { label: "Correo", type: "email", value: emailValue, onChange: setEmailValue })
          ] })
        ] }),
        /* @__PURE__ */ jsx31("div", { className: "w-full max-w-[300px]", children: /* @__PURE__ */ jsx31(
          "canvas",
          {
            ref: canvasRef,
            "aria-label": `Tarjeta de perfil de ${nameValue || "usuario"}`,
            className: "block h-auto w-full rounded-[30px]"
          }
        ) })
      ]
    }
  );
}
export {
  AnchoredAnimation,
  Avatar,
  button_default as Button,
  ButtonGroup,
  CIRCLE_RADIUS,
  CustomModal,
  DURATION,
  DragScroll,
  EASE,
  FabButton,
  GRADIENT_RECIPE,
  GeneratorGradientProfile,
  GoogleIcon,
  Icon,
  Input,
  LOADER_SHAPES,
  Loading,
  LoginModal,
  MORPH,
  MORPH_SCALE,
  ModalAnimation,
  MorphAnimation,
  Navbar,
  OnboardingModal,
  OptionsModal,
  OtpModal,
  PRESS_SCALE,
  RecoverPasswordModal,
  RegisterModal,
  SHAPE_NAMES,
  Search,
  Select,
  shapes_default as Shape,
  TYPESCALE_ROLES,
  Text,
  Textarea,
  ThemeModal,
  ThemeProvider,
  Toast,
  ToastProvider,
  anchoredAnimation,
  appearanceItem,
  buildGradientStops,
  feedbackItem,
  logoutItem,
  morphAnimation,
  morphTo,
  prefersReducedMotion,
  pressHandlers,
  squircleRadius,
  useDragScroll,
  useTheme,
  useToast
};
