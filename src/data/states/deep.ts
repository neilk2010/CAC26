import { NJ_META } from "@/data/states/NJ/meta";
import { NJ_PROGRAMS } from "@/data/states/NJ/programs";
import { CA_META } from "@/data/states/CA/meta";
import { CA_PROGRAMS } from "@/data/states/CA/programs";
import { TX_META } from "@/data/states/TX/meta";
import { TX_PROGRAMS } from "@/data/states/TX/programs";
import { FL_META } from "@/data/states/FL/meta";
import { FL_PROGRAMS } from "@/data/states/FL/programs";
import { NY_META } from "@/data/states/NY/meta";
import { NY_PROGRAMS } from "@/data/states/NY/programs";
import { PA_META } from "@/data/states/PA/meta";
import { PA_PROGRAMS } from "@/data/states/PA/programs";
import { IL_META } from "@/data/states/IL/meta";
import { IL_PROGRAMS } from "@/data/states/IL/programs";
import { OH_META } from "@/data/states/OH/meta";
import { OH_PROGRAMS } from "@/data/states/OH/programs";
import { GA_META } from "@/data/states/GA/meta";
import { GA_PROGRAMS } from "@/data/states/GA/programs";
import { NC_META } from "@/data/states/NC/meta";
import { NC_PROGRAMS } from "@/data/states/NC/programs";
import { MI_META } from "@/data/states/MI/meta";
import { MI_PROGRAMS } from "@/data/states/MI/programs";
import type { Program, StateMeta } from "@/lib/types";

// The hand-verified state packs — the ONE place a state is promoted to full
// coverage. Adding a state is: two files under states/<CODE>/ and one line
// here. Everything downstream (the registry, the intake FULL COVERAGE badge,
// the homepage counter, the uniqueness index) derives from this list.
//
// The bar for landing here: at least 8 verified state-administered programs,
// always including the four categories every state genuinely runs (food,
// health, energy, cash — SNAP, Medicaid/CHIP, LIHEAP, TANF). Enforced by
// tests/unit/coverage-bar.test.ts. A state that can't clear it stays
// federal-tier — an honest map beats a full one.

export interface DeepPack {
  meta: StateMeta;
  programs: Program[];
}

export const DEEP_PACKS: DeepPack[] = [
  { meta: NJ_META, programs: NJ_PROGRAMS },
  { meta: CA_META, programs: CA_PROGRAMS },
  { meta: TX_META, programs: TX_PROGRAMS },
  { meta: FL_META, programs: FL_PROGRAMS },
  { meta: NY_META, programs: NY_PROGRAMS },
  { meta: PA_META, programs: PA_PROGRAMS },
  { meta: IL_META, programs: IL_PROGRAMS },
  { meta: OH_META, programs: OH_PROGRAMS },
  { meta: GA_META, programs: GA_PROGRAMS },
  { meta: NC_META, programs: NC_PROGRAMS },
  { meta: MI_META, programs: MI_PROGRAMS },
];
