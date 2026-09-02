import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ICON_PATHS } from "@/components/ui/icons";
import { ACCESSIBILITY_ITEMS } from "@/data/marketing";

export function AccessibilityGrid() {
  return (
    // Full-bleed tinted band, not just another bare section — this is the
    // visual divider between the orbit above and the how-it-works steps
    // below, so the three sections read as distinct instead of one scroll.
    <section className="border-y border-card-border bg-card/40">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center">Built to be usable by everyone</h2>
        <p className="text-center text-muted mt-2 max-w-xl mx-auto">
          Benefits programs are hard enough to parse. OpenDoor shouldn&apos;t be.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {ACCESSIBILITY_ITEMS.map((a) => (
            <Card key={a.title} className="hover-lift p-5">
              <Icon size={20} stroke="var(--accent)">
                {ICON_PATHS[a.iconKey]}
              </Icon>
              <h3 className="font-semibold text-sm mt-3">{a.title}</h3>
              <p className="text-sm text-muted mt-1">{a.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
