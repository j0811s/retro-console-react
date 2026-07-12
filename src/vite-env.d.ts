/// <reference types="vite/client" />

// @wterm/react's "./css" subpath export has no "types" condition in its
// package.json exports map, so TS can't resolve it via *.css wildcards
// (the specifier has no ".css" suffix). Ambient-declare it so the exact
// `import "@wterm/react/css"` from the plan typechecks.
declare module "@wterm/react/css";

// browserify-zlib ships no type declarations and no @types package exists.
// Used only by src/lib/polyfills/zlib.ts as the browser zlib polyfill target.
declare module "browserify-zlib";
