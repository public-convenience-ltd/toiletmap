import { createHashHistory, createBrowserHistory } from 'history';
import config from './config';

const history = config.isNativeApp()
  ? createHashHistory()
  : createBrowserHistory();

export default history;
