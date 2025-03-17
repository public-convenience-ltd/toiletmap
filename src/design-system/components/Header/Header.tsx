import { useCallback, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import Button from '../Button';
import Center from '../../layout/Center';
import Icon from '../Icon';
import Logo from '../Logo';
import MainMenu from './MainMenu';
import VisuallyHidden from '../../utilities/VisuallyHidden';

import { useFeedbackPopover } from './hooks';
import { useMapState } from '../../../components/MapState';

const Drawer = dynamic(() => import('../Drawer'), { ssr: false });

const Header = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const focusableElementsRef = useRef<NodeListOf<HTMLElement> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const [, setMapState] = useMapState();
  const navigateAway = useCallback(() => {
    setMapState({ searchLocation: undefined, focus: undefined });
    router.push('/');
  }, [router, setMapState]);

  const { feedbackPopoverId, handleClick, FeedbackPopover } =
    useFeedbackPopover();

  useEffect(() => {
    if (!isMenuVisible) return;

    const navElement = navRef.current;
    if (!navElement) return;

    if (!focusableElementsRef.current) {
      focusableElementsRef.current = navElement.querySelectorAll(
        'a[href]:not([disabled]), button:not([disabled])',
      );
    }

    const allFocusableNavElements = focusableElementsRef.current;
    const firstFocusableElement = allFocusableNavElements[0] as HTMLElement;
    const lastFocusableElement = allFocusableNavElements[
      allFocusableNavElements.length - 1
    ] as HTMLElement;

    const focusTrap = (e: KeyboardEvent) => {
      const isTabPressed = e.key === 'Tab' || e.keyCode === 9;

      if (!isTabPressed) {
        return;
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            e.preventDefault();
            lastFocusableElement.focus();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            e.preventDefault();
            firstFocusableElement.focus();
          }
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuVisible(false);
        buttonRef.current?.focus();
      }
    };

    navElement.addEventListener('keydown', focusTrap);
    navElement.addEventListener('keyup', handleEscapeKey);

    return () => {
      navElement.removeEventListener('keydown', focusTrap);
      navElement.removeEventListener('keyup', handleEscapeKey);
    };
  }, [isMenuVisible]);

  return (
    <header className="header">
      <Center gutter={true} text={false} article={false}>
        <div className="header__stack">
          <Link
            role="link"
            onClick={navigateAway}
            href="/"
            aria-label="Navigate to the home page"
          >
            <Logo />
          </Link>

          <nav aria-labelledby="menu-main">
            <VisuallyHidden as="div">
              <h2 id="menu-main">Main menu</h2>
            </VisuallyHidden>

            <div className="header__smaller-devices" ref={navRef}>
              <button
                aria-describedby={feedbackPopoverId}
                aria-haspopup="true"
                onClick={handleClick}
              >
                <Icon icon="comments" size="x-large" />
                <VisuallyHidden as="span">Feedback</VisuallyHidden>
              </button>

              <button
                type="button"
                aria-expanded={isMenuVisible}
                aria-haspopup="true"
                onClick={() => setIsMenuVisible(!isMenuVisible)}
                ref={buttonRef}
              >
                <VisuallyHidden as="span">Toggle main menu</VisuallyHidden>
                <Icon icon="bars" size="large" />
              </button>

              <FeedbackPopover />

              <Drawer visible={isMenuVisible} animateFrom="right">
                <MainMenu onMenuItemClick={() => setIsMenuVisible(false)} />
              </Drawer>
            </div>

            <div className="header__larger-devices">
              <MainMenu />
              <Button
                aria-describedby={feedbackPopoverId}
                onClick={handleClick}
                htmlElement="button"
                variant="secondary"
                type="button"
              >
                Feedback
              </Button>
              <FeedbackPopover />
            </div>
          </nav>
        </div>
      </Center>
    </header>
  );
};

export default Header;
