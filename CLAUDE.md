# retro-console-react

レトロな携帯ゲーム機のUIを再現したReactシミュレーター。バックエンド・API・DBは存在せず、フロントエンドのみ。

## スタック

- React 19 + TypeScript, Vite 7 (SWC)
- 状態管理: Jotai (`src/stores/atoms.ts`)
- スタイル: Sass + PostCSS (autoprefixer, css-declaration-sorter, sort-media-queries)
- テスト: Vitest + Testing Library + happy-dom

## コマンド

- `npm run dev` — 開発サーバー
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint
- `npm test` — Vitest
- `npm run coverage` — カバレッジ (対象: `src/components`, `src/hooks`, `src/utils`)

## アーキテクチャ

- `src/features/<feature>/components/*.tsx` + `index.ts` — 機能単位のフォルダ。`index.ts` は公開コンポーネントのbarrel export。新機能を追加する際はこのパターンに従う（`.claude/skills/new-feature` 参照）。
- `src/layouts/` — featureを組み合わせるレイアウト層（例: `ConsoleUi.tsx`）。
- `src/stores/atoms.ts` — jotai atom定義。フラットに保つ。
- `src/lib/input/InputManager.ts` — キーボード入力のpub/subシングルトン。UI側は `inputManager.emit("UP" | "A" | ...)` で発火し、`inputManager.subscribe(listener)` で購読する。`InputAction` / `SystemAction` 型がアクションの語彙。
- `src/hooks/audio/` — `HTMLAudioElement` をラップした効果音フック。
- `src/constants/` — `SYSTEM_PHASE`, `POWER_STATE`, `ROM_MAP` などの定数・マップ。
- `src/types/` — 共有TS型。
- `src/styles/` — `core` / `frame` / `game` / `button` / `screen` にscssを分割し、`style.scss` から一括import。

## コーディング規約

- コンポーネントは `function Name(props) { ... }` を定義して `export default Name`（アロー関数constや名前付きexportではない）。
- Propsは `type Props = { ... }` をコンポーネント直前に定義。
- featureのpublic APIは `index.ts` から re-export する。
- importは `@/` エイリアス（`src/`）を使う。
- コメントは日本語・最小限。自明でないロジック（例: 電源OFF時は入力を無視する、など）にのみ付与し、説明的すぎるコメントは書かない。

## テスト

Vitest環境は設定済み（`vitest.setup.ts`, `happy-dom`, globals: true）だが、現時点でテストファイルは存在しない。新規追加時は対象ファイルと同階層に `Xxx.test.tsx` を配置する（`.claude/skills/gen-test` 参照）。カバレッジの `include` は `src/components` / `src/hooks` / `src/utils` のみで、`src/features` や `src/layouts` は対象外になっている点に注意（意図的な設定か未整備かは要確認）。
