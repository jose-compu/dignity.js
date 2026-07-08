const { attachErrorPanel } = require('../../src/apps/error-panel');
const EventEmitter = require('../../src/utils/event-emitter');

describe('attachErrorPanel without DOM (#106)', () => {
  test('requires a document', () => {
    const host = new EventEmitter();
    const container = { insertBefore() {} };
    expect(() => attachErrorPanel(host, container)).toThrow('DOM document');
  });
});
