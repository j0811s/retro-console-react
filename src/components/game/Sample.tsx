import { useEffect, useRef } from "react";

function SampleGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    // 初期描画
    const draw = (text = "PRESS") => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0f0";
      ctx.font = "32px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    };

    draw();

    const handleKeyDown = (e: KeyboardEvent) => {
      draw(`KEY: ${e.key}`);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="game-default">
      <canvas
        ref={canvasRef}
        width={240}
        height={160}
      />
    </div>
  );
}

export default SampleGame;
