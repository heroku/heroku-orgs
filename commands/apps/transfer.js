'use strict';

let cli         = require('heroku-cli-util');
let co          = require('co');
let extend      = require('util')._extend;
let inquirer    = require('inquirer');
let lock        = require('./lock.js').apps;
let Utils       = require('../../lib/utils');
let _           = require('lodash');

class AppTransfer {
  /**
   * @param {Object} options
   * @param {Object} options.heroku - instance of heroku-client
   * @param {string} options.appName - application that is being transferred
   * @param {string} options.recipient - recipient of the transfer
   * @param {boolean} options.personalAppTransfer - determines if it is a transfer between individual accounts
  */
  constructor (opts) {
    this.opts = opts;
    this.heroku = opts.heroku;
    this.opts.appName = opts.appName;
    this.opts.recipient = opts.recipient;
    if (this.opts.personalAppTransfer === undefined) this.opts.personalAppTransfer = true;

    if (this.opts.personalAppTransfer) {
      this.opts.body = { app: this.opts.appName, recipient: this.opts.recipient };
      this.opts.transferMsg = `Initiating transfer of ${cli.color.app(this.opts.appName)} to ${cli.color.magenta(this.opts.recipient)}`;
    } else {
      this.opts.body = { owner: this.opts.recipient };
      this.opts.transferMsg = `Transferring ${cli.color.app(this.opts.appName)} to ${cli.color.magenta(this.opts.recipient)}`;
    }
  }

  transfer () {
    let request = this.heroku.request({
      path: this.opts.personalTransfer ? `/account/app-transfers` : `/organizations/apps/${this.opts.appName}`,
      method: this.opts.personalTransfer ? 'POST' : 'PATCH',
      body: this.opts.body
    }).then(request => {
      if (request.state === 'pending') cli.action.done('email sent');
    });

    return cli.action(this.opts.transferMsg, request);
  }
}

function getAppsToTransfer (apps) {
  return inquirer.prompt([{
    type: 'checkbox',
    name: 'choices',
    pageSize: 20,
    message: 'Select applications you would like to transfer',
    choices: apps.map(function (app) {
      return {
        name: `${app.name} (${Utils.getOwner(app.owner.email)})`,
        value: app.name
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
    let requests = yield {
      apps: heroku.get('/apps'),
      user: heroku.get('/account')
    };

    let apps = yield getAppsToTransfer(_.sortBy(requests.apps, 'name'));

    cli.log(`Transferring applications to ${cli.color.magenta(recipient)}`);
    let promise = Promise.all(apps.choices.map(function (app) {
      return heroku.request({
        method:  'PATCH',
        path:    `/organizations/apps/${app}`,
        body:    {owner: recipient},
      }).catch(function (err) {
        return {_name: app, _failed: true, _err: err};
      });
    })).then(function (data) {
      let apps = new Apps(data);
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
      personalAppTransfer: !Utils.isOrgApp(recipient) && !Utils.isOrgApp(appInfo.owner.email)
    };

    let appTransfer = new AppTransfer(opts);
    yield appTransfer.transfer();

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
