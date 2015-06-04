/*/component/sha1.js*/
var CryptoJS=CryptoJS||function(t,n){var i={},e=i.lib={},r=function(){},s=e.Base={extend:function(t){r.prototype=this;var n=new r;return t&&n.mixIn(t),n.hasOwnProperty("init")||(n.init=function(){n.$super.init.apply(this,arguments)}),n.init.prototype=n,n.$super=this,n},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var n in t)t.hasOwnProperty(n)&&(this[n]=t[n]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}},o=e.WordArray=s.extend({init:function(t,i){t=this.words=t||[],this.sigBytes=i!=n?i:4*t.length},toString:function(t){return(t||c).stringify(this)},concat:function(t){var n=this.words,i=t.words,e=this.sigBytes;if(t=t.sigBytes,this.clamp(),e%4)for(var r=0;t>r;r++)n[e+r>>>2]|=(i[r>>>2]>>>24-8*(r%4)&255)<<24-8*((e+r)%4);else if(65535<i.length)for(r=0;t>r;r+=4)n[e+r>>>2]=i[r>>>2];else n.push.apply(n,i);return this.sigBytes+=t,this},clamp:function(){var n=this.words,i=this.sigBytes;n[i>>>2]&=4294967295<<32-8*(i%4),n.length=t.ceil(i/4)},clone:function(){var t=s.clone.call(this);return t.words=this.words.slice(0),t},random:function(n){for(var i=[],e=0;n>e;e+=4)i.push(4294967296*t.random()|0);return new o.init(i,n)}}),a=i.enc={},c=a.Hex={stringify:function(t){var n=t.words;t=t.sigBytes;for(var i=[],e=0;t>e;e++){var r=n[e>>>2]>>>24-8*(e%4)&255;i.push((r>>>4).toString(16)),i.push((15&r).toString(16))}return i.join("")},parse:function(t){for(var n=t.length,i=[],e=0;n>e;e+=2)i[e>>>3]|=parseInt(t.substr(e,2),16)<<24-4*(e%8);return new o.init(i,n/2)}},h=a.Latin1={stringify:function(t){var n=t.words;t=t.sigBytes;for(var i=[],e=0;t>e;e++)i.push(String.fromCharCode(n[e>>>2]>>>24-8*(e%4)&255));return i.join("")},parse:function(t){for(var n=t.length,i=[],e=0;n>e;e++)i[e>>>2]|=(255&t.charCodeAt(e))<<24-8*(e%4);return new o.init(i,n)}},u=a.Utf8={stringify:function(t){try{return decodeURIComponent(escape(h.stringify(t)))}catch(n){throw Error("Malformed UTF-8 data")}},parse:function(t){return h.parse(unescape(encodeURIComponent(t)))}},f=e.BufferedBlockAlgorithm=s.extend({reset:function(){this._data=new o.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=u.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(n){var i=this._data,e=i.words,r=i.sigBytes,s=this.blockSize,a=r/(4*s),a=n?t.ceil(a):t.max((0|a)-this._minBufferSize,0);if(n=a*s,r=t.min(4*n,r),n){for(var c=0;n>c;c+=s)this._doProcessBlock(e,c);c=e.splice(0,n),i.sigBytes-=r}return new o.init(c,r)},clone:function(){var t=s.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0});e.Hasher=f.extend({cfg:s.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){f.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){return t&&this._append(t),this._doFinalize()},blockSize:16,_createHelper:function(t){return function(n,i){return new t.init(i).finalize(n)}},_createHmacHelper:function(t){return function(n,i){return new l.HMAC.init(t,i).finalize(n)}}});var l=i.algo={};return i}(Math);!function(){var t=CryptoJS,n=t.lib,i=n.WordArray,e=n.Hasher,r=[],n=t.algo.SHA1=e.extend({_doReset:function(){this._hash=new i.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(t,n){for(var i=this._hash.words,e=i[0],s=i[1],o=i[2],a=i[3],c=i[4],h=0;80>h;h++){if(16>h)r[h]=0|t[n+h];else{var u=r[h-3]^r[h-8]^r[h-14]^r[h-16];r[h]=u<<1|u>>>31}u=(e<<5|e>>>27)+c+r[h],u=20>h?u+((s&o|~s&a)+1518500249):40>h?u+((s^o^a)+1859775393):60>h?u+((s&o|s&a|o&a)-1894007588):u+((s^o^a)-899497514),c=a,a=o,o=s<<30|s>>>2,s=e,e=u}i[0]=i[0]+e|0,i[1]=i[1]+s|0,i[2]=i[2]+o|0,i[3]=i[3]+a|0,i[4]=i[4]+c|0},_doFinalize:function(){var t=this._data,n=t.words,i=8*this._nDataBytes,e=8*t.sigBytes;return n[e>>>5]|=128<<24-e%32,n[(e+64>>>9<<4)+14]=Math.floor(i/4294967296),n[(e+64>>>9<<4)+15]=i,t.sigBytes=4*n.length,this._process(),this._hash},clone:function(){var t=e.clone.call(this);return t._hash=this._hash.clone(),t}});t.SHA1=e._createHelper(n),t.HmacSHA1=e._createHmacHelper(n)}();
/*/service/const.js*/
!function(t){"use strict";var a=angular.module("jt.service.const",[]),n=angular.extend({app:"timtam"},CONFIG);a.constant("CONST",n)}(this);
/*/service/user.js*/
!function(t){"use strict";var n=angular.module("jt.service.user",[]);n.factory("user",["$rootScope","$http","$q","debug",function(t,n,r,e){function o(t){var r=n.post(a.url,t);return r.then(function(n){i=null,u(n,t.type)}),r}function u(n,r){s=n.data,s.deviation=_.now()-s.now,e("user:%j",s),angular.forEach(c,function(t){t.resolve(angular.copy(s))}),c.length=0,r&&t.$broadcast("user",r)}e=e("user");var i,s,c=[],a={url:"/user?cache=false",session:function(){var t=r.defer();return s?t.resolve(s):i?c.push(t):(this._getSession(),c.push(t)),t.promise},_getSession:function(){i=n.get(a.url),i.then(function(t){u(t)},function(t){angular.forEach(c,function(n){n.reject(t)}),c.length=0})},register:function(t,n){var r={type:"register",account:t,password:CryptoJS.SHA1(n).toString()};return o(r)},login:function(t,n){var r=CryptoJS.SHA1(n).toString();n=CryptoJS.SHA1(r+s.code).toString();var e={type:"login",account:t,password:n};return o(e)},logout:function(){var t=n["delete"](a.url);return t.then(function(t){i=null,u(t,"logout")}),t}};return a}])}(this);
/*/js/directive.js*/
!function(t){"use strict";function e(t){function e(t,e,i){function n(){e.removeClass("hidden");var i=e.outerWidth(),n=e.outerHeight();e.css({"margin-left":-i/2,"margin-top":-n/2}),t.modal&&(o=angular.element('<div class="mask"></div>'),e.after(o)),e.find("input:first").focus()}var o;t.$watch("status",function(t){"hidden"===t?e.addClass("hidden"):n()}),t.destroy=function(){e.remove(),o&&o.remove(),t.$destroy()},e.on("click",".destroy",function(){t.destroy()}),e.on("keyup",function(e){13===e.keyCode&&t.submit&&t.submit()})}return{restrict:"E",link:e}}var i=angular.module("jt.directive.widget",[]);i.directive("jtDialog",e),e.$inject=["$compile"]}(this);
/*/js/global.js*/
!function(e){"use strict";function n(e){return function(){return{request:function(n){return n.url=e+n.url,n}}}}function t(e,n,t){return function(r,o){if("development"===t.env)alert(r.message),e.error.apply(e,arguments);else{var i=n.get("$http");i.post("/exception?httplog=false",{message:r.message,stack:r.stack,cause:o})}}}function r(e,n,t,r,o){TIMING.end("js"),o=o("app.run");var i=function(){var n=angular.extend({timeline:TIMING.getLogs(),screen:{width:t.screen.width,height:t.screen.height,innerHeight:t.innerHeight,innerWidth:t.innerWidth}},t.performance);e.post("/statistics",n)};if(t.onload=function(){i()},"development"===r.env){var s=1e4,u=function(){var e=0,t=function(n){if(n.data().hasOwnProperty("$scope")){var r=n.data().$scope.$$watchers;r&&(e+=r.length)}angular.forEach(n.children(),function(e){t(angular.element(e))})};t(angular.element(document.body)),o("watcher total:"+e),n(function(){u()},s)};n(function(){u()},u)}}function o(e,n,t,r,o){function i(n){var o=angular.element(angular.element("#loginDialog").html()),i=e.$new(!0);angular.extend(i,{status:"show",type:n,modal:!0}),t(o)(i),r.append(o),i.submit=function(){c(i)},angular.forEach(["account","password"],function(e){i.$watch(e,function(){i.error=""})})}function s(){i("login")}function u(){i("register")}function a(){o.logout()}function c(e){if(!e.account||!e.password)return void(e.error="账号和密码均不能为空");e.submiting=!0,e.msg="正在提交，请稍候...";var n=o[e.type];n&&n(e.account,e.password).success(function(){e.destroy()}).error(function(n){e.error=n.msg||n.error||"未知异常",e.submiting=!1,e.msg=""})}function l(){f.session.status="loading",o.session().then(function(e){angular.extend(f.session,e),f.session.status="success"},function(e){f.session.error=e,f.session.status="fail"})}var f=this;f.login=s,f.logout=a,f.register=u,f.session={},e.$on("user",function(e,n){l()})}var i=["LocalStorageModule","jt.service.const","jt.service.debug","jt.service.httpLog","jt.service.user","jt.directive.widget"],s=angular.module("jtApp",i);s.addRequires=function(e){angular.isArray(e)||(e=[e]);var n=s.requires;return angular.forEach(e,function(e){~n.indexOf(e)||n.push(e)}),this},s.config(["localStorageServiceProvider",function(e){e.prefix="jt"}]).config(["$httpProvider","CONST",function(e,t){e.defaults.headers.common["X-Requested-With"]="XMLHttpRequest";var r=t.appUrlPrefix;if(r){var o=n(r);e.interceptors.push(o)}e.interceptors.push("httpLog")}]).config(["$provide",function(e){var n=["$log","$injector","CONST",t];e.decorator("$exceptionHandler",n)}]),s.run(["$http","$timeout","$window","CONST","debug",r]),s.controller("AppController",o),o.$inject=["$scope","$http","$compile","$element","user"]}(this);
/*/js/backend.js*/
!function(e){"use strict";var t=angular.module("jt.service.backend",[]);t.factory("backendService",["$http",function(e){function t(){var e="name category ip port".split(" "),t=o.config,n=!1;return angular.forEach(e,function(e){t[e]||(n=!0)}),n}function n(){if(t())return o.status="error",void(o.error="the field can not be empty.");var n=e.post("/backend",o.config);return o.status="submiting",o.op="save",n.then(function(e){o.status="success"},function(e){o.status="error"}),n}function r(t){var n=e["delete"]("/backend"+t);return o.op="remove",n.then(function(){o.status="success"},function(e){o.status="error"}),n}var o={statu:"",op:"",config:{}},c={init:function(){return o},save:n,remove:r};return c}]);var n=function(e,t,n,r){var o=this;return o.mode="view",o.backend=r.init(),o.save=function(){r.save().then(function(){setTimeout(function(){location.reload()},3e3)})},o.remove=function(e,t){r.remove(e).then(function(){angular.element(t.target).closest("tr").remove()})},e.$watch("backendPage.backend.config",function(){o.backend.status=""},!0),o};n.$inject=["$scope","$http","debug","backendService"],angular.module("jtApp").addRequires("jt.service.backend").controller("BackendPageController",n)}(this);