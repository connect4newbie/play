import type { FC } from "hono/jsx";
import { COLS, CPU, EMPTY, PLAYER, ROWS } from "../types";
import type { Board, GameStatus, Player } from "../types";
import { findThreatCells, serializeBoard } from "../services/game";

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

function cellClass(value: 0 | 1 | 2, threatOwner: Player | null): string {
  if (value === 1) return "bg-[#ef4444] shadow-inner";
  if (value === 2) return "bg-[#facc15] shadow-inner";
  if (threatOwner === PLAYER) {
    return "bg-red-400/40 ring-2 ring-red-500 ring-offset-1 ring-offset-sky-800";
  }
  if (threatOwner === CPU) {
    return "bg-amber-300/50 ring-2 ring-amber-500 ring-offset-1 ring-offset-sky-800";
  }
  return "bg-slate-100 border border-slate-200";
}

function emptyAriaLabel(threatOwner: Player | null): string {
  if (threatOwner === PLAYER) return "空き（あなたのリーチ）";
  if (threatOwner === CPU) return "空き（CPU のリーチ）";
  return "空き";
}

/** 列ボタン: プレイヤー勝ち > CPU ブロック > 通常 */
function columnButtonClass(threat: Player | null): string {
  const base =
    "flex h-9 items-center justify-center rounded-lg text-sm font-semibold text-white transition";
  if (threat === PLAYER) {
    return `${base} bg-red-600 hover:bg-red-500 active:bg-red-700`;
  }
  if (threat === CPU) {
    return `${base} bg-amber-500 hover:bg-amber-400 active:bg-amber-600`;
  }
  return `${base} bg-sky-600 hover:bg-sky-500 active:bg-sky-800`;
}

function columnAriaLabel(col: number, threat: Player | null): string {
  if (threat === PLAYER) return `列 ${col + 1} に置く（あなたのリーチ）`;
  if (threat === CPU) return `列 ${col + 1} に置く（CPU のリーチ・要ブロック）`;
  return `列 ${col + 1} に置く`;
}

export const BoardPage: FC<BoardPageProps> = ({ board, status, error }) => {
  const playing = status === "playing";
  const boardJson = serializeBoard(board);

  // 表示は上から下（row ROWS-1 → 0）
  const displayRows: number[] = [];
  for (let r = ROWS - 1; r >= 0; r--) displayRows.push(r);

  // 論理リーチ（空中含む）。同一マスはプレイヤー優先。
  // 列ボタンは「今そこに置くとリーチが埋まる」列のみ色付けする。
  const threatByCell = new Map<string, Player>();
  const threatByCol = new Map<number, Player>();
  if (playing) {
    const dropRowOf = (col: number): number | null => {
      for (let row = 0; row < ROWS; row++) {
        if (board[col][row] === EMPTY) return row;
      }
      return null;
    };

    for (const t of findThreatCells(board)) {
      const key = `${t.col},${t.row}`;
      const existing = threatByCell.get(key);
      if (!existing || t.owner === PLAYER) {
        threatByCell.set(key, t.owner);
      }
      // 列ボタン: その列の次の落下行がリーチ空きと一致するときだけ
      if (dropRowOf(t.col) === t.row) {
        const colExisting = threatByCol.get(t.col);
        if (!colExisting || t.owner === PLAYER) {
          threatByCol.set(t.col, t.owner);
        }
      }
    }
  }

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

            <div class="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
              <span class="inline-flex items-center gap-1.5">
                <span class="inline-block h-3 w-3 rounded-full bg-[#ef4444]" />
                あなた
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="inline-block h-3 w-3 rounded-full bg-[#facc15]" />
                CPU
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="inline-block h-3 w-3 rounded-full bg-red-400/40 ring-1 ring-red-500" />
                あなたのリーチ
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="inline-block h-3 w-3 rounded-full bg-amber-300/50 ring-1 ring-amber-500" />
                CPU のリーチ
              </span>
            </div>

            {/* 列ボタン + 盤面 */}
            <div class="rounded-2xl border border-slate-200 bg-sky-700 p-2 shadow-sm">
              {/* 列ドロップボタン */}
              <div
                class="mb-1 grid gap-1"
                style={`grid-template-columns: repeat(${COLS}, minmax(0, 1fr));`}
              >
                {Array.from({ length: COLS }, (_, col) => {
                  const colThreat = threatByCol.get(col) ?? null;
                  return playing ? (
                    <form method="post" action="/move" class="contents">
                      <input type="hidden" name="column" value={String(col)} />
                      <input type="hidden" name="board" value={boardJson} />
                      <button
                        type="submit"
                        class={columnButtonClass(colThreat)}
                        aria-label={columnAriaLabel(col, colThreat)}
                      >
                        ↓
                      </button>
                    </form>
                  ) : (
                    <div class="flex h-9 items-center justify-center rounded-lg bg-sky-800/50 text-sm text-sky-300/50">
                      ↓
                    </div>
                  );
                })}
              </div>

              {/* セルグリッド */}
              <div
                class="grid gap-1.5 rounded-xl bg-sky-800 p-2"
                style={`grid-template-columns: repeat(${COLS}, minmax(0, 1fr));`}
              >
                {displayRows.flatMap((row) =>
                  Array.from({ length: COLS }, (_, col) => {
                    const value = board[col][row];
                    const threatOwner =
                      value === 0
                        ? (threatByCell.get(`${col},${row}`) ?? null)
                        : null;
                    return (
                      <div
                        class={`aspect-square w-full rounded-full ${cellClass(value, threatOwner)}`}
                        aria-label={
                          value === 1
                            ? "プレイヤー"
                            : value === 2
                              ? "CPU"
                              : emptyAriaLabel(threatOwner)
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
