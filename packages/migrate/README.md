# migrate

Tools useful for migrating from the legacy to future loo and report schemas.

## Dependencies

Ensure that `@neontribe/gbptm-api` is correctly setup, as there is a dependency
on files within that package.

## Usage

Dry-run of conversion of reports to the new schema, producing JSON output in `data/`:

```bash
yarn export-new-reports
```

Generate markdown summary of core loo values in the newly-generated reports (requires previous step):

```bash
yarn summarise-report-values
```
