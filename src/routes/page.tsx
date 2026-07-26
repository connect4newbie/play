import { Hono } from "hono";
import type { Bindings } from "../types";
import { BoardPage } from "../components/BoardPage";
import { createEmptyBoard, getGameStatus } from "../services/game";

const page = new Hono<{ Bindings: Bindings }>();

page.get("/", (c) => {
  const board = createEmptyBoard();
  return c.html(<BoardPage board={board} status={getGameStatus(board)} />);
});

export { page };
