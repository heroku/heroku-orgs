function orgFlags(flags) {
  return nock('https://api.heroku.com:443', {
    reqheaders: {Accept: 'application/vnd.heroku+json; version=2'}
  })
  .get('/v1/organization/myorg')
  .reply(200, {
    flags: flags,
  });
}

function orgApp() {
  return nock('https://api.heroku.com:443')
  .get('/apps/myapp')
  .reply(200, {
    name: 'myapp',
    owner: { email: 'myorg@herokumanager.com' }
  });
}

function personalApp() {
  return nock('https://api.heroku.com:443')
  .get('/apps/myapp')
  .reply(200, {
    name: 'myapp',
    owner: { email: 'raulb@heroku.com' }
  });
}

module.exports = {
  orgFlags: orgFlags,
  orgApp: orgApp,
  personalApp: personalApp
};
