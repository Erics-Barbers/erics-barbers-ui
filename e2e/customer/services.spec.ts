import { expect, test } from '@playwright/test';

test('customer can navigate from the homepage to services', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: "Eric's Barbers" }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'View Services' }).click();

  await expect(page).toHaveURL(/\/services$/);
  await expect(
    page.getByRole('heading', { name: 'Services and prices' }),
  ).toBeVisible();
});
