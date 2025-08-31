import { test, expect } from '@playwright/test';

test.describe('FCバイエルンチケットサイトテスト', () => {
  test('イベントリストでStuttgartの試合をチェック', async ({ page }) => {
    const username = process.env.BAYERN_USERNAME!;
    const password = process.env.BAYERN_PASSWORD!;

    await page.goto('https://fcbayern.com/en/tickets');
    await page.getByTestId('uc-save-button').click();
    await page.waitForLoadState('networkidle');

    await page.locator('a[href="https://tickets.fcbayern.com/ticketcenter/"]').click();
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="text"]', username);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Anmelden")');
    await page.waitForLoadState('networkidle');

    await page.goto('https://tickets.fcbayern.com/internetverkauf/EventList.aspx');
    await page.waitForLoadState('networkidle');

    const stuttgart = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasStuttgart = stuttgart.includes('stuttgart');

    console.log(`❓ Stuttgartはあるか？ ${hasStuttgart ? '✅ YES' : '❌ NO'}`);
    
    if (!hasStuttgart) {
      await page.screenshot({ 
        path: `./screenshots/no-stuttgart-${Date.now()}.png`, 
        fullPage: true 
      });
    }

    const december = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasDecember = december.includes('december');
    
    console.log(`❓ Decemberはあるか？ ${hasDecember ? '✅ YES' : '❌ NO'}`);
    
    if (!hasDecember) {
      await page.screenshot({ 
        path: `./screenshots/no-december-${Date.now()}.png`, 
        fullPage: true 
      });
    }

    expect(hasDecember).toBeTruthy();
    expect(hasStuttgart).toBeTruthy();
  });

  test.afterEach(async ({ page }) => {
    await page.screenshot({ 
      path: `./screenshots/test-end-${Date.now()}.png`, 
      fullPage: true 
    });
  });
});