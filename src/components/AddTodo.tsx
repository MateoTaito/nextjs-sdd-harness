'use client';

import React, { useState } from 'react';

interface Props {
  onAdd: (title: string) => void;
}

export default function AddTodo({ onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('El título no puede estar vacío');
      return;
    }
    
    onAdd(title.trim());
    setTitle('');
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Título</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Nueva tarea..."
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit">Agregar</button>
    </form>
  );
}