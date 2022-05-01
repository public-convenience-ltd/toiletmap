import faker from '@faker-js/faker';
import _ from 'lodash';

describe('Adding new toilets to the platform', () => {
  context('Mobile', () => {
    beforeEach(() => {
      cy.viewport('iphone-8');
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
      cy.get('.toilet-marker').should('not.exist');
    });

    it('should load the add toilet page at the specified latitude and longitude', () => {
      cy.visit('/loos/add?lat=51.61008861374827&lng=0.10883331298828125');
      cy.contains('Align the crosshair');
      cy.get('[data-toiletid=8e4a982a402cbbebb1147340]').should('exist');
    });

    const generateToiletSettings = () => {
      const inputStates = ['yes', 'no', 'na'];
      const detailStates = [/^available/, /^unavailable/, /^unknown/];

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

    it('should add a toilet at the specified latitude and longitude after submitting the form', () => {
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

        cy.findByText(detail[0]).siblings().contains(detail[1]);
      }

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
    });
  });
});
