type Props = {
  power: boolean;
  onPress: () => void;
}

function SwitchButton({ power, onPress }: Props) {
  return (
    <input
      className="powerSwitch"
      type="checkbox"
      aria-label="電源ボタン"
      checked={power}
      onChange={onPress}
    />
  );
}

export default SwitchButton;
