import type { JSX } from 'react';
import type { PowerState } from '@/types/system';
import { inputManager } from '@/lib/input/InputManager';
import ConsoleUi from '@/layouts/ConsoleUi';
import { Dpad } from '@/features/dpad';
import { GameScreen } from '@/features/display';
import { ActionButton, ActionsButtonWrapper } from '@/features/action';
import { SwitchButton, VolumeSlider } from '@/features/controls';

function GameConsole({ power, rom }: { power: PowerState; rom: JSX.Element }) {
  return (
    <ConsoleUi 
      dpad={
        <Dpad
          onPressUp={() => inputManager.emit("UP")}
          onPressRight={() => inputManager.emit("RIGHT")}
          onPressDown={() => inputManager.emit("DOWN")}
          onPressLeft={() => inputManager.emit("LEFT")}
        />
      }
      display={<GameScreen rom={rom} />}
      action={
        <ActionsButtonWrapper>
          <ActionButton label="B" onPress={() => inputManager.emit("B")} />
          <ActionButton label="A" onPress={() => inputManager.emit("A")} />
        </ActionsButtonWrapper>
      }
      controls={
        <>
          <SwitchButton power={power} onPress={() => inputManager.emit("POWER")} />
          <VolumeSlider />
        </>
      }
    />
  )
}

export default GameConsole;
