'use strict'

let cli = require('heroku-cli-util')
let co = require('co')

function * run (context, heroku) {
  if (context.command.topic == 'orgs') {
    cli.warn("orgs:open is deprecated. Please use 'teams:open' instead.")
  }

  let teamName = context.flags.team || context.org
  let team = yield heroku.get(`/teams/${teamName}`)
  yield cli.open(`https://dashboard.heroku.com/orgs/${team.name}`)
}

let cmd = {
  topic: 'teams',
  command: 'open',
  description: 'open the team interface in a browser window',
  needsAuth: true,
  wantsTeam: true,
  flags: [
    {name: 'team', char: 't', hasValue: true, description: 'team to open'}
  ],
  run: cli.command(co.wrap(run))
}

exports.teams = Object.assign({}, cmd)
exports.orgs  = Object.assign({}, cmd, {topic: 'orgs'}) // alias as 'orgs:open'
