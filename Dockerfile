FROM vicanso/node:4.0.0

MAINTAINER "vicansocanbico@gmail.com"

ADD ./ /supervisor

RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && cd /supervisor \
  && npm install --production  --registry=https://registry.npm.taobao.org

CMD cd /supervisor && NODE_ENV=production node app
