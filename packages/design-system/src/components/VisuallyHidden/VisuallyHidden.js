import React from 'react';

import styles from './VisuallyHidden.module.css';

/**
 * `<VisuallyHidden>`
 */
const VisuallyHidden = props => <div className={styles.vh} {...props} />;

export default VisuallyHidden;
