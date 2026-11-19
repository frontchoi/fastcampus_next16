import TodoItem from "@/components/TodoItem";
import type { Todo } from "@/types/todo";

type TodoListProps = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/10 px-4 py-10 text-center text-zinc-500 dark:border-white/15">
        할 일이 없습니다. 위에서 추가해 보세요.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
