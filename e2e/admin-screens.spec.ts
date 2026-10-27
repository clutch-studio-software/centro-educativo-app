import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

/**
 * Suite E2E: Validación de cada una de las pantallas de gestión institucional del Administrador
 */
test.describe('Validación de Pantallas del Panel de Administración', () => {
  test.beforeEach(async ({ page }) => {
    // Iniciar sesión como Administrador antes de cada prueba
    await loginAsAdmin(page);
  });

  test('Pantalla 1: debe cargar y validar la pantalla de Alumnos y Legajos', async ({
    page,
  }) => {
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await sidebar.getByText(/alumnos & legajos/i).click();

    // Verificación de URL
    await expect(page).toHaveURL(/\/admin\/alumnos/);

    // Verificación de elementos clave de la pantalla
    await expect(
      page.getByText('Gestión de Alumnos y Legajos Académicos')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="students-management-header"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="students-table-section"]')
    ).toBeVisible();
  });

  test('Pantalla 2: debe cargar y validar la pantalla de Cuerpo Docente', async ({
    page,
  }) => {
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await sidebar.getByText(/cuerpo docente/i).click();

    // Verificación de URL
    await expect(page).toHaveURL(/\/admin\/docentes/);

    // Verificación de elementos clave de la pantalla
    await expect(
      page.getByText('Gestión del Plantel Docente')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="teachers-management-header"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="buttons-actions-teachers"]')
    ).toBeVisible();
  });

  test('Pantalla 3: debe cargar y validar la pantalla de Cursados / Oferta Académica', async ({
    page,
  }) => {
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await sidebar.getByText(/oferta académica/i).click();

    // Verificación de URL
    await expect(page).toHaveURL(/\/admin\/oferta-academica/);

    // Verificación de elementos clave de la pantalla
    await expect(
      page.getByText('Gestión de Niveles Académicos')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="btn-create-course"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="btn-new-subject"]')
    ).toBeVisible();
  });

  test('Pantalla 4: debe cargar y validar la pantalla de Actividades Extracurriculares / Deportes', async ({
    page,
  }) => {
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await sidebar.getByText(/deportes & servicios/i).click();

    // Verificación de URL
    await expect(page).toHaveURL(/\/admin\/servicios/);

    // Verificación de elementos clave de la pantalla
    await expect(
      page.getByText('Deportes y Actividades Extracurriculares')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="sports-header"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="btn-new-discipline"]')
    ).toBeVisible();
  });

  test('Pantalla 5: debe cargar y validar la pantalla de Finanzas & Pagos', async ({
    page,
  }) => {
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await sidebar.getByText(/finanzas & pagos/i).click();

    // Verificación de URL
    await expect(page).toHaveURL(/\/admin\/finanzas/);

    // Verificación de elementos clave de la pantalla
    await expect(
      page.getByRole('heading', { level: 1, name: /finanzas & pagos/i })
    ).toBeVisible();
    await expect(
      page.getByText(/módulo en construcción/i)
    ).toBeVisible();
    await expect(
      page.getByText(/emisión de comprobantes de pago/i)
    ).toBeVisible();
  });

  test('Pantalla 6: debe cargar y validar la pantalla de Usuarios & Roles (RBAC)', async ({
    page,
  }) => {
    const sidebar = page.locator('[data-testid="admin-sidebar"]');
    await sidebar.getByText(/usuarios & roles/i).click();

    // Verificación de URL
    await expect(page).toHaveURL(/\/admin\/usuarios/);

    // Verificación de elementos clave de la pantalla
    await expect(
      page.getByText('Usuarios & Roles Institucionales (RBAC)')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="rbac-management-header"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="buttons-actions-rbac"]')
    ).toBeVisible();
  });
});
