// Intentionally empty — a no-op stand-in for MathJax's startup script.
//
// The vendored draw.io viewer calls `Editor.initMath()` unconditionally at load
// and appends `<script src="${DRAW_MATH_URL}/startup.js">`, so every page with a
// .drawio diagram would otherwise fire one guaranteed 404. MathJax itself is not
// bundled: it is large, and it only matters for diagrams saved with math="1".
//
// Serving this file instead of 404ing keeps the console clean while leaving
// `window.MathJax` undefined, which is what draw.io's own graceful path expects
// — math-bearing diagrams queue and never typeset, rather than throwing.
//
// Wired up in src/scripts/drawio.ts (DRAW_MATH_URL).
