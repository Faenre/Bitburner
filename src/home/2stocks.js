/** @param {NS} ns */
export async function main(ns) {
	const wallet = new Wallet(ns);
	const market = new Market(ns, wallet);
	ns.tail();
	
	do {
		market.update();
		// market.sellStocks();
		// market.buyStocks();
	} while (await ns.stock.nextUpdate());
}

class Wallet {
	static ALLOCATION = 0.20; // what % of our wallet should be allocated to our stock portfolio?

	constructor(ns, paper=false) {
		this.ns = ns;
	}

	budget(portfolioPositions) {
		return (this.ns.getPlayer().money * Wallet.ALLOCATION) - portfolioPositions;
	}
}

class Market {
	static PER_STOCK_BUDGET = 0.20;

	constructor(ns, wallet) {
		this.ns = ns;
		this.stocks = Stock.factory(ns);
		this.wallet = wallet;
	}

	buyStocks() {
		// this.ns.print(this.stocks.length);
		const isIncreasing = (s) => s.forecast() > 0.00;
		const byMagnitudeShares = (a, b) => (b.forecast() * b.price()) - (a.forecast() * a.price())
		const sortedStocks = this.stocks.filter(isIncreasing).sort(byMagnitudeShares);

		let budget = this.wallet.budget(this.positionSum());
		for (let i=0; (i < sortedStocks.length) && (budget >= 10e6); i++) {
			const amtSpent = sortedStocks[i].buyValue(budget * Market.PER_STOCK_BUDGET);
			budget -= amtSpent;
		}
	}

	sellStocks() {
		const hasShares = (s) => s.longShares() > 0;
		const isDecreasing = (s) => s.forecast() < 0.00;
		const filteredStocks = this.stocks.filter(hasShares).filter(isDecreasing);
		for (let stock of filteredStocks) 
			stock.sellAll();
	}

	update() {
		for (let stock of this.stocks)
			stock.update();
		this.ns.print(`INFO history size is ${this.stocks[0].history.length}`);
	} 
	ownedStocks = () => this.stocks.filter((s) => s.longShares);
	positionSum = () => this.stocks.reduce((acc, s) => acc + s.positionTotal(), 0);
}

class Stock {
	static factory(ns) {
		return ns.stock.getSymbols().map(sym => new Stock(ns, sym));
	}

	static MINIMUM_BUY = 10e6;
	static COMISSION_FEE = 1e5;

	constructor(ns, sym) {
		this.ns = ns;
		this.sym = sym;
		this.history = new PriceHistory();
		this.maxShares = ns.stock.getMaxShares(sym);
		this.companyNamee = ns.stock.getOrganization(sym);
	}
	
	// [longShares, longPosAvg, shortShares, shortPosAvg]
	position = () => this.ns.stock.getPosition(this.sym);

	positionTotal() {
		const pos = this.position();
		return (pos[0] * pos[1]) + (pos[2] * pos[3]);
	}

	longShares = () => this.position()[0];
	shortShares = () => this.position()[2];

	price = () => this.history.latest.avg;

	update() {
		const ask = this.ns.stock.getAskPrice(this.sym);
		const bid = this.ns.stock.getBidPrice(this.sym);
		const avg = this.ns.stock.getPrice(this.sym);
		this.history.add(ask, bid, avg);
	}

	buyValue(value) {
		const sharesAvailable = this.maxShares - this.longShares();
		const sharesToBuy = Math.min(sharesAvailable, Math.floor(value / this.price()));
		if (sharesToBuy * this.price() < Stock.MINIMUM_BUY)
			return 0
		return sharesToBuy * this.ns.stock.buyStock(this.sym, sharesToBuy) + Stock.COMISSION_FEE;
	}

	sellAll() {
		this.ns.stock.sellStock(this.sym, this.longShares());
	}

	forecast() {
		if (this.history.length < 15) return 0;
		const avg5 = this.history.avg(5);
		const avg15 = this.history.avg(15);
		// this.ns.print(avg5);
		const magnitude = (avg5 - avg15) / this.ns.stock.getPrice(this.sym);
		// this.ns.print(magnitude);
		return magnitude;
	}
}

class PriceHistory {
	static MAX_SIZE = 50;

	constructor() {
		this.latest = {};
		this.oldest = {};
		this.length = 0;
	}

	add(ask, bid, avg) {
		const next = this.latest;
		this.latest = { ask, bid, avg, next, 'prev': null };
		next.prev = this.latest;

		if (this.length === 0) {
			this.oldest = this.latest;
			this.length += 1;
		} else if (this.length === PriceHistory.MAX_SIZE) {
			this.oldest = this.oldest.prev;
			delete this.oldest.next;
		} else {
			this.length += 1;
		}
	}

	current() {
		return {
			'ask': this.latest.ask,
			'bid': this.latest.bid,
			'avg': this.latest.avg,
		};
	}

	window(distance) {
		distance = Math.min(distance, this.length);
		const window = [];
		for (let current = this.latest; window.length < distance; current = current.next)
			window.push(current);
		return window;
	}

	avg(distance) {
		if (!distance) return 0;
		distance = Math.min(distance, this.length);

		const addPrices = (sum, p) => sum + p.avg;
		const sum = this.window(distance).reduce(addPrices, 0);
		return sum / distance;
	}
}
