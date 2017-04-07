let _ = require('lodash')
let cli = require('heroku-cli-util')
let error = require('./error')

let getOwner = function (owner) {
  if (isTeamApp(owner)) {
    return owner.split('@herokumanager.com')[0]
  }
  return owner
}

let isTeamApp = function (owner) {
  return (/@herokumanager\.com$/.test(owner))
}

let isValidEmail = function (email) {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
}

let printGroups = function (group, type = {label: 'Team'}) {
  group = _.sortBy(group, 'name')
  cli.table(group, {
    columns: [
      {key: 'name', label: type.label, format: o => cli.color.green(o)},
      {key: 'role', label: 'Role', format: r => r}
    ],
    printHeader: false
  })
}

let printGroupsJSON = function (group) {
  cli.log(JSON.stringify(group, null, 2))
}

let teamInfo = function * (context, heroku) {
  let teamName = context.flags.team || context.org
  if (!teamName) error.exit(1, 'No team specified.\nRun this command with --team')
  return yield heroku.get(`/teams/${teamName}`)
}

let warnUsingOrgFlagInTeams = function (teamInfo, context) {
  if ((teamInfo.type === 'team') && (!context.flags.team)) {
    cli.warn(`${cli.color.cmd(context.org)} is a Heroku Team\nHeroku CLI now supports Heroku Teams.\nUse ${cli.color.cmd('-t')} or ${cli.color.cmd('--team')} for teams like ${cli.color.cmd(context.org)}`)
  }
}

module.exports = {
  getOwner,
  isTeamApp,
  isValidEmail,
  teamInfo,
  printGroups,
  printGroupsJSON,
  warnUsingOrgFlagInTeams
}
