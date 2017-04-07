'use strict'

let cli = require('heroku-cli-util')
let co = require('co')

function * run (context, heroku) {
  cli.error(`orgs:open is no longer in the CLI.
Please use the "teams:open" command instead.
See ${cli.color.cyan('https://devcenter.heroku.com/articles/heroku-teams')} for more info.`)
}

module.exports = {
  topic: 'orgs',
  command: 'open',
  hidden: true,
  run: cli.command(co.wrap(run))
}
