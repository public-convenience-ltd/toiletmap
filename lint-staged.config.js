// eslint-disable-next-line functional/immutable-data
module.exports = {
  '*.{js,ts,tsx}': ['prettier --write', 'eslint --max-warnings=0'],
  //'**/*.ts?(x)': () => 'tsc -p tsconfig.json --noEmit',
  '*.{json,md,yml}': ['prettier --write'],
};
