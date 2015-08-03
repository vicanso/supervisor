FROM vicanso/iojs

MAINTAINER "vicansocanbico@gmail.com"

ADD ./ /app

RUN cd /app \
  && npm install --production  --registry=https://registry.npm.taobao.org

CMD cd /app && pm2 start pm2.json && tail -f package.json
