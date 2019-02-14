import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';

import styles from './TOC.module.css';

class TOC extends React.Component {
  render() {
    const { allComponents } = this.props.pageContext;

    return (
      <div className={styles.page}>
        <div className={styles.section}>
          <h1>Components</h1>
          <p>A collection of reusable components for the GBPTM project.</p>
        </div>

        <ul className={styles.grid}>
          {allComponents.map(({ displayName, filePath, iconPath }, index) => (
            <li key={index} className={styles.cell}>
              <Link to={filePath} className={styles.link}>
                <span>{displayName}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

TOC.propTypes = {
  pageContext: PropTypes.shape({
    allComponents: PropTypes.arrayOf(
      PropTypes.shape({
        displayName: PropTypes.string.isRequired,
        filePath: PropTypes.string,
      }).isRequired
    ).isRequired,
  }).isRequired,
};

export default TOC;
