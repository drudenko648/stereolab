# Stereolab

Russian-language 3D geometry viewer for preparing lesson illustrations and
exporting presentation-ready PNG images.

## Current Scope

Stage 2 is implemented:

- 10 solids: cube, cuboid, pyramid, general regular prism, tetrahedron,
  cylinder, cone, sphere, truncated pyramid, and truncated cone
- per-shape dimensions, polygon side count, curved-surface segment count, and
  truncation ratio
- face, edge, vertex, and label visibility
- face, edge, vertex, and label appearance controls
- solid and dashed fat edges
- validated manual point naming with auto-name reset
- orbit controls, quick views, camera lock, and high-resolution PNG export

Curved solids use pure numeric surface descriptors in `src/geometry/`; Three.js
objects are constructed only in `src/three/`.

## Commands

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm run lint
npm test
npm run test:e2e
```

See `CLAUDE.md` for the complete product specification and staged development
plan, and `DEPENDENCIES.md` for the pinned dependency rationale.
