import type { ActionButtonLabel } from "@/types/direction";

type Props = {
  label: ActionButtonLabel;
  onPress?: () => void;
}

function ActionButton({ label, onPress }: Props) {
  return (
    <button
      onClick={() => onPress?.()}
      type="button"
    >
      {label.toUpperCase()}
    </button>
  )
}

export default ActionButton;
