describe('homepage content', function() {
  before(function() {
    cy.server();
    cy.fixture('nearbyLoos.json').as('loos');
    cy.fixture('angliaSquareLoo.json').as('loo');
    cy.route('/api/loos/near/*/*', '@loos');
    cy.route('/api/loos/*', '@loo');
    cy.visit('/', {
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

  it('requests that the user is invited to login or sign up when they attempt to add a loo', () => {
    cy.visit('/');
    cy.contains('Add a toilet').click();
    cy.contains('Log In/Sign Up');
  });
});
