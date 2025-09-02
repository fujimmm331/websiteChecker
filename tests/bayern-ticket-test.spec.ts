import { test, expect } from '@playwright/test';

test('シュツットガルト戦の掲載有無をチェックする', async ({ page }) => {
  const username = process.env.BAYERN_USERNAME!;
  const password = process.env.BAYERN_PASSWORD!;
  console.log('バイエルンのチケットサイトへ訪問');
  await page.goto('https://fcbayern.com/en/tickets');
  console.log('ログインページへ遷移します');
  await page.getByTestId('uc-save-button').click();
  await page.getByRole('button', { name: 'Toggles an area with options' }).click();

  console.log('ログインを行います');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address *' }).click();
  await page.getByRole('textbox', { name: 'Email address *' }).fill(username);
  await page.getByRole('textbox', { name: 'Password *' }).click();
  await page.getByRole('textbox', { name: 'Password *' }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  console.log('チケット販売ページへ遷移します');
  await page.goto('https://fcbayern.com/en/tickets');
  const matchPagePromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Tickets Season 2025/26', exact: true }).first().click();
  const matchPage = await matchPagePromise;
  await matchPage.getByText('Away matches').click();
  await matchPage.waitForLoadState('networkidle');

  try {
    console.log('シュトゥットガルト戦の有無をチェックします');
    await expect(matchPage.getByText('Stuttgart')).toBeVisible();
    await expect(matchPage.getByText('december')).toBeVisible();
  } finally {
    await matchPage.screenshot({ 
      path: `./screenshots/test-end-${new Date().getDate()}.png`, 
      fullPage: true 
    });
  }
});