import { expect, test } from '@playwright/test';

test('customer can reach password recovery from login', async ({ page }) => {
  await page.goto('/login');
  await expect(
    page.getByRole('heading', { name: 'Log in to your account' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
});
