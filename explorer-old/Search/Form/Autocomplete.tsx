import React from 'react';
import useSWR from 'swr';
import Downshift from 'downshift';
import deburr from 'lodash/deburr';

import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import CloseOutlined from '@material-ui/icons/CloseOutlined';

const renderInput = (inputProps: { [x: string]: unknown; fullWidth?: boolean; classes: unknown; InputProps: unknown; ref?: unknown; }) => {
  const { InputProps, classes, ref, ...other } = inputProps;

  return (
    <TextField
      InputProps={{
        inputRef: ref,
        ...InputProps,
      }}
      {...other}
    />
  );
};

const renderSuggestion = ({
  suggestion,
  index,
  itemProps,
  highlightedIndex,
  selectedItem,
}) => {
  const isHighlighted = highlightedIndex === index;
  const isSelected = (selectedItem || '').indexOf(suggestion) > -1;

  return (
    <MenuItem
      {...itemProps}
      key={suggestion}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400,
      }}
    >
      {suggestion}
    </MenuItem>
  );
};

function filterSuggestions(data: unknown[], value: string) {
  const inputValue = deburr(value.trim()).toLowerCase();
  const inputLength = inputValue.length;
  let count = 0;

  return inputLength === 0
    ? []
    : data.filter((suggestion: string) => {
        const keep =
          count < 5 &&
          suggestion.slice(0, inputLength).toLowerCase() === inputValue;

        if (keep) {
          count += 1;
        }

        return keep;
      });
}

function Autocomplete(props: { [x: string]: unknown; classes: unknown; id: unknown; onChange: unknown; value: unknown; query: unknown; placeholderText: unknown; clearAriaLabel: unknown; }) {
  const {
    classes,
    id,
    onChange,
    value,
    query,
    placeholderText,
    clearAriaLabel,
    ...others
  } = props;

  const { data } = useSWR(query);

  const items = data?.items?.map((i: { label: unknown; }) => i.label) || [];

  return (
    <Downshift id={id} onChange={onChange} selectedItem={value} {...others}>
      {({
        getInputProps,
        getItemProps,
        isOpen,
        inputValue,
        selectedItem,
        highlightedIndex,
        clearSelection,
      }) => (
        <div>
          {renderInput({
            fullWidth: true,
            classes,
            InputProps: getInputProps({
              placeholder: placeholderText,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={clearAriaLabel}
                    onClick={clearSelection}
                  >
                    <CloseOutlined />
                  </IconButton>
                </InputAdornment>
              ),
            }),
          })}
          {isOpen ? (
            <Paper square>
              {filterSuggestions(items, inputValue).map((suggestion, index) =>
                renderSuggestion({
                  suggestion,
                  index,
                  itemProps: getItemProps({
                    item: suggestion,
                  }),
                  highlightedIndex,
                  selectedItem,
                })
              )}
            </Paper>
          ) : null}
        </div>
      )}
    </Downshift>
  );
}

export default Autocomplete;
