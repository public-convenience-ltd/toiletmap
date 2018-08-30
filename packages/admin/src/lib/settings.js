class Settings {
  setItem(key, value) {
    global.localStorage.setItem(key, JSON.stringify(value));
  }

  getItem(key) {
    var val = global.localStorage.getItem(key);
    if (!val && key === 'apiUrl') {
      let apiUrl =
        process.env.NODE_ENV === 'production'
          ? '/api'
          : process.env.REACT_APP_GBPTM_API || '/api';
      return apiUrl;
    }
    return val ? JSON.parse(val) : null;
  }
}

const inst = new Settings();

export default inst;
