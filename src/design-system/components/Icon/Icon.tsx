import { IconProps } from './Icon.types';

const Icon = ({ icon, size, spin, ...props }: IconProps) => {
  const chosenSize = size ? size : 'small';
  const doesSpin = spin ? 'spin' : '';

  return (
    <span className="icon">
      <svg
        fill="currentColor"
        className={chosenSize + ' ' + doesSpin}
        {...props}
      >
        <use href={`/sprites/solid.svg#${icon}`}></use>
      </svg>
    </span>
  );
};

export default Icon;
