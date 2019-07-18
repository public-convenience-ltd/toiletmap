describe('loo added by a user that is already logged in', () => {
  before(function() {
    cy.server();
    cy.fixture('nearbyLoos.json').as('loos');
    cy.fixture('angliaSquareLoo.json').as('loo');
    cy.fixture('angliaSquareReport.json').as('report');
    cy.route('/api/loos/near/*/*', '@loos');
    cy.route('/api/loos/*', '@loo');
    cy.route({
      method: 'POST',
      url: '/api/reports',
      status: '201',
      response: '@report',
    });

    cy.visit('/report', {
      onBeforeLoad: win => {
        win.localStorage.setItem(
          'expires_at',
          `${new Date().getTime() + 25000}`
        );
        win.localStorage.setItem('access_token', 'imalittleteapot');
        cy.stub(win.navigator.geolocation, 'getCurrentPosition', success => {
          return success({
            coords: {
              longitude: 1.295463,
              latitude: 52.633319,
            },
          });
        });
      },
    });
  });

  it('user can successfully create a report', () => {
    // fill in the form
    cy.get('[data-testid=toilet-name]').type('Anglia Square Shopping Center');
    cy.get('[data-testid=who-can-access]').select('Public');
    cy.get('[data-testid=facilities]').select('Female and Male');
    cy.get('[data-testid=accessible-facilities]').select('Unisex');
    cy.get('[data-testid=opening-hours]').select('Business hours, Mon-Sun');
    cy.get('[data-testid="attended:no"]').check();
    cy.get('[data-testid="babyChange:unknown"]').check();
    cy.get('[data-testid="automatic:no"]').check();
    cy.get('[data-testid="radar:unknown"]').check();
    cy.get('[data-testid=fee]').type('£0');
    cy.get('[data-testid=notes]').type('n/a');
    // click 'add the toilet' button
    cy.get('[data-testid=add-the-toilet]').click();
    cy.url().should('include', '040992f25ba360e6967b463d');
  });
});
