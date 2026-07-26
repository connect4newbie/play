import type { FC } from "hono/jsx";
import { COLS, ROWS } from "../types";
import type { Board, GameStatus } from "../types";
import { serializeBoard } from "../services/game";

export type BoardPageProps = {
  board: Board;
  status: GameStatus;
  error?: string;
};

function statusMessage(status: GameStatus): string {
  switch (status) {
    case "player_win":
      return "あなたの勝ち！";
    case "cpu_win":
      return "CPU の勝ち…";
    case "draw":
      return "引き分け";
    default:
      return "あなたの番 — 列を選んでください";
  }
}

function statusClass(status: GameStatus): string {
  switch (status) {
    case "player_win":
      return "bg-red-50 text-red-700 border-red-200";
    case "cpu_win":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "draw":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-indigo-50 text-indigo-800 border-indigo-100";
  }
}

function cellClass(value: 0 | 1 | 2): string {
  if (value === 1) return "bg-[#ef4444] shadow-inner";
  if (value === 2) return "bg-[#facc15] shadow-inner";
  return "bg-slate-100 border border-slate-200";
}

export const BoardPage: FC<BoardPageProps> = ({ board, status, error }) => {
  const playing = status === "playing";
  const boardJson = serializeBoard(board);

  // 表示は上から下（row ROWS-1 → 0）
  const displayRows: number[] = [];
  for (let r = ROWS - 1; r >= 0; r--) displayRows.push(r);

  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>play — Connect4</title>
        <meta
          name="description"
          content="シングルプレイ Connect4。CPU と対戦。"
        />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="min-h-dvh bg-slate-50 text-slate-900 antialiased">
        <div class="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col bg-white shadow-[0_0_0_1px_#f0f0f0]">
          <header class="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3.5 backdrop-blur">
            <div class="flex items-center gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-700 text-sm font-bold text-white">
                4
              </div>
              <div>
                <h1 class="text-base font-semibold tracking-tight text-slate-900">
                  play
                </h1>
                <p class="text-xs text-slate-500">Connect4 vs CPU</p>
              </div>
            </div>
          </header>

          <main class="flex-1 px-4 py-5">
            <div
              class={`mb-4 rounded-2xl border px-4 py-3 text-sm font-medium ${statusClass(status)}`}
              role="status"
            >
              {statusMessage(status)}
            </div>

            {error ? (
              <div
                class="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <div class="mb-3 flex items-center justify-center gap-4 text-xs text-slate-500">
              <span class="inline-flex items-center gap-1.5">
                <span class="inline-block h-3 w-3 rounded-full bg-[#ef4444]" />
                あなた
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="inline-block h-3 w-3 rounded-full bg-[#facc15]" />
                CPU
              </span>
            </div>

            {/* 列ボタン + 盤面 */}
            <div class="rounded-2xl border border-slate-200 bg-sky-700 p-2 shadow-sm">
              {/* 列ドロップボタン */}
              <div
                class="mb-1 grid gap-1"
                style={`grid-template-columns: repeat(${COLS}, minmax(0, 1fr));`}
              >
                {Array.from({ length: COLS }, (_, col) =>
                  playing ? (
                    <form method="post" action="/move" class="contents">
                      <input type="hidden" name="column" value={String(col)} />
                      <input type="hidden" name="board" value={boardJson} />
                      <button
                        type="submit"
                        class="flex h-9 items-center justify-center rounded-lg bg-sky-600 text-sm font-semibold text-white transition hover:bg-sky-500 active:bg-sky-800"
                        aria-label={`列 ${col + 1} に置く`}
                      >
                        ↓
                      </button>
                    </form>
                  ) : (
                    <div class="flex h-9 items-center justify-center rounded-lg bg-sky-800/50 text-sm text-sky-300/50">
                      ↓
                    </div>
                  ),
                )}
              </div>

              {/* セルグリッド */}
              <div
                class="grid gap-1.5 rounded-xl bg-sky-800 p-2"
                style={`grid-template-columns: repeat(${COLS}, minmax(0, 1fr));`}
              >
                {displayRows.flatMap((row) =>
                  Array.from({ length: COLS }, (_, col) => {
                    const value = board[col][row];
                    return (
                      <div
                        class={`aspect-square w-full rounded-full ${cellClass(value)}`}
                        aria-label={
                          value === 1
                            ? "プレイヤー"
                            : value === 2
                              ? "CPU"
                              : "空き"
                        }
                      />
                    );
                  }),
                )}
              </div>
            </div>
          </main>

          <footer class="border-t border-slate-200 px-4 py-4">
            <form method="post" action="/new">
              <button
                type="submit"
                class="w-full rounded-2xl bg-indigo-700 px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-indigo-800 active:bg-indigo-900"
              >
                New Game
              </button>
            </form>
          </footer>
        </div>
      </body>
    </html>
  );
};

export const ErrorPage: FC<{ message?: string }> = ({
  message = "サーバーエラーが発生しました。",
}) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error — play</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="min-h-dvh bg-slate-50 text-slate-900 antialiased">
        <div class="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col items-center justify-center bg-white px-6 shadow-[0_0_0_1px_#f0f0f0]">
          <p class="text-center text-base font-medium text-slate-800">
            {message}
          </p>
          <a
            href="/"
            class="mt-6 rounded-2xl bg-indigo-700 px-6 py-3 text-sm font-semibold text-white"
          >
            トップへ戻る
          </a>
        </div>
      </body>
    </html>
  );
};
