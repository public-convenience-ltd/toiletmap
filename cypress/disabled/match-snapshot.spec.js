describe('Individual Loo Page', function () {
  before(function () {
    cy.server();
    cy.fixture('nearbyLoos.json').as('loos');
    cy.fixture('angliaSquareLoo.json').as('loo');
    cy.route('/api/loos/near/*/*', '@loos');
    cy.route('/api/loos/*', '@loo');
    cy.visit('/loos/040992f25ba360e6967b463d');
  });

  it('matches the visual snapshot', () => {
    cy.get('[data-testid="looMarker:040992f25ba360e6967b463d"]');

    cy.matchImageSnapshot('Loo Page');
  });
});
