import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

/**
 * Suite E2E: Central de Reportes Directivos (BETA)
 * Ruta: /admin/reportes
 */
test.describe('Validación de la Central de Reportes Directivos (/admin/reportes)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    // Navegar a la pantalla de reportes a través de la barra lateral
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await sidebar.getByText(/reportes directivos/i).click();
    await expect(page).toHaveURL(/\/admin\/reportes/);
    await expect(page.locator('[data-testid="admin-reports-page"]')).toBeVisible();
  });

  test('debe cargar la vista general y barra de navegación de 5 reportes', async ({ page }) => {
    // Encabezado institucional
    await expect(
      page.getByText('Central de Reportes Directivos')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="reports-toolbar-container"]').getByText('BETA')
    ).toBeVisible();

    // Toolbar de navegación con los 5 tabs oficiales
    await expect(page.locator('[data-testid="reports-tab-navigation"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-reporte-alumno"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-reporte-docente"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-alumnos-por-curso"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-docentes-por-materia"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-cursos-por-nivel"]')).toBeVisible();
  });

  test('Reporte 1: debe visualizar estado inicial en blanco y cargar alumno tras búsqueda', async ({
    page,
  }) => {
    // Tab por alumno activo por defecto con estado inicial en blanco
    await expect(page.locator('[data-testid="report-alumno-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="input-search-student-report"]')).toBeVisible();
    await expect(page.locator('[data-testid="report-student-empty"]')).toBeVisible();

    // Buscar y seleccionar un estudiante
    await page.locator('[data-testid="input-search-student-report"]').fill('Gael');
    const firstResult = page.locator('button[data-testid^="select-student-result-"]').first();
    await expect(firstResult).toBeVisible();
    await firstResult.click();

    // Verificación de tarjetas de servicios escolares integrados
    await expect(page.locator('[data-testid="card-report-cursado"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-report-transporte"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-report-comedor"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-report-deportes"]')).toBeVisible();

    // Tabla de materias del alumno y docentes a cargo
    await expect(page.locator('[data-testid="table-report-student-subjects"]')).toBeVisible();

    // Acciones de exportación
    await expect(page.locator('[data-testid="btn-export-csv"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-print-report"]')).toBeVisible();
  });

  test('Reporte 2: debe conmutar y mostrar estado en blanco hasta seleccionar docente', async ({
    page,
  }) => {
    await page.locator('[data-testid="tab-reporte-docente"]').click();

    await expect(page.locator('[data-testid="report-docente-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="input-search-teacher-report"]')).toBeVisible();
    await expect(page.locator('[data-testid="report-teacher-empty"]')).toBeVisible();

    // Buscar y seleccionar un docente
    await page.locator('[data-testid="input-search-teacher-report"]').fill('a');
    const firstTeacherResult = page.locator('button[data-testid^="select-teacher-result-"]').first();
    await expect(firstTeacherResult).toBeVisible();
    await firstTeacherResult.click();

    // Verificación de ficha de perfil y secciones de cursos y horarios
    await expect(page.locator('[data-testid="report-teacher-header-card"]')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /cursos a cargo por nivel educativo/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /horarios semanales de dictado/i })
    ).toBeVisible();

    await expect(page.locator('[data-testid="btn-export-csv"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-print-report"]')).toBeVisible();

    // Validar botón "Cambiar" para resetear la selección y volver al estado en blanco
    await page.locator('[data-testid="btn-change-teacher-report"]').click();
    await expect(page.locator('[data-testid="report-teacher-empty"]')).toBeVisible();
  });

  test('Reporte 3: debe conmutar y filtrar el Listado de Alumnos por Curso', async ({
    page,
  }) => {
    await page.locator('[data-testid="tab-alumnos-por-curso"]').click();

    await expect(page.locator('[data-testid="report-alumnos-curso-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="select-report-nivel"]')).toBeVisible();
    await expect(page.locator('[data-testid="select-report-curso"]')).toBeVisible();
    await expect(page.locator('[data-testid="input-search-student-course"]')).toBeVisible();

    // Tabla de alumnos por curso con columnas de servicios
    await expect(page.locator('[data-testid="table-report-alumnos-curso"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-export-csv"]')).toBeVisible();
  });

  test('Reporte 4: debe conmutar y filtrar el Listado de Docentes por Materia con vacantes', async ({
    page,
  }) => {
    await page.locator('[data-testid="tab-docentes-por-materia"]').click();

    await expect(page.locator('[data-testid="report-docentes-materia-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="select-materia-nivel"]')).toBeVisible();
    await expect(page.locator('[data-testid="input-search-materia"]')).toBeVisible();

    // Tabla de asignaciones docentes por materia
    await expect(page.locator('[data-testid="table-report-docentes-materia"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-export-csv"]')).toBeVisible();
  });

  test('Reporte 5: debe conmutar y mostrar el Listado de Cursos por Nivel con ocupación', async ({
    page,
  }) => {
    await page.locator('[data-testid="tab-cursos-por-nivel"]').click();

    await expect(page.locator('[data-testid="report-cursos-nivel-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-filter-nivel-todos"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-filter-nivel-inicial"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-filter-nivel-primario"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-filter-nivel-secundario"]')).toBeVisible();

    // Tabla de cursos con capacidades, inscriptos y % de ocupación
    await expect(page.locator('[data-testid="table-report-cursos-nivel"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-export-csv"]')).toBeVisible();
  });
});
