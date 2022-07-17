import { isPermissionAllowed } from 'cypress-browser-permissions';

describe('Home page tests', () => {
  context('Desktop', () => {
    beforeEach(() => {
      cy.viewport('macbook-16');
    });
    it('is correctly titled', () => {
      cy.visit('/');
      cy.title().should('equal', 'Toilet Map: Home');
    });

    it('renders toilet markers', () => {
      cy.visit('/');
      cy.get('.toilet-marker').should('exist');
    });

    it('should let you search by location', () => {
      cy.visit('/');
      cy.findByPlaceholderText('Search location…').type('Hammersmith');
      cy.get('#search-results-item-0').click();
      cy.get('[data-toiletid=891ecdfaf8d8e4ffc087f7ce]').should('exist');
      cy.get('[data-toiletid=891ecdfaf8d8e4ffc087f7ce]').click();
      cy.contains('limping comfort');
    });

    it('should bundle and un-bundle markers based on the zoom level', () => {
      cy.visit('/').wait(500);
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
      cy.get('[data-toilets*=ddad1ed1b91d99ed2bf3bcdf]').should('not.exist');
      cy.get('#gbptm-map').trigger('wheel', {
        deltaY: 66.666666,
        wheelDelta: 120,
        wheelDeltaX: 0,
        wheelDeltaY: -500,
        bubbles: true,
      });
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('not.exist');
      cy.get('[data-toilets*=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
      cy.wait(500);
      cy.get('#gbptm-map').trigger('wheel', {
        deltaY: 66.666666,
        wheelDelta: 120,
        wheelDeltaX: 0,
        wheelDeltaY: 500,
        bubbles: true,
      });
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
      cy.get('[data-toilets*=ddad1ed1b91d99ed2bf3bcdf]').should('not.exist');
    });

    it('should unbundle markers when the bundle is clicked', () => {
      cy.visit('/').wait(500);
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
      cy.get('#gbptm-map').trigger('wheel', {
        deltaY: 66.666666,
        wheelDelta: 120,
        wheelDeltaX: 0,
        wheelDeltaY: -500,
        bubbles: true,
      });
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('not.exist');
      cy.get('[data-toilets*=ddad1ed1b91d99ed2bf3bcdf]').click().wait(500);
      cy.get('[data-toilets*=ddad1ed1b91d99ed2bf3bcdf]').click();
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
    });

    it('should load different toilets when the map is dragged', () => {
      // Drag the map and check that we have fewer markers than when we started
      cy.visit('/').wait(500);
      cy.get('#gbptm-map')
        .trigger('wheel', {
          deltaY: 66.666666,
          wheelDelta: 120,
          wheelDeltaX: 0,
          wheelDeltaY: 100,
          bubbles: true,
        })
        .wait(500);
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
      cy.get('[data-toiletid=cc4e5e9b83de8dd9ba87b3eb]').should('not.exist');
      cy.get('#gbptm-map')
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { which: 1, x: 1000, y: 0 })
        .trigger('mouseup')
        .wait(100)
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { which: 1, x: 1000, y: 0 })
        .trigger('mouseup')
        .wait(100)
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { which: 1, x: 600, y: 0 })
        .trigger('mouseup')
        .wait(100)
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { which: 1, x: 600, y: 0 })
        .trigger('mouseup')
        .wait(100)
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { which: 1, x: 600, y: 0 })
        .trigger('mouseup');

      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('not.exist');
      cy.get('[data-toiletid=cc4e5e9b83de8dd9ba87b3eb]').should('exist');
    });

    isPermissionAllowed('geolocation') &&
      it('should not break when the geolocate button is clicked multiple times', () => {
        cy.on('window:before:load', (win) => {
          const latitude = 51.5,
            longitude = -0.3,
            accuracy = 1.0;

          cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake(
            (callback) => {
              return callback({ coords: { latitude, longitude, accuracy } });
            }
          );
        });
        cy.visit('/').wait(500);

        cy.get('b').contains('Find').click();
        cy.get('b').contains('Find').click();
        cy.get('b').contains('Find').click();

        cy.get('#gbptm-map')
          .trigger('wheel', {
            deltaY: 66.666666,
            wheelDelta: 120,
            wheelDeltaX: 0,
            wheelDeltaY: -500,
            bubbles: true,
          })
          .wait(500);

        // Check that we land in Ealing

        cy.get('[data-toiletid=3bcfceb6cfe73ffd3f7fd395]').click({
          force: true,
        });

        // Check that the distance to the toilet is listed
        cy.contains('fabulous bandwidth');
        cy.contains('423m');
      });

    isPermissionAllowed('geolocation') &&
      it('should geolocate the user when the "find a toilet near me" button is clicked', () => {
        cy.on('window:before:load', (win) => {
          const latitude = 51.5,
            longitude = -0.3,
            accuracy = 1.0;

          cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake(
            (callback) => {
              return callback({ coords: { latitude, longitude, accuracy } });
            }
          );
        });
        cy.visit('/').wait(500);

        cy.get('b').contains('Find').click();

        cy.get('#gbptm-map')
          .trigger('wheel', {
            deltaY: 66.666666,
            wheelDelta: 120,
            wheelDeltaX: 0,
            wheelDeltaY: -500,
            bubbles: true,
          })
          .wait(500);

        // Check that we land in Ealing

        cy.get('[data-toiletid=3bcfceb6cfe73ffd3f7fd395]').click({
          force: true,
        });

        // Check that the distance to the toilet is listed
        cy.contains('fabulous bandwidth');
        cy.contains('423m');
      });

    isPermissionAllowed('geolocation') &&
      it('should allow user to search after geolocating', () => {
        cy.on('window:before:load', (win) => {
          const latitude = 51.5,
            longitude = -0.3,
            accuracy = 1.0;

          cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake(
            (callback) => {
              return callback({ coords: { latitude, longitude, accuracy } });
            }
          );
        });
        cy.visit('/').wait(500);

        cy.get('b').contains('Find').click();

        cy.get('#gbptm-map')
          .trigger('wheel', {
            deltaY: 66.666666,
            wheelDelta: 120,
            wheelDeltaX: 0,
            wheelDeltaY: -500,
            bubbles: true,
          })
          .wait(500);

        // Check that we land in Ealing
        cy.get('[data-toiletid=3bcfceb6cfe73ffd3f7fd395]').should('exist');

        cy.findByPlaceholderText('Search location…').type('Hammersmith');
        cy.get('#search-results-item-0').click();
        cy.get('[data-toiletid=891ecdfaf8d8e4ffc087f7ce]').should('exist');
      });

    it('should update the accessibility overlay list when the user pans or zooms', () => {
      cy.visit('/').wait(500);
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
      cy.get('#gbptm-map').focus().wait(200);
      cy.get('.accessibility-box').should('exist');
      cy.contains("Use number keys to show a toilet's details");
      cy.contains('Arrow keys pan the map');
      cy.contains('change the map zoom level');
      // zoom out and confirm that toilets are intersecting the focus window
      // and that they are added to the list.
      cy.get('#gbptm-map').focus().type('{-}{-}{-}', { delay: 500 });
      cy.contains('slow decoration');
      cy.contains('agile energy');
      cy.contains('firm marmalade');
      cy.contains('cold group');
      cy.contains('worldly file');
      cy.contains('negative eve');
      cy.get('#gbptm-map').type('{downarrow}', { delay: 500 }).wait(500);
      // these toilets have now moved outside of the selection window
      cy.contains('radiant spiderling').should('not.exist');
      cy.contains('cheery zither').should('not.exist');
      // these toilets are now the top suggestions in the selection window
      cy.contains('slow decoration');
      cy.contains('rosy medal');
      cy.contains('entire caddy');
      cy.contains('agile energy');
      cy.contains('bland lunch');
    });

    it('should select a toilet using the number key associated with the accessibility overlay list', () => {
      cy.visit('/').wait(500);
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
      // Focus the map, turning on the accessibility overlay
      cy.get('#gbptm-map').focus();
      cy.contains("Use number keys to show a toilet's details");
      cy.contains('Arrow keys pan the map');
      cy.contains('change the map zoom level');
      // zoom out and confirm that toilets are intersecting the focus window
      // and that they are added to the list.
      cy.get('#gbptm-map').focus().type('{-}{-}', { delay: 300 });
      cy.findByText('negative eve')
        .siblings()
        .find('b')
        .invoke('text')
        .then((keySelector) => {
          cy.get('#gbptm-map')
            .focus()
            .wait(200)
            .type(keySelector, { delay: 200 });
          cy.url().should('include', '/loos/ddad1ed1b91d99ed2bf3bcdf');
          // Check that the loo we picked is now highlighted.
          cy.get('#highlighted-loo').invoke(
            'attr',
            'data-toiletid',
            'ddad1ed1b91d99ed2bf3bcdf'
          );
          // Check that the accessibility view is hidden
          cy.contains("Use number keys to show a toilet's details").should(
            'not.exist'
          );
          cy.contains('Arrow keys pan the map').should('not.exist');
          cy.contains('change the map zoom level').should('not.exist');
          // Check standard loo panel stuff is there.
          cy.contains('negative eve');
          cy.contains('Features');
          cy.contains('Opening Hours');
          // Check that today is highlighted
          const dayOfWeekName = new Date().toLocaleString('default', {
            weekday: 'long',
          });
          cy.findByText(dayOfWeekName)
            .parent()
            .should('have.css', 'background-color', 'rgb(210, 255, 242)');
        });
    });

    it('should open the toilet details panel when a marker is clicked', () => {
      cy.visit('/').wait(500);
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').click({ force: true });

      cy.url().should('include', '/loos/ddad1ed1b91d99ed2bf3bcdf');

      // Check that the loo we picked is now highlighted.
      cy.get('#highlighted-loo').invoke(
        'attr',
        'data-toiletid',
        'ddad1ed1b91d99ed2bf3bcdf'
      );

      // Check standard loo panel stuff is there.
      cy.contains('negative eve');
      cy.contains('Features');
      cy.contains('Opening Hours');

      // Check that today is highlighted
      const dayOfWeekName = new Date().toLocaleString('default', {
        weekday: 'long',
      });

      cy.findByText(dayOfWeekName)
        .parent()
        .should('have.css', 'background-color', 'rgb(210, 255, 242)');

      // Check the opening hours are as expected
      cy.findByText('Monday').siblings().contains('10:09 - 14:01');
      cy.findByText('Tuesday').siblings().contains('02:34 - 07:26');
      cy.findByText('Wednesday').siblings().contains('01:07 - 23:04');
      cy.findByText('Thursday').siblings().contains('10:30 - 21:51');
      cy.findByText('Friday').siblings().contains('00:42 - 15:07');
      cy.findByText('Saturday').siblings().contains('20:31 - 23:34');
      cy.findByText('Sunday').siblings().contains('03:43 - 03:52');

      // Check that the feature values are as expected
      cy.findByText('Women').siblings().get(`[aria-label=Available]`);
      cy.findByText('Men').siblings().get(`[aria-label=Available]`);
      cy.findByText('Accessible').siblings().get(`[aria-label=Unavailable]`);
      cy.findByText('Gender Neutral').siblings().get(`[aria-label=Available]`);
      cy.findByText('Children').siblings().get(`[aria-label=Unavailable]`);
      cy.findByText('Baby Changing').siblings().get(`[aria-label=Available]`);
      cy.findByText('Urinal Only').siblings().get(`[aria-label=Available]`);
      cy.findByText('Automatic').siblings().get(`[aria-label=Unknown]`);
      cy.findByText('Free').siblings().get(`[aria-label=Available]`);

      // Check the notes
      cy.contains('vigilant toilet!! indeed photoreceptor crown!');

      // Check last verified
      cy.contains(
        new Date(Date.now())
          .toLocaleString(new Intl.Locale('en-gb'))
          .split(',')[0]
      );
    });

    it('should filter toilets based on applied filter toggles', () => {
      cy.visit('/').wait(500);
      cy.findByText('Filter').click();
      cy.get('[data-toiletid=ab2ebfbdadb963aed4cb3b65]').should('exist');
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
      cy.findByText('Baby Changing')
        .siblings()
        .get('[aria-labelledby=filter-babyChange]')
        .click();
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
      cy.get('[data-toiletid=ab2ebfbdadb963aed4cb3b65]').should('not.exist');
      cy.findByText('Baby Changing')
        .siblings()
        .get('[aria-labelledby=filter-babyChange]')
        .click();
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
      cy.get('[data-toiletid=ab2ebfbdadb963aed4cb3b65]').should('exist');
    });

    it.only('should apply multiple filters', () => {
      cy.clearLocalStorage();
      cy.visit('/').wait(500);
      cy.findByText('Filter').click();

      cy.findByText('Free')
        .siblings()
        .get('[aria-labelledby=filter-noPayment]')
        .click();
      cy.findByText('Filter').click();

      cy.get('#gbptm-map')
        .trigger('wheel', {
          deltaY: 66.666666,
          wheelDelta: 120,
          wheelDeltaX: 0,
          wheelDeltaY: -1000,
          bubbles: true,
        })
        .wait(500);

      cy.get('[data-toilets*=05a8ddcad8fdca635f5dbdb0]')
        .click({ force: true })
        .wait(500);
      cy.get('[data-toilets*=05a8ddcad8fdca635f5dbdb0]')
        .click({ force: true })
        .wait(500);
      cy.get('[data-toiletid=05a8ddcad8fdca635f5dbdb0]').click({ force: true });
      cy.findByText('Free').siblings().get(`[aria-label=Available]`);
      cy.get('body').trigger('keydown', { key: 'Escape' });
      cy.findByText('Filter').click();
      cy.findByText('Baby Changing')
        .siblings()
        .get('[aria-labelledby=filter-babyChange]')
        .click();
      cy.findByText('Filter').click();

      cy.reload();
      cy.get('#gbptm-map')
        .trigger('wheel', {
          deltaY: 66.666666,
          wheelDelta: 120,
          wheelDeltaX: 0,
          wheelDeltaY: -1000,
          bubbles: true,
        })
        .wait(500);

      cy.get('[data-toiletid=be23c4bb6fdbbdc6ee6e2aad]').click({ force: true });
      cy.findByText('Free').siblings().get(`[aria-label=Available]`);
      cy.findByText('Baby Changing').siblings().get(`[aria-label=Available]`);
      cy.get('body').trigger('keydown', { key: 'Escape' });
      cy.findByText('Filter').click();
      cy.findByText('Accessible')
        .siblings()
        .get('[aria-labelledby=filter-accessible]')
        .click();
      cy.findByText('Filter').click();

      cy.reload();
      cy.get('#gbptm-map')
        .trigger('wheel', {
          deltaY: 66.666666,
          wheelDelta: 120,
          wheelDeltaX: 0,
          wheelDeltaY: -1000,
          bubbles: true,
        })
        .wait(500);

      cy.get('[data-toiletid=3f8b1fff5d1107ff2cac636b]').click({ force: true });
      cy.findByText('Free').siblings().get(`[aria-label=Available]`);
      cy.findByText('Baby Changing').siblings().get(`[aria-label=Available]`);
      cy.findByText('Accessible').siblings().get(`[aria-label=Available]`);
      cy.get('body').trigger('keydown', { key: 'Escape' });
      cy.findByText('Filter').click();
      cy.findByText('Gender Neutral')
        .siblings()
        .get('[aria-labelledby=filter-allGender]')
        .click();
      cy.findByText('Filter').click();

      cy.reload();
      cy.get('#gbptm-map')
        .trigger('wheel', {
          deltaY: 66.666666,
          wheelDelta: 120,
          wheelDeltaX: 0,
          wheelDeltaY: -1000,
          bubbles: true,
        })
        .wait(500);

      cy.get('[data-toiletid=c109d92ff0a706bab071ed8f]').click({ force: true });
      cy.findByText('Free').siblings().get(`[aria-label=Available]`);
      cy.findByText('Baby Changing').siblings().get(`[aria-label=Available]`);
      cy.findByText('Accessible').siblings().get(`[aria-label=Available]`);
      cy.findByText('Gender Neutral').siblings().get(`[aria-label=Available]`);
      cy.get('body').trigger('keydown', { key: 'Escape' });
      cy.findByText('Filter').click();
      cy.findByText('Radar Key')
        .siblings()
        .get('[aria-labelledby=filter-radar]')
        .click();
      cy.findByText('Filter').click();

      cy.reload();
      cy.get('#gbptm-map')
        .trigger('wheel', {
          deltaY: 66.666666,
          wheelDelta: 120,
          wheelDeltaX: 0,
          wheelDeltaY: -1000,
          bubbles: true,
        })
        .wait(500);

      cy.get('[data-toiletid=3ae59cf0efe2c64aefd15ed7]').click({ force: true });
      cy.findByText('Free').siblings().get(`[aria-label=Available]`);
      cy.findByText('Baby Changing').siblings().get(`[aria-label=Available]`);
      cy.findByText('Accessible').siblings().get(`[aria-label=Available]`);
      cy.findByText('Gender Neutral').siblings().get(`[aria-label=Available]`);
      cy.findByText('RADAR Key').siblings().get(`[aria-label=Available]`);
      cy.findByText('Automatic').siblings().get(`[aria-label=Unknown]`);
      cy.get('body').trigger('keydown', { key: 'Escape' });
      cy.findByText('Filter').click();

      cy.findAllByText('Reset Filter').click();
    });

    it('should retain filters when the page is reloaded and reset them when reset button clicked', () => {
      cy.visit('/').wait(500);
      cy.findByText('Filter').click();
      cy.get('[data-toiletid=ab2ebfbdadb963aed4cb3b65]').should('exist');
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
      cy.findByText('Baby Changing')
        .siblings()
        .get('[aria-labelledby=filter-babyChange]')
        .click();
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
      cy.get('[data-toiletid=ab2ebfbdadb963aed4cb3b65]').should('not.exist');

      cy.reload().wait(500);

      cy.findByText('Filter').click();

      cy.findByText('Baby Changing')
        .siblings()
        .get('[aria-labelledby=filter-babyChange]');

      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
      cy.get('[data-toiletid=ab2ebfbdadb963aed4cb3b65]').should('not.exist');

      cy.findByText('Reset Filter').click();
      cy.get('[data-toiletid=ab2ebfbdadb963aed4cb3b65]').should('exist');
      cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
    });

    it('should collapse the toilet panel when the close button is clicked and reopen when details is clicked', () => {
      cy.visit('/').wait(500);
      cy.get('[data-toiletid=ab2ebfbdadb963aed4cb3b65]').click({ force: true });
      cy.get('[aria-label="Close toilet details"]').click();

      cy.url().should('include', '/loos/ab2ebfbdadb963aed4cb3b65');

      cy.contains('guilty illiteracy');
      cy.contains('Features').should('not.exist');
      cy.contains('Opening Hours').should('not.exist');

      cy.contains('Close');
      cy.contains('Directions')
        .invoke('attr', 'href')
        .should('include', 'https://maps.apple.com/?dirflg=w&daddr=');

      cy.contains('Details').scrollIntoView().click();

      cy.contains('Features');
      cy.contains('Opening Hours');
    });

    it('should close the toilet panel fully when the close button is clicked twice', () => {
      cy.visit('/');
      cy.get('[data-toiletid=ab2ebfbdadb963aed4cb3b65]').click({ force: true });
      cy.url().should('include', '/loos/ab2ebfbdadb963aed4cb3b65');
      cy.get('[aria-label="Close toilet details"]').scrollIntoView().click();
      cy.contains('Close').scrollIntoView().click();
      cy.url().should('not.include', '/loos/ab2ebfbdadb963aed4cb3b65');
    });

    it('should close the toilet panel when the esc key is pressed', () => {
      cy.visit('/').wait(500);
      cy.get('[data-toiletid=ab2ebfbdadb963aed4cb3b65]').click({ force: true });
      cy.url().should('include', '/loos/ab2ebfbdadb963aed4cb3b65');
      cy.contains('guilty illiteracy');
      cy.contains('Features');
      cy.contains('Opening Hours');
      cy.get('body').trigger('keydown', { key: 'Escape' });
      cy.contains('guilty illiteracy');
      cy.contains('Features').should('not.exist');
      cy.contains('Opening Hours').should('not.exist');
      cy.get('body').trigger('keydown', { key: 'Escape' });
      cy.url().should('not.include', '/loos/ab2ebfbdadb963aed4cb3b65');
    });

    it('should go to the edit page if the toilet edit button is clicked', () => {
      cy.visit('/').wait(500);
      cy.get('[data-toiletid=ab2ebfbdadb963aed4cb3b65]').click({ force: true });
      cy.findByText('Edit').scrollIntoView().click();
      cy.url().should('include', 'loos/ab2ebfbdadb963aed4cb3b65/edit');
      cy.contains('Want to Contribute Toilet Data?');
    });

    it('should open directions if the directions button is clicked', () => {
      cy.visit('/').wait(500);
      cy.get('[data-toiletid=ab2ebfbdadb963aed4cb3b65]').click({ force: true });

      cy.findByText('Directions')
        .scrollIntoView()
        .invoke('attr', 'href')
        .should('include', 'https://maps.apple.com/?dirflg=w&daddr=');
    });

    it('should allow users to confirm that the toilet information is correct', () => {
      cy.visit('/').wait(500);
      cy.get('[data-toiletid=ab2ebfbdadb963aed4cb3b65]').click({ force: true });
      cy.intercept('POST', '/api', (req) => {
        expect(req.body.operationName).to.equal(
          'submitVerificationReportMutation'
        );
      });
      cy.findByText('Yes').click();
    });
  });
});
