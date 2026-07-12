---
name: new-feature
description: Scaffold a new src/features/<name> folder in this retro-console-react project, following the existing feature-folder convention (components/ subfolder + index.ts barrel export). Use when adding a new UI feature area to the console (e.g. a new panel, control, or display element).
---

Scaffold a new feature: $ARGUMENTS

This project (retro-console-react) organizes UI into `src/features/<feature>/`, each with a
`components/` folder and an `index.ts` barrel export (see `src/features/dpad`, `src/features/controls`,
`src/features/action`, `src/features/display`, `src/features/console` for reference).

## Steps

1. Determine the feature name (kebab-case folder, e.g. `menu`) and its main component name (PascalCase, e.g. `MenuPanel`).
2. Create `src/features/<name>/components/<ComponentName>.tsx` following the codebase's component style:
   - `type Props = { ... }` declared just above the component.
   - `function ComponentName(props: Props) { ... }` — not an arrow-function const.
   - `export default ComponentName`.
   - Import shared code via the `@/` alias.
3. Create `src/features/<name>/index.ts` that re-exports the public component(s), e.g.:
   ```ts
   export { default as ComponentName } from "./components/ComponentName";
   ```
4. If the feature needs styling, add a partial under the matching `src/styles/<core|frame|game|button|screen>/_name.scss` and `@use`/`@forward` it from `src/styles/style.scss` (check how existing partials are wired in before adding).
5. If the feature needs input handling, use the existing singleton: `inputManager.emit(...)` to dispatch and `inputManager.subscribe(...)` to listen (`src/lib/input/InputManager.ts`) — don't build a parallel event system.
6. Wire the new feature into `src/layouts/ConsoleUi.tsx` and/or `src/features/console/components/GameConsole.tsx` only if the user asked for it to be integrated into the console layout, not by default.
7. Do not add a test file automatically — use the `gen-test` skill separately if tests are wanted.

Keep the component minimal: no extra abstraction, no props beyond what's actually used, matching the terse style of existing feature components.
