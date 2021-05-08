/* global page */
const baseUrl = 'http://localhost:4444';

describe('Homepage', () => {
  beforeAll(async () => {
    await page.setViewport({ width: 1000, height: 1000 });
    await page.evaluateOnNewDocument(() => {
      localStorage.clear();
      localStorage.setItem('expires_at', '1640995200000');
      localStorage.setItem('access_token', 'e');
      localStorage.setItem('id_token', 'ee');
      localStorage.setItem('name', 'test');
      localStorage.setItem('nickname', 'test');
      localStorage.setItem('permissions', '["SUBMIT_REPORT"]');
      localStorage.setItem(
        'tracking',
        '{"aaAccepted":false,"trackingStateChosen":true}'
      );
      localStorage.setItem('notification', '{"covid":"dismissed"}');
    });

    await page.goto(baseUrl, { waitUntil: 'load' });
  });

  it('navigates to loo edit page successfully', async () => {
    // navigate to the edit toilet page for the first toilet marker found.
    await page.click('[data-testid^=toiletMarker]');
    await expect(page).toMatchElement('[data-testid=toilet-details]');
    await page.click('[data-testid=details-button]');
    await page.click('[data-testid=edit-button]');
    // wait for the edit form to be visible (page has loaded fully)
    await page.waitForSelector('form');
    // assert that we have, in fact, reached the edit page.
    await expect(page.title()).resolves.toMatch(
      'The Great British Toilet Map: Edit Toilet'
    );
  });

  it.only('can change the toilet name as expected', async () => {
    // navigate to the edit toilet page for the first toilet marker found.
    await page.waitForSelector('[data-testid^=toiletMarker]');
    await page.click('[data-testid^=toiletMarker]');
    await expect(page).toMatchElement('[data-testid=toilet-details]');
    await page.click('[data-testid=details-button]');
    await page.click('[data-testid=edit-button]');
    // wait for the edit form to be visible (page has loaded fully)
    await page.waitForSelector('form');
    // assert that we have, in fact, reached the edit page.
    await expect(page.title()).resolves.toMatch(
      'The Great British Toilet Map: Edit Toilet'
    );

    // Changing the toilet name
    await page.type('[data-testid=toilet-name]', 't');
    await page.click('[data-testid=update-toilet-button');
    await page.goto(baseUrl);
    await page.waitForSelector('[data-testid^=toiletMarker]');
    await page.click('[data-testid^=toiletMarker]');
    await page.waitForSelector('[data-testid=toilet-details]');
    await page.click('[data-testid=details-button]');
    await page.screenshot({ path: 'test.png' });
    // await page.click('[data-testid^=toiletMarker]');
  });
});
