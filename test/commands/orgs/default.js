'use strict';

let cmd     = require('../../../commands/orgs/default');
let error   = require('../../../lib/error');

describe('heroku orgs:default', () => {
  beforeEach(() => {
    cli.mockConsole();
    error.exit.mock();
  });

  afterEach(()  => nock.cleanAll());

  it('shows a deprecation message', () => {
    return cmd.run({})
    .then(() => expect(
``).to.eq(cli.stdout))
      .then(() => expect(
` ▸    orgs:default is no longer in the CLI.
 ▸    Use the HEROKU_ORGANIZATION environment variable instead.
 ▸    See https://devcenter.heroku.com/articles/develop-orgs#default-org for more info.
`).to.eq(cli.stderr));
  });
});
