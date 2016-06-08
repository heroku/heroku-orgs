'use strict';

let _           = require('lodash');
let AppTransfer = require('../../lib/app_transfer');
let cli         = require('heroku-cli-util');
let co          = require('co');
let extend      = require('util')._extend;
let inquirer    = require('inquirer');
let lock        = require('./lock.js').apps;
let Utils       = require('../../lib/utils');

function getAppsToTransfer (apps) {
  return inquirer.prompt([{
    type: 'checkbox',
    name: 'choices',
    pageSize: 20,
    message: 'Select applications you would like to transfer',
    choices: apps.map(function (app) {
      return {
        name: `${app.name} (${Utils.getOwner(app.owner.email)})`,
        value: { name: app.name, owner: app.owner.email }
      };
    })
  }]);
}

function Apps (apps) {
  this.apps = apps;
  this.added = this.apps.filter((app) => !app._failed);
  this.failed = this.apps.filter((app) => app._failed);
  this.hasFailed = this.failed.length > 0;
}

function* run (context, heroku) {
  let app       = context.app;
  let recipient = context.args.recipient;

  if (context.flags.bulk) {
    let allApps = yield heroku.get('/apps');
    let selectedApps = yield getAppsToTransfer(_.sortBy(allApps, 'name'));
    cli.log(`Transferring applications to ${cli.color.magenta(recipient)}`);

    let promise = Promise.all(selectedApps.choices.map(function (app) {
      let opts = {
        heroku: heroku,
        appName: app.name,
        recipient: recipient,
        personalAppTransfer: Utils.isValidEmail(recipient) && !Utils.isOrgApp(app.owner)
      };

      let appTransfer = new AppTransfer(opts);
      return appTransfer.init().catch(function (err) {
        return {_name: app.name, _failed: true, _err: err};
      });
    })).then(function (data) {
      let apps = new Apps(data);
      if (apps.hasFailed) { throw apps; }
      return apps;
    });

    selectedApps = yield cli.action(`${selectedApps.choices.map((app) => cli.color.app(app.name)).join('\n')}`, {}, promise).catch(function (err) {
      if (err instanceof Apps) { return err; }
      throw err;
    });

    if (selectedApps.hasFailed) {
      cli.log();
      selectedApps.failed.forEach(function (app) {
        cli.error(`An error was encountered when transferring ${cli.color.app(app._name)}`);
        cli.error(app._err);
      });
    }
  } else {
    let appInfo = yield heroku.get(`/apps/${app}`);

    let opts = {
      heroku: heroku,
      appName: appInfo.name,
      recipient: recipient,
      personalAppTransfer: Utils.isValidEmail(recipient) && !Utils.isOrgApp(appInfo.owner.email)
    };

    let appTransfer = new AppTransfer(opts);
    yield appTransfer.start();

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
