describe('Site Navigation', () => {
  beforeEach(function () {
    cy.server();
    cy.fixture('nearbyLoos.json').as('loos');
    cy.fixture('angliaSquareLoo.json').as('loo');
    cy.route('/api/loos/near/*/*', '@loos');
    cy.route('/api/loos/*', '@loo');
    cy.visit('/', {
      onBeforeLoad: (win) => {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition', (success) => {
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

  it('contains a working link to "/preferences"', () => {
    cy.contains('Preferences').click();
    cy.url().should('include', '/preferences');
  });

  it('contains a working link to "/about"', () => {
    cy.contains('About').click();
    cy.url().should('include', '/about');
  });
});
