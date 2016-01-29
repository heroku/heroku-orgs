'use strict';

let cli = require('heroku-cli-util');
let co  = require('co');
let _   = require('lodash');

function* run (context, heroku) {
  let members = yield heroku.get(`/organizations/${context.org}/members`);
  members = _.sortBy(members, 'email');
  if (context.flags.role) members = members.filter(m => m.role === context.flags.role);
  if (context.flags.json) {
    cli.log(JSON.stringify(members, null, 2));
  } else {
    cli.table(members, {
      printHeader: false,
      columns: [
        {key: 'email'},
        {key: 'role'},
      ]
    });
  }
}

module.exports = {
  topic:        'members',
  description:  'list members of an organization',
  needsAuth:    true,
  needsOrg:     true,
  flags: [
    {name: 'role', char: 'r', hasValue: true, description: 'filter by role'},
    {name: 'json', description: 'output in json format'},
  ],
  run:          cli.command(co.wrap(run))
};
