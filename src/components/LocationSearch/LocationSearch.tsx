import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import {
  useCombobox,
  UseComboboxState,
  UseComboboxStateChangeOptions,
} from 'downshift';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import Icon from '../../design-system/components/Icon';
import Box from '../Box';
import VisuallyHidden from '../../design-system/utilities/VisuallyHidden';

import useNominatimAutocomplete, { Place } from './useNominatimAutocomplete';

const Input = styled.input(
  ({ theme }) => `
      border: 1px solid ${theme.colors.primary};
      border-radius: ${theme.radii[4]}px;
      padding: ${theme.space[2]}px 3rem;
      padding-left: 3rem;
      width: 100%;
    `,
);

interface LocationSearchProps {
  onSelectedItemChange: (coords: { lat: number; lng: number }) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onSelectedItemChange,
}) => {
  const [query, setQuery] = React.useState('');
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const { places, getPlaceLatLng } = useNominatimAutocomplete(query);

  const handleSelectedItemChange = async ({
    selectedItem,
  }: UseComboboxStateChangeOptions<Place>) => {
    if (!selectedItem) {
      return;
    }

    const { lat, lng } = getPlaceLatLng(selectedItem);
    onSelectedItemChange({ lat, lng });
    // Remove focus from the input box to close the dropdown on mobile.
    inputRef.current?.blur();
  };

  const stateReducer = (
    state: UseComboboxState<Place>,
    actionAndChanges: UseComboboxStateChangeOptions<Place>,
  ) => {
    switch (actionAndChanges.type) {
      case useCombobox.stateChangeTypes.InputBlur:
        // Prevent reset on blur to keep results open when iOS keyboard is hidden
        return {
          ...actionAndChanges.changes,
          isOpen: state.isOpen,
        };

      case useCombobox.stateChangeTypes.FunctionOpenMenu:
        // Clear the input when opening the menu
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
  } = useCombobox<Place>({
    id: 'search-results',
    items: places,
    onInputValueChange: ({ inputValue }) => setQuery(inputValue || ''),
    itemToString: (item) => (item ? item.label : ''),
    onSelectedItemChange: handleSelectedItemChange,
    stateReducer,
  });

  return (
    <>
      <VisuallyHidden as="div">
        <label htmlFor="searchLocation" {...getLabelProps()}>
          Search for a location
        </label>
      </VisuallyHidden>

      <Box position="relative" {...getComboboxProps()}>
        <Box
          position="absolute"
          top="55%"
          left={3}
          zIndex={1}
          css={{
            transform: 'translateY(-50%)',
          }}
          color={theme.colors.tertiary}
        >
          <Icon icon="magnifying-glass" size="medium" />
        </Box>

        <Input
          placeholder="Search location…"
          name="searchLocation"
          autoComplete="off"
          {...getInputProps({
            ref: inputRef,
            onFocus: () => {
              if (!isOpen) {
                openMenu();
              }
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
              css={{ display: 'flex' }}
              {...getToggleButtonProps()}
            >
              <Icon icon="xmark" size="medium" />
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
                    <span>{item.label}</span>
                  </Box>
                ))
              : 'No results found'}
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
