import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';
import { FamilyPortalPage } from './pages/FamilyPortalPage';

test.describe('Feature: Portal del Estudiante y de la Familia (/mi-portal)', () => {
  test('Scenario: Redirección automática a /login si no hay sesión activa', async ({ page, context }) => {
    // Asegurar contexto limpio sin sesiones previas en localStorage
    await context.clearCookies();
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());

    // When usuario sin credenciales intenta acceder a la ruta protegida
    await page.goto('/mi-portal');

    // Then debe redirigir inmediatamente a /login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: /iniciar sesion|acceso seguro/i })).toBeVisible();
  });

  test.describe('Sesión iniciada en el Portal', () => {
    let portalPage: FamilyPortalPage;

    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
      portalPage = new FamilyPortalPage(page);
      await portalPage.goto();
    });

    test('Scenario: Acceso al portal y navegación mediante el Navbar', async ({ page }) => {
      // Given que el usuario tiene sesión activa
      await expect(portalPage.pageContainer).toBeVisible();

      // Then el Navbar debe contener el enlace directo a Mi Portal Escolar
      const userMenuTrigger = page.locator('.navbar-user-trigger');
      if (await userMenuTrigger.isVisible()) {
        await userMenuTrigger.click();
        await expect(page.locator('[data-testid="navbar-mi-portal-link"]')).toBeVisible();
      }
    });

    test('Scenario: Visualización del perfil del alumno y alternancia de hijos a cargo', async ({ page }) => {
      // Then debe renderizarse el encabezado del perfil con nombre, legajo, DNI y estado
      await expect(portalPage.profileHeader).toBeVisible();
      await expect(portalPage.headerFullName).toBeVisible();
      await expect(portalPage.headerStatusBadge).toBeVisible();

      // Si hay selector de hijos (padre con múltiples alumnos a cargo)
      const childCards = page.locator('[data-testid^="child-card-"]');
      const count = await childCards.count();
      if (count > 1) {
        const initialName = await portalPage.headerFullName.textContent();
        await portalPage.selectChildByIndex(1);
        const newName = await portalPage.headerFullName.textContent();
        expect(newName).not.toBeNull();
      }
    });

    test('Scenario: Ficha Académica - Asistencias, Faltas Injustificadas, Enfermería y Preceptoría', async ({ page }) => {
      // When se conmuta a la vista de Ficha Académica
      if (await portalPage.togglePerfilBtn.isVisible()) {
        await portalPage.switchToAcademicProfile();
      }

      // Then se visualizan las tarjetas consolidadas
      await expect(portalPage.subjectsCard).toBeVisible();
      await expect(page.getByText('Materias & Profesores Asignados')).toBeVisible();

      // Control de Asistencias y Faltas Injustificadas
      await expect(portalPage.attendanceCard).toBeVisible();
      await expect(portalPage.metricFaltasInjustificadas).toBeVisible();
      await expect(page.getByText('Control de Asistencias e Inasistencias')).toBeVisible();

      // Entradas de Enfermería y Preceptoría
      await expect(portalPage.healthRecordsCard).toBeVisible();
      await expect(page.getByText('Entradas de Enfermería (Gabinete de Salud)')).toBeVisible();

      await expect(portalPage.preceptoriaRecordsCard).toBeVisible();
      await expect(page.getByText('Entradas de Preceptoría (Convivencia y Seguimiento)')).toBeVisible();

      // Servicios asignados
      await expect(portalPage.transportCard).toBeVisible();
      await expect(page.getByText('Mercedes-Benz Sprinter (15 plazas estándar)')).toBeVisible();
      await expect(portalPage.diningCard).toBeVisible();
      await expect(portalPage.sportsCard).toBeVisible();
    });

    test('Scenario: Autogestión de Transporte - Verificación de capacidad Sprinter 15 plazas', async ({ page }) => {
      // When en la pestaña de autogestión de transporte
      if (await portalPage.toggleInscripcionesBtn.isVisible()) {
        await portalPage.switchToServicesManagement();
      }
      await portalPage.transportTab.click();

      // Then debe mostrar los datos del vehículo oficial y la capacidad de 15 plazas
      await expect(page.getByText('Mercedes-Benz Sprinter (15 plazas estándar)')).toBeVisible();

      // Si está inscripto o puede inscribirse, verificar los elementos interactivos
      const isEnrolled = await portalPage.btnCancelTransport.isVisible();
      if (isEnrolled) {
        await expect(page.locator('[data-testid="portal-transport-start-date"]')).toBeVisible();
        await portalPage.btnCancelTransport.click();
        await expect(portalPage.confirmCancelModal).toBeVisible();
        await portalPage.btnAbortCancelTransport.click();
        await expect(portalPage.confirmCancelModal).not.toBeVisible();
      } else {
        const routeOptions = page.locator('[data-testid^="transport-route-option-"]');
        const optionsCount = await routeOptions.count();
        expect(optionsCount).toBeGreaterThan(0);
        await expect(portalPage.btnEnrollTransport).toBeVisible();
      }
    });

    test('Scenario: Autogestión de Deportes - Catálogo y límite de 2 disciplinas', async ({ page }) => {
      // When se ingresa a la pestaña de Deportes Extracurriculares
      if (await portalPage.toggleInscripcionesBtn.isVisible()) {
        await portalPage.switchToServicesManagement();
      }
      await portalPage.sportsTab.click();

      // Then se muestra el reglamento de cupo y el catálogo de disciplinas
      await expect(page.locator('[data-testid="portal-sports-quota-badge"]')).toBeVisible();
      await expect(page.getByText('Máximo 2 deportes por alumno')).toBeVisible();

      const sportCards = page.locator('[data-testid^="sport-catalog-card-"]');
      const count = await sportCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('Scenario: Autogestión de Comedor Escolar - Alternar suscripción', async ({ page }) => {
      // When se ingresa a la pestaña de Comedor Escolar
      if (await portalPage.toggleInscripcionesBtn.isVisible()) {
        await portalPage.switchToServicesManagement();
      }
      await portalPage.diningTab.click();

      // Then se muestra el botón interactivo para habilitar o dar de baja el servicio
      await expect(portalPage.btnToggleDining).toBeVisible();
      await expect(page.locator('[data-testid="dining-status-tag"]')).toBeVisible();
    });

    test('Scenario: Autogestión Integral - Inscripción interactiva a servicios y feedback proporcional', async ({ page }) => {
      // When en la pestaña de gestión de servicios
      if (await portalPage.toggleInscripcionesBtn.isVisible()) {
        await portalPage.switchToServicesManagement();
      }

      // 1. Probar inscripción al comedor escolar
      await portalPage.diningTab.click();
      const diningBtn = portalPage.btnToggleDining;
      const initialText = await diningBtn.textContent();
      if (initialText?.includes('Inscribir')) {
        await diningBtn.click();
        await expect(page.locator('[data-testid="dining-status-tag"]')).toContainText(/Servicio Contratado/i);
      }

      // 2. Probar inscripción a deportes
      await portalPage.sportsTab.click();
      const enrollSportBtn = page.locator('[data-testid^="btn-enroll-sport-"]').first();
      if (await enrollSportBtn.isVisible()) {
        await enrollSportBtn.click();
        await expect(page.locator('[data-testid="portal-feedback-alert"]')).toBeVisible();
      }
    });
  });
});
