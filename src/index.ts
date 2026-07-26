import { Hono } from "hono";
import type { Bindings } from "./types";
import { page } from "./routes/page";
import { move } from "./routes/move";
import { newGame } from "./routes/new";

const app = new Hono<{ Bindings: Bindings }>();

const ERROR_HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Error — play</title>
  <style>
    body{font-family:system-ui,sans-serif;display:flex;min-height:100dvh;align-items:center;justify-content:center;margin:0;background:#f8fafc;color:#0f172a}
    a{display:inline-block;margin-top:1.5rem;padding:.75rem 1.5rem;background:#4338ca;color:#fff;border-radius:1rem;text-decoration:none;font-weight:600}
  </style>
</head>
<body>
  <div style="text-align:center">
    <p>サーバーエラーが発生しました。</p>
    <a href="/">トップへ戻る</a>
  </div>
</body>
</html>`;

app.onError((err, c) => {
  console.error("unhandled error:", err);
  return c.html(ERROR_HTML, 500);
});

app.route("/", page);
app.route("/move", move);
app.route("/new", newGame);

app.get("/health", (c) => c.json({ status: "ok" }));

export default app;
