describe('Individual Loo Page', function() {
  before(function() {
    cy.server();
    cy.fixture('nearbyLoos.json').as('loos');
    cy.fixture('angliaSquareLoo.json').as('loo');
    cy.route('/api/loos/near/*/*', '@loos');
    cy.route('/api/loos/*', '@loo');
    cy.visit('/loos/592456d4d7ffa80011a39c31');
  });

  it('matches the visual snapshot', () => {
    cy.get('[data-testid="looMarker:592456d4d7ffa80011a39c31"]');
    cy.matchImageSnapshot('Loo Page');
  });
});
