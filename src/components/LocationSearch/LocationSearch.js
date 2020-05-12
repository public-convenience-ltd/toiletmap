import React from 'react';
import { Helmet } from 'react-helmet';
import { useCombobox } from 'downshift';
import { useTheme } from 'emotion-theming';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

import Box from '../Box';

import usePlacesAutocomplete from './usePlacesAutocomplete';

import styles from './location-search.module.css';
import poweredByGoogle from './powered_by_google.png';

const Input = styled.input(
  ({ theme }) => `
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.radii[4]}px;
  padding: ${theme.space[2]}px 3rem;
  padding-left: 3rem;
  width: 100%;

  ::-webkit-input-placeholder {
    color: ${theme.colors.primary};
  }

  :-ms-input-placeholder {
    color: ${theme.colors.primary};
  }

  ::placeholder {
    color: ${theme.colors.primary};
  }
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
    itemToString: (item) => item.label + ', ' + item.subLabel,
    onSelectedItemChange: handleSelectedItemChange,
    stateReducer,
  });

  const resultsFragment = places.length ? (
    <ul className={styles.menuList} {...getMenuProps()}>
      {places.map((item, index) => (
        <li
          key={item.id}
          className={styles.menuListItem}
          style={{
            backgroundColor:
              highlightedIndex === index ? '#eee' : 'transparent',
          }}
          {...getItemProps({ item, index })}
        >
          <span className={styles.itemLabel}>{item.label}</span> {item.subLabel}
        </li>
      ))}
    </ul>
  ) : (
    <div className={styles.emptyState}>No results found</div>
  );

  return (
    <>
      <Helmet>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`}
        />
      </Helmet>

      <label className={styles.label} {...getLabelProps()}>
        Search for a location
      </label>

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
            color={theme.colors.active}
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

      {isOpen && (
        <div className={styles.menuContainer}>
          {resultsFragment}
          <img
            className={styles.poweredByGoogleLogo}
            src={poweredByGoogle}
            alt="Powered by Google"
          />
        </div>
      )}
    </>
  );
};

export default LocationSearch;
