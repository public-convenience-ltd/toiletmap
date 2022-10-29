import { faker } from '@faker-js/faker';
import _ from 'lodash';

describe('Adding new toilets to the platform', () => {
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

    it('should load the add toilet page successfully for authenticated users', () => {
      cy.visit('/loos/add?lat=51.61008861374827&lng=0.10883331298828125');

      cy.contains('Align the crosshair');
      cy.contains('2. Add a toilet name');
      cy.contains('3. Who can use these toilets?');
      cy.contains('4. At this toilet is there');
      cy.contains('5. Is this toilet free?');
      cy.contains('6. Do you know the opening hours?');
      cy.contains('7. Notes');

      cy.findByPlaceholderText('Search location…').should('exist');
      cy.findByAltText('crosshair').should('exist');
    });

    it('should load the add toilet page at the specified latitude and longitude', () => {
      cy.visit('/loos/add?lat=51.61008861374827&lng=0.10883331298828125');
      cy.contains('Align the crosshair');
      cy.get('[data-toiletid=1479]').should('exist');
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

    it('should not allow the form to be submitted with an empty name field', () => {
      cy.visit('/loos/add');
      cy.findByText('Save toilet').click();

      cy.get('[data-icon="asterisk"]').should('exist');
      cy.findByText('Please specify a toilet name').should('exist');

      const toiletName = faker.word.adjective() + ' ' + faker.word.noun();
      cy.findByPlaceholderText('e.g. Sainsburys or street name').type(
        toiletName
      );

      cy.findByText('Save toilet').click();
      cy.contains('Thank you, toilet added!');
      cy.contains(toiletName);
    });

    it('should not allow the form to be submitted until the opening and closing time fields are filled', () => {
      cy.visit('/loos/add');

      const toiletName = faker.word.adjective() + ' ' + faker.word.noun();
      cy.findByPlaceholderText('e.g. Sainsburys or street name').type(
        toiletName
      );

      cy.get('[name=has-opening-times]').click();
      cy.get('[name=monday-is-open').click();

      cy.findByText('Save toilet').click();
      cy.get('[data-icon="asterisk"]').should('have.length', 2);

      cy.get('[name=monday-opens]').type('08:00');

      cy.findByText('Save toilet').click();
      cy.get('[data-icon="asterisk"]').should('have.length', 1);

      cy.get('[name=monday-closes]').type('19:00');
      cy.findByText('Save toilet').click();

      cy.contains('Thank you, toilet added!');
      cy.contains(toiletName);
      cy.contains('08:00 - 19:00');
    });

    it('should not include the opening time info if the section is filled and then closed', () => {
      cy.visit('/loos/add');

      const toiletName = faker.word.adjective() + ' ' + faker.word.noun();
      cy.findByPlaceholderText('e.g. Sainsburys or street name').type(
        toiletName
      );

      cy.get('[name=has-opening-times]').click();
      cy.get('[name=monday-is-open').click();

      cy.findByText('Save toilet').click();
      cy.get('[data-icon="asterisk"]').should('have.length', 2);

      cy.get('[name=monday-opens]').type('08:00');

      cy.findByText('Save toilet').click();
      cy.get('[data-icon="asterisk"]').should('have.length', 1);

      cy.get('[name=monday-closes]').type('19:00');

      // This time, we close the field, so we'd expect it to not appear in the final loo.
      cy.get('[name=has-opening-times]').click();

      cy.findByText('Save toilet').click();

      cy.contains('Thank you, toilet added!');
      cy.contains(toiletName);
      cy.contains('08:00 - 19:00').should('not.exist');
    });

    it('should add a toilet after submitting the form and retain all submitted data', () => {
      cy.visit('/loos/add?lat=51.92008861374827&lng=0.10883331298828125');
      const toiletName = faker.word.adjective() + ' ' + faker.word.noun();
      cy.findByPlaceholderText('e.g. Sainsburys or street name').type(
        toiletName
      );

      const { inputChoices, detailChecks, isRadarHidden } =
        generateToiletSettings();

      for (const choice of inputChoices) {
        cy.findByTestId(choice).parent().click();
      }

      // If toilet is not free, fill in the payment details.
      const isToiletNotFree = inputChoices.indexOf('isFree:no') > -1;
      const paymentText = `This toilet costs £${faker.finance.amount()}!!`;
      if (isToiletNotFree) {
        cy.findByPlaceholderText('The amount e.g. 20p').type(paymentText);
      }

      // We leave the opening hours empty here — they are covered by another test in this suite.
      cy.get('[name=has-opening-times]').click();

      cy.get('[name=monday-is-open').click();
      cy.get('[name=monday-opens]').type('08:00');
      cy.get('[name=monday-closes]').type('19:00');

      cy.get('[name=wednesday-is-open').click();
      cy.get('[name=wednesday-opens]').type('09:00');
      cy.get('[name=wednesday-closes]').type('18:00');

      cy.get('[name=friday-is-open').click();
      cy.get('[name=friday-opens]').type('01:00');
      cy.get('[name=friday-closes]').type('23:00');

      cy.findByPlaceholderText(
        'Add any other useful information about the toilet here'
      ).type('I ran out of loo roll! Otherwise good.');

      cy.findByText('Save toilet').click();

      cy.contains('Thank you, toilet added!');
      cy.contains(toiletName);
      if (isToiletNotFree) {
        cy.contains(paymentText);
      }

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

      cy.findByText('Edit').click();

      cy.contains('Align the crosshair');
      cy.findByDisplayValue(toiletName);
      cy.findByText('I ran out of loo roll! Otherwise good.').should('exist');
      if (isToiletNotFree) {
        cy.findByDisplayValue(paymentText);
      }
      for (const choice of inputChoices) {
        cy.findByTestId(choice).should('be.checked');
      }

      cy.get('[name=monday-opens]').should('have.value', '08:00');
      cy.get('[name=monday-closes]').should('have.value', '19:00');

      cy.get('[name=wednesday-opens]').should('have.value', '09:00');
      cy.get('[name=wednesday-closes]').should('have.value', '18:00');
    });
  });
});
