const DYNAMITE_COUNT = 100;

class Bot {
	constructor() {
		this.dynamiteAvailable = DYNAMITE_COUNT;
	}

	/** @param {{rounds: {p1: string, p2: string}[]}} gamestate */
	makeMove(gamestate) {
		if (this.getPreviousRoundWasDraw(gamestate)) {
			return this.playDynamiteMove();
		}

		return this.playRandomMove();
	}

	getDrawLength(gamestate) {
		if (!this.getPreviousRoundWasDraw(gamestate)) {
			return 0;
		}

		return 1 + this.getPreviousRoundWasDraw(gamestate);
	}

	getPreviousRoundWasDraw(gamestate) {
		if (this.isFirstRound(gamestate)) {
			return false;
		}
		return (
			this.getPreviousMove(gamestate, "p1") ===
			this.getPreviousMove(gamestate, "p2")
		);
	}

	getPreviousMove(gamestate, player) {
		return this.getPreviousRound(gamestate)[player];
	}

	getPreviousRound(gamestate) {
		return gamestate.rounds[gamestate.rounds.length - 1];
	}

	isFirstRound(gamestate) {
		return gamestate.rounds.length === 0;
	}

	playDynamiteMove() {
		if (this.getDynamiteAvailable()) {
			this.dynamiteAvailable--;
			return "D";
		}
		return this.playRandomMove();
	}

	getDynamiteAvailable() {
		return this.dynamiteAvailable > 0;
	}

	playRandomMove() {
		return ["R", "P", "S"][Math.floor(Math.random() * 3)];
	}
}

module.exports = new Bot();
