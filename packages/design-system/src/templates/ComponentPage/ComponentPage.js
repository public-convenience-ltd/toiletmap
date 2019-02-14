import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';

import '../../global';

import Example from './components/Example';

import styles from './ComponentPage.module.css';

class ComponentPage extends React.Component {
  render() {
    const { displayName, props, html, description } = this.props.pageContext;

    return (
      <div className={styles.page}>
        <Link to="/components/" className={styles.back}>
          Back to Components
        </Link>

        <div className={styles.section}>
          <h1>{displayName}</h1>
          {description && <p>{description.text}</p>}
        </div>

        <div className={styles.section}>
          <h2>Props/Methods</h2>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Type</th>
                <th>Required</th>
              </tr>
            </thead>
            <tbody>
              {props.map(({ name, description, type, required }, index) => (
                <tr key={index}>
                  <td>{name}</td>
                  <td>{description && description.text}</td>
                  <td>{type && type.name}</td>
                  <td>{String(Boolean(required))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Example html={html} />
      </div>
    );
  }
}

ComponentPage.propTypes = {
  pageContext: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    props: PropTypes.array.isRequired,
    html: PropTypes.string.isRequired,
    description: PropTypes.shape({
      text: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default ComponentPage;
