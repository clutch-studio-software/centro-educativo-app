import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model para el Portal del Estudiante y de la Familia (/mi-portal)
 */
export class FamilyPortalPage {
  readonly page: Page;
  readonly pageContainer: Locator;
  readonly profileHeader: Locator;
  readonly headerFullName: Locator;
  readonly headerStatusBadge: Locator;
  readonly subjectsCard: Locator;
  readonly sportsCard: Locator;
  readonly transportCard: Locator;
  readonly diningCard: Locator;
  readonly attendanceCard: Locator;
  readonly healthRecordsCard: Locator;
  readonly preceptoriaRecordsCard: Locator;
  readonly unjustifiedAbsencesBadge: Locator;
  readonly metricFaltasInjustificadas: Locator;
  readonly multiChildSelector: Locator;
  readonly toggleInscripcionesBtn: Locator;
  readonly togglePerfilBtn: Locator;
  readonly parentServicesManager: Locator;
  readonly transportTab: Locator;
  readonly sportsTab: Locator;
  readonly diningTab: Locator;
  readonly btnEnrollTransport: Locator;
  readonly btnCancelTransport: Locator;
  readonly confirmCancelModal: Locator;
  readonly btnConfirmCancelTransport: Locator;
  readonly btnAbortCancelTransport: Locator;
  readonly btnToggleDining: Locator;
  readonly feedbackAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageContainer = page.locator('[data-testid="family-portal-page"]');
    this.profileHeader = page.locator('[data-testid="student-profile-header"]');
    this.headerFullName = page.locator('[data-testid="student-header-fullname"]');
    this.headerStatusBadge = page.locator('[data-testid="student-header-status-badge"]');
    this.subjectsCard = page.locator('[data-testid="student-subjects-card"]');
    this.sportsCard = page.locator('[data-testid="student-sports-card"]');
    this.transportCard = page.locator('[data-testid="student-transport-card"]');
    this.diningCard = page.locator('[data-testid="student-dining-card"]');
    this.attendanceCard = page.locator('[data-testid="student-attendance-card"]');
    this.healthRecordsCard = page.locator('[data-testid="student-health-records-card"]');
    this.preceptoriaRecordsCard = page.locator('[data-testid="student-preceptoria-records-card"]');
    this.unjustifiedAbsencesBadge = page.locator('[data-testid="student-header-absences-badge"]');
    this.metricFaltasInjustificadas = page.locator('[data-testid="metric-faltas-injustificadas"]');
    this.multiChildSelector = page.locator('[data-testid="multi-child-selector"]');
    this.toggleInscripcionesBtn = page.locator('[data-testid="toggle-view-inscripciones"]');
    this.togglePerfilBtn = page.locator('[data-testid="toggle-view-perfil"]');
    this.parentServicesManager = page.locator('[data-testid="parent-services-manager"]');
    this.transportTab = page.locator('[data-testid="tab-transporte"]');
    this.sportsTab = page.locator('[data-testid="tab-deportes"]');
    this.diningTab = page.locator('[data-testid="tab-comedor"]');
    this.btnEnrollTransport = page.locator('[data-testid="btn-enroll-transport"]');
    this.btnCancelTransport = page.locator('[data-testid="btn-cancel-transport"]');
    this.confirmCancelModal = page.locator('[data-testid="confirm-cancel-modal"]');
    this.btnConfirmCancelTransport = page.locator('[data-testid="btn-confirm-cancel-transport"]');
    this.btnAbortCancelTransport = page.locator('[data-testid="btn-abort-cancel-transport"]');
    this.btnToggleDining = page.locator('[data-testid="btn-toggle-dining"]');
    this.feedbackAlert = page.locator('[data-testid="portal-feedback-alert"]');
  }

  async goto() {
    await this.page.goto('/mi-portal');
    await expect(this.page).toHaveURL(/\/mi-portal/);
    await expect(this.pageContainer).toBeVisible({ timeout: 15000 });
    await expect(this.profileHeader).toBeVisible({ timeout: 15000 });
  }

  async selectChildByIndex(index: number) {
    const childCards = this.page.locator('[data-testid^="child-card-"]');
    await childCards.nth(index).click();
  }

  async switchToAcademicProfile() {
    await this.togglePerfilBtn.click();
  }

  async switchToServicesManagement() {
    await this.toggleInscripcionesBtn.click();
  }

  async selectTransportRoute(routeId: string) {
    await this.page.locator(`[data-testid="transport-route-option-${routeId}"]`).click();
  }
}
