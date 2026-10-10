"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { useHousehold } from "@/lib/household-store";
import { clearSnapshot } from "@/lib/snapshot";
import { getState } from "@/data/states";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchPalette, useSearchPalette } from "@/components/SearchPalette";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle, useT } from "@/lib/i18n";
import type { TranslationKey } from "@/data/i18n/en";

const LINKS: { href: string; labelKey: TranslationKey }[] = [
  { href: "/intake", labelKey: "nav.checkEligibility" },
  { href: "/results", labelKey: "nav.myResults" },
  { href: "/cliff-simulator", labelKey: "nav.cliffSimulator" },
];

export function NavHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { household, reset } = useHousehold();
  const stateEntry = getState(household.state);
  const { open, setOpen } = useSearchPalette();
  const t = useT();

  // Guest data lives in this browser's localStorage with no per-person
  // boundary — on a shared or public computer, the next person to sit down
  // would otherwise be greeted with whatever state/income/answers the last
  // person left behind. Only shown once there's actually something to clear.
  const hasGuestData = household.householdSize !== undefined;
  function startOver() {
    reset();
    clearSnapshot();
    router.push("/intake");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-card-border/70 bg-background/85 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="w-8 h-8 rounded-lg border border-accent/60 bg-background flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="3" width="11" height="18" rx="1.5" stroke="var(--accent)" strokeWidth="1.6" />
              <circle cx="13.2" cy="12" r="1" fill="var(--accent)" />
              <path d="M16 5.5L20 7v13l-4-1.2" stroke="var(--accent-2)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {/* Mark alone on phones — the wordmark is the cheapest 70px to give
              back when six clusters have to share a 360px bar. */}
          <span className="hidden sm:inline font-semibold tracking-tight">OpenDoor</span>
        </Link>

        {/* lg, not sm: three full-width labels squeezed onto a tablet wrapped
            to a second line and doubled the header's height. */}
        <nav className="hidden lg:flex shrink-0 items-center gap-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                pathname === l.href
                  ? "bg-accent/15 text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t(l.labelKey)}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="press-weight ml-auto shrink-0 flex items-center gap-2 whitespace-nowrap rounded-full border border-card-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
          aria-label={t("nav.searchAria")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">{t("nav.search")}</span>
          <kbd className="label-mono hidden xl:inline text-[9px] border border-card-border rounded px-1 py-px">
            ctrl K
          </kbd>
        </button>

        <div className="flex shrink-0 items-center gap-3 text-[12px] text-muted">
          {stateEntry && (
            <span className="hidden xl:inline whitespace-nowrap rounded-full border border-card-border px-2.5 py-1">
              {stateEntry.name}
            </span>
          )}
          {/* The width this badge needs is exactly what "Start over" claims, and
              the two never matter at once: this is a first-impression trust
              signal, Start over only exists once there's data to clear. */}
          {!hasGuestData && (
            <span className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
              <span className="dot-live w-1.5 h-1.5 rounded-full bg-accent" />
              {t("nav.localPrivate")}
            </span>
          )}
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <Show when="signed-out">
          {hasGuestData && (
            <button
              type="button"
              onClick={startOver}
              aria-label={t("nav.startOverAria")}
              className="press-weight shrink-0 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-card-border px-3 py-1.5 text-xs text-muted hover:border-[#f87171]/50 hover:text-[#f87171] transition-colors"
            >
              <Icon size={13} strokeWidth={2}>
                <path d="M3 12a9 9 0 1 1 2.6 6.4" />
                <path d="M3 8v4h4" />
              </Icon>
              <span className="hidden md:inline">{t("nav.startOver")}</span>
            </button>
          )}
          <ButtonLink href="/sign-in" className="shrink-0 whitespace-nowrap px-4 py-1.5 text-xs">
            {t("nav.signIn")}
          </ButtonLink>
        </Show>
        <Show when="signed-in">
          <div className="shrink-0">
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link
                  label={t("nav.myAccount")}
                  href="/account"
                  labelIcon={<AccountIcon />}
                />
              </UserButton.MenuItems>
            </UserButton>
          </div>
        </Show>
      </div>
      <SearchPalette open={open} onClose={() => setOpen(false)} />
    </header>
  );
}

function AccountIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
