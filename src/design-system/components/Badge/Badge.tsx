import { BadgeProps } from './Badge.types';

const Badge = ({ children, ...props }: BadgeProps) => (
  <span className="badge" {...props}>
    {children}
  </span>
);

export default Badge;
