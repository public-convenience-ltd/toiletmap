describe('Home page tests', () => {
  it('is correctly titled', () => {
    cy.visit('/');
    cy.title().should('equal', 'Toilet Map: Home');
  });

  it('renders toilet markers', () => {
    cy.visit('/');
    cy.get('.toilet-marker').should('exist');
  });

  it('lets you search by location', () => {
    cy.visit('/');
    cy.findByPlaceholderText('Search location…').type('Hammersmith');
    cy.findByText(
      'Hammersmith, Greater London, England, W6 9YA, United Kingdom'
    ).click();
    cy.get('[data-toiletid="cb92afde0b7ac9483e5d9639"]').should('exist');
  });

  it('should load different toilets when the map is dragged', () => {
    // Drag the map and check that we have fewer markers than when we started
    cy.visit('/').wait(500);
    cy.get('.toilet-marker').should('have.length.above', 50);
    cy.get('[data-toiletid=51f6b4d8b792e3531efe5152]').should('exist');
    cy.get('[data-toiletid=1dd0f403d1694d6f7dd33f9a]').should('not.exist');
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
      .trigger('mousemove', { which: 1, x: 900, y: 0 })
      .trigger('mouseup')
      .wait(500);
    cy.get('.toilet-marker').should('have.length.below', 40);
    cy.get('[data-toiletid=51f6b4d8b792e3531efe5152]').should('not.exist');
    cy.get('[data-toiletid=1dd0f403d1694d6f7dd33f9a]').should('exist');
  });

  it('should open the toilet details panel when a marker is clicked', () => {
    cy.visit('/').wait(500);
    cy.get('[data-toiletid=51f6b4d8b792e3531efe5152]').click();

    cy.url().should('include', '/loos/51f6b4d8b792e3531efe5152');

    // Check that the loo we picked is now highlighted.
    cy.get('#highlighted-loo').invoke(
      'attr',
      'data-toiletid',
      '51f6b4d8b792e3531efe5152'
    );

    // Check standard loo panel stuff is there.
    cy.contains('Test loo 2.1');
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

  it('should collapse the toilet panel when the close button is clicked and reopen when details is clicked', () => {
    cy.visit('/').wait(500);
    cy.get('[data-toiletid=51f6b4d8b792e3531efe5152]').click();
    cy.get('[aria-label="Close toilet details"]').click();

    cy.url().should('include', '/loos/51f6b4d8b792e3531efe5152');

    cy.contains('Test loo 2.1');
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
    cy.get('[data-toiletid=51f6b4d8b792e3531efe5152]').click();
    cy.url().should('include', '/loos/51f6b4d8b792e3531efe5152');
    cy.get('[aria-label="Close toilet details"]').scrollIntoView().click();
    cy.contains('Close').scrollIntoView().click();
    cy.url().should('not.include', '/loos/51f6b4d8b792e3531efe5152');
  });

  it('should close the toilet panel when the esc key is pressed', () => {
    cy.visit('/').wait(500);
    cy.get('[data-toiletid=51f6b4d8b792e3531efe5152]').click();
    cy.url().should('include', '/loos/51f6b4d8b792e3531efe5152');
    cy.contains('Test loo 2.1');
    cy.contains('Features');
    cy.contains('Opening Hours');
    cy.get('body').trigger('keydown', { key: 'Escape' });
    cy.contains('Test loo 2.1');
    cy.contains('Features').should('not.exist');
    cy.contains('Opening Hours').should('not.exist');
    cy.get('body').trigger('keydown', { key: 'Escape' });
    cy.url().should('not.include', '/loos/51f6b4d8b792e3531efe5152');
  });

  it('should go to the edit page if the toilet edit button is clicked', () => {
    cy.visit('/').wait(500);
    cy.get('[data-toiletid=51f6b4d8b792e3531efe5152]').click();
    cy.findByText('Edit').scrollIntoView().click();
    cy.url().should('include', 'loos/51f6b4d8b792e3531efe5152/edit');
    cy.contains('Want to Contribute Toilet Data?');
  });

  it('should open directions if the directions button is clicked', () => {
    cy.visit('/').wait(500);
    cy.get('[data-toiletid=51f6b4d8b792e3531efe5152]').click();

    cy.findByText('Directions')
      .scrollIntoView()
      .invoke('attr', 'href')
      .should('include', 'https://maps.apple.com/?dirflg=w&daddr=');
  });

  it('should allow users to confirm that the toilet information is correct', () => {
    cy.visit('/').wait(500);
    cy.get('[data-toiletid=51f6b4d8b792e3531efe5152]').click();
    cy.intercept('POST', '/api', (req) => {
      expect(req.body.operationName).to.equal(
        'submitVerificationReportMutation'
      );
    });
    cy.findByText('Yes').click();
  });
});