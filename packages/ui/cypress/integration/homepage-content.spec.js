describe('homepage content', function() {
  beforeEach(function() {
    cy.server();
    cy.fixture('nearbyLoos.json').as('loos');
    cy.route('/api/loos/near/*/*', '@loos');
    cy.visit('/');
  });

  it('test loos are present on homepage', () => {
    cy.get('[data-testid="loo:592456d4d7ffa80011a39c31"]');
    cy.get('[data-testid="loo:5b60c18c496d4e000532a27d"]');
    cy.get('[data-testid="loo:5b685e46144284000598727c"]');
    cy.get('[data-testid="loo:5b60c18c496d4e000532a27d"]');
    cy.get('[data-testid="loo:574db13bdb14a11000cb4766"]');
  });

  it('click on the first loo and get taken to the correct add/edit page', () => {
    cy.get('[data-testid="loo:592456d4d7ffa80011a39c31"]').click();
    cy.url().should('include', '/592456d4d7ffa80011a39c31');
  });
});
