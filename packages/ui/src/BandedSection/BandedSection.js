import React from 'react';

import styles from './BandedSection.module.css';

const BandedSection = props => (
  <div className={styles.section}>
    <div className={styles.text}>{props.children}</div>
  </div>
);

export default BandedSection;
