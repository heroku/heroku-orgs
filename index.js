exports.topics = [
  {name: 'access', description: 'manage user access to apps'},
  {name: 'orgs', description: 'manage organizations'},
  {name: 'sharing', hidden: true},
  {name: 'join', hidden: true},
  {name: 'leave', hidden: true},
  {name: 'lock', hidden: true},
  {name: 'unlock', hidden: true}
]

exports.commands = [
  require('./commands/access'),
  require('./commands/access').sharing,
  require('./commands/access/add'),
  require('./commands/access/add').sharing,
  require('./commands/access/remove'),
  require('./commands/access/remove').sharing,
  require('./commands/access/update'),
  require('./commands/apps/join').apps,
  require('./commands/apps/join').root,
  require('./commands/apps/leave').apps,
  require('./commands/apps/leave').root,
  require('./commands/apps/lock').apps,
  require('./commands/apps/lock').root,
  require('./commands/apps/transfer'),
  require('./commands/apps/transfer').sharing,
  require('./commands/apps/unlock').apps,
  require('./commands/apps/unlock').root,
  require('./commands/orgs'),
  require('./commands/orgs/default'),
  require('./commands/orgs/open'),
  require('./commands/members'),
  require('./commands/members/add').add,
  require('./commands/members/add').set,
  require('./commands/members/remove'),
  require('./commands/teams')
]
