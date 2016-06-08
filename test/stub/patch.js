function orgAppTransfer() {
  return nock('https://api.heroku.com:443')
  .patch('/organizations/apps/myapp', {owner: 'team'})
  .reply(200);
}

function personalAppTransfer() {
  return nock('https://api.heroku.com:443')
  .patch('/organizations/apps/myapp', {owner: 'foo@foo.com'})
  .reply(200);
}

module.exports = {
  orgAppTransfer:       orgAppTransfer,
  personalAppTransfer:  personalAppTransfer,
};
