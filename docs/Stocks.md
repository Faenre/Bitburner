
Top-level goal: **buy at valleys, sell at cliffs.**

- Watch stocks' Forecasts
- When Forecast changes from negative to positive, buy (if player can `getMaxShares`)
- When Forecast changes from positive to negative, sell (if getSaleGain > 0)
- `await nextUpdate()`

A "stock" object should have:
- symbol
- stocks owned
- lowest price()
- highest price()
- current price
- current volatility
- current forecast
- forecastChanged
- tickupdate():
	- update prices
	- check forecast change

It should record a history of:
- price
- volatility
- forecast

One strategy:
- Calibration should be able to read 100 history points to gather a baseline
- 