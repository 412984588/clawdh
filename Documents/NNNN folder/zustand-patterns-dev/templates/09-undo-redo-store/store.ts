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
  creator: StateCreator<T>,
  name: string
) {
  return create<T & TemporalState<T>>()(
    devtools(
      (set, get, api) => {
        let isTimeTraveling = false;

        const wrappedSet: typeof set = (updater, replace, actionName) => {
          if (isTimeTraveling) return set(updater as Parameters<typeof set>[0], replace as boolean, actionName);

          const prevState = get();
          set(updater as Parameters<typeof set>[0], replace as boolean, actionName);
          const nextState = get();

          if (prevState !== nextState) {
            set((s) => ({
              ...(s as object),
              history: [...(s as TemporalState<T>).history, prevState],
              future: [],
              canUndo: true,
              canRedo: false,
            }) as T & TemporalState<T>, false, `${name}/${actionName as string}/snapshot`);
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
            const { history } = get() as TemporalState<T>;
            if (!history.length) return;
            const prev = history[history.length - 1];
            const current = get();
            isTimeTraveling = true;
            set((s) => ({
              ...prev,
              history: (s as TemporalState<T>).history.slice(0, -1),
              future: [(current as unknown as T), ...(s as TemporalState<T>).future],
              canUndo: (s as TemporalState<T>).history.length > 1,
              canRedo: true,
            }) as T & TemporalState<T>, false, `${name}/undo`);
            isTimeTraveling = false;
          },

          redo: () => {
            const { future } = get() as TemporalState<T>;
            if (!future.length) return;
            const next = future[0];
            const current = get();
            isTimeTraveling = true;
            set((s) => ({
              ...next,
              history: [...(s as TemporalState<T>).history, (current as unknown as T)],
              future: (s as TemporalState<T>).future.slice(1),
              canUndo: true,
              canRedo: (s as TemporalState<T>).future.length > 1,
            }) as T & TemporalState<T>, false, `${name}/redo`);
            isTimeTraveling = false;
          },

          clearHistory: () =>
            set({ history: [], future: [], canUndo: false, canRedo: false } as Partial<T & TemporalState<T>>, false, `${name}/clearHistory`),
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
