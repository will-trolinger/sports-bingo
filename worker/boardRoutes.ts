import { Hono, type Context } from "hono";
import { parseCells, parseMarks, parseMode, parseSport, scoreMarks, toApiBoard, type BoardRow } from "./boardRows";
import { requireUser } from "./session";
import type { AppEnv } from "./types";

const HISTORY_PAGE = 30;

export const boardRoutes = new Hono<AppEnv>();
boardRoutes.use("/boards", requireUser);
boardRoutes.use("/boards/*", requireUser);

async function ownBoard(c: Context<AppEnv>, id: string): Promise<BoardRow | null> {
  return c.env.DB.prepare("SELECT * FROM boards WHERE id = ? AND user_id = ?")
    .bind(id, c.get("user").id)
    .first<BoardRow>();
}

// The card in play for one sport, if any.
boardRoutes.get("/boards/active", async (c) => {
  const sport = parseSport(c.req.query("sport"));
  if (!sport) return c.json({ error: "Unknown sport." }, 400);
  const row = await c.env.DB.prepare("SELECT * FROM boards WHERE user_id = ? AND sport = ? AND finished_at IS NULL")
    .bind(c.get("user").id, sport)
    .first<BoardRow>();
  return c.json({ board: row ? toApiBoard(row) : null });
});

// Past bingos, newest first.
boardRoutes.get("/boards", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM boards WHERE user_id = ? AND has_bingo = 1 ORDER BY first_bingo_at DESC LIMIT ?"
  )
    .bind(c.get("user").id, HISTORY_PAGE)
    .all<BoardRow>();
  return c.json({ boards: results.map(toApiBoard) });
});

boardRoutes.get("/boards/:id", async (c) => {
  const row = await ownBoard(c, c.req.param("id"));
  return row ? c.json({ board: toApiBoard(row) }) : c.json({ error: "No such board." }, 404);
});

// A new card finishes whatever card was in play for that sport, in one batch
// so a player never ends up with two or none.
boardRoutes.post("/boards", async (c) => {
  const body = await c.req.json().catch(() => null);
  const sport = parseSport(body?.sport);
  const cells = sport ? parseCells(body?.cells, sport) : null;
  const marks = parseMarks(body?.marks ?? []);
  if (!sport || !cells || !marks) return c.json({ error: "That card is not valid." }, 400);
  const userId = c.get("user").id;
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const { hasBingo, isBlackout } = scoreMarks(marks);
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE boards SET finished_at = ? WHERE user_id = ? AND sport = ? AND finished_at IS NULL").bind(
      now,
      userId,
      sport
    ),
    c.env.DB.prepare(
      `INSERT INTO boards (id, user_id, sport, cells, marks, has_bingo, is_blackout, first_bingo_at, blackout_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, userId, sport, JSON.stringify(cells), JSON.stringify(marks), Number(hasBingo), Number(isBlackout),
      hasBingo ? now : null, isBlackout ? now : null, now, now),
  ]);
  const row = await ownBoard(c, id);
  return c.json({ board: toApiBoard(row!) }, 201);
});

// Saves the marks (and the choice to go for blackout) on a card in play.
boardRoutes.put("/boards/:id", async (c) => {
  const body = await c.req.json().catch(() => null);
  const marks = parseMarks(body?.marks);
  const mode = parseMode(body?.mode);
  if (!marks || mode === null) return c.json({ error: "Those marks are not valid." }, 400);
  const row = await ownBoard(c, c.req.param("id"));
  if (!row) return c.json({ error: "No such board." }, 404);
  if (row.finished_at) return c.json({ error: "That card is finished." }, 409);
  const now = new Date().toISOString();
  const { hasBingo, isBlackout } = scoreMarks(marks);
  await c.env.DB.prepare(
    `UPDATE boards SET marks = ?, mode = ?, has_bingo = ?, is_blackout = ?,
       first_bingo_at = COALESCE(first_bingo_at, ?), blackout_at = COALESCE(blackout_at, ?), updated_at = ?
     WHERE id = ?`
  )
    .bind(JSON.stringify(marks), mode ?? row.mode, Number(hasBingo), Number(isBlackout),
      hasBingo ? now : null, isBlackout ? now : null, now, row.id)
    .run();
  return c.json({ board: toApiBoard((await ownBoard(c, row.id))!) });
});
