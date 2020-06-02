import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { useForm, Controller } from 'react-hook-form';
import isFunction from 'lodash/isFunction';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

import Container from '../components/Container';
import Notification from '../components/Notification';
import Box from '../components/Box';
import Text from '../components/Text';
import Spacer from '../components/Spacer';
import VisuallyHidden from '../components/VisuallyHidden';
import Switch from '../components/Switch';
import ConditionalWrap from '../components/ConditionalWrap';
import { WEEKDAYS, rangeTypes } from '../openingTimes';

import crosshair from '../images/crosshair-small.svg';

const openingTimesFields = WEEKDAYS.flatMap((day) => {
  return [
    `${day.toLowerCase()}-is-open`,
    `${day.toLowerCase()}-opens`,
    `${day.toLowerCase()}-closes`,
  ];
});

const Input = styled.input`
  display: block;
  width: 100%;
  margin-top: ${(props) => props.theme.space[1]}px;
  padding: ${(props) => props.theme.space[2]}px;
  color: ${(props) => props.theme.colors.primary};
  border: 1px solid ${(props) => props.theme.colors.primary};
`;

const Textarea = styled.textarea`
  display: block;
  height: 10rem;
  width: 100%;
  margin-top: ${(props) => props.theme.space[1]}px;
  padding: ${(props) => props.theme.space[2]}px;
  color: ${(props) => props.theme.colors.primary};
  border: 1px solid ${(props) => props.theme.colors.primary};
`;

const RadioInput = styled.input`
  /* visually hidden */
  position: absolute;
  clip: rect(1px, 1px, 1px, 1px);
  padding: 0;
  border: 0;
  height: 1px;
  width: 1px;
  overflow: hidden;

  + span {
    position: relative;
    display: block;
    height: 1.5rem;
    width: 1.5rem;
    margin: 0 auto;
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-radius: 50%;
  }

  :checked + span:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: calc(100% - 8px);
    width: calc(100% - 8px);
    background-color: ${(props) => props.theme.colors.primary};
    border-radius: 50%;
  }

  &[data-focus-visible-added] + span {
    outline: 1px dotted currentColor;
    outline-offset: 0.5rem;
  }
`;

const Radio = React.forwardRef((props, ref) => (
  <>
    <RadioInput type="radio" ref={ref} {...props} />
    <span />
  </>
));

const Section = ({ register, id, title, questions, children }) => (
  <div role="group" aria-labelledby={`heading-${id}`}>
    <table
      role="presentation"
      css={{
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 1em',
        margin: '-1em 0',
      }}
    >
      <thead>
        <tr>
          <th>
            <h2 id={`heading-${id}`}>{title}</h2>
          </th>

          <Text as="th" id={`${id}-yes`} textAlign="center" fontSize={[14, 16]}>
            <span aria-hidden="true">Yes</span>
          </Text>

          <Text as="th" id={`${id}-no`} textAlign="center" fontSize={[14, 16]}>
            <span aria-hidden="true">No</span>
          </Text>

          <Text
            as="th"
            id={`${id}-unknown`}
            textAlign="center"
            fontSize={[14, 16]}
          >
            <span aria-hidden="true">Don't know</span>
          </Text>
        </tr>
      </thead>

      <Box as="tbody" pl={[2, 4]}>
        {questions.map(({ field, label, value, onChange }) => (
          <Box as="tr" key={field} mt={3} onChange={onChange}>
            <Box as="td" width="52%" pl={[2, 4]}>
              {label}
            </Box>
            <Text as="td" textAlign="center" css={{ width: '16%' }}>
              <label>
                <VisuallyHidden>Yes</VisuallyHidden>
                <Radio
                  ref={register}
                  name={field}
                  value={true}
                  defaultChecked={value === true}
                  data-testid={`${field}:no`}
                />
              </label>
            </Text>

            <Text as="td" textAlign="center" css={{ width: '16%' }}>
              <label>
                <VisuallyHidden>No</VisuallyHidden>
                <Radio
                  ref={register}
                  name={field}
                  value={false}
                  aria-labelledby={`${id}-no`}
                  defaultChecked={value === false}
                  data-testid={`${field}:no`}
                />
              </label>
            </Text>

            <Text as="td" textAlign="center" css={{ width: '16%' }}>
              <label>
                <VisuallyHidden>Don't know</VisuallyHidden>
                <Radio
                  ref={register}
                  name={field}
                  value=""
                  aria-labelledby={`${id}-no`}
                  defaultChecked={value !== true && value !== false}
                  data-testid={`${field}:no`}
                />
              </label>
            </Text>
          </Box>
        ))}
      </Box>
    </table>

    {children}
  </div>
);

const EntryForm = ({ title, loo, center, children, ...props }) => {
  const [noPayment, setNoPayment] = useState(loo.noPayment);

  const hasOpeningTimes = Boolean(loo.openingTimes);

  const isOpen = loo.openingTimes
    ? loo.openingTimes.map((x) => x !== rangeTypes.CLOSED)
    : WEEKDAYS.map(() => false);

  const {
    register,
    control,
    handleSubmit,
    formState,
    setValue,
    getValues,
  } = useForm();

  // read the formState before render to subscribe the form state through Proxy
  const { dirtyFields } = formState;

  const onSubmit = (data) => {
    const dirtyFieldNames = Array.from(dirtyFields.keys());

    // only include fields which have been modified
    let transformed = pick(data, dirtyFieldNames);

    transformed = omit(transformed, ['geometry']);

    // transform data
    Object.keys(transformed).forEach((property) => {
      const value = transformed[property];

      if (value === 'true') {
        transformed[property] = true;
      } else if (value === 'false') {
        transformed[property] = false;
      } else if (value === '') {
        transformed[property] = null;
      }
    });

    // map geometry data to expected structure
    transformed.location = {
      lat: parseFloat(data.geometry.coordinates[0]),
      lng: parseFloat(data.geometry.coordinates[1]),
    };

    if (dirtyFieldNames.includes('noPayment') && data.noPayment) {
      transformed.paymentDetails = null;
    }

    // construct expected opening times structure if relevant fields have changed
    if (
      [...openingTimesFields, 'has-opening-times'].some(
        (field) => dirtyFieldNames.indexOf(field) >= 0
      )
    ) {
      if (data['has-opening-times']) {
        const openingTimes = WEEKDAYS.map((day, index) => {
          if (!data[`${day.toLowerCase()}-is-open`]) {
            return rangeTypes.CLOSED;
          }

          return [
            data[`${day.toLowerCase()}-opens`],
            data[`${day.toLowerCase()}-closes`],
          ];
        });

        transformed.openingTimes = openingTimes;
      } else {
        transformed.openingTimes = null;
      }
    }

    transformed = omit(transformed, [
      'geometry',
      'noPayment',
      'has-opening-times',
      ...openingTimesFields,
    ]);

    props.onSubmit(transformed);
  };

  useEffect(() => {
    // readonly fields won't fire a change event
    // setValue ensures that the fields will be marked as dirty
    setValue('geometry.coordinates.0', center.lat);
    setValue('geometry.coordinates.1', center.lng);
  }, [center, setValue]);

  return (
    <Container maxWidth={846}>
      <Text fontSize={[16, 18]}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Text fontWeight="bold" fontSize={30} textAlign="center">
            <h1>{title}</h1>
          </Text>

          <Spacer mt={4} />

          <Box display="flex" alignItems="center" flexWrap="wrap">
            <span>1. Align the crosshair&nbsp;</span>
            <Box as="span" display="flex" css={{ whiteSpace: 'nowrap' }}>
              (&nbsp;
              <img src={crosshair} alt="crosshair" css={{ height: '1.5em' }} />
              &nbsp;)
            </Box>
            &nbsp;
            <span>with where you believe the toilet to be</span>
          </Box>

          <Spacer mt={4} />

          <label>
            2. Add a toilet name
            <Input
              ref={register}
              name="name"
              type="text"
              defaultValue={loo.name || ''}
              placeholder="e.g. Sainsburys or street name"
              data-testid="toilet-name"
              css={{
                maxWidth: '400px',
              }}
            />
          </label>

          <Spacer mt={4} />

          <Section
            register={register}
            id="who"
            title="3. Who can use these toilets?"
            questions={[
              {
                field: 'female',
                label: 'Women?',
                value: loo['female'],
              },
              {
                field: 'male',
                label: 'Men?',
                value: loo['male'],
              },
              {
                field: 'accessible',
                label: 'Is there disabled access?',
                value: loo['accessible'],
              },
              {
                field: 'radar',
                label: 'Does this toilet have a RADAR lock?',
                value: loo['radar'],
              },
            ]}
          />

          <Spacer mt={4} />

          <Section
            register={register}
            id="what"
            title="4. At this toilet is there ..."
            questions={[
              {
                field: 'allGender',
                label: 'An all gender toilet?',
                value: loo['allGender'],
              },
              {
                field: 'childrenOnly',
                label: 'A children’s toilet?',
                value: loo['childrenOnly'],
              },
              {
                field: 'babyChange',
                label: 'Baby Changing?',
                value: loo['babyChange'],
              },
              {
                field: 'urinalOnly',
                label: 'Only a urinal?',
                value: loo['urinalOnly'],
              },
              {
                field: 'automatic',
                label: 'An automatic / self-cleaning toilet?',
                value: loo['automatic'],
              },
            ]}
          />

          <Spacer mt={4} />

          <Section
            register={register}
            id="payment"
            title="5. Is this toilet free?"
            questions={[
              {
                field: 'isFree',
                label: <VisuallyHidden>Is this toilet free?</VisuallyHidden>,
                value: noPayment === null ? '' : noPayment,
                onChange: ({ target: { value } }) => {
                  // payment is required if the toilet is not free
                  setNoPayment(value === '' ? null : value === 'true');
                },
              },
            ]}
          >
            {noPayment === false && (
              <label>
                Payment Details
                <Input
                  ref={register({
                    required: true,
                  })}
                  name="paymentDetails"
                  type="text"
                  defaultValue={loo.paymentDetails || ''}
                  placeholder="The amount e.g. 20p"
                  data-testid="paymentDetails"
                  css={{
                    maxWidth: '200px',
                  }}
                />
              </label>
            )}
          </Section>

          <Spacer mt={4} />

          <h2 id="opening-hours-heading">6. Do you know the opening hours?</h2>

          <Controller
            as={Switch}
            aria-labelledby="opening-hours-heading"
            name="has-opening-times"
            control={control}
            valueName="checked"
            defaultValue={hasOpeningTimes}
          />

          <Spacer mt={3} />

          <ConditionalWrap
            condition={!getValues('has-opening-times')}
            wrap={(children) => <VisuallyHidden>{children}</VisuallyHidden>}
          >
            <>
              <ol>
                {WEEKDAYS.map((day, index) => {
                  const id = `heading-${day.toLowerCase()}`;

                  return (
                    <Box
                      as="li"
                      key={day}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mt={index === 0 ? undefined : 2}
                    >
                      <h3 id={id}>{day}</h3>

                      <Box display="flex" alignItems="center">
                        <Controller
                          as={Switch}
                          aria-labelledby={id}
                          name={`${day.toLowerCase()}-is-open`}
                          control={control}
                          valueName="checked"
                          defaultValue={isOpen[index]}
                        />
                      </Box>

                      {getValues(`${day.toLowerCase()}-is-open`) ? (
                        <Box display="flex" alignItems="center">
                          <input
                            type="time"
                            defaultValue={
                              loo.openingTimes
                                ? loo.openingTimes[index][0]
                                : undefined
                            }
                            name={`${day.toLowerCase()}-opens`}
                            ref={register({
                              required: true,
                            })}
                          />

                          <Spacer ml={2} />

                          <span>to</span>

                          <Spacer ml={2} />

                          <input
                            type="time"
                            defaultValue={
                              loo.openingTimes
                                ? loo.openingTimes[index][1]
                                : undefined
                            }
                            name={`${day.toLowerCase()}-closes`}
                            ref={register({
                              required: true,
                            })}
                          />
                        </Box>
                      ) : (
                        'Closed'
                      )}
                    </Box>
                  );
                })}
              </ol>

              <Spacer mt={4} />
            </>
          </ConditionalWrap>

          <label>
            7. Notes
            <Textarea
              ref={register}
              name="notes"
              defaultValue={loo.notes || ''}
              data-testid="notes"
              placeholder="Add any other useful information about the toilet here"
            />
          </label>

          <Spacer mt={3} />

          <VisuallyHidden>
            <label>
              Latitude
              <Input
                ref={register}
                type="text"
                name="geometry.coordinates.0"
                value={center.lat}
                readOnly
              />
            </label>

            <label>
              Longitude
              <Input
                ref={register}
                type="text"
                name="geometry.coordinates.1"
                data-testid="loo-name"
                value={center.lng}
                readOnly
              />
            </label>
          </VisuallyHidden>

          <Spacer mt={4} />

          {isFunction(children)
            ? children({ hasDirtyFields: dirtyFields.size })
            : children}

          <Spacer mt={4} />

          {props.saveLoading && (
            <Box maxWidth={360} mx="auto">
              <Notification>Saving your changes&hellip;</Notification>
            </Box>
          )}
        </form>
      </Text>
    </Container>
  );
};

EntryForm.propTypes = {
  title: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loo: PropTypes.shape({
    name: PropTypes.string,
    accessible: PropTypes.bool,
    opening: PropTypes.string,
    noPayment: PropTypes.bool,
    paymentDetails: PropTypes.string,
    notes: PropTypes.string,
    openingTimes: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.oneOf([null]),
    ]),
  }),
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  saveLoading: PropTypes.bool,
};

EntryForm.defaultProps = {
  loo: {},
};

export default EntryForm;
