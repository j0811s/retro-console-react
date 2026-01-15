import SampleGame from "@/components/game/Sample";
import BattleGame from "@/components/game/BattleGame";
import type { RomMap } from "@/types/rom";

export const ROM_MAP: RomMap = {
  SAMPLE: <SampleGame />,
  BATTLE: <BattleGame />,
}
