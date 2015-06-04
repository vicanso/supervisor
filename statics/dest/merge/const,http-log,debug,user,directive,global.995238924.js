/*/service/const.js*/
!function(t){"use strict";var a=angular.module("jt.service.const",[]),n=angular.extend({app:"timtam"},CONFIG);a.constant("CONST",n)}(this);
/*/service/http-log.js*/
!function(){"use strict";var e=angular.module("jt.service.httpLog",["LocalStorageModule"]),t=Date.now||function(){return(new Date).getTime()};e.factory("httpLog",["$q","$injector","CONST","localStorageService",function(e,r,n,o){function u(e){return e===f||-1!=e.indexOf("httplog=false")?!0:!1}function s(e,t){var r=e("JT-Deprecate");r&&"development"===n.env&&alert("url:"+t+"is deprecate, "+r)}function c(){o.set("httpLog",i)}function a(){var e=r.get("$http");(h.length||l.length)&&e.post(f,i).success(function(e){h.length=0,l.length=0,c(),setTimeout(a,g)}).error(function(e){setTimeout(a,g)})}var i=o.get("httpLog")||{success:[],error:[]},h=i.success,l=i.error,g=12e4,f="/httplog";h.length+l.length>10?setTimeout(a,1):setTimeout(a,g);var p={request:function(e){return e._createdAt=t(),e},response:function(e){var r=e.config,n=r.url;if(s(e.headers,n),u(n))return e;var o=t()-r._createdAt;return h.push({url:n,method:r.method,use:o}),c(),e},requestError:function(t){return e.reject(t)},responseError:function(r){var n=r.config,o=n.url;return s(r.headers,o),u(o)?e.reject(r):(l.push({url:o,method:n.method,status:r.status,use:t()-n._createdAt}),c(),e.reject(r))}};return p}])}(this);
/*/service/debug.js*/
!function(n){"use strict";function e(){}function t(n){var t=window.debug;if(t){var r=n.pattern;return r?t.enable(r):t.disable(),t}return function(){return e}}var r=angular.module("jt.service.debug",[]);t.$inject=["CONST"],r.factory("debug",t)}(this);
/*/service/user.js*/
!function(t){"use strict";var n=angular.module("jt.service.user",[]);n.factory("user",["$rootScope","$http","$q","debug",function(t,n,r,e){function o(t){var r=n.post(a.url,t);return r.then(function(n){i=null,u(n,t.type)}),r}function u(n,r){s=n.data,s.deviation=_.now()-s.now,e("user:%j",s),angular.forEach(c,function(t){t.resolve(angular.copy(s))}),c.length=0,r&&t.$broadcast("user",r)}e=e("user");var i,s,c=[],a={url:"/user?cache=false",session:function(){var t=r.defer();return s?t.resolve(s):i?c.push(t):(this._getSession(),c.push(t)),t.promise},_getSession:function(){i=n.get(a.url),i.then(function(t){u(t)},function(t){angular.forEach(c,function(n){n.reject(t)}),c.length=0})},register:function(t,n){var r={type:"register",account:t,password:CryptoJS.SHA1(n).toString()};return o(r)},login:function(t,n){var r=CryptoJS.SHA1(n).toString();n=CryptoJS.SHA1(r+s.code).toString();var e={type:"login",account:t,password:n};return o(e)},logout:function(){var t=n["delete"](a.url);return t.then(function(t){i=null,u(t,"logout")}),t}};return a}])}(this);
/*/js/directive.js*/
!function(t){"use strict";function e(t){function e(t,e,i){function n(){e.removeClass("hidden");var i=e.outerWidth(),n=e.outerHeight();e.css({"margin-left":-i/2,"margin-top":-n/2}),t.modal&&(o=angular.element('<div class="mask"></div>'),e.after(o)),e.find("input:first").focus()}var o;t.$watch("status",function(t){"hidden"===t?e.addClass("hidden"):n()}),t.destroy=function(){e.remove(),o&&o.remove(),t.$destroy()},e.on("click",".destroy",function(){t.destroy()}),e.on("keyup",function(e){13===e.keyCode&&t.submit&&t.submit()})}return{restrict:"E",link:e}}var i=angular.module("jt.directive.widget",[]);i.directive("jtDialog",e),e.$inject=["$compile"]}(this);
/*/js/global.js*/
!function(e){"use strict";function n(e){return function(){return{request:function(n){return n.url=e+n.url,n}}}}function t(e,n,t){return function(r,o){if("development"===t.env)alert(r.message),e.error.apply(e,arguments);else{var i=n.get("$http");i.post("/exception?httplog=false",{message:r.message,stack:r.stack,cause:o})}}}function r(e,n,t,r,o){TIMING.end("js"),o=o("app.run");var i=function(){var n=angular.extend({timeline:TIMING.getLogs(),screen:{width:t.screen.width,height:t.screen.height,innerHeight:t.innerHeight,innerWidth:t.innerWidth}},t.performance);e.post("/statistics",n)};if(t.onload=function(){i()},"development"===r.env){var s=1e4,u=function(){var e=0,t=function(n){if(n.data().hasOwnProperty("$scope")){var r=n.data().$scope.$$watchers;r&&(e+=r.length)}angular.forEach(n.children(),function(e){t(angular.element(e))})};t(angular.element(document.body)),o("watcher total:"+e),n(function(){u()},s)};n(function(){u()},u)}}function o(e,n,t,r,o){function i(n){var o=angular.element(angular.element("#loginDialog").html()),i=e.$new(!0);angular.extend(i,{status:"show",type:n,modal:!0}),t(o)(i),r.append(o),i.submit=function(){c(i)},angular.forEach(["account","password"],function(e){i.$watch(e,function(){i.error=""})})}function s(){i("login")}function u(){i("register")}function a(){o.logout()}function c(e){if(!e.account||!e.password)return void(e.error="账号和密码均不能为空");e.submiting=!0,e.msg="正在提交，请稍候...";var n=o[e.type];n&&n(e.account,e.password).success(function(){e.destroy()}).error(function(n){e.error=n.msg||n.error||"未知异常",e.submiting=!1,e.msg=""})}function l(){f.session.status="loading",o.session().then(function(e){angular.extend(f.session,e),f.session.status="success"},function(e){f.session.error=e,f.session.status="fail"})}var f=this;f.login=s,f.logout=a,f.register=u,f.session={},e.$on("user",function(e,n){l()})}var i=["LocalStorageModule","jt.service.const","jt.service.debug","jt.service.httpLog","jt.service.user","jt.directive.widget"],s=angular.module("jtApp",i);s.addRequires=function(e){angular.isArray(e)||(e=[e]);var n=s.requires;return angular.forEach(e,function(e){~n.indexOf(e)||n.push(e)}),this},s.config(["localStorageServiceProvider",function(e){e.prefix="jt"}]).config(["$httpProvider","CONST",function(e,t){e.defaults.headers.common["X-Requested-With"]="XMLHttpRequest";var r=t.appUrlPrefix;if(r){var o=n(r);e.interceptors.push(o)}e.interceptors.push("httpLog")}]).config(["$provide",function(e){var n=["$log","$injector","CONST",t];e.decorator("$exceptionHandler",n)}]),s.run(["$http","$timeout","$window","CONST","debug",r]),s.controller("AppController",o),o.$inject=["$scope","$http","$compile","$element","user"]}(this);