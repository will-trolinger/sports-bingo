import { cellKey, type Board } from "../board";
import { logoUrl, type Sport } from "../teams";

interface Props {
  sport: Sport;
  board: Board;
  marks: ReadonlySet<string>;
  // Absent for a past card, which is shown but cannot be changed.
  onToggle?: (key: string) => void;
}

const square = "flex aspect-square flex-col items-center justify-center gap-1 rounded-md border p-1";
const markedStyle = "border-mark-edge bg-mark";
const unmarkedStyle = "border-transparent bg-square";

// The 5x5 card. A marked square fills with the accent color.
export function BingoBoard({ sport, board, marks, onToggle }: Props) {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2" aria-label="Bingo card">
      {board.map((row, r) =>
        row.map((cell, c) => {
          const key = cellKey(r, c);
          if (cell.is_free) return <FreeSquare key={key} />;
          const marked = marks.has(key);
          const content = <SquareContent sport={sport} name={cell.name} />;
          if (!onToggle) {
            return (
              <div key={key} className={`${square} ${marked ? markedStyle : unmarkedStyle}`}>
                {content}
              </div>
            );
          }
          return (
            <button
              key={key}
              type="button"
              aria-pressed={marked}
              aria-label={cell.name}
              onClick={() => onToggle(key)}
              className={`${square} transition-colors ${marked ? markedStyle : `${unmarkedStyle} hover:bg-square-hover`}`}
            >
              {content}
            </button>
          );
        })
      )}
    </div>
  );
}

function SquareContent({ sport, name }: { sport: Sport; name: string }) {
  return (
    <>
      <img src={logoUrl(sport, name)} alt="" className="h-[55%] w-[70%] object-contain" draggable={false} />
      <span className="w-full truncate text-center text-[10px] leading-tight text-ink-dim sm:text-xs">{name}</span>
    </>
  );
}

function FreeSquare() {
  return (
    <div className={`${square} ${markedStyle}`}>
      <span className="text-sm font-semibold tracking-wide sm:text-base">FREE</span>
    </div>
  );
}
