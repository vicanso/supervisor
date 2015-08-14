FROM vicanso/iojs

MAINTAINER "vicansocanbico@gmail.com"

ADD ./ /node-app

RUN cd /node-app \
  && npm install --production  --registry=https://registry.npm.taobao.org

CMD cd /node-app && pm2 start pm2.json && tail -f package.json
