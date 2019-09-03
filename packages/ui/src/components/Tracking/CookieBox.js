import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import styles from '../css/cookie-box.module.css';
import controls from '../../css/controls.module.css';

// Copy/pasted from pages/PreferencesPage.js.
// TODO: Abstract this is we see this pattern any more times.
const PreferenceCheckbox = ({ children, checked, name, onChange }) => (
  <label className={controls.preferenceWrapper}>
    <input
      className={controls.preferenceInput}
      type="checkbox"
      name={name}
      onChange={onChange}
      checked={checked}
    />
    <span className={controls.preference}>{children}</span>
  </label>
);

const noop = () => {};

class CookieBox extends React.Component {
  static propTypes = {
    aaAccepted: PropTypes.bool,
    gaAccepted: PropTypes.bool,
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    onSubmit: noop,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      aaAccepted: props.aaAccepted || false,
      gaAccepted: props.gaAccepted || false,
    };
  }

  handleSubmit = evt => {
    evt.preventDefault();

    this.props.onSubmit({
      aaAccepted: this.state.aaAccepted,
      gaAccepted: this.state.gaAccepted,
    });
  };

  render() {
    return (
      <div className={this.props.open ? styles.wrapperOpen : styles.wrapper}>
        {this.props.open && (
          <div className={styles.popupBody}>
            <p>We use two types of optional cookies on this site.</p>
            <p>
              You can opt in to cookies that improve your experience with the
              site so you can find a loo quicker. By opting in to the Google
              Analytics cookie you would be sharing your data with Public
              Convenience Ltd and tech partners Neontribe as well as Google
              itself.
            </p>

            <form onSubmit={this.handleSubmit}>
              <PreferenceCheckbox
                onChange={evt =>
                  this.setState({ gaAccepted: evt.target.checked })
                }
                checked={this.state.gaAccepted}
              >
                <span>Opt in to Google Analytics</span>
              </PreferenceCheckbox>

              <p>
                You can also opt in to an additional cookie to support the
                project indirectly. By opting in to the Adobe Analytics cookie
                we can share your data with Unilever, and benefit from their
                continued sponsorship. This opting in is entirely up to you.
              </p>

              <PreferenceCheckbox
                onChange={evt =>
                  this.setState({ aaAccepted: evt.target.checked })
                }
                checked={this.state.aaAccepted}
              >
                <span>Opt into Adobe Analytics</span>
              </PreferenceCheckbox>

              <p>
                For more detailed information about the cookies we use, see our{' '}
                <Link to="/privacy">Cookies page.</Link>
              </p>

              <div>
                <button className={controls.btn}>Save and close</button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }
}

export default CookieBox;
