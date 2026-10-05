import { cellKey, FREE_KEY } from "../board";

// A card in miniature for the history list: the 25 squares, marked ones
// filled. Logos at this size would be noise.
export function BoardThumb({ marks }: { marks: ReadonlySet<string> }) {
  return (
    <div className="grid size-14 shrink-0 grid-cols-5 gap-0.5" aria-hidden="true">
      {Array.from({ length: 25 }, (_, i) => {
        const key = cellKey(Math.floor(i / 5), i % 5);
        const marked = key === FREE_KEY || marks.has(key);
        return <span key={key} className={`rounded-[2px] ${marked ? "bg-mark-edge" : "bg-square-hover"}`} />;
      })}
    </div>
  );
}
