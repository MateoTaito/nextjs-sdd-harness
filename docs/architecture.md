# Arquitectura — Qué significa "hacer un buen trabajo"

> Este documento define el estándar de calidad. Los agentes revisores
> evalúan código contra este archivo. Si no está aquí, no es un requisito.

## Principios

1. **Capas claras.** El proyecto tiene tres capas y solo tres:
   - `src/lib/` — lógica de negocio pura (modelos, utilidades).
   - `src/components/` — componentes React presentacionales.
   - `src/app/` — páginas y rutas de NextJS (App Router).
   No introducir capas adicionales (stores globales, contextos complejos) hasta
   que haya una razón concreta documentada en `feature_list.json`.

2. **Dependencias mínimas.** Solo NextJS, React y Tailwind CSS. Si una
   feature requiere una dependencia, primero se discute (estado `blocked`).

3. **Errores explícitos.** Las funciones que pueden fallar (validación,
   datos corruptos) lanzan errores descriptivos, no devuelven `undefined`.

4. **Inmutabilidad por defecto.** Los objetos de modelo son `readonly`.
   Modificar = crear una nueva instancia.

5. **Persistencia local.** localStorage para simplicidad. Nunca mezclar
   IO con lógica de dominio dentro de `src/lib/`.

## Flujo de datos

```
usuario  ─→  src/app/page.tsx (página principal)
               │
               ├─ usa src/components/AddTodo.tsx para crear
               │
               ├─ usa src/components/TodoList.tsx para mostrar
               │
               └─→  src/lib/storage.ts (localStorage)
                        │
                        └─→  localStorage.getItem/setItem
```

## Qué NO hacer

- No usar `console.log()` para errores. Usa estados de error en la UI.
- No mezclar IO con lógica de dominio dentro de `src/lib/`.
- No leer/escribir localStorage en cada operación dentro de un bucle.
  Carga al inicio, modifica en memoria, guarda al final.
- No añadir un sistema de configuración. La clave de localStorage se pasa
  explícitamente o usa la constante por defecto.