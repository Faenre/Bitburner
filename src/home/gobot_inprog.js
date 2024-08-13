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
		return this.grid.map((row) => row.map((node) => node.char).join('')).join('\n');
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

// pick the best option by sorting via this function
function strategy1(ns, board) {
	const validMoves = ns.go.analysis.getValidMoves(); // a [][] grid of coordinates

	const openNodes = []
	for (let y=0; y < validMoves.length; y++) {
		for (let x=0; x < validMoves[y].length; x++) {
			if (validMoves[y][x]) 
				openNodes.push(board.nodeAt(x, y));
		}
	}

	return openNodes.sort(sort);

	function sort(a, b) {
		// const board = Board(EXAMPLE_BOARD);
		const isOpen = (n) => n.char === Node.OPEN;
		const isEnemy = (n) => n.char === Node.WHITE;

		// distance from center (low is better)
		const distanceFromCenter = (n) => n.distanceTo(board.center());
		// most open connections (high is better)
		const openConnections = (n) => board.neighbors(n).filter(isOpen).length;
		// distance from friends (low is better)
		const distanceFromFriends = (n1) => board.nodesBelongingTo(Node.BLACK).reduce((sum, n2) => sum + n1.distanceTo(n2), 0);

		// # enemy neighbors (high is better)
		const enemyNeighbors = (n) => board.neighbors(n).filter(isEnemy).length;
		// avg enemy node distance (low is better)
		const distanceFromEnemies = (n1) => board.nodesBelongingTo(Node.WHITE).reduce((sum, n2) => sum + n1.distanceTo(n2), 0);

		// put it all together
		return null ||
		(distanceFromCenter(a) - distanceFromCenter(b)) ||
		(openConnections(b) - openConnections(a)) ||
		(distanceFromFriends(a) - distanceFromFriends(b)) ||
		(enemyNeighbors(b) - enemyNeighbors(a)) ||
		(distanceFromEnemies(a) - distanceFromEnemies(b)) ||
		-1
	}
}