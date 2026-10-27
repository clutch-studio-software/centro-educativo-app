import { test, expect } from '@playwright/test';

/**
 * Test E2E: Flujo de inicio de sesión de Administrador y validación del Dashboard
 * 
 * Permite usar variables de entorno:
 * - TEST_ADMIN_EMAIL (o fallback a VITE_ADMIN_EMAIL)
 * - TEST_ADMIN_PASSWORD (o fallback a VITE_DEV_ADMIN_KEY / ADMIN_PASSWORD)
 */
test.describe('Autenticación y Dashboard de Administrador', () => {
  const adminEmail =
    process.env.TEST_ADMIN_EMAIL ||
    process.env.VITE_ADMIN_EMAIL ||
    'user_admin@gmail.com';

  const adminPassword =
    process.env.TEST_ADMIN_PASSWORD ||
    process.env.VITE_DEV_ADMIN_KEY ||
    process.env.ADMIN_PASSWORD ||
    '';

  test('debe iniciar sesión con perfil Staff/Administrador y cargar el Dashboard General', async ({
    page,
  }) => {
    // 1. Navegar a la pantalla de Login
    await page.goto('/login');

    // Comprobar que la vista de login se carga correctamente
    await expect(
      page.getByRole('heading', { name: /portal de acceso/i }).first()
    ).toBeVisible();

    // 2. Seleccionar el perfil institucional "Staff"
    const staffRoleButton = page.getByRole('button', {
      name: /staff institucional/i,
    });
    await expect(staffRoleButton).toBeVisible();
    await staffRoleButton.click();

    // 3. Completar las credenciales del Administrador
    const emailInput = page.locator('#identifier');
    await expect(emailInput).toBeVisible();
    await emailInput.fill(adminEmail);

    const passwordInput = page.locator('#password');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(adminPassword);

    // 4. Enviar el formulario de autenticación
    const submitButton = page.getByRole('button', { name: /acceso seguro/i });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // 5. Validaciones post-login (Assertions):
    // 5.1 Verificar la redirección de URL hacia la consola administrativa
    await expect(page).toHaveURL(/\/admin(\/dashboard)?/, { timeout: 15000 });

    // 5.2 Verificar que el formulario de login ya no esté visible
    await expect(submitButton).not.toBeVisible();

    // 5.3 Validar que el Dashboard General de administrador se renderice correctamente
    // - Header institucional y breadcrumbs
    const adminHeader = page.locator('[data-testid="admin-header"]');
    await expect(adminHeader).toBeVisible();

    // - Menú lateral de navegación (Sidebar de administrador)
    const adminSidebar = page.locator('[data-testid="admin-sidebar"]');
    await expect(adminSidebar).toBeVisible();
    await expect(adminSidebar.getByText(/dashboard general/i)).toBeVisible();
    await expect(adminSidebar.getByText(/alumnos & legajos/i)).toBeVisible();

    // - Título principal del Dashboard
    const dashboardTitle = page.getByRole('heading', {
      level: 1,
      name: /dashboard general/i,
    });
    await expect(dashboardTitle).toBeVisible();

    // - Sección de contenido y métricas/descripción del panel institucional
    await expect(
      page.getByText(/módulo en construcción/i)
    ).toBeVisible();
    await expect(
      page.getByText(/métricas clave de asistencia/i)
    ).toBeVisible();
  });
});
