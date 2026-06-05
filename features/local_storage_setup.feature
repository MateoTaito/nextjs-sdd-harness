Feature: Configuración de almacenamiento local
  Como desarrollador quiero una capa de persistencia para guardar tareas en localStorage.

  @s1
  Scenario: Cargar tareas cuando no hay datos guardados
    Given no hay datos en localStorage
    When llamo a loadTasks()
    Then devuelve un array vacío

  @s2
  Scenario: Guardar y cargar tareas
    Given hay 2 tareas guardadas en localStorage
    When llamo a loadTasks()
    Then devuelve las 2 tareas guardadas

  @s3
  Scenario: Guardar tareas sobreescribe datos anteriores
    Given hay 1 tarea guardada en localStorage
    When guardo 3 tareas nuevas
    Then loadTasks() devuelve las 3 tareas nuevas