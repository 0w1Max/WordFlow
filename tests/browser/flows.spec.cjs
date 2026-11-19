const { test, expect } = require('@playwright/test');

test('guest can add, edit, review and claim words without losing accents or data', async ({
  page
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.locator('#tryFreeBtn').click();
  await expect(page.locator('#addBtn')).toBeVisible();
  await page.locator('#addBtn').click();
  await page.locator('#text').fill('  молоко  ');
  await page.locator('#meaning').fill('A drink');
  await page.locator('#accentPicker [data-index="7"]').click();
  await page.locator('#submitBtn').click();
  await expect(page.locator('.desk-recent-word .accent-mark')).toHaveText('о');
  await page.locator('#wordsBtn').click();
  await page.locator('.edit-btn').click();
  await page.locator('.accent-picker-wrap [data-index="3"]').click();
  const malicious = '" autofocus onfocus="alert(1)<img src=x>';
  await page.locator('.edit-meaning').fill(malicious);
  await page.locator('.save-btn').click();
  await expect(page.locator('.specimen-meaning')).toHaveText(malicious);
  await page.locator('.edit-btn').click();
  await expect(page.locator('.edit-meaning')).toHaveValue(malicious);
  await expect(page.locator('.edit-meaning')).not.toHaveAttribute('onfocus');
  await page.locator('.cancel-btn').click();
  await page.locator('#back').click();
  await page.locator('#reviewBtn').click();
  await page.locator('#revealBtn').click();
  await page.route('**/api/v1/words/*/review', (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Retry"}' })
  );
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#rememberedBtn').click();
  await expect(page.locator('#rememberedBtn')).toBeVisible();
  await page.unroute('**/api/v1/words/*/review');
  await page.locator('#rememberedBtn').click();
  await expect(page.locator('h1')).toHaveText('Повторение завершено');
  await page.locator('#back').click();
  await page.locator('#saveProgressBtn').click();
  await page.locator('#email').fill('browser@example.com');
  await page.locator('#password').fill('browser-password123');
  await page.locator('#submitBtn').click();
  await expect(page.locator('.masthead-user')).toContainText('browser@example.com');
  await expect(page.locator('.desk-recent-word')).toContainText('мо');
  expect(errors).toEqual([]);
});

test('late page responses do not overwrite the current route', async ({ page }) => {
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  let arrived;
  const seen = new Promise((resolve) => {
    arrived = resolve;
  });
  await page.goto('/login');
  await page.route('**/api/v1/auth/me', async (route) => {
    arrived();
    await pending;
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: '{"error":"Expired"}'
    });
  });
  await page.evaluate(async () => {
    const { navigate } = await import('/app/core/router.js');
    navigate('/save-progress');
    navigate('/register');
  });
  await seen;
  release();
  await page.waitForResponse('**/api/v1/auth/me');
  await page.waitForTimeout(100);
  await expect(page.locator('#registerForm')).toBeVisible();
});
