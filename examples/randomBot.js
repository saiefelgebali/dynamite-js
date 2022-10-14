const getMoveCounts = (rounds, playerTag) => {
	const counts = {
		R: 0,
		P: 0,
		S: 0,
		W: 0,
		D: 0,
	};
	rounds.forEach((round) => {
		Object.keys(round).forEach((tag) => {
			if (tag === playerTag) {
				const move = round[playerTag];
				counts[move] += 1;
			}
		});
	});
	return counts;
};

class Bot {
	makeMove(gamestate) {
		const myMoveCounts = getMoveCounts(gamestate.rounds, "p1");
		const opponentMoveCounts = getMoveCounts(gamestate.rounds, "p2");

		const choices = ["R", "P", "S"];
		if (opponentMoveCounts.D < 100) choices.push("W");
		if (myMoveCounts.D < 100) choices.push("D");

		const randIndex = Math.floor(Math.random() * choices.length);
		return choices[randIndex];
	}
}

module.exports = new Bot();
