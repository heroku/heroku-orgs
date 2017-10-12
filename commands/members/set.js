'use strict'

let cli = require('heroku-cli-util')
let co = require('co')
let Utils = require('../../lib/utils')
const {flags} = require('cli-engine-heroku')
const {RoleCompletion} = require('cli-engine-heroku/lib/completions')

function * run (context, heroku) {
  let orgInfo = yield Utils.orgInfo(context, heroku)
  let groupName = context.org || context.team || context.flags.team
  let email = context.args.email
  let role = context.flags.role

  yield Utils.addMemberToOrg(email, role, groupName, heroku)
  yield Utils.warnIfAtTeamMemberLimit(orgInfo, groupName, context, heroku)
  Utils.warnUsingOrgFlagInTeams(orgInfo, context)
}

let set = {
  topic: 'members',
  command: 'set',
  description: 'sets a members role in an organization or a team',
  needsAuth: true,
  wantsOrg: true,
  args: [{name: 'email'}],
  flags: [
    {name: 'role', char: 'r', hasValue: true, required: true, description: 'member role (admin, collaborator, member, owner)', completion: RoleCompletion},
    // flags.org({name: 'org', hasValue: true, description: 'org to use', hidden: false}),
    flags.team({name: 'team', hasValue: true, hidden: true})
  ],
  run: cli.command(co.wrap(run))
}

module.exports = set