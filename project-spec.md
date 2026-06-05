# project-spec.md — nextjs-todo

> Especificación **conversada**, no dictada. Cada sección nace de un debate
> entre el humano y el `spec_partner`: qué hace, cuál es el contrato exacto,
> qué casos límite existen y qué alternativas se descartaron y por qué.
> De aquí el `gherkin_author` destila `features/<name>.feature`.

## Propósito del proyecto

`nextjs-todo` es una aplicación de gestión de tareas construida con NextJS.
El código es deliberadamente simple: el repo enseña **proceso** (Harness
Engineering, edición artesano) usando un stack JavaScript/TypeScript moderno.

## Decisiones globales

- **NextJS 14+ con App Router.** Usamos la estructura de carpetas `src/app/`
  para rutas y componentes. *Alternativa descartada:* Pages Router — más
  simple, pero App Router es el estándar actual.
- **TypeScript estricto.** Todo el código en `.ts`/`.tsx` con `strict: true`
  en `tsconfig.json`. *Razón:* detección temprana de errores, mejor DX.
- **Almacenamiento local (localStorage).** Persistencia en el navegador,
  sin backend. *Razón:* simplicidad, no requiere base de datos. *Alternativa
  descartada:* API routes + base de datos — más realista, pero complejiza
  el demo.
- **Sin dependencias externas de UI.** Solo Tailwind CSS para estilos.
  *Razón:* mantener el harness reproducible. *Alternativa descartada:*
  componentes UI como shadcn/ui — más ergonómico, pero introduce
  dependencias.
- **Testing con Jest + React Testing Library.** Estándar del ecosistema
  React. *Alternativa descartada:* Vitest — más rápido, pero menos maduro.
- **Contrato de errores uniforme.** Los errores de validación se muestran
  en la UI, no como excepciones. Las funciones puras lanzan errores
  descriptivos.

## Modelo de datos

```typescript
interface Todo {
  id: string;        // UUID o timestamp-based
  title: string;     // Texto de la tarea
  completed: boolean; // Estado de completado
  createdAt: string; // ISO 8601
}
```

## Features pendientes (aún sin debatir en detalle)

- `local_storage_setup` (#1) — capa de persistencia.
- `todo_model` (#2) — modelo de datos.
- `todo_list_component` (#3) — componente de lista.
- `add_todo_form` (#4) — formulario de agregar.
- `todo_page` (#5) — página principal.
- `delete_todo` (#6) — eliminar tarea.
- `filter_todos` (#7) — filtrar tareas.

Cada una entrará por su propia conversación con el `spec_partner` antes de
tener `.feature`.

## Preguntas abiertas

_(ninguna por ahora)_