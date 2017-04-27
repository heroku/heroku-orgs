'use strict'

let cli = require('heroku-cli-util')
let co = require('co')
let Utils = require('../../lib/utils')

function * run (context, heroku) {
  if (context.command.topic === 'orgs') {
    cli.warn("orgs is deprecated. Please use 'teams' instead.")
  }

  let teams = yield heroku.get('/teams')
  if (context.flags.json) Utils.printGroupsJSON(teams)
  else Utils.printGroups(teams, {label: 'Teams'})
}

let cmd = {
  topic: 'teams',
  description: 'list the teams that you are a member of',
  needsAuth: true,
  flags: [
    {name: 'json', description: 'output in json format'}
  ],
  run: cli.command(co.wrap(run))
}

exports.teams = Object.assign({}, cmd)
exports.orgs = Object.assign({}, cmd, {topic: 'orgs'}) // alias as 'orgs'
