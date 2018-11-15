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
});
