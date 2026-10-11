import { describe, expect, it } from "vitest";
import { retrievePrograms } from "@/lib/chat/retrieve";
import { GLOSSARY, SITE_MAP } from "@/lib/chat/knowledge";
import { getState } from "@/data/states";

const NJ = getState("NJ")!.programs;

describe("chat retrieval", () => {
  it("finds a program by its everyday name, not just its official one", () => {
    const hits = retrievePrograms("how do I get food stamps", NJ);
    expect(hits.some((h) => /snap/i.test(h.shortName))).toBe(true);
  });

  it("routes a plain-language need to the right category", () => {
    const energy = retrievePrograms("I can't pay my heating bill", NJ);
    expect(energy.length).toBeGreaterThan(0);
    expect(energy.every((h) => h.category === "energy" || /energy|heat|utility/i.test(h.summary)))
      .toBe(true);
  });

  it("returns nothing when the question matches nothing, so the guide says it doesn't know", () => {
    expect(retrievePrograms("what is the weather tomorrow", NJ)).toEqual([]);
    expect(retrievePrograms("???", NJ)).toEqual([]);
  });

  // The guarantee the whole design rests on: the model is handed descriptions,
  // never rules, so it cannot reinterpret an income limit and decide
  // eligibility itself.
  it("never hands the model a program's rules", () => {
    for (const q of ["snap", "medicaid", "rent help", "tax credit"]) {
      for (const hit of retrievePrograms(q, NJ)) {
        expect(hit).not.toHaveProperty("rules");
        expect(JSON.stringify(hit)).not.toMatch(/maxIncomePctFPL|assetLimitDollar/);
      }
    }
  });

  it("caps how many records ride along", () => {
    expect(retrievePrograms("help", NJ, 3).length).toBeLessThanOrEqual(3);
  });

  it("every site-map path and glossary entry is non-empty", () => {
    for (const p of SITE_MAP) {
      expect(p.path.startsWith("/")).toBe(true);
      expect(p.purpose.length).toBeGreaterThan(20);
    }
    for (const g of GLOSSARY) expect(g.meaning.length).toBeGreaterThan(10);
  });
});
