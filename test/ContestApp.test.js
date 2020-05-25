const ContestApp = artifacts.require('./ContestApp.sol')

contract('Contest', (accounts) => {
  before(async () => {
    this.contest = await ContestApp.deployed()
  })

  it('deploys successfully', async () => {
    const address = await this.contest.address
    assert.notEqual(address, 0x0)
    assert.notEqual(address, '')
    assert.notEqual(address, null)
    assert.notEqual(address, undefined)
  })

  it('lists contest count', async () => {
    const contestCount = await this.contest.contestCount()
    assert.equal(contestCount.toNumber(), 0)
  })

  it('create contest', async () => {
    const result = await this.contest.createContest('Title', 'Basis', 'Deadline', 'ResolutionDeadline', 'Award')
    const contestCount = await this.contest.contestCount()
    assert.equal(contestCount, 1)
    const event = result.logs[0].args
    assert.notEqual(event.contest_organizer, null)
    assert.equal(event.id.toNumber(), 1)
    assert.equal(event.stage, 0)
    assert.equal(event.title, 'Title')
    assert.equal(event.basis, 'Basis')
    assert.equal(event.deadline, 'Deadline')
    assert.equal(event.resolution_deadline, 'ResolutionDeadline')
    assert.equal(event.award, 'Award')
    assert.equal(event.contestantsCount, 0)
  })

  it('set contest ongoing', async () => {
    const result = await this.contest.setContestOngioing(1)
    const contest = await this.contest.contests(1)
    assert.equal(contest.stage, 1)
    const event = result.logs[0].args
    assert.equal(event.id.toNumber(), 1)
    assert.equal(event.stage, 1)
  })

  it('participate', async () => {
    const result = await this.contest.participate(1, 'Name')
    const contest = await this.contest.contests(1)
    assert.equal(contest.contestantsCount, 1)
    //const new_contestant = contest.contestants
    //assert.equal(new_contestant.id, 1)
    //assert.notEqual(new_contestant.contestant_address, null)
    //assert.equal(new_contestant.name, 'Name')
    //assert.equal(new_contestant.is_winner, false)
    const event = result.logs[0].args
    assert.equal(event.id.toNumber(), 1)
    assert.equal(event.contestant_name, 'Name')
  })

  it('set contest judge stage', async () => {
    const result = await this.contest.setContestJudgeStage(1)
    const contest = await this.contest.contests(1)
    assert.equal(contest.stage, 2)
    const event = result.logs[0].args
    assert.equal(event.id.toNumber(), 1)
    assert.equal(event.stage, 2)
  })

  it('set contest winner', async () => {
    const result = await this.contest.setWinner(1, 1)
    const contest = await this.contest.contests(1)
    assert.equal(contest.stage, 3)
    assert.equal(contest.winner_id, 1)
    const event = result.logs[0].args
    assert.equal(event.id.toNumber(), 1)
    assert.equal(event.stage, 3)
    assert.equal(event.winner_name, 'Name')
  })

})
