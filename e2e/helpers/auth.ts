import { Page, expect } from '@playwright/test';

/**
 * Helper reutilizable para iniciar sesión como Administrador en pruebas E2E.
 */
export async function loginAsAdmin(page: Page) {
  const adminEmail =
    process.env.TEST_ADMIN_EMAIL ||
    process.env.VITE_ADMIN_EMAIL ||
    'user_admin@gmail.com';

  const adminPassword =
    process.env.TEST_ADMIN_PASSWORD ||
    process.env.VITE_DEV_ADMIN_KEY ||
    process.env.ADMIN_PASSWORD ||
    '';

  await page.goto('/login');

  // Seleccionar Staff Institucional
  const staffRoleButton = page.getByRole('button', {
    name: /staff institucional/i,
  });
  await expect(staffRoleButton).toBeVisible();
  await staffRoleButton.click();

  // Completar credenciales
  await page.locator('#identifier').fill(adminEmail);
  await page.locator('#password').fill(adminPassword);

  // Enviar formulario
  const submitButton = page.getByRole('button', { name: /acceso seguro/i });
  await submitButton.click();

  // Esperar redirección al panel
  await expect(page).toHaveURL(/\/admin(\/dashboard)?/, { timeout: 15000 });
}
