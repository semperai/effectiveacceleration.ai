FROM node:20-slim

ADD . /contract/
RUN cd /contract/ && yarn install && yarn tsc && yarn compile && yarn wagmi

ENTRYPOINT [ "/bin/bash", "-c", "cd /contract/ && yarn local"]
