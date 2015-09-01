FROM vicanso/iojs

MAINTAINER "vicansocanbico@gmail.com"

ADD ./ /supervisor

RUN cd /supervisor \
  && npm install --production  --registry=https://registry.npm.taobao.org

CMD cd /supervisor && node app
