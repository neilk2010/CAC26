"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { CategoricalFlag, Household } from "@/lib/types";

const STORAGE_KEY = "opendoor-household";

// No state: a first-time visitor is not in any state until they choose one.
const EMPTY_HOUSEHOLD: Household = { flags: {} };

interface HouseholdContextValue {
  household: Household;
  setState: (state: string) => void;
  setHouseholdSize: (size: number) => void;
  setIncomeRange: (min: number, max: number | undefined) => void;
  setAssetsRange: (min: number, max: number | undefined) => void;
  setFlag: (flag: CategoricalFlag, value: boolean | undefined) => void;
  /** Generic setter for the newer single-value fields (employmentStatus, housingTenure, …). */
  patch: (fields: Partial<Omit<Household, "flags">>) => void;
  reset: () => void;
}

const HouseholdContext = createContext<HouseholdContextValue | undefined>(undefined);

// Everything below is a tiny external store backed by localStorage — nothing
// is ever sent to a server. useSyncExternalStore lets the server render a
// consistent empty snapshot while the client swaps in the real one after
// mount, without a hydration mismatch or a setState-in-effect.
let cached: Household = EMPTY_HOUSEHOLD;
let initialized = false;
const listeners = new Set<() => void>();

function readFromStorage(): Household {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : EMPTY_HOUSEHOLD;
  } catch {
    return EMPTY_HOUSEHOLD;
  }
}

function subscribe(callback: () => void) {
  if (!initialized) {
    cached = readFromStorage();
    initialized = true;
  }
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): Household {
  return cached;
}

function getServerSnapshot(): Household {
  return EMPTY_HOUSEHOLD;
}

function updateHousehold(updater: (h: Household) => Household) {
  cached = updater(cached);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  listeners.forEach((l) => l());
}

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const household = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value: HouseholdContextValue = {
    household,
    setState: (state) => updateHousehold((h) => ({ ...h, state })),
    setHouseholdSize: (size) => updateHousehold((h) => ({ ...h, householdSize: size })),
    setIncomeRange: (min, max) =>
      updateHousehold((h) => ({ ...h, monthlyIncomeMin: min, monthlyIncomeMax: max })),
    setAssetsRange: (min, max) =>
      updateHousehold((h) => ({ ...h, liquidAssetsMin: min, liquidAssetsMax: max })),
    setFlag: (flag, val) =>
      updateHousehold((h) => ({ ...h, flags: { ...h.flags, [flag]: val } })),
    patch: (fields) => updateHousehold((h) => ({ ...h, ...fields })),
    reset: () => updateHousehold(() => EMPTY_HOUSEHOLD),
  };

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
}

export function useHousehold(): HouseholdContextValue {
  const ctx = useContext(HouseholdContext);
  if (!ctx) throw new Error("useHousehold must be used within HouseholdProvider");
  return ctx;
}
