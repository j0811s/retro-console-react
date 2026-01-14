import type { DpadDirection } from "@/types/direction";

type Props = {
  direction: DpadDirection;
  onPress?: () => void;
}

export default function DpadButton({ direction, onPress }: Props) {
  const ArrowIconLabel = () => {
    switch (direction) {
      case 'up':
        return <span aria-hidden="true">△</span>;
      case 'right':
        return <span aria-hidden="true">▷</span>;
      case 'down':
        return <span aria-hidden="true">▽</span>;
      case 'left':
        return <span aria-hidden="true">◁</span>;
      default:
        break;
    }
  }

  return (
    <button
      type="button"
      aria-label={`${direction}方向ボタン`}
      data-key={`arrow${direction}`}
      onClick={() => onPress?.()}
    >
      <ArrowIconLabel />
    </button>
  )
}
