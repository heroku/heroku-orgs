'use strict'

const nock = require('nock')

function collaborators () {
  return nock('https://api.heroku.com:443')
    .post('/apps/myapp/collaborators', {
      user: 'raulb@heroku.com'
    }).reply(200)
}

function collaboratorsWithPrivileges (privileges) {
  return nock('https://api.heroku.com:443', {
    reqheaders: {Accept: 'application/vnd.heroku+json; version=3.org-privileges'}
  })
    .post('/organizations/apps/myapp/collaborators', {
      user: 'raulb@heroku.com',
      privileges: privileges || ['']
    }).reply(200)
}

function personalToPersonal () {
  return nock('https://api.heroku.com:443')
    .post('/account/app-transfers', {app: 'myapp', recipient: 'raulb@heroku.com'})
    .reply(200, {state: 'pending'})
}

module.exports = {
  collaborators: collaborators,
  collaboratorsWithPrivileges: collaboratorsWithPrivileges,
  personalToPersonal: personalToPersonal
}
