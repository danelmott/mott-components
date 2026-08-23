/*Geometry for the Material 3 shape set. No React here and no 'use client': this is the pair of
  src/theme/roles.js and src/animations/motion.js - a plain module the component reads from.

  Every path is written in a 100x100 box because that is what a human can read and edit; shapes.jsx
  normalises it with `transform="scale(0.01)"` inside the <clipPath>, which is the 0..1 space
  clipPathUnits="objectBoundingBox" asks for. Writing 0.7938 by hand instead of 79.38 is how a
  geometry file rots.*/

const TAU = Math.PI * 2;
const BOX = 100;

// How much of the room between two neighbouring bumps a bump is allowed to take. See `scallop`.
const GAP = 0.92;

const round = (n) => Math.round(n * 100) / 100;
const distance = ([ax, ay], [bx, by]) => Math.hypot(bx - ax, by - ay);

// Moves `from` towards `to` by `length` units - where a rounded corner has to leave the edge it
// sits on, and where two tangent circles touch.
const along = ([fx, fy], [tx, ty], length) => {
    const span = distance([fx, fy], [tx, ty]) || 1;
    return [fx + ((tx - fx) / span) * length, fy + ((ty - fy) / span) * length];
};

const polar = (angle, radius, [cx, cy] = [50, 50]) => [
    cx + Math.cos(angle) * radius,
    cy + Math.sin(angle) * radius,
];


/*Shapes are built as a list of segments rather than straight into a `d` string, because they have
  to be measured before they can be written: a rounded corner pulls the outline *inside* the
  polygon that produced it, so a triangle drawn through (50,0) stops well short of the top once its
  apex is rounded. Measuring the real outline and stretching it back to the box is what makes a
  triangle and a cookie at the same `size` read as the same size on screen.

  Arcs carry their centre even though SVG does not need it: this module computed that centre to
  place the arc anyway, and keeping it turns both the measuring and the large-arc flag into
  trigonometry instead of the endpoint-to-centre conversion the SVG spec would otherwise force.*/
const lineTo = (to) => ({ type: 'L', to });
const arcTo = (to, radius, center, sweep) => ({ type: 'A', to, radius, center, sweep });

// How far an arc turns, signed, in the direction its sweep flag says. Both the sampler and the
// large-arc flag need it, and both have to agree or a measured outline stops matching the drawn one.
function turned(segment, from) {
    const { center, sweep } = segment;
    const start = Math.atan2(from[1] - center[1], from[0] - center[0]);
    const end = Math.atan2(segment.to[1] - center[1], segment.to[0] - center[0]);

    let delta = end - start;
    if (sweep === 1 && delta < 0) delta += TAU;
    if (sweep === 0 && delta > 0) delta -= TAU;
    return { start, delta };
}

// Sampling density per arc. Only ever used to measure a bounding box, never to draw, so 12 is
// plenty - the error is under a hundredth of a unit on a 100 unit box.
const STEPS = 12;

function samples(segment, from) {
    if (segment.type === 'L') return [segment.to];

    const { start, delta } = turned(segment, from);
    const points = [];
    for (let i = 1; i <= STEPS; i += 1) {
        points.push(polar(start + (delta * i) / STEPS, segment.radius, segment.center));
    }
    return points;
}

/*Does the outline only ever go forwards around its own centre?

  It is the one question that separates a notch from a keyhole. Two circles can always be made
  tangent on paper, but past a certain crowding the arc that should cut a notch between two bumps
  can only reach the depth it was asked for by looping back on itself - and a loop hanging inside
  the outline reads, once filled, as a hole punched through the shape. Walking the sampled outline
  and refusing any step that turns back catches exactly that, without having to know which of the
  several ways the geometry can degenerate happened this time.*/
function advances(start, segments) {
    let cursor = start;
    let previous = Math.atan2(start[1] - 50, start[0] - 50);

    for (const segment of segments) {
        for (const point of samples(segment, cursor)) {
            const angle = Math.atan2(point[1] - 50, point[0] - 50);
            let step = angle - previous;
            while (step > Math.PI) step -= TAU;
            while (step < -Math.PI) step += TAU;
            if (step < -1e-9) return false;
            previous = angle;
        }
        cursor = segment.to;
    }
    return true;
}

/*Stretches the outline until it touches all four sides of the box. Non-uniform on purpose: two
  shapes at the same `size` have to look the same size, which a uniform fit cannot promise (a
  triangle would sit in a letterboxed strip of its own box). The cost is that an arc becomes
  slightly elliptical - `A rx ry` carries that, and at these radii nobody can see it.*/
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
        segments.map((segment) => (segment.type === 'L' ? lineTo(move(segment.to)) : {
            ...segment,
            to: move(segment.to),
            // the two radii part company here - that is the ellipse the stretch creates
            radius: [segment.radius * scaleX, segment.radius * scaleY],
        })),
    ];
}

function serialize(start, segments) {
    const xy = ([x, y]) => `${round(x)} ${round(y)}`;

    const body = segments.map((segment) => {
        if (segment.type === 'L') return `L ${xy(segment.to)}`;
        const [rx, ry] = segment.radius;
        return `A ${round(Math.abs(rx))} ${round(Math.abs(ry))} 0 ${segment.large} ${segment.sweep} ${xy(segment.to)}`;
    });

    return `M ${xy(start)} ${body.join(' ')} Z`;
}

/*The large-arc flag is settled here, before `fit` runs, because `fit` moves the endpoints without
  moving the centres - after it, the angles no longer say anything true. It matters for exactly one
  shape: a flower petal bulges past a half circle, and without the flag SVG would draw the short way
  round and turn the petal inside out.*/
function build(start, segments) {
    let cursor = start;
    const flagged = segments.map((segment) => {
        if (segment.type === 'L') {
            cursor = segment.to;
            return segment;
        }
        const { delta } = turned(segment, cursor);
        cursor = segment.to;
        return { ...segment, large: Math.abs(delta) > Math.PI ? 1 : 0 };
    });

    return serialize(...fit(start, flagged));
}


/*M3 polygons are corners of a circle joined by straight edges, not a box with a border-radius:
  border-radius rounds the *box*, so it cannot touch the 53 degree apex of a triangle. Each corner
  is walked by hand - leave the incoming edge early, arc across, rejoin the outgoing edge late.

  The distance eaten along the edge is derived from the radius by trigonometry rather than used
  directly, because a sharp corner eats far more edge than a right angle does for the same radius.
  Deriving it is what keeps `radius` meaning one thing across every shape.*/
export function roundedPolygon(vertices, radius) {
    const total = vertices.length;

    const corners = vertices.map((vertex, index) => {
        const previous = vertices[(index - 1 + total) % total];
        const next = vertices[(index + 1) % total];

        const incoming = Math.atan2(vertex[1] - previous[1], vertex[0] - previous[0]);
        const outgoing = Math.atan2(next[1] - vertex[1], next[0] - vertex[0]);
        let turn = outgoing - incoming;
        while (turn <= -Math.PI) turn += TAU;
        while (turn > Math.PI) turn -= TAU;

        const half = (Math.PI - Math.abs(turn)) / 2;   // half the interior angle
        // Clamped to half the shorter adjacent edge: past that, the two corners sharing an edge
        // overlap and the outline folds onto itself instead of rounding.
        const limit = Math.min(distance(previous, vertex), distance(vertex, next)) / 2;
        const cut = Math.min(radius / Math.tan(half), limit);

        const start = along(vertex, previous, cut);
        const end = along(vertex, next, cut);
        const bisector = Math.atan2(
            (start[1] + end[1]) / 2 - vertex[1],
            (start[0] + end[0]) / 2 - vertex[0],
        );

        return {
            start,
            end,
            // the corner circle sits on the bisector, one hypotenuse away from the vertex
            center: polar(bisector, cut / Math.cos(half), vertex),
            radius: cut * Math.tan(half),
            sweep: turn > 0 ? 1 : 0,
        };
    });

    const segments = [];
    corners.forEach((corner, index) => {
        if (index > 0) segments.push(lineTo(corner.start));
        segments.push(arcTo(corner.end, corner.radius, corner.center, corner.sweep));
    });

    return build(corners[0].start, segments);
}


/*Cookie and flower are one shape with different numbers, and that shape is a wave of circles: n
  bumps pushing out, n valleys biting in, tangent where they meet. Tangency is what the eye reads as
  "drawn with a compass" - the outline never changes direction, only how hard it curves, so there is
  no corner anywhere on it.

  It is built this way rather than by rounding the corners of a star polygon because a rounded
  corner can only ever be a *shallow* arc: it has to fit between two straight edges, so it cannot
  swing past a half circle. A flower petal does exactly that - it is fatter across its middle than
  at its base - and a corner-rounded star can only reach for it with a lobe that reads as a cog.
  Here a petal is one arc of one circle, so it bulges as far as it likes.

  Two numbers describe a shape: how deep the valleys sit and how big a bump is. Everything else -
  the valley's own radius, and how much of both has to be given up at a crowded point count - is
  solved below, because those are the parts that cannot be guessed without knowing `points`.

  Starting at -90 degrees puts a bump at the top: a 12 bump cookie whose first bump is off-centre
  looks tilted even though it is perfectly symmetrical.*/
export function scallop(points, { innerRadius, bumpRadius }) {
    const step = TAU / points;
    const start = -Math.PI / 2;
    const k = Math.cos(Math.PI / points);

    /*Two neighbouring bumps that overlap each other cross the outline through itself. The biggest
      bump that still clears its neighbour is the one whose circles just touch:
      2 Rb sin(pi/n) = 2 rb, with Rb = 50 - rb. It only bites at high point counts - a 24 point
      flower asking for the same fat petal as an 8 point one is asking for petals wider than the
      space between them.*/
    const clearance = Math.sin(Math.PI / points);
    // ...and not merely touching, which is what GAP takes off it: two bumps meeting at a single
    // point leave the outline a hairline slot between them instead of a valley, and a slot a
    // fraction of a unit wide is a sliver the fill cannot resolve.
    const widest = Math.min(bumpRadius, GAP * (50 * clearance) / (1 + clearance));

    /*The valley cut between two bumps, as a circle tangent to both. Its radius is not a knob - it is
      the only value that keeps all three circles touching, from

          |Cb - Cv| = rb + rv                                  (tangent)
          |Cb - Cv|^2 = Rb^2 + Rv^2 - 2 Rb Rv cos(pi/n)        (law of cosines, half a step apart)

      with Rb = 50 - rb and Rv = inner + rv. Tangency is what the eye reads as "drawn with a
      compass": the outline never changes direction where the two meet, only how hard it curves.*/
    const filleted = (bump, inner) => {
        const centre = 50 - bump;
        const valley = (bump * bump - centre * centre - inner * inner + 2 * centre * k * inner)
            / (2 * (inner - centre * k - bump));

        /*Too thin a valley is refused here rather than after the outline is walked: it passes the
          walk - it is a cusp, not a loop - but a cusp between two arcs meant to meet at an angle
          leaves a sliver a pixel or two wide, which at a large `size` opens into a visible nick.
          The test is on the size of the circle, not its sign; a negative solution means the wave is
          too shallow to be cut this way at all, and `onCore` below is the shape it wants instead.*/
        if (valley < 0.5) return null;

        const bumpCentre = (i) => polar(start + step * i, centre);
        const valleyCentre = (i) => polar(start + step * (i + 0.5), inner + valley);
        // where a bump circle and the valley circle beside it touch: on the line joining the two
        // centres, `bump` away from the bump's own centre
        const touch = (i, j) => along(bumpCentre(i), valleyCentre(j), bump);

        const segments = [];
        for (let i = 0; i < points; i += 1) {
            // out over the bump, then back in through the valley - the sweep flags are what make one
            // convex and the other concave
            segments.push(arcTo(touch(i, i), bump, bumpCentre(i), 1));
            segments.push(arcTo(touch(i + 1, i), valley, valleyCentre(i), 0));
        }
        return { first: touch(0, -1), segments };
    };

    /*The shallow end of the same family: when the dip between two bumps is so slight that no circle
      can be tucked into it, there is nothing to tuck - the outline between bumps is simply the
      circle they are sitting on. A four bump cookie is this, and so is any wave whose valleys sit
      near the tips; the join stops being tangent and becomes a crossing, which at that shallowness
      is a change of curvature nobody can see.*/
    const onCore = (bump, inner) => {
        const centre = 50 - bump;
        const cosine = (inner * inner + centre * centre - bump * bump) / (2 * inner * centre);
        if (cosine < -1 || cosine > 1) return null;

        // half the angle a bump takes out of the core circle; two of them have to fit in a step
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

    /*Depth is what gives way when the numbers cannot all be had at once, and then width. A deep
      valley needs room between the bumps, and past a certain point count there is none left: the
      valley comes up a unit at a time, and if even a shallow one cannot be cut the bumps narrow and
      it starts over. So a 20 point flower is a shallower, finer flower rather than a broken one, and
      nothing here has to guess a safe depth in advance. Both shapes clear this on the first try at
      their own default.

      Whatever comes out is walked before it is accepted, because tangency on paper is not the same
      as an outline that closes: past a certain crowding the arc that should cut a notch can only
      reach its depth by looping back on itself, and a loop hanging inside the outline reads, once
      filled, as a hole punched through the shape.*/
    for (let bump = widest; bump > 1; bump *= 0.9) {
        for (let inner = innerRadius; inner < 50; inner += 1) {
            for (const attempt of [filleted(bump, inner), onCore(bump, inner)]) {
                if (attempt && advances(attempt.first, attempt.segments)) {
                    return build(attempt.first, attempt.segments);
                }
            }
        }
    }

    // no room for a bump at all: the circle they were riding on
    return 'M 50 0 A 50 50 0 1 1 49.99 0 Z';
}


/*Half a circle on top of a nearly square bottom. Written literally rather than generated: the top
  is one 50-radius arc, and no corner-rounding routine produces that from vertices. It already
  spans the box edge to edge, so there is nothing for `fit` to stretch.*/
const ARCH = 'M 0 50 A 50 50 0 0 1 100 50 L 100 84 A 16 16 0 0 1 84 100 L 16 100 A 16 16 0 0 1 0 84 Z';


/*The map the component renders from. A value is either a finished path or a function of the
  options, which is what lets `points` mean something for the two scalloped shapes and nothing for
  the rest. Adding another shape from the M3 set is adding an entry here - shapes.jsx never has to
  know which shapes exist.*/
export const SHAPE_PATHS = {
    triangle: roundedPolygon([[50, 0], [100, 100], [0, 100]], 17),
    diamond: roundedPolygon([[50, 0], [100, 50], [50, 100], [0, 50]], 26),
    arch: ARCH,
    // deep valleys and a fat bump: each petal swings well past a half circle, so it comes out an
    // oval joined to its neighbours by a narrow notch
    flower: ({ points = 8 } = {}) => scallop(points, { innerRadius: 34, bumpRadius: 12.5 }),
    // shallow valleys and a small bump: the wave barely dips, which is what a scalloped biscuit is
    cookie: ({ points = 12 } = {}) => scallop(points, { innerRadius: 46, bumpRadius: 11 }),
};

export const SHAPE_NAMES = Object.keys(SHAPE_PATHS);

// The shapes `points` applies to. Explicit so the component can drop the prop everywhere else
// instead of pretending it did something.
export const SCALLOPED_SHAPES = ['flower', 'cookie'];

export const shapePath = (name, options) => {
    const shape = SHAPE_PATHS[name];
    return typeof shape === 'function' ? shape(options) : shape;
};
