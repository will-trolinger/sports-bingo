import { cellKey, type Board } from "../board";
import { logoUrl, type Sport } from "../teams";

interface Props {
  sport: Sport;
  board: Board;
  marks: ReadonlySet<string>;
  onToggle: (key: string) => void;
}

// The 5x5 card. A marked square fills with the accent color.
export function BingoBoard({ sport, board, marks, onToggle }: Props) {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2" role="grid" aria-label="Bingo card">
      {board.map((row, r) =>
        row.map((cell, c) => {
          const key = cellKey(r, c);
          if (cell.is_free) return <FreeSquare key={key} />;
          const marked = marks.has(key);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={marked}
              onClick={() => onToggle(key)}
              className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-md border p-1 transition-colors ${
                marked ? "border-mark-edge bg-mark" : "border-transparent bg-square hover:bg-square-hover"
              }`}
            >
              <img
                src={logoUrl(sport, cell.name)}
                alt=""
                className="h-[55%] w-[70%] object-contain"
                draggable={false}
              />
              <span className="w-full truncate text-center text-[10px] leading-tight text-ink-dim sm:text-xs">
                {cell.name}
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}

function FreeSquare() {
  return (
    <div
      className="flex aspect-square items-center justify-center rounded-md border border-mark-edge bg-mark"
    >
      <span className="text-sm font-semibold tracking-wide sm:text-base">FREE</span>
    </div>
  );
}
