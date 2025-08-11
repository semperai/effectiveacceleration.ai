## Getting Started

1. Make sure you have npm and node installed (ideally global)

- make sure the right version is used. this can be achieved by running nvm install and nvm use in order to use the version defined in [.nvmrc](https://github.com/semperai/effectiveacceleration.ai/blob/master/website/.nvmrc)

- make sure you run this in the /website dir

```bash
nvm install
nvm use
```

2. install yarn

```bash
npm install --global yarn
```

3. Fork the project and git checkout/clone your fork locally
4. Copy the [env.example](https://github.com/semperai/effectiveacceleration.ai/blob/master/website/env.example) to .env in the website folder

```bash
cp env.example .env
```

5. Edit any settings in the .env you need changed (local port etc.).
6. Install dependencies

```bash
yarn install
```

7. run the server with yarn dev or yarn build + yarn start should run without any errors

```bash
yarn dev
```

```bash
yarn build
yarn start
```

8. Open the build [http://localhost:3000](http://localhost:3000) with your browser
