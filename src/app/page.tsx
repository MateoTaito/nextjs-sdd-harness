'use client';

import React, { useState, useEffect } from 'react';
import { Todo, createTodo } from '@/lib/todo';
import { loadTasks, saveTasks } from '@/lib/storage';
import TodoList from '@/components/TodoList';
import AddTodo from '@/components/AddTodo';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    setTodos(loadTasks());
  }, []);

  const addTodo = (title: string) => {
    const newTodo = createTodo(title);
    const updated = [...todos, newTodo];
    setTodos(updated);
    saveTasks(updated);
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updated);
    saveTasks(updated);
  };

  return (
    <main>
      <h1>Mis Tareas</h1>
      <AddTodo onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} />
    </main>
  );
}