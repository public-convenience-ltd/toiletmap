import { ComponentProps } from 'react';

const TextArea = (props: ComponentProps<'textarea'>) => (
  <textarea className="text-area" {...props} />
);

export default TextArea;
