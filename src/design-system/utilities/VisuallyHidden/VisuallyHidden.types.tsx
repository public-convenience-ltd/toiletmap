interface VisuallyHiddenSpan extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  as: 'span' | 'div';
}

interface VisuallyHiddenDiv extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as: 'span' | 'div';
}

export type VisuallyHiddenProps = VisuallyHiddenSpan | VisuallyHiddenDiv;
