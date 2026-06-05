import { render, screen, fireEvent } from '@testing-library/react';
import AddTodo from '../src/components/AddTodo';

describe('AddTodo', () => {
  test('renders input and button', () => {
    render(<AddTodo onAdd={jest.fn()} />);
    
    expect(screen.getByLabelText('Título')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeInTheDocument();
  });

  test('calls onAdd with title when submitted', () => {
    const onAdd = jest.fn();
    render(<AddTodo onAdd={onAdd} />);
    
    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Nueva tarea' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    
    expect(onAdd).toHaveBeenCalledWith('Nueva tarea');
  });

  test('clears input after submission', () => {
    render(<AddTodo onAdd={jest.fn()} />);
    
    const input = screen.getByLabelText('Título');
    fireEvent.change(input, { target: { value: 'Nueva tarea' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    
    expect(input).toHaveValue('');
  });

  test('shows error when title is empty', () => {
    render(<AddTodo onAdd={jest.fn()} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    
    expect(screen.getByText('El título no puede estar vacío')).toBeInTheDocument();
  });

  test('clears error when user starts typing', () => {
    render(<AddTodo onAdd={jest.fn()} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    expect(screen.getByText('El título no puede estar vacío')).toBeInTheDocument();
    
    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'N' },
    });
    
    expect(screen.queryByText('El título no puede estar vacío')).not.toBeInTheDocument();
  });
});