class Settings {
  setItem(key, value) {
    global.localStorage.setItem(key, JSON.stringify(value));
  }

  getItem(key) {
    var val = global.localStorage.getItem(key);
    if (!val && key === 'apiUrl') {
      return '/api';
    }
    return val ? JSON.parse(val) : null;
  }
}

const inst = new Settings();

export default inst;
