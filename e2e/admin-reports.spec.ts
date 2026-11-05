import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';
import { AdminReportsPage } from './pages/AdminReportsPage';

/**
 * Feature: Central de Reportes Directivos Institucionales
 * Ruta: /admin/reportes
 */
test.describe('Feature: Central de Reportes Directivos (/admin/reportes)', () => {
  let reportsPage: AdminReportsPage;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    reportsPage = new AdminReportsPage(page);
    await reportsPage.goto();
  });

  test('Scenario: Visualizar barra de navegación y los 5 reportes disponibles', async ({ page }) => {
    // Given el usuario administrador en la consola de reportes
    await expect(page.getByText('Central de Reportes Directivos')).toBeVisible();
    await expect(reportsPage.toolbarContainer.getByText('BETA')).toBeVisible();

    // Then la barra de navegación debe listar los 5 accesos directos oficiales
    await expect(reportsPage.tabNavigation).toBeVisible();
    for (const tabId of [
      'reporte-alumno',
      'reporte-docente',
      'alumnos-por-curso',
      'docentes-por-materia',
      'cursos-por-nivel',
    ]) {
      await expect(page.locator(`[data-testid="tab-${tabId}"]`)).toBeVisible();
    }
  });

  test('Scenario: Reporte 1 - Buscar un alumno y visualizar ficha consolidada', async ({ page }) => {
    // Given que el reporte de alumno inicia en blanco
    await expect(reportsPage.studentReportContainer).toBeVisible();
    await expect(reportsPage.studentEmptyState).toBeVisible();

    // When se busca y selecciona un alumno por su nombre
    await reportsPage.searchStudent('Gael');

    // Then deben mostrarse sus tarjetas de servicios escolares y materias
    for (const cardId of [
      'card-report-cursado',
      'card-report-transporte',
      'card-report-comedor',
      'card-report-deportes',
    ]) {
      await expect(page.locator(`[data-testid="${cardId}"]`)).toBeVisible();
    }
    await expect(reportsPage.subjectsTable).toBeVisible();
    await expect(reportsPage.exportCsvBtn).toBeVisible();
    await expect(reportsPage.printReportBtn).toBeVisible();
  });

  test('Scenario: Reporte 2 - Buscar un docente y conmutar selección', async ({ page }) => {
    // When el usuario accede a la pestaña de reporte docente
    await reportsPage.switchTab('reporte-docente');

    // Then debe iniciar en blanco
    await expect(reportsPage.teacherReportContainer).toBeVisible();
    await expect(reportsPage.teacherEmptyState).toBeVisible();

    // When se busca un docente por nombre o legajo
    await reportsPage.searchTeacher('a');

    // Then se cargan sus cursos asignados y grilla horaria
    await expect(reportsPage.teacherHeaderCard).toBeVisible();
    await expect(page.getByRole('heading', { name: /cursos a cargo por nivel educativo/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /horarios semanales de dictado/i })).toBeVisible();

    // When el usuario hace clic en cambiar docente
    await reportsPage.changeTeacherBtn.click();

    // Then regresa al estado en blanco
    await expect(reportsPage.teacherEmptyState).toBeVisible();
  });

  test('Scenario: Reporte 3 - Listado de alumnos agrupados y ordenados por curso', async () => {
    // When se navega a alumnos por curso
    await reportsPage.switchTab('alumnos-por-curso');

    // Then deben estar disponibles los controles de filtro y la nómina
    await expect(reportsPage.studentsByCourseContainer).toBeVisible();
    await expect(reportsPage.nivelSelect).toBeVisible();
    await expect(reportsPage.courseSelect).toBeVisible();
    await expect(reportsPage.studentCourseSearchInput).toBeVisible();
    await expect(reportsPage.studentsByCourseTable).toBeVisible();
    await expect(reportsPage.exportCsvBtn).toBeVisible();
  });

  test('Scenario: Reporte 4 - Directorio de docentes por materia y detección de vacantes', async () => {
    // When se navega a docentes por materia
    await reportsPage.switchTab('docentes-por-materia');

    // Then debe presentarse el selector de nivel, buscador y grilla de asignaciones
    await expect(reportsPage.teachersBySubjectContainer).toBeVisible();
    await expect(reportsPage.subjectNivelSelect).toBeVisible();
    await expect(reportsPage.subjectSearchInput).toBeVisible();
    await expect(reportsPage.teachersBySubjectTable).toBeVisible();
    await expect(reportsPage.exportCsvBtn).toBeVisible();
  });

  test('Scenario: Reporte 5 - Ocupación de cursos por nivel educativo y turnos', async ({ page }) => {
    // When se ingresa al reporte de cursos por nivel
    await reportsPage.switchTab('cursos-por-nivel');

    // Then deben listarse los filtros de nivel y la tabla de ocupación
    await expect(reportsPage.coursesByLevelContainer).toBeVisible();
    for (const lvl of ['todos', 'inicial', 'primario', 'secundario']) {
      await expect(page.locator(`[data-testid="btn-filter-nivel-${lvl}"]`)).toBeVisible();
    }
    await expect(reportsPage.coursesByLevelTable).toBeVisible();
    await expect(reportsPage.exportCsvBtn).toBeVisible();
  });
});
