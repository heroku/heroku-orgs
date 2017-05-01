'use strict'
/* globals describe it beforeEach afterEach cli nock expect context */

let cmd = require('../../../commands/members')
let stubGet = require('../../stub/get')

describe('heroku members', () => {
  beforeEach(() => cli.mockConsole())
  afterEach(() => nock.cleanAll())

  let apiGetTeamMembers

  context('when it is an Enterprise team', () => {
    beforeEach(() => {
      stubGet.teamInfo('enterprise')
    })

    it('shows there are not team members if it is an orphan team', () => {
      apiGetTeamMembers = stubGet.teamMembers([])
      return cmd.run({flags: {team: 'myteam'}})
        .then(() => expect(
          `No members in myteam
`).to.eq(cli.stdout))
        .then(() => expect('').to.eq(cli.stderr))
        .then(() => apiGetTeamMembers.done())
    })

    it('shows all the team members', () => {
      apiGetTeamMembers = stubGet.teamMembers([
        {email: 'a@heroku.com', role: 'admin'}, {email: 'b@heroku.com', role: 'collaborator'}
      ])
      return cmd.run({flags: {team: 'myteam'}})
        .then(() => expect(
          `a@heroku.com  admin
b@heroku.com  collaborator
`).to.eq(cli.stdout))
        .then(() => expect('').to.eq(cli.stderr))
        .then(() => apiGetTeamMembers.done())
    })

    let expectedTeamMembers = [{email: 'a@heroku.com', role: 'admin'}, {email: 'b@heroku.com', role: 'member'}]

    it('filters members by role', () => {
      apiGetTeamMembers = stubGet.teamMembers(expectedTeamMembers)
      return cmd.run({flags: {team: 'myteam', role: 'member'}})
        .then(() => expect(
          `b@heroku.com  member
`).to.eq(cli.stdout))
        .then(() => expect('').to.eq(cli.stderr))
        .then(() => apiGetTeamMembers.done())
    })

    it("shows the right message when filter doesn't return results", () => {
      apiGetTeamMembers = stubGet.teamMembers(expectedTeamMembers)
      return cmd.run({flags: {team: 'myteam', role: 'collaborator'}})
        .then(() => expect(
          `No members in myteam with role collaborator
`).to.eq(cli.stdout))
        .then(() => expect('').to.eq(cli.stderr))
        .then(() => apiGetTeamMembers.done())
    })

    it('filters members by role', () => {
      apiGetTeamMembers = stubGet.teamMembers(expectedTeamMembers)
      return cmd.run({flags: {team: 'myteam', role: 'member'}})
        .then(() => expect(
          `b@heroku.com  member
`).to.eq(cli.stdout))
        .then(() => expect('').to.eq(cli.stderr))
        .then(() => apiGetTeamMembers.done())
    })
  })

  context('when it is a team', () => {
    beforeEach(() => {
      stubGet.teamInfo('team')
    })

    context('without the feature flag team-invite-acceptance', () => {
      beforeEach(() => {
        stubGet.teamFeatures([])
      })

      context('using --org instead of --team', () => {
        it('shows members either way including a warning', () => {
          apiGetTeamMembers = stubGet.teamMembers([
            {email: 'a@heroku.com', role: 'admin'}, {email: 'b@heroku.com', role: 'collaborator'}
          ])
          return cmd.run({org: 'myteam', flags: {}})
          .then(() => expect(
            `a@heroku.com  admin
b@heroku.com  collaborator\n`).to.eq(cli.stdout))
            .then(() => expect(' ▸    myteam is a Heroku Team\n ▸    Heroku CLI now supports Heroku Teams.\n ▸    Use -t or --team for teams like myteam\n').to.eq(cli.stderr))
            .then(() => apiGetTeamMembers.done())
        })
      })
    })

    context('with the feature flag team-invite-acceptance', () => {
      beforeEach(() => {
        stubGet.teamFeatures([{name: 'team-invite-acceptance', enabled: true}])
      })

      it('shows all members including those with pending invites', () => {
        let apiGetTeamInvites = stubGet.teamInvites()

        apiGetTeamMembers = stubGet.teamMembers([
          {email: 'a@heroku.com', role: 'admin'}, {email: 'b@heroku.com', role: 'collaborator'}
        ])

        return cmd.run({flags: {team: 'myteam'}})
          .then(() => expect(
            `a@heroku.com           admin
b@heroku.com           collaborator
invited-user@mail.com  admin         pending
`).to.eq(cli.stdout))
          .then(() => expect('').to.eq(cli.stderr))
          .then(() => apiGetTeamInvites.done())
          .then(() => apiGetTeamMembers.done())
      })

      it('filters members by pending invites', () => {
        let apiGetTeamInvites = stubGet.teamInvites()

        apiGetTeamMembers = stubGet.teamMembers([
          {email: 'a@heroku.com', role: 'admin'}, {email: 'b@heroku.com', role: 'collaborator'}
        ])

        return cmd.run({flags: {team: 'myteam', pending: true}})
          .then(() => expect(
            `invited-user@mail.com  admin  pending
`).to.eq(cli.stdout))
          .then(() => expect('').to.eq(cli.stderr))
          .then(() => apiGetTeamInvites.done())
          .then(() => apiGetTeamMembers.done())
      })
    })
  })
})
