import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

// ── Temporal middleware (undo/redo) ───────────────────────────────────────
interface TemporalState<T> {
  history: T[];
  future: T[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

function createTemporalStore<T>(
  creator: StateCreator<T, [["zustand/devtools", never]]>,
  name: string
) {
  return create<T & TemporalState<T>>()(
    devtools(
      (set, get, api) => {
        let isTimeTraveling = false;
        // Use loose typing for the internal set calls to avoid Zustand v5 strictness
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawSet = set as (...args: any[]) => void;

        const wrappedSet: typeof set = (updater, replace, actionName) => {
          if (isTimeTraveling) { rawSet(updater, replace, actionName); return; }

          const prevState = get();
          rawSet(updater, replace, actionName);
          const nextState = get();

          if (prevState !== nextState) {
            rawSet((s: T & TemporalState<T>) => ({
              ...(s as object),
              history: [...s.history, prevState],
              future: [],
              canUndo: true,
              canRedo: false,
            }), false, `${name}/${String(actionName)}/snapshot`);
          }
        };

        const base = creator(wrappedSet, get, api);

        return {
          ...base,
          history: [] as T[],
          future: [] as T[],
          canUndo: false,
          canRedo: false,

          undo: () => {
            const state = get() as unknown as TemporalState<T>;
            if (!state.history.length) return;
            const prev = state.history[state.history.length - 1];
            const current = get();
            isTimeTraveling = true;
            rawSet((s: T & TemporalState<T>) => ({
              ...prev,
              history: s.history.slice(0, -1),
              future: [current as unknown as T, ...s.future],
              canUndo: s.history.length > 1,
              canRedo: true,
            }), false, `${name}/undo`);
            isTimeTraveling = false;
          },

          redo: () => {
            const state = get() as unknown as TemporalState<T>;
            if (!state.future.length) return;
            const next = state.future[0];
            const current = get();
            isTimeTraveling = true;
            rawSet((s: T & TemporalState<T>) => ({
              ...next,
              history: [...s.history, current as unknown as T],
              future: s.future.slice(1),
              canUndo: true,
              canRedo: s.future.length > 1,
            }), false, `${name}/redo`);
            isTimeTraveling = false;
          },

          clearHistory: () =>
            rawSet({ history: [], future: [], canUndo: false, canRedo: false }, false, `${name}/clearHistory`),
        };
      },
      { name }
    )
  );
}

// ── Example: Drawing Canvas Store with undo/redo ──────────────────────────
export interface CanvasShape {
  id: string;
  type: "rect" | "circle" | "line";
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
}

interface CanvasState {
  shapes: CanvasShape[];
  selectedId: string | null;
}

interface CanvasActions {
  addShape: (shape: CanvasShape) => void;
  moveShape: (id: string, x: number, y: number) => void;
  deleteShape: (id: string) => void;
  selectShape: (id: string | null) => void;
}

export const useCanvasStore = createTemporalStore<CanvasState & CanvasActions>(
  (set) => ({
    shapes: [],
    selectedId: null,

    addShape: (shape) =>
      set((s) => ({ shapes: [...(s as CanvasState).shapes, shape] }), false, "canvas/addShape"),

    moveShape: (id, x, y) =>
      set((s) => ({
        shapes: (s as CanvasState).shapes.map((sh) => sh.id === id ? { ...sh, x, y } : sh),
      }), false, "canvas/moveShape"),

    deleteShape: (id) =>
      set((s) => ({
        shapes: (s as CanvasState).shapes.filter((sh) => sh.id !== id),
      }), false, "canvas/deleteShape"),

    selectShape: (id) => set({ selectedId: id } as Partial<CanvasState & CanvasActions>, false, "canvas/select"),
  }),
  "CanvasStore"
);
