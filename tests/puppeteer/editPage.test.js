/* global page */
const baseUrl = 'http://localhost:4444';

describe('Homepage', () => {
  beforeEach(async () => {
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
    try {
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
    } catch (e) {
      console.log(e);
      await browser.close();
    }
  });

  it('can input information to the edit page', async () => {
    try {
      // navigate to the edit toilet page for the first toilet marker found.
      await page.waitForSelector('[data-testid^=toiletMarker]');
      await page.click('[data-testid^=toiletMarker]');
      await expect(page).toMatchElement('[data-testid=toilet-details]');
      await page.click('[data-testid=details-button]');
      await page.click('[data-testid=edit-button]');

      // await page.waitForNavigation();
      // wait for the edit form to be visible (page has loaded fully)
      await page.waitForSelector('form');
      // assert that we have, in fact, reached the edit page.
      await expect(page.title()).resolves.toMatch(
        'The Great British Toilet Map: Edit Toilet'
      );

      // Check update toilet button disabled before changes
      const updateButton = await page.$('[data-testid=update-toilet-button]');
      const disabledHandle = await updateButton.getProperty('disabled');
      expect(await disabledHandle.jsonValue()).toEqual(true);

      // Changing the toilet name
      await page.type('[data-testid=toilet-name]', 't');

      // Changing radio buttons. Not sure why we need to use this weird way to select it.
      // Puppeteer couldn't select with just .click :(
      await page.evaluate(() =>
        document.querySelector('[data-testid="women:no"]').click()
      );

      // Toggling switches
      await page.mouse.wheel({ deltaY: 1500 });
      await page.waitForSelector('[data-testid="opening-hours-selection"]', {
        visible: false,
      });
      await page.click('[name="has-opening-times"]');
      await page.waitForSelector('[data-testid="opening-hours-selection"]', {
        visible: true,
      });

      // Check opening hours selector is present.
      await page.click('[name="monday-is-open"]');
      await page.waitForSelector('[name="monday-opens"]', { visible: true });
      await page.type('[name="monday-opens"]', '111111');

      // Check update toilet button enabled after changes
      const enabledHandle = await updateButton.getProperty('disabled');
      expect(await enabledHandle.jsonValue()).toEqual(false);
    } catch (e) {
      console.log(e);
      await browser.close();
    }
  });
});
