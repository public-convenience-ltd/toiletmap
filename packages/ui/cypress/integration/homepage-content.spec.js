describe('homepage content', function () {
  before(function () {
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

  it('shows a list of nearby loos', () => {
    cy.get('[data-testid="loo:040992f25ba360e6967b463d"]');
    cy.get('[data-testid="loo:f6395482763161ea85bab753"]');
    cy.get('[data-testid="loo:47890c842a829206837a5156"]');
    cy.get('[data-testid="loo:76ed0448aab45c7779f976f1"]');
    cy.get('[data-testid="loo:9ce8017edbff9b7559ab8446"]');
  });

  it('shows loos on the main map', () => {
    cy.get('[data-testid="mainMap"]').within(($map) => {
      cy.get('[data-testid="looMarker:040992f25ba360e6967b463d"]').should(
        'have.length',
        1
      );
    });
  });

  it('click on the first loo and get taken to the correct add/edit page', () => {
    cy.get('[data-testid="loo:040992f25ba360e6967b463d"]').click();
    cy.url().should('include', '/040992f25ba360e6967b463d');
  });
});
