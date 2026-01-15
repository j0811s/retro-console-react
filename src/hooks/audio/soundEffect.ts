import { useAtomValue } from "jotai";
import { volumeAtom, powerStateAtom } from "@/stores/atoms";
import { useRef, useEffect } from "react";
import { POWER_STATE } from "@/constants/system";

function useSoundEffect() {
  const volume = useAtomValue(volumeAtom);
  const power = useAtomValue(powerStateAtom);
  const seBootRef = useRef<HTMLAudioElement | null>(null);
  const seActionRef = useRef<HTMLAudioElement | null>(null);
  const seDpadRef = useRef<HTMLAudioElement | null>(null);

  const playGame = (seRef: React.RefObject<HTMLAudioElement | null>, onEnded?: () => void) => {
    if (power !== POWER_STATE.ON && power !== POWER_STATE.LOW) {
      return;
    }
    const se = seRef.current!;
    se.volume = volume;
    se.currentTime = 0;
    if (onEnded) {
      se.onended = onEnded;
    }
    se.play();
  }

  const playSystem = (seRef: React.RefObject<HTMLAudioElement | null>, onEnded?: () => void) => {
    const se = seRef.current!;
    se.volume = volume;
    se.currentTime = 0;
    if (onEnded) {
      se.onended = onEnded;
    }
    se.play();
  }

  const stopAll = () => {
    [seBootRef, seActionRef, seDpadRef].forEach((ref) => {
      const se = ref.current!;
      se.pause();
      se.currentTime = 0;
    });
  }

  useEffect(() => {
    if (!seBootRef.current) {
      seBootRef.current = new Audio("/audio/se/boot.mp3");
    }
    if (!seActionRef.current) {
      seActionRef.current = new Audio("/audio/se/action.mp3");
    }
    if (!seDpadRef.current) {
      seDpadRef.current = new Audio("/audio/se/dpad.mp3");
    }
  }, []);

  useEffect(() => {
    if (power === POWER_STATE.OFF) {
      stopAll();
    }
  }, [power]);

  return {
    playSeBoot: (onEnded?: () => void) => playSystem(seBootRef, onEnded),
    playSeAction: (onEnded?: () => void) => playGame(seActionRef, onEnded),
    playSeDpad: (onEnded?: () => void) => playGame(seDpadRef, onEnded),
    stopAll
  }
}

export default useSoundEffect;
