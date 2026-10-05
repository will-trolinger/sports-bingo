import { SPORTS, type Sport } from "../teams";

interface Props {
  sport: Sport;
  onChange: (sport: Sport) => void;
}

// One joined control: each sport keeps its own board, so switching is
// instant and loses nothing.
export function SportPicker({ sport, onChange }: Props) {
  return (
    <div className="flex w-full divide-x divide-rule overflow-hidden rounded-md border border-rule sm:w-auto" role="group" aria-label="Sport">
      {SPORTS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          aria-pressed={sport === id}
          onClick={() => onChange(id)}
          className={`h-10 flex-1 px-4 text-sm transition-colors sm:flex-none ${
            sport === id ? "bg-chalk font-semibold text-board" : "text-chalk-dim hover:text-chalk"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
