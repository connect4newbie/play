import { Hono } from "hono";
import type { Bindings } from "../types";

const newGame = new Hono<{ Bindings: Bindings }>();

/** 盤面をリセットして / へリダイレクト */
newGame.post("/", (c) => {
  return c.redirect("/", 303);
});

export { newGame };
