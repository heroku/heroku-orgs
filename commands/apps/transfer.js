'use strict';

let cli         = require('heroku-cli-util');
let co          = require('co');
let extend      = require('util')._extend;
let lock        = require('./lock.js').apps;
let inquirer    = require('inquirer');
let _           = require('lodash');

function getAppsToTransfer (apps) {
  return inquirer.prompt([{
    type: 'checkbox',
    name: 'choices',
    message: 'Select applications you would like to transfer',
    choices: apps.map(function (app) {
      return {name: app}
    })
  }])
}

function Apps (apps) {
  this.apps = apps;

  this.added = this.apps.filter((app) => !app._failed);
  this.failed = this.apps.filter((app) => app._failed);

  this.hasFailed = this.failed.length > 0;
}

function* run (context, heroku) {
  let recipient = context.args.recipient;

  if (context.flags.bulk) {
    let requests = yield {
      apps: heroku.get('/apps'),
      user: heroku.get('/account')
    };

    let personalApps = _.filter(requests.apps, function(app) {
      return app.owner.email === requests.user.email
    });

    let apps = yield getAppsToTransfer(_.flatMap(personalApps, 'name'));

    cli.log(`Transferring applications to ${cli.color.magenta(recipient)}`);

    let promise = Promise.all(apps.choices.map(function (app) {
      return heroku.request({
        method:  'PATCH',
        path:    `/organizations/apps/${app}`,
        body:    {owner: recipient},
      }).catch(function (err) {
        return {_name: app, _failed: true, _err: err}
      });
    })).then(function (data) {;
      let apps = new Apps(data)
      if (apps.hasFailed) {
        throw apps;
      }
      return apps;
    });

    apps = yield cli.action(`${apps.choices.map((app) => cli.color.app(app)).join('\n')}`, {}, promise).catch(function (err) {
      if (err instanceof Apps) { return err; }
      throw err;
    });

    if (apps.hasFailed) {
      cli.log();
      apps.failed.forEach(function (app) {
        cli.error(`An error was encountered when transferring ${cli.color.app(app._name)}`)
        cli.error(app._err)
      });
    }
  } else {
    let app = context.app;
    let request = heroku.request({
      method:  'PATCH',
      path:    `/organizations/apps/${app}`,
      body:    {owner: recipient},
    });

    yield cli.action(`Transferring ${cli.color.app(app)} to ${cli.color.magenta(recipient)}`, request);

    if (context.flags.locked) {
      yield lock.run(context);
    }
  }
}

let cmd = {
  topic:        'apps',
  command:      'transfer',
  description:  'transfer applications to another user, organization or team',
  needsAuth:    true,
  wantsApp:     true,
  run:          cli.command(co.wrap(run)),
  args:         [
    {name: 'recipient', description: 'user, organization or team to transfer applications to'},
  ],
  flags: [
    {name: 'locked', char: 'l', hasValue: false, required: false, description: 'lock the app upon transfer'},
    {name: 'bulk', hasValue: false, required: false, description: 'transfer applications in bulk'},
  ],
  help: `
Examples:

  $ heroku apps:transfer collaborator@example.com
  Transferring example to collaborator@example.com... done

  $ heroku apps:transfer acme-widgets
  Transferring example to acme-widgets... done

  $ heroku apps:transfer --bulk acme-widgets
  ...
  `,
};

module.exports = cmd;
module.exports.sharing = extend({}, cmd);
module.exports.sharing.hidden = true;
module.exports.sharing.topic = 'sharing';
module.exports.sharing.run = function () {
  cli.error(`This command is now ${cli.color.cyan('heroku apps:transfer')}`);
  process.exit(1);
};
