import assert from 'assert';
import app from '../../src/app';

describe('\'contracts\' service', () => {
  it('registered the service', () => {
    const service = app.service('contracts');

    assert.ok(service, 'Registered the service');
  });
});
