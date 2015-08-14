'use strict';
module.exports = {
  schema : {
    account : {
      type : String,
      required : true,
      unique : true
    },
    password : {
      type : String,
      required : true
    },
    name : {
      type : String,
      required : true,
      unique : true
    },
    createdAt : {
      type : Number,
      required : true
    },
    lastLoginedAt : {
      type : Number,
      required : true
    },
    loginTimes : {
      type : Number,
      'default' : 0
    }
  },
  // 索引数组
  indexes : [
    {
      account : 1
    },
    {
      account : 1,
      lastLoginedAt : 1
    }
  ],
  pre : {
    validate : function(next) {
      let now = Date.now();
      if (!this.createdAt) {
        this.createdAt = now;
        this.lastLoginedAt = now;
      }
      next();
    }
  }
  // 定义在mongodb中collection的名字
  // name : 'xxx'
};
