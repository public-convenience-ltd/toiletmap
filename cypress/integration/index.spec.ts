import { isPermissionAllowed } from 'cypress-browser-permissions';

describe('Home page tests', () => {
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
    cy.findByText(
      'Hammersmith, Greater London, England, W6 9YA, United Kingdom'
    ).click();
    cy.get('[data-toiletid=891ecdfaf8d8e4ffc087f7ce]').should('exist');
    cy.get('[data-toiletid=891ecdfaf8d8e4ffc087f7ce]').click();
    cy.contains('limping comfort');
  });

  it('should bundle and un-bundle markers based on the zoom level', () => {
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
    cy.wait(500);
    cy.get('#gbptm-map').trigger('wheel', {
      deltaY: 66.666666,
      wheelDelta: 120,
      wheelDeltaX: 0,
      wheelDeltaY: 500,
      bubbles: true,
    });
    cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
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
    cy.wait(500);
    cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('not.exist');
    cy.get('span').contains('9').click();
    cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
  });

  it('should load different toilets when the map is dragged', () => {
    // Drag the map and check that we have fewer markers than when we started
    cy.visit('/').wait(500);
    cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
    cy.get('[data-toiletid=cc4e5e9b83de8dd9ba87b3eb]').should('not.exist');
    cy.get('#gbptm-map')
      .trigger('mousedown', { which: 1 })
      .trigger('mousemove', { which: 1, x: 900, y: 0 })
      .trigger('mouseup')
      .wait(100)
      .trigger('mousedown', { which: 1 })
      .trigger('mousemove', { which: 1, x: 900, y: 0 })
      .trigger('mouseup')
      .wait(100)
      .trigger('mousedown', { which: 1 })
      .trigger('mousemove', { which: 1, x: 500, y: 0 })
      .trigger('mouseup');
    cy.get('[data-toiletid=51f6b4d8b792e3531efe5152]').should('not.exist');
    cy.get('[data-toiletid=cc4e5e9b83de8dd9ba87b3eb]').should('exist');
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
      cy.get('[data-toiletid=3bcfceb6cfe73ffd3f7fd395]')
        .should('exist')
        .click();

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

      cy.get('#gbptm-map').trigger('wheel', {
        deltaY: 66.666666,
        wheelDelta: 120,
        wheelDeltaX: 0,
        wheelDeltaY: -500,
        bubbles: true,
      });

      // Check that we land in Ealing
      cy.get('[data-toiletid=3bcfceb6cfe73ffd3f7fd395]').should('exist');

      cy.findByPlaceholderText('Search location…').type('Hammersmith');
      cy.findByText(
        'Hammersmith, Greater London, England, W6 9YA, United Kingdom'
      ).click();
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
    cy.get('.accessibility-list-item').should('not.exist');
    // zoom out and confirm that toilets are intersecting the focus window
    // and that they are added to the list.
    cy.get('#gbptm-map').focus().type('{-}{-}{-}', { delay: 500 });
    cy.contains('guilty illiteracy');
    cy.contains('bite-sized academy');
    cy.contains('cheery zither');
    cy.contains('cold group');
    cy.contains('negative eve');
    cy.contains('lasting event');
    cy.get('#gbptm-map').type('{downarrow}', { delay: 500 }).wait(500);
    // these toilets have now moved outside of the selection window
    cy.contains('negative eve').should('not.exist');
    cy.contains('cold group').should('not.exist');
    cy.contains('lasting event').should('not.exist');
    // these toilets are now the top suggestions in the selection window
    cy.contains('bland lunch');
    cy.contains('bite-sized academy');
    cy.contains('cheery zither');
    cy.contains('rosy medal');
    cy.contains('worldly file');
  });

  it('should select a toilet using the number key associated with the accessibility overlay list', () => {
    cy.visit('/').wait(500);
    cy.get('[data-toiletid=ddad1ed1b91d99ed2bf3bcdf]').should('exist');
    // Focus the map, turning on the accessibility overlay
    cy.get('#gbptm-map').focus();
    cy.contains("Use number keys to show a toilet's details");
    cy.contains('Arrow keys pan the map');
    cy.contains('change the map zoom level');
    cy.get('.accessibility-list-item').should('not.exist');
    // zoom out and confirm that toilets are intersecting the focus window
    // and that they are added to the list.
    cy.get('#gbptm-map').focus().type('{-}{-}{-}', { delay: 300 });

    const thing = cy;
    thing
      .get('span')
      .contains('negative eve')
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

  it.only('should open the toilet details panel when a marker is clicked', () => {
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

    // Check that the feature values are as expected
    cy.findByText('Women')
      .siblings()
      .contains(/^available/);
    cy.findByText('Men')
      .siblings()
      .contains(/^available/);
    cy.findByText('Accessible')
      .siblings()
      .contains(/^unavailable/);
    cy.findByText('Gender Neutral')
      .siblings()
      .contains(/^available/);
    cy.findByText('Children')
      .siblings()
      .contains(/^unavailable/);
    cy.findByText('Baby Changing')
      .siblings()
      .contains(/^available/);
    cy.findByText('Urinal Only')
      .siblings()
      .contains(/^available/);
    cy.findByText('Automatic')
      .siblings()
      .contains(/^unknown/);
    cy.findByText('Free')
      .siblings()
      .contains(/^available/);

    // Check the notes
    cy.contains('vigilant toilet!! indeed photoreceptor crown!');

    // Check last verified
    cy.contains('Last verified: 03/05/2022');
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
