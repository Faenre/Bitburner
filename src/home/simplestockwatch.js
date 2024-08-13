/* Watch a stock by a ticker and report on it every cycle, to get a feel for the data. */

export async function main(ns) {
  const ticker = ns.args[0];

  let old;
  let stock = stockProps(ns, ticker);
  ns.print(`${stock.sym} has a volatility of ${stock.volatility}.`)

  do {
    old = stock;
    stock = stockProps(ns, ticker)
    ns.print(`Price: ${stock.price.toFixed(0)}, Forecast: ${(100*stock.forecast).toFixed(2)}%`);
  } while (await ns.stock.nextUpdate() /* until the next cycle */)
}

/* turn a stock into an object. lots of calls in here. */
function stockProps(ns, sym) {
  const maxShares = ns.stock.getMaxShares(sym);
  const price = ns.stock.getPrice(sym);
  return {
    'sym': sym,
    'volatility': ns.stock.getVolatility(sym),
    'forecast': ns.stock.getForecast(sym),
    price,
    maxShares,
    'sellPrice': ns.stock.getAskPrice(sym),
    'buyPrice': ns.stock.getBidPrice(sym),
    'marketCap': price * maxShares,
  };
}