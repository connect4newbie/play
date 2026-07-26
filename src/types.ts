/** Cloudflare Workers 環境変数の型定義（本アプリはバインディングなし） */
export type Bindings = Record<string, never>;

/** 空き / プレイヤー / CPU */
export type Cell = 0 | 1 | 2;

/** board[column][row]。row 0 が下端。左下から積み上げる */
export type Board = Cell[][];

export type Player = 1 | 2;

export type Winner = 0 | 1 | 2;

export type GameStatus = "playing" | "player_win" | "cpu_win" | "draw";

export const COLS = 7;
export const ROWS = 6;
export const PLAYER: Player = 1;
export const CPU: Player = 2;
export const EMPTY: Cell = 0;
