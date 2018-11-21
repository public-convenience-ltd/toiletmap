describe('match screenshot', function() {
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
    cy.fixture('testLoo.json').as('testLooJSON');
    cy.route('GET', '**/api/loos/near/**/**', '@testLoosJSON');

    cy.route('GET', '**/api/loos/**', '@testLooJSON');

    cy.visit('/', {
      onBeforeLoad(win) {
        delete win.fetch;
        win.eval(polyfill);
        win.fetch = win.unfetch;
      },
    });
  });

  it('match screenshot', () => {
    cy.visit('/loos/592456d4d7ffa80011a39c31');
    //  cy.get('[data-testid=marker]');
    cy.matchImageSnapshot('map test');
  });
});
