interface Button extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  htmlElement: 'button';
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
}

interface Link extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  htmlElement: 'a';
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  href: string;
}

export type ButtonProps = Link | Button;
