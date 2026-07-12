# ターミナルROM機能 設計

## 背景・目的

[vercel-labs/wterm](https://github.com/vercel-labs/wterm) を使い、レトロ携帯ゲーム機シミュレーターの画面内にターミナル(bashシェル)を埋め込む。既存のROM選択の仕組み(`SAMPLE`/`BATTLE`)に第三の「カートリッジ」として `TERMINAL` を追加する形で実装する。バックエンドは存在しないため、`@wterm/just-bash`(ブラウザ内完結のbashシェル、PTY/WebSocket不要)を採用する。

## スコープ

- 新しいROM `TERMINAL` を追加し、既存のROM切り替えUIから選択できるようにする。
- ターミナル起動中はキーボード入力をターミナルに集中させ、物理キー(矢印/Enter/Shift/Escape)によるdpad/アクション/電源操作を一時停止する。電源OFFは画面上のSWITCHボタン(クリック)でのみ行う。
- ターミナル起動中は画面のレトロフィルタ(sepia+blur)を外し、画面サイズを中程度(約600x400px相当)に拡大する。
- ターミナル本体・BashShellの機能そのもの(補完・履歴・コマンド実装等)は `@wterm/just-bash` に委譲し、アプリ側では実装しない。

## 非スコープ

- サーバーサイドPTY/WebSocket接続(just-bashで完結するため不要)。
- ターミナル用の特別なエラーUI・リトライ処理(他ROMと同水準で、WASM読み込み失敗時は無表示を許容)。
- `Terminal.tsx` 自体の自動テスト(WASM/canvas依存でhappy-domでの実施が非現実的なため)。

## アーキテクチャ

### 新規ファイル

- `src/components/game/Terminal.tsx`
  - `@wterm/react` の `<Terminal>` コンポーネントと `useTerminal` フックを使用。
  - `onReady` で `@wterm/just-bash` の `BashShell` を生成し `shell.attach(write)`。
  - `onData` で `shellRef.current?.handleInput(data)` に入力を転送。
  - `autoResize` を有効化し、コンテナサイズの変化にターミナルのcols/rowsを追従させる。
  - マウント時に `inputManager.pause()`、アンマウント時に `inputManager.resume()` を呼ぶ `useEffect` を持つ。
  - `BashShell` の初期化オプション: 最小限の仮想ファイルシステムと、コンソールの世界観に合わせた `greeting`(例: `"Welcome to GAMEPOY ADVANCE Terminal"`)。

### 変更ファイル

- `src/types/rom.ts` — `RomType` に `"TERMINAL"` を追加。
- `src/constants/rom.tsx` — `ROM_MAP` に `TERMINAL: <Terminal />` を追加し、`Terminal.tsx` をimport。
- `src/stores/atoms.ts` — `romTypeAtom = atom<RomType>("SAMPLE")` を新設。
- `src/App.tsx`
  - `romType` のローカル `useState` を `useAtom(romTypeAtom)` に置き換え。
  - `SELECT TERMINAL` ボタンを既存の `SELECT SAMPLE`/`SELECT BATTLE` ボタンと並べて追加。
- `src/layouts/ConsoleUi.tsx`
  - `useAtomValue(romTypeAtom)` を追加し、`#game-console` に `data-mode={romType === "TERMINAL" ? "terminal" : "default"}` を付与(既存の `data-power`/`data-boot` と同じ流儀)。
- `src/lib/input/InputManager.ts`
  - `pause()`/`resume()` を追加。内部実装は既存の `mount`/`unmount` と同じ処理(`mounted` フラグとwindowリスナーの付け外し)を指すが、呼び出し側の意図が読めるよう別名として提供する。
- `src/styles/screen/_screen.scss`
  - `[data-mode="terminal"] .screen` で `width: 600px; height: 400px;` に拡大、`filter: none` でsepia/blurを解除。
- `src/styles/frame/_frame.scss`
  - `[data-mode="terminal"] .frame` で `max-width: 900px;` に緩和(現状640pxでは、拡大後の画面幅600px+両サイドのdpad/actionカラム(各100px)+gapが収まらないため)。
- `package.json` / `package-lock.json`
  - `@wterm/dom`, `@wterm/react`, `@wterm/just-bash`, `just-bash` を追加。いずれも実在パッケージ(2026-07時点で v0.3.0 / just-bashはv3.1.0)。`@wterm/react` はReact `^18.0.0 || ^19.0.0` に対応しており、本プロジェクトのReact 19.2.3と互換性あり。

## データフロー

1. ユーザーが `SELECT TERMINAL` ボタンをクリック → `romTypeAtom` が `"TERMINAL"` に更新される。
2. `ConsoleUi` が `romTypeAtom` を購読しており、`data-mode="terminal"` を `#game-console` に反映 → SCSSが画面サイズ・フィルタを切り替える。
3. 電源ON操作(既存のSWITCHボタン/InputManager経由のPOWERアクション)で `SYSTEM_PHASE` が `BOOTING` → `RUNNING` に遷移し、`#rom-slot` が可視化される。
4. `#rom-slot` 内で `Terminal.tsx` がマウントされ、`inputManager.pause()` が呼ばれる。以降、矢印キー等のグローバルkeydownはdpad/アクションを発火せず、`<Terminal>` のフォーカスがキー入力を受け取る。
5. `<Terminal>` の `onReady` で `BashShell` を生成・attachし、bashプロンプトが表示される。ユーザーの入力は `onData` → `BashShell.handleInput` に渡り、出力は `write` を通じてターミナルに描画される。
6. 別ROMへの切替、または電源OFF(SWITCHボタンクリック)により `Terminal.tsx` がアンマウントされると `inputManager.resume()` が呼ばれ、通常のdpad/アクション/電源操作が復帰する。

## エラー処理

- `Terminal.tsx`・`BashShell` 固有のエラーUIやリトライは実装しない。WASM読み込み失敗時は画面が無表示になることを許容する(他ROMと同水準)。
- `BashShell` 内のコマンドエラー(存在しないコマンド等)は `just-bash` 自身がターミナル上に出力するため、アプリ側での処理は不要。

## テスト

- `InputManager.pause()`/`resume()` に対して `gen-test` スキルを使い `src/lib/input/InputManager.test.ts` を追加する(純粋なロジックなので自動テスト可能)。
- `Terminal.tsx` 自体はWASM/canvas依存のため自動テスト対象外。手動確認で以下を検証する:
  - `npm run dev` 起動後、TERMINALボタンでROM切替できる。
  - ターミナル内でコマンド入力ができ、矢印キーがdpadを誤発火しない。
  - 画面サイズが拡大し、sepia/blurフィルタが解除される。
  - 電源OFFがSWITCHボタンのクリックで機能する(キーボードのEscapeでは反応しないことも確認)。

## 影響範囲・リスク

- `InputManager` に `pause`/`resume` を追加するのみで、既存の `mount`/`unmount` の挙動・呼び出し箇所(`App.tsx`)は変更しない。
- `romType` を `useState` から `jotai atom` に変える変更は `App.tsx` 内に閉じており、他コンポーネントの `romType` 直接参照は現状ないため影響は限定的。
- `.frame` の `max-width` 緩和はターミナルモード時のみ(`data-mode="terminal"` スコープ)であり、既存ROMの見た目には影響しない。
