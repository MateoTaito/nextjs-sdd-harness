# nextjs-sdd-harness

Harness SDD (Specification-Driven Development) para proyectos NextJS, basado en el flujo de Robert C. Martin.

## Características

- **NextJS 14+** con App Router
- **TypeScript** estricto
- **Jest + React Testing Library** para pruebas
- **Stryker Mutator** para pruebas de mutación
- **Tailwind CSS** para estilos
- **Almacenamiento local** (localStorage) para persistencia

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Ejecutar en desarrollo
npm run dev

# Verificación completa
./init.sh
```

## Estructura del proyecto

```
nextjs-sdd-harness/
├── .agents/agents/          # Agentes para opencode
├── docs/                    # Documentación del proceso
├── features/                # Escenarios Gherkin
├── progress/                # Estado de sesiones
├── src/                     # Código NextJS
│   ├── app/                 # Páginas (App Router)
│   ├── components/          # Componentes React
│   └── lib/                 # Utilidades
├── tests/                   # Pruebas Jest
├── tools/                   # Mutador Stryker
├── init.sh                  # Script de verificación
└── package.json             # Dependencias
```

## Flujo de trabajo

El harness implementa el flujo SDD:

1. **Spec Partner** — conversa y debate la especificación
2. **Gherkin Author** — destila escenarios Gherkin
3. **TDD Craftsman** — ciclo Rojo-Verde-Refactor
4. **Judge** — review y aprobación
5. **Mutation Tester** — valida que los tests muerden

Ver `docs/workflow.md` para detalles.

## Scripts

- `npm test` — Ejecutar pruebas
- `npm run dev` — Servidor de desarrollo
- `npm run build` — Build de producción
- `npm run mutate` — Ejecutar pruebas de mutación

## Requisitos

- Node.js ≥ 18
- npm ≥ 9# nextjs-sdd-harness
