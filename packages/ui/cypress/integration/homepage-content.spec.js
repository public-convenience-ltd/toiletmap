describe('homepage content', function() {
  let polyfill;

  before(() => {
    const polyfillUrl = 'https://unpkg.com/unfetch/dist/unfetch.umd.js';
    cy.request(polyfillUrl).then(response => {
      polyfill = response.body;
    });
  });

  beforeEach(function() {
    cy.server();
    cy.fixture('testLoos.json').as('testLoosJSON');
    cy.route(
      'GET',
      'https://gbptm-stage.herokuapp.com/api/loos/near/**',
      '@testLoosJSON'
    );

    cy.visit('/', {
      onBeforeLoad(win) {
        delete win.fetch;
        win.eval(polyfill);
        win.fetch = win.unfetch;
      },
    });
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
