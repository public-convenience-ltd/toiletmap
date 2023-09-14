import { forwardRef } from 'react';

const InputField = forwardRef<HTMLInputElement>((props, ref) => {
  return <input ref={ref} className="input" {...props} />;
});

InputField.displayName = 'InputField';
export default InputField;
