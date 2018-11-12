describe('adding a loo', () => {
  it('adding a toilet without being logged takes you to the login page', () => {
    cy.visit('/report');
    cy.get('[data-testid=add-the-toilet]').click();
    cy.url().should('include', '/login');
  });
});
