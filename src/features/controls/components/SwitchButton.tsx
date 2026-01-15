import type { PowerState } from "@/types/system";
import { SYSTEM_PHASE } from "@/constants/system";

type Props = {
  power: PowerState;
  onPress: () => void;
}

function SwitchButton({ power, onPress }: Props) {
  return (
    <input
      className="powerSwitch"
      type="checkbox"
      aria-label="電源ボタン"
      checked={power !== SYSTEM_PHASE.OFF}
      onChange={onPress}
    />
  );
}

export default SwitchButton;
