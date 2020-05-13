import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import Container from '../Container';
import Box from '../Box';
import Text from '../Text';
import Spacer from '../Spacer';
import Button from '../Button';

import { TRACKING_STORAGE_KEY } from './';

import config from '../../config';

const TrackingBanner = React.forwardRef((props, ref) => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data, event) => {
    event.preventDefault();

    // set tracking settings in local storage
    config.setSettings(TRACKING_STORAGE_KEY, {
      aaAccepted: data.aa,
      gaAccepted: data.ga,
      trackingStateChosen: true,
    });

    props.onClose();

    // reload window to allow tracking components to check updated local storage values
    window.location.reload();
  };

  return (
    <Box
      as="aside"
      aria-labelledby="heading-tracking"
      position="fixed"
      left={0}
      bottom={0}
      maxHeight="100%"
      width="100%"
      overflowY="auto"
      p={4}
      py={[3, 4]}
      bg="primary"
      color="white"
      zIndex={1}
    >
      <Container>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2
            ref={ref}
            id="heading-tracking"
            // programmatically focused to from the "Cookie Preferences" Footer control
            tabIndex="-1"
          >
            <b>Cookie Policy</b>
          </h2>

          <Text fontSize={14}>
            <Box
              display="flex"
              flexDirection={['column', 'row']}
              justifyContent="space-between"
            >
              <Box maxWidth="130ch">
                <Spacer mt={3} />
                <p>
                  For more detailed information about the cookies we use,{' '}
                  <Link
                    to="/cookies"
                    css={{
                      borderBottom: '1px solid',
                    }}
                  >
                    click here
                  </Link>
                </p>
              </Box>

              <Spacer ml={[0, 5]} mt={[3, 0]} />

              <div
                css={{
                  whiteSpace: 'nowrap',
                }}
              >
                <Box display="flex" flexDirection="column" flexShrink={0}>
                  <fieldset>
                    <Box
                      as="label"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      width="100%"
                    >
                      <b>Opt in to Google Analytics</b>
                      <Spacer ml={5} />
                      <input
                        ref={register}
                        name="ga"
                        type="checkbox"
                        defaultChecked={
                          config.getSetting(
                            TRACKING_STORAGE_KEY,
                            'gaAccepted'
                          ) || false
                        }
                      />
                    </Box>

                    <Spacer mt={2} />

                    <Box
                      as="label"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      width="100%"
                    >
                      <b>Opt in to Adobe Analytics</b>
                      <Spacer ml={5} />
                      <input
                        ref={register}
                        name="aa"
                        type="checkbox"
                        defaultChecked={
                          config.getSetting(
                            TRACKING_STORAGE_KEY,
                            'aaAccepted'
                          ) || false
                        }
                      />
                    </Box>
                  </fieldset>

                  <Spacer mt={3} />

                  <Box display="flex" justifyContent={['center', 'flex-end']}>
                    <Button
                      type="submit"
                      css={{
                        width: '100%',
                      }}
                    >
                      Save and Close
                    </Button>
                  </Box>
                </Box>
              </div>
            </Box>
          </Text>
        </form>
      </Container>
    </Box>
  );
});

TrackingBanner.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default TrackingBanner;
