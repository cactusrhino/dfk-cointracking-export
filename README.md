# dfk-cointracking-export
Converts DFK Transactions to the format used by Cointracking.info. Spits out a CSV.


## About
This app is a work in progess and as such the results are NOT accurate. This app has been tested against my own wallet address and nothing else.

### Known Issues
- Will miss a few valid DFK transaction types.
- Doesn't calculate fees properly
- Units for buy and sell aren't coverted from ABI data
- Not all contracts are in the database. This only really effects converting buy/sell/fee addresses to tickers
- Doesn't handle xJEWEL transactions the way cointracking would want (will be fixed)

## Install
```npm install```
## Run
``` npm run dev``` then navigate to localhost:3030 to enter your address. It will take time (minutes for larger wallets) to process your transaction history.

## Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install dependencies

    ```
    cd path/to/dfk-transactionlog
    npm install
    ```

3. Start the app

    ```
    `` npm run dev``` then navigate to localhost:3030 to enter your address. It will take time (minutes for larger wallets) to process your transaction history.
    ```


