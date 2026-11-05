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

  test('Scenario: Visualizar barra de navegación y los 9 reportes oficiales disponibles', async ({ page }) => {
    // Given el usuario administrador en la consola de reportes
    await expect(page.getByText('Central de Reportes Directivos')).toBeVisible();
    await expect(reportsPage.toolbarContainer.getByText('BETA')).toBeVisible();

    // Then la barra de navegación debe listar los 9 accesos directos oficiales del TPI
    await expect(reportsPage.tabNavigation).toBeVisible();
    for (const tabId of [
      'reporte-alumno',
      'reporte-docente',
      'alumnos-por-curso',
      'docentes-por-materia',
      'cursos-por-nivel',
      'alumnos-por-deporte',
      'deporte-por-nivel',
      'deportes-horarios-profesor',
      'transporte-por-recorrido',
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

  test('Scenario: Reporte 6 - Nómina de alumnos por disciplina deportiva', async () => {
    // When se navega a alumnos por deporte
    await reportsPage.switchTab('alumnos-por-deporte');

    // Then deben mostrarse los selectores, buscador y tabla de inscriptos
    await expect(reportsPage.sportsStudentsContainer).toBeVisible();
    await expect(reportsPage.sportFilterSelect).toBeVisible();
    await expect(reportsPage.sportStudentSearchInput).toBeVisible();
    await expect(reportsPage.sportsStudentsTable).toBeVisible();
    await expect(reportsPage.exportCsvBtn).toBeVisible();
  });

  test('Scenario: Reporte 7 - Cruce dimensional de deportes por nivel educativo', async () => {
    // When se navega al reporte de deporte por nivel
    await reportsPage.switchTab('deporte-por-nivel');

    // Then debe renderizarse el contenedor cruzado y la nómina
    await expect(reportsPage.sportsByLevelContainer).toBeVisible();
    await expect(reportsPage.sportsByLevelTable).toBeVisible();
    await expect(reportsPage.exportCsvBtn).toBeVisible();
  });

  test('Scenario: Reporte 8 - Detalle de deportes con horarios, profesores y cupos', async () => {
    // When se navega al detalle de deportes y profesores
    await reportsPage.switchTab('deportes-horarios-profesor');

    // Then se listan las tarjetas técnicas con franjas horarias y cupos
    await expect(reportsPage.sportsProfContainer).toBeVisible();
    await expect(reportsPage.sportsProfSearchInput).toBeVisible();
    await expect(reportsPage.exportCsvBtn).toBeVisible();
  });

  test('Scenario: Reporte 9 - Nómina de alumnos por los 4 recorridos de transporte escolar', async ({ page }) => {
    // When se navega al reporte de transporte escolar
    await reportsPage.switchTab('transporte-por-recorrido');

    // Then deben figurar las tarjetas de los 4 recorridos y la tabla oficial
    await expect(reportsPage.transportContainer).toBeVisible();
    for (const rKey of ['recorrido-1', 'recorrido-2', 'recorrido-3', 'recorrido-4']) {
      await expect(page.locator(`[data-testid="card-route-stat-${rKey}"]`)).toBeVisible();
    }
    await expect(reportsPage.transportRouteSelect).toBeVisible();
    await expect(reportsPage.transportSearchInput).toBeVisible();
    await expect(reportsPage.transportTable).toBeVisible();
    await expect(reportsPage.exportCsvBtn).toBeVisible();
  });
});
