'use strict';

let cli         = require('heroku-cli-util');

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
      this.opts.path = `/account/app-transfers`;
      this.opts.method = 'POST';
    } else {
      this.opts.body = { owner: this.opts.recipient };
      this.opts.transferMsg = `Transferring ${cli.color.app(this.opts.appName)} to ${cli.color.magenta(this.opts.recipient)}`;
      this.opts.path = `/organizations/apps/${this.opts.appName}`;
      this.opts.method = 'PATCH';
    }
  }

  transfer () {
    let request = this.heroku.request({
      path: this.opts.path,
      method: this.opts.method,
      body: this.opts.body
    }).then(request => {
      if (request.state === 'pending') cli.action.done('email sent');
    });

    return cli.action(this.opts.transferMsg, request);
  }
}

module.exports = AppTransfer;
