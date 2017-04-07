'use strict'

let cli = require('heroku-cli-util')
let co = require('co')

function * run () {
  cli.error(`orgs is no longer in the CLI.
Please use the "teams" command instead.
See ${cli.color.cyan('https://devcenter.heroku.com/articles/heroku-teams')} for more info.`)
}

module.exports = {
  topic: 'orgs',
  hidden: true,
  run: cli.command(co.wrap(run))
}
