export type InputAction =
  | "UP"
  | "DOWN"
  | "LEFT"
  | "RIGHT"
  | "A"
  | "B"

export type SystemAction = "POWER" | "VOLUME_UP" | "VOLUME_DOWN";

type Listener = (action: InputAction | SystemAction) => void;

function createInputManager() {
  let mounted = false;
  const listeners = new Set<Listener>();

  const emit = (action: InputAction | SystemAction) => {
    listeners.forEach((l) => l(action));
  }

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp": {
        emit("UP");
        break;
      }
      case "ArrowRight": {
        emit("RIGHT");
        break;
      }
      case "ArrowDown": {
        emit("DOWN");
        break;
      }
      case "ArrowLeft": {
        emit("LEFT");
        break;
      }
      case "Enter": {
        emit("A");
        break;
      }
      case "Shift": {
        emit("B");
        break;
      }
      case "Escape": {
        emit("POWER");
        break;
      }
      default: {
        break;
      }
    }
  }

  const mount = () => {
    if (mounted) {
      return;
    }
    mounted = true;
    window.addEventListener("keydown", handleKeyDown);
  }

  const unmount = () => {
    if (!mounted) {
      return;
    }
    mounted = false;
    window.removeEventListener("keydown", handleKeyDown);
  }

  return {
    subscribe,
    emit,
    mount,
    unmount,
  }
}

export const inputManager = createInputManager();
