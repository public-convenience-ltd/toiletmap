import { forwardRef } from 'react';

type InputProps = React.HTMLProps<HTMLInputElement>;

const InputField = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} className="input" {...props} />;
});

InputField.displayName = 'InputField';
export default InputField;
