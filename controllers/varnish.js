'use strict';
const consul = localRequire('services/consul');
const request = require('superagent');
const util = require('util');
const parallel = require('co-parallel');
const _ = require('lodash');
const Joi = require('joi');
const errors = localRequire('errors');
const debug = localRequire('helpers/debug');
const httpRequest = localRequire('helpers/http-request');

exports.view = view;
exports.stats = stats;

/**
 * [view description]
 * @return {[type]} [description]
 */
function* view() {
  /*jshint validthis:true */
  let ctx = this;
  let varnishList;
  let error;
  try {
    varnishList = yield consul.varnishServices();
  } catch (err) {
    error = err;
    console.error(err);
  }
  debug('varnish list:%j', varnishList);
  ctx.set('Cache-Control', 'public, max-age=60');
  ctx.state.viewData = {
    page: 'varnish',
    varnishList: varnishList,
    error: error
  };
}


/**
 * [stats description]
 * @return {[type]} [description]
 */
function* stats() {
  /*jshint validthis:true */
  let ctx = this;
  let schema = {
    ip: Joi.string().ip({
      version: ['ipv4', 'ipv6']
    }),
    port: Joi.number().integer()
  };
  let params = Joi.validateThrow(ctx.params, schema);
  debug('get varnish stats, params:%j', params);
  let url = util.format('http://%s:%s/v-stats', params.ip, params.port);
  let res = yield httpRequest.get(url);
  let statsData = _.get(res, 'body');
  if (!statsData) {
    throw errors.get('Can not get varnish stats!');
  }
  let result = convertStatsData(statsData);
  ctx.set('Cache-Control', 'public, max-age=10');
  ctx.body = result;
}

/**
 * [convertStatsData description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function convertStatsData(data) {
  let result = {
    uptime: data.uptime,
    others: {
      losthdr: data.losthdr,
      pool: data.pools,
      vmods: data.vmods
    }
  };

  // backend相关信息
  result.backend = {
    conn: data.backend_conn,
    unhealthy: data.backend_unhealthy,
    busy: data.backend_busy,
    fail: data.backend_fail,
    reuse: data.backend_reuse,
    toolate: data.backend_toolate,
    recycle: data.backend_recycle,
    retry: data.backend_retry,
    req: data.backend_req
  };

  // bans相关信息
  result.bans = {
    total: data.bans,
    added: data.bans_added,
    completed: data.bans_completed,
    deleted: data.bans_deleted,
    dups: data.bans_dups,
    lurker_contention: data.bans_lurker_contention,
    lurker_obj_killed: data.bans_lurker_obj_killed,
    lurker_tested: data.bans_lurker_tested,
    lurker_tests_tested: data.bans_lurker_tests_tested,
    obj: data.bans_obj,
    obj_killed: data.bans_obj_killed,
    persisted_kbytes: Math.ceil(data.bans_persisted_bytes / 1024),
    persisted_fragmentation: data.bans_persisted_fragmentation,
    req: data.bans_req,
    tested: data.bans_tested,
    tests_tested: data.bans_tests_tested
  };


  result.busy = {
    sleep: data.busy_sleep,
    wakeup: data.busy_wakeup
  };

  result.cache = {
    hit: data.cache_hit,
    hitpass: data.cache_hitpass,
    miss: data.cache_miss
  };

  result.clientReq = {
    '400': data.client_req_400,
    '411': data.client_req_411,
    '413': data.client_req_413,
    '417': data.client_req_417,
    total: data.client_req
  };


  result.esi = {
    errors: data.esi_errors,
    warnings: data.esi_warnings
  };


  result.fetch = {
    head: data.fetch_head,
    len: data.fetch_length,
    chunked: data.fetch_chunked,
    eof: data.fetch_eof,
    bad: data.fetch_bad,
    close: data.fetch_close,
    oldhttp: data.fetch_oldhttp,
    zero: data.fetch_zero,
    '1xx': data.fetch_1xx,
    '204': data.fetch_204,
    '304': data.fetch_304,
    failed: data.fetch_failed
  };

  result.hcb = {
    insert: data.hcb_insert,
    lock: data.hcb_lock,
    nolock: data.hcb_nolock
  };


  result.n = {
    object: data.n_object,
    vampireobject: data.n_vampireobject,
    objectcore: data.n_objectcore,
    objecthead: data.n_objecthead,
    waitinglist: data.n_waitinglist,
    backend: data.n_backend,
    expired: data.n_expired,
    gunzip: data.n_gunzip,
    gzip: data.n_gzip,
    lru_nuked: data.n_lru_nuked,
    lru_moved: data.n_lru_moved,
    vcl: data.n_vcl,
    vcl_avail: data.n_vcl_avail,
    vcl_discard: data.n_vcl_discard,
    obj_purged: data.n_obj_purged,
    purges: data.n_purges
  };

  result.s = {
    sess: data.s_sess,
    req: data.s_req,
    pipe: data.s_pipe,
    pass: data.s_pass,
    fetch: data.s_fetch,
    synth: data.s_synth,
    req_hdrkbytes: Math.ceil(data.s_req_hdrbytes, 1024),
    req_bodykbytes: Math.ceil(data.s_req_bodybytes, 1024),
    resp_hdrkbytes: Math.ceil(data.s_resp_hdrbytes, 1024),
    resp_bodykbytes: Math.ceil(data.s_resp_bodybytes, 1024),
    pipe_hdrkbytes: Math.ceil(data.s_pipe_hdrbytes, 1024),
    pipe_in: data.s_pipe_in,
    pipe_out: data.s_pipe_out
  };


  result.sess = {
    conn: data.sess_conn,
    drop: data.sess_drop,
    fail: data.sess_fail,
    pipe_overflow: data.sess_pipe_overflow,
    queued: data.sess_queued,
    dropped: data.sess_dropped,
    closed: data.sess_closed,
    pipeline: data.sess_pipeline,
    readahead: data.sess_readahead,
    herd: data.sess_herd
  };

  result.shm = {
    records: data.shm_records,
    writes: data.shm_writes,
    flushes: data.shm_flushes,
    cont: data.shm_cont,
    cycles: data.shm_cycles
  };


  result.sms = {
    balloc: data.sms_balloc,
    bfree: data.sms_bfree,
    nbytes: data.sms_nbytes,
    nobj: data.sms_nobj,
    nreq: data.sms_nreq
  };

  result.thread = {
    total: data.threads,
    limited: data.threads_limited,
    created: data.threads_created,
    destroyed: data.threads_destroyed,
    failed: data.threads_failed,
    queue_len: data.thread_queue_len
  };

  result.vsm = {
    cooling: data.vsm_cooling,
    free: data.vsm_free,
    overflow: data.vsm_overflow,
    overflowed: data.vsm_overflowed,
    used: data.vsm_used
  };
  return result;
}



// var statsData = {"createdAt":1439972924196,"uptime":19333,"sess_conn":0,"sess_drop":0,"sess_fail":0,"sess_pipe_overflow":0,"client_req_400":0,"client_req_411":0,"client_req_413":0,"client_req_417":0,"client_req":0,"cache_hit":0,"cache_hitpass":0,"cache_miss":0,"backend_conn":1,"backend_unhealthy":0,"backend_busy":0,"backend_fail":0,"backend_reuse":0,"backend_toolate":0,"backend_recycle":0,"backend_retry":0,"fetch_head":0,"fetch_length":0,"fetch_chunked":0,"fetch_eof":0,"fetch_bad":0,"fetch_close":0,"fetch_oldhttp":0,"fetch_zero":0,"fetch_1xx":0,"fetch_204":0,"fetch_304":0,"fetch_failed":0,"pools":2,"threads":200,"threads_limited":0,"threads_created":200,"threads_destroyed":0,"threads_failed":0,"thread_queue_len":0,"busy_sleep":0,"busy_wakeup":0,"sess_queued":0,"sess_dropped":0,"n_object":0,"n_vampireobject":0,"n_objectcore":0,"n_objecthead":0,"n_waitinglist":0,"n_backend":3,"n_expired":0,"n_lru_nuked":0,"n_lru_moved":0,"losthdr":0,"s_sess":0,"s_req":0,"s_pipe":0,"s_pass":0,"s_fetch":0,"s_synth":0,"s_req_hdrbytes":0,"s_req_bodybytes":0,"s_resp_hdrbytes":0,"s_resp_bodybytes":0,"s_pipe_hdrbytes":0,"s_pipe_in":0,"s_pipe_out":0,"sess_closed":0,"sess_pipeline":0,"sess_readahead":0,"sess_herd":0,"shm_records":18320,"shm_writes":18320,"shm_flushes":0,"shm_cont":0,"shm_cycles":0,"sms_nreq":0,"sms_nobj":0,"sms_nbytes":0,"sms_balloc":0,"sms_bfree":0,"backend_req":1,"n_vcl":2,"n_vcl_avail":2,"n_vcl_discard":0,"bans":1,"bans_completed":1,"bans_obj":0,"bans_req":0,"bans_added":1,"bans_deleted":0,"bans_tested":0,"bans_obj_killed":0,"bans_lurker_tested":0,"bans_tests_tested":0,"bans_lurker_tests_tested":0,"bans_lurker_obj_killed":0,"bans_dups":0,"bans_lurker_contention":0,"bans_persisted_bytes":13,"bans_persisted_fragmentation":0,"n_purges":0,"n_obj_purged":0,"exp_mailed":0,"exp_received":0,"hcb_nolock":0,"hcb_lock":0,"hcb_insert":0,"esi_errors":0,"esi_warnings":0,"vmods":2,"n_gzip":0,"n_gunzip":0,"vsm_free":972032,"vsm_used":83962576,"vsm_cooling":0,"vsm_overflow":0,"vsm_overflowed":0};
