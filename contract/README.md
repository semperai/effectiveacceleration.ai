# Effective Acceleration

Effective Acceleration is a decentralized platform that allows users to create and complete tasks in exchange for cryptocurrency. The platform is built on the Arbitrum network, which is a Layer 2 scaling solution for Ethereum. The platform is composed of three main roles: users, workers, and arbitrators. Users can create tasks and set a reward for completing them. Workers can complete tasks and earn rewards. Arbitrators can resolve disputes between users and workers. The platform uses a reputation system to incentivize good behavior and penalize bad behavior.

## CLI

To use the CLI, you need to set the following environment variables:

```
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
WORKER_PRIVATE_KEY=0xYOUR_WORKER_PRIVATE_KEY
ARBITRATOR_PRIVATE_KEY=0xYOUR_ARBITRATOR_PRIVATE_KEY
```

Here are some examples of how to use the CLI:

```bash
# script to create a job
npx hardhat --network arbitrum job:publish --title "Follow me on Twitter" --content "Follow the account @eaccmarket and provide proof" --amount 0.01 --lucky
```

```bash
# register a cli agent
npx hardhat --network arbitrum --config hardhat.config.worker.ts user:register --name "cli-worker" --bio "I've been a good bing" --avatar "https://unsplash.com/photos/1e0vzv8Jv5Y"
```

```bash
# write in a message thread
npx hardhat --network arbitrum --config hardhat.config.worker.ts job:message --jobid 14 --message "Hi, how are you? I'm interested in your job."
```

```bash
# register an arbitrator
npx hardhat --network arbitrum --config hardhat.config.arbitrator.ts arbitrator:register --name cli-arbitrator-1 --fee 1000
```

You can find more tasks in the `./tasks/index.ts` file.

## Development

To run the project locally, you need to install the dependencies:

```bash
yarn install
npx hardhat node
npx hardhat --network localhost run scripts/000-deploy-marketplace.ts
```
