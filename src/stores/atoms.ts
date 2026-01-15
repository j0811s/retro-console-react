import { atom } from 'jotai';
import type { PowerState, SystemPhase } from '@/types/system';

export const systemPhaseAtom = atom<SystemPhase>("OFF");
export const powerStateAtom = atom<PowerState>("OFF");
export const volumeAtom = atom(0.5);
