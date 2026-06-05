# Gherkin — el contrato ejecutable

> "Once the project-spec.md is done, I have it create a set of .feature
> files from the project-spec.md." Los `.feature` son lo que el humano
> aprueba en la puerta, y el mapa que el `tdd_craftsman` recorre.

Los archivos viven en `features/<name>.feature`, donde `<name>` coincide
con el campo `name` de `feature_list.json`.

## Estructura

```gherkin
Feature: <propósito en una frase>
  Como <rol> quiero <capacidad> para <beneficio>.   # contexto opcional

  @s1
  Scenario: <comportamiento observable>
    Given <estado de partida>
    When <acción concreta del usuario>
    Then <resultado medible: texto en pantalla / estado / error>

  @s2
  Scenario: <caso límite o error>
    Given ...
    When ...
    Then ...
```

## Reglas duras

- **Un `Scenario` por comportamiento observable**, incluidos los caminos de
  error (validación fallida, estado vacío). Si el `project-spec.md` menciona
  un caso límite, tiene su escenario.
- **Tags estables** `@s1`, `@s2`, … Son el identificador que el
  `tdd_craftsman` (mapa `@s → test`) y el `judge` (cobertura) citan.
- **Cada `Then` afirma algo medible.** Prohibido "el componente funciona". Se
  vale: "Then muestra '3 tareas'", "Then el input tiene clase 'error'",
  "Then la lista está vacía".
- **Un solo `When` por escenario** (la acción bajo prueba). Si necesitas
  dos acciones, probablemente son dos escenarios.
- **Sin detalles de implementación.** El `.feature` describe
  comportamiento, no funciones ni nombres de variables.

## Ejemplo (feature `todo_list_component`)

```gherkin
Feature: Lista de tareas
  Como usuario quiero ver mis tareas para saber qué tengo pendiente.

  @s1
  Scenario: Lista vacía muestra mensaje
    Given no hay tareas guardadas
    When renderizo el componente TodoList
    Then muestra el mensaje "No hay tareas"

  @s2
  Scenario: Lista con tareas muestra cada una
    Given hay 3 tareas guardadas
    When renderizo el componente TodoList
    Then muestra 3 items con título y checkbox

  @s3
  Scenario: Marcar tarea como completada
    Given hay una tarea pendiente
    When hago click en el checkbox de la tarea
    Then la tarea tiene clase "completed"
    And el checkbox está marcado
```

## De Gherkin a test

No usamos un runner BDD (`cucumber`, `jest-cucumber`) para no añadir
dependencias externas. En su lugar, cada `Scenario` se traduce **a mano** a
un test de Jest cuyo nombre cita el escenario:

```
@s1 → test_renders_empty_state_when_no_todos
@s2 → test_renders_list_with_todos
@s3 → test_marks_todo_as_completed_on_checkbox_click
```

El `tdd_craftsman` escribe estos tests uno a uno (Rojo→Verde→Refactor) y
deja el mapa en `progress/tdd_<name>.md`. Así el `.feature` sigue siendo la
fuente de verdad legible por el humano, sin pagar el coste de un framework.