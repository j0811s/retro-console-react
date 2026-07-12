---
name: gen-test
description: Generate a Vitest + Testing Library test file for a component, hook, or lib module in this project (retro-console-react). Use when the user asks to add or write tests for a specific file — the testing stack is fully configured but no test files exist yet, so there's no in-repo example to copy from.
---

Generate a test for: $ARGUMENTS

## Stack (already configured, don't reconfigure it)

- Runner: Vitest, `environment: 'happy-dom'`, `globals: true` (see `vite.config.ts`) — `describe`/`it`/`expect`/`vi` are
  global, no need to import them from `vitest`.
- `@testing-library/react` for rendering, `@testing-library/user-event` for interactions.
- `jest-dom` matchers are loaded globally via `vitest.setup.ts` — no per-file import needed.
- Coverage `include` is currently limited to `src/components/**`, `src/hooks/**`, `src/utils/**`
  (see `vite.config.ts`). Tests for `src/features/**` or `src/layouts/**` still run, but won't count
  toward the coverage report — mention this to the user if it seems relevant, don't silently "fix" the
  config unless asked.

## Placement

Colocate the test next to its source file: `Foo.tsx` → `Foo.test.tsx` in the same folder.

## Steps

1. Read the target source file to identify its actual props/behavior — don't invent behavior it doesn't have.
2. Pick the right pattern:
   - Presentational component with callback props → render + fire event + assert callback called
     (see [examples/component.test.tsx.example](examples/component.test.tsx.example)).
   - Hook or plain module (e.g. `src/lib/input/InputManager.ts`, `src/hooks/audio/*`) →
     test via `renderHook` from `@testing-library/react`, or call exported functions directly for
     non-hook modules (see [examples/hook.test.ts.example](examples/hook.test.ts.example)).
3. Use `@/` path alias for imports, matching the rest of the codebase.
4. Keep assertions behavioral (what the user sees/triggers), not implementation-detail snapshots.
5. Run `npm test -- <path>` after writing to confirm it passes.
