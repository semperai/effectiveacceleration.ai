FROM node:20-slim

ADD . /
RUN yarn install

ENTRYPOINT [ "/bin/bash", "-c", "yarn start"]