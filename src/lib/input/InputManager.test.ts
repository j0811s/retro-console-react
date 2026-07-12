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
