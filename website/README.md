# Effective Acceleration

[![Coverage Status](https://coveralls.io/repos/github/semperai/effectiveacceleration.ai/badge.svg?branch=master)](https://coveralls.io/github/semperai/effectiveacceleration.ai?branch=master)

## Getting Started

1. Make sure you have npm and node installed (ideally global)

- make sure the right version is used. this can be achieved by running nvm install and nvm use in order to use the version defined in [.nvmrc](https://github.com/semperai/effectiveacceleration.ai/blob/master/website/.nvmrc)

- make sure you run this in the /website dir

```bash
nvm install
nvm use
```

2. Fork the project and git checkout/clone your fork locally
3. Copy the [env.example](https://github.com/semperai/effectiveacceleration.ai/blob/master/website/env.example) to .env in the website folder

```bash
cp env.example .env
```

4. Edit any settings in the .env you need changed (local port etc.).
5. Install dependencies

```bash
npm install
```

6. run the server with npm run dev or npm run build + npm start should run without any errors

```bash
npm run dev
```

```bash
npm run build
npm start
```

8. Open the build [http://localhost:3000](http://localhost:3000) with your browser
