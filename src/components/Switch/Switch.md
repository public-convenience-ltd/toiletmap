```jsx
const [isChecked, setIsChecked] = React.useState(false);

<Switch checked={isChecked} onChange={() => setIsChecked(!isChecked)} />;
```
