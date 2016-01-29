'use strict';

let cmd = require('../../../commands/apps/transfer');

describe('heroku apps:transfer', () => {
  beforeEach(() => cli.mockConsole());
  afterEach(()  => nock.cleanAll());

  it('transfers the app to a user', () => {
    let api = nock('https://api.heroku.com:443')
    .patch('/organizations/apps/myapp', {owner: 'foo@foo.com'})
    .reply(200);
    return cmd.run({app: 'myapp', args: {recipient: 'foo@foo.com'}, flags: {}})
    .then(() => expect(``).to.eq(cli.stdout))
      .then(() => expect(`Transferring myapp to foo@foo.com... done\n`).to.eq(cli.stderr))
      .then(() => api.done());
  });
});
