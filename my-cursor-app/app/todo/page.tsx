"use client";

import { FormEvent, useEffect, useState } from "react";
import TodoList from "@/components/TodoList";
import type { Todo } from "@/types/todo";

const STORAGE_KEY = "todos";

function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.text === "string" &&
    typeof item.completed === "boolean"
  );
}

function readTodos(): Todo[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isTodo);
  } catch {
    return [];
  }
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTodos(readTodos());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [ready, todos]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextText = text.trim();

    if (!nextText) {
      return;
    }

    setTodos((current) => [
      ...current,
      { id: crypto.randomUUID(), text: nextText, completed: false },
    ]);
    setText("");
  }

  function handleToggle(id: string) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  function handleDelete(id: string) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  const remaining = todos.filter((todo) => !todo.completed).length;

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-16 font-sans dark:bg-black">
      <main className="flex w-full max-w-xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            할 일
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {ready
              ? `남은 할 일 ${remaining}개`
              : "저장된 할 일을 불러오는 중"}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="할 일을 입력하세요"
            aria-label="할 일"
            className="h-12 flex-1 rounded-full border border-black/10 bg-white px-4 text-zinc-950 outline-none focus:border-zinc-400 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <button
            type="submit"
            className="h-12 rounded-full bg-zinc-950 px-5 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
          >
            추가
          </button>
        </form>

        <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
      </main>
    </div>
  );
}
