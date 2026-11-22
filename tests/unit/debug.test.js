const { isDignityDebugEnabled, setDignityDebugEnabled } = require('../../src/utils/debug');

describe('dignity debug flag', () => {
  const store = new Map();

  beforeEach(() => {
    store.clear();
    global.localStorage = {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => {
        store.set(key, String(value));
      }
    };
  });

  afterEach(() => {
    delete global.localStorage;
  });

  test('stays off until this origin opts in', () => {
    expect(isDignityDebugEnabled()).toBe(false);
    setDignityDebugEnabled(true);
    expect(isDignityDebugEnabled()).toBe(true);
    setDignityDebugEnabled(false);
    expect(isDignityDebugEnabled()).toBe(false);
  });
});
