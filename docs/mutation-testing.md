# Prueba de mutación — validar que los tests muerden

> "Mutation testing is resource-heavy, but the ROI on code correctness is
> worth every cycle." / "We are shifting from a bottleneck of human typing
> speed to a bottleneck of compute-driven validation."

## El problema que resuelve

Una suite verde dice "el código no explota con estas entradas". **No** dice
"los tests fallarían si el código estuviera mal". Un test sin asserts
fuertes pasa siempre y no protege nada.

La prueba de mutación lo mide al revés: introduce un defecto pequeño en el
código (un *mutante*) y observa la suite.

- Si **algún test falla** → el mutante está **muerto** (killed). Bien: la
  red atrapó el defecto.
- Si **todos los tests pasan** → el mutante **sobrevive** (survived). Mal:
  hay un agujero. Falta un assert o un caso.

**Puntuación de mutación** = `killed / total`. Cuanto más alta, más muerden
los tests.

## El mutador de este repo: Stryker Mutator

Usamos Stryker Mutator, la herramienta estándar para mutación en
JavaScript/TypeScript. El script wrapper `tools/mutate.js` ejecuta Stryker
sobre un archivo específico.

```bash
node tools/mutate.js src/components/TodoList.tsx
node tools/mutate.js src/lib/storage.ts
```

Stryker aplica mutaciones como:
- Cambiar operadores (`+` → `-`, `===` → `!==`)
- Negar condiciones (`a > b` → `a <= b`)
- Eliminar statements
- Cambiar literales (`true` → `false`)

El script **restaura siempre** el archivo original (Stryker lo hace
automáticamente).

## El umbral

- Por defecto, la feature exige **100% de mutantes muertos sobre las líneas
  nuevas o tocadas** por esa feature.
- Para código heredado no tocado por la feature, no se exige umbral en esta
  rama (se mide, no se bloquea).
- Un mutante **equivalente** (no cambia el comportamiento observable; p. ej.
  mutar un valor que nunca se usa) puede excluirse, pero **solo** con
  justificación explícita escrita en `progress/mutation_<name>.md`. Abusar
  de esta vía es hacer trampa al juez.

## Configuración

La configuración de Stryker está en `tools/stryker.conf.js`. Incluye:
- Solo el archivo objetivo (no toda la app)
- Jest como runner de tests
- TypeScript checker para compilar

## Quién hace qué

- El `mutation_tester` **mide** y reporta. No edita código.
- Un mutante sobreviviente es trabajo del `tdd_craftsman`: escribe el test
  rojo que lo mata y vuelve a pasar por el `judge`. Es el ciclo de mejora
  compute-bound: el CPU encuentra el hueco, el artesano lo tapa con un test.

## Por qué vale el coste

Reejecutar toda la suite por cada mutante es caro. Pero ese es justo el
desplazamiento que describe el hilo: el límite ya no es lo rápido que
teclea un humano, sino cuánta validación puede pagar tu CPU. La corrección
del código es el retorno, y compensa cada ciclo.