function weightedRandom(weights) {
	let sum = 0;
	const rand = Math.random();

	for (const key in weights) {
		sum += weights[key];

		if (rand <= sum) {
			return key;
		}
	}

	const keys = Object.keys(weights);
	return keys[Math.floor(rand * keys.length)];
}

class Player {
	getIsDynamiteAvailable() {
		return this.counts.D < 100;
	}

	constructor(playerTag) {
		if (!["p1", "p2"].includes(playerTag)) {
			throw new Error("Must specify which player to count");
		}
		this.counts = 0;

		this.playerTag = playerTag;
	}

	update(gamestate) {
		this.updateMoveCounts(gamestate.rounds);
	}

	resetMoveCounts() {
		this.counts = {
			R: 0,
			P: 0,
			S: 0,
			D: 0,
			W: 0,
		};
	}

	updateMoveCounts(rounds) {
		this.resetMoveCounts();

		rounds.forEach((round) => {
			Object.keys(round).forEach((playerTag) => {
				if (playerTag === this.playerTag) {
					const move = round[playerTag];
					this.counts[move] += 1;
				}
			});
		});
	}

	getMoveCounts(rounds) {
		const counts = {
			R: 0,
			P: 0,
			S: 0,
			D: 0,
			W: 0,
		};
		rounds.forEach((round) => {
			Object.keys(round).forEach((playerTag) => {
				if (playerTag === this.playerTag) {
					const move = round[playerTag];
					counts[move] += 1;
				}
			});
		});

		return counts;
	}

	getPossibleChoices(opponent) {
		const choices = ["R", "P", "S"];
		if (opponent.getIsDynamiteAvailable()) choices.push("W");
		if (this.getIsDynamiteAvailable()) choices.push("D");
		return choices;
	}

	/**
	 * @param {Player} opponent
	 * @returns {{ R?: number, P?: number, S?: number, W?: number, D?: number }}
	 */
	getProbabilities(opponent) {
		const choices = this.getPossibleChoices(opponent);

		const filteredCounts = choices.reduce((acc, curr) => {
			acc[curr] = this.counts[curr];
			return acc;
		}, {});

		const filteredSum = Object.values(filteredCounts).reduce(
			(acc, curr) => acc + curr,
			0
		);

		return choices.reduce((acc, curr) => {
            acc[curr] = filteredSum === 0 ? 0 : filteredCounts[curr] / filteredSum;
			return acc;
		}, {});
	}

	getExpectedMove(opponent) {
		const weightings = this.getProbabilities(opponent);
		return weightedRandom(weightings);
	}
}

class Bot {
	constructor() {
		this.me = new Player("p1");
		this.opponent = new Player("p2");
		this.randRounds = 100;
	}

	getRoundCount() {
		return this.gamestate.rounds.length;
	}

	getDrawLength() {
		const reversedRounds = [...this.gamestate.rounds].reverse();
		let drawLength = 0;

		for (let i = 0; i < reversedRounds.length; i++) {
			const round = reversedRounds[i];
			if (!(round.p1 === round.p2)) {
				return drawLength;
			}
			drawLength++;
		}

		return drawLength;
	}

	/**@param {{rounds: {p1: string, p2: string}[]}} gamestate  */
	makeMove(gamestate) {
		this.updateGameState(gamestate);

		const drawLength = this.getDrawLength();

		if (drawLength > 0) {
			return this.playOnDraw();
		}

		if (this.getRoundCount() < this.randRounds) {
			return this.playRandomMove();
		}

		const expectedMove = this.opponent.getExpectedMove(this.me);
		return this.playCounterMove(expectedMove);
	}

	playOnDraw() {
		const expectedMove = this.opponent.getExpectedMove(this.opponent);
		return this.playCounterMove(expectedMove);
	}

	playCounterMove(oppMove) {
		const losesTo = {
			R: ["P", "D"],
			P: ["S", "D"],
			S: ["R", "D"],
			W: ["R", "P", "S"],
			D: ["W"],
		};

		const moves = losesTo[oppMove];

		const possible = this.me.getPossibleChoices(this.opponent);

		const choices = moves.filter((c) => possible.includes(c));

		return this.playRandomChoice(choices);
	}

	playRandomMove() {
		const choices = this.me.getPossibleChoices(this.opponent);
		return this.playRandomChoice(choices);
	}

	playRandomChoice(choices) {
		const randIndex = Math.floor(Math.random() * choices.length);
		return choices[randIndex];
	}

	updateGameState(gamestate) {
		this.gamestate = gamestate;
		this.me.update(gamestate);
		this.opponent.update(gamestate);
	}
}

module.exports = new Bot();
