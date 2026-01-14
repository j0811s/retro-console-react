import '@/styles/style.scss';
import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { powerStateAtom } from '@/stores/atoms';
import { inputManager } from '@/lib/input/InputManager';
import { GameConsole } from '@/features/console';
import SampleGame from '@/components/game/Sample';

function App() {
  const [power, setPower] = useAtom(powerStateAtom);
  const powerRef = useRef(power);

  useEffect(() => {
    powerRef.current = power;
  }, [power]);
  
  useEffect(() => {
    inputManager.mount();

    const unsubscribe = inputManager.subscribe((action) => {
      // システム入力は常に有効
      if (action === "POWER") {
        setPower((prev) => !prev);
        return;
      }

      // 電源OFFならゲーム入力は無視
      if (!powerRef.current) {
        return;
      }

      console.log("INPUT: ", action);
    });

    return () => {
      unsubscribe();
      inputManager.unmount();
    };
  }, [setPower]);

  return (
    <GameConsole power={power} rom={<SampleGame />} />
  )
}

export default App
