/* global page */
const baseUrl = 'http://localhost:4444';

describe('Homepage', () => {
  beforeAll(async () => {
    await page.goto(baseUrl);
  });

  it('is correctly titled', async () => {
    await expect(page.title()).resolves.toMatch(
      'The Great British Toilet Map: Find Toilet'
    );
  });

  it('shows a marker for a loo', async () => {
    await expect(page).toMatchElement('[data-testid^=toiletMarker]');
  });
});
