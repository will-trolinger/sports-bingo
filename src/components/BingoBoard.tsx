import { cellKey, type Board } from "../board";
import { logoUrl, type Sport } from "../teams";

interface Props {
  sport: Sport;
  board: Board;
  marks: ReadonlySet<string>;
  onToggle: (key: string) => void;
}

// The 5x5 card. A marked square lights a lamp bar under its logo, the same
// device the ballparks scoreboard uses for "gone".
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
              className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-md p-1 transition-colors focus-visible:outline-2 focus-visible:outline-chalk ${
                marked ? "bg-slot-lit" : "bg-slot hover:bg-slot-hover"
              }`}
            >
              <img
                src={logoUrl(sport, cell.name)}
                alt=""
                className={`h-[52%] w-[70%] object-contain transition-opacity ${marked ? "" : "opacity-90"}`}
                draggable={false}
              />
              <span className="w-full truncate text-center text-[10px] leading-tight text-chalk-dim sm:text-xs">
                {cell.name}
              </span>
              <span className={`h-1 w-3/5 rounded-full ${marked ? "lamp bg-lamp" : "bg-rule"}`} />
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
      className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md bg-slot-lit"
    >
      <span className="text-sm font-semibold tracking-wide text-lamp sm:text-base">FREE</span>
      <span className="lamp h-1 w-3/5 rounded-full bg-lamp" />
    </div>
  );
}
