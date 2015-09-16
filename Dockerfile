FROM vicanso/node:4.0.0

MAINTAINER "vicansocanbico@gmail.com"

ADD ./ /supervisor

RUN cd /supervisor \
  && npm install --production  --registry=https://registry.npm.taobao.org

CMD cd /supervisor && NODE_ENV=production node app
