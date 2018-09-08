import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Downshift from 'downshift';
import deburr from 'lodash/deburr';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import CloseOutlined from '@material-ui/icons/CloseOutlined';

const styles = theme => ({});

const renderInput = inputProps => {
  const { InputProps, classes, ref, ...other } = inputProps;

  return (
    <TextField
      InputProps={{
        inputRef: ref,
        classes: {
          root: classes.inputRoot,
        },
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
  const isSelected = (selectedItem || '').indexOf(suggestion.label) > -1;

  return (
    <MenuItem
      {...itemProps}
      key={suggestion.label}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400,
      }}
    >
      {suggestion.label}
    </MenuItem>
  );
};

class SearchAutocomplete extends Component {
  /**
   *
   * Returns an array of suggestions based upon an input string and provided array.
   *
   * @param {*} data
   * @param {*} value
   */
  getSuggestions(data, value) {
    const inputValue = deburr(value.trim()).toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    return inputLength === 0
      ? []
      : data.filter(suggestion => {
          const keep =
            count < 5 &&
            suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;

          if (keep) {
            count += 1;
          }

          return keep;
        });
  }

  render() {
    const {
      classes,
      id,
      onChange,
      selectedItem,
      suggestions,
      placeholderText,
      clearAriaLabel,
      ...others
    } = this.props;

    return (
      <Downshift
        id={id}
        onChange={onChange}
        selectedItem={selectedItem}
        {...others}
      >
        {({
          getInputProps,
          getItemProps,
          isOpen,
          inputValue,
          selectedItem,
          highlightedIndex,
          clearSelection,
        }) => (
          <div className={classes.container}>
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
              <Paper className={classes.paper} square>
                {this.getSuggestions(suggestions, inputValue).map(
                  (suggestion, index) =>
                    renderSuggestion({
                      suggestion,
                      index,
                      itemProps: getItemProps({
                        item: suggestion.label,
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
}

SearchAutocomplete.propTypes = {
  classes: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  suggestions: PropTypes.array.isRequired,
};

export default withStyles(styles)(SearchAutocomplete);
