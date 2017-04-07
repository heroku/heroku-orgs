'use strict'

let cli = require('heroku-cli-util')
let co = require('co')

function * run (context, heroku) {
  let teamName = context.flags.team || context.org
  let team = yield heroku.get(`/teams/${teamName}`)
  yield cli.open(`https://dashboard.heroku.com/orgs/${team.name}`)
}

module.exports = {
  topic: 'teams',
  command: 'open',
  description: 'open the team interface in a browser window',
  needsAuth: true,
  needsOrg: true,
  run: cli.command(co.wrap(run))
}
