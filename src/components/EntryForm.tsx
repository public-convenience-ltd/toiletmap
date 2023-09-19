import React, { useEffect, useState, useMemo } from 'react';
import styled from '@emotion/styled';
import {
  useForm,
  Controller,
  UseFormRegister,
  FieldValues,
} from 'react-hook-form';
import Image from 'next/legacy/image';
import Radio from '../design-system/components/RadioInput';
import isFunction from 'lodash/isFunction';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import zipObject from 'lodash/zipObject';
import { ErrorMessage } from '@hookform/error-message';
import Container from '../components/Container';
import InputField from '../design-system/components/InputField';
import Notification from '../components/Notification';
import Box from '../components/Box';
import Text from '../components/Text';
import Spacer from '../components/Spacer';
import VisuallyHidden from '../components/VisuallyHidden';
import Switch from '../components/Switch';
import { WEEKDAYS, isClosed, Weekdays } from '../lib/openingTimes';
import crosshair from '../../public/crosshair-small.svg';

import { useMapState } from './MapState';
import Icon from '../design-system/components/Icon';
import { css } from '@emotion/react';

type OpeningDayStates =
  | `${Lowercase<Weekdays>}-is-open`
  | `${Lowercase<Weekdays>}-opens`
  | `${Lowercase<Weekdays>}-closes`;

const openingTimesFields = WEEKDAYS.flatMap((day): OpeningDayStates[] => {
  const lowercaseDay = day.toLowerCase() as Lowercase<Weekdays>;
  return [
    `${lowercaseDay}-is-open`,
    `${lowercaseDay}-opens`,
    `${lowercaseDay}-closes`,
  ];
});

const Textarea = styled.textarea`
  display: block;
  height: 10rem;
  width: 100%;
  margin-top: ${(props) => props.theme.space[1]}px;
  padding: ${(props) => props.theme.space[2]}px;
  color: ${(props) => props.theme.colors.primary};
  border: 1px solid ${(props) => props.theme.colors.primary};
`;

interface Question {
  field: string;
  subQuestion: string | React.ReactElement;
  value: boolean | null | '';
  onChange?: React.FormEventHandler<HTMLDivElement>;
}

interface Section {
  register: UseFormRegister<FieldValues>;
  id: string;
  title: string;
  questions: Question[];
  children?: React.ReactNode;
}

const Section: React.FC<Section> = ({
  register,
  id,
  title,
  questions,
  children,
}) => {
  return (
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

            <Text
              as="th"
              id={`${id}-yes`}
              textAlign="center"
              fontSize={[14, 16]}
            >
              <span aria-hidden="true">Yes</span>
            </Text>

            <Text
              as="th"
              id={`${id}-no`}
              textAlign="center"
              fontSize={[14, 16]}
            >
              <span aria-hidden="true">No</span>
            </Text>

            <Text
              as="th"
              id={`${id}-unknown`}
              textAlign="center"
              fontSize={[14, 16]}
            >
              <span aria-hidden="true">Don&apos;t know</span>
            </Text>
          </tr>
        </thead>

        <Box as="tbody" pl={[2, 4]}>
          {questions.map(({ field, subQuestion, value, onChange }) => {
            return (
              <Box as="tr" key={field} mt={3} onChange={onChange}>
                <Box as="td" width="52%" pl={[2, 4]}>
                  {subQuestion}
                </Box>
                <Text as="td" textAlign="center" css={{ width: '16%' }}>
                  <label htmlFor={`${field}:yes`}>
                    <VisuallyHidden>Yes</VisuallyHidden>

                    <Radio
                      name={field}
                      id={`${field}:yes`}
                      value={'true'}
                      defaultChecked={value === true}
                      aria-labelledby={`${id}-yes`}
                      data-testid={`${field}:yes`}
                      {...register(field)}
                    />
                  </label>
                </Text>

                <Text as="td" textAlign="center" css={{ width: '16%' }}>
                  <label htmlFor={`${field}:no`}>
                    <VisuallyHidden>No</VisuallyHidden>

                    <Radio
                      name={field}
                      id={`${field}:no`}
                      value={'false'}
                      defaultChecked={value === false}
                      aria-labelledby={`${id}-no`}
                      data-testid={`${field}:no`}
                      {...register(field)}
                    />
                  </label>
                </Text>

                <Text as="td" textAlign="center" css={{ width: '16%' }}>
                  <label htmlFor={`${field}:na`}>
                    <VisuallyHidden>Don&apos;t know</VisuallyHidden>

                    <Radio
                      id={`${field}:na`}
                      name={field}
                      value=""
                      aria-labelledby={`${id}-na`}
                      defaultChecked={value == undefined || value === ''}
                      data-testid={`${field}:na`}
                      {...register(field)}
                    />
                  </label>
                </Text>
              </Box>
            );
          })}
        </Box>
      </table>

      {children}
    </div>
  );
};

const EntryForm = ({ title, loo, children, ...props }) => {
  const [noPayment, setNoPayment] = useState(loo.noPayment);
  const [mapState] = useMapState();
  const [mapMoved, setMapMoved] = useState(false);
  const [editAllHours, setEditAllHours] = useState(false);

  useEffect(
    function registerMapMovedHandler() {
      if (mapState?.map) {
        mapState?.map?.on('dragend', () => {
          setMapMoved(true);
        });
      }
    },
    [mapState?.map],
  );

  useEffect(
    function setMapMovedIfSearchHappened() {
      if (mapState.searchLocation) {
        setMapMoved(true);
      }
    },
    [mapState.searchLocation],
  );

  const hasOpeningTimes = Boolean(loo.openingTimes);

  const isOpen = loo.openingTimes
    ? loo.openingTimes.map((x: string | unknown[]) => !isClosed(x))
    : WEEKDAYS.map(() => false);

  const changeAllHourValues = (event) => {
    if (editAllHours) {
      const formValues = getValues(openingTimesFields);
      const openingHours = zipObject(openingTimesFields, formValues);
      // Determine the target days
      const targetDays = Object.keys(openingHours)
        .filter((key) => openingHours[key] === true)
        .map((day: OpeningDayStates) => day.replace('-is-open', ''));
      // Determine the target fields based on the current target
      const target = event.target.name.endsWith('-opens')
        ? '-opens'
        : '-closes';
      const targetFields = targetDays.flatMap((day) =>
        openingTimesFields.filter(
          (field) => field.includes(day) && field.includes(target),
        ),
      );
      //This probably can be done in a more performant way
      targetFields.forEach((targetField) => {
        setValue(targetField, event.target.value);
      });
    }
  };

  const { register, control, handleSubmit, formState, setValue, getValues } =
    useForm({
      criteriaMode: 'all',
      defaultValues: useMemo(() => {
        return {
          accessible: loo.accessible ? loo.accessible : null,
          name: loo.name ? loo.name : '',
          allGender: loo.allGender ? loo.allGender : null,
          women: loo.women ? loo.women : null,
          men: loo.men ? loo.men : null,
          radar: loo.radar ? loo.radar : null,
          automatic: loo.automatic ? loo.automatic : null,
          babyChange: loo.babyChange ? loo.babyChange : null,
          children: loo.children ? loo.children : null,
          paymentDetails: loo.paymentDetails ? loo.paymentDetails : null,
          isFree: loo.isFree ? loo.isFree : null,
          urinalOnly: loo.urinalOnly ? loo.urinalOnly : null,
          'has-opening-times': loo.openingTimes
            ? Boolean(loo.openingTimes)
            : false,
          'monday-is-open': isOpen[0],
          'monday-opens': loo.openingTimes ? loo.openingTimes[0][0] : '',
          'monday-closes': loo.openingTimes ? loo.openingTimes[0][1] : '',
          'tuesday-is-open': isOpen[1],
          'tuesday-opens': loo.openingTimes ? loo.openingTimes[1][0] : '',
          'tuesday-closes': loo.openingTimes ? loo.openingTimes[1][1] : '',
          'wednesday-is-open': isOpen[2],
          'wednesday-opens': loo.openingTimes ? loo.openingTimes[2][0] : '',
          'wednesday-closes': loo.openingTimes ? loo.openingTimes[2][1] : '',
          'thursday-is-open': isOpen[3],
          'thursday-opens': loo.openingTimes ? loo.openingTimes[3][0] : '',
          'thursday-closes': loo.openingTimes ? loo.openingTimes[3][1] : '',
          'friday-is-open': isOpen[4],
          'friday-opens': loo.openingTimes ? loo.openingTimes[4][0] : '',
          'friday-closes': loo.openingTimes ? loo.openingTimes[4][1] : '',
          'saturday-is-open': isOpen[5],
          'saturday-opens': loo.openingTimes ? loo.openingTimes[5][0] : '',
          'saturday-closes': loo.openingTimes ? loo.openingTimes[5][1] : '',
          'sunday-is-open': isOpen[6],
          'sunday-opens': loo.openingTimes ? loo.openingTimes[6][0] : '',
          'sunday-closes': loo.openingTimes ? loo.openingTimes[6][1] : '',
          geometry: {
            coordinates: [0, 0],
          },
          notes: loo['notes'] ? loo['notes'] : '',
        };
      }, [loo, isOpen]),
    });

  // read the formState before render to subscribe the form state through Proxy
  const { isDirty, dirtyFields } = formState;
  const onSubmit = (data: { [x: string]: unknown }) => {
    const dirtyFieldNames = Object.keys(dirtyFields);

    // only include fields which have been modified
    let transformed = pick(data, dirtyFieldNames);

    transformed = omit(transformed, ['geometry']);

    // eslint-disable-next-line functional/immutable-data
    transformed.noPayment = data.isFree;

    // transform data
    Object.keys(transformed).forEach((property) => {
      const value = transformed[property];

      if (value === 'true') {
        // eslint-disable-next-line functional/immutable-data
        transformed[property] = true;
      } else if (value === 'false') {
        // eslint-disable-next-line functional/immutable-data
        transformed[property] = false;
      } else if (value === '') {
        // eslint-disable-next-line functional/immutable-data
        transformed[property] = null;
      }
    });

    // map geometry data to expected structure
    // eslint-disable-next-line functional/immutable-data
    transformed.location = {
      lat: data.geometry.coordinates[0],
      lng: data.geometry.coordinates[1],
    };

    // remove payment details if the isFree field value has changed and is now
    // either Yes or Don't know
    if (dirtyFieldNames.includes('isFree') && data.isFree !== 'false') {
      // eslint-disable-next-line functional/immutable-data
      transformed.paymentDetails = null;
    }

    // construct expected opening times structure if relevant fields have changed
    if (
      [...openingTimesFields, 'has-opening-times'].some(
        (field: string) => dirtyFieldNames.indexOf(field) >= 0,
      )
    ) {
      if (data['has-opening-times']) {
        const openingTimes = WEEKDAYS.map((day) => {
          const lowercaseDay = day.toLowerCase();
          if (!data[`${lowercaseDay}-is-open`]) {
            return [];
          }

          return [
            data[`${lowercaseDay}-opens`],
            data[`${lowercaseDay}-closes`],
          ];
        });

        // eslint-disable-next-line functional/immutable-data
        transformed.openingTimes = openingTimes;
      } else {
        // eslint-disable-next-line functional/immutable-data
        transformed.openingTimes = null;
      }
    }

    transformed = omit(transformed, [
      'geometry',
      'isFree',
      'has-opening-times',
      ...openingTimesFields,
    ]);

    props.onSubmit(transformed);
  };

  // Only base the new location on the map centre if the map has been moved.
  // Otherwise set it based on the coordinates of the loo in question.
  useEffect(() => {
    if (mapMoved) {
      // readonly fields won't fire a change event
      // setValue ensures that the fields will be marked as dirty
      setValue('geometry.coordinates.0', mapState.center.lat);
      setValue('geometry.coordinates.1', mapState.center.lng);
    } else {
      const locationToSet = loo?.location ?? mapState.center;
      setValue('geometry.coordinates.0', locationToSet.lat);
      setValue('geometry.coordinates.1', locationToSet.lng);
    }
  }, [
    loo?.location,
    loo?.location?.lat,
    loo?.location?.lng,
    mapMoved,
    mapState.center,
    mapState.center.lat,
    mapState.center.lng,
    setValue,
  ]);
  return (
    <Container maxWidth={846}>
      <Text fontSize={[16, 18]}>
        <Box
          as="form"
          display="flex"
          flexDirection="column"
          onSubmit={handleSubmit(onSubmit)}
        >
          <VisuallyHidden>
            <h1>{title}</h1>
          </VisuallyHidden>

          <Box display="flex" alignItems="center" flexWrap="wrap">
            <span>1. Align the crosshair&nbsp;</span>
            <Box as="span" display="flex" css={{ whiteSpace: 'nowrap' }}>
              (&nbsp;
              <Image
                src={crosshair}
                alt="crosshair"
                css={{ height: '1.5em' }}
                unoptimized={!!process.env.STORYBOOK}
              />
              &nbsp;)
            </Box>
            &nbsp;
            <span>with where you believe the toilet to be</span>
            <VisuallyHidden>
              <label htmlFor="geometry.coordinates.0">Latitude </label>
              <InputField
                type="text"
                name="geometry.coordinates.0"
                readOnly
                {...register('geometry.coordinates.0')}
              />

              <label htmlFor="geometry.coordinates.1">Longitude</label>
              <InputField
                type="text"
                name="geometry.coordinates.1"
                readOnly
                {...register('geometry.coordinates.1')}
              />
            </VisuallyHidden>
          </Box>

          <Spacer mt={4} />

          <span>
            <label htmlFor="name"> 2. Add a toilet name</label>
            <ErrorMessage
              errors={formState.errors}
              name={'name'}
              render={({ message }) => (
                <>
                  <Icon
                    aria-hidden={true}
                    size="small"
                    icon="asterisk"
                    data-test="asterisk"
                  ></Icon>
                  <VisuallyHidden as={'span'} role="alert">
                    {message}
                  </VisuallyHidden>
                </>
              )}
            />
          </span>

          <InputField
            name="name"
            type="text"
            defaultValue={loo.name || ''}
            placeholder="e.g. Sainsburys or street name"
            data-testid="toilet-name"
            {...register('name', {
              required: 'Please specify a toilet name',
            })}
          />

          <Spacer mt={4} />

          <Section
            register={register}
            id="who"
            title="3. Who can use these toilets?"
            questions={[
              {
                field: 'women',
                subQuestion: 'Women?',
                value: loo['women'],
              },
              {
                field: 'men',
                subQuestion: 'Men?',
                value: loo['men'],
              },
              {
                field: 'accessible',
                subQuestion: 'Is there a disabled toilet?',
                value: loo['accessible'],
              },
              {
                field: 'radar',
                subQuestion: 'Does this toilet have a RADAR lock?',
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
                subQuestion: 'A gender neutral toilet?',
                value: loo['allGender'],
              },
              {
                field: 'children',
                subQuestion: 'A children’s toilet?',
                value: loo['children'],
              },
              {
                field: 'babyChange',
                subQuestion: 'Baby Changing?',
                value: loo['babyChange'],
              },
              {
                field: 'urinalOnly',
                subQuestion: 'Only a urinal?',
                value: loo['urinalOnly'],
              },
              {
                field: 'automatic',
                subQuestion: 'An automatic / self-cleaning toilet?',
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
                subQuestion: (
                  <VisuallyHidden>Is this toilet free?</VisuallyHidden>
                ),
                value: noPayment === null ? '' : noPayment,
                onChange: (event) => {
                  const input = event.target as HTMLInputElement;
                  // payment is required if the toilet is not free
                  setNoPayment(
                    input.value === '' ? null : input.value === 'true',
                  );
                },
              },
            ]}
          >
            {noPayment === false && (
              <>
                <label htmlFor="paymentDetails">Payment Details</label>
                <InputField
                  name="paymentDetails"
                  type="text"
                  defaultValue={loo.paymentDetails || ''}
                  placeholder="The amount e.g. 20p"
                  data-testid="paymentDetails"
                  {...register('paymentDetails', {
                    required: 'Please specify the toilet payment details.',
                  })}
                />
                <ErrorMessage
                  errors={formState.errors}
                  name="paymentDetails"
                  render={({ message }) => (
                    <p role="alert" css={{ color: 'red' }}>
                      {message}
                    </p>
                  )}
                />
              </>
            )}
          </Section>

          <Spacer mt={4} />

          <h2 id="opening-hours-heading">6. Do you know the opening hours?</h2>

          <Spacer mt={2} />

          <Box display="flex" alignItems="center" ml={[2, 4]}>
            <Controller
              aria-labelledby="opening-hours-heading"
              name="has-opening-times"
              control={control}
              defaultValue={hasOpeningTimes}
              render={({ field }) => (
                <Switch
                  {...field}
                  checked={field.value}
                  onChange={field.onChange}
                  onClick={field.onChange}
                  value={`${field.value}`}
                />
              )}
            />

            <Spacer ml={2} />

            <Text fontSize={2}>
              {getValues('has-opening-times') ? 'Yes' : 'No'}
            </Text>
          </Box>

          <Spacer mt={3} />

          {getValues('has-opening-times') && (
            <div data-testid="opening-hours-selection">
              <ol>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                  pl={[2, 4]}
                  pr={[2, 4]}
                >
                  <input
                    type="checkbox"
                    name="edit-all-day-hours"
                    checked={editAllHours}
                    onChange={() => setEditAllHours(!editAllHours)}
                  />
                  <Spacer ml={1} />
                  <label
                    htmlFor="edit-all-day-hours"
                    css={{ fontSize: 'var(--text-0)' }}
                  >
                    Edit all open hours
                  </label>
                </Box>
                {WEEKDAYS.map((day, index) => {
                  const lowercaseDay = day.toLowerCase() as Lowercase<Weekdays>;
                  const id = `heading-${lowercaseDay}`;

                  return (
                    <Box
                      as="li"
                      key={day}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mt={index === 0 ? undefined : 2}
                      pl={[2, 4]}
                      pr={[2, 4]}
                    >
                      <h3 id={id}>{day}</h3>

                      <Spacer ml={2} />

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        width={['auto', '50%']}
                        mt={2}
                      >
                        <Box display="flex" alignItems="center">
                          <Controller
                            aria-labelledby={id}
                            name={`${lowercaseDay}-is-open`}
                            control={control}
                            defaultValue={isOpen[index]}
                            render={({ field }) => (
                              <Switch
                                {...field}
                                checked={field.value}
                                onChange={field.onChange}
                                onClick={field.onChange}
                                value={field.value}
                              />
                            )}
                          />
                        </Box>

                        <Spacer ml={2} />

                        {getValues(`${lowercaseDay}-is-open`) ? (
                          <Box display="flex" alignItems="center">
                            <input
                              css={css`
                                border: 1px solid;
                              `}
                              type="time"
                              pattern="[0-9]{2}:[0-9]{2}"
                              placeholder="hh:mm"
                              defaultValue={
                                loo.openingTimes
                                  ? loo.openingTimes[index][0]
                                  : undefined
                              }
                              name={`${lowercaseDay}-opens`}
                              {...register(`${lowercaseDay}-opens`, {
                                onChange: changeAllHourValues,
                                required: `Please specify an opening time on ${day}`,
                              })}
                            />
                            <Spacer ml={1} />
                            <ErrorMessage
                              errors={formState.errors}
                              name={`${lowercaseDay}-opens`}
                              render={({ message }) => (
                                <>
                                  <Icon
                                    aria-hidden={true}
                                    size="small"
                                    icon="asterisk"
                                    data-test="asterisk"
                                  ></Icon>
                                  <VisuallyHidden as={'span'} role="alert">
                                    {message}
                                  </VisuallyHidden>
                                </>
                              )}
                            />

                            <Spacer ml={2} />

                            <span>to</span>

                            <Spacer ml={2} />

                            <input
                              css={css`
                                border: 1px solid;
                              `}
                              type="time"
                              pattern="[0-9]{2}:[0-9]{2}"
                              placeholder="hh:mm"
                              defaultValue={
                                loo.openingTimes
                                  ? loo.openingTimes[index][1]
                                  : undefined
                              }
                              name={`${lowercaseDay}-closes`}
                              {...register(`${lowercaseDay}-closes`, {
                                onChange: changeAllHourValues,
                                required: `Please specify a closing time on ${day}`,
                              })}
                            />
                            <Spacer ml={1} />
                            <ErrorMessage
                              errors={formState.errors}
                              name={`${lowercaseDay}-closes`}
                              render={({ message }) => (
                                <>
                                  <Icon
                                    aria-hidden={true}
                                    size="small"
                                    icon="asterisk"
                                    data-test="asterisk"
                                  ></Icon>
                                  <VisuallyHidden as={'span'} role="alert">
                                    {message}
                                  </VisuallyHidden>
                                </>
                              )}
                            />
                          </Box>
                        ) : (
                          'Closed'
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </ol>
            </div>
          )}

          <Spacer mt={4} />

          <label htmlFor="notes">
            7. Notes
            <Textarea
              name="notes"
              defaultValue={loo.notes || ''}
              data-testid="notes"
              placeholder="Add any other useful information about the toilet here"
              {...register('notes')}
            />
          </label>

          <Spacer mt={4} />

          {isFunction(children) ? children({ isDirty }) : children}

          <Spacer mt={4} />

          {props.saveLoading && (
            <Box maxWidth={360} mx="auto">
              <Notification>Saving your changes&hellip;</Notification>
            </Box>
          )}
        </Box>
      </Text>
    </Container>
  );
};

export default EntryForm;
