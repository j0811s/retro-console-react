// src/types/rom.ts
import type { ReactElement } from "react";

export type RomType = "SAMPLE" | "BATTLE";
export type RomMap = Record<RomType, ReactElement>;
