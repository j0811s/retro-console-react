import { useAtom } from "jotai";
import { volumeAtom } from "@/stores/atoms";

function VolumeSlider() {
  const [volume, setVolume] = useAtom(volumeAtom);

  return (
    <input
      className="volumeSlider"
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={volume}
      aria-label="音量"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVolume(parseFloat(e.currentTarget.value))}
    />
  );
}

export default VolumeSlider;
