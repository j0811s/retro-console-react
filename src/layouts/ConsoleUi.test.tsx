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
