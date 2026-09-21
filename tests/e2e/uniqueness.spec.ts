import { test, expect, type Page } from "@playwright/test";

// "Unique to {State}" — the derived exclusivity surface (badge + panel).
// The whole point is that it's computed from the program library, so these
// tests assert BEHAVIOUR (a state with an exclusive program shows it; a
// federal-tier state shows nothing) rather than pinning specific copy that
// should move on its own as states are added.

test.use({ contextOptions: { reducedMotion: "reduce" } });

function household(state: string, monthlyIncome: [number, number] = [1500, 2000]) {
  return {
    state,
    householdSize: 3,
    monthlyIncomeMin: monthlyIncome[0],
    monthlyIncomeMax: monthlyIncome[1],
    kidsUnder17Count: 2,
    flags: { schoolAgeChild: true, paysHomeEnergy: true, filesTaxes: true },
  };
}

async function seed(page: Page, state: string, monthlyIncome?: [number, number]) {
  await page.addInitScript((h) => {
    window.localStorage.setItem("opendoor-household", JSON.stringify(h));
  }, household(state, monthlyIncome));
}

test.describe("unique-to-your-state", () => {
  test("a deep state surfaces its exclusive programs in a panel", async ({ page }) => {
    // The panel only lists exclusives the household could actually get, so
    // seed an income inside the Essential Plan band (138–200% FPL — ~$3.1k–
    // $4.4k/mo for 3). The default fixture sits under 138% and lands on
    // Medicaid instead, which correctly leaves the panel empty.
    await seed(page, "NY", [3400, 3800]);
    await page.goto("/results");

    const panel = page.getByText(/Unique to New York/i).first();
    await expect(panel).toBeVisible();

    // The panel is an InfoBox: one line collapsed, full list on click.
    await panel.click();
    // Essential Plan is NY-exclusive in the library (no other pack has a BHP).
    // Scoped to the panel's list: the bare name also appears in collapsed,
    // hidden spans elsewhere on the page, so an unscoped .first() lands on one.
    await expect(
      page.getByRole("listitem").filter({ hasText: /^Essential Plan/ }).first()
    ).toBeVisible();

    // The footnote states the denominator it's reasoning over, so the claim
    // is scoped rather than absolute.
    await expect(page.getByText(/states with hand-verified program packs/i)).toBeVisible();
  });

  test("the badge carries a real sentence for screen readers, not a star", async ({ page }) => {
    await seed(page, "NY");
    await page.goto("/results");

    // Find the Essential Plan card's exclusivity badge by its accessible text.
    const spoken = page.getByText(
      /Only New York offers this among the \d+ states OpenDoor covers in depth/i
    );
    await expect(spoken.first()).toBeAttached();

    // And it is visually hidden — present for AT, not painted as text.
    const box = await spoken.first().boundingBox();
    expect(box === null || box.width <= 2).toBeTruthy();
  });

  test("a federal-tier state shows no unique panel at all", async ({ page }) => {
    // Wyoming, deliberately: this test named Ohio until Ohio got a deep pack,
    // and then failed. Packs are added in descending population order, so the
    // least-populous state is the most stable federal-tier fixture. (The unit
    // suite picks its federal-tier state dynamically; an e2e test has to seed a
    // literal state code into localStorage, so it can't.)
    await seed(page, "WY");
    await page.goto("/results");

    await expect(page.getByText(/Unique to/i)).toHaveCount(0);

    // ...but the honest coverage note is untouched. It's an InfoBox, so it
    // ships collapsed (the app-wide collapse system) — open it to see the
    // official aggregator link.
    await page.getByText(/where to check Wyoming/i).first().click();
    await expect(page.getByRole("link", { name: /Benefits\.gov/i })).toBeVisible();
  });

  test("a shared state program is not badged exclusive", async ({ page }) => {
    // Illinois has a state EITC, which NJ/CA/PA/NY also have — so it must NOT
    // claim exclusivity, even though its id is IL-prefixed.
    await seed(page, "IL");
    await page.goto("/results");

    await expect(
      page.getByText(/Only Illinois offers this among .* Illinois Earned Income/i)
    ).toHaveCount(0);
    const ilEitcExclusive = page.getByText(
      /Only Illinois offers this among the \d+ states/i
    );
    // Any exclusivity claims IL does make must not be about the EITC card.
    const count = await ilEitcExclusive.count();
    for (let i = 0; i < count; i++) {
      const card = ilEitcExclusive.nth(i).locator("xpath=ancestor::*[self::h3][1]");
      await expect(card).not.toContainText(/Earned Income/i);
    }
  });
});
