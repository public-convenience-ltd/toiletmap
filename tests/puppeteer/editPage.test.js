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

  it('loads loo edit page successfully', async () => {
    await page.click('[data-testid^=toiletMarker]');
    await expect(page).toMatchElement('[data-testid=toilet-details]');
    await page.click('[data-testid=details-button]');
    await page.screenshot({ path: 'test.png' });

    // await expect(page.title()).resolves.toMatch(
    //   'The Great British Toilet Map: Edit Toilet'
    // );
  });
});
