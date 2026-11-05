import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model (POM) para la Central de Reportes Directivos (/admin/reportes)
 */
export class AdminReportsPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly pageContainer: Locator;
  readonly toolbarContainer: Locator;
  readonly tabNavigation: Locator;
  readonly exportCsvBtn: Locator;
  readonly printReportBtn: Locator;

  // Reporte 1: Alumno
  readonly studentReportContainer: Locator;
  readonly studentSearchInput: Locator;
  readonly studentEmptyState: Locator;
  readonly studentHeaderCard: Locator;
  readonly subjectsTable: Locator;

  // Reporte 2: Docente
  readonly teacherReportContainer: Locator;
  readonly teacherSearchInput: Locator;
  readonly teacherEmptyState: Locator;
  readonly teacherHeaderCard: Locator;
  readonly changeTeacherBtn: Locator;

  // Reporte 3: Alumnos por Curso
  readonly studentsByCourseContainer: Locator;
  readonly nivelSelect: Locator;
  readonly courseSelect: Locator;
  readonly studentCourseSearchInput: Locator;
  readonly studentsByCourseTable: Locator;

  // Reporte 4: Docentes por Materia
  readonly teachersBySubjectContainer: Locator;
  readonly subjectNivelSelect: Locator;
  readonly subjectSearchInput: Locator;
  readonly teachersBySubjectTable: Locator;

  // Reporte 5: Cursos por Nivel
  readonly coursesByLevelContainer: Locator;
  readonly coursesByLevelTable: Locator;

  // Reporte 6: Alumnos por Deporte
  readonly sportsStudentsContainer: Locator;
  readonly sportFilterSelect: Locator;
  readonly sportStudentSearchInput: Locator;
  readonly sportsStudentsTable: Locator;

  // Reporte 7: Deporte por Nivel
  readonly sportsByLevelContainer: Locator;
  readonly sportsByLevelTable: Locator;

  // Reporte 8: Deportes, Horarios y Profesores
  readonly sportsProfContainer: Locator;
  readonly sportsProfSearchInput: Locator;

  // Reporte 9: Alumnos por Recorrido de Transporte
  readonly transportContainer: Locator;
  readonly transportRouteSelect: Locator;
  readonly transportSearchInput: Locator;
  readonly transportTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('[data-testid="admin-sidebar"]');
    this.pageContainer = page.locator('[data-testid="admin-reports-page"]');
    this.toolbarContainer = page.locator('[data-testid="reports-toolbar-container"]');
    this.tabNavigation = page.locator('[data-testid="reports-tab-navigation"]');
    this.exportCsvBtn = page.locator('[data-testid="btn-export-csv"]');
    this.printReportBtn = page.locator('[data-testid="btn-print-report"]');

    this.studentReportContainer = page.locator('[data-testid="report-alumno-container"]');
    this.studentSearchInput = page.locator('[data-testid="input-search-student-report"]');
    this.studentEmptyState = page.locator('[data-testid="report-student-empty"]');
    this.studentHeaderCard = page.locator('[data-testid="report-student-header-card"]');
    this.subjectsTable = page.locator('[data-testid="table-report-student-subjects"]');

    this.teacherReportContainer = page.locator('[data-testid="report-docente-container"]');
    this.teacherSearchInput = page.locator('[data-testid="input-search-teacher-report"]');
    this.teacherEmptyState = page.locator('[data-testid="report-teacher-empty"]');
    this.teacherHeaderCard = page.locator('[data-testid="report-teacher-header-card"]');
    this.changeTeacherBtn = page.locator('[data-testid="btn-change-teacher-report"]');

    this.studentsByCourseContainer = page.locator('[data-testid="report-alumnos-curso-container"]');
    this.nivelSelect = page.locator('[data-testid="select-report-nivel"]');
    this.courseSelect = page.locator('[data-testid="select-report-curso"]');
    this.studentCourseSearchInput = page.locator('[data-testid="input-search-student-course"]');
    this.studentsByCourseTable = page.locator('[data-testid="table-report-alumnos-curso"]');

    this.teachersBySubjectContainer = page.locator('[data-testid="report-docentes-materia-container"]');
    this.subjectNivelSelect = page.locator('[data-testid="select-materia-nivel"]');
    this.subjectSearchInput = page.locator('[data-testid="input-search-materia"]');
    this.teachersBySubjectTable = page.locator('[data-testid="table-report-docentes-materia"]');

    this.coursesByLevelContainer = page.locator('[data-testid="report-cursos-nivel-container"]');
    this.coursesByLevelTable = page.locator('[data-testid="table-report-cursos-nivel"]');

    this.sportsStudentsContainer = page.locator('[data-testid="report-alumnos-deporte-container"]');
    this.sportFilterSelect = page.locator('[data-testid="select-filter-sport"]');
    this.sportStudentSearchInput = page.locator('[data-testid="input-search-sport-students"]');
    this.sportsStudentsTable = page.locator('[data-testid="table-report-sport-students"]');

    this.sportsByLevelContainer = page.locator('[data-testid="report-deportes-nivel-container"]');
    this.sportsByLevelTable = page.locator('[data-testid="table-report-sports-level"]');

    this.sportsProfContainer = page.locator('[data-testid="report-deportes-horarios-profesor-container"]');
    this.sportsProfSearchInput = page.locator('[data-testid="input-search-sports-prof"]');

    this.transportContainer = page.locator('[data-testid="report-transporte-recorrido-container"]');
    this.transportRouteSelect = page.locator('[data-testid="select-filter-transport-route"]');
    this.transportSearchInput = page.locator('[data-testid="input-search-transport-students"]');
    this.transportTable = page.locator('[data-testid="table-report-transport-students"]');
  }

  async goto() {
    await this.sidebar.getByText(/reportes directivos/i).click();
    await expect(this.page).toHaveURL(/\/admin\/reportes/);
    await expect(this.pageContainer).toBeVisible();
  }

  async switchTab(tabKey: string) {
    await this.page.locator(`[data-testid="tab-${tabKey}"]`).click();
  }

  async searchStudent(query: string) {
    await this.studentSearchInput.fill(query);
    const result = this.page.locator('button[data-testid^="select-student-result-"]').first();
    await expect(result).toBeVisible();
    await result.click();
  }

  async searchTeacher(query: string) {
    await this.teacherSearchInput.fill(query);
    const result = this.page.locator('button[data-testid^="select-teacher-result-"]').first();
    await expect(result).toBeVisible();
    await result.click();
  }
}
