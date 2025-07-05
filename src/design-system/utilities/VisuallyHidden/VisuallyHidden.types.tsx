interface VisuallyHiddenSpan extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  as: 'span' | 'div' | 'caption';
}

interface VisuallyHiddenDiv extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as: 'span' | 'div' | 'caption';
}
interface VisuallyHiddenCaption
  extends React.HTMLAttributes<HTMLTableCaptionElement> {
  children: React.ReactNode;
  as: 'span' | 'div' | 'caption';
}

export type VisuallyHiddenProps =
  | VisuallyHiddenSpan
  | VisuallyHiddenDiv
  | VisuallyHiddenCaption;
