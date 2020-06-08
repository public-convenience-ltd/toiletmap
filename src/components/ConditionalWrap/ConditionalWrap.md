An abstraction which makes it simple to conditionally wrap content, whilst avoiding a duplicated definition of the content.

### Usage

In this scenario the content would be wrapped inside a modal, but only for mobile devices.

```jsx static
<ConditionalWrap
  condition={isMobile}
  wrap={children => <Modal>{children}</Modal>}
  children={
    <p>Content here!</p>
  }
/>
```