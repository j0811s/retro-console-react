import { powerStateAtom } from "@/stores/atoms";
import { useAtomValue } from "jotai";

type Props = {
  dpad?: React.ReactNode;
  display?: React.ReactNode;
  action?: React.ReactNode;
  controls?: React.ReactNode;
};

function ConsoleUi({ dpad, display, action, controls }: Props) {
  const powerState = useAtomValue(powerStateAtom);

  return (
    <main id="game-console" className="frame" data-power={powerState ? "on" : "off"}>
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
