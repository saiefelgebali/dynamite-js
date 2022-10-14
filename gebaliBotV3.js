const DYNAMITE_COUNT = 100;

class Bot {
	constructor() {
		this.dynamiteAvailable = DYNAMITE_COUNT;
	}

	/** @param {{rounds: {p1: string, p2: string}[]}} gamestate */
	makeMove(gamestate) {
		if (this.getPreviousRoundWasDraw(gamestate)) {
			return this.playBetween(
				{
					move: this.playDynamiteMove(),
					ratio: this.getDrawLength(gamestate) * 2,
				},
				{
					move: this.playRandomMove(),
					ratio: 1,
				}
			);
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

	playBetween(moveA, moveB) {
		const ratioSum = moveA.ratio + moveB.ratio;
		const weightA = moveA.ratio / ratioSum;
		const weightB = moveB.ratio / ratioSum;
		const moveWeights = [
			{ move: moveA.move, weight: weightA },
			{ move: moveB.move, weight: weightB },
		];
		return this.playWeightedRandom(moveWeights);
	}

	playWeightedRandom(moveWeights) {
		const rand = Math.random();
		let sum = 0;

		for (let i = 0; i < moveWeights.length; i++) {
			const { move, weight } = moveWeights[i];
			sum += weight;
			if (rand <= sum) {
				return move;
			}
		}

		return this.playRandomMove();
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
