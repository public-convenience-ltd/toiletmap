import React from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0';
import { useMapState } from '../../../components/MapState';
import Button from '../Button';

interface IMainMenu {
  mapCenter?: { lat: number; lng: number };
  onMenuItemClick?: () => void;
}

const MainMenu: React.FC<IMainMenu> = () => {
  const { user } = useUser();
  const [mapState] = useMapState();

  return (
    <div className="header__nav-wrapper">
      <ul className="header__nav">
        <li>
          <Link href="/about">About</Link>
        </li>

        <li>
          <Link href="/contact">Contact</Link>
        </li>

        <li>
          <Link href="/posts">Blog</Link>
        </li>

        <li>
          <Link
            href={
              mapState?.center
                ? `/loos/add?lat=${mapState.center.lat}&lng=${mapState.center.lng}`
                : `/loos/add`
            }
          >
            Add a Toilet
          </Link>
        </li>

        {user && (
          <li>
            <Button htmlElement="a" variant="primary" href={`/auth/logout`}>
              Logout
            </Button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default MainMenu;
