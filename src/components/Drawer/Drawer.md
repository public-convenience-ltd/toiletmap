```jsx
import Button from '../../design-system/components/Button';
import Spacer from '../Spacer';

const [isVisible, setIsVisible] = React.useState(false);

<>
  <Button
    htmlElement="button"
    type="button"
    variant="primary"
    onClick={() => setIsVisible(true)}
  >
    Open drawer
  </Button>
  <Drawer visible={isVisible} animateFrom="right">
    <p>Drawer content here!</p>

    <Spacer mt={3} />

    <Button onClick={() => setIsVisible(false)}>Close drawer</Button>
  </Drawer>
</>;
```
