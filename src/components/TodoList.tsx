'use client';

import React from 'react';
import { Todo } from '@/lib/todo';

interface Props {
  todos: Todo[];
  onToggle: (id: string) => void;
}

export default function TodoList({ todos, onToggle }: Props) {
  if (todos.length === 0) {
    return <div>No hay tareas</div>;
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id} className={todo.completed ? 'completed' : ''}>
          <label>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
            />
            {todo.title}
          </label>
        </li>
      ))}
    </ul>
  );
}