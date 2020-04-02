import { createHashHistory, createBrowserHistory } from 'history';
import config from './config';

const history = config.isNativeApp()
  ? createHashHistory()
  : createBrowserHistory();

// Set a function to be called on location change
history.listen(function (location) {
  // If we havn't opted in, we shouldn't have digitalData on window
  if (
    Object.prototype.hasOwnProperty.call(window, 'digitalData') &&
    Object.prototype.hasOwnProperty.call(window, 's')
  ) {
    // does not include
    window.digitalData.page.pageInfo.pageName = `${document.title}`;
    window.digitalData.page.attributes.contentType = '200';
    // Fire a track (I know...)
    window.s.t();
  }
});

export default history;
