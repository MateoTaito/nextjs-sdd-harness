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

### Runners soportados

```bash
# Jest (default)
node tools/mutate.js src/components/TodoList.tsx

# Node.js native test runner
node tools/mutate.js src/lib/storage.ts --runner=node

# Solo verificación de tipos (TypeScript)
node tools/mutate.js src/lib/storage.ts --runner=tsc
```

El script detecta automáticamente el directorio del package y busca la
configuración de tests más cercana.

### Mutaciones estándar

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

## Modo mutación manual

Cuando Stryker no soporta el test runner del repo (ej: `node:test`,
type assertions `.test-d.ts`), el `mutation_tester` puede hacer
**mutación manual**:

### Protocolo

1. Para cada archivo tocado, identifica 2-3 mutaciones candidatas:
   - Cambiar un valor (status code, string, número)
   - Invertir una condición (`===` → `!==`, `>` → `<=`)
   - Eliminar un statement (return, assign, call)
   - Reemplazar un método por otro

2. Para cada mutación:
   a. **Aplica** la mutación en el archivo.
   b. **Ejecuta** los tests (`npx tsx --test`, `tsc --noEmit`, etc.).
   c. Si algún test falla → **KILLED**.
   d. Si todos pasan → **SURVIVED** (documenta como agujero).
   e. **Restaura** el archivo original.

3. Documenta en `progress/mutation_<name>.md`.

### Cuándo usar mutación manual

- Tests usan `node:test` (no Jest)
- Tests son type assertions (`.test-d.ts`)
- Tests son verificaciones de inspección (grep, lectura de archivos)
- Stryker no está configurado en el package

## Modo schema

Para features de schema + migración + seeder:

1. Los "tests" son verificaciones (SQL, inspección, exit codes).
2. La mutación se hace **manualmente** sobre el schema/seeder.
3. Ejemplos:
   - Cambiar `onDelete: Cascade` → `onDelete: Restrict`
   - Cambiar `@unique` → sin `@unique`
   - Eliminar una relación del schema
4. Verificar que la verificación correspondiente falla.

## Configuración

La configuración de Stryker está en `tools/stryker.conf.js`. Incluye:
- Solo el archivo objetivo (no toda la app)
- Jest como runner de tests (default)
- TypeScript checker para compilar

Para otros runners, el script `tools/mutate.js` genera una configuración
temporal automáticamente.

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
