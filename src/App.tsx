import '@/styles/style.scss';
import type { PowerState } from '@/types/system';
import { SYSTEM_PHASE, POWER_STATE } from '@/constants/system';
import { LOW_BATTERY_DELAY } from '@/constants/power';
import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import useSoundEffect from "@/hooks/audio/soundEffect";
import { powerStateAtom, systemPhaseAtom } from '@/stores/atoms';
import { inputManager } from '@/lib/input/InputManager';
import { GameConsole } from '@/features/console';
import SampleGame from '@/components/game/Sample';

function App() {
  const [phase, setPhase] = useAtom(systemPhaseAtom);
  const [power, setPower] = useAtom(powerStateAtom);
  const powerRef = useRef(power);
  const { playSeBoot, playSeAction, playSeDpad } = useSoundEffect();
  
  useEffect(() => {
    inputManager.mount();

    const unsubscribe = inputManager.subscribe((action) => {
      // 電源スイッチは常に有効
      if (action === "POWER") {
        let nextPower: PowerState;
        switch (powerRef.current) {
          case POWER_STATE.OFF:
            nextPower = POWER_STATE.ON;
            break;
          case POWER_STATE.ON:
          case POWER_STATE.LOW:
            nextPower = POWER_STATE.OFF;
            break;
        }
        powerRef.current = nextPower;
        setPower(nextPower);

        if (nextPower === POWER_STATE.ON) {
          setPhase(SYSTEM_PHASE.BOOTING);
          playSeBoot(() => {
            setPhase(SYSTEM_PHASE.RUNNING);
          });
        } else {
          setPhase(SYSTEM_PHASE.OFF);
        }

        return;
      }

      // 電源OFFならゲーム入力は無視
      if (powerRef.current === POWER_STATE.OFF || phase !== SYSTEM_PHASE.RUNNING) {
        return;
      }

      switch (action) {
        case "UP":
        case "DOWN":
        case "LEFT":
        case "RIGHT": {
          playSeDpad();
          break;
        }
        case "A":
        case "B": {
          playSeAction();
          break;
        }
        default: {
          break;
        }
      }

      console.log(action);
    });

    return () => {
      unsubscribe();
      inputManager.unmount();
    };
  }, [phase, setPower, playSeBoot, playSeAction, playSeDpad, setPhase]);

  useEffect(() => {
    if (powerRef.current !== POWER_STATE.ON || phase !== SYSTEM_PHASE.RUNNING) {
      return;
    }

    const timer = setTimeout(() => setPower(POWER_STATE.LOW), LOW_BATTERY_DELAY);
    return () => {
      clearTimeout(timer);
    }
  }, [phase, setPower]);

  return (
    <GameConsole power={power} rom={<SampleGame />} />
  )
}

export default App
