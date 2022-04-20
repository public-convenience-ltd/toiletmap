describe('Home page tests', () => {
  it('is correctly titled', () => {
    cy.visit('/');
    cy.title().should('equal', 'Toilet Map: Home');
  });
});
