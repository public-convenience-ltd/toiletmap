module.exports = {
  projects: [
    {
      displayName: 'api',
      testMatch: ['<rootDir>/src/api/**/*.test.js'],
      preset: '@shelf/jest-mongodb',
    },
    {
      displayName: 'ui',
      testMatch: ['<rootDir>/tests/**/*.test.js'],
      preset: 'jest-puppeteer',
    },
    {
      displayName: 'components',
      testMatch: ['<rootDir>/src/components/**/*.test.js'],
    },
  ],
};
