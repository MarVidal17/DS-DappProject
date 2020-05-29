App = {
    loading: false,
    contracts: {},
  
    load: async () => {
      await App.loadWeb3()
      await App.loadAccount()
      await App.loadContest()
      await App.render()
      console.log('App loading...')
    },
  
    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
  
    loadAccount: async () => {
      // Set the current blockchain account
      App.account = web3.eth.accounts[0]
      console.log(App.account)
    },

    loadContest: async () => {
      // Create a JavaScript version of the smart contract
      const contestApp = await $.getJSON('ContestApp.json')
      App.contracts.contestApp = TruffleContract(contestApp)
      App.contracts.contestApp.setProvider(App.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      App.contestApp = await App.contracts.contestApp.deployed()
    },
  
    render: async () => {
      // Prevent double render
      if (App.loading) {
        return
      }
  
      // Update app loading state
      App.setLoading(true)
  
      // Render Account
      $('#account').html(App.account)
  
      // Render Contests
      await App.renderContests()
  
      // Update loading state
      App.setLoading(false)
    },
  
    renderContests: async () => {
      const contestCount = await App.contestApp.contestCount()
      const $contestTemplate = $('.contestTemplate')
  
      for (var i = 1; i <= contestCount; i++) {
        const contest = await App.contestApp.contests(i)
        const contestId = contest[1].toNumber()
        const contestStage_num = contest[2].toNumber()
        const contestTitle = contest[3]
        const contestBasis = contest[4]
        const contestDeadline = contest[5]
        const contestResolution_deadline = contest[6]
        const contestAward = contest[7]
        const contestContestantsCount = contest[8].toNumber()
        const contestWinner_id = contest[9]
        const contestContestants = contest[10]

        var contestStage = ''
        var contestWinner = ''
        switch(contestStage_num) {
          case 1:
            contestStage = 'Ongoing'
            break;
          case 2:
            contestStage = 'Being judged'
            break;
          case 3:
            contestStage = 'Finished'
            contestWinner = await App.contestApp.get_contestant_name(i, contestWinner_id)
            break;
          default:
            contestStage = 'Contest to start'
        }
  
        const $newContestTemplate = $contestTemplate.clone()
        $newContestTemplate.find('.contest_id').html(contestId)
        $newContestTemplate.find('.stage').html(contestStage)
        $newContestTemplate.find('.title').html(contestTitle)
        $newContestTemplate.find('.basis').html(contestBasis)
        $newContestTemplate.find('.deadline').html(contestDeadline)
        $newContestTemplate.find('.resolution').html(contestResolution_deadline)
        $newContestTemplate.find('.award').html(contestAward)
        $newContestTemplate.find('.contestants_count').html(contestContestantsCount)
        $newContestTemplate.find('.winner').html(contestWinner)

        $('#contestList').append($newContestTemplate)

  
        $newContestTemplate.show()
      }
    },

    getContestants: async () => {
      const id = $('#idContest_contestants').val()
      const contest = await App.contestApp.contests(id)
      const contestContestantsCount = contest[8].toNumber()

      const $contestInfoTemplate = $('.contestInfoTemplate')
      $contestInfoTemplate.find('.contestants_contest_id').html(id)
      $contestInfoTemplate.find('.contestants_contest_title').html(contest[3])
      $('#contestInfo').append($contestInfoTemplate)
      $contestInfoTemplate.show()

      const $contestantsTemplate = $('.contestantsTemplate')

      for (var i = 1; i <= contestContestantsCount; i++) {
        contestant_name = await App.contestApp.get_contestant_name(id, i)

        const $newContestantsTemplate = $contestantsTemplate.clone()
        $newContestantsTemplate.find('.contestant_id').html(i)
        $newContestantsTemplate.find('.name').html(contestant_name)

        $('#contestantsList').append($newContestantsTemplate)

        // Show the task
        $newContestantsTemplate.show()
      }
    },

    createContest: async () => {
      App.setLoading(true)
      const title = $('#newContestTitle').val()
      const basis = $('#newContestBasis').val()
      const deadline = $('#newContestDeadline').val()
      const resolution = $('#newContestResolution').val()
      const award = $('#newContestAward').val()
      await App.contestApp.createContest(title, basis, deadline, resolution, award)
      window.location.reload()
    },

    setContestOngioing: async () => {
      App.setLoading(true)
      const id = $('#idContest_ongoing').val()
      await App.contestApp.setContestOngioing(id)
      window.location.reload()
    },

    setContestJudgeStage: async () => {
      App.setLoading(true)
      const id = $('#idContest_resolution').val()
      await App.contestApp.setContestJudgeStage(id)
      window.location.reload()
    },

    setWinner: async () => {
      App.setLoading(true)
      const id = $('#idContest_setwinner').val()
      const winner_id = $('#winnerid_setwinner').val()
      await App.contestApp.setWinner(id, winner_id)
      window.location.reload()
    },

    participate: async () => {
      App.setLoading(true)
      const id =$('#idContest_participate').val()
      const name = $('#contestant_name').val()
      await App.contestApp.participate(id, name)
      window.location.reload()
    },
  
    setLoading: (boolean) => {
      App.loading = boolean
      const loader = $('#loader')
      const content = $('#content')
      if (boolean) {
        loader.show()
        content.hide()
      } else {
        loader.hide()
        content.show()
      }
    }
  }
  
  $(() => {
    $(window).load(() => {
      App.load()
    })
  })
  