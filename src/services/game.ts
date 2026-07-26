import {
  COLS,
  CPU,
  EMPTY,
  PLAYER,
  ROWS,
  type Board,
  type Cell,
  type GameStatus,
  type Player,
  type Winner,
} from "../types";

const MINIMAX_DEPTH = 2;

/** 空盤面を生成 */
export function createEmptyBoard(): Board {
  return Array.from({ length: COLS }, () =>
    Array.from({ length: ROWS }, () => EMPTY as Cell),
  );
}

/** board JSON をパース・検証。不正なら null */
export function parseBoard(raw: unknown): Board | null {
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (!Array.isArray(raw) || raw.length !== COLS) {
    return null;
  }

  const board: Board = [];
  for (let col = 0; col < COLS; col++) {
    const column = raw[col];
    if (!Array.isArray(column) || column.length !== ROWS) {
      return null;
    }
    const cells: Cell[] = [];
    for (let row = 0; row < ROWS; row++) {
      const v = column[row];
      if (v !== 0 && v !== 1 && v !== 2) {
        return null;
      }
      cells.push(v as Cell);
    }
    // 重力整合: 空きは上側にのみ。途中に穴があると不正
    let seenEmpty = false;
    for (let row = 0; row < ROWS; row++) {
      if (cells[row] === EMPTY) {
        seenEmpty = true;
      } else if (seenEmpty) {
        return null;
      }
    }
    board.push(cells);
  }
  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map((col) => col.slice() as Cell[]);
}

export function isColumnFull(board: Board, col: number): boolean {
  if (col < 0 || col >= COLS) return true;
  return board[col][ROWS - 1] !== EMPTY;
}

export function getValidColumns(board: Board): number[] {
  const cols: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (!isColumnFull(board, c)) cols.push(c);
  }
  return cols;
}

/** 指定列に駒を落とす。不可なら null */
export function dropPiece(
  board: Board,
  col: number,
  player: Player,
): Board | null {
  if (col < 0 || col >= COLS || isColumnFull(board, col)) {
    return null;
  }
  const next = cloneBoard(board);
  for (let row = 0; row < ROWS; row++) {
    if (next[col][row] === EMPTY) {
      next[col][row] = player;
      return next;
    }
  }
  return null;
}

/** 4 連があればそのプレイヤー、なければ 0 */
export function checkWinner(board: Board): Winner {
  const directions: [number, number][] = [
    [1, 0], // 横
    [0, 1], // 縦
    [1, 1], // 右斜め上
    [1, -1], // 右斜め下
  ];

  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const cell = board[col][row];
      if (cell === EMPTY) continue;

      for (const [dc, dr] of directions) {
        let count = 1;
        for (let i = 1; i < 4; i++) {
          const c = col + dc * i;
          const r = row + dr * i;
          if (c < 0 || c >= COLS || r < 0 || r >= ROWS) break;
          if (board[c][r] !== cell) break;
          count++;
        }
        if (count === 4) {
          return cell as Winner;
        }
      }
    }
  }
  return 0;
}

export function isBoardFull(board: Board): boolean {
  return getValidColumns(board).length === 0;
}

export function getGameStatus(board: Board): GameStatus {
  const winner = checkWinner(board);
  if (winner === PLAYER) return "player_win";
  if (winner === CPU) return "cpu_win";
  if (isBoardFull(board)) return "draw";
  return "playing";
}

// ── 評価関数 ──────────────────────────────────────────

function scoreWindow(window: Cell[], piece: Player): number {
  const opp: Player = piece === PLAYER ? CPU : PLAYER;
  let score = 0;
  let own = 0;
  let empty = 0;
  let enemy = 0;

  for (const cell of window) {
    if (cell === piece) own++;
    else if (cell === EMPTY) empty++;
    else if (cell === opp) enemy++;
  }

  if (own === 4) score += 100;
  else if (own === 3 && empty === 1) score += 5;
  else if (own === 2 && empty === 2) score += 2;

  if (enemy === 3 && empty === 1) score -= 4;

  return score;
}

/** 盤面を piece 視点で評価 */
export function evaluateBoard(board: Board, piece: Player): number {
  let score = 0;

  // 中央列を少し優遇
  const centerCol = 3;
  let centerCount = 0;
  for (let row = 0; row < ROWS; row++) {
    if (board[centerCol][row] === piece) centerCount++;
  }
  score += centerCount * 3;

  // 横
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const window: Cell[] = [
        board[col][row],
        board[col + 1][row],
        board[col + 2][row],
        board[col + 3][row],
      ];
      score += scoreWindow(window, piece);
    }
  }

  // 縦
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS - 3; row++) {
      const window: Cell[] = [
        board[col][row],
        board[col][row + 1],
        board[col][row + 2],
        board[col][row + 3],
      ];
      score += scoreWindow(window, piece);
    }
  }

  // 右斜め上
  for (let col = 0; col < COLS - 3; col++) {
    for (let row = 0; row < ROWS - 3; row++) {
      const window: Cell[] = [
        board[col][row],
        board[col + 1][row + 1],
        board[col + 2][row + 2],
        board[col + 3][row + 3],
      ];
      score += scoreWindow(window, piece);
    }
  }

  // 右斜め下
  for (let col = 0; col < COLS - 3; col++) {
    for (let row = 3; row < ROWS; row++) {
      const window: Cell[] = [
        board[col][row],
        board[col + 1][row - 1],
        board[col + 2][row - 2],
        board[col + 3][row - 3],
      ];
      score += scoreWindow(window, piece);
    }
  }

  return score;
}

// ── ミニマックス ──────────────────────────────────────

function isTerminal(board: Board): boolean {
  return checkWinner(board) !== 0 || isBoardFull(board);
}

/**
 * ミニマックス。CPU (maximizing) 視点。
 * @returns [score, bestColumn]
 */
function minimax(
  board: Board,
  depth: number,
  maximizing: boolean,
): [number, number] {
  const valid = getValidColumns(board);
  const terminal = isTerminal(board);

  if (depth === 0 || terminal) {
    if (terminal) {
      const winner = checkWinner(board);
      if (winner === CPU) return [1_000_000, -1];
      if (winner === PLAYER) return [-1_000_000, -1];
      return [0, -1]; // draw
    }
    return [evaluateBoard(board, CPU), -1];
  }

  // 探索順: 中央寄りを優先（同点時の手を安定させる）
  const ordered = [...valid].sort(
    (a, b) => Math.abs(a - 3) - Math.abs(b - 3),
  );

  if (maximizing) {
    let value = -Infinity;
    let bestCol = ordered[0] ?? 0;
    for (const col of ordered) {
      const next = dropPiece(board, col, CPU);
      if (!next) continue;
      const [score] = minimax(next, depth - 1, false);
      if (score > value) {
        value = score;
        bestCol = col;
      }
    }
    return [value, bestCol];
  }

  let value = Infinity;
  let bestCol = ordered[0] ?? 0;
  for (const col of ordered) {
    const next = dropPiece(board, col, PLAYER);
    if (!next) continue;
    const [score] = minimax(next, depth - 1, true);
    if (score < value) {
      value = score;
      bestCol = col;
    }
  }
  return [value, bestCol];
}

/**
 * CPU の手を選ぶ。
 * 1. 即勝利できる列があればそこに置く
 * 2. なければ深さ 2 のミニマックス
 */
export function chooseCpuMove(board: Board): number {
  const valid = getValidColumns(board);
  if (valid.length === 0) {
    throw new Error("合法手がない状態で CPU が呼ばれました");
  }

  // 短絡: 即勝利
  for (const col of valid) {
    const next = dropPiece(board, col, CPU);
    if (next && checkWinner(next) === CPU) {
      return col;
    }
  }

  const [, bestCol] = minimax(board, MINIMAX_DEPTH, true);
  if (bestCol < 0 || isColumnFull(board, bestCol)) {
    return valid[0];
  }
  return bestCol;
}

/** 盤面を JSON 文字列化（hidden input 用） */
export function serializeBoard(board: Board): string {
  return JSON.stringify(board);
}
