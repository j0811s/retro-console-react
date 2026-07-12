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
