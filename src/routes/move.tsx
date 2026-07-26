import { Hono } from "hono";
import type { Bindings } from "../types";
import { BoardPage, ErrorPage } from "../components/BoardPage";
import {
  chooseCpuMove,
  createEmptyBoard,
  dropPiece,
  getGameStatus,
  parseBoard,
} from "../services/game";
import { CPU, PLAYER } from "../types";

const move = new Hono<{ Bindings: Bindings }>();

move.post("/", async (c) => {
  try {
    const body = await c.req.parseBody();
    const columnRaw = body["column"];
    const boardRaw = body["board"];

    const board =
      typeof boardRaw === "string" ? parseBoard(boardRaw) : null;

    if (!board) {
      const empty = createEmptyBoard();
      return c.html(
        <BoardPage
          board={empty}
          status="playing"
          error="盤面データが不正です。New Game でやり直してください。"
        />,
      );
    }

    const status = getGameStatus(board);
    if (status !== "playing") {
      // ゲーム終了後の操作は受け付けず終了画面のまま
      return c.html(<BoardPage board={board} status={status} />);
    }

    const column =
      typeof columnRaw === "string" ? Number.parseInt(columnRaw, 10) : NaN;

    if (!Number.isInteger(column) || column < 0 || column > 6) {
      return c.html(
        <BoardPage
          board={board}
          status={status}
          error="列は 0〜6 を指定してください。"
        />,
      );
    }

    const afterPlayer = dropPiece(board, column, PLAYER);
    if (!afterPlayer) {
      return c.html(
        <BoardPage
          board={board}
          status={status}
          error="その列は満杯です。別の列を選んでください。"
        />,
      );
    }

    const afterPlayerStatus = getGameStatus(afterPlayer);
    if (afterPlayerStatus !== "playing") {
      return c.html(
        <BoardPage board={afterPlayer} status={afterPlayerStatus} />,
      );
    }

    // CPU 手番
    const cpuCol = chooseCpuMove(afterPlayer);
    const afterCpu = dropPiece(afterPlayer, cpuCol, CPU);
    if (!afterCpu) {
      // 理論上起こらないが安全側
      return c.html(
        <BoardPage board={afterPlayer} status={getGameStatus(afterPlayer)} />,
      );
    }

    return c.html(
      <BoardPage board={afterCpu} status={getGameStatus(afterCpu)} />,
    );
  } catch (error) {
    console.error("POST /move error:", error);
    return c.html(<ErrorPage />, 500);
  }
});

export { move };
