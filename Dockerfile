FROM node:12-alpine
WORKDIR /usr/src/app

COPY . .
#COPY ./entrypoint.sh /usr/bin/entrypoint.sh
#ENTRYPOINT [ "entrypoint.sh" ]
EXPOSE 3090

RUN npm install
CMD [ "node", "index.js" ]
