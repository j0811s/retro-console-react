# Terminal ROM (wterm) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `TERMINAL` ROM that renders an in-browser bash terminal (via `@wterm/react` + `@wterm/just-bash`) inside the existing console screen, pausing physical dpad/action/power input and resizing the screen while active.

**Architecture:** A new cartridge component (`src/components/game/Terminal.tsx`) wraps `@wterm/react`'s `<Terminal>` and drives a `@wterm/just-bash` `BashShell` entirely client-side (no backend/PTY). It's wired into the existing ROM system (`RomType`/`ROM_MAP`) exactly like `SampleGame`/`BattleGame`. A new `romTypeAtom` (jotai) lets `ConsoleUi` set a `data-mode` attribute the same way it already reads `data-power`/`data-boot`, and SCSS keys off that attribute to resize the screen and drop the retro filter. `InputManager` gets `pause()`/`resume()` (aliases of its existing `unmount()`/`mount()`) so the terminal component can take over the keyboard while mounted.

**Tech Stack:** React 19, TypeScript, Vite, Jotai, Sass, Vitest + Testing Library + happy-dom, `@wterm/react` 0.3.0, `@wterm/dom` 0.3.0, `@wterm/just-bash` 0.3.0, `just-bash` 3.1.0.

## Global Constraints

- `@wterm/react` requires `react: ^18.0.0 || ^19.0.0` — project is on React 19.2.3, compatible.
- Install exact versions: `@wterm/dom@0.3.0`, `@wterm/react@0.3.0`, `@wterm/just-bash@0.3.0`, `just-bash@3.1.0` (verified present on npm and older than the project's `.npmrc` `min-release-age=3` guard).
- No backend/PTY/WebSocket — the shell must run entirely client-side via `@wterm/just-bash`'s `BashShell`.
- Terminal screen size in terminal mode: exactly `width: 600px; height: 400px` on `.screen`; `.frame` `max-width: 900px` in terminal mode (current default is 640px, which does not fit 600px + two 100px side columns + gaps).
- No automated test for `Terminal.tsx` itself (WASM/canvas dependency makes happy-dom testing impractical) — automated tests only for `InputManager.pause()/resume()` and `ConsoleUi`'s `data-mode` wiring.
- Follow existing conventions: `function Name(props) { ... }` + `export default Name`, `type Props = { ... }` declared just above the component, `@/` path alias, minimal Japanese comments only for non-obvious logic, no new abstractions beyond what's needed.

---

### Task 1: InputManager pause/resume

**Files:**
- Modify: `src/lib/input/InputManager.ts`
- Test: `src/lib/input/InputManager.test.ts` (new)

**Interfaces:**
- Produces: `inputManager.pause(): void`, `inputManager.resume(): void` — aliases of the existing `unmount`/`mount`, added to the object `createInputManager()` returns.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/input/InputManager.test.ts`:

```ts
import { inputManager } from "@/lib/input/InputManager";

describe("inputManager pause/resume", () => {
  afterEach(() => {
    inputManager.unmount();
  });

  it("stops emitting keydown-derived actions while paused", () => {
    const listener = vi.fn();
    inputManager.mount();
    const unsubscribe = inputManager.subscribe(listener);

    inputManager.pause();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("emits keydown-derived actions again after resume", () => {
    const listener = vi.fn();
    inputManager.mount();
    inputManager.pause();
    const unsubscribe = inputManager.subscribe(listener);

    inputManager.resume();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));

    expect(listener).toHaveBeenCalledWith("UP");
    unsubscribe();
  });

  it("pause is a no-op when not mounted", () => {
    const listener = vi.fn();
    const unsubscribe = inputManager.subscribe(listener);

    inputManager.pause();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/input/InputManager.test.ts`
Expected: FAIL — `inputManager.pause is not a function` (or similar, since `pause`/`resume` don't exist yet).

- [ ] **Step 3: Implement pause/resume**

In `src/lib/input/InputManager.ts`, change the `return` statement at the end of `createInputManager()` from:

```ts
  return {
    subscribe,
    emit,
    mount,
    unmount,
  }
```

to:

```ts
  return {
    subscribe,
    emit,
    mount,
    unmount,
    pause: unmount,
    resume: mount,
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/input/InputManager.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/input/InputManager.ts src/lib/input/InputManager.test.ts
git commit -m "Add InputManager.pause()/resume() for ROMs that need exclusive keyboard input"
```

---

### Task 2: Add the TERMINAL ROM end-to-end

**Files:**
- Create: `src/components/game/Terminal.tsx`
- Create: `src/layouts/ConsoleUi.test.tsx`
- Modify: `src/types/rom.ts`
- Modify: `src/stores/atoms.ts`
- Modify: `src/constants/rom.tsx`
- Modify: `src/App.tsx`
- Modify: `src/layouts/ConsoleUi.tsx`
- Modify: `src/styles/screen/_screen.scss`
- Modify: `src/styles/frame/_frame.scss`
- Modify: `src/styles/game/_default.scss`
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: `inputManager.pause()`/`resume()` from Task 1.
- Produces: `RomType` includes `"TERMINAL"`; `romTypeAtom: PrimitiveAtom<RomType>` (default `"SAMPLE"`) exported from `src/stores/atoms.ts`; `ConsoleUi` renders `data-mode="terminal" | "default"` on `#game-console`.

- [ ] **Step 1: Install wterm dependencies**

Run:
```bash
npm install @wterm/dom@0.3.0 @wterm/react@0.3.0 @wterm/just-bash@0.3.0 just-bash@3.1.0
```
Expected: `package.json`/`package-lock.json` updated with these four exact-pinned entries (the project's `.npmrc` has `save-exact=true`). If the install fails with a `min-release-age` error, these versions are already older than the 3-day window as of writing this plan — re-check `npm view <pkg> time.modified` before assuming it's a real block.

- [ ] **Step 2: Extend `RomType`**

In `src/types/rom.ts`, change:

```ts
export type RomType = "SAMPLE" | "BATTLE";
```

to:

```ts
export type RomType = "SAMPLE" | "BATTLE" | "TERMINAL";
```

- [ ] **Step 3: Add `romTypeAtom`**

In `src/stores/atoms.ts`, add the import and atom:

```ts
import { atom } from 'jotai';
import type { PowerState, SystemPhase } from '@/types/system';
import type { RomType } from '@/types/rom';

export const systemPhaseAtom = atom<SystemPhase>("OFF");
export const powerStateAtom = atom<PowerState>("OFF");
export const volumeAtom = atom(0.5);
export const romTypeAtom = atom<RomType>("SAMPLE");
```

- [ ] **Step 4: Write the failing `ConsoleUi` test**

Create `src/layouts/ConsoleUi.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import ConsoleUi from "@/layouts/ConsoleUi";
import { romTypeAtom } from "@/stores/atoms";

describe("ConsoleUi", () => {
  it("sets data-mode=default when the active ROM is not TERMINAL", () => {
    render(<ConsoleUi />);

    expect(screen.getByRole("main")).toHaveAttribute("data-mode", "default");
  });

  it("sets data-mode=terminal when the active ROM is TERMINAL", () => {
    const store = createStore();
    store.set(romTypeAtom, "TERMINAL");

    render(
      <Provider store={store}>
        <ConsoleUi />
      </Provider>
    );

    expect(screen.getByRole("main")).toHaveAttribute("data-mode", "terminal");
  });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npx vitest run src/layouts/ConsoleUi.test.tsx`
Expected: FAIL — `data-mode` attribute not found (ConsoleUi doesn't render it yet).

- [ ] **Step 6: Wire `data-mode` into `ConsoleUi`**

Replace the full contents of `src/layouts/ConsoleUi.tsx` with:

```tsx
import { systemPhaseAtom, powerStateAtom, romTypeAtom } from "@/stores/atoms";
import { useAtomValue } from "jotai";

type Props = {
  dpad?: React.ReactNode;
  display?: React.ReactNode;
  action?: React.ReactNode;
  controls?: React.ReactNode;
};

function ConsoleUi({ dpad, display, action, controls }: Props) {
  const systemPhase = useAtomValue(systemPhaseAtom);
  const powerState = useAtomValue(powerStateAtom);
  const romType = useAtomValue(romTypeAtom);
  const mode = romType === "TERMINAL" ? "terminal" : "default";

  return (
    <main id="game-console" className="frame" data-power={powerState} data-boot={systemPhase} data-mode={mode}>
      <div className="left">
        {dpad}
      </div>
      <div className="center">
        {display}
      </div>
      <div className="right">
        {action}
      </div>
      {controls}
    </main>
  );
}

export default ConsoleUi;
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run src/layouts/ConsoleUi.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 8: Create the `Terminal.tsx` cartridge component**

Create `src/components/game/Terminal.tsx`:

```tsx
import { useCallback, useEffect, useRef } from "react";
import { Terminal as WTerminal, useTerminal } from "@wterm/react";
import { BashShell } from "@wterm/just-bash";
import "@wterm/react/css";
import { inputManager } from "@/lib/input/InputManager";

function Terminal() {
  const { ref, write } = useTerminal();
  const shellRef = useRef<BashShell | null>(null);

  useEffect(() => {
    inputManager.pause();
    return () => {
      inputManager.resume();
    };
  }, []);

  const handleReady = useCallback(() => {
    if (shellRef.current) {
      return;
    }
    const shell = new BashShell({
      cwd: "/home/user",
      files: {
        "/home/user/hello.txt": "Hello, GAMEPOY ADVANCE!\n",
      },
      greeting: "Welcome to GAMEPOY ADVANCE Terminal",
    });
    shellRef.current = shell;
    shell.attach(write);
  }, [write]);

  const handleData = useCallback((data: string) => {
    shellRef.current?.handleInput(data);
  }, []);

  return (
    <WTerminal
      ref={ref}
      className="terminal-rom"
      autoResize
      cursorBlink
      onReady={handleReady}
      onData={handleData}
    />
  );
}

export default Terminal;
```

Note the `Terminal as WTerminal` import alias — this file's own exported component is also named `Terminal`, so the imported one must be renamed to avoid a collision.

- [ ] **Step 9: Wire `TERMINAL` into `ROM_MAP`**

Replace the full contents of `src/constants/rom.tsx` with:

```tsx
import SampleGame from "@/components/game/Sample";
import BattleGame from "@/components/game/BattleGame";
import Terminal from "@/components/game/Terminal";
import type { RomMap } from "@/types/rom";

export const ROM_MAP: RomMap = {
  SAMPLE: <SampleGame />,
  BATTLE: <BattleGame />,
  TERMINAL: <Terminal />,
}
```

- [ ] **Step 10: Wire `romTypeAtom` and a select button into `App.tsx`**

In `src/App.tsx`:

1. Change the import line:
```ts
import { useEffect, useRef, useState } from 'react';
```
to:
```ts
import { useEffect, useRef } from 'react';
```

2. Remove the now-unused `RomType` type import line:
```ts
import type { RomType } from "@/types/rom";
```

3. Change the atoms import:
```ts
import { powerStateAtom, systemPhaseAtom } from '@/stores/atoms';
```
to:
```ts
import { powerStateAtom, systemPhaseAtom, romTypeAtom } from '@/stores/atoms';
```

4. Change the `romType` state line:
```ts
const [romType, setRomType] = useState<RomType>("SAMPLE");
```
to:
```ts
const [romType, setRomType] = useAtom(romTypeAtom);
```

5. Add a third button next to the existing two:
```tsx
<div className='button-wrapper'>
  <button type='button' onClick={() => setRomType("SAMPLE")}>SELECT SAMPLE</button>
  <button type='button' onClick={() => setRomType("BATTLE")}>SELECT BATTLE</button>
  <button type='button' onClick={() => setRomType("TERMINAL")}>SELECT TERMINAL</button>
</div>
```

- [ ] **Step 11: Add terminal-mode SCSS**

In `src/styles/screen/_screen.scss`, insert the new block right after the closing `}` of the existing `[data-boot="RUNNING"] { ... }` rule and before the blank line that precedes `.display {`:

```scss
[data-boot="RUNNING"] {
  .boot {
    visibility: hidden;
    opacity: 0;
  }
  #rom-slot {
    visibility: visible;
    opacity: 1;
  }
}

[data-mode="terminal"] {
  .screen {
    width: 600px;
    height: 400px;
    filter: none;
  }
}

.display {
```

In `src/styles/frame/_frame.scss`, the file currently reads:

```scss
// フレーム
.frame {
  position: relative;
  display: grid;
  grid-template-columns: 100px 1fr 100px;
  justify-content: center;
  align-items: center;
  gap: 20px;
  max-width: 640px;
  margin: auto;
  background-color: #6a4c9c;
  padding: 40px 20px;
  border-radius: 25px;
  box-shadow:
    12px 12px 20px rgba(0, 0, 0, 0.5),
    -12px -12px 20px rgba(255, 255, 255, 0.2);

  .left,
  .right {
```

Insert a new rule right after the `box-shadow: ...;` block (line 16) and before the blank line that precedes `.left,` (line 17), so the block becomes:

```scss
  box-shadow:
    12px 12px 20px rgba(0, 0, 0, 0.5),
    -12px -12px 20px rgba(255, 255, 255, 0.2);

  &[data-mode="terminal"] {
    max-width: 900px;
  }

  .left,
  .right {
```

In `src/styles/game/_default.scss`, add (near the existing `#rom-slot .game-default` rule):

```scss
#rom-slot .terminal-rom {
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 12: Typecheck, lint, and run the full test suite**

Run: `npm run build`
Expected: succeeds (type errors would surface here, e.g. leftover unused imports in `App.tsx`).

Run: `npm run lint`
Expected: no errors in the files touched by this task (pre-existing errors in `BattleGame.tsx`/`DpadButton.tsx` from before this plan are out of scope — see Task 3).

Run: `npx vitest run`
Expected: all tests pass, including the new `InputManager.test.ts` and `ConsoleUi.test.tsx`.

- [ ] **Step 13: Manual verification**

Run: `npm run dev`, open the app in a browser:
- Click "SELECT TERMINAL", then power on — confirm the bash prompt appears and typing works.
- Press arrow keys while the terminal is focused — confirm the dpad does NOT light up/play its sound effect (input is paused).
- Confirm the screen is visibly larger (no longer 240x160) and sharp (no sepia/blur).
- Click the power SWITCH — confirm it still powers off while the terminal ROM is active.
- Switch back to "SELECT SAMPLE" — confirm dpad/action keys work normally again (input resumed) and the screen returns to its normal size/filter.

- [ ] **Step 14: Commit**

```bash
git add package.json package-lock.json src/types/rom.ts src/stores/atoms.ts \
  src/constants/rom.tsx src/App.tsx src/layouts/ConsoleUi.tsx src/layouts/ConsoleUi.test.tsx \
  src/components/game/Terminal.tsx src/styles/screen/_screen.scss src/styles/frame/_frame.scss \
  src/styles/game/_default.scss
git commit -m "Add TERMINAL ROM: in-browser bash terminal via wterm/just-bash"
```

---

### Task 3 (optional, out of scope for this feature): Pre-existing lint errors

`npm run lint` currently reports two pre-existing errors unrelated to this feature (found while fixing the ESLint flat-config bug in an earlier session):
- `src/components/game/BattleGame.tsx:109` — `Math.random()` called during render (`react-hooks/purity`)
- `src/features/dpad/components/DpadButton.tsx:31` — component created during render (`react-hooks/static-components`)

These are not part of this plan. Do not fix them as part of Task 1/2 — if the user wants them fixed, that's a separate plan.
