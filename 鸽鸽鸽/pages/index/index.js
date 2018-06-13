//index.js
//this is a index page for a simulation project.
const app = getApp();
const promise = require('../../promise');
Page({
  onPullDownRefresh: function () {
    this.onLoad();
    //console.log('?');
    wx.stopPullDownRefresh()
  },
  data: {
    userlatitude: 0,
    userlongitude: 0,
    userteams: [],
    newtime: [],
    trueuserteams: [],
    motto: '欢迎来到养鸽场 ',
    userInfo: {id:1},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    reputation: 0
  },
  //A function to bind view tap.
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  distance: function (la1, lo1, la2, lo2) {
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;//地球半径
    s = Math.round(s * 10000) / 10000;
    console.log("计算结果", s);
    return s
  },
  dosomething: function () {
    var that = this;
    if (app.globalData.userInfo.id!=undefined){
    wx.request({
      url: 'https://gi4gya0w.qcloud.la/userInfo/getactivity/' + app.globalData.userInfo.id,
      method: 'GET',
      fail:res=>{

      },
      success: function (res) {
        console.log(res);
        if (res.data =="undefined"){
          that.setData({
            userteams: 0,
            //userInfo: app.globalData.userInfo,
          });
        }
        else if (res.data != "no activity") {
          that.setData({
            userteams: res.data,
            userInfo: app.globalData.userInfo,
          });
        }
        else{
          that.setData({
            userInfo: app.globalData.userInfo,
          })
        }
        if(that.data.userteams==0){

        }
        //var those = that;
        else{
        wx.getLocation({
          success: res => {
            console.log(res.latitude);
            console.log(res.longitude);
            that.setData({
              userlatitude: res.latitude,
              userlongitude: res.longitude,
            })
            console.log(that.data.userlongitude);
            var i = 0;
            var m = that.data.userteams;
            if (that.data.userlongitude != 0) {
              for (i = 0; i < that.data.userteams.length; i++) {
                m[i].distance = that.distance(that.data.userteams[i].latitude, that.data.userteams[i].longitude, that.data.userlatitude, that.data.userlongitude)
              }
            }
            console.log(m);
            if(app.globalData.userInfo.song===1){
              wx.showModal({
                title: '你又鸽了',
                content: '下次不能再这样了哦',
                success: function (res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
              app.globalData.userInfo.song=0;
              const innerAudioContext = wx.createInnerAudioContext()
              innerAudioContext.autoplay = true
              innerAudioContext.src = 'http://dl.stream.qqmusic.qq.com/C400004fWIZu1UpjjY.m4a?vkey=89872E886311F5E88BBE581492BF71B8CF25AC1876A72BFC8261FC927AB7A4D05CD036AF2D90D14247F53F4A4B70B1F507E1186D837F760B&guid=3291669240&uin=649769655&fromtag=66'
              innerAudioContext.startTime = 10
              innerAudioContext.onPlay(() => {
                console.log('开始播放')
              })
              innerAudioContext.onError((res) => {
                console.log(res.errMsg)
                console.log(res.errCode)
              })
              wx.request({
                url:'https://gi4gya0w.qcloud.la/userInfo/updatesong/'+ app.globalData.userInfo.id,
                success:res=>{
                  console.log('ok.');
                },
              })
            }
            that.setData({
              userteams: m,
            })
            that.gettime();
          }
        })
        }
      },
    })
    }
    else{
      this.onLoad();
    }
  },
  onLoad: function () {
    
    wx.showLoading({
      title: '咕咕咕',
      mask:true,
    })
    console.log(app.globalData.userInfo.openid);
    if(app.globalData.userInfo.openid===undefined){
    setTimeout(this.dosomething, 500);
    setTimeout(function(){wx.hideLoading()},8000);}
    else{
      setTimeout(this.dosomething, 1000);
      setTimeout(function () { wx.hideLoading() }, 5000);
    }
  },
  onReady: function () {
  },
  gettime: function () {
    var x = this.data.userteams;
    var remain = [];
    var i = 0;
    for (i = 0; i < x.length; i++) {
      var d2 = new Date();
      var d3 = x[i].time;
      var d1 = d3.replace(/-/g, "/");
      //console.log(d1);
      remain[i] = new Date(d1).getTime() - d2.getTime();
      var result = remain[i];
      x[i].remainD = Math.floor(result / (24 * 3600000));
      result = result % (24 * 3600000);
      x[i].remainH = Math.floor(result / (3600 * 1000));
      result = result % (3600 * 1000);
      x[i].remainM = Math.floor(result / (60 * 1000));
    }
    var newtime = [];
    for (var i = 0; i < x.length; i++) {
      if (remain[i] > 0) {
        newtime.push(remain[i]);
      }
    }
    console.log(remain);
    var that = this;
    wx.request({
      url: 'https://gi4gya0w.qcloud.la/userInfo/checkteams/' + that.data.userInfo.id,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      data: {
        times: remain,
      },
      success: (res) => {
        wx.request({
          url: 'https://gi4gya0w.qcloud.la/userInfo/getcurrent/' + that.data.userInfo.id,
          success: (res) => {
            if(res.data!='no activity'){
            that.setData({
              trueuserteams: res.data,
            })}
            else{
            }
            //console.log(that.data.trueuserteams);
            //var x = that.data.userteams;
            var m = that.data.trueuserteams;
            console.log('m is ', m)
            if (that.data.userlongitude != 0) {
              for (i = 0; i < that.data.trueuserteams.length; i++) {
                m[i].distance = that.distance(that.data.trueuserteams[i].latitude, that.data.trueuserteams[i].longitude, that.data.userlatitude, that.data.userlongitude)
              }
            }
            for (i = 0; i < m.length; i++) {
              var d2 = new Date();
              var d3 = m[i].time;
              var d1 = d3.replace(/-/g, "/");
              remain[i] = new Date(d1).getTime() - d2.getTime();
              var result = remain[i];
              console.log('xixixi', result);
              m[i].remainD = Math.floor(result / (24 * 3600000));
              result = result % (24 * 3600000);
              m[i].remainH = Math.floor(result / (3600 * 1000));
              result = result % (3600 * 1000);
              m[i].remainM = Math.floor(result / (60 * 1000));
            }
            that.setData({
              trueuserteams: m,
            })
            wx.hideLoading();
          }
        })
      }
    })
  },
  goTospcTeam: function (e) {
    var id = e.currentTarget.dataset.toId
    console.log(id)
    wx.navigateTo({
      url: '../about/about?id=' + id,
    })
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  getInfo: function (e) {
    console.log(this.data.userInfo);
  },
  //navigate to page with creating an activity
  gotoActivityPage: function (e) {
    console.log(e)
    wx.navigateTo({
      url: '../logs/logs',
    })
  },
  getHistory: function (e) {
    console.log("redirect to History Page...")
    wx.navigateTo(
      {
        url: '../history/history'
      }
    )
  },
})
