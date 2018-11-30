describe('adding a loo', () => {
  before(function() {
    cy.server();
    cy.fixture('nearbyLoos.json').as('loos');
    cy.fixture('angliaSquareLoo.json').as('loo');
    cy.route('/api/loos/near/*/*', '@loos');
    cy.route('/api/loos/*', '@loo');
    cy.visit('/report', {
      onBeforeLoad: win => {
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

  // it('adding a loo without being logged takes you to the login page', () => {
  //   cy.get('[data-testid=add-the-toilet]').click();
  //   cy.url().should('include', '/login');
  // });

  it('user can add a loo', () => {
    cy.get('[data-testid=toilet-name]').type('test toilet');
    cy.get('[data-testid=who-can-access]').select('Public');
    cy.get('[data-testid=facilities]').select('Female and Male');
    cy.get('[data-testid=accessible-facilities]').select('Unisex');
    cy.get('[data-testid=opening-hours]').select('24/7');
    cy.get('[data-testid="attended:yes"]').check();
    cy.get('[data-testid="babyChange:no"]').check();
    cy.get('[data-testid="automatic:no"]').check();
    cy.get('[data-testid="radar:unknown"]').check();
    cy.get('[data-testid=fee]').type('£0.10');
    cy.get('[data-testid=notes]').type('Lovely taps');
  });
});
