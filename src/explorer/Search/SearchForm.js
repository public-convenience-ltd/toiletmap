import React from 'react';

import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import RaisedButton from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';

import { useForm, Controller } from 'react-hook-form';

//import { useAuth } from '../../Auth';
//import SearchAutocomplete from './SearchAutocomplete';

export default function SearchForm({ onSubmit, defaultValues }) {
  //const auth = useAuth();
  const { control, handleSubmit } = useForm({
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={4}>
        <Grid item>
          <FormControl>
            <Controller
              name="text"
              label="Search Text"
              as={TextField}
              control={control}
            />
          </FormControl>
        </Grid>

        <Grid item>
          <FormControl>
            <InputLabel htmlFor="order">Order by</InputLabel>
            <Controller
              name="order"
              as={
                <Select>
                  <MenuItem value={'NEWEST_FIRST'} key={0}>
                    Newest First
                  </MenuItem>
                  <MenuItem value={'OLDEST_FIRST'} key={1}>
                    Oldest First
                  </MenuItem>
                </Select>
              }
              control={control}
            />
          </FormControl>
        </Grid>

        <Grid item>
          {/* <FormControl fullWidth>
            <Query query={AREAS_QUERY}>
              {({ loading, error, data }) => {
                if (error) {
                  console.error(error);
                }

                // Suggestions take an array of {label: name} objects, so we need to map
                // the data to this format
                let areas = [];
                if (!loading && data) {
                  areas = data.areas.map((area) => {
                    return {
                      label: area.name,
                    };
                  });
                }

                return (
                  <SearchAutocomplete
                    id="area_name-search"
                    onChange={_.partial(
                      this.updateSearchParam,
                      'area_name'
                    )}
                    selectedItem={
                      this.state.searchParams.area_name
                    }
                    suggestions={areas}
                    placeholderText="Search Areas"
                    ariaLabel="Clear area input box"
                  />
                );
              }}
            </Query>
          </FormControl> */}
        </Grid>

        {/* {auth.checkPermission('VIEW_CONTRIBUTOR_INFO') && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <Query query={CONTRIBUTORS}>
                {({ loading, error, data }) => {
                  if (loading) return null;
                  if (error) {
                    console.error(error);
                    return null;
                  }

                  // Re-map contributors for search autocomplete
                  let contributors = data.contributors.map(
                    (contributor) => ({
                      label: contributor.name,
                    })
                  );

                  return (
                    <SearchAutocomplete
                      id="contributor-search"
                      onChange={_.partial(
                        this.updateSearchParam,
                        'contributors'
                      )}
                      selectedItem={
                        this.state.searchParams.contributors
                      }
                      suggestions={contributors}
                      placeholderText="Search Contributors"
                      ariaLabel="Clear contributor input box"
                    />
                  );
                }}
              </Query>
            </FormControl>
          </Grid>
        )} */}

        <Grid item>
          <FormControl>
            <Controller
              name="from_date"
              label="Updated After"
              as={TextField}
              type="date"
              control={control}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormControl>
        </Grid>

        <Grid item>
          <FormControl>
            <Controller
              name="to_date"
              label="Updated before"
              as={TextField}
              type="date"
              control={control}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormControl>
        </Grid>

        <Grid item>
          <RaisedButton
            variant="contained"
            color="primary"
            onClick={handleSubmit(onSubmit)}
          >
            <SearchIcon />
            Search
          </RaisedButton>
        </Grid>
      </Grid>
    </form>
  );
}
