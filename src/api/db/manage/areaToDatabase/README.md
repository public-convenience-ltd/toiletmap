# Area to Database

Previously existed at https://github.com/jthistle/areaToDatabase.

## Installation

`yarn`

## Config

Notes on config fields:

- `datasets`: an array of objects with the form:
  - `id`: a unique identifier for this dataset, which must be kept the same if you want any changes to _update_ the database rather than simply append to it.
  - `src`: an object with the form:
    - `remote`: whether the data source is an internet url or local file
    - `url`: the location of the resource; a url if remote, a file path if not
  - `version`: the version of this dataset. Increment this whenever the source file or anything to do with this dataset changes.
  - `priority`: if a loo lands within multiple areas, the one with the highest priority will be the one to which it is assigned.
  - `type`: the name of this type of area, e.g. 'Local Authority'
  - `areaNameField`: the field which contains the name of the area in the GeoJSON file

Please, commit changes to `config.json`!

## Usage

Run `yarn areas`.

Options, if you're modifying what `yarn areas` runs:

- `-n`, `--dry-run`  Don't update the database, just output what would be done.

## I want to...

### ...add a new dataset to the database

Simple! Just add a new object to the 'datasets' array with a unique `id`. Start the version at `1` probably. Make sure `areaNameField` is set.

### ...update an existing dataset

Also simple! If you want to update a dataset without touching others, just increment the `version` number of that dataset. This will drop any areas added with different
version numbers and the same dataset `id`, and repopulate the database with this dataset.

### ...remove a dataset from the dataset

This is not a functionality of this script (for safety reasons). Run a mongo query to drop areas by `datasetId`.
