ARG NODE_TAG=14.17
FROM node:$NODE_TAG-alpine AS build-modules
RUN apk add --update-cache tzdata curl && \
    rm -rf /var/cache/apk/* && \
    curl -sf https://gobinaries.com/tj/node-prune | sh && \
    npm i -g npm
WORKDIR /home/node/app 
COPY package*.json ./
RUN npm --production ci && node-prune

FROM node:$NODE_TAG-alpine AS dev
RUN npm i -g npm
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
USER node
WORKDIR /home/node/app
COPY --chown=node package*.json .nvmrc ./
RUN npm i
COPY --chown=node tsconfig*.json ./
COPY --chown=node src ./src
CMD npm run build && npm run start:watch

FROM dev AS build-sources
RUN npm run build

FROM node:$NODE_TAG-alpine
RUN apk add tzdata && npm i -g npm && npm cache clean --force
USER node
WORKDIR /home/node/app
ARG BUILD_ID
ENV BUILD_ID=$BUILD_ID
COPY --chown=node --from=build-modules /home/node/app/node_modules ./node_modules
COPY --chown=node --from=build-sources /home/node/app/dist ./dist
COPY --chown=node package*.json .nvmrc ./
CMD ["npm", "run", "start:prod"]
