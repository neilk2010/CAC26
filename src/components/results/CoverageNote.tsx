import { deepStates, type StateEntry } from "@/data/states";
import { InfoBox } from "@/components/ui/InfoBox";

// The honest coverage indicator for federal-tier states: what we DO cover
// (the full federal baseline + the national address-based local features),
// what we don't yet (that state's own programs), and the real official place
// to check those. Derived entirely from the state registry — no state names
// in code. Collapsed to one line by default (the collapse system).

export function CoverageNote({ stateEntry }: { stateEntry: StateEntry }) {
  if (stateEntry.tier === "deep") return null;

  const deepNames = deepStates().map((s) => s.name);
  const deep =
    deepNames.length > 1
      ? `${deepNames.slice(0, -1).join(", ")} and ${deepNames[deepNames.length - 1]}`
      : deepNames.join("");

  return (
    <InfoBox
      label={`coverage in ${stateEntry.name}`}
      title={`All federal programs — plus where to check ${stateEntry.name}'s own`}
    >
      <p className="text-sm">
        You&apos;re seeing every federal program — and the address-based local results (rent
        benchmarks, income limits, affordable properties, health centers) are national data, so
        they work here too. {stateEntry.name} also runs its own state programs we haven&apos;t
        hand-verified yet ({deep} have full state packs so far).
      </p>
      <a
        href={stateEntry.aggregator.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm text-accent underline hover:no-underline"
      >
        Check {stateEntry.name}&apos;s programs on {stateEntry.aggregator.name}
      </a>
    </InfoBox>
  );
}
