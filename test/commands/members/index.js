'use strict';

let cmd = require('../../../commands/members');

describe('heroku members', () => {
  beforeEach(() => cli.mockConsole());
  afterEach(()  => nock.cleanAll());

  it('shows all the org members', () => {
    let api = nock('https://api.heroku.com:443')
    .get('/organizations/myorg/members')
    .reply(200, [
      {email: 'a@heroku.com', role: 'admin'},
      {email: 'b@heroku.com', role: 'viewer'},
    ]);
    return cmd.run({org: 'myorg', flags: {}})
    .then(() => expect(
`a@heroku.com  admin
b@heroku.com  viewer
`).to.eq(cli.stdout))
    .then(() => expect(``).to.eq(cli.stderr))
    .then(() => api.done());
  });
});
