import { faker } from '@faker-js/faker';
import _ from 'lodash';
describe('Edit page tests', () => {
  context('Desktop', () => {
    beforeEach(() => {
      cy.viewport('macbook-16');
    });
    before(() => {
      cy.login();
    });

    after(() => {
      cy.clearAuth0Cookies();
    });

    afterEach(() => {
      cy.preserveAuth0CookiesOnce();
    });

    it('should load the edit page with expected data given a valid toilet id', () => {
      cy.visit('loos/3420/edit');
      cy.reload();

      cy.contains('Align the crosshair');
      cy.findByDisplayValue('outrageous webmail');
      cy.findByText('happy-go-lucky toilet!! hence dead jingle!').should(
        'exist'
      );
      cy.findByDisplayValue('£7.99 on entry');

      cy.findByTestId('women:yes').should('be.checked');
      cy.findByTestId('men:yes').should('be.checked');
      cy.findByTestId('accessible:no').should('be.checked');
      cy.findByTestId('radar:yes').should('be.checked');
      cy.findByTestId('allGender:no').should('be.checked');
      cy.findByTestId('children:no').should('be.checked');
      cy.findByTestId('babyChange:yes').should('be.checked');
      cy.findByTestId('urinalOnly:yes').should('be.checked');
      cy.findByTestId('automatic:na').should('be.checked');
      cy.findByTestId('isFree:no').should('be.checked');

      cy.get('[name=monday-opens]').should('have.value', '05:04');
      cy.get('[name=monday-closes]').should('have.value', '17:11');

      cy.get('[name=wednesday-opens]').should('have.value', '06:24');
      cy.get('[name=wednesday-closes]').should('have.value', '19:35');
    });

    const generateToiletSettings = () => {
      const inputStates = ['yes', 'no', 'na'];
      const detailStates = ['Available', 'Unavailable', 'Unknown'];

      const indexPicks = _.times(11, () => _.random(0, 2, false));

      const isRadarHidden = indexPicks[2] === 1 || indexPicks[2] === 2;

      const refs = [
        ['women', 'Women'],
        ['men', 'Men'],
        ['accessible', 'Accessible'],
        ['radar', 'RADAR Key'],
        ['allGender', 'Gender Neutral'],
        ['children', 'Children'],
        ['babyChange', 'Baby Changing'],
        ['urinalOnly', 'Urinal Only'],
        ['automatic', 'Automatic'],
        ['isFree', 'Free'],
      ];

      const inputChoices = refs.map(
        (ref, i) => `${ref[0]}:${inputStates[indexPicks[i]]}`
      );

      const detailChecks = refs.map((ref, i) => [
        ref[1],
        detailStates[indexPicks[i]],
      ]);

      return { inputChoices, detailChecks, isRadarHidden };
    };

    it('should handle an invalid toilet id gracefully', () => {
      cy.visit('loos/invalid_id/edit');
      cy.contains('Error fetching toilet data');
      cy.contains('Page not found');
      cy.findByText('Take me back home!').click();
      cy.get('.toilet-marker').should('exist');
    });

    it('should allow all fields on the toilet to be edited', () => {
      cy.visit('loos/1146/edit');
      cy.contains('Align the crosshair');

      const toiletName = faker.word.adjective() + ' ' + faker.word.noun();
      cy.findByPlaceholderText('e.g. Sainsburys or street name')
        .clear()
        .type(toiletName);

      const { inputChoices, detailChecks, isRadarHidden } =
        generateToiletSettings();

      for (const choice of inputChoices) {
        cy.findByTestId(choice).parent().click();
      }

      // If toilet is not free, fill in the payment details.
      const isToiletNotFree = inputChoices.indexOf('isFree:no') > -1;
      const paymentText = `This toilet costs £${faker.finance.amount()}!!`;
      if (isToiletNotFree) {
        cy.findByPlaceholderText('The amount e.g. 20p')
          .clear()
          .type(paymentText);
      }

      cy.get('[name=monday-opens]').clear().type('08:00');
      cy.get('[name=monday-closes]').clear().type('19:00');

      cy.get('[name=wednesday-opens]').clear().type('09:00');
      cy.get('[name=wednesday-closes]').clear().type('18:00');

      cy.get('[name=friday-opens]').clear().type('01:00');
      cy.get('[name=friday-closes]').clear().type('23:00');

      cy.findByPlaceholderText(
        'Add any other useful information about the toilet here'
      )
        .clear()
        .type('I ran out of loo roll! Otherwise good.');

      cy.findByText('Update the toilet').click();

      cy.contains('Thank you, details updated!');

      cy.contains(toiletName);

      for (const detail of detailChecks) {
        // We skip radar key if the toilet is not listed as accessible.
        if (detail[0] === 'RADAR Key' && isRadarHidden) {
          continue;
        }

        cy.findByText(detail[0]).siblings().get(`[aria-label=${detail[1]}]`);
        cy.findByText(detail[0]).parent().get(`[title=${detail[1]}]`);
      }

      cy.contains('08:00 - 19:00');
      cy.contains('09:00 - 18:00');
      cy.contains('01:00 - 23:00');

      cy.contains('I ran out of loo roll! Otherwise good.');
    });

    it('should update the location of the toilet to where the map is dragged', () => {
      cy.visit('loos/1146/edit').wait(500);
      cy.get('#gbptm-map')
        .trigger('mousedown', { which: 1, force: true })
        .trigger('mousemove', { which: 1, x: 1000, y: 0 })
        .trigger('mouseup', { force: true })
        .wait(100)
        .trigger('mousedown', { which: 1, force: true })
        .trigger('mousemove', { which: 1, x: 1000, y: 0 })
        .trigger('mouseup', { force: true })
        .wait(100)
        .trigger('mousedown', { which: 1, force: true })
        .trigger('mousemove', { which: 1, x: 1000, y: 0 })
        .trigger('mouseup', { force: true })
        .wait(100)
        .trigger('mousedown', { which: 1, force: true })
        .trigger('mousemove', { which: 1, x: 1000, y: 0 })
        .trigger('mouseup', { force: true })
        .wait(100)
        .trigger('mousedown', { which: 1, force: true })
        .trigger('mousemove', { which: 1, x: 1000, y: 0 })
        .trigger('mouseup', { force: true });
      cy.findByText('Update the toilet').click();

      cy.contains('Thank you, details updated!');

      cy.visit('/');
      cy.findByPlaceholderText('Search location…').type('ashford common');
      cy.get('#search-results-item-0').click();

      cy.get('[data-toiletid=1146]').should('exist');
    });

    it('should update the location of the toilet through a location search', () => {
      cy.visit('loos/1146/edit').wait(500);
      cy.findByPlaceholderText('Search location…').type('birmingham');
      cy.get('#search-results-item-0').click();
      cy.wait(500);
      cy.findByText('Update the toilet').click();

      cy.contains('Thank you, details updated!');

      cy.visit('/');
      cy.findByPlaceholderText('Search location…').type('birmingham');
      cy.get('#search-results-item-0').click();

      cy.get('[data-toiletid=1146]').should('exist');
    });
  });
});
