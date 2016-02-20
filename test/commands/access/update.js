'use strict';

let cmd = require('../../../commands/access/update');

describe('heroku access:update', () => {
  context('with an org app with privileges', () => {
    beforeEach(() => cli.mockConsole());
    afterEach(()  => nock.cleanAll());

    it('updates the app privileges', () => {
      let api = nock('https://api.heroku.com:443')
      .get('/apps/myapp')
      .reply(200, {
        name: 'myapp',
        owner: { email: 'myorg@herokumanager.com' }
      });
      let apiPrivilegesVariant = nock('https://api.heroku.com:443', {
        reqheaders: {Accept: 'application/vnd.heroku+json; version=3.org-privileges'}
      })
      .patch('/organizations/apps/myapp/collaborators/raulb@heroku.com', {
        privileges: ['view', 'deploy']
      }).reply(200);

      return cmd.run({app: 'myapp', args: {email: 'raulb@heroku.com'}, flags: { privileges: 'view,deploy' }})
      .then(() => expect(``).to.eq(cli.stdout))
        .then(() => expect(`Updating raulb@heroku.com in application myapp with view,deploy privileges... done\n`).to.eq(cli.stderr))
        .then(() => api.done())
        .then(() => apiPrivilegesVariant.done());
    });
  });

  context('with a non org app', () => {
    beforeEach(() => {
      cli.raiseErrors = false;
      cli.mockConsole();
    });
    afterEach(()  => {
      cli.raiseErrors = true;
      nock.cleanAll();
    });

    it('returns an error when passing privileges', () => {
      let api = nock('https://api.heroku.com:443')
      .get('/apps/myapp')
      .reply(200, {
        name: 'myapp',
        owner: { email: 'raulb@heroku.com' }
      });
      return cmd.run({app: 'myapp', args: {email: 'raulb@heroku.com'}, flags: { privileges: 'view,deploy' }})
      .then(() => expect(` ▸    Error: cannot update privileges. The app myapp is not owned by an organization\n`).to.eq(cli.stderr))
      .then(() => api.done());
    });
  });
});
