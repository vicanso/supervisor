;(function(global){
'use strict';

angular.module('jtApp').factory('varnishService', ['$http', '$q', 'debug', function($http, $q, debug){
  debug = debug('jt.varnishPage');
  var varnishService = {
    backends : backends,
    vcl : vcl,
    stats : stats,
    statsList : statsList,
    quotaList : quotaList
  };
  return varnishService;

  /**
   * [backends 获取服务器列表]
   * @param  {[type]} ip   [description]
   * @param  {[type]} port [description]
   * @return {[type]}      [description]
   */
  function backends(ip, port){
    var url = '/varnish/backends/' + ip + '/' + port;
    debug('get backend form:%s', url);
    var promise = $http.get(url);
    return promise;
  }

  /**
   * [vcl 获取varnish配置]
   * @param  {[type]} ip   [description]
   * @param  {[type]} port [description]
   * @return {[type]}      [description]
   */
  function vcl(ip, port){
    var url = '/varnish/vcl/' + ip + '/' + port;
    debug('get vcl form:%s', url);
    var promise = $http.get(url);
    return promise;
  }

  /**
   * [stats 获取varnish的统计状态]
   * @param  {[type]} ip   [description]
   * @param  {[type]} port [description]
   * @return {[type]}      [description]
   */
  function stats(ip, port){
    var url = '/varnish/stats/' + ip + '/' + port;
    debug('get stats form:%s', url);
    var promise = $http.get(url);
    promise.then(function(res){
      var data = res.data;
      var descDict = statsDescDict();
      var items = [];
      var result = {
        createdAt : data.createdAt
      };
      delete data.createdAt;
      angular.forEach(data, function(v, k){
        var desc = descDict[k];
        items.push({
          name : k,
          v : v,
          desc : desc
        });
      });
      result.items = items;
      res.data = result;
    });
    return promise;
  }

  /**
   * [statsList description]
   * @param  {[type]} list [description]
   * @return {[type]}      [description]
   */
  function statsList(list){
    var promiseList = [];
    var fn = function(ip, port){
      var url = '/varnish/stats/' + ip + '/' + port;
      debug('get stats form:%s', url);
      return $http.get(url);
    };
    angular.forEach(list, function(tmp){
      promiseList.push(fn(tmp.ip, tmp.port));
    });
    return $q.all(promiseList);
  }

  function quotaList(){
    var dict = statsDescDict();
    var arr = [];
    angular.forEach(dict, function(desc, k){
      arr.push(k);
    });
    return arr;
  }

  /**
   * [statsDescDict description]
   * @return {[type]} [description]
   */
  function statsDescDict(){
    return {
      uptime: 'Child process uptime',
      sess_conn: 'Sessions accepted',
      sess_drop: 'Sessions dropped',
      sess_fail: 'Session accept failures',
      sess_pipe_overflow: 'Session pipe overflow',
      client_req_400: 'Client requests received, subject to 400 errors',
      client_req_411: 'Client requests received, subject to 411 errors',
      client_req_413: 'Client requests received, subject to 413 errors',
      client_req_417: 'Client requests received, subject to 417 errors',
      client_req: 'Good client requests received',
      cache_hit: 'Cache hits',
      cache_hitpass: 'Cache hits for pass',
      cache_miss: 'Cache misses',
      backend_conn: 'Backend conn. success',
      backend_unhealthy: 'Backend conn. not attempted',
      backend_busy: 'Backend conn. too many',
      backend_fail: 'Backend conn. failures',
      backend_reuse: 'Backend conn. reuses',
      backend_toolate: 'Backend conn. was closed',
      backend_recycle: 'Backend conn. recycles',
      backend_retry: 'Backend conn. retry',
      fetch_head: 'Fetch no body (HEAD)',
      fetch_length: 'Fetch with Length',
      fetch_chunked: 'Fetch chunked',
      fetch_eof: 'Fetch EOF',
      fetch_bad: 'Fetch bad T-E',
      fetch_close: 'Fetch wanted close',
      fetch_oldhttp: 'Fetch pre HTTP/1.1 closed',
      fetch_zero: 'Fetch zero len body',
      fetch_1xx: 'Fetch no body (1xx)',
      fetch_204: 'Fetch no body (204)',
      fetch_304: 'Fetch no body (304)',
      fetch_failed: 'Fetch failed (all causes)',
      fetch_no_thread: 'Fetch failed (no thread)',
      pools: 'Number of thread pools',
      threads: 'Total number of threads',
      threads_limited: 'Threads hit max',
      threads_created: 'Threads created',
      threads_destroyed: 'Threads destroyed',
      threads_failed: 'Thread creation failed',
      thread_queue_len: 'Length of session queue',
      busy_sleep: 'Number of requests sent to sleep on busy objhdr',
      busy_wakeup: 'Number of requests woken after sleep on busy objhdr',
      sess_queued: 'Sessions queued for thread',
      sess_dropped: 'Sessions dropped for thread',
      n_object: 'object structs made',
      n_vampireobject: 'unresurrected objects',
      n_objectcore: 'objectcore structs made',
      n_objecthead: 'objecthead structs made',
      n_waitinglist: 'waitinglist structs made',
      n_backend: 'Number of backends',
      n_expired: 'Number of expired objects',
      n_lru_nuked: 'Number of LRU nuked objects',
      n_lru_moved: 'Number of LRU moved objects',
      losthdr: 'HTTP header overflows',
      s_sess: 'Total sessions seen',
      s_req: 'Total requests seen',
      s_pipe: 'Total pipe sessions seen',
      s_pass: 'Total pass-ed requests seen',
      s_fetch: 'Total backend fetches initiated',
      s_synth: 'Total synthethic responses made',
      s_req_hdrbytes: 'Request header bytes',
      s_req_bodybytes: 'Request body bytes',
      s_resp_hdrbytes: 'Response header bytes',
      s_resp_bodybytes: 'Response body bytes',
      s_pipe_hdrbytes: 'Pipe request header bytes',
      s_pipe_in: 'Piped bytes from client',
      s_pipe_out: 'Piped bytes to client',
      sess_closed: 'Session Closed',
      sess_pipeline: 'Session Pipeline',
      sess_readahead: 'Session Read Ahead',
      sess_herd: 'Session herd',
      shm_records: 'SHM records',
      shm_writes: 'SHM writes',
      shm_flushes: 'SHM flushes due to overflow',
      shm_cont: 'SHM MTX contention',
      shm_cycles: 'SHM cycles through buffer',
      sms_nreq: 'SMS allocator requests',
      sms_nobj: 'SMS outstanding allocations',
      sms_nbytes: 'SMS outstanding bytes',
      sms_balloc: 'SMS bytes allocated',
      sms_bfree: 'SMS bytes freed',
      backend_req: 'Backend requests made',
      n_vcl: 'Number of loaded VCLs in total',
      n_vcl_avail: 'Number of VCLs available',
      n_vcl_discard: 'Number of discarded VCLs',
      bans: 'Count of bans',
      bans_completed: 'Number of bans marked \'completed\'',
      bans_obj: 'Number of bans using obj.*',
      bans_req: 'Number of bans using req.*',
      bans_added: 'Bans added',
      bans_deleted: 'Bans deleted',
      bans_tested: 'Bans tested against objects (lookup)',
      bans_obj_killed: 'Objects killed by bans (lookup)',
      bans_lurker_tested: 'Bans tested against objects (lurker)',
      bans_tests_tested: 'Ban tests tested against objects (lookup)',
      bans_lurker_tests_tested: 'Ban tests tested against objects (lurker)',
      bans_lurker_obj_killed: 'Objects killed by bans (lurker)',
      bans_dups: 'Bans superseded by other bans',
      bans_lurker_contention: 'Lurker gave way for lookup',
      bans_persisted_bytes: 'Bytes used by the persisted ban lists',
      bans_persisted_fragmentation: 'Extra bytes in persisted ban lists due to fragmentation',
      n_purges: 'Number of purge operations executed',
      n_obj_purged: 'Number of purged objects',
      exp_mailed: 'Number of objects mailed to expiry thread',
      exp_received: 'Number of objects received by expiry thread',
      hcb_nolock: 'HCB Lookups without lock',
      hcb_lock: 'HCB Lookups with lock',
      hcb_insert: 'HCB Inserts',
      esi_errors: 'ESI parse errors (unlock)',
      esi_warnings: 'ESI parse warnings (unlock)',
      vmods: 'Loaded VMODs',
      n_gzip: 'Gzip operations',
      n_gunzip: 'Gunzip operations',
      vsm_free: 'Free VSM space',
      vsm_used: 'Used VSM space',
      vsm_cooling: 'Cooling VSM space',
      vsm_overflow: 'Overflow VSM space',
      vsm_overflowed: 'Overflowed VSM space'
    };
  }

}]);

})(this);