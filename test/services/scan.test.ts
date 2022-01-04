import assert from 'assert';
import app from '../../src/app';

describe('\'scan\' service', () => {
  it('registered the service', () => {
    const service = app.service('scan');

    assert.ok(service, 'Registered the service');
  });
});
