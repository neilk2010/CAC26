import { UseCaseSlideshow } from "@/components/marketing/UseCaseSlideshow";
import { Hero } from "@/components/marketing/Hero";
import { OrbitMenu, OrbitSectionIntro } from "@/components/marketing/OrbitMenu";
import { PopulationTiles } from "@/components/marketing/PopulationGrid";
import { CategoryGrid } from "@/components/marketing/CategoryGrid";
import { AccessibilityGrid } from "@/components/marketing/AccessibilityGrid";
import { HowItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { ButtonLink } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
    <main className="flex-1">
      <Hero />

      {/* Rotating use-case scenarios */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-center text-sm text-muted mb-4">What&apos;s this actually for?</p>
        <UseCaseSlideshow />
      </section>

      {/* The orbit: personas + categories circling the door. Small screens get
          the compact tiles — the orbit needs room to breathe. */}
      <section className="py-20 overflow-hidden">
        <OrbitSectionIntro />
        <div className="hidden md:flex justify-center mt-2">
          <OrbitMenu />
        </div>
        <div className="md:hidden max-w-6xl mx-auto px-6 mt-10">
          <PopulationTiles />
        </div>
      </section>

      {/* Desktop already sees every category on the orbit's outer ring —
          this grid would just repeat it. Mobile swaps the orbit for the
          persona tiles above, so it still needs a categories entry point. */}
      <div className="md:hidden">
        <CategoryGrid />
      </div>
      <AccessibilityGrid />
      <HowItWorksSteps />

      {/* Final CTA */}
      <section className="border-t border-card-border bg-card/40">
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            You may be leaving money on the table.
          </h2>
          <p className="mt-4 text-muted">Takes about three minutes. No account needed.</p>
          <ButtonLink href="/intake" className="inline-block mt-8 px-8 py-3.5">
            Check my eligibility
          </ButtonLink>
        </div>
      </section>

    </main>
    {/* Outside <main> so the footer keeps its contentinfo landmark role —
        matches the other marketing pages. */}
    <Footer />
    </>
  );
}
