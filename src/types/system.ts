import type { SYSTEM_PHASE, POWER_STATE } from "@/constants/system";

export type SystemPhase = typeof SYSTEM_PHASE[keyof typeof SYSTEM_PHASE];
export type PowerState = typeof POWER_STATE[keyof typeof POWER_STATE];
