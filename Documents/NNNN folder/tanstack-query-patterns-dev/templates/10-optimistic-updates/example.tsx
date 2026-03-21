import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface Todo { id: string; text: string; completed: boolean; }

async function updateTodo(todo: Partial<Todo> & { id: string }): Promise<Todo> {
  const res = await fetch(`/api/todos/${todo.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}

// Optimistic toggle: UI updates instantly, rolls back on error
export function useToggleTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todo: Todo) => updateTodo({ id: todo.id, completed: !todo.completed }),

    // 1. Snapshot current state and apply optimistic update
    onMutate: async (todo) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Snapshot current state for rollback
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // Apply optimistic update immediately
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) =>
        old.map((t) => t.id === todo.id ? { ...t, completed: !t.completed } : t)
      );

      // Return snapshot for rollback in onError
      return { previousTodos };
    },

    // 2. Rollback on error
    onError: (_err, _todo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
    },

    // 3. Sync with server after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

// Optimistic delete: remove from UI immediately
export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTodo,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) => old.filter((t) => t.id !== id));
      return { previousTodos };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTodos) queryClient.setQueryData(["todos"], context.previousTodos);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });
}

export function TodoList({ todos }: { todos: Todo[] }) {
  const { mutate: toggle } = useToggleTodo();
  const { mutate: remove } = useDeleteTodo();

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id} style={{ opacity: todo.completed ? 0.5 : 1 }}>
          <input type="checkbox" checked={todo.completed} onChange={() => toggle(todo)} />
          {todo.text}
          <button onClick={() => remove(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
