# Convenciones de código

> Homogeneidad extrema. La IA predice mejor cuando el repositorio se parece
> a sí mismo en todas partes.

## Estilo TypeScript/React

- **Versión:** TypeScript 5+ con `strict: true`.
- **Formato:** Prettier con configuración por defecto. Líneas máximo 100 caracteres.
- **Imports:** React primero, luego NextJS, luego locales. Una línea por módulo.
- **Strings:** comillas simples `'...'` siempre. Comillas dobles solo
  para escapar comillas simples dentro.
- **Template literals** para interpolación. Nada de concatenación con `+`.

## Nombres

| Tipo                    | Convención        | Ejemplo               |
|-------------------------|-------------------|-----------------------|
| Archivos                | `PascalCase.tsx`  | `TodoList.tsx`        |
| Componentes             | `PascalCase`      | `TodoList`            |
| Funciones / variables   | `camelCase`       | `loadTasks`           |
| Constantes              | `UPPER_SNAKE`     | `DEFAULT_TODO_KEY`    |
| Interfaces              | `PascalCase`      | `Todo`                |
| Hooks                   | `use` + `PascalCase` | `useTodos`         |

## Estructura de archivo

Cada componente en `src/components/` empieza con:

```typescript
'use client'; // Si es cliente

import React from 'react';

interface Props {
  // props
}

export default function ComponentName({ prop1, prop2 }: Props) {
  // hooks
  // lógica
  // return JSX
}
```

## Tests

- Un archivo de test por componente: `tests/ComponentName.test.tsx`.
- Una función `describe('ComponentName', () => {...})` por componente.
- Cada test usa `render()` de React Testing Library y limpia con `cleanup()`.
- Nombres de test descriptivos: `test renders empty state when no todos`.

## Manejo de errores

Errores de validación en componentes:

```typescript
const [error, setError] = useState<string | null>(null);

// En submit
if (!title.trim()) {
  setError('El título no puede estar vacío');
  return;
}
```

Los errores se muestran en la UI, no como excepciones no capturadas.

## Comentarios

Por defecto **no** se escriben. Solo se permiten cuando explican un *por qué*
no obvio (p. ej. workaround documentado, invariante sutil). Los nombres deben
hacer el resto.