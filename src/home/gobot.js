const EXAMPLE_BOARD = [  
"XX.O.",  
"X..OO",  
".XO..",  
"XXO.#",  
".XO.#",  
];

/** @param {NS} ns */
export async function main(ns) {
	const boardState = ns.go.getBoardState();
	const board = new Board(boardState);

	const moves = ns.go.analysis.getValidMoves();
	ns.tprint(moves);
	ns.tprint('\n' + board.toText());
	ns.tprint(strategy1(ns, board));
}

class Board {
	static fromCurrentState = (ns) => new Board(ns.go.getBoardState());

	constructor(boardState) {
		this.gridSize = boardState[0].length;
		this.grid = [];
		for (let y = 0; y < boardState.length; y++) {
			this.grid.push([]);
			for (let x = 0; x < boardState.length; x++) {
				const node = new Node(boardState[x][y], x, y);
				this.grid[y].push(node);
			}
		}
		// this.grid.reverse();
	}

	center() {
		const midpoint = Math.floor(this.gridSize / 2);
		return this.grid[midpoint, midpoint];
	}

	nodes() {
		return this.grid.reduce((a, b) => a.concat(b));
	}

	nodeAt(x, y) {
		if (x < 0) x += this.gridSize;
		if (y < 0) y += this.gridSize;
		if (x >= this.gridSize) y -= this.gridSize;
		if (y >= this.gridSize) y -= this.gridSize;
		return this.grid[y][x];
	}

	neighbors(node) {
		const [x, y] = [node.x, node.y];
		return [
			[x - 1, y],
			[x + 1, y],
			[x, y - 1],
			[x, y + 1]
		].map((x1, y1) => this.nodeAt(x1, y1));
	}

	nodesBelongingTo(status) {
		return this.nodes().filter((n) => n.char === status);
	}

	toText() {
		return this.grid
		.map(r => r)
		.reverse()
		.map((row) => row.map((node) => node.char).join(''))
		.join('\n');
	}
}

class Node {
	static OPEN = '.';
	static BLACK = 'X';
	static WHITE = 'O';
	static DEAD = '#';

	constructor(char, x, y) {
		this.char = char;
		this.x = x;
		this.y = y;
	}

	distanceTo(other) {
		return Node.distanceBetween(this, other);
	}

	static distanceBetween(a, b) {
		const dist = (pos1, pos2) => Math.abs(pos1 - pos2);
		return dist(a.x, b.x) + dist(a.y, b.y);
	}
}
