[Handling spacing in a UI component library](https://medium.com/fed-or-dead/handling-spacing-in-a-ui-component-library-70f3b22ec89)

### Implements

- [space](https://styled-system.com/api#space)

### Vertical spacing

```jsx
import Box from '../Box';

<>
  <Box height={10} bg="#000" />
  <Spacer mt={3} />
  <Box height={10} bg="#000" />
</>;
```

### Lateral spacing

```jsx
import Box from '../Box';

<Box display="flex" height={50}>
  <Box width={10} bg="#000" />
  <Spacer ml={3} />
  <Box width={10} bg="#000" />
</Box>;
```
