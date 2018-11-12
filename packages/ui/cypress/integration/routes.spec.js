describe('homepage', () => {
  it('successfully loads', () => {
    cy.visit('/');
  });

  it('opens the "add a toilet" page when button is clicked', () => {
    cy.visit('/');
    cy.contains('Add a toilet').click();
    cy.url().should('include', '/report');
  });

  it('contains a working link to "preferences"', () => {
    cy.visit('/');
    cy.contains('My toilet preferences').click();
    cy.url().should('include', '/preferences');
  });

  it('contains a working link to "about this project"', () => {
    cy.visit('/');
    cy.contains('About this project').click();
    cy.url().should('include', '/about');
  });
});
