import createHashHistory from 'history/createHashHistory';
import createBrowserHistory from 'history/createBrowserHistory';

const history = window.cordova ? createHashHistory() : createBrowserHistory();

// Set a function to be called on location change
history.listen(function(location) {
  // If we havn't opted in, we shouldn't have digitalData on window
  if (window.hasOwnProperty('digitalData') && window.hasOwnProperty('s')) {
    // does not include
    window.digitalData.page.pageInfo.pageName = `${document.title}`;
    window.digitalData.page.attributes.contentType = '200';
    // Fire a track (I know...)
    window.s.t();
  }
});

export default history;
