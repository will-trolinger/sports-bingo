import { SPORTS, type Sport } from "../teams";

interface Props {
  sport: Sport;
  onChange: (sport: Sport) => void;
}

// One joined control: each sport keeps its own board, so switching is
// instant and loses nothing.
export function SportPicker({ sport, onChange }: Props) {
  return (
    <div className="flex w-full divide-x divide-rule overflow-hidden rounded-md border border-rule" role="group" aria-label="Sport">
      {SPORTS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          aria-pressed={sport === id}
          onClick={() => onChange(id)}
          className={`h-10 flex-1 px-4 text-sm transition-colors focus-visible:-outline-offset-2 ${
            sport === id ? "bg-ink font-semibold text-page" : "text-ink-dim hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
