import { ComponentPropsWithoutRef, forwardRef } from 'react';

const TextArea = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithoutRef<'textarea'>
>((props, ref) => <textarea className="text-area" ref={ref} {...props} />);

TextArea.displayName = 'TextArea';

export default TextArea;
