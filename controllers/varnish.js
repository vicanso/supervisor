'use strict';
const etcd = require('../helpers/etcd');
const parallel = require('co-parallel');
const request = require('superagent');
const util = require('util');
const _ = require('lodash');
const Joi = require('joi');
const httpRequest = require('../helpers/http-request');
const debug = require('../helpers/debug');
exports.view = view;
exports.list = list;
exports.stats = stats;

/**
 * [view description]
 * @return {[type]} [description]
 */
function *view(){
  /*jshint validthis:true */
  let ctx = this;
  yield Promise.resolve();
  ctx.set('Cache-Control', 'public, max-age=60');
  ctx.state.viewData = {
    page : 'varnish'
  };
}


/**
 * [list description]
 * @return {[type]} [description]
 */
function *list() {
  /*jshint validthis:true */
  let ctx = this;
  let query = ctx.query;
  debug('varnish list query:%j', query);
  let arr = yield etcd.list(query.key);
  debug('varnish list:%j', arr);
  let fns = arr.map(getVarnishInfo);
  ctx.set('Cache-Control', 'public, max-age=10');
  ctx.body = yield parallel(fns);
}


/**
 * [getVarnishInfo description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function *getVarnishInfo(options) {
  let config = _.pick(options.value, ['port', 'ip']);
  let ip = config.ip;
  let url = util.format('http://%s:%s/ping', ip, config.port);
  let res = yield httpRequest.get(url);
  let arr = res.text.split(' ');
  config.updatedAt = arr[0];
  config.version = arr[1];

  url = util.format('http://%s:%s/v-vcl', ip, config.port);
  res = yield httpRequest.get(url);
  config.vcl = res.text;

  res = yield etcd.list(arr[2]);
  config.backends = _.map(res, function (tmp) {
    return tmp.value;
  });
  return config;
}


/**
 * [stats description]
 * @return {[type]} [description]
 */
function *stats() {
  /*jshint validthis:true */
  let ctx = this;
  let schema = {
    ip : Joi.string().ip({
      version : ['ipv4', 'ipv6']
    }).required(),
    port : Joi.number().integer().required()
  };
  let params = Joi.validateThrow(ctx.params, schema);
  let url = util.format('http://%s:%s/v-stats', params.ip, params.port);
  let res = yield httpRequest.get(url);
  let data = _.get(res, 'body');
  if (!data) {
    return ctx.throw(new Error('Can not get varnish stats!'));
  }

  let result = {
    uptime : data.uptime,
    others : {
      losthdr : data.losthdr,
      pool : data.pools,
      vmods : data.vmods
    }
  };

  // backend相关信息
  result.backend = {
    conn : data.backend_conn,
    unhealthy : data.backend_unhealthy,
    busy : data.backend_busy,
    fail : data.backend_fail,
    reuse : data.backend_reuse,
    toolate : data.backend_toolate,
    recycle : data.backend_recycle,
    retry : data.backend_retry,
    req : data.backend_req
  };

  // bans相关信息
  result.bans = {
    total : data.bans,
    added : data.bans_added,
    completed : data.bans_completed,
    deleted : data.bans_deleted,
    dups : data.bans_dups,
    lurker_contention : data.bans_lurker_contention,
    lurker_obj_killed : data.bans_lurker_obj_killed,
    lurker_tested : data.bans_lurker_tested,
    lurker_tests_tested : data.bans_lurker_tests_tested,
    obj : data.bans_obj,
    obj_killed : data.bans_obj_killed,
    persisted_bytes : data.bans_persisted_bytes,
    persisted_fragmentation : data.bans_persisted_fragmentation,
    req : data.bans_req,
    tested : data.bans_tested,
    tests_tested : data.bans_tests_tested
  };


  result.busy = {
    sleep : data.busy_sleep,
    wakeup : data.busy_wakeup
  };

  result.cache = {
    hit : data.cache_hit,
    hitpass : data.cache_hitpass,
    miss : data.cache_miss
  };

  result.clientReq = {
    '400' : data.client_req_400,
    '411' : data.client_req_411,
    '413' : data.client_req_413,
    '417' : data.client_req_417,
    total : data.client_req
  };


  result.esi = {
    errors : data.esi_errors,
    warnings : data.esi_warnings
  };


  result.fetch = {
    head : data.fetch_head,
    len : data.fetch_length,
    chunked : data.fetch_chunked,
    eof : data.fetch_eof,
    bad : data.fetch_bad,
    close : data.fetch_close,
    oldhttp : data.fetch_oldhttp,
    zero : data.fetch_zero,
    '1xx' : data.fetch_1xx,
    '204' : data.fetch_204,
    '304' : data.fetch_304,
    failed : data.fetch_failed
  };

  result.hcb = {
    insert : data.hcb_insert,
    lock : data.hcb_lock,
    nolock : data.hcb_nolock
  };


  result.n = {
    object : data.n_object,
    vampireobject : data.n_vampireobject,
    objectcore : data.n_objectcore,
    objecthead : data.n_objecthead,
    waitinglist : data.n_waitinglist,
    backend : data.n_backend,
    expired : data.n_expired,
    gunzip : data.n_gunzip,
    gzip : data.n_gzip,
    lru_nuked : data.n_lru_nuked,
    lru_moved : data.n_lru_moved,
    vcl : data.n_vcl,
    vcl_avail : data.n_vcl_avail,
    vcl_discard : data.n_vcl_discard,
    obj_purged : data.n_obj_purged,
    purges : data.n_purges
  };

  result.s = {
    sess : data.s_sess,
    req : data.s_req,
    pipe : data.s_pipe,
    pass : data.s_pass,
    fetch : data.s_fetch,
    synth : data.s_synth,
    req_hdrbytes : data.s_req_hdrbytes,
    req_bodybytes : data.s_req_bodybytes,
    resp_hdrbytes : data.s_resp_hdrbytes,
    resp_bodybytes : data.s_resp_bodybytes,
    pipe_hdrbytes : data.s_pipe_hdrbytes,
    pipe_in : data.s_pipe_in,
    pipe_out : data.s_pipe_out
  };


  result.sess = {
    conn : data.sess_conn,
    drop : data.sess_drop,
    fail : data.sess_fail,
    pipe_overflow : data.sess_pipe_overflow,
    queued : data.sess_queued,
    dropped : data.sess_dropped,
    closed : data.sess_closed,
    pipeline : data.sess_pipeline,
    readahead : data.sess_readahead,
    herd : data.sess_herd
  };

  result.shm = {
    records : data.shm_records,
    writes : data.shm_writes,
    flushes : data.shm_flushes,
    cont : data.shm_cont,
    cycles : data.shm_cycles
  };


  result.sms = {
    balloc : data.sms_balloc,
    bfree : data.sms_bfree,
    nbytes : data.sms_nbytes,
    nobj : data.sms_nobj,
    nreq : data.sms_nreq
  };

  result.thread = {
    total : data.threads,
    limited : data.threads_limited,
    created : data.threads_created,
    destroyed : data.threads_destroyed,
    failed : data.threads_failed,
    queue_len : data.thread_queue_len
  };

  result.vsm = {
    cooling : data.vsm_cooling,
    free : data.vsm_free,
    overflow : data.vsm_overflow,
    overflowed : data.vsm_overflowed,
    used : data.vsm_used
  };


  ctx.set('Cache-Control', 'public, max-age=10');
  ctx.body = result;
}
