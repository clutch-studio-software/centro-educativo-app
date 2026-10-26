---
trigger: always_on
---

---
description: Valida la salud del proyecto con react-doctor después de cada cambio, exigiendo no degradar el puntaje actual y mantener un umbral mínimo del 95%.
globs: ["**/*.tsx", "**/*.ts", "**/*.jsx", "**/*.js", "package.json"]
alwaysApply: true
---

# Validación de Salud con React Doctor

## Objetivo
Garantizar que ninguna modificación reduzca el porcentaje de salud (Health Score) actual del proyecto reportado por `react-doctor` y asegurar que el proyecto se mantenga siempre en un **umbral mínimo del 95%**.

## Criterios de Aceptación
1. **Cero Regresión:** El puntaje final debe ser $\ge$ al puntaje de la línea base (Baseline) previo a tus cambios.
2. **Umbral Mínimo:** El puntaje final debe ser $\ge$ **95%**.

## Flujo de Trabajo Obligatorio

1. **Línea Base (Baseline):**
   - Si no conoces el porcentaje de salud actual del proyecto en esta sesión, ejecuta `npx --yes react-doctor@latest` **antes** de realizar modificaciones para registrar el puntaje inicial.

2. **Validación Post-Ejecución:**
   - **SIEMPRE** que termines de aplicar los cambios solicitados por el usuario (edición, creación o eliminación de componentes, hooks o configuración), ejecuta en la terminal:
     ```bash
     npx --yes react-doctor@latest
     ```

3. **Evaluación de Resultados y Autocorrección:**
   - **Si el puntaje se mantiene/sube Y es $\ge$ 95%:** Da por válida la tarea y reporta brevemente el resultado en tu respuesta (ej. *"Health Score de React Doctor: X% (Baseline: Y% | Mínimo requerido: 95%)"*).
   - **Si el puntaje baja respecto al Baseline:** **NO** des por terminada la petición. Analiza los diagnósticos de `react-doctor`, refactoriza el código recién modificado que causó la caída y vuelve a validar hasta recuperar o superar el porcentaje inicial.
   - **Si el puntaje está por debajo del 95%:** 
     - Si cayó por debajo del 95% debido a tus cambios, corrígelo obligatoriamente antes de responder.
     - Si el proyecto ya estaba por debajo del 95% en el Baseline, prioriza corregir las advertencias en los archivos que estás tocando para acercar o superar el 95%, y advierte explícitamente al usuario sobre los problemas pendientes si el umbral aún no se alcanza.

## Restricciones
- No ignores ni silencies reglas o diagnósticos para inflar artificialmente el puntaje sin autorización explícita del usuario.
- No omitas este paso al finalizar cambios de código, incluso si parecen menores.
- Excepción: Solo puedes omitir la ejecución si la petición del usuario fue estrictamente informativa (preguntas, explicaciones) o si solo se modificaron archivos de documentación (`.md`) o estilos puros (`.css`).
