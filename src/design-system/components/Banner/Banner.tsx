import React from 'react';
import Icon from '../Icon';

export type BannerVariant = 'success' | 'error' | 'warning' | 'info';

interface BannerProps {
  variant?: BannerVariant;
  title?: string;
  children: React.ReactNode;
}

const Banner: React.FC<BannerProps> = ({
  variant = 'info',
  title,
  children,
}) => {
  const role =
    variant === 'error' || variant === 'warning' ? 'alert' : 'status';
  const icon =
    variant === 'error' || variant === 'warning' ? 'warning' : variant;

  return (
    <div
      className={`banner banner--${variant}`}
      {...(role === 'alert' ? { role: 'alert' } : '')}
    >
      <div className="banner__content">
        {title && (
          <h2 className="banner__title">
            <Icon icon={icon} size="large" />
            {title}
          </h2>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Banner;
