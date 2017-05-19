'use strict'

let cli = require('heroku-cli-util')
let co = require('co')
const {flags} = require('cli-engine-heroku')

function * run (context, heroku) {
  let org = yield heroku.get(`/organizations/${context.org}`)
  yield cli.open(`https://dashboard.heroku.com/orgs/${org.name}`)
}

module.exports = {
  topic: 'orgs',
  command: 'open',
  description: 'open the organization interface in a browser window',
  needsAuth: true,
  flags: [
    flags.team({name: 'org', char: 'o', hasValue: true, description: 'org to use', hidden: true}),
    flags.team({name: 'team', hasValue: true, required: true})
  ],
  run: cli.command(co.wrap(run))
}
