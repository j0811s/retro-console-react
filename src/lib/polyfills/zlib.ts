// browserify-zlib (the package vite-plugin-node-polyfills maps "zlib" to)
// is missing two things just-bash's gzip/gunzip/zcat commands need from a
// real Node `zlib` module:
//
// 1. `constants`: browserify-zlib exposes its Z_* constants as flat
//    top-level properties (Node's old, deprecated zlib API shape), not
//    under a `constants` sub-object (`import { constants } from
//    "node:zlib"`, then `constants.Z_DEFAULT_COMPRESSION`) like modern
//    Node does. Re-exporting the module itself as `constants` covers this,
//    since it already carries all the same Z_* keys.
// 2. Input coercion: browserify-zlib's `gzipSync`/`gunzipSync` only accept
//    a real `buffer`-package `Buffer` or a string, throwing "Not a string
//    or buffer" for a plain `Uint8Array` — but just-bash (like real
//    Node zlib) passes plain `Uint8Array`s. Wrap both functions to coerce
//    via `Buffer.from()` first; a `Buffer` is itself a `Uint8Array`
//    subclass, so callers that only index/read `.length` on the result
//    keep working unchanged.
//
// Named re-exports are listed explicitly (no `export *`) so the local
// `gzipSync`/`gunzipSync` overrides below can't collide/be shadowed by
// browserify-zlib's originals of the same name.
import * as browserifyZlib from "browserify-zlib";
import { Buffer } from "buffer";

const zlib = browserifyZlib as unknown as {
  gzipSync: (input: unknown, opts?: unknown) => unknown;
  gunzipSync: (input: unknown, opts?: unknown) => unknown;
};

function toBuffer(input: unknown): unknown {
  if (typeof input === "string" || Buffer.isBuffer(input)) {
    return input;
  }
  if (input instanceof Uint8Array || input instanceof ArrayBuffer) {
    return Buffer.from(input as ArrayBuffer);
  }
  return input;
}

export const constants = browserifyZlib as unknown as Record<string, number>;

export function gzipSync(input: unknown, opts?: unknown) {
  return zlib.gzipSync(toBuffer(input), opts);
}

export function gunzipSync(input: unknown, opts?: unknown) {
  return zlib.gunzipSync(toBuffer(input), opts);
}

export const {
  Deflate,
  Inflate,
  Gzip,
  Gunzip,
  DeflateRaw,
  InflateRaw,
  Unzip,
  createDeflate,
  createInflate,
  createDeflateRaw,
  createInflateRaw,
  createGzip,
  createGunzip,
  createUnzip,
  deflate,
  deflateSync,
  gzip,
  unzip,
  unzipSync,
  inflate,
  inflateSync,
  gunzip,
  deflateRaw,
  deflateRawSync,
  inflateRaw,
  inflateRawSync,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} = browserifyZlib as any;
