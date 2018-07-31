'use strict';
module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    lang: [0, 'always', 'eng'],
    'scope-case': [0, 'always', 'lowerCase'],
    'subject-tense': [0, 'always', 'present-imperative'],
    'body-tense': [0, 'always', 'present-imperative'],
    'footer-tense': [0, 'always', 'present-imperative'],
  },
};
