# Solidity store

## Description
- The administrator (owner) of the store should be able to add new products and the quantity of them.
- The administrator should not be able to add the same product twice, just quantity.
- Buyers (clients) should be able to see the available products and buy them by their id.
- Buyers should be able to return products if they are not satisfied (within a certain period in blocktime: 100 blocks).
- A client cannot buy the same product more than one time.
- The clients should not be able to buy a product more times than the quantity in the store unless a product is returned or added by the administrator (owner)
- Everyone should be able to see the addresses of all clients that have ever bought a given product.

## Requirements
In order to run locally, you will need you have
[Node.js `^14.x.x`](https://nodejs.org/en/). If you use `nvm`, you can run
```bash
nvm install
```

## Running the tests/linter locally
1. Install dependencies by running `yarn` from the project root.
2. To run the linter, use `yarn lint`
3. To run the tests, use `yarn test`