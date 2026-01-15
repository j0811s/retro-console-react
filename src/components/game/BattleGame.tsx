import { useEffect, useRef } from "react";
import { inputManager } from "@/lib/input/InputManager";

/* =======================
 * Types
 * ======================= */
type Character = {
  name: string;
  hp: number;
  atk: number;
  def: number;
  flash: boolean;
};

type Phase = "PLAYER" | "BUSY" | "END";

/* =======================
 * Assets
 * ======================= */
const PLAYER_IMAGE_SRC =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEitvyUJ0zCsQMaFRMcxLzjnnOE1Uve2tL2RNaPyBlOtrHy-QakBXumfwijcLxNrxVFNqoF4xH9LvhNhE6dq3tyIG_08tjKl81yAnuaw5Z85rWi0ZG6Pi8x3eARmEouENyc1tl-X5zbGWXM/s800/oldman_77.png";

const ENEMY_IMAGE_SRC =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgrm2jo51T07UB6z83ceuz7AwQuTv3C_j-JfOmq7rRJptgH2xsSboxBLtVfhDwFO3R53Cl5nQiuE8aAkz0In702dv-Bp75S7cipUjtRwToNAEmGMZe1wNZPDachQ4p2eOWTAbq23kGvDno/s800/monster04.png";

/* =======================
 * Component
 * ======================= */
export default function MiichanRom() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /* =======================
   * Utils
   * ======================= */
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const waitForPressA = () =>
    new Promise<void>((resolve) => {
      const unsub = inputManager.subscribe((action) => {
        if (action === "A") {
          unsub();
          resolve();
        }
      });
    });

  /* =======================
   * Mutable Game State
   * ======================= */
  const stateRef = useRef<{
    phase: Phase;
    text: string;
    selectedIndex: number;
    isExecuting: boolean;
    player: Character;
    enemy: Character;
  }>({
    phase: "PLAYER",
    text: "あいて が あらわれた！",
    selectedIndex: 0,
    isExecuting: false,
    player: { name: "あなた", hp: 30, atk: 10, def: 10, flash: false },
    enemy: { name: "あいて", hp: 30, atk: 10, def: 10, flash: false },
  });

  const commandsRef = useRef(["たたかう", "つかまえる", "アイテム", "にげる"]);

  /* =======================
   * Images
   * ======================= */
  const playerImageRef = useRef<HTMLImageElement | null>(null);
  const enemyImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const p = new Image();
    p.src = PLAYER_IMAGE_SRC;
    playerImageRef.current = p;

    const e = new Image();
    e.src = ENEMY_IMAGE_SRC;
    enemyImageRef.current = e;
  }, []);

  /* =======================
   * Battle Logic (Ref-safe)
   * ======================= */
  const damageEffect = async (target: Character) => {
    for (let i = 0; i < 3; i++) {
      target.flash = true;
      await wait(100);
      target.flash = false;
      await wait(100);
    }
  };

  const attack = async (
    attacker: Character,
    target: Character,
    isPlayer: boolean
  ) => {
    const state = stateRef.current;

    state.text = `${target.name} を こうげき！`;
    await wait(1000);
    await waitForPressA();

    const damage =
      Math.max(attacker.atk - target.def, 1) +
      Math.floor(Math.random() * 6);

    target.hp -= damage;
    await damageEffect(target);

    state.text = `${target.name} に ${damage} の ダメージ！`;
    await wait(1000);
    await waitForPressA();

    if (target.hp <= 0) {
      state.text = `${target.name} は たおれた！`;
      await wait(1500);
      await waitForPressA();
      state.text = "E N D";
      state.phase = "END";
      return;
    }

    if (isPlayer) {
      await enemyTurn();
    } else {
      state.phase = "PLAYER";
      state.text = `${state.player.name} の ターン！`;
      await wait(1000);
    }
  };

  const enemyTurn = async () => {
    const state = stateRef.current;
    state.phase = "BUSY";
    state.text = `${state.enemy.name} の ターン！`;
    await wait(1000);
    await waitForPressA();
    await attack(state.enemy, state.player, false);
  };

  const executeCommandRef = useRef<() => void>(() => {});

  const executeCommand = async () => {
    const state = stateRef.current;
    state.isExecuting = true;
    state.phase = "BUSY";

    if (state.selectedIndex === 0) {
      await attack(state.player, state.enemy, true);
    } else {
      state.text = "なにも おこらなかった！";
      await wait(1000);
      await waitForPressA();
      state.phase = "PLAYER";
    }

    state.isExecuting = false;
  };

  useEffect(() => {
    executeCommandRef.current = executeCommand;
  });

  /* =======================
   * InputManager
   * ======================= */
  useEffect(() => {
    inputManager.mount();

    const unsub = inputManager.subscribe((action) => {
      const s = stateRef.current;
      if (s.phase !== "PLAYER" || s.isExecuting) return;

      switch (action) {
        case "UP":
          if (s.selectedIndex >= 2) s.selectedIndex -= 2;
          break;
        case "DOWN":
          if (s.selectedIndex < 2) s.selectedIndex += 2;
          break;
        case "LEFT":
          if (s.selectedIndex % 2 === 1) s.selectedIndex--;
          break;
        case "RIGHT":
          if (s.selectedIndex % 2 === 0) s.selectedIndex++;
          break;
        case "A":
          executeCommandRef.current();
          break;
      }
    });

    return () => {
      unsub();
      inputManager.unmount();
    };
  }, []);

  /* =======================
   * Render Loop
   * ======================= */
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 240;
    canvas.height = 160;
    ctx.font = "12px monospace";

    const draw = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, 240, 160);

      // Enemy
      ctx.fillStyle = "#000";
      ctx.fillText(`HP:${s.enemy.hp}`, 165, 20);
      if (s.enemy.flash) {
        ctx.globalAlpha = 0.3;
      }
      if (enemyImageRef.current) {
        ctx.drawImage(enemyImageRef.current, 160, 25, 48, 48);
      }
      ctx.globalAlpha = 1;

      // Player（テキストボックス直上）
      ctx.fillText(`HP:${s.player.hp}`, 30, 50);
      if (s.player.flash) {
        ctx.globalAlpha = 0.3;
      }
      if (playerImageRef.current) {
        ctx.drawImage(playerImageRef.current, 20, 55, 48, 48);
      }
      ctx.globalAlpha = 1;

      // Text box
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 100, 240, 60);
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 101, 238, 58);

      ctx.fillStyle = "#333";
      ctx.fillText(s.text, 8, 120);

      // Commands
      if (s.phase === "PLAYER") {
        commandsRef.current.forEach((label, i) => {
          const x = i % 2 === 0 ? 10 : 120;
          const y = i < 2 ? 140 : 155;
          if (i === s.selectedIndex) ctx.fillText("▶", x - 10, y);
          ctx.fillText(label, x, y);
        });
      }

      requestAnimationFrame(draw);
    };

    draw();
  }, []);

  return (
    <div className="game-default">
      <canvas ref={canvasRef} />
    </div>
  );
}
