const path = require('path');

const components = [
  'Box',
  'Button',
  'ConditionalWrap',
  'Divider',
  'Drawer',
  'Icon',
  'Loading',
  'Logo',
  'Notification',
  'Spacer',
  'Switch',
  'Text',
  'VisuallyHidden',
];

module.exports = {
  components: components.map((componentName) => {
    return `src/components/${componentName}/${componentName}.js`;
  }),
  styleguideComponents: {
    Wrapper: path.join(__dirname, 'src/styleguide/Wrapper'),
    LogoRenderer: path.join(__dirname, 'src/styleguide/Logo'),
  },
  usageMode: 'expand',
};
