'use strict';

let cli     = require('heroku-cli-util');
let co      = require('co');
let _       = require('lodash');
let Utils   = require('../../lib/utils');
let extend    = require('util')._extend;

function printJSON (orgs) {
  cli.log(JSON.stringify(orgs, null, 2));
}

function print (orgs) {
  orgs = _.sortBy(orgs, 'name');
  cli.table(orgs, {
    columns: [
      {key: 'name', label: 'Organization', format: o => cli.color.green(o)},
      {key: 'role', label: 'Role', format: r => Utils.roleName(r)},
    ],
    printHeader: false
  });
}

function* run (context, heroku) {
  let orgs = yield heroku.get('/organizations');
  if (context.flags.json) printJSON(orgs);
  else                    print(orgs);
}

let cmd = {
  topic:        'orgs',
  description:  'list the organizations that you are a member of',
  needsAuth:    true,
  flags: [
    {name: 'json', description: 'output in json format'},
  ],
  run:          cli.command(co.wrap(run))
};

module.exports = cmd;
module.exports.default = extend({}, cmd);
module.exports.default.hidden = true;
module.exports.default.topic = 'default';
module.exports.default.run = function () {
  cli.error(`orgs:default is no longer in the CLI.\nUse the HEROKU_ORGANIZATION environment variable instead.\nSee ${cli.color.cyan('https://devcenter.heroku.com/articles/develop-orgs#default-org')} for more info.`);
  process.exit(1);
};
