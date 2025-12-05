import React from 'react';
import Link from 'next/link';

import Center from '../../layout/Center';
import Icon from '../../components/Icon';

const Footer = () => {
  return (
    <footer className="footer">
      <Center text={false} gutter={true} article={false}>
        <div className="footer__container">
          <ul className="footer__list">
            <li className="footer__list-item">
              <Link className="footer__link" href="/privacy">
                Privacy Policy
              </Link>
            </li>
            <li className="footer__list-item">
              <Link className="footer__link" href="/dataset">
                Dataset
              </Link>
            </li>
            <li className="footer__list-item">
              <Link className="footer__link" href="/app">
                App
              </Link>
            </li>
            <li className="footer__list-item">
              <Link
                className="footer__link"
                href={'https://www.patreon.com/toiletmap'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Support Us</span>
                <Icon icon="patreon" size="medium" />
              </Link>
            </li>
          </ul>
        </div>
      </Center>
    </footer>
  );
};

export default Footer;
