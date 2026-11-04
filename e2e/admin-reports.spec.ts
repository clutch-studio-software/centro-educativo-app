import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

/**
 * Suite E2E: Central de Reportes Directivos (TPI Metodología II)
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
      page.getByRole('heading', { name: /central de reportes directivos/i })
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="reports-toolbar-container"]').getByText('TPI Metodología II')
    ).toBeVisible();

    // Toolbar de navegación con los 5 tabs oficiales
    await expect(page.locator('[data-testid="reports-tab-navigation"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-reporte-alumno"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-reporte-docente"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-alumnos-por-curso"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-docentes-por-materia"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-cursos-por-nivel"]')).toBeVisible();
  });

  test('Reporte 1: debe visualizar y operar el Reporte por Alumno con servicios y materias', async ({
    page,
  }) => {
    // Tab por alumno activo por defecto
    await expect(page.locator('[data-testid="report-alumno-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="input-search-student-report"]')).toBeVisible();

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

  test('Reporte 2: debe conmutar y mostrar el Reporte por Docente con cursos y horarios', async ({
    page,
  }) => {
    await page.locator('[data-testid="tab-reporte-docente"]').click();

    await expect(page.locator('[data-testid="report-docente-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="input-search-teacher-report"]')).toBeVisible();
    await expect(page.locator('[data-testid="report-teacher-header-card"]')).toBeVisible();

    // Tablas de cursos asignados y grilla horaria semanal
    await expect(page.locator('[data-testid="table-report-teacher-courses"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-report-teacher-schedules"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-export-csv"]')).toBeVisible();
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
