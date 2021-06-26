### Implements

- [color](https://styled-system.com/api#color)
- [typography](https://styled-system.com/api#typography)

### Usage

```jsx
<Text fontSize={14}>
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
</Text>
```

```jsx
<Text fontStyle="italic" color="tertiary">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
</Text>
```

#### Inline text

By default, `Text` are displayed as `div` blocks. This can be changed by applying `as="span"`.

```jsx
<Text as="span" fontWeight="bold">
  Lorem ipsum dolor.
</Text>
```
