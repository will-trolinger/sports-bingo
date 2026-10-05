import { completedLines, isBlackout } from "./board";
import type { Mode } from "./api";

export interface Outcome {
  celebrate: boolean;
  prompt: "bingo" | "blackout" | null;
}

// What a tap leads to. Confetti for every newly completed line. The "what
// next?" question comes when the card goes from no bingo to bingo (again, if
// a line was unmarked and another made) unless the player already chose to
// go for blackout; a blackout always gets its own question.
export function outcomeOfToggle(before: ReadonlySet<string>, after: ReadonlySet<string>, mode: Mode): Outcome {
  if (!isBlackout(before) && isBlackout(after)) return { celebrate: true, prompt: "blackout" };
  const linesBefore = completedLines(before).length;
  const linesAfter = completedLines(after).length;
  if (linesAfter <= linesBefore) return { celebrate: false, prompt: null };
  const firstBingo = linesBefore === 0 && mode === "playing";
  return { celebrate: true, prompt: firstBingo ? "bingo" : null };
}
