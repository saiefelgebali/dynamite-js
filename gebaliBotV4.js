const DYNAMITE_COUNT = 100;

class Game {
	/** @param {{rounds: {p1: string, p2: string}[]}} gamestate */
	constructor(gamestate) {
		this.gamestate = gamestate;
	}

	updateGameState(gamestate) {
		this.gamestate = gamestate;
	}

	isFirstRound() {
		return this.gamestate.rounds.length === 0;
	}

	getRoundNumber() {
		return this.gamestate.rounds.length;
	}

	getPreviousDrawsWereDynamite() {
		if (this.getRoundNumber() < 3) {
			return false;
		}

		if (this.getDrawLength() < 2) {
			return false;
		}

		return this.getPreviousMoves("p2", 2).every((move) => move === "D");
	}

	getDrawLength(n = 0) {
		if (!this.getMoveFromEndWasDraw(n)) {
			return 0;
		}

		return 1 + this.getDrawLength(n + 1);
	}

	getPreviousMoves(player, n) {
		const moves = new Array(n).fill("");
		return moves.map((_, i) => {
			return this.getMoveFromEnd(player, i);
		});
	}

	getRoundFromEnd(n) {
		return this.gamestate.rounds[this.gamestate.rounds.length - (1 + n)];
	}

	getMoveFromEnd(player, n) {
		return this.getRoundFromEnd(n)[player];
	}

	getMoveFromEndWasDraw(n) {
		if (n > this.getRoundNumber() - 1) {
			return false;
		}

		return this.getMoveFromEnd("p1", n) === this.getMoveFromEnd("p2", n);
	}

	getPreviousRound() {
		return this.getRoundFromEnd(0);
	}

	getPreviousRoundWasDraw() {
		if (this.isFirstRound()) {
			return false;
		}
		return this.getPreviousMove("p1") === this.getPreviousMove("p2");
	}

	getPreviousMove(player) {
		return this.getPreviousRound()[player];
	}
}

class Player {
	/**
	 * @param {string} player
	 * @param {Game} game
	 */
	constructor(player, game) {
		this.player = player;
		this.game = game;
		this.dynamiteAvailable = DYNAMITE_COUNT;
	}

	getDynamiteAvailable() {
		return this.dynamiteAvailable > 0;
	}

	updatePlayerState() {
		if (this.game.isFirstRound()) {
			return;
		}

		if (this.game.getPreviousMove(this.player) === "D") {
			this.dynamiteAvailable--;
		}
	}
}

class Bot {
	constructor() {
		const game = new Game({ rounds: [] });
		this.opponent = new Player("p2", game);
		this.me = new Player("p1", game);
		this.game = game;
	}

	makeMove(gamestate) {
		this.game.updateGameState(gamestate);
		this.me.updatePlayerState();
		this.opponent.updatePlayerState();

		if (this.game.getPreviousRoundWasDraw()) {
			if (this.game.getPreviousDrawsWereDynamite()) {
				return this.playWaterMove();
			}

			return this.playDynamiteOrWaterMove();
		}

		return this.playRandomMove();
	}

	playBetween(moves) {
		return moves[Math.floor(Math.random() * moves.length)];
	}

	playDynamiteOrWaterMove() {
		return this.playBetween([
			this.playDynamiteMove(),
			this.playWaterMove(),
		]);
	}

	playWaterMove() {
		if (this.opponent.getDynamiteAvailable()) {
			return "W";
		}
		return this.playRandomMove();
	}

	playDynamiteMove() {
		if (this.me.getDynamiteAvailable()) {
			return "D";
		}
		return this.playRandomMove();
	}

	playRandomMove() {
		return ["R", "P", "S"][Math.floor(Math.random() * 3)];
	}
}

module.exports = new Bot();
