class Settings {
  setItem(key, value) {
    global.localStorage.setItem(key, JSON.stringify(value));
  }

  getItem(key) {
    var val = global.localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }
}

const inst = new Settings();

export default inst;
