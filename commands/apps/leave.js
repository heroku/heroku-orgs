'use strict';

let cli = require('heroku-cli-util');
let co  = require('co');

function* run (context, heroku) {
  let app = yield heroku.get(`/apps/${context.app}`).catch(() => null);
  let user = yield heroku.get('/account');
  let path = `/apps/${context.app}/collaborators/${encodeURIComponent(user.email)}`;
  if (app && app.owner.email.endsWith('@herokumanager.com')) path = '/organizations' + path;
  let request = heroku.request({method: 'DELETE', path});
  yield cli.action(`Leaving ${cli.color.cyan(context.app)}`, request);
}

module.exports = {
  topic:        'apps',
  command:      'leave',
  description:  'remove yourself from an organization app',
  needsAuth:    true,
  needsApp:     true,
  run:          cli.command(co.wrap(run))
};
