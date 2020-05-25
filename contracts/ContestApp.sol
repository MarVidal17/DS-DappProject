pragma solidity ^0.5.0;

contract ContestApp {
    uint public contestCount = 0;

    struct Contestant{
        uint id;
        address contestant_address;
        string name;
        bool is_winner;
    }

    struct Contest{
        address contest_organizer;
        uint id;
        uint stage; //0: Contest to be set, 1: Ongoing, 2: Resolution statge, 3: Finished
        string title;
        string basis;
        string deadline;
        string resolution_deadline;
        string award;
        uint contestantsCount;
        uint winner_id;
        mapping(uint => Contestant) contestants;
    }

    mapping(uint => Contest) public contests;

    event contestCreated(
        address contest_organizer,
        uint id,
        uint stage, //0: Contest to be set, 1: Ongoing, 2: Judge statge, 3: Finished
        string title,
        string basis,
        string deadline,
        string resolution_deadline,
        string award,
        uint contestantsCount
    );

    event stageUpdated(
        uint id,
        uint stage
    );

    event winnerSet(
        uint id,
        uint stage,
        string winner_name

    );

    event newContestant(
        uint id,
        string contestant_name
    );

    function get_contestant_name(uint _id, uint _contestant_id) public view returns(string memory) {
        Contest storage _contest = contests[_id];
        Contestant memory _contestant = _contest.contestants[_contestant_id];
        return _contestant.name;
    }

    function createContest(string memory _title, string memory _basis, string memory _deadline, string memory _resolution_deadline, string memory _award) public {
        contestCount ++;
        contests[contestCount] = Contest(msg.sender, contestCount, 0, _title, _basis, _deadline, _resolution_deadline, _award, 0, 0);
        emit contestCreated(msg.sender, contestCount, 0, _title, _basis, _deadline, _resolution_deadline, _award, 0);
    }

    function setContestOngioing(uint _id) public {
        Contest memory _contest = contests[_id];
        require(msg.sender == _contest.contest_organizer, "Caller is not the contest organizer");
        require(_contest.stage == 0, "The contest has to be in the initial stage");
        _contest.stage = 1;
        contests[_id] = _contest;
        emit stageUpdated(_id, _contest.stage);
    }

    function setContestJudgeStage(uint _id) public {
        Contest memory _contest = contests[_id];
        require(msg.sender == _contest.contest_organizer, "Caller is not the contest organizer");
        require(_contest.stage == 1, "The contest has to be ongoing");
        _contest.stage = 2;
        contests[_id] = _contest;
        emit stageUpdated(_id, _contest.stage);
    }

    function setWinner(uint _id, uint _winner_id) public {
        Contest storage _contest = contests[_id];
        Contestant memory _winner_contestant = _contest.contestants[_winner_id];
        require(msg.sender == _contest.contest_organizer, "Caller is not the contest organizer");
        require(_contest.stage == 2, "The contest has to be ongoing");
        _contest.winner_id = _winner_id;
        _contest.stage = 3;
        _winner_contestant.is_winner = true;
        _contest.contestants[_winner_id] = _winner_contestant;
        contests[_id] = _contest;
        emit winnerSet(_id, _contest.stage, _winner_contestant.name);
    }

    function participate(uint _id, string memory _name) public {
        Contest storage _contest = contests[_id];
        require(_contest.stage == 1, "The contest has to be ongoing");
        _contest.contestantsCount ++;
        _contest.contestants[_contest.contestantsCount] = Contestant(_contest.contestantsCount, msg.sender, _name, false);
        contests[_id] = _contest;
        emit newContestant(_id, _name);
    }
}