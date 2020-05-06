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

  const {
    isOpen,
    getLabelProps,
    setInputValue,
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
            onFocus={() => setInputValue('')}
            placeholder="Search for a location"
            className={styles.input}
            style={{
              borderRadius: isOpen ? '5px 5px 0 0' : 5,
              borderBottom: isOpen ? '1px solid #ccc' : 'none',
            }}
            {...getInputProps()}
          />
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
