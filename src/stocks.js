const STRATEGIES = {
  'ONLY_UP': onlyUp,
};
const DEFAULT = 'ONLY_UP';
const THRESHOLD = 0.58;

export async function main(ns) {
  const strategy = STRATEGIES[ns.args[0] || DEFAULT];

  for (let counter = 0; ; counter++, await ns.stock.nextUpdate()) {
    const stocks = getCurrentStocks(ns);
    strategy(ns, stocks);

    if (counter % 100 == 0) 
      logMarketStatus(ns, stocks);
  }
}

function logMarketStatus(ns, stocks) {
  const marketCap = stocks.reduce((a, b) => a + b.marketCap, 0);
  const sentiment = stocks.reduce((a, b) => a + b.forecast, 0) / stocks.length;
  const portfolio = stocks.reduce((a, b) => a + b.positionSum, 0);
  ns.print(`INFO: Current market cap is ${ns.formatNumber(marketCap)}.`);
  ns.print(`INFO: Market sentiment is ${sentiment.toFixed(3)}.`);
  ns.print(`INFO: Personal portfolio is valued at ${ns.formatNumber(portfolio)}.`);
}

// Simplest of trade strategies: 
// Buy when stock is forecasted to go up
// Sell when stock is forecasted to go down
function onlyUp(ns, stocks) {
  // We group the buys and sells so we can bundle the operations together later.
  const buys = [];
  const sells = [];
  for (let s of stocks) {
    if (!s.positionSum && (s.forecast >= THRESHOLD))
      buys.push(s);
    else if (s.positionSum && (s.forecast < 0.50))
      sells.push(s);
  }

  // Sell before trying to buy, to free up cash
  const profit = sells.reduce((a, s) => a + s.sell(), 0);

  // Buy stocks in descending order of forecast
  // @TODO: add stock volatility to calculation?
  buys.sort((a, b) => b.forecast - a.forecast);
  buys.map(s => s.buy());

  // Log results
  if (!profit) return;
  const message = `Sold ${sells.map(s => s.sym).join(', ')} for net change of ${ns.formatNumber(profit)}.`
  ns.print(`${profit > 0 ? 'SUCCESS' : 'WARNING'}: ${message}`);
  ns.toast(message, profit > 0 ? 'success' : 'warning', 10000);
}

const newStock = (ns, sym) => {
  const price = ns.stock.getPrice(sym);
  const position = ns.stock.getPosition(sym);
  const maxShares = ns.stock.getMaxShares(sym);
  const forecast = ns.stock.getForecast(sym);

  const buy = (shares = maxShares) => {
    const price = ns.stock.buyStock(sym, shares);
    if (price) 
      position[0] += Math.min(maxShares - position[0], shares);
    return price;
  }
  const sell = (shares = position[0]) => {
    const gains = ns.stock.sellStock(sym, shares) * shares;
    if (gains)
      position[0] -= Math.min(position[0], shares)
    return gains;
  };
  return {
    sym,
    price,
    maxShares,
    "sharesOwned": position[0],
    forecast,
    position,
    buy,
    sell,
    "positionSum": position[0] * position[1],
    "marketCap": price * maxShares,
  };
}
const getCurrentStocks = (ns) => ns.stock.getSymbols().map(sym => newStock(ns, sym));