import { render, screen, fireEvent } from '@testing-library/react';
import TodoList from '../src/components/TodoList';
import { Todo } from '../src/lib/todo';

describe('TodoList', () => {
  test('renders empty state when no todos', () => {
    render(<TodoList todos={[]} onToggle={jest.fn()} />);
    expect(screen.getByText('No hay tareas')).toBeInTheDocument();
  });

  test('renders list with todos', () => {
    const todos: Todo[] = [
      { id: '1', title: 'Task 1', completed: false, createdAt: '2024-01-01T00:00:00.000Z' },
      { id: '2', title: 'Task 2', completed: true, createdAt: '2024-01-02T00:00:00.000Z' },
      { id: '3', title: 'Task 3', completed: false, createdAt: '2024-01-03T00:00:00.000Z' },
    ];
    
    render(<TodoList todos={todos} onToggle={jest.fn()} />);
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  test('calls onToggle when checkbox is clicked', () => {
    const onToggle = jest.fn();
    const todos: Todo[] = [
      { id: '1', title: 'Task 1', completed: false, createdAt: '2024-01-01T00:00:00.000Z' },
    ];
    
    render(<TodoList todos={todos} onToggle={onToggle} />);
    
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('1');
  });

  test('completed todo has completed class', () => {
    const todos: Todo[] = [
      { id: '1', title: 'Task 1', completed: true, createdAt: '2024-01-01T00:00:00.000Z' },
    ];
    
    render(<TodoList todos={todos} onToggle={jest.fn()} />);
    
    const li = screen.getByRole('listitem');
    expect(li).toHaveClass('completed');
  });
});