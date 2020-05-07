import React from 'react';
import { Helmet } from 'react-helmet';
import { useCombobox } from 'downshift';

import usePlacesAutocomplete from './usePlacesAutocomplete';
import styles from './location-search.module.css';
import poweredByGoogle from './powered_by_google.png';

const LocationSearch = ({ onSelectedItemChange }) => {
  const [query, setQuery] = React.useState('');

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

      <div className={styles.wrapper}>
        <label className={styles.label} {...getLabelProps()}>
          Search for a location
        </label>

        <div className={styles.controls} {...getComboboxProps()}>
          <input
            placeholder="Search for a location"
            className={styles.input}
            style={{
              borderRadius: isOpen ? '5px 5px 0 0' : 5,
              borderBottom: isOpen ? '1px solid #ccc' : 'none',
            }}
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
            <button
              type="button"
              aria-label="close menu"
              className={styles.closeButton}
              {...getToggleButtonProps()}
            >
              Close
            </button>
          )}
        </div>

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
      </div>
    </>
  );
};

export default LocationSearch;
