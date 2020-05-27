import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useCombobox } from 'downshift';
import { useTheme } from 'emotion-theming';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

import Box from '../Box';
import VisuallyHidden from '../VisuallyHidden';

import usePlacesAutocomplete from './usePlacesAutocomplete';

import poweredByGoogle from './powered_by_google.png';

const Input = styled.input(
  ({ theme }) => `
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.radii[4]}px;
  padding: ${theme.space[2]}px 3rem;
  padding-left: 3rem;
  width: 100%;
`
);

const LocationSearch = ({ onSelectedItemChange }) => {
  const [query, setQuery] = React.useState('');
  const theme = useTheme();

  const { places, getPlaceById } = usePlacesAutocomplete(query);

  const handleSelectedItemChange = async ({ selectedItem }) => {
    if (!selectedItem) {
      return;
    }

    const result = await getPlaceById(selectedItem.placeId);
    const { lat, lng } = result.geometry.location;

    onSelectedItemChange({ lat: lat(), lng: lng() });
  };

  const stateReducer = (state, actionAndChanges) => {
    switch (actionAndChanges.type) {
      case useCombobox.stateChangeTypes.InputBlur:
        // Prevents reset on blur to fix results being closed when iOS keyboard is hidden
        return {
          ...actionAndChanges.changes,
          isOpen: state.isOpen,
        };

      case useCombobox.stateChangeTypes.FunctionOpenMenu:
        // Always clear the input when opening the menu
        return {
          ...actionAndChanges.changes,
          inputValue: '',
        };

      case useCombobox.stateChangeTypes.ToggleButtonClick:
        // Clear the value when toggle button is clicked unless an item is selected
        return {
          ...actionAndChanges.changes,
          inputValue: state.selectedItem ? state.inputValue : '',
        };

      default:
        return actionAndChanges.changes;
    }
  };

  const {
    isOpen,
    getLabelProps,
    openMenu,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: places,
    onInputValueChange: ({ inputValue }) => setQuery(inputValue),
    itemToString: (item) => (item ? `${item.label}, ${item.subLabel}` : ''),
    onSelectedItemChange: handleSelectedItemChange,
    stateReducer,
  });

  return (
    <>
      <Helmet>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`}
        />
      </Helmet>

      <VisuallyHidden>
        <label {...getLabelProps()}>Search for a location</label>
      </VisuallyHidden>

      <Box position="relative" {...getComboboxProps()}>
        <Box
          position="absolute"
          top="50%"
          left={3}
          zIndex={1}
          css={{
            transform: 'translateY(-50%)',
          }}
        >
          <FontAwesomeIcon
            icon={faSearch}
            fixedWidth
            color={theme.colors.tertiary}
          />
        </Box>

        <Input
          placeholder="search location…"
          autoComplete="off"
          {...getInputProps({
            onFocus: () => {
              if (isOpen) {
                return;
              }
              openMenu();
            },
          })}
        />

        {isOpen && (
          <Box
            position="absolute"
            top="50%"
            right={3}
            css={{
              transform: 'translateY(-50%)',
            }}
          >
            <button
              type="button"
              aria-label="close menu"
              {...getToggleButtonProps()}
            >
              <FontAwesomeIcon icon={faTimes} fixedWidth />
            </button>
          </Box>
        )}
      </Box>

      <Box
        p={[3, 0]}
        mt={3}
        bg="white"
        borderRadius={2}
        display={isOpen ? undefined : 'none'}
        {...getMenuProps()}
      >
        {isOpen && (
          <>
            {places.length
              ? places.map((item, index) => (
                  <Box
                    key={item.id}
                    color={highlightedIndex === index ? 'tertiary' : undefined}
                    py={2}
                    border={0}
                    borderBottom={index !== places.length - 1 ? 1 : undefined}
                    borderStyle="solid"
                    borderColor="lightGrey"
                    css={{
                      cursor: 'pointer',
                    }}
                    {...getItemProps({ item, index })}
                  >
                    <span>{item.label}</span> {item.subLabel}
                  </Box>
                ))
              : 'No results found'}

            <Box
              as="img"
              src={poweredByGoogle}
              alt="Powered by Google"
              mt={3}
              maxWidth={120}
            />
          </>
        )}
      </Box>
    </>
  );
};

LocationSearch.propTypes = {
  onSelectedItemChange: PropTypes.func.isRequired,
};

export default LocationSearch;
