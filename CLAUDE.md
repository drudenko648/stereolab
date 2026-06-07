1. Product context (condensed spec)
   Primary user: a maths/geometry teacher preparing lesson illustrations.
   Core use cases

Create a 3D solid — choose a type, set dimensions, set appearance, take a screenshot.
Overlay a cross‑section — pick the section tool, place points on edges/vertices/faces, the app builds the section, then the teacher can drag the points and the section updates.
Prepare an image for a presentation — rotate, toggle labels, choose a display style, export PNG (transparent / white / dark background, high resolution) for PowerPoint / Google Slides.

Shapes to support (all 10): cube, rectangular parallelepiped (cuboid), pyramid, prism, tetrahedron, cylinder, cone, sphere, truncated pyramid, truncated cone.
Functional requirements — working with shapes: choose type; set dimensions; toggle faces / edges / vertices; toggle vertex labels; auto‑name vertices (A, B, C, D, A₁, B₁, …); manually rename vertices; change figure colour; change face transparency; change edge colour; change edge thickness; change edge line style; change vertex colour; change point (vertex) size.
Functional requirements — camera: orbit (mouse/trackpad); zoom; pan; reset; quick views (front, top, side, isometric); lock the chosen viewpoint before export.
Functional requirements — export: take a screenshot; download as PNG; transparent / white / dark background; high resolution.
UI language: the source users are Russian‑speaking. Default the UI strings to Russian, but keep all UI text in a single centralised strings module (i18n‑ready) so it can be switched. Keep code, identifiers and comments in English.

2. Tech stack and Task 0 — dependency analysis
   Recommended stack (rationale in brackets). Before installing, verify current compatible versions yourself (npm view <pkg> version, check peerDependencies) and resolve the React 19 ↔ R3F v9 ↔ drei v10 ↔ three compatibility chain. Do not blindly trust the numbers below — confirm them, then record the final pinned versions and the reasoning in a DEPENDENCIES.md at the repo root.
   Runtime

react ^19, react-dom ^19 — UI.
@react-three/fiber ^9 — React renderer for Three.js. v9 is the version that pairs with React 19; v8 is for React 18, so do not use v8.
@react-three/drei ^10 — R3F helpers (OrbitControls, Text/Billboard, Line, Edges, Bounds, GizmoHelper). drei must be v10+ to support R3F v9 / React 19; v9 of drei targets React 18 and will throw peer‑dependency errors.
three (latest stable) + @types/three — the 3D engine. R3F is decoupled from a specific three version, so pick the latest stable three that R3F v9 accepts and pin it.
zustand ^5 — app state (shape config, appearance, camera presets, section state). Plays well with R3F and keeps geometry logic out of components.
tailwindcss (current major, v4) — control‑panel UI styling. Follow the current Tailwind setup (Vite plugin) from its docs since v4 configuration differs from v3.

Build / tooling

vite (latest) + @vitejs/plugin-react (or the SWC variant) + typescript ^5. Use the React + TypeScript Vite template.

Testing

vitest + @testing-library/react + @testing-library/jest-dom + happy-dom (or jsdom) — unit and component tests.
@playwright/test — end‑to‑end and visual tests in real Chromium (needed because WebGL does not run under jsdom/happy‑dom).

Optional

leva — only if you want a quick dev control panel while building; the shipped teacher‑facing UI should be a custom Tailwind panel, not Leva.

Task 0 deliverables

Scaffold the Vite + React + TS project.
Resolve and install all dependencies with a clean install (no --force / --legacy-peer-deps; if you hit a peer conflict, fix the version chain instead).
Configure Tailwind, Vitest (with a test script and a happy-dom/jsdom environment), and Playwright (with a test:e2e script, plus a webServer block so vite preview/dev starts automatically).
Add npm scripts: dev, build, preview, test, test:watch, test:e2e, lint, typecheck.
Confirm npm run build, npm run typecheck, an empty npm test, and an empty npm run test:e2e all succeed, and a hello‑cube renders in the browser.
Write DEPENDENCIES.md listing every chosen package, its pinned version, and one line on why.

Report the final version table back before starting Stage 1.

3. Architecture and project structure
   Two hard architectural rules drive everything:

All geometry and naming logic lives in pure, framework‑agnostic TypeScript modules (no React, no Three.js scene objects as inputs — plain numbers, arrays, and small typed structs). This is what makes the maths unit‑testable, because WebGL cannot run in the unit‑test environment.
React/R3F components are thin: they take the pure data, build Three.js objects, and handle interaction. They are covered by component tests (logic) and Playwright (rendering/interaction), not by unit tests of the maths.

Suggested layout:
src/
geometry/                # PURE TS — no React, no R3F. Fully unit-tested.
types.ts               # Vertex, Edge, Face, Solid, SectionPlane, etc.
shapes/                # one generator per solid -> Solid
cube.ts  cuboid.ts  pyramid.ts  prism.ts  tetrahedron.ts
cylinder.ts  cone.ts  sphere.ts  truncatedPyramid.ts  truncatedCone.ts
index.ts             # registry: type -> generator + param schema
naming.ts              # auto-naming (A, B, C, D, A₁, B₁, apex S/P, centre O)
section/
plane.ts             # plane from >=3 points, signed distance
intersect.ts         # plane ∩ convex solid -> ordered polygon
constraints.ts       # constrain a point to its host edge/face/vertex
math.ts                # vec3 helpers if not using three's Vector3 here
state/
useStore.ts            # zustand: shape, params, appearance, camera, section, export
three/                   # R3F components (thin)
Scene.tsx  SolidMesh.tsx  EdgesView.tsx  VertexPoints.tsx
VertexLabels.tsx       # IN-CANVAS labels (see Section 4)
CameraRig.tsx          # OrbitControls + view presets + lock
SectionLayer.tsx       # interactive points + section polygon
ExportController.tsx   # screenshot/PNG capture
ui/
ControlPanel.tsx  ShapePicker.tsx  AppearanceControls.tsx
CameraControls.tsx  ExportControls.tsx  SectionControls.tsx
strings.ts             # centralised UI strings (default ru)
App.tsx  main.tsx
tests/            # vitest unit/component tests mirror src/
e2e/              # playwright specs
Conventions: TypeScript strict on; no any in geometry; ESLint + Prettier; small pure functions for maths with explicit return types; Three.js objects created only inside three/ components.
Coordinate convention: Three.js Y‑up. Generate each solid centred on its bounding‑box centre at the origin so orbit/zoom framing is predictable; expose a single place to change this if you later want "sitting on the ground".

4. Cross‑cutting technical guidance
   These are the parts that are easy to get subtly wrong — follow them.
   4.1 Labels must be rendered in‑canvas, not as DOM overlay. PNG export uses the WebGL canvas (toDataURL). drei's <Html> labels are DOM overlays and will not appear in the exported image. Use drei <Text> (troika) wrapped in <Billboard> so labels always face the camera and are captured in the screenshot. Verify subscripts (A₁, B₁) render correctly.
   4.2 PNG export. Enable capture on the Canvas: gl={{ preserveDrawingBuffer: true, alpha: true }}. To export: optionally bump render resolution for "high resolution" (temporarily gl.setPixelRatio(targetScale) / gl.setSize(w*scale, h*scale), render one frame, capture, then restore), call gl.domElement.toDataURL('image/png'), and trigger a download. Backgrounds: transparent = alpha:true + no scene.background + clear‑colour alpha 0; white/dark = set scene.background (or the clear colour) to the chosen colour before capture and restore after. Make export deterministic (render → read‑back in the same frame); never capture a stale frame.
   4.3 State. Keep all of: selected shape type, shape params, appearance (colours, transparency, edge style/width/colour, vertex colour/size, label visibility, per‑shape display toggles), camera preset/lock, section state (mode on/off, list of placed points with host‑element refs, computed polygon), and export settings (background, resolution) in the zustand store. UI and 3D both read from the store; geometry recompute is a pure function of {type, params}.
   4.4 Edge line style and thickness. WebGL native lines ignore linewidth on most platforms. For controllable thickness and dashed styles use drei <Line> (fat lines / Line2) which supports lineWidth, dashed, dashSize, gapSize. Don't rely on raw THREE.Line width.
   4.5 Curved solids are a hybrid model. Cylinder, cone, sphere, truncated cone use Three.js parametric geometry for the surface, plus a small set of characteristic points/edges for labelling (e.g. base‑circle centre O, apex S, top/bottom centres O and O₁, axis). Store these as part of the Solid so naming and (later) sections can reference them. Sphere uses SphereGeometry; cylinder CylinderGeometry; cone ConeGeometry (radius‑top 0); truncated cone CylinderGeometry with two different radii.
   4.6 Cross‑section scope (Stage 3). Implement exact sections for the convex polyhedra (cube, cuboid, pyramid, prism, tetrahedron, truncated pyramid). For cone / cylinder / truncated cone, run the same algorithm on their tessellated mesh treated as a high‑segment polyhedron, yielding an approximate many‑sided section (good enough for teaching; document it as approximate). Sphere sections are out of scope for v1 (their section is a circle requiring special handling) — surface this limitation in the UI rather than producing something wrong.
   4.7 Section algorithm (convex solid + cutting plane).

Build the plane from the placed points: need ≥3 non‑collinear points. Normal n = (p2−p1) × (p3−p1) (normalise); plane passes through p1. If only the convex case is needed, the plane is well defined by any 3 of them; if >3 points, fit/define the plane from the first 3 valid points and treat the rest as constraints (or least‑squares fit — start simple with 3).
For each edge of the solid, compute signed distances of its two endpoints to the plane. If signs differ (or one is ≈0), the plane crosses that edge → compute the intersection point by linear interpolation p = a + t*(b−a), t = da/(da−db).
Collect all such intersection points (plus any solid vertices lying on the plane, distance ≈ ε).
The cross‑section of a convex solid is a convex polygon. Order the points: build a 2D basis on the plane, project points, compute the centroid, sort by atan2 angle around it.
Render the ordered polygon as a filled translucent face + an outline (fat <Line>) + labelled section vertices. Each section edge lies on exactly one face of the solid (true for convex solids), so no extra clipping is needed.
Edge cases to handle gracefully: <3 points (show a hint, no section yet), collinear/coincident points (reject with a hint), plane misses the solid (empty section message), numerical near‑coincidence (use an ε tolerance).

4.8 Interactive section points and constraints. Use R3F pointer events + raycasting. Place a point by clicking a host element; store its host reference and a parameter:

on an edge: parameter t ∈ [0,1] along the edge; dragging changes t.
on a vertex: snaps to the vertex (fixed).
on a face: planar coordinates within the face polygon; dragging moves within the face plane.

Make edges/vertices easier to hit (raycast threshold on lines, small invisible hit‑spheres on vertices, mesh for faces). On drag, update only the parameter, recompute the world position via constraints.ts, recompute the plane and polygon. Keep the constraint maths pure and unit‑tested.

5. Development plan — three stages
   For every stage: build the scope, then write/extend the automated tests, then run them, then run the manual checklist in a real browser, then meet the Definition of Done, then commit.

Stage 1 — Foundation and core viewer (MVP loop)
Goal: the full core loop works for the simplest useful shapes: pick a shape → see it → manipulate the camera → export a clean PNG. A teacher could already use this.
Scope / build tasks

Project scaffolding, dependency install, tooling, scripts (this is Task 0 — done first).
Geometry data model (types.ts) and 5 polyhedra generators: cube, cuboid, regular pyramid (square base), triangular prism, tetrahedron. Each returns a Solid (vertices+names, edges, faces). Keep the generator interface uniform so adding shapes later is trivial.
Size/parameter controls for those shapes (numeric inputs / sliders) wired through the store.
Display toggles: faces on/off, edges on/off, vertices on/off.
Auto‑naming (A, B, C, D for base; A₁, B₁, … for top; apex S for the pyramid) and in‑canvas vertex labels (drei <Text>+<Billboard>), with a labels‑on/off toggle.
Camera: orbit + zoom + pan (drei OrbitControls), reset, and quick views front/top/side/isometric, plus a "lock view" toggle that freezes controls before export.
Export: PNG download with background = transparent / white / dark and a resolution selector (e.g. 1×/2×/4× or fixed widths). Implement per Section 4.2.

Automated tests

Unit (Vitest): for each of the 5 shapes assert vertex/edge/face counts and key coordinates (e.g. cube has 8/12/6; tetrahedron 4/6/4). Test naming.ts produces the expected sequence including subscripts. Test any pure export‑helper logic (resolution scaling, filename, background selection).
Component (Vitest + RTL): the control panel renders all Stage‑1 controls; toggling a control dispatches the right store update; the zustand store actions/selectors behave (shape switch resets/derives correctly).
E2E (Playwright): load app; for each shape — select it and assert the canvas updates (visual snapshot); toggle faces/edges/vertices/labels; switch each quick view; trigger export and assert a PNG download of the expected dimensions is produced (intercept the download / data URL).

Manual test checklist

Each of the 5 shapes appears correctly and is centred/framed.
Size controls visibly change the solid in real time.
Faces/edges/vertices/labels toggles each work independently.
Vertex labels are correct (A, B, C, D, A₁ …) and appear in the exported PNG.
Orbit, zoom, pan feel smooth; reset returns to default; all four quick views are correct; lock disables camera movement.
Export produces a PNG; transparent background is actually transparent; white and dark backgrounds are correct; higher resolution yields a larger, crisp image.

Definition of Done: build, typecheck, lint, test, test:e2e all green; manual checklist passes; committed.

Stage 2 — Full shape library and appearance customisation
Goal: all 10 shapes plus complete styling and labelling, fully realising the "image for a presentation" use case.
Scope / build tasks

Remaining shapes: general n‑gon prism, cone, cylinder, sphere, truncated pyramid, truncated cone — introducing the curved‑solid hybrid model (Section 4.5) and their characteristic points/names (apex S; centres O, O₁; etc.). Add per‑shape params (e.g. truncation top/bottom ratio; segment count for curved solids).
Full appearance controls: figure colour; face transparency (opacity slider); edge colour; edge thickness (fat <Line>); edge line style (solid/dashed, Section 4.4); vertex colour; vertex point size.
Manual vertex renaming: edit a vertex's name with validation (non‑empty, reasonable length, uniqueness optional), plus a "reset to auto‑naming" action.
Optional polish: a couple of style presets (e.g. "blueprint" / "classroom" / "dark") that set sensible appearance bundles.

Automated tests

Unit: counts/coordinates for the new polyhedra (general prism for a few n; truncated pyramid); presence and correctness of characteristic points for curved solids; rename logic (apply, validate, reset).
Component: every appearance control updates the store with the expected value; rename UI flow (edit → apply → reset).
E2E: select each new shape and snapshot; change colour / opacity / edge width / dashed / vertex size and assert visible change; rename a vertex and confirm the label updates and is exported.

Manual test checklist

All 10 shapes render correctly, including curved solids and both truncated solids; their parameters behave sensibly.
Figure colour, face transparency, edge colour/thickness/style, vertex colour/size all work and look right.
Dashed edges and thick edges actually render (not ignored by WebGL).
Renaming a vertex works, validates, updates the label, and reset restores auto‑names.
Styled results export cleanly on all three backgrounds.

Definition of Done: as Stage 1; all checks green; manual checklist passes; committed.

Stage 3 — Interactive cross‑sections (flagship feature)
Goal: build, view and adjust plane cross‑sections — the headline capability.
Scope / build tasks

A section tool mode toggle (entering it changes pointer behaviour; exiting clears or keeps the section per a clear UX choice).
Point placement on edges / vertices / faces via raycasting, storing host reference + parameter (Section 4.8).
Plane derivation from ≥3 points and section computation: plane ∩ convex solid → ordered convex polygon (Section 4.7). Render filled translucent section + outlined edges + labelled section vertices, with section appearance controls (colour, opacity, outline).
Draggable section points constrained to their host element, with live recompute of plane + polygon on drag.
Curved solids: run the section on their tessellated mesh for an approximate section; label it as approximate in the UI. Sphere sections excluded with a clear message.
Robust edge‑case handling and user hints (Section 4.7 step 6).
Section export works the same as everything else (it's part of the scene).

Automated tests

Unit (the bulk of the testing here): plane.ts — plane from 3 points, signed distance, collinear rejection. intersect.ts — known cases with exact expected polygons: a unit cube cut by a plane through three edge midpoints (expect a hexagon/triangle as appropriate), a plane parallel to a face (expect a square), a plane missing the solid (expect empty). constraints.ts — point stays on its edge for t∈[0,1], clamps outside, stays within a face. Polygon ordering is correct (convex, no self‑intersection).
Component: section state transitions (enter mode, add point, remove point, drag updates parameter, exit mode); the section appears in the store only once ≥3 valid points exist.
E2E: enter section mode on a cube; place 3 points on three edges; assert a section polygon appears (snapshot); drag one point and assert the section changes (different snapshot); verify the "need 3 points" and "missed the solid" hints appear in the right situations; export with the section visible.

Manual test checklist

Entering section mode changes interaction; edges/vertices/faces are clickable to place points.
With 3 valid points, a correct cross‑section appears on a cube and on a prism/pyramid.
Dragging a point keeps it on its host element and the section recomputes smoothly and correctly.
Collinear points / fewer than 3 points / a plane that misses the solid all produce clear hints, not crashes or garbage.
Curved‑solid sections render (approximate) and are labelled as such; sphere shows the "not supported" message.
Section vertices are labelled, the section styles correctly, and the whole thing exports cleanly.

Definition of Done: as before; section unit tests especially thorough; all checks green; manual checklist passes; committed.

6. Overall testing strategy

Unit tests (Vitest) cover the pure geometry/ modules — shape generation, naming, plane maths, intersection, constraints. This is where correctness is proven, because WebGL does not run in the unit environment, so the maths must be testable without rendering.
Component tests (Vitest + React Testing Library) cover UI controls and the zustand store: that interactions dispatch the right state changes and selectors return the right data. Do not try to assert pixels here.
E2E + visual tests (Playwright) run the real app in Chromium with WebGL: full user flows, that shapes render, that camera/view/toggle interactions work, that PNG export actually produces a correct image, and that sections build and update. Use Playwright's screenshot/visual snapshots for regression; keep a small, stable set of snapshots per stage.
Wire test (unit+component) and test:e2e so they can run in CI. A stage is only "done" when both are green and the manual checklist passes.


7. Working agreement / workflow rules

Do Task 0 (Section 2) first and report the final dependency versions before writing feature code.
Build strictly in stage order; do not start a stage before the previous one's automated tests and manual checklist pass.
Keep all geometry maths in pure TS (src/geometry/) — no React/R3F imports there.
Commit at the end of each stage with a clear message summarising scope + that tests pass.
After each stage, give me: a short summary of what was built, the test results (counts + pass/fail), the manual‑checklist status, and anything you scoped down or deferred (e.g. sphere sections) with the reason.
If a library version conflict or a Section‑4 pitfall forces a design change, flag it explicitly rather than silently working around it.