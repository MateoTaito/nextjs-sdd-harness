# Verificación — Cómo demostrar que el trabajo funciona

> Regla de oro: **el agente no dice "funciona", lo demuestra**.
> Toda feature termina con evidencia ejecutable, no con afirmaciones.

## Niveles de verificación

### Nivel 1 — Tests unitarios (obligatorio)

Toda función pública en `src/lib/` tiene al menos un test en `tests/` que:

1. Cubre el camino feliz.
2. Cubre al menos un camino de error si la función puede fallar.

Comando:
```bash
npm test
```

### Nivel 2 — Test de componentes (obligatorio para features de UI)

Las features que añaden componentes se verifican con React Testing Library:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import AddTodo from '@/components/AddTodo';

test('calls onAdd with title when submitted', () => {
  const onAdd = jest.fn();
  render(<AddTodo onAdd={onAdd} />);
  
  fireEvent.change(screen.getByLabelText('Título'), {
    target: { value: 'Nueva tarea' }
  });
  fireEvent.click(screen.getByText('Agregar'));
  
  expect(onAdd).toHaveBeenCalledWith('Nueva tarea');
});
```

### Nivel 3 — Smoke test manual (opcional pero recomendado)

Antes de cerrar la sesión, ejecuta la app en desarrollo:

```bash
npm run dev
# Abrir http://localhost:3000
# Crear, completar y eliminar una tarea manualmente
```

### Nivel 4 — Trazabilidad de escenarios (obligatorio para features con `"sdd": true`)

Cada escenario `@s` de `features/<name>.feature` debe poder mapearse a al
menos un test concreto en `tests/`. El `judge` rechaza si falta cobertura.

El `tdd_craftsman` documenta el mapa en `progress/tdd_<name>.md`:

```markdown
## Trazabilidad
- @s1 (lista vacía → mensaje) → test_renders_empty_state
- @s2 (agregar tarea → aparece en lista) → test_adds_todo_to_list
- @s3 (marcar completada → se tacha) → test_marks_todo_completed
```

### Nivel 5 — Prueba de mutación (obligatorio para cerrar una feature sdd)

Una suite verde no basta: hay que demostrar que los tests **muerden**. El
`mutation_tester` corre el mutador y exige el umbral de
`docs/mutation-testing.md`:

```bash
node tools/mutate.js src/components/TodoList.tsx
```

Todo mutante sobreviviente se mata con un test nuevo o se justifica como
equivalente en `progress/mutation_<name>.md`.

## Anti-patrones (no hacer)

- ❌ "He añadido el componente, debería funcionar." → falta test ejecutable.
- ❌ Test que solo verifica que el componente no lanza excepción. → tiene que
  comprobar el resultado concreto.
- ❌ Mock excesivo de localStorage. → usa `jest.spyOn(Storage.prototype, ...)`.
- ❌ Marcar la feature como `done` sin pasar `./init.sh`.

## Verificación final antes de cerrar

```bash
./init.sh                       # debe terminar con [OK] Entorno listo
node tools/mutate.js src/path   # score por encima del umbral
```

Si `./init.sh` está rojo o sobreviven mutantes sin justificar, **no**
marques nada como `done`. Anota el bloqueo en `progress/current.md` con
estado `blocked` en `feature_list.json`.