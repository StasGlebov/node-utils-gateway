FROM node:12-alpine
WORKDIR /usr/app

COPY . .
EXPOSE 3090

RUN npm install
CMD [ "node", "index.js" ]
