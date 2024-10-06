import DrawerProps from './Drawer.types';

const Drawer = ({ children, visible, animateFrom }: DrawerProps) => {
  const animateTo = animateFrom === 'right' ? 'left' : 'right';

  return (
    <div
      className="drawer"
      style={{
        transition: `0.3s ${animateTo} ease-in-out, 0.3s visibility ease-in-out`,
        [animateTo]: visible ? '0%' : '100%',

        // Avoids keyboard users being able to navigate to off-screen elements
        visibility: visible ? 'visible' : 'hidden',
      }}
    >
      {children}
    </div>
  );
};

export default Drawer;
